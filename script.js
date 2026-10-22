// A fly that flies around the screen at random, like a real fly:
// it buzzes around, changes direction suddenly, and lands for a moment.

const fly = document.querySelector(".fly");

// Where the fly is (in pixels) and where it is facing (in degrees, 0 = right)
let x = window.innerWidth * 0.86; // starts bottom right, like in Figma
let y = window.innerHeight * 0.81;
let heading = -116.64; // matches the fly's rotation in Figma
let speed = 0; // pixels per second

// The fly either rests or flies, each for a random amount of time
let isFlying = false;
let timeLeft = 1.5; // seconds until it switches

const MIN_SPEED = 250;
const MAX_SPEED = 650;
const EDGE = 80; // how close to the edge before it turns back

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function startFlying() {
  isFlying = true;
  timeLeft = randomBetween(1, 4);
  speed = randomBetween(MIN_SPEED, MAX_SPEED);
  heading += randomBetween(-150, 150); // takes off in a new direction
  fly.classList.add("is-flying");
}

function land() {
  isFlying = false;
  timeLeft = randomBetween(0.5, 2.5);
  fly.classList.remove("is-flying");
}

// Moves the fly forward by a small step of time
function update(seconds) {
  timeLeft -= seconds;

  if (!isFlying) {
    if (timeLeft <= 0) startFlying();
    return;
  }

  // Small wobble all the time, and sometimes a sharp turn
  heading += randomBetween(-250, 250) * seconds;
  if (Math.random() < 2 * seconds) {
    heading += randomBetween(-120, 120);
  }

  // Near the edge of the screen: turn back toward the middle
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (x < EDGE || x > width - EDGE || y < EDGE || y > height - EDGE) {
    const angleToMiddle = Math.atan2(height / 2 - y, width / 2 - x) * (180 / Math.PI);
    heading = angleToMiddle + randomBetween(-30, 30);
  }

  // Speed up and slow down a little
  speed += randomBetween(-900, 900) * seconds;
  speed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));

  // Move forward in the direction it is facing
  const radians = heading * (Math.PI / 180);
  x += Math.cos(radians) * speed * seconds;
  y += Math.sin(radians) * speed * seconds;

  // Stay inside the screen (for example after the window gets smaller)
  x = Math.min(width, Math.max(0, x));
  y = Math.min(height, Math.max(0, y));

  if (timeLeft <= 0) land();
}

// Puts the fly image where the fly is
function draw() {
  // A tiny shake while flying, like buzzing wings
  const buzz = isFlying ? 1.5 : 0;
  const drawX = x + randomBetween(-buzz, buzz);
  const drawY = y + randomBetween(-buzz, buzz);

  // +90 because the fly's head points up in the image
  fly.style.transform =
    `translate(${drawX}px, ${drawY}px) translate(-50%, -50%) rotate(${heading + 90}deg)`;
}

// Runs about 60 times a second
let lastTime = null;
function animate(time) {
  if (lastTime !== null) {
    // Limit the step, so the fly doesn't jump after switching tabs
    const seconds = Math.min((time - lastTime) / 1000, 0.1);
    update(seconds);
  }
  lastTime = time;
  draw();
  requestAnimationFrame(animate);
}

draw();

// People who turned off animations in their settings get a still fly
const prefersStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersStill) {
  requestAnimationFrame(animate);
}
