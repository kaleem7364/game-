// تهيئة اللعبة
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

// الأصوات (سيتم إنشاؤها برمجياً)
const sounds = {
    jump: new Audio(),
    coin: new Audio(),
    trap: new Audio(),
    speed: new Audio()
};

// إعدادات اللعبة
const config = {
    gravity: 0.5,
    initialSpeed: 3,
    maxSpeed: 8,
    playerWidth: 40,
    playerHeight: 60
};

// اللاعبون
const players = [
    {
        x: 100,
        y: 400,
        color: '#CE1126', // أحمر
        speed: 0,
        isJumping: false,
        velocityY: 0,
        score: 0,
        effects: {
            speedBoost: 0,
            slowDown: 0
        },
        controls: {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: 'Space'
        }
    },
    {
        x: 200,
        y: 400,
        color: '#007A36', // أخضر
        speed: 0,
        isJumping: false,
        velocityY: 0,
        score: 0,
        effects: {
            speedBoost: 0,
            slowDown: 0
        },
        controls: {
            left: 'KeyA',
            right: 'KeyD',
            jump: 'KeyW'
        }
    }
];

// العناصر التفاعلية
const items = {
    traps: [],
    speedBoosts: [],
    coins: []
};

// متغيرات اللعبة
let gameSpeed = config.initialSpeed;
let lastItemTime = 0;
let gameRunning = true;

// العناصر الفلسطينية
const palestinianElements = {
    background: [
        { type: 'mosque', x: 600, y: 150, width: 80, height: 100 },
        { type: 'olive', x: 300, y: 180, width: 30, height: 40 }
    ],
    coins: [
        { type: 'key', color: '#FFD700' }, // مفتاح العودة
        { type: 'stone', color: '#888' } // حجر المقاومة
    ]
};

