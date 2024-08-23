// Função para carregar uma imagem e retornar uma Promise
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image(); // Cria um novo objeto Image
    img.onload = () => resolve(img); // Resolve a Promise com a imagem carregada
    img.onerror = () => reject(new Error(`Falha ao carregar a imagem: ${src}`)); // Rejeita a Promise em caso de erro
    img.src = src; // Define a URL da imagem
  });
}

// Função para carregar uma fonte e retornar uma Promise
export function loadFont(name, url) {
  return new FontFace(name, `url(${url})`).load(); // Cria um FontFace e carrega a fonte
}

// Classe que representa o jogador
export class Player {
  constructor(x, y, width, height, image, totalFramesX) {
    this.x = x; // Posição x do jogador
    this.y = y; // Posição y do jogador
    this.width = width; // Largura do jogador
    this.height = height; // Altura do jogador
    this.image = image; // Imagem do jogador
    this.speed = 5; // Velocidade de movimento do jogador
    this.frameX = 0; // Coordenada x do quadro atual da animação
    this.frameY = 0; // Coordenada y do quadro atual da animação
    this.frameCount = totalFramesX; // total de quadros na linah de sprites
    this.framTimer = 0; // Temporizador para controlar a troca de quadros
    this.frameSpeed = 10; // Velocidade de troca de quadros (menor = mais rápido)
    this.keys = {}; // Objeto para armazenar as teclas pressionadas
  }

 // Método para desenhar o jogador no canvas
 draw(ctx) {
  ctx.drawImage(
    this.image,
    this.frameX * this.width, // Coordenada x do quadro atual
    this.frameY * this.height, // Coordenada y do quadro atual
    this.width,
    this.height,
    this.x,
    this.y,
    this.width,
    this.height
  );
}

 // Método para atualizar a posição do jogador com base nas teclas pressionadas
 update() {
  this.updateAnimation();

  if (this.keys['ArrowUp']) this.y -= this.speed; // Move para cima
  if (this.keys['ArrowDown']) this.y += this.speed; // Move para baixo
  if (this.keys['ArrowLeft']) this.x -= this.speed; // Move para a esquerda
  if (this.keys['ArrowRight']) this.x += this.speed; // Move para a direita
}


// Método para atualizar a animação do jogador
updateAnimation() {
  this.frameTimer++;
  if (this.frameTimer >= this.frameSpeed) {
    this.frameX = (this.frameX + 1) % this.frameCount; // Avança para o próximo quadro
    this.frameTimer = 0; // Reseta o temporizador
  }
}

  // Método para lidar com a entrada do teclado
  handleInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true; // Marca a tecla como pressionada
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false; // Marca a tecla como não pressionada
    });
  }
}

// Classe que representa o pirulito
export class Candy {
  constructor(x, y, radius, color = 'pink') {
    this.x = x; // Posição x do pirulito
    this.y = y; // Posição y do pirulito
    this.radius = radius; // Raio do pirulito
    this.color = color; // Cor do pirulito
  }

// Método para desenhar o pirulito no canvas
draw(ctx) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Desenha um círculo
  ctx.fillStyle = this.color; // Define a cor do círculo
  ctx.fill(); // Preenche o círculo com a cor
  ctx.closePath();
}

  // Método para definir uma posição aleatória para o pirulito dentro dos limites fornecidos
  randomPosition(boundary) {
    this.x = boundary.x + Math.random() * (boundary.width - this.radius * 2) + this.radius;
    this.y = boundary.y + Math.random() * (boundary.height - this.radius * 2) + this.radius;
  }
}

// Classe que representa o jogo
export class Game {
  constructor(canvas, context) {
    this.canvas = canvas; // Elemento canvas onde o jogo será desenhado
    this.ctx = context; // Contexto de renderização do canvas
    this.width = canvas.width; // Largura do canvas
    this.height = canvas.height; // Altura do canvas
    this.background = null; // Imagem de fundo do jogo
    this.player = null; // Instância do jogador
    this.candy = null; // Instância do pirulito
    this.score = 0; // Pontuação do jogo
    this.collisionSound = new Audio('sounds/captura.mp3'); // Som de colisão
    this.gameArea = {
      x: this.width * 0.1, // Posição x da área de jogo
      y: this.height * 0.1, // Posição y da área de jogo
      width: this.width * 0.8, // Largura da área de jogo
      height: this.height * 0.8, // Altura da área de jogo
    };
  }

  // Método para inicializar o jogo
  async init() {
    await loadFont('Powerpuff', '../fonts/powerpuff.ttf'); // Carrega a fonte
    this.background = await loadImage('img/fundo.jpg'); // Carrega a imagem de fundo
    const playerImage = await loadImage('img/lindinha.png'); // Carrega a imagem do jogador
    
    // Inicializa o jogador

    this.player = new Player(
      this.gameArea.x + this.gameArea.width / 2,
      this.gameArea.y + this.gameArea.height / 2,
      60,
      69,
      playerImage,
      9 // Número total de quadros horizontais na imagem da Lindinha
    );

    this.player.handleInput(); // Adiciona o controle de entrada do teclado

    this.candy = new Candy(0, 0, 15); // Inicializa o pirulito
    this.candy.randomPosition(this.gameArea); // Define uma posição aleatória para o pirulito

    this.loop(); // Inicia o loop do jogo
  }

  
  // Método para o loop principal do jogo
  loop() {
    this.update(); // Atualiza o estado do jogo
    this.draw(); // Desenha o estado atual do jogo
    requestAnimationFrame(() => this.loop()); // Solicita o próximo quadro
  }

