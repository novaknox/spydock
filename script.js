// Add notification function
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'info-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Update socket event handlers
socket.on('player-left', (data) => {
    // Show notification
    showNotification(data.message, 'info');
    
    // Update players list
    updatePlayersList(data.players);
    
    // Update active player count if game is active
    if (gameActive) {
        // Ensure we're using the server-provided active player count
        updateVotingStatusBar(data.activePlayerCount);
        
        // Update the voting status display
        const votingStatus = document.getElementById('voting-status');
        if (votingStatus) {
            votingStatus.textContent = `${votedPlayers.size}/${data.activePlayerCount} votes`;
        }
        
        // Update the player cards to show disconnected players
        updateDisconnectedPlayers(data.disconnectedPlayers);
    }
});

// Function to update UI to show disconnected players
function updateDisconnectedPlayers(disconnectedPlayers) {
    if (!disconnectedPlayers || !disconnectedPlayers.length) return;
    
    // Update player cards in the game screen
    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach(card => {
        const playerName = card.querySelector('span').textContent;
        const isDisconnected = disconnectedPlayers.some(p => p.name === playerName);
        
        if (isDisconnected) {
            // Add disconnected class to player card
            card.classList.add('disconnected-player');
            
            // Add disconnected icon if it doesn't exist
            if (!card.querySelector('.disconnected-icon')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user-slash disconnected-icon';
                card.querySelector('.player-info').appendChild(icon);
            }
        }
    });
    
    // Update voting options if in voting screen
    const voteOptions = document.querySelectorAll('.vote-option');
    voteOptions.forEach(option => {
        const playerName = option.querySelector('.player-name').textContent;
        const isDisconnected = disconnectedPlayers.some(p => p.name === playerName);
        
        if (isDisconnected) {
            option.classList.add('disconnected-player');
            option.setAttribute('title', `${playerName} has left the game`);
        }
    });
}

socket.on('new-host', (data) => {
    showNotification(`${data.newHostName} is now the host`, 'info');
});

// Update the updatePlayersList function
function updatePlayersList(players) {
    const playersList = document.getElementById('players-worlds-list');
    playersList.innerHTML = '';
    
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-card';
        playerElement.innerHTML = `
            <div class="player-info">
                <i class="fas fa-user"></i>
                <span>${player.name}</span>
                ${player.isHost ? '<span class="host-badge">Host</span>' : ''}
            </div>
        `;
        playersList.appendChild(playerElement);
    });
}

// Update the updateVotingStatus function
function updateVotingStatus() {
    socket.emit('check-voting-rights');
}

socket.on('voting-rights-status', (data) => {
    const voteButton = document.getElementById('vote-btn');
    if (voteButton) {
        voteButton.disabled = !data.canVote;
        if (!data.canVote) {
            showNotification(data.message, 'warning');
        }
    }
    
    // Update voting status display
    const votingStatus = document.getElementById('voting-status');
    if (votingStatus) {
        votingStatus.textContent = `${data.voteCount}/${data.activePlayerCount} votes`;
    }
    
    // Update the voted players list
    votedPlayers = new Set(data.votedPlayers);
    
    // Update the voting status bar
    updateVotingStatusBar(data.activePlayerCount, data.votedPlayers);
    
    // Update disconnected players UI if available
    if (data.disconnectedPlayers && data.disconnectedPlayers.length > 0) {
        updateDisconnectedPlayers(data.disconnectedPlayers);
    }
    
    // If all players have voted, show a message
    if (data.voteCount === data.activePlayerCount) {
        showNotification('All players have voted. Results will be revealed shortly...', 'info');
    }
});