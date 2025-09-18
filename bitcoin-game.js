// Y3JlYXRlZCBieSBKb2pvSnViYWggMjAyNQ==
// Bitcoin Runner Game - Portfolio Integration Version
// Simplified version without Firebase for inline canvas integration

(function() {
    // Game Canvas and Context
    const canvas = document.getElementById('bitcoinGameCanvas');
    if (!canvas) return; // Exit if canvas not found

    const ctx = canvas.getContext('2d');

    // Canvas sizing for portfolio integration
    let canvasWidth = 400;  // Fixed width for portfolio card
    let canvasHeight = 300; // Fixed height for portfolio card

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Game Variables
    const groundHeight = canvasHeight - 50;
    const player = {
        x: 50,
        y: groundHeight - 20,
        width: 20,
        height: 20,
        dy: 0,
        jump: -12,
        gravity: 0.5,
        jumpsLeft: 2,
    };

    let obstacles = [];
    let coins = [];
    let fragments = [];
    let floatingTexts = [];
    let score = 0;
    let level = 1;
    let topScore = parseInt(localStorage.getItem('bitcoinRunnerTopScore')) || 0;
    let isGameOver = false;
    let gameOverShown = false;
    let speed = 3;
    let gameStarted = false;
    let frameCount = 0;
    let paused = false;

    let groundOffset = 0;
    const coinSymbols = ['£', '₿', '€'];

    // Player Skins System
    const playerSkins = [
        { name: "Blue Circle", draw: (x, y, size) => {
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(x, y, size/2, 0, Math.PI*2);
            ctx.fill();
        }},
        { name: "Red Square", draw: (x, y, size) => {
            ctx.fillStyle = "red";
            ctx.fillRect(x-size/2, y-size/2, size, size);
        }},
        { name: "Neon Triangle", draw: (x, y, size) => {
            ctx.fillStyle = "lime";
            ctx.beginPath();
            ctx.moveTo(x, y - size/2);
            ctx.lineTo(x - size/2, y + size/2);
            ctx.lineTo(x + size/2, y + size/2);
            ctx.closePath();
            ctx.fill();
        }},
        { name: "Golden Circle", draw: (x, y, size) => {
            ctx.fillStyle = "gold";
            ctx.shadowBlur = 10;
            ctx.shadowColor = "gold";
            ctx.beginPath();
            ctx.arc(x, y, size/2, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
        }}
    ];
    let selectedSkin = 0;

    // Simple sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playCoinSound() {
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Silently fail if audio context issues
        }
    }

    // Background stars
    function makeStars(count, speed, color) {
        return Array.from({ length: count }, () => ({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: Math.random() * 2 + 1,
            speed: speed,
            color: color
        }));
    }

    const farStars = makeStars(20, 0.2, '#888');
    const midStars = makeStars(15, 0.5, '#bbb');
    const nearStars = makeStars(10, 1.0, '#fff');

    // Draw Background
    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#0f0f5e');
        gradient.addColorStop(1, '#01012c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        [farStars, midStars, nearStars].forEach(stars => {
            stars.forEach(star => {
                ctx.fillStyle = star.color;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                star.x -= star.speed;
                if (star.x < 0) star.x = canvasWidth;
            });
        });
    }

    // Draw Ground
    function drawGround() {
        groundOffset -= speed;
        if (groundOffset <= -canvasWidth) groundOffset = 0;

        ctx.fillStyle = '#444';
        for (let i = 0; i <= 1; i++) {
            ctx.fillRect(groundOffset + i * canvasWidth, groundHeight, canvasWidth, canvasHeight - groundHeight);
        }
    }

    // Draw Player
    function drawPlayer() {
        const centerX = player.x + player.width/2;
        const centerY = player.y + player.height/2;

        // Shadow
        const isOnGround = player.y >= groundHeight - player.height;
        if (isOnGround) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 15, 15, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Use selected skin
        playerSkins[selectedSkin].draw(centerX, centerY, player.width);
    }

    // Handle Player Movement
    function handlePlayerMovement() {
        player.y += player.dy;
        player.dy += player.gravity;
        if (player.y > groundHeight - player.height) {
            player.y = groundHeight - player.height;
            player.dy = 0;
            player.jumpsLeft = 2;
        }
    }

    // Handle Obstacles
    function handleObstacles() {
        if (Math.random() < 0.015) {
            const height = Math.random() * 30 + 20;
            obstacles.push({ x: canvas.width, y: groundHeight - height, width: 20, height });
        }

        obstacles = obstacles.filter((obstacle) => {
            ctx.fillStyle = '#ff3300';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            obstacle.x -= speed;

            // Collision detection
            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                isGameOver = true;
            }

            return obstacle.x + obstacle.width > 0;
        });
    }

    // Handle Coins
    function handleCoins() {
        if (Math.random() < 0.015) {
            coins.push({
                x: canvas.width,
                y: Math.random() * (groundHeight - 100) + 50,
                symbol: coinSymbols[Math.floor(Math.random() * coinSymbols.length)],
                size: 15,
            });
        }

        coins = coins.filter((coin) => {
            const centerX = coin.x + 7.5;
            const centerY = coin.y + 7.5;
            const radius = 7.5;

            // Draw coin
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw symbol
            ctx.fillStyle = 'black';
            ctx.font = 'bold 10px Arial';
            const textWidth = ctx.measureText(coin.symbol).width;
            ctx.fillText(coin.symbol, centerX - textWidth / 2, centerY + 3);

            coin.x -= speed;

            // Collect coin
            if (
                player.x < coin.x + coin.size &&
                player.x + player.width > coin.x &&
                player.y < coin.y + coin.size &&
                player.y + player.height > coin.y
            ) {
                playCoinSound();
                score++;

                // Add floating +1 effect
                floatingTexts.push({
                    x: coin.x,
                    y: coin.y,
                    text: "+1",
                    life: 40
                });

                // Update top score
                if (score > topScore) {
                    topScore = score;
                    localStorage.setItem('bitcoinRunnerTopScore', topScore);
                }

                // Level up
                if (score % 8 === 0) {
                    level++;
                    speed += 0.3;
                }

                return false;
            }

            return true;
        });
    }

    // Draw Floating Texts
    function drawFloatingTexts() {
        floatingTexts = floatingTexts.filter((t) => {
            ctx.fillStyle = "white";
            ctx.font = "bold 12px Arial";
            ctx.globalAlpha = t.life / 40;
            ctx.fillText(t.text, t.x, t.y);
            ctx.globalAlpha = 1;
            t.y -= 0.5;
            t.life--;
            return t.life > 0;
        });
    }

    // Draw Score and Level
    function drawScoreAndLevel() {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Score: ${score}`, 10, 25);
        ctx.fillText(`Level: ${level}`, canvas.width - 80, 25);
    }

    // Game Loop
    function gameLoop() {
        if (paused) return;

        if (isGameOver) {
            if (!gameOverShown) {
                gameOverShown = true;
                showGameOverOverlay();
            }
            return;
        }

        if (!gameStarted) return;

        frameCount++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();
        drawGround();
        drawPlayer();
        handlePlayerMovement();
        handleObstacles();
        handleCoins();
        drawFloatingTexts();
        drawScoreAndLevel();

        requestAnimationFrame(gameLoop);
    }

    // Game Control Functions
    function restartGame() {
        score = 0;
        level = 1;
        obstacles = [];
        coins = [];
        fragments = [];
        floatingTexts = [];
        speed = 3;
        isGameOver = false;
        gameOverShown = false;
        frameCount = 0;
        gameStarted = true;
        player.y = groundHeight - player.height;
        player.dy = 0;
        player.jumpsLeft = 2;

        gameLoop();
    }

    function showGameOverOverlay() {
        const overlay = document.getElementById('bitcoinMenuOverlay');
        overlay.innerHTML = `
            <h4 style="color:#ff6b6b;">💥 Game Over!</h4>
            <p style="font-size: 1.2rem; margin-bottom: 10px;">Score: <strong style="color: #ffd700;">${score}</strong></p>
            ${topScore > 0 ? `<p style="font-size: 0.9rem; margin-bottom: 15px;">High Score: ${topScore}</p>` : ''}
            <button onclick="playBitcoinAgain()">🎮 Play Again</button>
            <button onclick="backToBitcoinMenu()">🏠 Menu</button>
        `;
        overlay.style.display = 'block';
        document.getElementById('bitcoinPauseButton').style.display = 'none';
    }

    // Global Functions
    window.startBitcoinGame = function() {
        try {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } catch (e) {
            // Ignore audio context issues
        }

        document.getElementById("bitcoinMenuOverlay").style.display = "none";
        document.getElementById("bitcoinPauseButton").style.display = "flex";
        gameStarted = true;
        paused = false;
        restartGame();
    };

    window.changeBitcoinSkin = function() {
        selectedSkin = (selectedSkin + 1) % playerSkins.length;
        // Simple notification
        console.log(`Bitcoin Runner - Skin changed to: ${playerSkins[selectedSkin].name}`);
    };

    window.openBitcoinPauseMenu = function() {
        if (!gameStarted) return;

        paused = true;
        const overlay = document.getElementById('bitcoinMenuOverlay');
        overlay.innerHTML = `
            <h4>₿itcoin Runner - Paused</h4>
            <button onclick="resumeBitcoinGame()">▶️ Resume</button>
            <button onclick="backToBitcoinMenu()">🏠 Menu</button>
        `;
        overlay.style.display = 'block';
        document.getElementById("bitcoinPauseButton").style.display = "none";
    };

    window.resumeBitcoinGame = function() {
        paused = false;
        document.getElementById("bitcoinMenuOverlay").style.display = "none";
        document.getElementById("bitcoinPauseButton").style.display = "flex";
        gameLoop();
    };

    window.playBitcoinAgain = function() {
        document.getElementById("bitcoinMenuOverlay").style.display = "none";
        document.getElementById("bitcoinPauseButton").style.display = "flex";
        restartGame();
    };

    window.backToBitcoinMenu = function() {
        const overlay = document.getElementById('bitcoinMenuOverlay');
        overlay.innerHTML = `
            <h4>₿itcoin Runner</h4>
            <button onclick="startBitcoinGame()">🎮 Play</button>
            <button onclick="changeBitcoinSkin()">🎨 Change Skin</button>
        `;
        overlay.style.display = 'block';
        document.getElementById("bitcoinPauseButton").style.display = "none";
        isGameOver = false;
        gameStarted = false;
        paused = false;
    };

    // Input Handling
    function handleGameInput() {
        if (paused) {
            resumeBitcoinGame();
            return;
        }

        if (!gameStarted || isGameOver) return;

        if (player.jumpsLeft > 0) {
            player.dy = player.jump;
            player.jumpsLeft--;
        }
    }

    // Game-specific input listeners
    canvas.addEventListener('click', function(e) {
        e.stopPropagation();
        handleGameInput();
    });

    // Keyboard input for this game only
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && canvas.getBoundingClientRect().width > 0) {
            e.preventDefault();
            handleGameInput();
        }
    });

    // Initialize game
    gameLoop();
})();