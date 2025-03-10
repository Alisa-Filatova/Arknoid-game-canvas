const KEYS = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  space: ' '
}

const game = {
  ctx: null,
  ball: null,
  platform: null,
  blocks: [],
  rows: 4,
  cols: 8,
  width: 640,
  height: 360,
  images: {
    background: null,
    ball: null,
    platform: null,
    block: null
  },
  sounds: {
    bump: null,
    coin: null,
    loose: null,
    win: null,
  },
  running: true,
  score: 0,
  init() {
    this.ctx = document.getElementById('my-canvas').getContext('2d');
    this.setEvents();
    this.setTextFont();
  },
  setTextFont() {
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#ffffff';
  },
  setEvents() {
    window.addEventListener('keydown', event => {
      if (event.key === KEYS.space) {
        this.platform.fire();
      } else if (event.key === KEYS.left || event.key === KEYS.right) {
        this.platform.start(event.key);
      }
    });

    window.addEventListener('keyup', event => {
      this.platform.stop();
    });
  },
  preload(callback) {
    let loaded = 0;
    const required = Object.keys(this.images).length + Object.keys(this.sounds).length;

    const onAssetsLoad = () => {
      loaded += 1;
      if (loaded >= required) {
        callback();
      }
    };

    this.preloadImages(onAssetsLoad);
    this.preloadAudio(onAssetsLoad);
  },
  preloadImages(onLoadCallback) {
    Object.keys(this.images).forEach((key) => {
      const image = new Image();
      image.src = `img/${key}.png`;
      image.addEventListener('load', onLoadCallback);
      this.images[key] = image;
    });
  },
  preloadAudio(onLoadCallback) {
    Object.keys(this.sounds).forEach((key) => {
      const sound = new Audio(`sounds/${key}.mp3`);
      sound.addEventListener('canplaythrough', onLoadCallback, { once: true });
      this.sounds[key] = sound;
    });
  },
  render() {
    const { ctx, images, platform, ball, score, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(images.background, 0, 0);
    ctx.drawImage(
      images.ball,
      ball.frame * ball.width, 0,
      ball.width, ball.height,
      ball.x, ball.y,
      ball.width, ball.height
    );
    ctx.drawImage(images.platform, platform.x, platform.y);
    this.renderBlocks();
    ctx.fillText(`Score: ${score}`, 20, 24);
  },
  renderBlocks() {
    this.blocks.forEach((block) => {
      if (block.active) {
        this.ctx.drawImage(this.images.block, block.x, block.y);
      }
    });
  },
  create() {
    const blockWidth = 60;
    const blockHeight = 20;
    const blockGap = 4;
    const offsetX = 65;
    const offsetY = 35;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          width: 60,
          height: 20,
          active: true,
          x: (blockWidth + blockGap) * col + offsetX,
          y: (blockHeight + blockGap) * row + offsetY,
        });
      }
    }
  },
  update() {
    const { platform, ball } = this;
    this.collideBlocks();
    this.collidePlatform();
    platform.collideScreenBounds(this.width);
    platform.move();

    if (!ball.collideScreenBounds(this.width, this.height)) {
      this.end('Game over!');
    }
    ball.move();
  },
  addScore() {
    this.score += 1;
    if (this.score >= this.blocks.length) {
      this.sounds.win.play();
      setTimeout(() => {
        this.end('Winner!');
      }, 300);
    }
  },
  collideBlocks() {
    for (let block of this.blocks) {
      if (this.ball.collide(block) && block.active) {
        this.ball.bumpBlock(block);
        this.addScore();
        this.sounds.coin.play();
      }
    }
  },
  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
      this.sounds.bump.play();
    }
  },
  run() {
    if (this.running) {
      window.requestAnimationFrame(() => {
        this.update()
        this.render();
        this.run();
      });
    }

  },
  start() {
    this.init();
    this.preload(() => {
      this.ball = new Ball(this.sounds);
      this.platform = new Platform(this.ball);
      this.create();
      this.run();
    });
  },
  end(message) {
    this.running = false;
    alert(message);
    window.location.reload();
  }
};

window.addEventListener('load', () => {
  game.start();
});
