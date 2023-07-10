class Player {
  constructor() {
    this.length = 0.045 * width;
    this.breadth = this.length * playerIdleSprite.sprites[0].height / playerIdleSprite.sprites[0].width;

    this.bulletCount = 10;
    this.lives = 5;

    this.position = createVector(width / 2, height / 2);

    this.sprite = playerIdleSprite;

    this.tag = 'player';

    this.hurtBlinkTime = 0;
    this.hurt = false;
  }

  getHeadingVector() {
    const position = createVector(width / 2, height / 2);
    const mouseVector = createVector(mouseX, mouseY);
    const heading = p5.Vector.sub(mouseVector, position).normalize();
    return heading;
  }

  shouldTint() {
    if (!this.hurt) return false;

    this.hurtBlinkTime += deltaTime;
    if (this.hurtBlinkTime > 2 * totalHurtBlinkCycles * hurtBlinkDelay) {
      this.hurt = false;
      this.hurtBlinkTime = 0;
      return false;
    }

    return floor(this.hurtBlinkTime / hurtBlinkDelay) % 2 == 0;
  }

}
