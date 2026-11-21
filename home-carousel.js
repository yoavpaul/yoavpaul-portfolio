// Home page "over view": a row of all the works that moves from left to right in a loop.
// - It stops under the mouse (or while a finger is on it), and "Random / Index" under it turns into the category (red) / name
//   of the work under the mouse.
// - It can be scrolled sideways: trackpad, mouse wheel or finger.
// - "Random / Index" under it changes the order of the works.
//
// How the endless loop works: the works are in the row twice, one copy after the other.
// The row is scrolled (scrollLeft) between 0 and the width of one copy.
// When it reaches one end it jumps to the same place in the other copy, so nobody sees the jump.
//
// The row moves to the right, so new works come in from the left.
// That is why the works are put in the row in reverse order: this way they come in
// one after the other in the right order (first work first).

const carousel = document.querySelector(".carousel");
const track = document.querySelector(".carousel-track");
const section = document.querySelector(".carousel-section");
const workCategory = document.querySelector(".carousel-category");
const workName = document.querySelector(".carousel-work");
const modeButtons = document.querySelectorAll(".carousel-mode");

const SECONDS_PER_ROUND = 75; // time for all the works to pass once

// The works (links with their cover), in the order of projects.json (the "Random" order).
// They are made at the end of this file, after projects.json has loaded
let works = [];


// People who asked their computer for less movement: no moving by itself (scrolling still works)
const lessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let position = 0;      // where the row is scrolled to (more exact than scrollLeft)
let paused = false;    // true while the mouse (or a finger) is on the row
let lastStepTime = null;   // time of the last step, to move the same speed on every computer

// The width of one copy of the works
function oneCopyWidth() {
  return track.scrollWidth / 2;
}

// Keeps the position inside one copy (this makes the loop endless)
function keepInLoop() {
  const width = oneCopyWidth();
  if (position <= 0) {
    position += width;
  } else if (position >= width) {
    position -= width;
  }
  carousel.scrollLeft = position;
}

// Puts the works in the row (in reverse, see above), and the copy after them
function fillRow(order) {
  const reversed = [...order].reverse();
  track.replaceChildren(...reversed);
  for (const item of reversed) {
    const copy = item.cloneNode(true);
    copy.setAttribute("aria-hidden", "true"); // the copy is only for the loop
    copy.setAttribute("tabindex", "-1");
    track.appendChild(copy);
  }
  // Start with the first work at the right edge of the box, and the next ones to its left
  const first = track.children[reversed.length - 1];
  const space = parseFloat(getComputedStyle(first).marginRight);
  position = oneCopyWidth() - space - carousel.clientWidth;
  keepInLoop();
}

// Moves the row a little to the right, every frame
function step(time) {
  if (lastStepTime !== null && !paused && !lessMotion) {
    const seconds = (time - lastStepTime) / 1000;
    position -= (oneCopyWidth() / SECONDS_PER_ROUND) * seconds;
    keepInLoop();
  }
  lastStepTime = time;
  requestAnimationFrame(step);
}

// --- Stop under the mouse (or a finger), and show the name of the work ---

// A mouse: the row stops while the mouse is on it
carousel.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") paused = true;
});
carousel.addEventListener("pointerleave", (event) => {
  if (event.pointerType !== "mouse") return;
  paused = false;
  clearName();
});

// A finger (phone, tablet): the row stops only while the finger is on it,
// and moves on as soon as the finger is lifted
let lastTouchTime = 0;
carousel.addEventListener("touchstart", () => {
  paused = true;
  lastTouchTime = Date.now();
}, { passive: true });
function fingerLifted(event) {
  if (event.touches.length > 0) return; // another finger is still on the row
  paused = false;
  lastTouchTime = Date.now();
  clearName();
}
carousel.addEventListener("touchend", fingerLifted);
carousel.addEventListener("touchcancel", fingerLifted);

// The category and name of the work under the mouse
function showName(event) {
  const item = event.target.closest(".carousel-item");
  if (!item) {
    clearName();
    return;
  }
  workCategory.textContent = item.dataset.category;
  workName.textContent = item.dataset.name;
  section.classList.add("is-showing-name"); // hides "Random / Index" (see styles.css)
}

function clearName() {
  section.classList.remove("is-showing-name");
}
track.addEventListener("mouseover", showName);
// The keyboard (Tab): the row stops on the work that has the focus.
// (A tap with a finger also gives a work the focus: that one doesn't stop the row)
track.addEventListener("focusin", (event) => {
  if (Date.now() - lastTouchTime < 1000) return;
  paused = true;
  showName(event);
});
track.addEventListener("focusout", () => {
  paused = false;
  clearName();
});

// --- Scrolling by hand ---

// The mouse wheel scrolls the row sideways
carousel.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
    return; // a trackpad already scrolls sideways (see "scroll" below)
  }
  event.preventDefault(); // don't scroll the page
  position += event.deltaY;
  keepInLoop();
}, { passive: false });

// A trackpad or a finger scrolls the row itself: follow it and keep the loop endless
carousel.addEventListener("scroll", () => {
  if (Math.abs(carousel.scrollLeft - position) > 2) {
    position = carousel.scrollLeft;
    keepInLoop();
  }
});

// --- Random / Index ---

function sortedByIndex() {
  return [...works].sort((a, b) => a.dataset.index - b.dataset.index);
}

for (const button of modeButtons) {
  button.addEventListener("click", () => {
    for (const other of modeButtons) {
      other.classList.toggle("is-active", other === button);
      other.setAttribute("aria-pressed", other === button);
    }
    fillRow(button.dataset.mode === "index" ? sortedByIndex() : works);
  });
}

// --- Start (always in Index order), after the works have loaded from projects.json ---
loadProjects().then((projects) => {
  // A work without a cover picture is not shown in the row (how it should look is not designed yet)
  works = projects.filter((project) => project.cover).map(makeCarouselItem);
  fillRow(sortedByIndex());
  requestAnimationFrame(step);
});
