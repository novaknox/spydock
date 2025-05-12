// Theme handler for SpyDock
// This file handles dynamic styling for elements that are created via JavaScript

// Function to get CSS variable value
function getCssVar(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// Function to update ready players bar styling based on current theme
function updateReadyPlayersBarStyling() {
    const readyPlayersBar = document.getElementById('ready-players-bar');
    if (!readyPlayersBar) return;
    
    // Update bar background and text color
    readyPlayersBar.style.background = getCssVar('--ready-bar-bg');
    readyPlayersBar.style.color = getCssVar('--ready-bar-text');
    
    // Update any header elements
    const readyHeader = readyPlayersBar.querySelector('div');
    if (readyHeader) {
        readyHeader.style.color = getCssVar('--ready-bar-text');
    }
    
    // Update progress container and bar
    const progressContainer = readyPlayersBar.querySelector('div:nth-child(2)');
    if (progressContainer) {
        progressContainer.style.background = getCssVar('--ready-progress-bg');
        
        const progressBar = progressContainer.querySelector('div');
        if (progressBar) {
            progressBar.style.background = getCssVar('--ready-progress-fill');
        }
    }
    
    // Update player avatars
    const playerAvatars = readyPlayersBar.querySelectorAll('div:nth-child(3) > div');
    playerAvatars.forEach(avatar => {
        if (avatar.querySelector('.fa-user-check')) {
            // Ready player
            avatar.style.background = getCssVar('--ready-player-bg');
            avatar.style.color = getCssVar('--ready-player-text');
        } else {
            // Waiting player
            avatar.style.background = getCssVar('--waiting-player-bg');
            avatar.style.color = getCssVar('--waiting-player-text');
        }
    });
}

// Function to update voting screen styling based on current theme
function updateVotingScreenStyling() {
    // We'll remove the direct styling of elements and rely on CSS classes with data-theme selectors
    // This ensures we don't interfere with the click handlers and selection state
    
    // We only need to ensure the voting screen is properly styled when it's first loaded
    // The CSS in dark-mode.css will handle the rest
}

// Function to apply theme to dynamically created elements
function applyThemeToElements() {
    updateReadyPlayersBarStyling();
    updateGameTimerStyling();
    updateSpyCountStyling();
    
    // Add more element updates here as needed
}

// Function to update game timer styling based on current theme
function updateGameTimerStyling() {
    const gameTimer = document.getElementById('game-timer');
    if (!gameTimer) return;
    
    // Update timer background and text color
    gameTimer.style.backgroundColor = getCssVar('--timer-bg');
    gameTimer.style.color = getCssVar('--text-primary');
}

// Function to update spy count container styling based on current theme
function updateSpyCountStyling() {
    // Update spy count select styling
    const spyCountContainer = document.getElementById('spy-count');
    if (spyCountContainer) {
        spyCountContainer.style.backgroundColor = getCssVar('--input-bg');
        spyCountContainer.style.color = getCssVar('--text-primary');
        spyCountContainer.style.borderColor = getCssVar('--input-border');
    }
    
    // Update discussion time select styling
    const discussionTimeContainer = document.getElementById('discussion-time');
    if (discussionTimeContainer) {
        discussionTimeContainer.style.backgroundColor = getCssVar('--input-bg');
        discussionTimeContainer.style.color = getCssVar('--text-primary');
        discussionTimeContainer.style.borderColor = getCssVar('--input-border');
    }
}



// Listen for theme changes
function setupThemeChangeListener() {
    // Watch for attribute changes on the document element
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                applyThemeToElements();
            }
        });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    // Also apply theme on initial load
    applyThemeToElements();
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    setupThemeChangeListener();
    
    // Also update when ready players bar is updated
    document.addEventListener('readyPlayersBarUpdated', updateReadyPlayersBarStyling);
    
    // Add event listeners for game screen and lobby screen
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    gameScreen.classList.contains('active')) {
                    updateGameTimerStyling();
                }
            });
        });
        observer.observe(gameScreen, { attributes: true });
    }
    
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    lobbyScreen.classList.contains('active')) {
                    updateSpyCountStyling();
                }
            });
        });
        observer.observe(lobbyScreen, { attributes: true });
    }
    
    // We don't need an observer for the voting screen anymore
// The CSS with data-theme selectors will handle the styling
});

// Export functions for use in other files
window.themeHandler = {
    getCssVar,
    updateReadyPlayersBarStyling,
    updateGameTimerStyling,
    updateSpyCountStyling,
    applyThemeToElements
};