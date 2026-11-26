// Photo overlays (photography and branding pages), like the overlays in the Figma prototype:
// a click on a photo opens a row with more photos from the same project, to the right of it.
// The photo you clicked is the first photo of the row, and the whole row scrolls sideways
// (also with the mouse wheel). A click on any photo of an open row closes it.
// Every row opens and closes on its own, so a few rows can be open together.

// --- Even rows (photography page: <main class="has-even-rows">) ---
// Every photo of a row gets the height of the first photo, keeps its own shape (--w / --h),
// and stands --photo-row-gap Figma pixels after the one before it (styles.css).
// This writes the places and sizes the CSS uses: --x, --y, --w, --h on each photo,
// --width on the row, and --scale-open (how much the row shrinks when the page shows the texts:
// as much as the first photo, so the photos still have its height)
// (A function, so the spacing tool, photography.html?tune, can place them again with another space)
function layoutEvenRows() {
  const rowGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--photo-row-gap"));
  for (const overlay of document.querySelectorAll(".has-even-rows .photo-overlay")) {
    const firstPhoto = overlay.querySelector(".photo-box");
    const row = overlay.querySelector(".photo-overlay-row");
    const width = parseFloat(firstPhoto.style.getPropertyValue("--width"));
    const height = parseFloat(firstPhoto.style.getPropertyValue("--height"));
    const heightOpen = parseFloat(firstPhoto.style.getPropertyValue("--height-open")) || height;

    let x = width + rowGap; // the next photo starts after the first one and a space
    for (const photo of row.querySelectorAll(":scope > div")) {
      const shape = parseFloat(photo.style.getPropertyValue("--w")) / parseFloat(photo.style.getPropertyValue("--h"));
      const photoWidth = height * shape;
      photo.style.setProperty("--x", x);
      photo.style.setProperty("--y", 0);
      photo.style.setProperty("--w", photoWidth);
      photo.style.setProperty("--h", height);
      x += photoWidth + rowGap;
    }
    row.style.setProperty("--width", x - rowGap);
    overlay.style.setProperty("--scale-open", heightOpen / height);
    // In the text layout the first photo keeps exactly its shape too, so the first space is like the others
    firstPhoto.style.setProperty("--width-open", width * heightOpen / height);
  }
}
layoutEvenRows();

for (const overlay of document.querySelectorAll(".photo-overlay")) {
  const photo = overlay.querySelector(".photo-box");

  // Photography page (even rows) and rows with "data-always-open" (graphics page): open all the time.
  // A click on a work opens its own screen (works-screens.js, project-panels.js),
  // so the rows themselves do nothing. Their videos play
  if (overlay.closest(".has-even-rows") || overlay.hasAttribute("data-always-open")) {
    overlay.classList.add("is-open");
    photo.setAttribute("aria-expanded", "true");
    for (const video of overlay.querySelectorAll(".photo-overlay-row > div video")) video.play();
    continue; // (the mouse wheel scrolls the page, not the row, so the page is easy to scroll)
  }

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

// Coming from a link to a project (like graphics.html#im-here from the home page or the index):
// its row opens right away, and the page goes to it.
// "DOMContentLoaded" = when all the scripts of the page are ready (so photography-texts.js
// also hears the click), without waiting for all the photos to load.
// When everything has loaded, the page goes to the row once more (in case something above it moved)
// (On the photography and graphics pages project-panels.js opens the work's own screen instead)
const linkedRow = location.hash && document.querySelector(location.hash + ".photo-overlay:not(.has-even-rows *):not([data-always-open])");
if (linkedRow) {
  document.addEventListener("DOMContentLoaded", () => {
    linkedRow.querySelector(".photo-box").click();
    linkedRow.scrollIntoView({ block: "start" });
  });
  window.addEventListener("load", () => {
    linkedRow.scrollIntoView({ block: "start" });
  });
}
