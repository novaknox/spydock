// Built by Knox
// Game state variables
const isDevelopment = window.location.hostname === 'localhost';
const socketUrl = isDevelopment ? 'http://localhost:3000' : 'https://spydock.onrender.com';
let socket = io(socketUrl, {
  transports: ['websocket'],
  upgrade: false
});
let playerName = '';
let gameId = '';
let currentGameId = '';
let players = [];
let isHost = false;
let playerRole = '';
let gameWord = '';
let selectedVote = null;
let readyNotificationTimeout = null;
let notificationPermission = false;
let remainingTime = 0;
let votedPlayers = new Set();
let isKicked = false;
let games = {};

// Built by Knox
// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const roleScreen = document.getElementById('role-screen');
const gameScreen = document.getElementById('game-screen');
const votingScreen = document.getElementById('voting-screen');
const resultsScreen = document.getElementById('results-screen');

const playerNameInput = document.getElementById('player-name');
const gameCodeInput = document.getElementById('game-code');
const createGameBtn = document.getElementById('create-game-btn');
const joinGameBtn = document.getElementById('join-game-btn');
const gameCodeDisplay = document.getElementById('game-code-display');
const copyCodeBtn = document.getElementById('copy-code-btn');
const playersList = document.getElementById('players');
const spyCountSelect = document.getElementById('spy-count');
const discussionTimeSelect = document.getElementById('discussion-time');
const startGameBtn = document.getElementById('start-game-btn');
const roleTypeDisplay = document.getElementById('role-type');
const wordDisplay = document.getElementById('word-display');
const readyBtn = document.getElementById('ready-btn');
const gameTimer = document.getElementById('game-timer');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const votingOptions = document.getElementById('voting-options');
const submitVoteBtn = document.getElementById('submit-vote-btn');
const resultsContent = document.getElementById('results-content');
const finalWordDisplay = document.getElementById('final-word');
const spyNameDisplay = document.getElementById('spy-name');
const playAgainBtn = document.getElementById('play-again-btn');
const onlinePlayersBar = document.getElementById('online-players-bar');
const onlinePlayersCount = document.getElementById('online-players-count');
const onlinePlayersList = document.getElementById('online-players-list');

// Built by Knox
// Add a ready players bar to the role screen
const readyPlayersBar = document.createElement('div');
readyPlayersBar.id = 'ready-players-bar';
readyPlayersBar.style.display = 'flex';
readyPlayersBar.style.justifyContent = 'center';
readyPlayersBar.style.alignItems = 'center';
readyPlayersBar.style.gap = '8px';
readyPlayersBar.style.marginBottom = '16px';
readyPlayersBar.style.fontWeight = 'bold';
readyPlayersBar.style.fontSize = '1em';
readyPlayersBar.style.color = '#059669';

// Move readyPlayersBar below the role title for visibility
const roleTitle = roleScreen.querySelector('h2');
roleScreen.insertBefore(readyPlayersBar, roleTitle.nextSibling);
readyPlayersBar.style.background = '#f0fdf4';
readyPlayersBar.style.padding = '8px 0 8px 0';
readyPlayersBar.style.borderRadius = '8px';
readyPlayersBar.style.margin = '16px 0 16px 0';

let readyPlayerIds = [];

