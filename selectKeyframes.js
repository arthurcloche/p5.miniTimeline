function setup() {
  createCanvas(400, 400);
  noStroke();
}

function getIndex(progress, keyframes) {
  // Ensure progress is within the interval [0, 1]
  progress = progress % 1;

  // Find the current segment based on keyframes
  for (let i = 0; i < keyframes.length; i++) {
    // Handle the first segment that starts from 0
    if (i === 0 && progress < keyframes[i]) {
      return 0;
    }
    // Handle normal segments between keyframes
    if (
      keyframes[i - 1] !== undefined &&
      progress >= keyframes[i - 1] &&
      progress < keyframes[i]
    ) {
      return i;
    }
  }

  // Handle the last segment that might reach up to 1
  return keyframes.length;
}

function draw() {
  background(220);
  const numframes = 4 * 60;
  const progress = (frameCount / numframes) % 1;
  const keyframes = [0.25, 0.35, 0.75];
  const colors = ["red", "blue", "lime", "black"];

  const current = getIndex(progress, keyframes, colors);
  const from = colors[Math.floor(progress)];
  const to = colors[Math.ceil(progress) % colors.length];

  push();
  fill(colors[current]);
  rect(width / 2 - 100, height / 2 - 100, 200, 200);
  pop();
}
