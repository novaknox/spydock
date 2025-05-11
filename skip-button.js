// Skip Button Functionality for Discussion Panel

// Track which players have clicked skip
let playersSkipped = new Set();
let totalPlayers = 0;

// Initialize skip button functionality
function initSkipButton() {
    // Check if skip button already exists to prevent duplicates
    if (document.getElementById('skip-button')) {
        return;
    }
    
    // Create skip button container
    const skipButtonContainer = document.createElement('div');
    skipButtonContainer.className = 'skip-button-container';
    
    // Create skip button
    const skipButton = document.createElement('button');
    skipButton.id = 'skip-button';
    skipButton.className = 'btn-small';
    skipButton.innerHTML = '<i class="fas fa-forward"></i> Skip Discussion';
    
    // Create skip counter
    const skipCounter = document.createElement('div');
    skipCounter.id = 'skip-counter';
    skipCounter.className = 'skip-counter';
    skipCounter.innerHTML = '<span id="skipped-count">0</span>/<span id="total-players">0</span> skipped';
    
    // Add elements to container
    skipButtonContainer.appendChild(skipButton);
    skipButtonContainer.appendChild(skipCounter);
    
    // Add container to game header
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        gameHeader.appendChild(skipButtonContainer);
        console.log('Skip button added to game header');
    } else {
        console.error('Game header not found');
        // Try to add it to the game screen as a fallback
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.prepend(skipButtonContainer);
            console.log('Skip button added to game screen as fallback');
        }
    }
    
    // Add event listener to skip button
    skipButton.addEventListener('click', handleSkipClick);
    
    // Reset skip state when game starts
    resetSkipState();
    
    // Update the UI
    updateSkipCounter();
}

// Handle skip button click
function handleSkipClick() {
    const skipButton = document.getElementById('skip-button');
    
    // Disable button to prevent multiple clicks
    skipButton.disabled = true;
    skipButton.classList.add('skip-clicked');
    skipButton.innerHTML = '<i class="fas fa-check"></i> Skipped';
    
    // Emit skip event to server
    socket.emit('player-skip', { gameId: currentGameId });
}

// Handle skip update from server
function handleSkipUpdate(data) {
    // Update skipped players set
    playersSkipped = new Set(data.skippedPlayers);
    totalPlayers = data.totalPlayers;
    
    // Update the UI
    updateSkipCounter();
    
    // Show notification if someone else skipped
    if (data.lastSkippedPlayer && data.lastSkippedPlayer !== socket.id) {
        showSkipNotification(data.lastSkippedPlayerName);
    }
    
    // If all players skipped, the server will end the timer automatically
}

// Update skip counter display
function updateSkipCounter() {
    const skippedCount = document.getElementById('skipped-count');
    const totalPlayersElement = document.getElementById('total-players');
    
    if (skippedCount && totalPlayersElement) {
        skippedCount.textContent = playersSkipped.size;
        totalPlayersElement.textContent = totalPlayers;
    }
}

// Show notification when a player skips
function showSkipNotification(playerName) {
    const notification = document.createElement('div');
    notification.className = 'skip-notification';
    notification.innerHTML = `<i class="fas fa-forward"></i> ${playerName} voted to skip discussion`;
    
    document.body.appendChild(notification);
    
    // Fade out and remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Reset skip state
function resetSkipState() {
    playersSkipped.clear();
    
    // Reset button state
    const skipButton = document.getElementById('skip-button');
    if (skipButton) {
        skipButton.disabled = false;
        skipButton.classList.remove('skip-clicked');
        skipButton.innerHTML = '<i class="fas fa-forward"></i> Skip Discussion';
    }
    
    // Update the counter
    updateSkipCounter();
}

// Add socket event listeners
function addSkipSocketListeners() {
    socket.on('skip-update', handleSkipUpdate);
    socket.on('all-players-skipped', () => {
        // Show notification that discussion is being skipped
        const notification = document.createElement('div');
        notification.className = 'skip-notification all-skipped';
        notification.innerHTML = '<i class="fas fa-forward"></i> All players voted to skip! Moving to voting...';
        
        document.body.appendChild(notification);
        
        // The server will handle ending the timer and moving to voting screen
    });
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add socket listeners
    addSkipSocketListeners();
    
    // Initialize skip button when game screen is shown
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        // Check if game screen is already visible
        if (gameScreen.classList.contains('active') || 
            window.getComputedStyle(gameScreen).display === 'flex' || 
            window.getComputedStyle(gameScreen).display !== 'none') {
            initSkipButton();
        }
        
        // Set up observer for future changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active') || 
                    mutation.target.style.display === 'flex' || 
                    window.getComputedStyle(mutation.target).display !== 'none') {
                    initSkipButton();
                }
            });
        });
        
        observer.observe(gameScreen, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    
    // Also listen for the game-started event which shows the game screen
    socket.on('game-started', () => {
        setTimeout(() => {
            initSkipButton();
        }, 500); // Small delay to ensure DOM is updated
    });
});