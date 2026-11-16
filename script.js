// A fly that flies around the screen at random, like a real fly:
// it buzzes around, changes direction suddenly, and lands for a moment.
// A click on a resting fly makes it escape, a click on a flying fly squashes it,
// and 2 seconds later a new fly comes in (already flying, so one click is enough).
// A click close to the fly also counts, and near the fly the mouse turns into a fly swatter
// (see "Fly swatter" in styles.css). To keep it a challenge, a flying fly sometimes
// feels the swatter coming and darts away.
// Every squashed fly looks a little different: its own splat and its own squashed shape.
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

  // A squashed fly is wider, flatter and a little twisted (different for every fly, see squashFly)
  const squash = isAlive ? "" : squashShape;

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

// The shape of the squashed fly (made new for every fly in squashFly)
let squashShape = "";

// Squashes the fly and leaves a splat under it
function squashFly() {
  isAlive = false;
  isFlying = false;
  fly.classList.remove("is-flying");
  fly.classList.add("is-squashed");

  // Flatter or wider, a little turned and slanted: never the same twice
  squashShape =
    ` rotate(${randomBetween(-25, 25)}deg)` +
    ` skewX(${randomBetween(-18, 18)}deg)` +
    ` scale(${randomBetween(1.15, 1.45)}, ${randomBetween(0.35, 0.6)})`;

  const splat = makeSplat();
  splat.style.left = x + "px";
  splat.style.top = y + "px";
  document.body.insertBefore(splat, fly); // before the fly, so it is under it

  draw();
  setTimeout(bringNewFly, NEW_FLY_DELAY);
}

// A splat drawn at random (SVG), so every one is different:
// an uneven blob with a darker middle, a little yellow-brown from the fly's inside,
// and drops and short streaks that flew out to the sides
const SVG = "http://www.w3.org/2000/svg";

function svgElement(name, attributes) {
  const element = document.createElementNS(SVG, name);
  for (const key in attributes) element.setAttribute(key, attributes[key]);
  return element;
}

// An uneven round shape: points around a circle at random distances,
// joined with soft curves (the size is about "radius", "spikes" = how many arms stick out)
function blobPath(radius, spikes) {
  const count = Math.floor(randomBetween(11, 17));
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + randomBetween(-0.15, 0.15);
    let distance = radius * randomBetween(0.75, 1.1);
    if (Math.random() < spikes) distance = radius * randomBetween(1.3, 1.7); // an arm
    points.push([Math.cos(angle) * distance, Math.sin(angle) * distance]);
  }
  // A curve through the middle of each pair of points, bent by the point itself
  const middle = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let start = middle(points[count - 1], points[0]);
  let path = `M ${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < count; i++) {
    const end = middle(points[i], points[(i + 1) % count]);
    path += ` Q ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
  }
  return path + " Z";
}

function makeSplat() {
  const svg = svgElement("svg", { viewBox: "-100 -100 200 200", "aria-hidden": "true" });
  svg.classList.add("splat");
  // A different size for every splat (compared to the fly)
  svg.style.setProperty("--splat-size", randomBetween(1.8, 2.4).toFixed(2));

  // Dark red, a little different every time
  const hue = randomBetween(352, 368) % 360;
  const red = `hsl(${hue.toFixed(0)} ${randomBetween(70, 90).toFixed(0)}% ${randomBetween(24, 34).toFixed(0)}%)`;
  const darkRed = `hsl(${hue.toFixed(0)} 80% ${randomBetween(12, 18).toFixed(0)}%)`;

  const group = svgElement("g", { transform: `rotate(${randomBetween(0, 360).toFixed(0)})` });
  group.appendChild(svgElement("path", { d: blobPath(randomBetween(34, 44), 0.3), fill: red, opacity: 0.88 }));
  group.appendChild(svgElement("path", { d: blobPath(randomBetween(14, 22), 0.15), fill: darkRed, opacity: 0.7 }));
  // A little yellow-brown from the fly's inside
  group.appendChild(svgElement("path", {
    d: blobPath(randomBetween(6, 11), 0),
    fill: "hsl(40 45% 32%)",
    opacity: 0.55,
    transform: `translate(${randomBetween(-10, 10).toFixed(1)} ${randomBetween(-10, 10).toFixed(1)})`,
  }));

  // Drops and short streaks around it, pointing away from the middle
  const drops = Math.floor(randomBetween(4, 10));
  for (let i = 0; i < drops; i++) {
    const angle = randomBetween(0, 360);
    const distance = randomBetween(55, 90);
    const isStreak = Math.random() < 0.4;
    const length = isStreak ? randomBetween(5, 10) : randomBetween(1.5, 6);
    const width = isStreak ? randomBetween(1.2, 2.8) : length * randomBetween(0.8, 1);
    group.appendChild(svgElement("ellipse", {
      cx: distance, cy: 0, rx: length, ry: width,
      fill: red,
      opacity: randomBetween(0.7, 0.95).toFixed(2),
      transform: `rotate(${angle.toFixed(0)})`,
    }));
  }

  svg.appendChild(group);
  return svg;
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

// A click this close to the middle of the fly counts as a hit (a little more than its body)
function hitDistance() {
  return fly.offsetWidth * 0.6;
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

// Fly swatter: near the fly the mouse turns into a fly swatter.
// When the swatter comes close to a flying fly, sometimes (1 in 3) the fly feels it
// and darts away from it, fast
let swatterWasNear = false;
const DODGE_CHANCE = 0.35;

document.addEventListener("pointermove", function (event) {
  const distance = distanceToFly(event);
  const isNear = isAlive && distance < hitDistance() * 3;
  document.documentElement.classList.toggle("is-near-fly", isNear);

  const isClose = isAlive && distance < hitDistance() * 1.8;
  if (isClose && !swatterWasNear && isFlying && Math.random() < DODGE_CHANCE) {
    const mouseX = isHomePage ? event.pageX : event.clientX;
    const mouseY = isHomePage ? event.pageY : event.clientY;
    const awayFromMouse = Math.atan2(y - mouseY, x - mouseX) * (180 / Math.PI);
    heading = awayFromMouse + randomBetween(-40, 40);
    speed = MAX_SPEED;
    timeLeft = Math.max(timeLeft, 0.6); // it doesn't land right away
  }
  swatterWasNear = isClose;
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
