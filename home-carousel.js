// Home page "over view": a row of all the works that moves from left to right in a loop.
// The moving itself is a CSS animation (see "Over view" in styles.css).
// This script:
// 1. Copies the works once more, so the row never ends (the copy follows the original).
// 2. Shows the name of the work under the mouse above the row.

const track = document.querySelector(".carousel-track");
const carousel = document.querySelector(".carousel");
const workName = document.querySelector(".carousel-name");

// 1. The copy: hidden from screen readers and from the Tab key, it is only for the loop
for (const item of [...track.children]) {
  const copy = item.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  copy.setAttribute("tabindex", "-1");
  track.appendChild(copy);
}

// 2. The name of the work under the mouse (or in focus with the Tab key)
function showName(event) {
  const item = event.target.closest(".carousel-item");
  workName.textContent = item ? item.dataset.name : "";
}

track.addEventListener("mouseover", showName);
track.addEventListener("focusin", showName);
carousel.addEventListener("mouseleave", () => {
  workName.textContent = "";
});
track.addEventListener("focusout", () => {
  workName.textContent = "";
});
