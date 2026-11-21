// Photo overlays (photography and branding pages), like the overlays in the Figma prototype:
// a click on a photo opens a row with more photos from the same project, to the right of it.
// The photo you clicked is the first photo of the row, and the whole row scrolls sideways
// (also with the mouse wheel). A click on any photo of an open row closes it.
// Every row opens and closes on its own, so a few rows can be open together.

for (const overlay of document.querySelectorAll(".photo-overlay")) {
  const photo = overlay.querySelector(".photo-box");

  // Opens the row, or closes it if it is open
  function toggleRow() {
    const isOpen = overlay.classList.toggle("is-open");
    photo.setAttribute("aria-expanded", isOpen);

    // When the row closes, it goes back to the start
    if (!isOpen) {
      overlay.scrollLeft = 0;
    }

    // Videos in the row (branding page) play only while the row is open
    for (const video of overlay.querySelectorAll(".photo-overlay-row > div video")) {
      if (isOpen) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  // Click on the first photo: open or close the row
  photo.addEventListener("click", toggleRow);

  // Click on one of the other photos (they show only when the row is open): close the row
  for (const otherPhoto of overlay.querySelectorAll(".photo-overlay-row > div")) {
    otherPhoto.addEventListener("click", toggleRow);
  }

  // The mouse wheel scrolls an open row sideways.
  // At the start or the end of the row the page scrolls as usual.
  overlay.addEventListener("wheel", (event) => {
    // A closed row doesn't scroll, and a trackpad can already scroll sideways
    if (!overlay.classList.contains("is-open") || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
      return;
    }

    const end = overlay.scrollWidth - overlay.clientWidth;
    const atStart = overlay.scrollLeft <= 0 && event.deltaY < 0;
    const atEnd = overlay.scrollLeft >= end - 1 && event.deltaY > 0;
    if (atStart || atEnd) {
      return;
    }

    event.preventDefault(); // don't scroll the page
    overlay.scrollLeft += event.deltaY;
  }, { passive: false });
}

// Coming from a link to a project (like photography.html#megi-solar from the home page or the index):
// its row opens right away (on the photography page with its text), and the page goes to it.
// "DOMContentLoaded" = when all the scripts of the page are ready (so photography-texts.js
// also hears the click), without waiting for all the photos to load.
// When everything has loaded, the page goes to the row once more (in case something above it moved)
const linkedRow = location.hash && document.querySelector(location.hash + ".photo-overlay");
if (linkedRow) {
  document.addEventListener("DOMContentLoaded", () => {
    linkedRow.querySelector(".photo-box").click();
    linkedRow.scrollIntoView({ block: "start" });
  });
  window.addEventListener("load", () => {
    linkedRow.scrollIntoView({ block: "start" });
  });
}
