class Platform {
  speed = 6;
  dx = 0;
  x = 280;
  y = 300;
  width = 100;
  height = 14;

  constructor(ball) {
    this.ball = ball;
  }

  fire() {
    if (this.ball) {
      this.ball.start();
      this.ball = null;
    }
  }

  move() {
    if (this.dx) {
      this.x += this.dx;
      if (this.ball) {
        this.ball.x += this.dx;
      }
    }
  }

  start(direction) {
    if (direction === KEYS.left) {
      this.dx = -this.speed;
    } else if (direction === KEYS.right) {
      this.dx = this.speed;
    }
  }

  stop() {
    this.dx = 0;
  }

  getTouchOffset(touchX) {
    let diff = (this.x + this.width) - touchX;
    let offset = this.width - diff;
    let result = 2 * offset / this.width;

    return result - 1;
  }

  collideScreenBounds(screenWidth) {
    const x = this.x + this.dx;

    const platformLeft = x;
    const platformRight = platformLeft + this.width;

    const screenLeft = 0;
    const screenRight = screenWidth;

    if (platformLeft < screenLeft || platformRight > screenRight) {
      this.dx = 0;
    }
  }
}
