class Enemy {
  constructor() {
    this.length = 0.045 * width;
    this.breadth = this.length * enemyMoveWithoutKnifeSprite.sprites[0].height / enemyMoveWithoutKnifeSprite.sprites[0].width;

    // enemies can spawn anywhere from the field to the peri cycle of square
    let spawnDistance = random(fieldRadius, squareDimension / sqrt(2));
    let spawnAngle = random(0, TWO_PI);
    this.position = createVector(
      width/2 + spawnDistance * cos(spawnAngle),
      height/2 + spawnDistance * sin(spawnAngle)
    );

    // speed is constant, but is divided in 2 component
    // the first is a random sway between -currentSwayMag and +currentSwayMag
    // the rest goes to closing in velocity
    this.speed = enemySpeed;
    this.maxSwayMag = this.speed * 0.9;
    this.currentSwayMag = this.maxSwayMag; // this will decay over time
    this.swayDirection = random() > 0.5? 1: -1;  // clockwise or counterclockwise
    this.getNewSwayDir();

    this.reached = false;

    this.lives = 1;
    this.bulletCount = 0;


    this.sprite = enemyMoveWithoutKnifeSprite;

    this.tag = 'enemy';
  }

  getVelocity() {
    // returns the total resultant velocity calculated based on current location
    const swayVel = this.getSwayVelocity();

    return p5.Vector.add(this.getClosingInVel(), swayVel);
  }

  getClosingInVel() {
    const closingInSpeed = sqrt(this.speed * this.speed -  this.currentSwayMag * this.currentSwayMag);
    let vel = createVector(width / 2, height / 2);
    vel.sub(this.position);
    vel.setMag(closingInSpeed);
    return vel;
  }

  getSwayVelocity() {
    // returns the sway velocity calculated based on current location
    let swayAmt = this.currentSwayMag * this.swayDirection;
    let vel = createVector(width / 2, height / 2);
    vel.sub(this.position);
    vel.rotate(PI / 2);
    vel.normalize().mult(swayAmt);
    return vel;
  }

  update() {

    if (this.sprite == enemyMoveWithKnifeSprite && this.bulletCount > 0) {
      const rayPoint1 = this.position;
      const rayPoint2 = player.position;
      if (!catchFaceIntersect(player, rayPoint1, rayPoint2)) {
        //shoot(enemy);
        this.sprite = enemyThrowSprite.reload();
      }
    }

    this.moveWithBoundaryCheck()
    this.updateSway();

    if (this.getCurrentDir().magSq() < redZoneRadius * redZoneRadius) {
      this.reached = true;
      redZoneRadius += 0.01 * width;
    }
  }

  moveWithBoundaryCheck() {
    const ds = p5.Vector.mult(this.getVelocity(), deltaTime);
    this.position.add(ds);

    const highestDistanceSq = (squareDimension * squareDimension) / 2;
    const dir = this.getCurrentDir();
    if (dir.magSq() < highestDistanceSq) {
      // it stays in boundary so no problem
      return;
    }

    // it goes outside boundary, just close in and do not sway
    this.position.sub(ds);
    this.position.add(this.getClosingInVel());

  }

  getCurrentDir() {
    let dir = createVector(width / 2, height / 2);
    dir.sub(this.position);
    dir.mult(-1);
    return dir;
  }


  updateSway() {
    // change the currentSwayMag
    const highestDistanceSq = (squareDimension * squareDimension) / 2;

    const currentDistSq = this.getCurrentDir().magSq();

    if (currentDistSq > highestDistanceSq) {
      this.currentSwayMag = this.maxSwayMag;
      return;
    }

    this.currentSwayMag = map(
      currentDistSq,
      0,
      highestDistanceSq,
      0,
      this.maxSwayMag
    );

    // change the current sway Direction if its time
    if (time - this.swayStartTime >= this.swayDuration) {
      this.getNewSwayDir();
    }
  }

  getNewSwayDir() {
    this.swayDirection *= -1;   // change the direction
    this.swayStartTime = time;  // store the start of this direction sway

    const baseDuration = 3500;
    const variation = 100;
    this.swayDuration = random(baseDuration - variation/2, baseDuration + variation/2);
  }

  getHeadingVector() {
    return this.getCurrentDir().mult(-1).normalize();
  }



}
