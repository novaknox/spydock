const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getRandomWordPair } = require('./words.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.static('.'));

// In-memory game state
const games = {};

function generateGameId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

io.on('connection', (socket) => {
  let currentGameId = null;
  let currentPlayer = null;

  socket.on('create-game', ({ playerName }) => {
    const gameId = generateGameId();
    const player = {
      id: socket.id,
      name: playerName,
      isHost: true
    };
    games[gameId] = {
      id: gameId,
      players: [player],
      settings: {
        spyCount: 1,
        discussionTime: 5
      },
      wordPair: null,
      spy: null,
      votes: {},
      readyPlayers: []
    };
    currentGameId = gameId;
    currentPlayer = player;
    socket.join(gameId);
    socket.emit('game-created', {
      gameId,
      players: games[gameId].players
    });
  });

  socket.on('join-game', ({ playerName, gameId }) => {
    const normalizedGameId = gameId.trim().toUpperCase();
    const game = games[normalizedGameId];
    if (!game) {
      socket.emit('game-join-error', { message: 'Game not found. Please check the game code and try again.' });
      return;
    }
    if (game.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      socket.emit('game-join-error', { message: 'Name already taken in this game' });
      return;
    }
    const player = {
      id: socket.id,
      name: playerName,
      isHost: false
    };
    game.players.push(player);
    currentGameId = normalizedGameId;
    currentPlayer = player;
    socket.join(normalizedGameId);
    io.to(normalizedGameId).emit('player-joined', { players: game.players });
    socket.emit('game-joined', {
      gameId: normalizedGameId,
      players: game.players,
      settings: game.settings
    });
  });

  socket.on('update-settings', (settings) => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    game.settings = { ...game.settings, ...settings };
    io.to(currentGameId).emit('settings-updated', { settings: game.settings });
  });

  socket.on('start-game', () => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    
    // Get a random word pair
    const wordPair = getRandomWordPair();
    game.wordPair = wordPair;
    
    // Select spy
    const playersCopy = [...game.players];
    const spyIndex = Math.floor(Math.random() * playersCopy.length);
    game.spy = playersCopy[spyIndex].id;
    
    // Assign roles and words
    const playerRoles = game.players.map(player => {
      if (player.id === game.spy) {
        return {
          playerId: player.id,
          role: 'spy',
          word: wordPair.spy
        };
      } else {
        return {
          playerId: player.id,
          role: 'regular',
          word: wordPair.regular
        };
      }
    });
    
    io.to(currentGameId).emit('game-started', {
      roles: playerRoles,
      discussionTime: game.settings.discussionTime
    });
  });

  socket.on('player-ready', ({ playerId, name }) => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    if (!game.readyPlayers.includes(playerId)) {
      game.readyPlayers.push(playerId);
      io.to(currentGameId).emit('player-ready-notify', { name });
    }
    if (game.readyPlayers.length === game.players.length) {
      io.to(currentGameId).emit('all-players-ready', {});
      game.readyPlayers = [];
    }
  });

  socket.on('player-not-ready', ({ playerId, name }) => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    // Remove from readyPlayers if present
    game.readyPlayers = game.readyPlayers.filter(id => id !== playerId);
    // Notify all users who is not ready
    io.to(currentGameId).emit('player-not-ready-notify', { name });
  });

  socket.on('send-message', (data) => {
    if (!currentGameId) return;
    io.to(currentGameId).emit('new-message', data);
  });

  socket.on('submit-vote', ({ playerId, votedFor }) => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    game.votes[playerId] = votedFor;
    if (Object.keys(game.votes).length === game.players.length) {
      const voteCounts = {};
      Object.values(game.votes).forEach(vote => {
        if (!voteCounts[vote]) voteCounts[vote] = 0;
        voteCounts[vote]++;
      });
      let maxVotes = 0;
      let votedPlayer = null;
      Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          votedPlayer = playerId;
        }
      });
      const kickedPlayer = game.players.find(p => p.id === votedPlayer);
      const isSpy = votedPlayer === game.spy;
      const spyName = game.players.find(p => p.id === game.spy)?.name || '';
      
      // Remove the kicked player from the game
      game.players = game.players.filter(p => p.id !== votedPlayer);
      
      // If the kicked player is the spy, end the game
      if (isSpy) {
        io.to(currentGameId).emit('voting-results', {
          votedPlayer,
          spy: game.spy,
          spyName,
          word: game.wordPair.regular,
          spyWord: game.wordPair.spy,
          isSpy,
          kickedPlayerName: kickedPlayer?.name || ''
        });
      }
    }
  });

  socket.on('play-again', () => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    game.wordPair = null;
    game.spy = null;
    game.votes = {};
    game.readyPlayers = [];
    io.to(currentGameId).emit('game-reset', {});
  });

  socket.on('disconnect', () => {
    if (currentGameId && currentPlayer) {
      const game = games[currentGameId];
      if (game) {
        game.players = game.players.filter(p => p.id !== currentPlayer.id);
        io.to(currentGameId).emit('player-joined', { players: game.players });
        io.to(currentGameId).emit('player-left', { name: currentPlayer.name });
        if (game.players.length === 0) {
          delete games[currentGameId];
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 