  // Método para atualizar o estado do jogo
  update() {
    this.player.update(); // Atualiza a posição do jogador
    this.checkCollisions(); // Verifica colisões entre o jogador e o pirulito
    this.handleBounds(); // Garante que o jogador não saia da área de jogo
  }

    // Método para desenhar o estado atual do jogo no canvas
    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height); // Limpa o canvas
      this.ctx.drawImage(this.background, 0, 0, this.width, this.height); // Desenha a imagem de fundo
  
      // Desenha a área de jogo com um fundo semitransparente
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.fillRect(
        this.gameArea.x,
        this.gameArea.y,
        this.gameArea.width,
        this.gameArea.height
      );

      this.candy.draw(this.ctx); // Desenha o pirulito
      this.player.draw(this.ctx); // Desenha o jogador
      this.drawScore(); // Desenha a pontuação
      this.drawTitle(); // Desenha o título
    }

  // Método para desenhar o título do jogo
  drawTitle() {
    this.ctx.font = '30px Powerpuff'; // Define o estilo da fonte
    this.ctx.fillStyle = 'white'; // Define a cor do texto
    this.ctx.textAlign = 'center'; // Alinha o texto ao centro
    this.ctx.fillText('Powerpuff Girls', this.width / 2, 50); // Desenha o título no topo do canvas
  }

// Método para desenhar a pontuação
drawScore() {
  this.ctx.font = '30px Powerpuff'; // Define o estilo da fonte
  this.ctx.fillStyle = 'white'; // Define a cor do texto
  this.ctx.textAlign = 'right'; // Alinha o texto à direita
  this.ctx.fillText(`Pontos: ${this.score}`, this.width - 20, this.height - 20); // Desenha a pontuação no canto inferior direito
}

  // Método para verificar colisões entre o jogador e o pirulito
  checkCollisions() {
    const dx = this.player.x + this.player.width / 2 - this.candy.x; // Distância no eixo x
    const dy = this.player.y + this.player.height / 2 - this.candy.y; // Distância no eixo y
    const distance = Math.hypot(dx, dy); // Distância entre o jogador e o pirulito

    if (distance < this.candy.radius + Math.max(this.player.width, this.player.height) / 2) {
      this.score++; // Incrementa a pontuação
      this.candy.randomPosition(this.gameArea); // Move o pirulito para uma nova posição aleatória
      this.collisionSound.play(); // Toca o som de colisão
    }
  }


  // Método para garantir que o jogador permaneça dentro da área de jogo
  handleBounds() {
    // Impede que o jogador saia da área de jogo pela borda esquerda
    if (this.player.x < this.gameArea.x) this.player.x = this.gameArea.x;

    // Impede que o jogador saia da área de jogo pela borda direita
    if (this.player.x + this.player.width > this.gameArea.x + this.gameArea.width)
      this.player.x = this.gameArea.x + this.gameArea.width - this.player.width;

    // Impede que o jogador saia da área de jogo pela borda superior
    if (this.player.y < this.gameArea.y) this.player.y = this.gameArea.y;

    // Impede que o jogador saia da área de jogo pela borda inferior
    if (this.player.y + this.player.height > this.gameArea.y + this.gameArea.height)
      this.player.y = this.gameArea.y + this.gameArea.height - this.player.height;
  }
}

// Configura o jogo quando a página for carregada
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas'); // Obtém o elemento canvas
  const ctx = canvas.getContext('2d'); // Obtém o contexto de renderização 2D do canvas

  // Definir as dimensões do canvas com base na proporção original
  const originalWidth = 1690; // Largura original do canvas
  const originalHeight = 890; // Altura original do canvas

  // Ajustar o tamanho do canvas para preencher a tela mantendo a proporção
  const aspectRatio = originalWidth / originalHeight; // Calcula a proporção original
  const windowWidth = window.innerWidth; // Largura da janela
  const windowHeight = window.innerHeight; // Altura da janela

  // Ajusta as dimensões do canvas para manter a proporção
  if (windowWidth / windowHeight > aspectRatio) {
    canvas.width = windowHeight * aspectRatio; // Ajusta a largura com base na altura
    canvas.height = windowHeight; // Define a altura igual à altura da janela
  } else {
    canvas.width = windowWidth; // Define a largura igual à largura da janela
    canvas.height = windowWidth / aspectRatio; // Ajusta a altura com base na largura
  }

  // Cria uma instância do jogo e inicia
  const game = new Game(canvas, ctx);
  game.init().catch((error) => console.error(error)); // Inicializa o jogo e captura erros
});
