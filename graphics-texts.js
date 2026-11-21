// Graphics page: only the names of the works open things (a click on the work itself doesn't).
// A click on a name opens its text on the left, and the page changes to the text layout from Figma
// ("graphics option with text"): the works move right, so the texts have room.
// I'M HERE? and On The Line - Soccer (data-row): their row opens and closes together with their text.
// While a text is open, the name under its work hides (it is in the text).
// A click on the open text closes it: the work goes back to how it was (its row closes)
// and its name comes back. A few texts can be open together.
// When all are closed, the page goes back to the first layout.
// (The text layout itself is in styles.css: "body.is-reading")

{
  const names = document.querySelectorAll(".caption-button");

  // The row of a name (I'M HERE? and Soccer have one), or null
  function rowOf(name) {
    return name.dataset.row ? document.getElementById(name.dataset.row) : null;
  }

  function isOpen(name) {
    return name.getAttribute("aria-expanded") === "true";
  }

  // Opens or closes the text of a name (and its row, if it has one)
  function setText(name, open) {
    const text = document.getElementById(name.getAttribute("aria-controls"));
    text.hidden = !open;
    name.setAttribute("aria-expanded", open);

    // While the text is open, the name under the work hides (it is in the text). It keeps its place
    name.closest(".photo-caption").classList.toggle("is-hidden", open);

    // The row follows the text (photo-overlays.js opens or closes it on "toggle-row")
    const row = rowOf(name);
    if (row && row.classList.contains("is-open") !== open) {
      row.dispatchEvent(new Event("toggle-row"));
    }

    // The text layout is on while at least one text is open
    document.body.classList.toggle("is-reading", [...names].some(isOpen));
  }

  // Opens or closes a text after a click; "kept" (the name, or the work) stays in the same place
  // on the screen while the layout changes
  function clickText(name, open, kept) {
    const topBefore = kept.getBoundingClientRect().top;
    setText(name, open);
    window.scrollBy(0, kept.getBoundingClientRect().top - topBefore);
  }

  for (const name of names) {
    // A click on the name opens its text, or closes it
    name.addEventListener("click", () => clickText(name, !isOpen(name), name));

    // A click on the open text closes it (the page stays at its work)
    const text = document.getElementById(name.getAttribute("aria-controls"));
    text.addEventListener("click", () => clickText(name, false, name));

    // When a row is closed with a click on one of its photos, its text closes too
    const row = rowOf(name);
    if (row) {
      row.addEventListener("click", () => {
        if (isOpen(name) && !row.classList.contains("is-open")) {
          setText(name, false);
        }
      });
    }
  }

  // Coming from a link to a work (like graphics.html#soccer-joint from the home page or the index):
  // its name is "clicked" right away, and the page goes to it
  const linkedName = location.hash && document.querySelector(`.caption-button[aria-controls="text-${location.hash.slice(1)}"]`);
  if (linkedName) {
    document.addEventListener("DOMContentLoaded", () => {
      setText(linkedName, true);
      document.querySelector(location.hash).scrollIntoView({ block: "start" });
    });
  }
}
