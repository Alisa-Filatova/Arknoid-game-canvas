class Ball {
  dx = 0;
  dy = 0;
  speed = 3;
  x = 320;
  y = 280;
  width = 20;
  height = 20;
  frame = 0;

  constructor(sounds) {
    this.sounds = sounds;
  }

  start() {
    this.dy = -this.speed;
    this.dx = random(-this.speed, this.speed);
    this.animate();
  }

  animate() {
    setInterval(() => {
      this.frame += 1;

      if (this.frame > 3) {
        this.frame = 0;
      }
    }, 100);
  }

  move() {
    if (this.dy) {
      this.y += this.dy;
    }

    if (this.dx) {
      this.x += this.dx;
    }
  }

  collide(element) {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    return x + this.width > element.x
        && x < element.x + element.width
        && y + this.height > element.y
        && y < element.y + element.height;
  }

  collideScreenBounds(screenWidth, screenHeight) {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    const ballLeft = x;
    const ballRight = ballLeft + this.width;
    const ballTop = y;
    const ballBottom = ballTop + this.height;

    const screenLeft = 0;
    const screenRight = screenWidth;
    const screenTop = 0;
    const screenBottom = screenHeight;

    if (ballLeft < screenLeft) {
      this.x = 0;
      this.dx = this.speed;
      this.sounds.bump.play();
    } else if (ballRight > screenRight) {
      this.x = screenRight - this.width;
      this.dx = -this.speed;
      this.sounds.bump.play();
    } else if (ballTop < screenTop) {
      this.y = 0;
      this.dy = this.speed;
      this.sounds.bump.play();
    } else if (ballBottom > screenBottom) {
      this.sounds.loose.play();

      return false;
    }

    return true;
  }

  bumpBlock(block) {
    this.dy *= -1;
    block.active = false;
  }

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
}