function updateReadyPlayersBar() {
    readyPlayersBar.innerHTML = '';
    if (readyPlayerIds.length > 0) {
        readyPlayersBar.style.display = 'flex';
        
        // Create header with count
        const readyHeader = document.createElement('div');
        readyHeader.style.marginBottom = '10px';
        readyHeader.style.textAlign = 'center';
        readyHeader.style.width = '100%';
        readyHeader.style.fontWeight = 'bold';
        readyHeader.style.color = '#059669';
        readyHeader.innerHTML = `<i class='fas fa-bell' style='margin-right:6px;'></i> Ready Players: ${readyPlayerIds.length}/${players.length}`;
        
        // Create progress bar to visually show ready status
        const progressContainer = document.createElement('div');
        progressContainer.style.width = '100%';
        progressContainer.style.height = '8px';
        progressContainer.style.background = '#ecfdf5';
        progressContainer.style.borderRadius = '4px';
        progressContainer.style.marginBottom = '12px';
        
        const progressBar = document.createElement('div');
        progressBar.style.width = `${(readyPlayerIds.length / players.length) * 100}%`;
        progressBar.style.height = '100%';
        progressBar.style.background = '#10b981';
        progressBar.style.borderRadius = '4px';
        progressBar.style.transition = 'width 0.5s ease';
        
        // Player avatars container with better responsiveness
        const playersContainer = document.createElement('div');
        playersContainer.style.display = 'flex';
        playersContainer.style.flexWrap = 'wrap';
        playersContainer.style.gap = '8px';
        playersContainer.style.justifyContent = 'center';
        
        // Responsive sizes based on window width
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        const avatarSize = isSmallMobile ? '3px 8px' : (isMobile ? '3px 10px' : '4px 12px');
        const fontSize = isSmallMobile ? '12px' : (isMobile ? '13px' : '14px');
        const iconSize = isSmallMobile ? '12px' : (isMobile ? '14px' : '16px');
        
        // Add ready player avatars
        const readyPlayers = players.filter(p => readyPlayerIds.includes(p.id));
        readyPlayers.forEach(player => {
            const playerAvatar = document.createElement('div');
            playerAvatar.style.background = '#d1fae5';
            playerAvatar.style.color = '#059669';
            playerAvatar.style.borderRadius = '999px';
            playerAvatar.style.padding = avatarSize;
            playerAvatar.style.fontSize = fontSize;
            playerAvatar.style.display = 'flex';
            playerAvatar.style.alignItems = 'center';
            playerAvatar.style.gap = '4px';
            playerAvatar.style.maxWidth = '100%';
            playerAvatar.style.overflow = 'hidden';
            playerAvatar.style.textOverflow = 'ellipsis';
            playerAvatar.style.whiteSpace = 'nowrap';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-user-check';
            icon.style.fontSize = iconSize;
            icon.style.flexShrink = '0';
            
            const nameSpan = document.createElement('span');
            nameSpan.style.overflow = 'hidden';
            nameSpan.style.textOverflow = 'ellipsis';
            nameSpan.textContent = player.name;
            
            playerAvatar.appendChild(icon);
            playerAvatar.appendChild(nameSpan);
            
            // Add a subtle animation to the avatar
            playerAvatar.style.animation = 'pulse 2s infinite';
            
            playersContainer.appendChild(playerAvatar);
        });
        
        // Add waiting-for players with different styling
        const waitingPlayers = players.filter(p => !readyPlayerIds.includes(p.id));
        waitingPlayers.forEach(player => {
            const playerAvatar = document.createElement('div');
            playerAvatar.style.background = '#f3f4f6';
            playerAvatar.style.color = '#6b7280';
            playerAvatar.style.borderRadius = '999px';
            playerAvatar.style.padding = avatarSize;
            playerAvatar.style.fontSize = fontSize;
            playerAvatar.style.display = 'flex';
            playerAvatar.style.alignItems = 'center';
            playerAvatar.style.gap = '4px';
            playerAvatar.style.opacity = '0.7';
            playerAvatar.style.maxWidth = '100%';
            playerAvatar.style.overflow = 'hidden';
            playerAvatar.style.textOverflow = 'ellipsis';
            playerAvatar.style.whiteSpace = 'nowrap';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-user-clock';
            icon.style.fontSize = iconSize;
            icon.style.flexShrink = '0';
            
            const nameSpan = document.createElement('span');
            nameSpan.style.overflow = 'hidden';
            nameSpan.style.textOverflow = 'ellipsis';
            nameSpan.textContent = player.name;
            
            playerAvatar.appendChild(icon);
            playerAvatar.appendChild(nameSpan);
            
            playersContainer.appendChild(playerAvatar);
        });
        
        progressContainer.appendChild(progressBar);
        readyPlayersBar.appendChild(readyHeader);
        readyPlayersBar.appendChild(progressContainer);
        readyPlayersBar.appendChild(playersContainer);
        
        // Add pulse animation style if not already added
        if (!document.getElementById('pulse-animation-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation-style';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        readyPlayersBar.style.display = 'none';
    }
}

function updateVotingStatusBar(totalPlayersCount) {
    const votingStatusBar = document.getElementById('voting-status-bar');
    if (!votingStatusBar) return;

    // Get kicked players list
    const kickedPlayers = games[currentGameId]?.kickedPlayers || [];
    
    // If totalPlayersCount is not provided, calculate it (exclude kicked players)
    const totalPlayers = totalPlayersCount || 
        (players ? players.filter(p => !kickedPlayers.includes(p.id)).length : 0);

    // Clear the existing content
    votingStatusBar.innerHTML = '';

    // Create header with count - clearly show this is only active player votes
    const header = document.createElement('div');
    header.className = 'voting-status-header';
    header.innerHTML = `<i class='fas fa-vote-yea' style='margin-right:6px;'></i> Active Votes: ${votedPlayers.size}/${totalPlayers}`;

    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'voting-status-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'voting-status-progress-bar';
    progressBar.style.width = `${(votedPlayers.size / totalPlayers) * 100}%`;
    
    progressContainer.appendChild(progressBar);

    // Create players container
    const playersContainer = document.createElement('div');
    playersContainer.className = 'voting-status-players';

    // Create a section for active players
    if (players && players.length > 0) {
        // First add a label for active players if there are kicked players
        if (kickedPlayers.length > 0) {
            const activeLabel = document.createElement('div');
            activeLabel.className = 'player-status-label active-players-label';
            activeLabel.innerHTML = '<i class="fas fa-user-check"></i> Active Players:';
            playersContainer.appendChild(activeLabel);
        }
        
        // Add player badges for active players
        players.forEach(player => {
            // Skip kicked players as they will be shown in a separate section
            if (kickedPlayers.includes(player.id)) {
                return;
            }
            
            const playerBadge = document.createElement('div');
            playerBadge.className = `voting-status-player ${votedPlayers.has(player.id) ? 'voted' : ''}`;
            
            // Add player name and voting status
            const playerContent = document.createElement('div');
            playerContent.style.display = 'flex';
            playerContent.style.alignItems = 'center';
            playerContent.style.gap = '6px';
            
            if (votedPlayers.has(player.id)) {
                const checkIcon = document.createElement('i');
                checkIcon.className = 'fas fa-check-circle';
                checkIcon.style.color = '#059669';
                playerContent.appendChild(checkIcon);
            }
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = player.name;
            playerContent.appendChild(nameSpan);
            
            playerBadge.appendChild(playerContent);
            playersContainer.appendChild(playerBadge);
        });
        
        // Add a section for spectators (kicked players)
        if (kickedPlayers.length > 0) {
            const spectatorsLabel = document.createElement('div');
            spectatorsLabel.className = 'player-status-label spectators-label';
            spectatorsLabel.innerHTML = '<i class="fas fa-eye"></i> Spectators (not voting):';
            playersContainer.appendChild(spectatorsLabel);
            
            // Add kicked players as spectators
            kickedPlayers.forEach(kickedId => {
                const kickedPlayer = players.find(p => p.id === kickedId);
                if (!kickedPlayer) return;
                
                const spectatorBadge = document.createElement('div');
                spectatorBadge.className = 'voting-status-player spectator';
                
                const playerContent = document.createElement('div');
                playerContent.style.display = 'flex';
                playerContent.style.alignItems = 'center';
                playerContent.style.gap = '6px';
                
                const eyeIcon = document.createElement('i');
                eyeIcon.className = 'fas fa-eye';
                eyeIcon.style.color = '#6b7280';
                playerContent.appendChild(eyeIcon);
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = kickedPlayer.name;
                playerContent.appendChild(nameSpan);
                
                spectatorBadge.appendChild(playerContent);
                playersContainer.appendChild(spectatorBadge);
            });
        }
    }

    // Add the elements to the status bar
    votingStatusBar.appendChild(header);
    votingStatusBar.appendChild(progressContainer);
    votingStatusBar.appendChild(playersContainer);
}

// Built by Knox
// Game Initialization
function initGame() {
    // Set up event listeners
    setupEventListeners();
    
    // Set up socket event handlers
    setupSocketHandlers();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Load stored player name if exists
    loadPlayerName();
}

// Built by Knox
// Load stored player name from localStorage
function loadPlayerName() {
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
        playerNameInput.value = storedName;
        playerName = storedName;
        
        // Show returning player message
        const returningPlayerMessage = document.getElementById('returning-player-message');
        const returningPlayerName = document.getElementById('returning-player-name');
        
        if (returningPlayerMessage && returningPlayerName) {
            returningPlayerName.textContent = storedName;
            returningPlayerMessage.style.display = 'block';
        }
        
        // Set focus on game code input since name is already filled
        setTimeout(() => {
            gameCodeInput.focus();
        }, 500);
    }
}

// Built by Knox
// Store player name in localStorage
function storePlayerName() {
    if (playerName) {
        localStorage.setItem('playerName', playerName);
    }
}

// Built by Knox
// Set up UI event listeners
function setupEventListeners() {
    // Welcome screen
    createGameBtn.addEventListener('click', createGame);
    joinGameBtn.addEventListener('click', joinGame);
    
    // Lobby screen
    copyCodeBtn.addEventListener('click', copyGameCode);
    spyCountSelect.addEventListener('change', updateGameSettings);
    discussionTimeSelect.addEventListener('change', updateGameSettings);
    startGameBtn.addEventListener('click', startGame);
    
    // Role screen
    readyBtn.addEventListener('click', playerReady);
    
    // Game screen
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Voting screen
    submitVoteBtn.addEventListener('click', submitVote);
    
    // Results screen
    playAgainBtn.addEventListener('click', playAgain);
}

// Built by Knox
// Set up socket event handlers
function setupSocketHandlers() {
    socket.on('game-created', handleGameCreated);
    socket.on('game-join-error', handleGameJoinError);
    socket.on('game-joined', handleGameJoined);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('settings-updated', handleSettingsUpdated);
    socket.on('game-started', handleGameStarted);
    socket.on('timer-update', handleTimerUpdate);
    socket.on('timer-ended', handleTimerEnded);
    socket.on('game-reset', handleGameReset);
    socket.on('player-left', handlePlayerLeft);
    socket.on('new-message', handleNewMessage);
    socket.on('voting-results', handleVotingResults);
    socket.on('player-ready-notify', handlePlayerReadyNotify);
    socket.on('player-not-ready-notify', handlePlayerNotReadyNotify);
    socket.on('all-players-ready', handleAllPlayersReady);
    socket.on('update-voting-status', (data) => {
        // Check if we have valid data
        if (!data) {
            console.error('Received invalid data in update-voting-status event');
            return;
        }

        try {
            // Clear and recreate the votedPlayers set from the data
            if (data.votedPlayers && Array.isArray(data.votedPlayers)) {
                votedPlayers = new Set(data.votedPlayers);
                console.log('Updated votedPlayers:', Array.from(votedPlayers));
            } else {
                console.error('Received invalid votedPlayers in update-voting-status event', data.votedPlayers);
            }
            
            // Store the list of kicked players if provided
            if (data.kickedPlayers && Array.isArray(data.kickedPlayers)) {
                if (!games[currentGameId]) {
                    games[currentGameId] = {};
                }
                games[currentGameId].kickedPlayers = data.kickedPlayers;
                
                // Check if current player is kicked
                if (data.kickedPlayers.includes(socket.id)) {
                    isKicked = true;
                }
            }
            
            // Update the UI to reflect changes
            updateVotingStatusBar(data.totalPlayers);
        } catch (error) {
            console.error('Error processing voting status update:', error);
        }
    });
    socket.on('vote-submitted', (data) => {
        if (data.message) {
            showNotification(data.message, 'info');
        }
    });
    
    // Add handler for player being kicked
    socket.on('player-kicked', (data) => {
        isKicked = true;
        showNotification(data.message, 'warning');
        
        // Create a permanent kicked status indicator
        const kickedBanner = document.createElement('div');
        kickedBanner.className = 'kicked-banner';
        kickedBanner.innerHTML = `
            <div class="kicked-icon"><i class="fas fa-user-slash"></i></div>
            <div class="kicked-message">You were voted out in round 1</div>
        `;
        document.body.appendChild(kickedBanner);
    });
    
    // Add handler for voting rights status check
    socket.on('voting-rights-status', (data) => {
        if (!data.canVote) {
            isKicked = true;
            showNotification(data.message, 'warning');
            disableVotingUI();
            
            // Make it clear to kicked players that they are only spectators
            const spectatorMessage = document.createElement('div');
            spectatorMessage.className = 'spectator-message';
            spectatorMessage.innerHTML = `
                <i class="fas fa-eye"></i> 
                <span>You are now a spectator. You will not be counted in the voting process.</span>
            `;
            
            const votingScreenTitle = document.querySelector('.voting-header h2');
            if (votingScreenTitle) {
                votingScreenTitle.textContent = 'Spectator Mode - Voting in Progress';
            }
            
            // Add spectator message after the kicked indicator
            const kickedIndicator = document.querySelector('.kicked-indicator');
            if (kickedIndicator) {
                kickedIndicator.after(spectatorMessage);
            } else {
                const votingHeader = document.querySelector('.voting-header');
                if (votingHeader) {
                    votingHeader.appendChild(spectatorMessage);
                }
            }
        }
        
        // Store kicked players info in the game state
        if (data.kickedPlayers && Array.isArray(data.kickedPlayers)) {
            if (!games[currentGameId]) {
                games[currentGameId] = {};
            }
            games[currentGameId].kickedPlayers = data.kickedPlayers;
        }
        
        // Update the voting status bar with active player count if provided
        if (data.activePlayerCount) {
            updateVotingStatusBar(data.activePlayerCount);
        }
        
        // Display kicked player information in voting screen
        if (data.kickedPlayerName) {
            const votingHeader = document.querySelector('.voting-header');
            if (votingHeader && !votingHeader.querySelector('.kicked-player-round2')) {
                const kickedInfoElement = document.createElement('div');
                kickedInfoElement.className = 'kicked-player-round2';
                kickedInfoElement.innerHTML = `
                    <i class="fas fa-user-slash"></i> ${data.kickedPlayerName} was voted out in round 1
                `;
                votingHeader.appendChild(kickedInfoElement);
            }
        }
    });
    
    // Add handler for game state updates
    socket.on('game-state-update', (data) => {
        // Update local game state
        if (!games[currentGameId]) {
            games[currentGameId] = {};
        }
        
        // Store game state information
        if (data.currentRound) {
            games[currentGameId].currentRound = data.currentRound;
        }
        
        if (data.kickedPlayerName) {
            games[currentGameId].kickedPlayerName = data.kickedPlayerName;
        }
        
        if (data.kickedPlayers && Array.isArray(data.kickedPlayers)) {
            games[currentGameId].kickedPlayers = data.kickedPlayers;
        }
        
        // Check if current player was kicked
        if (data.kickedPlayers && data.kickedPlayers.includes(socket.id)) {
            isKicked = true;
        }
            
        // Add kicked player indicator to the role screen if not already there and if we're in round 2
        if (data.currentRound === 2 && data.kickedPlayerName) {
            if (!document.querySelector('.kicked-players-info')) {
                const roleCard = document.querySelector('.role-card');
                if (roleCard) {
                    const kickedPlayersInfo = document.createElement('div');
                    kickedPlayersInfo.className = 'kicked-players-info';
                    kickedPlayersInfo.innerHTML = `
                        <div class="kicked-player">
                            <i class="fas fa-user-slash"></i> 
                            <span>${data.kickedPlayerName} was voted out in round 1</span>
                        </div>
                    `;
                    roleCard.appendChild(kickedPlayersInfo);
                }
            }
        }
    });
}

// Built by Knox
// Game Logic Functions
function createGame() {
    playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        showNotification('Please enter your name', 'error');
        return;
    }
    
    isHost = true;
    storePlayerName();
    socket.emit('create-game', { playerName });
}

