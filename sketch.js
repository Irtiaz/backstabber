let squareDimension;
let fieldRadius;
let redZoneRadius;

let player;
let bullets;
let enemy;

let time;

const sceneManager = new SceneManager();

let playerIdleSprite;
let playerStartThrowSprite;
let playerEndThrowSprite;
let playerCatchSprite;

let enemyMoveWithoutKnifeSprite;
let enemyMoveWithKnifeSprite;
let enemyCatchWithoutKnifeSprite;
let enemyCatchWithKnifeSprite;
let enemyThrowSprite;

let knifeSprite;

let backgroundImage;

let menuBackgroundImage;
let menuTextImage;
let menuKnifeLogo;
let menuTint;
let menuTintIncreaseSpeed;
const menuTintLowerBound = 180;

let bloodDecaySprite;
let bloodLoopSprite;

let bloodSprite;

let splashImage;

let deathLocation = null;

const totalHurtBlinkCycles = 2;
const hurtBlinkDelay = 200;

const redZoneBlinkCycles = 3;
const redZoneBlinkDelay = 200;
let redZoneBlinking = false;
let redZoneBlinkTime = 0;

let score = 0;
const killBonus = 20;
const scoreIncrementPerMillisecond = 0.001;
let enemySpeed;

let gameOver = false;
let gameOverTime;
let gameOverCause = "";

let knifePosition;
const knifeTopMost = 481;
const knifeBottomMost = 614;
let knifeTime;

const enemyMaxSpeed = 0.00007;

let moveSound;
let zombieDieSound;
let playerHeartSound;
let throwSound;
let playerHitSound;
let catchSound;
let gameBackgroundSound;
let buttonPress;

const helpGifs = [];
let helpIndex;

function preload() {

  backgroundImage = loadImage('assets/background.png');

  menuBackgroundImage = loadImage('assets/menu background.png');
  menuTextImage = loadImage('assets/unchangedMain.png');
  menuKnifeLogo = loadImage('assets/knife logo.png');

  playerIdleSprite = new Sprite('player/idle', 20, 20);

  playerStartThrowSprite = new Sprite('player/startThrow', 8, 20, () => {
    shoot(player);
    player.sprite = playerEndThrowSprite.reload();
  });

  playerEndThrowSprite = new Sprite('player/endThrow', 7, 20, () => {
    player.sprite = playerIdleSprite.reload();
  });

  playerCatchSprite = new Sprite('player/catch', 7, 20, () => {
    player.sprite = playerIdleSprite.reload();
  });

  enemyMoveWithoutKnifeSprite = new Sprite('enemy/moveNoKnife', 17, 20);
  enemyMoveWithKnifeSprite = new Sprite('enemy/moveWithKnife', 17, 20);

  enemyCatchWithoutKnifeSprite = new Sprite('enemy/catchNoKnife', 8, 20, () => {
    enemy.sprite = enemyMoveWithKnifeSprite.reload();
  });

  enemyCatchWithKnifeSprite = new Sprite('enemy/catchWithKnife', 8, 20, () => {
    enemy.sprite = enemyMoveWithKnifeSprite.reload();
  });

  enemyThrowSprite = new Sprite('enemy/throw', 8, 20, () => {
    shoot(enemy);
    enemy.sprite = (enemy.bulletCount == 0? enemyMoveWithoutKnifeSprite : enemyMoveWithKnifeSprite).reload();
  });

  knifeSprite = new Sprite('knife', 1, 20);

  bloodDecaySprite = new Sprite('blood/decay', 6, 200, () => {
    bloodSprite = bloodLoopSprite.reload();
  });

  bloodLoopSprite = new Sprite('blood/loop', 1, 20);

  bloodSprite = bloodDecaySprite;

  splashImage = loadImage('assets/splash.png');

  moveSound = loadSound("assets/move.mp3");
  // moveSound.setVolume(0.7);

  zombieDieSound = loadSound("assets/zombie die.mp3");

  playerHeartSound = loadSound("assets/player heart.mp3");
  playerHeartSound.setVolume(0.4);

  throwSound = loadSound("assets/throw.mp3");
  throwSound.setVolume(0.3);

  playerHitSound = loadSound("assets/player hit.mp3");
  playerHitSound.setVolume(0.4);

  catchSound = loadSound("assets/catch.mp3");
  catchSound.setVolume(0.6);

  gameBackgroundSound = loadSound("assets/game background.mp3");

  buttonPress = loadSound("assets/play or help.mp3");

  for (let i = 0; i < 8; ++i) {
    helpGifs.push(loadImage(`assets/gifs/${i}.gif`));
  }
}

function setup() {

  if (windowWidth / backgroundImage.width < windowHeight / backgroundImage.height) createCanvas(windowWidth, windowWidth * backgroundImage.height / backgroundImage.width);
  else createCanvas(windowHeight *  backgroundImage.width / backgroundImage.height, windowHeight);

  squareDimension = min(width, height);

  // fieldRadius = (squareDimension / 2) * 0.75;
  fieldRadius = 431 * width / backgroundImage.width;
  redZoneRadius = fieldRadius * 0.25;

  // createCanvas(squareDimension, squareDimension);

  rectMode(CENTER);
  imageMode(CENTER);

  sceneManager.switchToScene(sceneManager.mainMenuScene);

}

function draw() {
  sceneManager.currentScene.draw();
}

function mousePressed(event) {
  if (event.button == 0 && sceneManager.currentScene.mousePressed) sceneManager.currentScene.mousePressed();
}

function keyPressed() {
  if (sceneManager.currentScene.keyPressed) sceneManager.currentScene.keyPressed(key);
}


function shouldDrawRedZone() {
  if (!redZoneBlinking) return true;

  redZoneBlinkTime += deltaTime;

  if (redZoneBlinkTime >= 2 * redZoneBlinkCycles * redZoneBlinkDelay) {
    redZoneBlinking = false;
    redZoneBlinkTime = 0;
    return false;
  }

  return floor(redZoneBlinkTime / redZoneBlinkDelay) % 2 == 1;
}

function stopAllLoopSounds() {
  moveSound.stop();
  playerHeartSound.stop();
  gameBackgroundSound.stop();
}