function render(person) {

    if (person.tag == 'enemy') {
        if (sq(enemy.position.x - width / 2) + sq(enemy.position.y - height / 2) > sq(fieldRadius)) {

            moveSound.stop();
            if (!playerHeartSound.isPlaying()) playerHeartSound.loop();

            const boundaryPoint = p5.Vector.sub(enemy.position, player.position).setMag(fieldRadius).add(player.position);
            textAlign(CENTER, CENTER);
            textSize(80);
            text('⚠️', boundaryPoint.x, boundaryPoint.y);
            return;
        }

        if (!moveSound.isPlaying()) moveSound.loop();
        playerHeartSound.stop();

    }

    push();
    translate(person.position);

    rotate(person.getHeadingVector().heading());

    if (person.tag == 'player' && player.shouldTint()) tint(255, 0, 0);
    else if (person.tag == 'player') tint(255);
    else noTint();
    person.sprite.draw(0, 0, person.tag == 'player'? player.length * 1.5 : enemy.length * 1.5);

    //hit boxes
    // fill(255, 50);
    // rect(0, 0, person.breadth, person.length);

    pop();
}

function shoot(person) {

    if (!throwSound.isPlaying()) throwSound.play();

    const heading = person.getHeadingVector();
    const position = person.position;

    const bulletOffset = p5.Vector.mult(heading, person.breadth);
    const bulletPosition = p5.Vector.add(position, bulletOffset);

    const bullet = new Bullet(bulletPosition, heading);
    bullets.push(bullet);

    --person.bulletCount;
}


function getRelativePoint(person, p) {
    const x = p.x - person.position.x;
    const y = p.y - person.position.y;

    const angle = person.getHeadingVector().heading();
    return createVector(x * cos(angle) + y * sin(angle), -x * sin(angle) + y * cos(angle));
}

function pointIsInside(person, p) {
    const relativePoint = getRelativePoint(person, p);
    return relativePointIsInside(person, relativePoint);
}

function relativePointIsInside(person, p) {
    return p.x >= -person.breadth / 2 && p.x <= person.breadth / 2 && p.y >= -person.length / 2 && p.y <= person.length / 2;
}


function catchFaceIntersect(person, p1, p2) {
    const corner1 = createVector(person.breadth / 2, -person.length / 2);
    const corner2 = createVector(person.breadth / 2, person.length / 2);
    return doIntersect(corner1, corner2, getRelativePoint(person, p2), getRelativePoint(person, p1));
}


function interactWthBullet(person, bulletPreviousPosition, bulletNextPosition) {
    const corner1 = createVector(person.breadth / 2, -person.length / 2);
    const corner2 = createVector(person.breadth / 2, person.length / 2);
    let canCatch = doIntersect(corner1, corner2, getRelativePoint(person, bulletNextPosition), getRelativePoint(person, bulletPreviousPosition));

    if (canCatch) {

        catchSound.play();

        if (person.tag == 'enemy') {
            person.sprite = (person.bulletCount == 0? enemyCatchWithoutKnifeSprite : enemyCatchWithKnifeSprite).reload();
        }

        else {
            person.sprite = playerCatchSprite.reload();
        }

        ++person.bulletCount;

        return true;
    }

    if (pointIsInside(person, bulletNextPosition)) {
        --person.lives;
        if (person.tag == 'enemy') {
            player.bulletCount += 2;
            score += killBonus;
            enemySpeed += 0.000005 * width;
            if (enemySpeed > enemyMaxSpeed * width) {
                enemySpeed = enemyMaxSpeed * width;
            }
            //console.log({enemySpeed});
        }
        else {
            player.hurt = true;
            playerHitSound.play();
        }
        return true;
    }
}