// الرسم الأساسي
function drawBackground() {
    // السماء ليلاً
    ctx.fillStyle = '#001529';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // النجوم
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * 300;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
    
    // الأرض
    const groundHeight = 100;
    ctx.fillStyle = '#007A36'; // أخضر
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    
    // الخطوط البيضاء والسوداء (العلم)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, 10);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, canvas.height - groundHeight + 10, canvas.width, 10);
    ctx.fillStyle = '#CE1126';
    ctx.fillRect(0, canvas.height - groundHeight + 20, canvas.width, 10);
    
    // العناصر الفلسطينية
    palestinianElements.background.forEach(element => {
        if (element.type === 'mosque') {
            // رسم مسجد مبسط
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(element.x, element.y + element.height);
            ctx.lineTo(element.x + element.width/2, element.y);
            ctx.lineTo(element.x + element.width, element.y + element.height);
            ctx.closePath();
            ctx.fill();
        } else if (element.type === 'olive') {
            // شجرة زيتون
            ctx.fillStyle = '#5A7247';
            ctx.fillRect(element.x + 12, element.y + 20, 6, 20);
            ctx.fillStyle = '#007A36';
            ctx.beginPath();
            ctx.arc(element.x, element.y, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawPlayers() {
    players.forEach((player, index) => {
        // الجسم
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, config.playerWidth, config.playerHeight);
        
        // الرأس مع الكوفية
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(player.x + config.playerWidth/2, player.y - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // العلم على الصدر
        const flagWidth = 20;
        const flagHeight = 15;
        ctx.fillStyle = '#007A36';
        ctx.fillRect(player.x + 10, player.y + 15, flagWidth, flagHeight/3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(player.x + 10, player.y + 15 + flagHeight/3, flagWidth, flagHeight/3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(player.x + 10, player.y + 15 + 2*flagHeight/3, flagWidth, flagHeight/3);
        ctx.fillStyle = '#CE1126';
        ctx.beginPath();
        ctx.moveTo(player.x + 10, player.y + 15);
        ctx.lineTo(player.x + 10, player.y + 15 + flagHeight);
        ctx.lineTo(player.x + 10 + flagWidth/2, player.y + 15 + flagHeight/2);
        ctx.closePath();
        ctx.fill();
        
        // تأثيرات اللاعب
        if (player.effects.speedBoost > 0) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(player.x - 5, player.y - 5, config.playerWidth + 10, config.playerHeight + 10);
        }
        if (player.effects.slowDown > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(player.x - 5, player.y - 5, config.playerWidth + 10, config.playerHeight + 10);
        }
    });
}

function drawItems() {
    // الفخاخ (تبطئ الخصم)
    ctx.fillStyle = '#FF0000';
    items.traps.forEach(trap => {
        ctx.beginPath();
        ctx.arc(trap.x, trap.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('⏱️', trap.x - 8, trap.y + 8);
    });
    
    // أقواس السرعة
    ctx.fillStyle = '#00FFFF';
    items.speedBoosts.forEach(boost => {
        ctx.beginPath();
        ctx.arc(boost.x, boost.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('⚡', boost.x - 8, boost.y + 8);
    });
    
    // العملات الفلسطينية
    items.coins.forEach(coin => {
        if (coin.type === 'key') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(coin.x, coin.y);
            ctx.lineTo(coin.x + 10, coin.y + 5);
            ctx.lineTo(coin.x + 5, coin.y + 10);
            ctx.lineTo(coin.x, coin.y + 5);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// إنشاء العناصر التفاعلية
function generateItems() {
    const now = Date.now();
    if (now - lastItemTime > 2000) { // كل ثانيتين
        const itemType = Math.floor(Math.random() * 3);
        const yPos = 350 + Math.random() * 50;
        
        switch(itemType) {
            case 0: // فخ
                items.traps.push({
                    x: canvas.width + 100,
                    y: yPos,
                    width: 30,
                    height: 30
                });
                break;
            case 1: // قوس سرعة
                items.speedBoosts.push({
                    x: canvas.width + 100,
                    y: yPos,
                    width: 30,
                    height: 30
                });
                break;
            case 2: // عملة
                const coinType = Math.floor(Math.random() * palestinianElements.coins.length);
                items.coins.push({
                    x: canvas.width + 100,
                    y: yPos,
                    type: palestinianElements.coins[coinType].type,
                    color: palestinianElements.coins[coinType].color
                });
                break;
        }
        
        lastItemTime = now;
    }
}

// تحديث اللعبة
function update() {
    if (!gameRunning) return;
    
    // مسح الشاشة
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الخلفية
    drawBackground();
    
    // توليد العناصر
    generateItems();
    
    // تحديث اللاعبين
    players.forEach(player => {
        // الجاذبية
        player.velocityY += config.gravity;
        player.y += player.velocityY;
        
        // التأكد من أن اللاعب لا يغادر الأرض
        if (player.y > 400) {
            player.y = 400;
            player.velocityY = 0;
            player.isJumping = false;
        }
        
        // تحديث التأثيرات
        if (player.effects.speedBoost > 0) {
            player.effects.speedBoost--;
            player.speed = gameSpeed + 2;
        } else if (player.effects.slowDown > 0) {
            player.effects.slowDown--;
            player.speed = gameSpeed - 1;
        } else {
            player.speed = gameSpeed;
        }
        
        // حركة اللاعب
        player.x += player.speed;
    });
    
    // تحديث العناصر
    items.traps.forEach(trap => trap.x -= gameSpeed);
    items.speedBoosts.forEach(boost => boost.x -= gameSpeed);
    items.coins.forEach(coin => coin.x -= gameSpeed);
    
    // الكشف عن التصادمات
    checkCollisions();
    
    // رسم العناصر
    drawItems();
    drawPlayers();
    
    // زيادة صعوبة اللعبة مع الوقت
    if (gameSpeed < config.maxSpeed) {
        gameSpeed += 0.001;
    }
    
    // تحديث النقاط
    document.getElementById('score1').textContent = players[0].score;
    document.getElementById('score2').textContent = players[1].score;
    
    requestAnimationFrame(update);
}

// الكشف عن التصادمات
function checkCollisions() {
    players.forEach((player, playerIndex) => {
        // مع الفخاخ
        items.traps.forEach((trap, index) => {
            if (isColliding(player, trap)) {
                // تطبيق تأثير التباطؤ على الخصم
                const opponentIndex = playerIndex === 0 ? 1 : 0;
                players[opponentIndex].effects.slowDown = 100; // 100 إطار (حوالي 3 ثواني)
                items.traps.splice(index, 1);
                playSound('trap');
            }
        });
        
        // مع أقواس السرعة
        items.speedBoosts.forEach((boost, index) => {
            if (isColliding(player, boost)) {
                player.effects.speedBoost = 100; // 100 إطار (حوالي 3 ثواني)
                items.speedBoosts.splice(index, 1);
                playSound('speed');
            }
        });
        
        // مع العملات
        items.coins.forEach((coin, index) => {
            if (isColliding(player, coin)) {
                player.score += 10;
                items.coins.splice(index, 1);
                playSound('coin');
            }
        });
    });
}

// دالة الكشف عن التصادم
function isColliding(player, item) {
    return player.x < item.x + (item.width || 15) &&
           player.x + config.playerWidth > item.x &&
           player.y < item.y + (item.height || 15) &&
           player.y + config.playerHeight > item.y;
}

// تشغيل الأصوات
function playSound(type) {
    // في الواقع، يجب استبدال هذا بأصوات حقيقية
    // لكننا سنستخدم نغمة بسيطة لأغراض التوضيح
    try {
        sounds[type].play();
    } catch(e) {
        console.log("لا يمكن تشغيل الصوت:", e);
    }
}

// التحكم باللوحة المفاتيح
document.addEventListener('keydown', (e) => {
    players.forEach(player => {
        if (e.code === player.controls.jump && !player.isJumping) {
            player.velocityY = -12;
            player.isJumping = true;
            playSound('jump');
        }
        
        if (e.code === player.controls.left) {
            player.x = Math.max(50, player.x - 20);
        }
        
        if (e.code === player.controls.right) {
            player.x = Math.min(canvas.width - 50, player.x + 20);
        }
    });
});

// بدء اللعبة
update();
