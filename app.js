// Game state variables
const isDevelopment = window.location.hostname === 'localhost';
const socketUrl = isDevelopment ? 'http://localhost:3000' : 'https://spydock.onrender.com';
let socket = io(socketUrl, {
  transports: ['websocket'],
  upgrade: false
});
let playerName = '';
let gameId = '';
let players = [];
let isHost = false;
let playerRole = '';
let gameWord = '';
let selectedVote = null;
let readyNotificationTimeout = null;

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
        readyPlayersBar.innerHTML = `<i class='fas fa-check-circle' style='color:#059669;margin-right:6px;'></i>Ready: ` +
            players.filter(p => readyPlayerIds.includes(p.id)).map(p => `<span style=\"background:#d1fae5;color:#059669;border-radius:999px;padding:2px 10px;margin:0 2px;\">👍 ${p.name}</span>`).join('');
    } else {
        readyPlayersBar.style.display = 'none';
    }
}

// Initialize the game
function initGame() {
    // Set up event listeners
    setupEventListeners();
    
    // Set up socket event handlers
    setupSocketHandlers();
}

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

// Set up socket event handlers
function setupSocketHandlers() {
    socket.on('game-created', handleGameCreated);
    socket.on('game-join-error', handleGameJoinError);
    socket.on('game-joined', handleGameJoined);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('settings-updated', handleSettingsUpdated);
    socket.on('game-started', handleGameStarted);
    socket.on('all-players-ready', handleAllPlayersReady);
    socket.on('new-message', handleNewMessage);
    socket.on('voting-results', handleVotingResults);
    socket.on('game-reset', handleGameReset);
    socket.on('player-left', handlePlayerLeft);
    socket.on('player-ready-notify', handlePlayerReadyNotify);
    socket.on('player-not-ready-notify', handlePlayerNotReadyNotify);
}

// Event handler functions
function createGame() {
    playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    
    isHost = true;
    socket.emit('create-game', { playerName });
}

function joinGame() {
    playerName = playerNameInput.value.trim();
    const gameCode = gameCodeInput.value.trim().toUpperCase();
    
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    
    if (!gameCode) {
        alert('Please enter a game code');
        return;
    }
    
    if (gameCode.length !== 4) {
        alert('Game code must be 4 characters long');
        return;
    }
    
    isHost = false;
    socket.emit('join-game', { playerName, gameId: gameCode });
}

function handleGameCreated(data) {
    gameId = data.gameId;
    players = data.players;
    
    // Update UI
    gameCodeDisplay.textContent = gameId;
    updatePlayersList();
    
    // Show lobby screen
    showScreen(lobbyScreen);
}

function handleGameJoinError(data) {
    alert(data.message);
    // Clear the game code input to allow retry
    gameCodeInput.value = '';
    gameCodeInput.focus();
}

function handleGameJoined(data) {
    gameId = data.gameId;
    players = data.players;
    
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
            alert('Failed to copy game code');
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
        alert('You need at least 3 players to start the game');
        return;
    }
    
    socket.emit('start-game');
}

function handleGameStarted(data) {
    // Assign role and word to current player
    const playerRoleData = data.roles.find(r => r.playerId === socket.id);
    if (playerRoleData) {
    playerRole = playerRoleData.role;
    gameWord = playerRoleData.word;
    
    // Update UI
    roleTypeDisplay.textContent = playerRole === 'spy' ? 'Spy' : 'Regular Player';
    wordDisplay.textContent = gameWord;
    
    // Show role screen
    showScreen(roleScreen);
    }
    
    // Start timer if discussion time is set
    if (data.discussionTime && data.discussionTime !== 'none') {
        startTimer(data.discussionTime * 60);
    }
}

function playerReady() {
    const currentPlayer = players.find(p => p.name === playerName);
    socket.emit('player-ready', { playerId: currentPlayer.id, name: playerName });
}

function handleAllPlayersReady() {
    // Start the game timer
    const discussionTime = parseInt(discussionTimeSelect.value);
    startTimer(discussionTime * 60); // Convert minutes to seconds
    
    // Show game screen
    showScreen(gameScreen);
}

function startTimer(seconds) {
    let remainingTime = seconds;
    
    function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateTimerDisplay();
    
    const timerInterval = setInterval(() => {
        remainingTime--;
        updateTimerDisplay();
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            // Time's up, move to voting
            showVotingScreen();
        }
    }, 1000);
}

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const currentPlayer = players.find(p => p.name === playerName);
    
    socket.emit('send-message', {
        senderId: currentPlayer.id,
        senderName: playerName,
        message,
        timestamp: new Date().toISOString()
    });
    
    messageInput.value = '';
}

