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
    platform.collideScreenBounds();
    platform.move();
    ball.collideScreenBounds();
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
      this.create();
      this.run();
    });
  },
  end(message) {
    this.running = false;
    alert(message);
    window.location.reload();
  },
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
};

game.ball = {
  dx: 0,
  dy: 0,
  speed: 3,
  x: 320,
  y: 280,
  width: 20,
  height: 20,
  frame: 0,
  start() {
    this.dy = -this.speed;
    this.dx = game.random(-this.speed, this.speed);
    this.animate();
  },
  animate() {
    setInterval(() => {
      this.frame += 1;
      if (this.frame > 3) {
        this.frame = 0;
      }
    }, 100);
  },
  move() {
    if (this.dy) {
      this.y += this.dy;
    }

    if (this.dx) {
      this.x += this.dx;
    }
  },
  collide(element) {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    return x + this.width > element.x
        && x < element.x + element.width
        && y + this.height > element.y
        && y < element.y + element.height;
  },
  collideScreenBounds() {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    const ballLeft = x;
    const ballRight = ballLeft + this.width;
    const ballTop = y;
    const ballBottom = ballTop + this.height;

    const screenLeft = 0;
    const screenRight = game.width;
    const screenTop = 0;
    const screenBottom = game.height;

    if (ballLeft < screenLeft) {
      this.x = 0;
      this.dx = this.speed;
      game.sounds.bump.play();
    } else if (ballRight > screenRight) {
      this.x = screenRight - this.width;
      this.dx = -this.speed;
      game.sounds.bump.play();
    } else if (ballTop < screenTop) {
      this.y = 0;
      this.dy = this.speed;
      game.sounds.bump.play();
    } else if (ballBottom > screenBottom) {
      game.sounds.loose.play();
      game.end('Game Over!');
    }
  },
  bumpBlock(block) {
    this.dy *= -1;
    block.active = false;
  },
  bumpPlatform(platform) {
    if (platform.dx) {
      this.x += platform.dx;
    }

    if (this.dy > 0) {
      this.dy = -this.speed;
      const touchX = this.x + this.width / 2;
      this.dx = this.speed * platform.getTouchOffset(touchX);
    }
  }
};

game.platform = {
  speed: 6,
  dx: 0,
  x: 280,
  y: 300,
  width: 100,
  height: 14,
  ball: game.ball,
  fire() {
    if (this.ball) {
      this.ball.start();
      this.ball = null;
    }
  },
  move() {
    if (this.dx) {
      this.x += this.dx;
      if (this.ball) {
        this.ball.x += this.dx;
      }
    }
  },
  start(direction) {
    if (direction === KEYS.left) {
      this.dx = -this.speed;
    } else if (direction === KEYS.right) {
      this.dx = this.speed;
    }
  },
  stop() {
    this.dx = 0;
  },
  getTouchOffset(touchX) {
    let diff = (this.x + this.width) - touchX;
    let offset = this.width - diff;
    let result = 2 * offset / this.width;

    return result - 1;
  },
  collideScreenBounds() {
    const x = this.x + this.dx;

    const platformLeft = x;
    const platformRight = platformLeft + this.width;

    const screenLeft = 0;
    const screenRight = game.width;

    if (platformLeft < screenLeft || platformRight > screenRight) {
      this.dx = 0;
    }
  }
};

window.addEventListener('load', () => {
  game.start();
});
