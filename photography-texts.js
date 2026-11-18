// Photography page: when a row of photos opens (photo-overlays.js), the page changes
// to the text layout from Figma: the photos get smaller and move right,
// and the text about the open project shows on the left, next to its photo.
// Every open row shows its own text, so a few texts (and rows) can be open together.
// A row and its text stay open until that project is clicked again.
// When all the rows are closed, the page goes back to the usual layout.

{
  const column = document.querySelector(".figma-column");
  const onPhone = window.matchMedia("(max-width: 700px)");

  // The caption right after a row (or null)
  function captionOf(row) {
    const next = row.nextElementSibling;
    return next && next.classList.contains("photo-caption") ? next : null;
  }

  // Shows the text of every open row, and hides the others.
  // "clickedRow" stays in the same place on the screen while the layout changes
  function updateTexts(clickedRow) {
    const topBefore = clickedRow ? clickedRow.getBoundingClientRect().top : 0;
    const openRows = [...document.querySelectorAll(".photo-overlay.is-open")];

    // The text layout is on while at least one row is open
    document.body.classList.toggle("is-reading", openRows.length > 0);

    for (const row of document.querySelectorAll(".photo-overlay")) {
      const text = document.getElementById("text-" + row.id);
      const caption = captionOf(row);
      const isOpen = openRows.includes(row);

      // Its name is in the text, so the caption under the photo hides (it keeps its place)
      if (caption) caption.classList.toggle("is-hidden", isOpen && text !== null);
      if (!text) continue;

      text.hidden = !isOpen;
      if (!isOpen) continue;

      if (onPhone.matches) {
        // Phones: the text comes right after the photo and its name
        (caption || row).after(text);
      } else {
        // Computers: the text stands on the left, at the top of the photo
        column.appendChild(text);
      }
    }

    // On computers each text goes to the top of its photo
    // (after the layout changed, so the places are right)
    if (!onPhone.matches) {
      for (const row of openRows) {
        const text = document.getElementById("text-" + row.id);
        if (text) text.style.top = row.offsetTop + "px";
      }
    }

    if (clickedRow) {
      window.scrollBy(0, clickedRow.getBoundingClientRect().top - topBefore);
    }
  }

  // After every click on a row (photo-overlays.js has already opened or closed it)
  document.addEventListener("click", (event) => {
    const row = event.target.closest(".photo-overlay");
    if (row) updateTexts(row);
  });

  // When the window changes size, the texts move with their photos
  window.addEventListener("resize", () => updateTexts(null));
}