function joinGame() {
    playerName = playerNameInput.value.trim();
    const gameCode = gameCodeInput.value.trim().toUpperCase();
    
    if (!playerName) {
        showNotification('Please enter your name', 'error');
        return;
    }
    
    if (!gameCode) {
        showNotification('Please enter a game code', 'error');
        return;
    }
    
    if (gameCode.length !== 4) {
        showNotification('Game code must be 4 characters long', 'error');
        return;
    }
    
    isHost = false;
    storePlayerName();
    socket.emit('join-game', { playerName, gameId: gameCode });
}

function handleGameCreated(data) {
    gameId = data.gameId;
    currentGameId = data.gameId; // Store the current game ID
    players = data.players;
    
    // Initialize the games object for this game ID
    if (!games[currentGameId]) {
        games[currentGameId] = {};
    }
    
    // Update UI
    gameCodeDisplay.textContent = gameId;
    updatePlayersList();
    
    // Show lobby screen
    showScreen(lobbyScreen);
}

function handleGameJoinError(data) {
    // Show a more specific error message for wrong game codes
    if (data.message.includes('Game not found')) {
        showNotification('Invalid game code. Please check and try again.', 'error');
    } else {
        showNotification(data.message, 'error');
    }
    
    // Clear the game code input to allow retry
    gameCodeInput.value = '';
    gameCodeInput.focus();
}

