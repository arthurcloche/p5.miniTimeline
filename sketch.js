// "#abcd5e",
// "#29ac9f",
// "#14976b",
// "#b3dce0",
// "#62b6de",
// "#2b67af",
// "#ffd400",
// "#f589a3",
// "#f0502a",
// "#fc8405",

function Stagger(initialize = false, num = 12, offset = 2, revert = false) {
  this.num = num;
  this.offset = Math.min(Math.max(0, offset), 2);
  this.totalduration = Math.ceil(1 + this.offset);
  this.reverted = revert;
  this.animations = [];
  this.isReady = false;
  this.isDone = () => {
    return this.animations.every((animation) => {
      return animation.progress === 1;
    });
  };
  this.build = (num, offset, revert) => {
    if (num !== undefined && num !== null && num !== this.num) this.num = num;
    if (offset !== undefined && offset !== null && offset !== this.offset)
      this.offset = Math.min(Math.max(0, offset), 2);
    if (revert !== undefined && revert !== null && revert !== this.revert)
      this.revert = revert;

    this.animations = [];
    for (let i = 0; i < this.num; i++) {
      this.animations[i] = {
        id: i,
        index:
          this.num === 1
            ? 0
            : Math.min(
                1,
                this.reverted ? 1 - i / (this.num - 1) : i / (this.num - 1)
              ),
        freeze: Math.max(0, this.offset),
        progress: 0,
        update: function (_progress) {
          this.progress = Math.max(
            0,
            Math.min(_progress - this.index * this.freeze, 1)
          );
        },
      };
    }
    this.isReady = true;
  };
  if (!!initialize) {
    this.build(this.num);
  }
  this.update = (t) => {
    for (let animation of this.animations) {
      animation.update(t * this.totalduration);
    }
  };

  this.ease = (p = 0, g = 2) => {
    if (p < 0.5) return 0.5 * Math.pow(2 * p, g);
    else return 1 - 0.5 * Math.pow(2 * (1 - p), g);
  };

  this.withFrames = (actualFrame, duration = 1) => {
    return Math.max(0, Math.min(actualFrame / duration, 1));
  };

  this.revert = (revert) => {
    if (this.reverted !== revert) {
      this.reverted = revert;
      for (let animation of this.animations) {
        animation.index = Math.min(
          1,
          this.revert
            ? 1 - animation.id / (this.num - 1)
            : animation.id / (this.num - 1)
        );
      }
    }
  };
}

const keyframes = [
  { translate: { x: -200, y: 0 }, fill: "#abcd5e", scale: 1, rotate: 0 },
  { translate: { x: 200, y: 0 }, fill: "#29ac9f", scale: 2, rotate: Math.PI },
  {
    translate: { x: 0, y: 100 },
    fill: "#14976b",
    scale: 1,
    rotate: Math.PI * 2,
  },
  {
    translate: { x: 0, y: -100 },
    fill: "#b3dce0",
    scale: 2,
    rotate: Math.PI * 4,
  },
];

function getTimeline(duration, keyframes, loop = false) {
  const count = keyframes.length - (loop ? 0 : 1);
  const progress = ((frameCount / duration) * count) % count;
  const from = keyframes[Math.floor(progress)];
  const to = keyframes[Math.ceil(progress) % keyframes.length];
  const interpolation = progress % 1;
  const attributes = {};

  const interpolateAttributes = (fromValue, toValue, interpolation) => {
    if (typeof fromValue === "number" && typeof toValue === "number") {
      return lerp(fromValue, toValue, interpolation);
    }
    if (typeof fromValue === "string" && typeof fromValue === "string") {
      return lerpColor(color(fromValue), color(toValue), interpolation);
    }
    if (typeof fromValue === "object" && typeof toValue === "object") {
      const result = {};
      for (const key in fromValue) {
        if (toValue.hasOwnProperty(key)) {
          result[key] = interpolateAttributes(
            fromValue[key],
            toValue[key],
            interpolation
          );
        }
      }
      return result;
    }

    return fromValue;
  };

  for (let attribute in from) {
    if (to.hasOwnProperty(attribute)) {
      attributes[attribute] = interpolateAttributes(
        from[attribute],
        to[attribute],
        interpolation
      );
    }
  }

  return attributes;
}

function setup() {
  createCanvas(800, 400, WEBGL);
  stagger = new Stagger();
  noStroke();
}

function draw() {
  background(220);

  const numframes = 4 * 60;
  const progress = frameCount * 0.01;
  stagger.build(10, 1.0);
  stagger.update(progress);

  push();
  for (let i = 0; i < 10; i++) {
    const animation = stagger.animations[i];
    const progress = animation.progress;
    // if (i === 0) console.log( progress)
    const timeline = getTimeline(numframes, keyframes);

    push();
    for (let transformation in timeline) {
      const operation = timeline[transformation];
      const spreadable =
        typeof operation === "object" && operation.constructor !== p5.Color;
      const val = spreadable
        ? Object.keys(operation).map((key) => operation[key])
        : operation;
      spreadable ? window[transformation](...val) : window[transformation](val);
    }
    plane();
    pop();
  }
  // noLoop();
}
