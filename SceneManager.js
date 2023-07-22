class SceneManager {

  constructor() {

    this.defineGameScene();
    this.defineMainMenuScene();
    this.defineHelpScene();

  }


  switchToScene(scene) {
    if (scene.setup) scene.setup();
    this.currentScene = scene;
  }


  defineGameScene() {
    this.gameScene = {};

    this.gameScene.setup = () => {
      time = 0;
      bullets = [];

      gameOver = false;
      redZoneRadius = fieldRadius * 0.25;
      redZoneBlinking = false;
      redZoneBlinkTime = 0;
      score = 0;
      enemySpeed = 0.000042 * width;
      gameOverCause = "";
      gameOverTime = 0;

      player = new Player();
      enemy = new Enemy();

      stopAllLoopSounds();

      gameBackgroundSound.loop();
      gameBackgroundSound.setVolume(0.2);
      playerHeartSound.setVolume(0.4);
    }


    this.gameScene.draw = () => {
      // background(1, 46, 35);
      image(backgroundImage, width / 2, height / 2, width, height);


      // fill(98, 234, 195);
      strokeWeight(5);
      noFill();
      circle(width / 2, height / 2, fieldRadius * 2);

      if (shouldDrawRedZone()) {
        fill(242, 77, 44);
        circle(width / 2, height / 2, redZoneRadius * 2);
      }


      if (deathLocation != null) {
        bloodSprite.draw(deathLocation.x, deathLocation.y, enemy.length, enemy.length);
      }


      if (!gameOver) {
        for (let i = bullets.length - 1; i >= 0; --i) {
          const bullet = bullets[i];

          const {previousPosition, nextPosition} = bullet.update();

          let playerAndBulletCollided = interactWthBullet(player, previousPosition, nextPosition);
          if (playerAndBulletCollided) bullets.splice(i, 1);


          let enemyAndBulletCollided = interactWthBullet(enemy, previousPosition, nextPosition);
          if (enemyAndBulletCollided) {
            bullets.splice(i, 1);
            if (enemy.lives == 0) {
              deathLocation = enemy.position.copy();
              bloodSprite = bloodDecaySprite.reload();
              zombieDieSound.play();
              enemy = new Enemy();
            }
          }

          bullet.render();
        }


        render(player);

        if (!enemy.reached) {
          enemy.update();
          render(enemy);
        } else {
          deathLocation = enemy.position.copy();
          bloodSprite = bloodDecaySprite.reload();

          redZoneBlinking = true;
          zombieDieSound.play();
          enemy = new Enemy();
        }

        score += scoreIncrementPerMillisecond * deltaTime;
        time += deltaTime;
      }

      if (redZoneRadius >= fieldRadius || player.lives <= 0 || bullets.length + enemy.bulletCount + player.bulletCount == 0) {
        // sceneManager.switchToScene(sceneManager.gameOverScene);
        if (!gameOver) {
          stopAllLoopSounds();
          gameBackgroundSound.setVolume(0.6);
          gameBackgroundSound.loop();
        }
        gameOver = true;
        if (redZoneRadius >= fieldRadius) {
          redZoneRadius = fieldRadius;
          gameOverCause = "The entire island is toxic";
        }
        else if (player.lives <= 0) {
          player.lives = 0;
          gameOverCause = "You died";
        }
        else {
          gameOverCause = "No ammunition";
        }
      }

      textAlign(LEFT, TOP);
      textSize(30);
      fill(0);
      strokeWeight(2);
      stroke(0);
      text(`❤️ ${player.lives}\t` + '🗡️' + str(player.bulletCount) + '\n' + `🥇 ${floor(score)}`, 20, 20);


      if (gameOver) {
        // fill(255, 200);
        // strokeWeight(3);
        // stroke(0);
        // rect(width / 2, height / 2, 9 * width / 10, height / 2);
        image(splashImage, width / 2, height / 2, 9 * width / 10, height / 2);

        textAlign(CENTER, CENTER);
        fill(200);
        strokeWeight(2);

        textSize(height / 20);
        text('Game Over', width / 2, height / 2 - 40);
        fill(255);
        text(gameOverCause, width / 2, height / 2);
        text("Click to go to main menu", width / 2, height / 2 + 40);

        gameOverTime += deltaTime;
      }

    }


    this.gameScene.mousePressed = () => {
      if (gameOver) {
        sceneManager.switchToScene(sceneManager.mainMenuScene);
        buttonPress.play();
      }
      else if (player.sprite == playerIdleSprite && player.bulletCount > 0) {
        player.sprite = playerStartThrowSprite.reload();
        // shoot(player);
      }
    }

  }



  defineMainMenuScene() {
    this.mainMenuScene = {};

    this.mainMenuScene.setup = () => {

      stopAllLoopSounds();

      playerHeartSound.setVolume(0.2);
      playerHeartSound.loop();

      menuTint = 255;
      menuTintIncreaseSpeed = 0.08;

      knifePosition = knifeTopMost;
      knifeTime = 0;
    }

    this.mainMenuScene.draw = () => {
      tint(menuTint);
      image(menuBackgroundImage, width / 2, height / 2, width, height);

      menuTint += menuTintIncreaseSpeed * deltaTime;
      if (menuTint >= 255) {
        menuTint = 255;
        menuTintIncreaseSpeed *= -1;
      }
      else if (menuTint <= menuTintLowerBound) {
        menuTint = menuTintLowerBound;
        menuTintIncreaseSpeed *= -1;
      }

      noTint();
      image(menuTextImage, width / 2, height / 2, width, height);

      knifeTime += deltaTime;
      knifePosition = (knifeTopMost + knifeBottomMost) / 2 + (knifeBottomMost - knifeTopMost) * sin(knifeTime / 1000) / 2;
      image(menuKnifeLogo, 861 * width / menuBackgroundImage.width, knifePosition * height / menuBackgroundImage.height, 362 * width / menuBackgroundImage.width, 939 * height / menuBackgroundImage.height);
    }

    this.mainMenuScene.mousePressed = () => {
      buttonPress.play();
      sceneManager.switchToScene(sceneManager.gameScene);
    }

    this.mainMenuScene.keyPressed = (key) => {
      if (key == ' ') {
        buttonPress.play();
        sceneManager.switchToScene(sceneManager.helpScene);
      }
    }

  }


  defineHelpScene() {
    this.helpScene = {};

    this.helpScene.setup = () => {
      stopAllLoopSounds();
      helpIndex = 0;
    }

    this.helpScene.draw = () => {
      image(helpGifs[helpIndex], width / 2, height / 2, width, height);

      textSize(32);
      textAlign(CENTER, CENTER);
      const message = helpIndex < helpGifs.length - 1? "Click to go to next page" : "Click to go to main menu";
      fill(0);
      const w = textWidth(message) + 30;
      const h = 40;
      rect(width - w / 2, h / 2, w, h);
      fill(255);
      text(message, width - w / 2, h / 2);
    }

    this.helpScene.mousePressed = () => {
      buttonPress.play();
      ++helpIndex;
      if (helpIndex >= helpGifs.length) sceneManager.switchToScene(sceneManager.mainMenuScene);
    }

  }



}