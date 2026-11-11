// A fly that flies around the screen at random, like a real fly:
// it buzzes around, changes direction suddenly, and lands for a moment.
// A click on a resting fly makes it escape, a click on a flying fly squashes it,
// and 2 seconds later a new fly comes in (already flying, so one click is enough).
// To make it a bit easier: a click near the fly also counts, and near the fly
// the mouse turns into a fly swatter (see "Fly swatter" in styles.css).
//
// On the home and index pages the fly rests on the name until the mouse touches it,
// and it only flies above the works (it never goes over them).

// "let" because a new fly image replaces it after the old one is squashed
let fly = document.querySelector(".fly");
let isAlive = true;
let hits = 0; // how many times this fly was clicked

const NEW_FLY_DELAY = 2000; // milliseconds until a new fly comes

// Pages with the big name (home and index): the fly rests on the name
const hero = document.querySelector(".hero");
const isHomePage = hero !== null;

// The fly never goes below the top of <main> (the works on the home page,
// the first line on the index page)
const flyFloor = document.querySelector("main");

// The area where the fly may fly:
// on pages with the big name, from the top of the page down to <main>,
// on other pages, the whole screen
function getArea() {
  if (isHomePage) {
    const halfFly = fly.offsetWidth / 2; // so the whole fly stays above <main>
    return { width: document.documentElement.clientWidth, height: flyFloor.offsetTop - halfFly };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

// Where the fly is (in pixels) and where it is facing (in degrees, 0 = right)
let x = window.innerWidth * 0.86; // starts bottom right, like in Figma
let y = window.innerHeight * 0.81;
let heading = -116.64; // matches the fly's rotation in Figma

// The fly starts on the name, at its spot in Figma
// (in Figma the page is 1440px wide and the fly's middle is at 833, 257)
if (isHomePage) {
  const pageWidth = document.documentElement.clientWidth;
  const figmaPixel = Math.min(1, pageWidth / 1440);
  x = pageWidth / 2 + (833 - 720) * figmaPixel;
  y = hero.offsetTop + 257 * figmaPixel;
}
let speed = 0; // pixels per second

// The fly either rests or flies, each for a random amount of time
let isFlying = false;
let timeLeft = 1.5; // seconds until it switches

const MIN_SPEED = 210;
const MAX_SPEED = 540;
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
  // A squashed fly doesn't move
  if (!isAlive) return;

  timeLeft -= seconds;

  if (!isFlying) {
    // On pages with the big name the fly waits for the mouse instead
    if (timeLeft <= 0 && !isHomePage) startFlying();
    return;
  }

  // Small wobble all the time, and sometimes a sharp turn
  heading += randomBetween(-250, 250) * seconds;
  if (Math.random() < 2 * seconds) {
    heading += randomBetween(-120, 120);
  }

  // Near the edge of the area: turn back toward the middle
  const area = getArea();
  const width = area.width;
  const height = area.height;
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

  // Stay inside the area (for example after the window gets smaller)
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

  // A squashed fly is wider and flatter
  const squash = isAlive ? "" : " scale(1.3, 0.5)";

  // +90 because the fly's head points up in the image
  fly.style.transform =
    `translate(${drawX}px, ${drawY}px) translate(-50%, -50%) rotate(${heading + 90}deg)` + squash;
}

// First click: the fly gets scared and flies away fast
function escapeFly() {
  startFlying();
  speed = MAX_SPEED;

  // With animations turned off the fly can't fly, so it jumps to a new spot
  if (prefersStill) {
    const area = getArea();
    x = randomBetween(EDGE, area.width - EDGE);
    y = randomBetween(EDGE, area.height - EDGE);
    land();
    draw();
  }
}

// Squashes the fly and leaves a red splat under it
function squashFly() {
  isAlive = false;
  isFlying = false;
  fly.classList.remove("is-flying");
  fly.classList.add("is-squashed");

  const splat = document.createElement("div");
  splat.className = "splat";
  splat.style.left = x + "px";
  splat.style.top = y + "px";
  document.body.insertBefore(splat, fly); // before the fly, so it is under it

  draw();
  setTimeout(bringNewFly, NEW_FLY_DELAY);
}

// A new fly comes in from the left or right edge of the area
function bringNewFly() {
  const newFly = fly.cloneNode();
  newFly.className = "fly";
  document.body.appendChild(newFly);
  fly = newFly; // from now on, the code moves the new fly

  const area = getArea();
  x = Math.random() < 0.5 ? 0 : area.width;
  y = randomBetween(0.2, 0.8) * area.height;
  isAlive = true;
  hits = 0;
  startFlying();

  // Fly toward the middle of the area
  heading = Math.atan2(area.height / 2 - y, area.width / 2 - x) * (180 / Math.PI);
  draw();
}

// How far the mouse is from the middle of the fly (in pixels).
// On pages with the big name the fly moves with the page, on other pages it stays on the screen
function distanceToFly(event) {
  const mouseX = isHomePage ? event.pageX : event.clientX;
  const mouseY = isHomePage ? event.pageY : event.clientY;
  return Math.hypot(mouseX - x, mouseY - y);
}

// A click this close to the middle of the fly counts as a hit (a bit more than the fly itself)
function hitDistance() {
  return fly.offsetWidth * 0.9;
}

// True right after a click hit the fly, so that click doesn't also open a link under it
let clickHitFly = false;

// "pointerdown" reacts the moment the button goes down (also a finger tap),
// so a fast fly is easier to hit than with "click"
document.addEventListener("pointerdown", function (event) {
  clickHitFly = false;
  if (!isAlive || distanceToFly(event) > hitDistance()) return;

  clickHitFly = true;
  hits += 1;
  // A resting fly escapes first, a flying fly is squashed
  if (!isFlying && hits === 1) {
    escapeFly();
  } else {
    squashFly();
    document.documentElement.classList.remove("is-near-fly");
  }
});

// A click that hit the fly doesn't open the link under it (like "ME")
document.addEventListener("click", function (event) {
  if (clickHitFly) {
    event.preventDefault();
    clickHitFly = false;
  }
}, true);

// Pages with the big name: the fly takes off when the mouse touches it.
// This counts as the first hit, so one more click squashes it
document.addEventListener("pointerover", function (event) {
  if (isHomePage && event.target === fly && isAlive && !isFlying && hits === 0) {
    escapeFly();
    hits = 1;
  }
});

// Fly swatter: near the fly the mouse turns into a fly swatter
document.addEventListener("pointermove", function (event) {
  const isNear = isAlive && distanceToFly(event) < hitDistance() * 2.5;
  document.documentElement.classList.toggle("is-near-fly", isNear);
});

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