function handleGameJoined(data) {
    gameId = data.gameId;
    currentGameId = data.gameId; // Store the current game ID
    players = data.players;
    
    // Initialize the games object for this game ID if not already done
    if (!games[currentGameId]) {
        games[currentGameId] = {};
    }
    
    // Update UI
    gameCodeDisplay.textContent = gameId;
    updatePlayersList();
    
    // Update settings
    spyCountSelect.value = data.settings.spyCount;
    discussionTimeSelect.value = data.settings.discussionTime || 'none';
    
    // Disable settings for non-host players
    if (!isHost) {
        spyCountSelect.disabled = true;
        discussionTimeSelect.disabled = true;
        startGameBtn.style.display = 'none';
    } else {
        spyCountSelect.disabled = false;
        discussionTimeSelect.disabled = false;
        startGameBtn.style.display = '';
    }
    
    // Show lobby screen
    showScreen(lobbyScreen);
}

function handlePlayerJoined(data) {
    players = data.players;
    updatePlayersList();
}

function copyGameCode() {
    navigator.clipboard.writeText(gameId)
        .then(() => {
            // Visual feedback
            copyCodeBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyCodeBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 1500);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showNotification('Failed to copy game code', 'error');
        });
}

function updateGameSettings() {
    if (!isHost) return;
    
    const settings = {
        spyCount: parseInt(spyCountSelect.value),
        discussionTime: parseInt(discussionTimeSelect.value)
    };
    
    socket.emit('update-settings', settings);
}

function handleSettingsUpdated(data) {
    // Update UI for all players
    spyCountSelect.value = data.settings.spyCount;
    discussionTimeSelect.value = data.settings.discussionTime;
}

function updatePlayersList() {
    playersList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name + (player.isHost ? ' (Host)' : '') + (readyPlayerIds.includes(player.id) ? ' 👍' : '');
        playersList.appendChild(li);
    });
    // Update online players bar
    if (players && players.length > 0) {
        onlinePlayersBar.style.display = 'flex';
        onlinePlayersCount.textContent = players.length;
        // Modern pill badges for each player, green dot if ready
        onlinePlayersList.innerHTML = players.map(p =>
            `<span style="display:inline-flex;align-items:center;background:#e0e7ff;color:#6366f1;border-radius:999px;padding:2px 10px;margin:0 2px;font-weight:600;font-size:0.98em;">
                ${readyPlayerIds.includes(p.id)
                    ? '<span style="display:inline-block;width:10px;height:10px;background:#22c55e;border-radius:50%;margin-right:6px;"></span>'
                    : ''}${p.name}
            </span>`
        ).join('');
    } else {
        onlinePlayersBar.style.display = 'none';
    }
}

function startGame() {
    if (!isHost) return;
    
    if (players.length < 3) {
        showNotification('You need at least 3 players to start the game', 'error');
        return;
    }
    
    socket.emit('start-game');
}

function handleGameStarted(data) {
    if (!data || !data.roles) return;
    
    // Find the player's role
    const playerRole = data.roles.find(role => role.playerName === playerName);
    
    if (playerRole) {
        // Display the role and word
        roleTypeDisplay.innerHTML = playerRole.role === 'spy' ? 
            '<i class="fas fa-user-secret"></i> Spy' : 
            '<i class="fas fa-user"></i> Regular';
        
        wordDisplay.textContent = playerRole.word;
        
        // Store role and word for later use
        window.playerRole = playerRole.role;
        window.gameWord = playerRole.word;
        
        // Show only the current player's word
        updatePlayersWorldsDisplay([playerRole]);
        
        // Store discussion time for later use
        window.discussionTime = data.discussionTime * 60 || 300; // Default to 5 minutes if not provided
        
        // Initialize chat container
        if (chatMessages) {
            chatMessages.innerHTML = ''; // Clear any existing messages
            console.log('Chat container initialized');
        } else {
            console.error('Chat container not found');
        }
        
        // Show role screen
        showScreen(roleScreen);
        
        // Display round information
        if (!document.querySelector('.round-number')) {
            const roundNumberDisplay = document.createElement('div');
            roundNumberDisplay.className = 'round-number';
            roundNumberDisplay.innerHTML = `<p>Round ${data.roundNumber || 1} of 2</p>`;
            document.querySelector('.role-info').appendChild(roundNumberDisplay);
        }
    }
}

function updatePlayersWorldsDisplay(roles) {
    const playersWorldsList = document.getElementById('players-worlds-list');
    if (!playersWorldsList) return;

    playersWorldsList.innerHTML = '';
    
    // Find the current player's role
    const currentPlayerRole = roles.find(role => role.playerId === socket.id);
    if (!currentPlayerRole) return;

    // Create a card only for the current player
    const playerCard = document.createElement('div');
    playerCard.className = 'player-world-card';
    
    const headingElement = document.createElement('div');
    headingElement.className = 'player-word-heading';
    headingElement.textContent = 'Your Word';
    
    const wordElement = document.createElement('div');
    wordElement.className = 'player-word';
    wordElement.textContent = currentPlayerRole.word;
    
    playerCard.appendChild(headingElement);
    playerCard.appendChild(wordElement);
    playersWorldsList.appendChild(playerCard);
}

