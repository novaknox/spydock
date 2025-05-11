// Server-side implementation for skip button functionality

// Add this code to your server.js file

// Add a skippedPlayers array to each game object
function addSkipFunctionalityToGame(game) {
    if (!game.skippedPlayers) {
        game.skippedPlayers = [];
    }
    return game;
}

// Initialize skip functionality for all existing games
for (const gameId in games) {
    games[gameId] = addSkipFunctionalityToGame(games[gameId]);
}

// Add this inside your socket connection handler

/*
socket.on('player-skip', ({ gameId }) => {
    if (!gameId) return;
    const game = games[gameId];
    if (!game) return;
    
    // Get current player
    const currentPlayer = game.players.find(p => p.id === socket.id);
    if (!currentPlayer) return;
    
    // Add player to skipped players if not already there
    if (!game.skippedPlayers.includes(socket.id)) {
        game.skippedPlayers.push(socket.id);
        
        // Emit skip update to all players
        io.to(gameId).emit('skip-update', {
            skippedPlayers: game.skippedPlayers,
            totalPlayers: game.players.length,
            lastSkippedPlayer: socket.id,
            lastSkippedPlayerName: currentPlayer.name
        });
        
        // Check if all players have skipped
        if (game.skippedPlayers.length === game.players.length) {
            // Emit all players skipped event
            io.to(gameId).emit('all-players-skipped');
            
            // End the timer
            if (game.timer) {
                clearInterval(game.timerInterval);
                game.timer = null;
            }
            
            // Reset skipped players for next round
            game.skippedPlayers = [];
            
            // Trigger timer ended event to move to voting screen
            io.to(gameId).emit('timer-ended');
        }
    }
});

// Reset skipped players when starting a new round
socket.on('start-game', () => {
    // ... existing code ...
    
    // Reset skipped players
    game.skippedPlayers = [];
    
    // ... rest of existing code ...
});

// Reset skipped players when all players are ready
socket.on('player-ready', ({ playerId, name }) => {
    // ... existing code ...
    
    if (game.readyPlayers.length === game.players.length) {
        // ... existing code ...
        
        // Reset skipped players for the new round
        game.skippedPlayers = [];
        
        // ... rest of existing code ...
    }
});
*/