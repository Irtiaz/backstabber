class Sprite {
  constructor(baseName, count, delay, callbackWhenDone) {
    const images = [];

    for (let i = 0; i < count; ++i) {
      const imagePath = 'assets/' + baseName + '/' + i + '.png';
      const image = loadImage(imagePath);
      images.push(image);
    }

    this.sprites = images;
    this.index = 0;

    this.callbackWhenDone = callbackWhenDone;

    this.time = 0;
    this.delay = delay;
  }

  play() {
    const image = this.sprites[this.index];

    this.time += deltaTime;

    if (this.time >= this.delay) {
      this.time = 0;
      ++this.index;

      if (this.index >= this.sprites.length) {
        if (!this.callbackWhenDone) this.index = 0;
        else this.callbackWhenDone();
      }
    }

    return image;
  }

  reload() {
    this.index = 0;
    this.time = 0;
    return this;
  }

  draw(x, y, w, h) {
    const currentImage = this.play();
    if (w == undefined && h == undefined) {
      w = currentImage.width;
      h = currentImage.height;
    }
    else if (w == undefined) w = currentImage.width * h / currentImage.height;
    else if (h == undefined) h = currentImage.height * w / currentImage.width;

    image(currentImage, x, y, w, h);
  }

}