function playerReady() {
    const currentPlayer = players.find(p => p.name === playerName);
    
    // Provide immediate visual feedback
    readyBtn.disabled = true;
    readyBtn.classList.add('ready-clicked');
    readyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Ready!';
    
    // Add a subtle animation to the button
    readyBtn.style.transform = 'scale(1.05)';
    setTimeout(() => {
        readyBtn.style.transform = 'scale(1)';
    }, 200);
    
    // Create a cancel ready button to allow users to change their mind
    if (!document.getElementById('cancel-ready-btn')) {
        const cancelReadyBtn = document.createElement('button');
        cancelReadyBtn.id = 'cancel-ready-btn';
        cancelReadyBtn.className = 'btn cancel-ready';
        cancelReadyBtn.innerHTML = '<i class="fas fa-times-circle"></i> Cancel';
        cancelReadyBtn.style.marginLeft = '12px';
        cancelReadyBtn.style.backgroundColor = '#fee2e2';
        cancelReadyBtn.style.color = '#ef4444';
        cancelReadyBtn.style.border = '1px solid #fecaca';
        cancelReadyBtn.style.padding = '14px 24px';
        cancelReadyBtn.style.display = 'inline-flex';
        cancelReadyBtn.style.alignItems = 'center';
        cancelReadyBtn.style.justifyContent = 'center';
        cancelReadyBtn.style.gap = '8px';
        
        cancelReadyBtn.addEventListener('click', playerNotReady);
        readyBtn.parentNode.appendChild(cancelReadyBtn);
    }
    
    // Check if we're in the second round and need to display kicked player info
    socket.emit('get-game-state');
    
    // Send the ready status to the server
    socket.emit('player-ready', { playerId: currentPlayer.id, name: playerName });
}

function playerNotReady() {
    const currentPlayer = players.find(p => p.name === playerName);
    
    // Reset the ready button
    readyBtn.disabled = false;
    readyBtn.classList.remove('ready-clicked');
    readyBtn.innerHTML = 'I am ready';
    
    // Remove the cancel button
    const cancelReadyBtn = document.getElementById('cancel-ready-btn');
    if (cancelReadyBtn) {
        cancelReadyBtn.remove();
    }
    
    socket.emit('player-not-ready', { playerId: currentPlayer.id, name: playerName });
}

function handleAllPlayersReady() {
    // Show celebration notification
    const celebrationNotification = document.createElement('div');
    celebrationNotification.className = 'celebration-notification';
    celebrationNotification.innerHTML = `
        <div class="celebration-content">
            <div class="celebration-icon">🎮</div>
            <div class="celebration-text">All players are ready! Starting the game...</div>
        </div>
    `;
    
    // Style the celebration notification with better responsiveness
    celebrationNotification.style.position = 'fixed';
    celebrationNotification.style.top = '50%';
    celebrationNotification.style.left = '50%';
    celebrationNotification.style.transform = 'translate(-50%, -50%)';
    celebrationNotification.style.background = '#10b981';
    celebrationNotification.style.color = 'white';
    celebrationNotification.style.padding = '20px 30px';
    celebrationNotification.style.borderRadius = '12px';
    celebrationNotification.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
    celebrationNotification.style.zIndex = '9999';
    celebrationNotification.style.textAlign = 'center';
    celebrationNotification.style.opacity = '0';
    celebrationNotification.style.transition = 'all 0.5s ease';
    celebrationNotification.style.maxWidth = '90%';
    
    // Make responsive for mobile
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (mediaQuery.matches) {
        celebrationNotification.style.padding = '15px 25px';
        celebrationNotification.style.maxWidth = '90%';
    }
    
    // Make responsive for small mobile
    const smallMediaQuery = window.matchMedia('(max-width: 480px)');
    if (smallMediaQuery.matches) {
        celebrationNotification.style.padding = '12px 20px';
        celebrationNotification.style.maxWidth = '95%';
    }
    
    // Style the icon
    const iconElement = celebrationNotification.querySelector('.celebration-icon');
    iconElement.style.fontSize = mediaQuery.matches ? '36px' : '48px';
    iconElement.style.marginBottom = '10px';
    
    // Style the text
    const textElement = celebrationNotification.querySelector('.celebration-text');
    textElement.style.fontSize = mediaQuery.matches ? '16px' : '18px';
    textElement.style.fontWeight = 'bold';
    
    // Add to body
    document.body.appendChild(celebrationNotification);
    
    // Show with animation
    setTimeout(() => {
        celebrationNotification.style.opacity = '1';
        celebrationNotification.style.transform = 'translate(-50%, -50%) scale(1.1)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        celebrationNotification.style.opacity = '0';
        celebrationNotification.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        // Show game screen after notification disappears
        setTimeout(() => {
            celebrationNotification.remove();
            showScreen(gameScreen);
            
            // Start the timer now that all players are ready
            if (window.discussionTime) {
                startTimer(window.discussionTime);
            }
        }, 500);
    }, 2000);
}

function startTimer(seconds) {
    remainingTime = seconds;
    
    function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateTimerDisplay();
}

// Handle timer updates
function handleTimerUpdate(data) {
    if (data.remainingTime !== undefined) {
        remainingTime = data.remainingTime;
        const minutes = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Show/hide timer controls based on host status
        const timerControls = document.getElementById('timer-controls');
        if (timerControls) {
            timerControls.style.display = data.isHost ? 'flex' : 'none';
        }
    }
}

