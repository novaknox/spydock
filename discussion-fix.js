// Minimal fix for discussion page visibility in dark mode
document.addEventListener('DOMContentLoaded', function() {
    // Function to ensure chat elements are visible in dark mode
    function ensureChatVisibility() {
        // Force a redraw of the chat container when in dark mode
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen && gameScreen.classList.contains('active')) {
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                // This forces a redraw without changing the design
                chatContainer.style.display = 'flex';
                chatContainer.style.flexDirection = 'column';
            }
        }
    }
    
    // Call the function when the theme changes
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', ensureChatVisibility);
    }
    
    // Call the function when the game screen becomes active
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    gameScreen.classList.contains('active')) {
                    setTimeout(ensureChatVisibility, 100); // Small delay to ensure CSS is applied
                }
            });
        });
        observer.observe(gameScreen, { attributes: true });
    }
    
    // Also call the function on initial load and when messages are added
    document.addEventListener('visibilitychange', ensureChatVisibility);
    window.addEventListener('resize', ensureChatVisibility);
    
    // Observe chat messages for changes
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        const observer = new MutationObserver(ensureChatVisibility);
        observer.observe(chatMessages, { childList: true });
    }
});