class Bullet {
  constructor(position, headingVector) {
    this.position = position;
    this.speed = 0.0005 * width;

    this.velocity = headingVector.copy();
    this.velocity.setMag(this.speed);

    this.length = 0.035 * width;
    this.breadth = knifeSprite.sprites[0].height / knifeSprite.sprites[0].width;
  }

  update() {
    const previousPosition = this.position.copy();
    this.position.add(p5.Vector.mult(this.velocity, deltaTime));
    const nextPosition = this.position.copy();

    const squareDistanceFromCenter =
      sq(this.position.x - width / 2) + sq(this.position.y - height / 2);

    if (squareDistanceFromCenter > sq(fieldRadius)) {
      const center = createVector(width / 2, height / 2);

      const positionRelativeToCenter = p5.Vector.sub(this.position, center);
      positionRelativeToCenter.setMag(fieldRadius);
      positionRelativeToCenter.mult(-1);
      this.position = p5.Vector.add(center, positionRelativeToCenter);
    }

    return {previousPosition, nextPosition};

  }

  render() {
    push();
    translate(this.position);
    rotate(this.velocity.heading());

    // fill(255, 0, 0);
    // rect(0, 0, this.length, this.breadth);

    knifeSprite.draw(0, 0, this.length);

    pop();
  }
}


// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
function onSegment(p, q, r)
{
  if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
    return true;

  return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r)
{

  // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
  // for details of below formula.
  let val = (q.y - p.y) * (r.x - q.x) -
      (q.x - p.x) * (r.y - q.y);

  if (val == 0) return 0; // collinear

  return (val > 0)? 1: 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1, q1, p2, q2)
{

  // Find the four orientations needed for general and
  // special cases
  let o1 = orientation(p1, q1, p2);
  let o2 = orientation(p1, q1, q2);
  let o3 = orientation(p2, q2, p1);
  let o4 = orientation(p2, q2, q1);

  // General case
  if (o1 != o2 && o3 != o4)
    return true;

  // Special Cases
  // p1, q1 and p2 are collinear and p2 lies on segment p1q1
  if (o1 == 0 && onSegment(p1, p2, q1)) return true;

  // p1, q1 and q2 are collinear and q2 lies on segment p1q1
  if (o2 == 0 && onSegment(p1, q2, q1)) return true;

  // p2, q2 and p1 are collinear and p1 lies on segment p2q2
  if (o3 == 0 && onSegment(p2, p1, q2)) return true;

  // p2, q2 and q1 are collinear and q1 lies on segment p2q2
  if (o4 == 0 && onSegment(p2, q1, q2)) return true;

  return false; // Doesn't fall in any of the above cases
}