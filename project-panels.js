// Project panels (branding page): a click on a project's photo opens the whole project
// on top of the page, as high as the screen. It scrolls only sideways
// (trackpad, mouse wheel or finger). A click on any work, or the Esc key, closes it.
// Videos in a panel play only while it is open. On a dark panel the top bar turns white.

let openPanel = null;    // the panel that is open now
let panelButton = null;  // the photo that opened it
const rotateHint = document.querySelector(".rotate-hint"); // "Turn your phone sideways" (only on upright phones)

function openProjectPanel(button) {
  panelButton = button;
  openPanel = document.getElementById(button.dataset.panel);
  openPanel.hidden = false;
  openPanel.scrollLeft = 0;
  document.body.classList.add("has-open-panel"); // no page scroll (see styles.css)
  // A dark panel (not "is-light") makes the top bar white
  document.body.classList.toggle("has-dark-panel", !openPanel.classList.contains("is-light"));
  for (const video of openPanel.querySelectorAll("video")) video.play();
  openPanel.focus();
  rotateHint.hidden = false; // phone.css shows it only on a phone held upright
}

function closeProjectPanel() {
  if (!openPanel) return;
  for (const video of openPanel.querySelectorAll("video")) video.pause();
  openPanel.hidden = true;
  rotateHint.hidden = true;
  document.body.classList.remove("has-open-panel", "has-dark-panel");
  panelButton.focus();
  openPanel = null;
  panelButton = null;
}

// A click on a project's photo opens its panel.
// (The names on the graphics page, "caption-button", open their panel from graphics-texts.js)
for (const button of document.querySelectorAll("[data-panel]:not(.caption-button)")) {
  button.addEventListener("click", () => openProjectPanel(button));
}

for (const panel of document.querySelectorAll(".project-panel")) {
  // A click on any work closes the panel
  panel.addEventListener("click", (event) => {
    if (event.target.closest(".panel-item")) {
      closeProjectPanel();
    }
  });

  // The mouse wheel scrolls the panel sideways (it has nothing to scroll up or down)
  panel.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      panel.scrollLeft += event.deltaY;
    }
  }, { passive: false });
}

// Coming from a link to a project (like branding.html#the-lodge from the home page):
// its panel opens right away
const linkedButton = location.hash && document.querySelector(location.hash + "[data-panel]");
if (linkedButton) {
  openProjectPanel(linkedButton);
}

// A tap on the note hides it (the project stays open)
rotateHint.addEventListener("click", () => {
  rotateHint.hidden = true;
});

// The Esc key closes the panel
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectPanel();
  }
});

// The tags swing under the mouse (see .is-tag in styles.css).
// The swing always plays to the end, even if the mouse leaves before, so it never jumps
for (const tag of document.querySelectorAll(".panel-item.is-tag")) {
  tag.addEventListener("mouseenter", () => {
    tag.classList.add("is-swinging");
  });
  tag.addEventListener("animationend", () => {
    tag.classList.remove("is-swinging");
  });
}
