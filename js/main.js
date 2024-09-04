// Função para carregar uma imagem e retornar uma Promise
const loadImage = async (url) => 
  new Promise((resolve, reject) => {
  const img = new Image();
  img.addEventListener("load", () => resolve(img));  // Quando a imagem é carregada, a promessa é resolvida com a imagem
  img.addEventListener("error", () => reject(new Error(`Falha ao carregar a imagem: ${url}`)));  // Se ocorrer um erro ao carregar a imagem, a promessa é rejeitada
  img.src = url;  // Define o caminho da imagem
  console.log('loading img: ' + url);  // Log para saber qual imagem está sendo carregada
});

// Variáveis globais
let CTX, CANVAS;  // Variáveis que armazenarão o contexto e o canvas
const FRAMES = 30;  // Taxa de quadros por segundo (FPS) do jogo
let playerImage, bgImage, bgPattern, candyImage, enemyImage;  // Variáveis para armazenar as imagens e o padrão de fundo
let totalSpritesX = 9;  // Número de sprites na horizontal (usado para animação)
let totalSpritesY = 1;  // Número de sprites na vertical (usado para animação)
let cellWidth, cellHeight;  // Largura e altura de cada sprite na imagem
let cellHeightC, cellWidthC; // Largura e altura de cada sprite do candy
let totalSpritesCX = 1;
let totalSpritesCY = 1;
let score = 0;  // Pontuação inicial do jogador
let gameover = false;  // Estado do jogo (se está em game over ou não)
let gameOverSound;
let themeMusic;
let totalSpritesIX = 8;  // Número de sprites na horizontal para o inimigo
let totalSpritesIY = 1;  // Número de sprites na vertical para o inimigo
let cellWidthI, cellHeightI; // Largura e altura de cada sprite do inimigo

// Classe Player

class Player {
  constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = 10;
      this.frameX = 0;
      this.keys = {};
  }

  draw() {
      CTX.drawImage(
          playerImage,
          this.frameX * cellWidth,
          0,
          cellWidth,
          cellHeight,
          this.x,
          this.y,
          this.width,
          this.height
      );
  }

  update() {
      this.handleInput();
      this.updateAnimation();
      this.checkCollision();
      this.keepWithinBounds(); // Garante que o jogador fique dentro dos limites
  }

  handleInput() {
      window.addEventListener('keydown', (e) => {
          this.keys[e.key] = true;
      });

      window.addEventListener('keyup', (e) => {
          this.keys[e.key] = false;
      });

      if (this.keys['ArrowUp']) this.y -= this.speed;
      if (this.keys['ArrowDown']) this.y += this.speed;
      if (this.keys['ArrowLeft']) this.x -= this.speed;
      if (this.keys['ArrowRight']) this.x += this.speed;
  }

  updateAnimation() {
    if (this.frameX < totalSpritesX - 1) {
      this.frameX++;
    } else {
      this.frameX = 0;
    }
  }

  checkCollision() {
    // Calcular o centro do jogador
    const playerCenterX = this.x + this.width / 2;
    const playerCenterY = this.y + this.height / 2;

    // Calcular a distância entre o centro do jogador e o centro do pirulito
    const distX = playerCenterX - game.candy.x;
    const distY = playerCenterY - game.candy.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    // Verificar se a distância é menor que a soma dos raios
    if (distance < this.width / 2) {
      // Colisão detectada, reposicionar o doce e incrementar a pontuação
      score++;
      game.candy.randomPosition(game.gameArea);
    }
  }

keepWithinBounds() {
  // Garantir que o jogador permaneça dentro dos limites da área do jogo
  if (this.x < game.gameArea.x) {
    this.x = game.gameArea.x;
  }
  if (this.x + this.width > game.gameArea.x + game.gameArea.width) {
    this.x = game.gameArea.x + game.gameArea.width - this.width;
  }
  if (this.y < game.gameArea.y) {
    this.y = game.gameArea.y;
  }
  if (this.y + this.height > game.gameArea.y + game.gameArea.height) {
    this.y = game.gameArea.y + game.gameArea.height - this.height;
  }
}
}

// Classe Candy 
class Candy {
  constructor(x, y, height, width) {
      this.x = x;  // Coordenada X do doce
      this.y = y;  // Coordenada Y do doce
      this.width = width;
      this.height = height;
      this.frameX = 0;
  }

  draw() {
    CTX.drawImage(
        candyImage, 
        this.frameX * cellWidthC,
        2,
        cellWidthC,
        cellHeightC,
        this.x,
        this.y,
        this.width,
        this.height
    );
}

  randomPosition(boundary) {
      // Define uma posição aleatória para o pirulito dentro dos limites fornecidos
      this.x = boundary.x + Math.random() * (boundary.width - this.width);
      this.y = boundary.y + Math.random() * (boundary.height - this.height);
  }
}