function handleNewMessage(data) {
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

function showVotingScreen() {
    // Create voting options
    votingOptions.innerHTML = '';
    
    players.forEach(player => {
        // Don't allow voting for yourself
        if (player.name === playerName) return;
        
        const option = document.createElement('div');
        option.className = 'vote-option';
        option.dataset.playerId = player.id;
        option.textContent = player.name;
        
        option.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.vote-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            option.classList.add('selected');
            selectedVote = player.id;
        });
        
        votingOptions.appendChild(option);
    });
    
    showScreen(votingScreen);
}

function submitVote() {
    if (!selectedVote) {
        alert('Please select a player to vote for');
        return;
    }
    
    const currentPlayer = players.find(p => p.name === playerName);
    
    socket.emit('submit-vote', {
        playerId: currentPlayer.id,
        votedFor: selectedVote
    });
}

function handleVotingResults(data) {
    // Update results screen
    if (data.isSpy) {
        resultsContent.innerHTML = `
            <div class="result-message success">
                <i class="fas fa-check-circle"></i>
                <p>You caught the spy!</p>
            </div>
        `;
    } else {
        resultsContent.innerHTML = `
            <div class="result-message failure">
                <i class="fas fa-times-circle"></i>
                <p>${data.kickedPlayerName} was not the spy!</p>
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
}

function playAgain() {
    socket.emit('play-again');
}

function handleGameReset(data) {
    players = data.players;
    
    // Reset game state
    selectedVote = null;
    
    // Update UI
    updatePlayersList();
    chatMessages.innerHTML = '';
    
    // Show lobby screen
    showScreen(lobbyScreen);
    
    // Reset readyPlayerIds when game resets
    readyPlayerIds = [];
    updateReadyPlayersBar();
}

function handlePlayerLeft(data) {
    if (data && data.name) {
        alert(`${data.name} has left the game.`);
    }
    // The game continues for remaining players, just update the list
    updatePlayersList();
}

function handlePlayerReadyNotify(data) {
    if (data && data.playerId) {
        if (!readyPlayerIds.includes(data.playerId)) readyPlayerIds.push(data.playerId);
        updateReadyPlayersBar();
        showReadyNotification(data.name);
    }
}

function showReadyNotification(name) {
    const notif = document.createElement('span');
    notif.id = 'ready-notification';
    notif.style.background = '#d1fae5';
    notif.style.color = '#059669';
    notif.style.borderRadius = '999px';
    notif.style.padding = '2px 14px';
    notif.style.marginLeft = '16px';
    notif.style.fontWeight = 'bold';
    notif.style.fontSize = '1em';
    notif.style.transition = 'opacity 0.5s';
    notif.textContent = `${name} is ready!`;
    // Remove any previous notification
    const prev = document.getElementById('ready-notification');
    if (prev) prev.remove();
    onlinePlayersBar.appendChild(notif);
    if (readyNotificationTimeout) clearTimeout(readyNotificationTimeout);
    readyNotificationTimeout = setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 2500);
}

function playerNotReady() {
    const currentPlayer = players.find(p => p.name === playerName);
    socket.emit('player-not-ready', { playerId: currentPlayer.id, name: playerName });
}

function handlePlayerNotReadyNotify(data) {
    if (data && data.playerId) {
        readyPlayerIds = readyPlayerIds.filter(id => id !== data.playerId);
        updateReadyPlayersBar();
        showNotReadyNotification(data.name);
    }
}

function showNotReadyNotification(name) {
    const notif = document.createElement('span');
    notif.id = 'not-ready-notification';
    notif.style.background = '#fee2e2';
    notif.style.color = '#b91c1c';
    notif.style.borderRadius = '999px';
    notif.style.padding = '2px 14px';
    notif.style.marginLeft = '16px';
    notif.style.fontWeight = 'bold';
    notif.style.fontSize = '1em';
    notif.style.transition = 'opacity 0.5s';
    notif.textContent = `${name} is not ready!`;
    // Remove any previous notification
    const prev = document.getElementById('not-ready-notification');
    if (prev) prev.remove();
    onlinePlayersBar.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 2500);
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

// Initialize the game when the page loads
window.addEventListener('load', initGame);