// Handle timer ended
function handleTimerEnded() {
    // Reset the voting state before showing voting screen
    selectedVote = null;
    
    // Reset voted players
    votedPlayers = new Set();
    
    showScreen(votingScreen);
    
    // Check voting rights with the server first
    socket.emit('check-voting-rights');
    
    // Fetch the current game state
    socket.emit('get-game-state');
    
    // Ensure there's a voting header
    let votingHeader = document.querySelector('.voting-header');
    if (!votingHeader) {
        votingHeader = document.createElement('div');
        votingHeader.className = 'voting-header';
        votingScreen.insertBefore(votingHeader, votingScreen.firstChild);
    }
    
    // Populate voting options
    votingOptions.innerHTML = '';
    
    // Create voting status bar if it doesn't exist
    let votingStatusBar = document.getElementById('voting-status-bar');
    if (!votingStatusBar) {
        votingStatusBar = document.createElement('div');
        votingStatusBar.id = 'voting-status-bar';
        votingStatusBar.className = 'voting-status-bar';
        votingScreen.insertBefore(votingStatusBar, votingOptions);
    }
    
    // Get kicked players list
    const kickedPlayers = games[currentGameId]?.kickedPlayers || [];
    
    // Calculate active player count (excluding kicked players)
    const activePlayers = players.filter(p => !kickedPlayers.includes(p.id));
    
    // Initialize the voting status bar
    updateVotingStatusBar(activePlayers.length);
    
    // Create voting options
    votingOptions.innerHTML = '';
    
    // Ensure we have players before trying to render voting options
    if (players && players.length > 0) {
        players.forEach(player => {
            // Don't show self or kicked players as voting options
            if (player.id !== socket.id && !kickedPlayers.includes(player.id)) {
                const voteOption = document.createElement('div');
                voteOption.className = 'vote-option';
                voteOption.dataset.playerId = player.id;
                voteOption.innerHTML = `
                    <div class="player-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="player-name">${player.name}</div>
                `;
                voteOption.addEventListener('click', () => {
                    // Only allow clicking if player hasn't been kicked
                    if (!isKicked) {
                        // Remove selected class from all options
                        document.querySelectorAll('.vote-option').forEach(opt => opt.classList.remove('selected'));
                        // Add selected class to clicked option
                        voteOption.classList.add('selected');
                        selectedVote = player.id;
                    } else {
                        showNotification('You were voted out in round 1 and cannot vote.', 'error');
                    }
                });
                votingOptions.appendChild(voteOption);
            }
        });
    } else {
        // Debug: Show notification if players array is empty
        console.error('Error: Players array is empty or undefined in handleTimerEnded', players);
        showNotification('Error: Unable to display voting options. Please refresh the game.', 'error');
    }
    
    // Make sure the submit button is enabled for each new voting round (if not kicked)
    if (submitVoteBtn) {
        if (isKicked) {
            disableVotingUI();
        } else {
            submitVoteBtn.disabled = false;
            submitVoteBtn.style.opacity = '1';
            submitVoteBtn.style.cursor = 'pointer';
        }
    }
}

function showVotingScreen() {
    // Reset voted players
    votedPlayers.clear();
    
    // Get kicked players list
    const kickedPlayers = games[currentGameId]?.kickedPlayers || [];
    
    // Calculate active players (excluding kicked players)
    const activePlayers = players.filter(p => !kickedPlayers.includes(p.id));
    
    // Ensure there's a voting header
    let votingHeader = document.querySelector('.voting-header');
    if (!votingHeader) {
        votingHeader = document.createElement('div');
        votingHeader.className = 'voting-header';
        votingScreen.insertBefore(votingHeader, votingScreen.firstChild);
    }
    
    // Populate voting options
    votingOptions.innerHTML = '';
    
    // Create voting status bar if it doesn't exist
    let votingStatusBar = document.getElementById('voting-status-bar');
    if (!votingStatusBar) {
        votingStatusBar = document.createElement('div');
        votingStatusBar.id = 'voting-status-bar';
        votingStatusBar.className = 'voting-status-bar';
        votingScreen.insertBefore(votingStatusBar, votingOptions);
    }
    
    // Initialize the voting status bar
    updateVotingStatusBar(activePlayers.length);
    
    // Create voting options
    votingOptions.innerHTML = '';
    
    // Make sure we have valid players data
    if (!players || players.length === 0) {
        console.error('Error: Players array is empty or undefined in showVotingScreen', players);
        showNotification('Error: Unable to display voting options. Please refresh the game.', 'error');
        return;
    }
    
    players.forEach(player => {
        // Don't allow voting for yourself or kicked players
        if (player.id === socket.id || kickedPlayers.includes(player.id)) return;
        
        const option = document.createElement('div');
        option.className = 'vote-option';
        option.dataset.playerId = player.id;
        
        // Add player name and avatar
        const playerAvatar = document.createElement('div');
        playerAvatar.className = 'player-avatar';
        playerAvatar.innerHTML = '<i class="fas fa-user"></i>';
        
        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.textContent = player.name;
        
        option.appendChild(playerAvatar);
        option.appendChild(playerName);
        
        option.addEventListener('click', () => {
            // Only allow clicking if player hasn't been kicked
            if (!isKicked) {
                // Remove selected class from all options
                document.querySelectorAll('.vote-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                option.classList.add('selected');
                selectedVote = player.id;
            } else {
                showNotification('You were voted out in round 1 and cannot vote.', 'error');
            }
        });
        
        votingOptions.appendChild(option);
    });
    
    // If current player is kicked, disable voting UI
    if (isKicked) {
        disableVotingUI();
    }
    
    showScreen(votingScreen);
}

function submitVote() {
    // Check if player has been kicked
    if (isKicked) {
        showNotification('You were voted out in round 1 and cannot vote.', 'error');
        return;
    }
    
    if (!selectedVote) {
        showNotification('Please select a player to vote for', 'error');
        return;
    }
    
    // Get the current player from the players array
    const currentPlayer = players.find(p => p.id === socket.id);
    const votedPlayer = players.find(p => p.id === selectedVote);
    
    if (!currentPlayer) {
        console.error('Current player not found in players array', socket.id, players);
        showNotification('Error: Unable to identify current player. Please refresh the game.', 'error');
        return;
    }
    
    if (!votedPlayer) {
        console.error('Selected player not found in players array', selectedVote, players);
        showNotification('Error: Selected player not found. Please try again.', 'error');
        return;
    }
    
    // Get kicked players list 
    const kickedPlayers = games[currentGameId]?.kickedPlayers || [];
    
    // Calculate active players (excluding kicked players)
    const activePlayers = players.filter(p => !kickedPlayers.includes(p.id));
    
    // Add the current player to voted players set
    votedPlayers.add(currentPlayer.id);
    
    // Update the voting status bar with active player count
    updateVotingStatusBar(activePlayers.length);
    
    // Send the vote to the server
    socket.emit('submit-vote', {
        playerId: currentPlayer.id,
        votedFor: selectedVote
    });
    
    // Disable voting options after submitting for this round
    document.querySelectorAll('.vote-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.7';
    });
    
    // Disable submit button for this round
    if (submitVoteBtn) {
        submitVoteBtn.disabled = true;
        submitVoteBtn.style.opacity = '0.7';
        submitVoteBtn.style.cursor = 'not-allowed';
    }
    
    // Show notification to confirm vote
    showNotification(`You voted for ${votedPlayer.name}`, 'success');
}

