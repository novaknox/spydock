// This script ensures the chat container is properly styled in both light and dark modes
document.addEventListener('DOMContentLoaded', function() {
    // Function to ensure chat container is visible
    function ensureChatContainerVisibility() {
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen && gameScreen.classList.contains('active')) {
            const chatContainer = document.querySelector('.chat-container');
            const chatMessages = document.getElementById('chat-messages');
            const messageInput = document.getElementById('message-input');
            
            if (chatContainer && chatMessages && messageInput) {
                // Make sure the chat container is visible
                chatContainer.style.display = 'flex';
                
                // Make sure the chat messages container is visible
                chatMessages.style.display = 'flex';
                
                // Make sure the message input is visible
                messageInput.style.display = 'block';
            }
        }
    }
    
    // Call the function when the game screen becomes active
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    gameScreen.classList.contains('active')) {
                    ensureChatContainerVisibility();
                }
            });
        });
        observer.observe(gameScreen, { attributes: true });
    }
    
    // Also call the function when the theme changes
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', ensureChatContainerVisibility);
    }
    
    // Call the function when a new message is added
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        const observer = new MutationObserver(ensureChatContainerVisibility);
        observer.observe(chatMessages, { childList: true });
    }
});