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
    let required = Object.keys(this.images).length + Object.keys(this.sounds).length;

    const onAssetsLoad = () => {
      loaded += 1;
      if (loaded >= required) {
        callback();
      }
    };

    this.preloadImages(onAssetsLoad);
    this.preloadAudio(onAssetsLoad);
  },
  preloadImages(callback) {
    Object.keys(this.images).forEach((key) => {
      const image = new Image();
      image.src = `img/${key}.png`;
      image.addEventListener('load', callback);

      this.images[key] = image;
    });
  },
  preloadAudio(callback) {
    Object.keys(this.sounds).forEach((key) => {
      const sound = new Audio(`sounds/${key}.mp3`);
      sound.addEventListener('canplaythrough', callback, { once: true });

      this.sounds[key] = sound;
    });
  },
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.images.background, 0, 0);
    this.ctx.drawImage(this.images.ball, this.ball.frame * this.ball.width, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
    this.ctx.drawImage(this.images.platform, this.platform.x, this.platform.y);
    this.renderBlocks();

    this.ctx.fillText(`Score: ${this.score}`, 20, 24);
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
    this.collideBlocks();
    this.collidePlatform();
    this.platform.collideScreenBounds();
    this.ball.collideScreenBounds();
    this.platform.move();
    this.ball.move();
  },
  addScore() {
    this.score += 1;
    if (this.score >= this.blocks.length) {
      this.end('Win!');
    }
  },
  collideBlocks() {
    for (let block of this.blocks) {
      if (this.ball.collide(block) && block.active) {
        this.ball.bumpBlock(block);
        this.addScore();
        this.sounds.bump.play();
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
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    let ballLeft = x;
    let ballRight = ballLeft + this.width;
    let ballTop = y;
    let ballBottom = ballTop + this.height;

    let screenLeft = 0;
    let screenRight = game.width;
    let screenTop = 0;
    let screenBottom = game.height;

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
      let touchX = this.x + this.width / 2;
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
