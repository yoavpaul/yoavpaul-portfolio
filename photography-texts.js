// Photography page: when a row of photos opens (photo-overlays.js), the page changes
// to the text layout from Figma: the photos get smaller and move right,
// and the text about the open project shows on the left, next to its photo.
// When all the rows are closed, the page goes back to the usual layout.
// If a few rows are open, the text of the last one that was opened shows.

{
  const column = document.querySelector(".figma-column");
  const onPhone = window.matchMedia("(max-width: 700px)");
  let shownRow = null; // the row whose text shows now

  // The caption right after a row (or null)
  function captionOf(row) {
    const next = row.nextElementSibling;
    return next && next.classList.contains("photo-caption") ? next : null;
  }

  function showTextOf(row) {
    // Everything back to normal first
    for (const text of document.querySelectorAll(".project-text")) text.hidden = true;
    for (const caption of document.querySelectorAll(".photo-caption.is-hidden")) caption.classList.remove("is-hidden");

    // Keep the clicked photo in the same place on the screen while the layout changes
    const anchor = row || shownRow;
    const topBefore = anchor ? anchor.getBoundingClientRect().top : 0;

    shownRow = row;
    document.body.classList.toggle("is-reading", row !== null);

    if (row) {
      const text = document.getElementById("text-" + row.id);
      if (text) {
        text.hidden = false;
        if (onPhone.matches) {
          // Phones: the text comes right after the photo and its name
          (captionOf(row) || row).after(text);
        } else {
          // Computers: the text stands on the left, at the top of the photo
          column.appendChild(text);
          text.style.top = row.offsetTop + "px";
        }
        // Its name is in the text, so the caption under the photo hides (it keeps its place)
        const caption = captionOf(row);
        if (caption) caption.classList.add("is-hidden");
      }
    }

    if (anchor) {
      window.scrollBy(0, anchor.getBoundingClientRect().top - topBefore);
    }
  }

  // After every click on a row (photo-overlays.js has already opened or closed it)
  document.addEventListener("click", (event) => {
    const row = event.target.closest(".photo-overlay");
    if (!row) return;

    if (row.classList.contains("is-open")) {
      showTextOf(row);
    } else if (row === shownRow) {
      // Its row closed: show the text of another open row, or none
      const otherOpenRow = document.querySelector(".photo-overlay.is-open");
      showTextOf(otherOpenRow);
    }
  });

  // When the window changes size, the text moves with its photo
  window.addEventListener("resize", () => {
    if (shownRow) showTextOf(shownRow);
  });
}