// Classe Enemy (Inimigo)
class Enemy {
  constructor(x, y, width, height, speed) {
    this.x = x; // Posição horizontal inicial
    this.y = y; // Posição vertical inicial
    this.width = width; // Largura da sprite do inimigo
    this.height = height; // Altura da sprite do inimigo
    this.speed = speed; // Velocidade do inimigo
    this.frameX = 0;
    this.directionX = Math.random() > 0.5 ? 1 : -1;
    this.directionY = Math.random() > 0.5 ? 1 : -1;
    this.changeDirectionTime = Math.random() * 2000 + 1000; // Tempo aleatório para mudar de direção
    this.lastDirectionChange = Date.now();

  }

  draw() {
    CTX.drawImage(
        enemyImage, 
        this.frameX * cellWidthI,
        0,
        cellWidthI,
        cellHeightI,
        this.x,
        this.y,
        this.width,
        this.height
    );
}

update() {
  // Atualiza a posição do inimigo
  this.x += this.speed * this.directionX;
  this.y += this.speed * this.directionY;

  // Verifica se o inimigo saiu dos limites da área do jogo e ajusta a direção
  if (this.x < game.gameArea.x) {
      this.x = game.gameArea.x; // Mantém o inimigo dentro da área
      this.directionX *= -1;
  }
  if (this.x + this.width > game.gameArea.x + game.gameArea.width) {
      this.x = game.gameArea.x + game.gameArea.width - this.width; // Mantém o inimigo dentro da área
      this.directionX *= -1;
  }
  if (this.y < game.gameArea.y) {
      this.y = game.gameArea.y; // Mantém o inimigo dentro da área
      this.directionY *= -1;
  }
  if (this.y + this.height > game.gameArea.y + game.gameArea.height) {
      this.y = game.gameArea.y + game.gameArea.height - this.height; // Mantém o inimigo dentro da área
      this.directionY *= -1;
  }


    // Atualiza a animação e verifica colisão
    this.checkCollision();
    this.handleMovement();
    this.updateAnimation();
  }

  handleMovement() {
    const now = Date.now();
    if (now - this.lastDirectionChange > this.changeDirectionTime) {
        this.directionX = Math.random() > 0.5 ? 1 : -1;
        this.directionY = Math.random() > 0.5 ? 1 : -1;
        this.changeDirectionTime = Math.random() * 2000 + 1000; // Redefine o tempo para mudar de direção
        this.lastDirectionChange = now;
    }
  }

  updateAnimation() {
    if (this.frameX < totalSpritesIX - 1) {
        this.frameX++;
    } else {
        this.frameX = 0;
    }
  }

    checkCollision() {
        if (
            this.x < game.player.x + game.player.width &&
            this.x + this.width > game.player.x &&
            this.y < game.player.y + game.player.height &&
            this.y + this.height > game.player.y
        ) {
            gameOver();
        }
    }
}

// Função gameOver
const gameOver = () => {
  gameover = true;
  if (gameOverSound) {
    gameOverSound.play();  // Toca o som de game over
  }
  if (themeMusic) {
    themeMusic.pause();  // Pausa a música tema
  }
  alert("Game Over!");
  window.location.reload(); // Reinicia o jogo ao perder
}

// Função para inicializar o jogo
const init = async () => {
  console.log("Initialize Canvas");
  CANVAS = document.getElementById('gameCanvas');  // Obtém o elemento canvas do HTML
  CTX = CANVAS.getContext('2d');  // Obtém o contexto de renderização 2D

  // Define a área do jogo
  game.gameArea = {
      x: CANVAS.width * 0.1,  // 10% da largura do canvas
      y: CANVAS.height * 0.1,  // 10% da altura do canvas
      width: CANVAS.width * 0.8,  // 80% da largura do canvas
      height: CANVAS.height * 0.8  // 80% da altura do canvas
  };

  // Carregar imagens e padrões
  try {
      playerImage = await loadImage('img/lindinha1.png');  // Carrega a imagem do jogador
      bgImage = await loadImage('img/fundo.jpg');  // Carrega a imagem de fundo
      enemyImage = await loadImage('img/ele.png'); // Carrega a imagem do inimigo
      candyImage = await loadImage('img/doces.png'); // Carrega a imagem do doce
      bgPattern = CTX.createPattern(bgImage, 'repeat');  // Cria um padrão repetido para o fundo

      
      // Calcula as dimensões dos sprites
      cellWidth = playerImage.naturalWidth / totalSpritesX;  // Largura do sprite do jogador
      cellHeight = playerImage.naturalHeight / totalSpritesY;  // Altura do sprite do jogador
      cellWidthI = enemyImage.naturalWidth / totalSpritesIX;  // Largura do sprite do inimigo
      cellHeightI = enemyImage.naturalHeight / totalSpritesIY;  // Altura do sprite do inimigo
      cellHeightC = candyImage.naturalHeight / totalSpritesCY;
      cellWidthC = candyImage.naturalWidth / totalSpritesCX;
        

    // Carregar os áudios
    themeMusic = await loadAudio('sounds/theme.mp3');  // Carrega a música tema
    gameOverSound = await loadAudio('sounds/gameover.mp3');  // Carrega o som de game over

      // Inicializa o jogador, o doce e o inimigo
      game.player = new Player(CANVAS.width / 2, CANVAS.height / 2, 70, 70);  // Cria uma nova instância do jogador no centro do canvas
      game.candy = new Candy(10, 10, cellWidthC / 10, cellHeightC / 10);  // Cria uma nova instância do pirulito com um raio de 15 pixels
      game.candy.randomPosition(game.gameArea);  // Define uma posição aleatória para o pirulito dentro da área do jogo
      game.enemy = new Enemy(CANVAS.width + 100, Math.random() * (CANVAS.height - 50), 100, 100, 10);

          // Toca a música tema em loop
    if (themeMusic) {
      themeMusic.loop = true;  // Define para tocar em loop
      themeMusic.play();  // Inicia a música tema
    }   
      loop();  // Inicia o loop do jogo
  } catch (e) {
      console.error(`Assets Error: ${e.message}`);  // Se ocorrer um erro ao carregar as imagens, ele é registrado no console
  }
}