function handleVotingResults(data) {
    // Update results screen
    if (data.gameOver) {
        if (data.winner === 'regular') {
            resultsContent.innerHTML = `
                <div class="result-message success">
                    <i class="fas fa-check-circle"></i>
                    <p>${data.message || 'Regular players win! You caught the spy!'}</p>
                </div>
            `;
        } else {
            resultsContent.innerHTML = `
                <div class="result-message failure">
                    <i class="fas fa-times-circle"></i>
                    <p>${data.message || `Spies win! The spy was ${data.spyName}!`}</p>
                </div>
            `;
        }
        
        // Display both words
        finalWordDisplay.textContent = data.word;
        const spyWordDisplay = document.createElement('p');
        spyWordDisplay.textContent = `The spy's word was: ${data.spyWord}`;
        spyWordDisplay.style.marginTop = '10px';
        spyWordDisplay.style.fontWeight = 'bold';
        spyWordDisplay.style.color = '#ef4444';
        finalWordDisplay.parentNode.appendChild(spyWordDisplay);
        
        spyNameDisplay.textContent = data.spyName;
        
        // Show results screen
        showScreen(resultsScreen);
        
        // Reset the kicked state for next game
        isKicked = false;
        
        // Remove any kicked banners
        const kickedBanner = document.querySelector('.kicked-banner');
        if (kickedBanner) {
            kickedBanner.remove();
        }
    } else if (data.continueGame) {
        // Show notification about the kicked player
        showNotification(data.message || `${data.kickedPlayerName} was not the spy! Second round will begin in 10 seconds...`, 'warning');
        
        // Store the kicked players in the game state
        if (!games[currentGameId]) {
            games[currentGameId] = {};
        }
        
        if (data.kickedPlayers && Array.isArray(data.kickedPlayers)) {
            games[currentGameId].kickedPlayers = data.kickedPlayers;
        }
        
        // Check if current player was kicked
        if (data.kickedPlayers && data.kickedPlayers.includes(socket.id)) {
            isKicked = true;
            showNotification('You were voted out! Your voting rights have been disabled, but you can still observe the game.', 'warning');
        }
        
        // Create a countdown element for the interval
        const countdownContainer = document.createElement('div');
        countdownContainer.className = 'countdown-container';
        countdownContainer.innerHTML = `
            <div class="countdown-message">
                <p>Round ${data.roundNumber || 2} starting in</p>
                <div class="countdown-timer">${data.intervalTime || 10}</div>
                ${data.kickedPlayerName ? `<div class="kicked-player-info">
                    <i class="fas fa-user-slash"></i> ${data.kickedPlayerName} was voted out in round 1
                </div>` : ''}
            </div>
        `;
        document.body.appendChild(countdownContainer);
        
        // Start the countdown
        let timeLeft = data.intervalTime || 10;
        const countdownTimer = countdownContainer.querySelector('.countdown-timer');
        
        const intervalId = setInterval(() => {
            timeLeft--;
            countdownTimer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(intervalId);
                countdownContainer.remove();
                
                // Reset voting state for the second round
                selectedVote = null;
                votedPlayers.clear();
                
                // Reset the ready state
                readyPlayerIds = [];
                
                // Store the discussion time for later use when all players are ready again
                window.discussionTime = data.settings?.discussionTime * 60 || 300; // Default to 5 minutes if not provided
                
                // Show the role screen again for the next round
                showScreen(roleScreen);
                
                // Re-enable the ready button for the second round
                readyBtn.disabled = false;
                readyBtn.classList.remove('ready-clicked');
                readyBtn.innerHTML = '<i class="fas fa-check"></i> I\'m Ready';
                
                // Remove the cancel button if it exists
                const cancelReadyBtn = document.getElementById('cancel-ready-btn');
                if (cancelReadyBtn) {
                    cancelReadyBtn.remove();
                }
                
                // Update the round indicator if it exists
                const roundNumber = document.querySelector('.round-number');
                if (roundNumber) {
                    roundNumber.innerHTML = `<p>Round ${data.roundNumber || 2} of 2</p>`;
                } else {
                    // Create round indicator if it doesn't exist
                    const newRoundNumber = document.createElement('div');
                    newRoundNumber.className = 'round-number';
                    newRoundNumber.innerHTML = `<p>Round ${data.roundNumber || 2} of 2</p>`;
                    document.querySelector('.role-info').appendChild(newRoundNumber);
                }
                
                // Add kicked player indicator for all players during the second round
                if (data.kickedPlayerName) {
                    const kickedPlayersInfo = document.createElement('div');
                    kickedPlayersInfo.className = 'kicked-players-info';
                    kickedPlayersInfo.innerHTML = `
                        <div class="kicked-player">
                            <i class="fas fa-user-slash"></i> 
                            <span>${data.kickedPlayerName} was voted out in round 1</span>
                        </div>
                    `;
                    document.querySelector('.role-card').appendChild(kickedPlayersInfo);
                }
                
                // If player was kicked, show a message
                if (isKicked) {
                    // Create a permanent kicked status indicator if it doesn't exist
                    if (!document.querySelector('.kicked-banner')) {
                        const kickedBanner = document.createElement('div');
                        kickedBanner.className = 'kicked-banner';
                        kickedBanner.innerHTML = `
                            <div class="kicked-icon"><i class="fas fa-user-slash"></i></div>
                            <div class="kicked-message">You were voted out in round 1</div>
                        `;
                        document.body.appendChild(kickedBanner);
                    }
                }
                
                // Update the ready players bar
                updateReadyPlayersBar();
            }
        }, 1000);
    }
}

function playAgain() {
    // Store player name before resetting
    storePlayerName();
    // Redirect to welcome screen instead of lobby
    socket.emit('play-again');
}

function handleGameReset(data) {
    // Reset game state while preserving only the player's name
    gameId = '';
    selectedVote = null;
    votedPlayers.clear();
    isHost = false;
    playerRole = '';
    gameWord = '';
    isKicked = false; // Reset kicked status
    readyPlayerIds = []; // Reset ready players list
    
    // Reset players array with only name and id
    if (data.players) {
        players = data.players;
    } else {
        players = [];
    }
    
    // Remove any kicked banners
    const kickedBanner = document.querySelector('.kicked-banner');
    if (kickedBanner) {
        kickedBanner.remove();
    }
    
    // Reset any game-specific UI elements
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    
    // Clear game code input
    if (gameCodeInput) {
        gameCodeInput.value = '';
    }
    
    // Reset ready button state
    if (readyBtn) {
        readyBtn.disabled = false;
        readyBtn.classList.remove('ready-clicked');
        readyBtn.innerHTML = '<i class="fas fa-check"></i> I\'m Ready';
    }
    
    // Remove cancel ready button if it exists
    const cancelReadyBtn = document.getElementById('cancel-ready-btn');
    if (cancelReadyBtn) {
        cancelReadyBtn.remove();
    }
    
    // Reset voting options
    if (votingOptions) {
        votingOptions.innerHTML = '';
    }
    
    // Reset submit vote button
    if (submitVoteBtn) {
        submitVoteBtn.disabled = false;
        submitVoteBtn.style.opacity = '1';
        submitVoteBtn.style.cursor = 'pointer';
    }
    
    // Reset game settings
    if (spyCountSelect) {
        spyCountSelect.value = '1';
    }
    if (discussionTimeSelect) {
        discussionTimeSelect.value = 'none';
    }
    
    // Load the stored player name
    loadPlayerName();
    
    // Show welcome screen instead of lobby screen
    showScreen(welcomeScreen);
    
    // Notify the user that a new game is starting
    showNotification('Starting a new game with your name preserved', 'info');
    
    // Update ready players bar
    updateReadyPlayersBar();
}

