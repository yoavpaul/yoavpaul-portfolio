// Photo overlays (photography page), like the overlays in the Figma prototype:
// a click on a photo opens a row with more photos from the same project, to the right of it.
// The photo you clicked is the first photo of the row, and the whole row scrolls sideways
// (also with the mouse wheel). A second click on the same photo closes the row.
// Every row opens and closes on its own, so a few rows can be open together.

for (const overlay of document.querySelectorAll(".photo-overlay")) {
  const photo = overlay.querySelector(".photo-box");

  // Click on the photo: open the row, or close it if it is open
  photo.addEventListener("click", () => {
    const isOpen = overlay.classList.toggle("is-open");
    photo.setAttribute("aria-expanded", isOpen);

    // When the row closes, it goes back to the start
    if (!isOpen) {
      overlay.scrollLeft = 0;
    }
  });

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
