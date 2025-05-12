// Minimal fix to ensure chat container visibility in dark mode
document.addEventListener('DOMContentLoaded', function() {
    // Function to ensure chat container is visible in dark mode
    function ensureChatVisibility() {
        // Only run if we're in dark mode
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            // Get the chat container
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                // Force a redraw without changing the layout
                const display = chatContainer.style.display;
                chatContainer.style.display = 'none';
                // This triggers a reflow
                void chatContainer.offsetHeight;
                // Restore the original display value
                chatContainer.style.display = display || 'flex';
            }
        }
    }
    
    // Call the function when the theme changes
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            // Small delay to ensure the theme has been applied
            setTimeout(ensureChatVisibility, 50);
        });
    }
    
    // Call the function when the game screen becomes active
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class' && 
                    gameScreen.classList.contains('active')) {
                    setTimeout(ensureChatVisibility, 50);
                }
            });
        });
        observer.observe(gameScreen, { attributes: true });
    }
});