// Função para o loop principal do jogo
const loop = () => {
  setTimeout(() => {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height); // Limpa o canvas
    CTX.fillStyle = bgPattern; // Define o padrão de fundo
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height); // Preenche o canvas com o padrão de fundo

    if (!gameStarted) {
      drawStartMessage(); // Desenha a mensagem de início se o jogo não começou
      return;
    }

    // Desenhar o contorno da área do jogo
    CTX.strokeStyle = 'white'; // Define a cor do contorno
    CTX.lineWidth = 2; // Define a largura da linha
    CTX.strokeRect(game.gameArea.x, game.gameArea.y, game.gameArea.width, game.gameArea.height); // Desenha o contorno

    game.player.update(); // Atualiza o estado do jogador
    game.player.draw(); // Desenha o jogador
    game.candy.draw(); // Desenha o pirulito
    drawScore(); // Desenha a pontuação
    drawTitle(); // Desenha o título
    game.enemy.update(); // Atualiza e desenha o inimigo
    game.enemy.draw();

    requestAnimationFrame(loop); // Chama o loop novamente para o próximo frame
  }, 1000 / FRAMES); // Taxa de quadros (FPS)
};

let gameStarted = false;

//Função para desenhar mensagem de inicio
const drawStartMessage = () => {
  CTX.font = '40px Powerpuff'; // Define a fonte
  CTX.fillStyle = 'deeppink'; // Define a cor do texto
  CTX.textAlign = 'center'; // Alinha o texto ao centro
  CTX.fillText('Pressione qualquer tecla para começar', CANVAS.width / 2, CANVAS.height / 2); // Mensagem centralizada
}; 

// Função para iniciar o jogo
const startGame = () => {
  gameStarted = true;
  loop(); // Inicia o loop do jogo
  window.removeEventListener('keydown', startGame); // Remove o listener após o jogo começar
};

// Função para desenhar a pontuação
const drawScore = () => {
  CTX.font = '30px Powerpuff';  // Define a fonte
  CTX.fillStyle = 'white';  // Define a cor do texto
  CTX.textAlign = 'right';  // Alinha o texto à direita
  CTX.textBaseLine = 'top'; //Define o alinhamento vertical do texto
  CTX.fillText(`Pontos: ${score}`, CANVAS.width - 20, CANVAS.height - 20);  // Desenha a pontuação no canto inferior direito
}

// Função para desenhar o título
const drawTitle = () => {
  CTX.font = '40px Powerpuff';  // Define a fonte
  CTX.fillStyle = 'deeppink';  // Define a cor do texto
  CTX.textAlign = 'center';  // Alinha o texto ao centro
  CTX.fillText('Powerpuff Girls', CANVAS.width / 2, 50);  // Desenha o título no topo do canvas
}

// Função para carregar um áudio e retornar uma Promise
const loadAudio = (url) => 
  new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.addEventListener('canplaythrough', () => resolve(audio));
    audio.addEventListener('error', () => reject(new Error(`Falha ao carregar o áudio: ${url}`)));
  });

// Instância do jogo
const game = {
  gameArea: null,  // Área de jogo (definida em `init`)
  player: null,  // Instância do jogador (definida em `init`)
  candy: null,  // Instância do doce (definida em `init`)
}

// Configura o jogo quando a página for carregada
window.addEventListener('load', () => {
  init(); // Inicializa o jogo
  window.addEventListener('keydown', startGame); // Adiciona um listener para começar o jogo quando uma tecla for pressionada
});