function handlePlayerLeft(data) {
    if (data && data.name) {
        showNotification(`${data.name} has left the game.`, 'warning');
    }
    // The game continues for remaining players, just update the list
    updatePlayersList();
}

function handlePlayerReadyNotify(data) {
    if (data && data.playerId) {
        if (!readyPlayerIds.includes(data.playerId)) readyPlayerIds.push(data.playerId);
        
        // Use the server-provided ready players if available
        if (data.readyPlayers) {
            readyPlayerIds = data.readyPlayers;
        }
        
        updateReadyPlayersBar();
        showReadyNotification(data.name);
    }
}

function showReadyNotification(name) {
    // Only show in-app notification
    showNotification(`${name} is ready to play!`, 'success');
}

function handlePlayerNotReadyNotify(data) {
    if (data && data.playerId) {
        // Use server-provided ready players if available, otherwise remove the player from local ready list
        if (data.readyPlayers) {
            readyPlayerIds = data.readyPlayers;
        } else {
            readyPlayerIds = readyPlayerIds.filter(id => id !== data.playerId);
        }
        
        updateReadyPlayersBar();
        showNotReadyNotification(data.name);
    }
}

function showNotReadyNotification(name) {
    showNotification(`${name} is not ready!`, 'warning');
}

// Helper function to show a specific screen
function showScreen(screen) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show the specified screen
    screen.classList.add('active');
}

// Function to show in-app notifications
function showNotification(message, type = 'info') {
    // Clear any existing notification timeouts
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }
    
    // Remove any existing notifications
    const existingNotification = document.querySelector('.modern-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification element
    const notification = document.createElement('div');
    notification.className = `modern-notification ${type}-notification`;
    
    let icon = 'info-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification-text">${message}</div>
        </div>
    `;
    
    // Add to the notification container
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after a delay
    window.notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notifications");
        return;
    }
    
    if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission === "granted";
        });
    }
}

// Add timer controls to the game screen
function showGameScreen() {
    showScreen(gameScreen);
    
    // Add timer controls if they don't exist
    if (!document.getElementById('timer-controls')) {
        const timerControls = document.createElement('div');
        timerControls.id = 'timer-controls';
        timerControls.className = 'timer-controls';
        timerControls.style.display = isHost ? 'flex' : 'none';
        
        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'btn-small';
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        pauseBtn.onclick = () => socket.emit('update-timer', { action: 'pause' });
        
        const resumeBtn = document.createElement('button');
        resumeBtn.className = 'btn-small';
        resumeBtn.innerHTML = '<i class="fas fa-play"></i>';
        resumeBtn.onclick = () => socket.emit('update-timer', { action: 'resume' });
        
        const adjustBtn = document.createElement('button');
        adjustBtn.className = 'btn-small';
        adjustBtn.innerHTML = '<i class="fas fa-clock"></i>';
        adjustBtn.onclick = () => {
            const newTime = prompt('Enter new time in seconds:');
            if (newTime && !isNaN(newTime)) {
                socket.emit('update-timer', { action: 'adjust', value: parseInt(newTime) });
            }
        };
        
        timerControls.appendChild(pauseBtn);
        timerControls.appendChild(resumeBtn);
        timerControls.appendChild(adjustBtn);
        
        const gameHeader = document.querySelector('.game-header');
        gameHeader.appendChild(timerControls);
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const currentPlayer = players.find(p => p.name === playerName);
    
    if (!currentPlayer) {
        console.error('Current player not found in players array', { playerName, players });
        showNotification('Error: Unable to send message. Please refresh the game.', 'error');
        return;
    }
    
    console.log('Sending message:', { senderId: currentPlayer.id, senderName: playerName, message });
    
    socket.emit('send-message', {
        senderId: currentPlayer.id,
        senderName: playerName,
        message,
        timestamp: new Date().toISOString()
    });
    
    messageInput.value = '';
}

function handleNewMessage(data) {
    console.log('Received message:', data);
    
    if (!data || !data.senderName || !data.message) {
        console.error('Invalid message data received:', data);
        return;
    }
    
    const { senderName, message, timestamp } = data;
    const currentPlayer = players.find(p => p.name === playerName);
    const isSentByMe = senderName === playerName;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSentByMe ? 'sent' : 'received'}`;
    
    const senderElement = document.createElement('div');
    senderElement.className = 'sender';
    senderElement.textContent = isSentByMe ? 'You' : senderName;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'content';
    contentElement.textContent = message;
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(contentElement);
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to disable voting UI for kicked players
function disableVotingUI() {
    // Disable all voting options
    document.querySelectorAll('.vote-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.5';
        opt.classList.add('disabled');
    });
    
    // Disable submit button
    if (submitVoteBtn) {
        submitVoteBtn.disabled = true;
        submitVoteBtn.style.opacity = '0.5';
        submitVoteBtn.style.cursor = 'not-allowed';
    }
    
    // Update the voting header with a single, clear message
    const votingHeader = document.querySelector('.voting-header');
    if (votingHeader) {
        votingHeader.classList.add('spectator-mode');
        votingHeader.innerHTML = '<h2>Vote for the Spy</h2>';
    }
    
    // Update the voting status bar style
    const votingStatusBar = document.getElementById('voting-status-bar');
    if (votingStatusBar) {
        votingStatusBar.classList.add('spectator-mode');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);

// Changelog functionality
document.addEventListener('DOMContentLoaded', function() {
    const changelogToggle = document.getElementById('changelog-toggle');
    const changelogContent = document.getElementById('changelog-content');
    const closeChangelog = document.querySelector('.close-changelog');

    changelogToggle.addEventListener('click', function() {
        changelogContent.classList.toggle('active');
    });

    closeChangelog.addEventListener('click', function() {
        changelogContent.classList.remove('active');
    });

    // Close changelog when clicking outside
    document.addEventListener('click', function(event) {
        if (!changelogContent.contains(event.target) && !changelogToggle.contains(event.target)) {
            changelogContent.classList.remove('active');
        }
    });
});