import '../css/style.css'; // Certifique-se de que o caminho está correto

// Obtém o canvas e o contexto de desenho
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Carregar imagens
const background = new Image();
background.src = 'img/fundo.jpg';

const lindinha = new Image();
lindinha.src = 'img/lindinha.png';

// Definição do quadrado central
const square = {
    x: canvas.width / 4,
    y: canvas.height / 4,
    width: canvas.width / 2,
    height: canvas.height / 2
};

// Definição do personagem
const player = {
    x: square.x + square.width / 2 - 25, // Centraliza o personagem no quadrado
    y: square.y + square.height / 2 - 36, // Centraliza o personagem no quadrado
    width: 60,
    height: 69,
    frameX: 0,
    frameY: 0,
    speed: 5,
    moving: false
};

// Definição do pirulito como círculo rosa
const candy = {
    x: 0,
    y: 0,
    radius: 15, // Raio do círculo
};

// Gera uma nova posição aleatória para o pirulito dentro do quadrado central
function randomPosition() {
    const x = square.x + Math.random() * (square.width - candy.radius * 2);
    const y = square.y + Math.random() * (square.height - candy.radius * 2);
    return { x, y };
}

// Desenha o pirulito como um círculo rosa
function drawCandy() {
    ctx.beginPath();
    ctx.arc(candy.x + candy.radius, candy.y + candy.radius, candy.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'pink'; // Cor rosa para o círculo
    ctx.fill();
    ctx.closePath();
}

let score = 0;

// Desenha o personagem
function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

// Anima o personagem
function animatePlayer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Ajusta o fundo para cobrir todo o canvas
    drawText();
    drawSquare();
    drawSprite(lindinha, player.frameX * player.width, player.frameY * player.height, player.width, player.height, player.x, player.y, player.width, player.height);
    drawCandy(); // Desenha o pirulito
    checkCollision(); // Verifica colisão
    requestAnimationFrame(animatePlayer);
}

// Desenha o quadrado central com fundo branco e transparência
function drawSquare() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Branco com 70% de opacidade
    ctx.fillRect(square.x, square.y, square.width, square.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // Borda branca com 70% de opacidade
    ctx.lineWidth = 4;
    ctx.strokeRect(square.x, square.y, square.width, square.height);
}

// Desenha o texto
function drawText() {
    ctx.font = '30px Powerpuff';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Power Puff Girls', canvas.width / 2, 50);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height - 30);
}

// Atualiza a função checkCollision para mover o pirulito para uma nova posição aleatória
function checkCollision() {
    const dx = player.x + player.width / 2 - (candy.x + candy.radius);
    const dy = player.y + player.height / 2 - (candy.y + candy.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < candy.radius + player.width / 2) {
        // Colidiu
        score += 1;
        // Move o pirulito para uma nova posição aleatória dentro do quadrado central
        const newPosition = randomPosition();
        candy.x = newPosition.x;
        candy.y = newPosition.y;
    }
}

// Controle do personagem
window.addEventListener('keydown', function(e) {
    player.moving = true;
    if (e.key === 'ArrowUp' && player.y > square.y) {
        player.y -= player.speed;
    }
    if (e.key === 'ArrowDown' && player.y + player.height < square.y + square.height) {
        player.y += player.speed;
    }
    if (e.key === 'ArrowLeft' && player.x > square.x) {
        player.x -= player.speed;
        player.frameX += 1;
        if (player.frameX > 9)
            player.frameX = 0;
    }
    if (e.key === 'ArrowRight' && player.x + player.width < square.x + square.width) {
        player.x += player.speed;
        player.frameX += 1;
        if (player.frameX > 9)
            player.frameX = 0;
    }
});

window.addEventListener('keyup', function(e) {
    player.moving = false;
});

// Iniciar animação após o carregamento da imagem de fundo
background.onload = function() {
    // Inicializa a posição do pirulito para garantir que esteja dentro dos limites do quadrado central
    const initialPosition = randomPosition();
    candy.x = initialPosition.x;
    candy.y = initialPosition.y;
    
    animatePlayer();
};
