// Built by Knox
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getRandomWordPair } = require('./words.js');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configure CORS for production
const io = new Server(server, {
  cors: {
    origin: ['https://spydock.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, '.')));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Built by Knox
// In-memory game state
const games = {};

// Built by Knox
// Game ID generation
function generateGameId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Built by Knox
// Socket connection handling
io.on('connection', (socket) => {
  let currentGameId = null;
  let currentPlayer = null;

  // Built by Knox
  // Game creation and joining
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
      readyPlayers: [],
      currentRound: null
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
    // Check if game has already started
    if (game.currentRound) {
      socket.emit('game-join-error', { message: 'This game has already started. Please join another game or create your own.' });
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

  // Built by Knox
  // Game settings and start
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
    
    // Initialize the round counter
    game.currentRound = 1;
    
    // Assign roles and words
    const playerRoles = game.players.map(player => {
      if (player.id === game.spy) {
        return {
          playerId: player.id,
          playerName: player.name,
          role: 'spy',
          word: wordPair.spy
        };
      } else {
        return {
          playerId: player.id,
          playerName: player.name,
          role: 'regular',
          word: wordPair.regular
        };
      }
    });
    
    // Set up discussion time but don't start the timer yet
    const discussionTime = game.settings.discussionTime * 60; // Convert to seconds
    game.timerData = {
      duration: discussionTime,
      remainingTime: discussionTime
    };
    
    io.to(currentGameId).emit('game-started', {
      roles: playerRoles,
      discussionTime: game.settings.discussionTime,
      roundNumber: game.currentRound
    });
  });

  // Built by Knox
  // Timer and player ready handling
  socket.on('update-timer', ({ action, value }) => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game || !game.timer) return;
    
    // Only allow host to control timer
    if (!currentPlayer.isHost) return;
    
    switch (action) {
      case 'pause':
        if (game.timer.isPaused) return;
        game.timer.isPaused = true;
        game.timer.pauseTime = Date.now();
        break;
      case 'resume':
        if (!game.timer.isPaused) return;
        game.timer.isPaused = false;
        game.timer.startTime += (Date.now() - game.timer.pauseTime);
        break;
      case 'adjust':
        if (typeof value !== 'number') return;
        game.timer.remainingTime = Math.max(0, value);
        game.timer.duration = game.timer.remainingTime;
        game.timer.startTime = Date.now();
        game.timer.isPaused = false;
        break;
    }
    
    io.to(currentGameId).emit('timer-update', { 
      remainingTime: game.timer.remainingTime,
      isHost: currentPlayer.isHost
    });
  });

  socket.on('player-ready', ({ playerId, name }) => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    if (!game.readyPlayers.includes(playerId)) {
      game.readyPlayers.push(playerId);
      io.to(currentGameId).emit('player-ready-notify', { 
        playerId, 
        name,
        readyPlayers: game.readyPlayers,
        totalPlayers: game.players.length
      });
    }
    if (game.readyPlayers.length === game.players.length) {
      io.to(currentGameId).emit('all-players-ready', {});
      
      // Start the timer when all players are ready
      if (game.timerData) {
        game.timer = {
          startTime: Date.now(),
          duration: game.timerData.duration,
          remainingTime: game.timerData.duration,
          isPaused: false
        };
        
        // Send timer updates every second
        const timerInterval = setInterval(() => {
          if (!game.timer) {
            clearInterval(timerInterval);
            return;
          }
          
          if (game.timer.isPaused) {
            return;
          }
          
          const elapsed = Math.floor((Date.now() - game.timer.startTime) / 1000);
          game.timer.remainingTime = Math.max(0, game.timer.duration - elapsed);
          
          io.to(currentGameId).emit('timer-update', { 
            remainingTime: game.timer.remainingTime,
            isHost: currentPlayer.isHost
          });
          
          if (game.timer.remainingTime <= 0) {
            clearInterval(timerInterval);
            delete game.timer;
            io.to(currentGameId).emit('timer-ended');
          }
        }, 1000);
      }
      
      game.readyPlayers = [];
    }
  });

  socket.on('player-not-ready', ({ playerId, name }) => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    // Remove from readyPlayers if present
    game.readyPlayers = game.readyPlayers.filter(id => id !== playerId);
    // Notify all users who is not ready with updated ready players list
    io.to(currentGameId).emit('player-not-ready-notify', { 
      playerId,
      name,
      readyPlayers: game.readyPlayers,
      totalPlayers: game.players.length
    });
  });

  socket.on('send-message', (data) => {
    if (!currentGameId) return;
    io.to(currentGameId).emit('new-message', data);
  });

  socket.on('submit-vote', ({ playerId, votedFor }) => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    
    const voter = game.players.find(p => p.id === playerId);
    const votedPlayer = game.players.find(p => p.id === votedFor);
    
    if (!voter || !votedPlayer) return;
    
    game.votes[playerId] = votedFor;
    
    // Calculate active players (excluding kicked players)
    const activePlayers = game.kickedPlayers ? 
      game.players.filter(p => !game.kickedPlayers.includes(p.id)) : 
      game.players;
    
    // Get list of players who have voted
    const votedPlayersList = Object.keys(game.votes).map(id => {
        const player = game.players.find(p => p.id === id);
        return player ? player.name : '';
    }).filter(name => name !== '');
    
    // Force a voting status update for all players
    io.to(currentGameId).emit('update-voting-status', {
        votedPlayers: Object.keys(game.votes),
        votedPlayerNames: votedPlayersList,
        totalPlayers: activePlayers.length, // Use active player count
        voteCount: Object.keys(game.votes).length,
        kickedPlayers: game.kickedPlayers || [] // Send the list of kicked players
    });
    
    // Send separate notification about who voted
    io.to(currentGameId).emit('vote-submitted', {
        voterName: voter.name,
        voterId: voter.id,
        votedForName: votedPlayer.name,
        message: `${voter.name} has voted for ${votedPlayer.name}`
    });
    
    // Check if all active players have voted
    // Count how many active players have voted (exclude kicked players' votes)
    const activeVotes = Object.keys(game.votes).filter(voterId => 
        !game.kickedPlayers || !game.kickedPlayers.includes(voterId)
    ).length;
    
    // If all active players have voted, proceed with results
    if (activeVotes === activePlayers.length) {
        const voteCounts = {};
        Object.entries(game.votes).forEach(([voterId, votedForId]) => {
            // Only count votes from active players
            if (!game.kickedPlayers || !game.kickedPlayers.includes(voterId)) {
                if (!voteCounts[votedForId]) voteCounts[votedForId] = 0;
                voteCounts[votedForId]++;
            }
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
        
        // Initialize the round counter if it doesn't exist
        if (!game.currentRound) {
            game.currentRound = 1;
        }
        
        // If the kicked player is the spy, end the game with regular players winning
        if (isSpy) {
            io.to(currentGameId).emit('voting-results', {
                votedPlayer,
                spy: game.spy,
                spyName,
                word: game.wordPair.regular,
                spyWord: game.wordPair.spy,
                isSpy,
                kickedPlayerName: kickedPlayer?.name || '',
                gameOver: true,
                winner: 'regular',
                message: 'Regular players win! You caught the spy!'
            });
        } else {
            // If the kicked player is not the spy
            // Instead of removing the player, mark them as kicked but keep them in the game
            // So they can still observe but not vote
            if (!game.kickedPlayers) {
                game.kickedPlayers = [];
            }
            game.kickedPlayers.push(votedPlayer);
            
            // Store the kicked player name for display to all players in round 2
            game.kickedPlayerName = kickedPlayer?.name || '';
            
            // Notify the kicked player that they've lost voting rights but can still observe
            io.to(votedPlayer).emit('player-kicked', {
                message: 'You have been voted out! Your voting rights have been disabled, but you can still observe the game.'
            });
            
            // Check if there are enough active players left to continue (excluding kicked players)
            const remainingActivePlayers = game.players.filter(p => !game.kickedPlayers.includes(p.id));
            
            if (remainingActivePlayers.length < 3) {
                // Not enough active players left, spies win
                io.to(currentGameId).emit('voting-results', {
                    votedPlayer,
                    spy: game.spy,
                    spyName,
                    word: game.wordPair.regular,
                    spyWord: game.wordPair.spy,
                    isSpy,
                    kickedPlayerName: kickedPlayer?.name || '',
                    gameOver: true,
                    winner: 'spy',
                    message: 'Not enough players left. The spy wins!'
                });
            } else if (game.currentRound === 2) {
                // This was the second round and they still didn't catch the spy - spy wins
                io.to(currentGameId).emit('voting-results', {
                    votedPlayer,
                    spy: game.spy,
                    spyName,
                    word: game.wordPair.regular,
                    spyWord: game.wordPair.spy,
                    isSpy,
                    kickedPlayerName: kickedPlayer?.name || '',
                    gameOver: true,
                    winner: 'spy',
                    message: 'You failed to catch the spy in two rounds. The spy wins!'
                });
            } else {
                // First round, continue to second round
                game.currentRound = 2;
                
                // Continue the game with a second round after a 10 second interval
                io.to(currentGameId).emit('voting-results', {
                    votedPlayer,
                    spy: game.spy,
                    spyName: null, // Don't reveal spy yet
                    word: game.wordPair.regular,
                    spyWord: null, // Don't reveal spy's word yet
                    isSpy,
                    kickedPlayerName: kickedPlayer?.name || '',
                    kickedPlayers: game.kickedPlayers, // Send the list of kicked players
                    gameOver: false,
                    continueGame: true,
                    settings: game.settings,
                    message: `${kickedPlayer?.name} was not the spy! Second round will begin in 10 seconds...`,
                    roundNumber: 2,
                    intervalTime: 10 // 10 second interval before starting round 2
                });
                
                // Reset votes for the next round
                game.votes = {};
                game.readyPlayers = []; // Reset ready players
                
                // Set up discussion timer data but don't start it yet
                const discussionTime = game.settings.discussionTime * 60;
                game.timerData = {
                    duration: discussionTime,
                    remainingTime: discussionTime
                };
            }
        }
    }
  });

  // Add a new handler to provide game state for the second round
  socket.on('get-game-state', () => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    
    // Calculate the active players (excluding kicked players)
    const activePlayerCount = game.kickedPlayers ? 
      game.players.filter(p => !game.kickedPlayers.includes(p.id)).length : 
      game.players.length;
    
    socket.emit('game-state-update', {
        currentRound: game.currentRound || 1,
        kickedPlayerName: game.kickedPlayerName || null,
        kickedPlayers: game.kickedPlayers || [],
        activePlayerCount
    });
  });

  // Add a new handler for players trying to vote when they've been kicked
  socket.on('check-voting-rights', () => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    
    // Calculate the active players (excluding kicked players)
    const activePlayerCount = game.kickedPlayers ? 
      game.players.filter(p => !game.kickedPlayers.includes(p.id)).length : 
      game.players.length;
    
    const isKicked = game.kickedPlayers && game.kickedPlayers.includes(socket.id);
    socket.emit('voting-rights-status', { 
        canVote: !isKicked,
        message: isKicked ? 'You were voted out in the first round and cannot vote.' : '',
        kickedPlayerName: game.kickedPlayerName || null,
        activePlayerCount,
        kickedPlayers: game.kickedPlayers || []
    });
  });

  socket.on('play-again', () => {
    if (!currentGameId) return;
    const game = games[currentGameId];
    if (!game) return;
    
    // Keep a reference to the player's data (only name and id)
    const playerName = currentPlayer.name;
    const playerId = socket.id;
    
    // Clear all game state
    game.wordPair = null;
    game.spy = null;
    game.votes = {};
    game.readyPlayers = [];
    game.currentRound = null;
    game.kickedPlayers = [];
    game.kickedPlayerName = null;
    game.timer = null;
    game.timerInterval = null;
    game.discussionTime = null;
    game.settings = {
      spyCount: 1,
      discussionTime: 'none'
    };
    
    // Reset all players in the game
    game.players.forEach(player => {
      player.ready = false;
      player.role = null;
      player.word = null;
    });
    
    // Emit game-reset event to all clients with minimal player data
    io.to(currentGameId).emit('game-reset', { 
      resetSuccess: true,
      message: 'Game has been reset. Your name has been preserved.',
      players: game.players.map(p => ({ id: p.id, name: p.name }))
    });
    
    // Have the player leave the game room but keep connection alive
    socket.leave(currentGameId);
    
    // If this was the last player, clean up the game
    game.players = game.players.filter(p => p.id !== socket.id);
    if (game.players.length === 0) {
      delete games[currentGameId];
    }
    
    // Reset current game ID but keep the player identity
    currentGameId = null;
    
    // Update the current player to only have name and id preserved
    Object.keys(currentPlayer).forEach(key => {
      if (key !== 'name' && key !== 'id') {
        delete currentPlayer[key];
      }
    });
    
    // Re-emit the player's updated status
    io.emit('online-players-update', { count: getOnlinePlayerCount() });
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

// Function to get total number of online players across all games
function getOnlinePlayerCount() {
  let totalPlayers = 0;
  for (const gameId in games) {
    totalPlayers += games[gameId].players.length;
  }
  return totalPlayers;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 