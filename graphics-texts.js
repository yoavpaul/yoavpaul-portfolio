// Graphics page: a click on the name of a work (under it) opens its text on the left,
// and the page changes to the text layout from Figma ("graphics option with text"):
// the works move right, so the texts have room. A second click on the name closes the text.
// A few texts can be open together. When all are closed, the page goes back to the first layout.
// I'M HERE? has a row of posters: it opens and closes together with its text.
// (The text layout itself is in styles.css: "body.is-reading")

{
  const names = document.querySelectorAll(".caption-button");

  // The row of a name (only I'M HERE? has one), or null
  function rowOf(name) {
    return name.dataset.row ? document.getElementById(name.dataset.row) : null;
  }

  // Opens or closes the text of a name (and its row, if it has one)
  function setText(name, open) {
    const text = document.getElementById(name.getAttribute("aria-controls"));
    text.hidden = !open;
    name.setAttribute("aria-expanded", open);

    // The row follows the text. A click on its first poster opens or closes it (photo-overlays.js)
    const row = rowOf(name);
    if (row && row.classList.contains("is-open") !== open) {
      row.querySelector(".photo-box").click();
    }

    // The text layout is on while at least one text is open
    const anyOpen = [...names].some((other) => other.getAttribute("aria-expanded") === "true");
    document.body.classList.toggle("is-reading", anyOpen);
  }

  for (const name of names) {
    name.addEventListener("click", () => {
      // The name you clicked stays in the same place on the screen while the layout changes
      const topBefore = name.getBoundingClientRect().top;
      setText(name, name.getAttribute("aria-expanded") !== "true");
      window.scrollBy(0, name.getBoundingClientRect().top - topBefore);
    });
  }

  // When the I'M HERE? row is closed with a click on a poster, its text closes too
  for (const name of names) {
    const row = rowOf(name);
    if (!row) continue;
    row.addEventListener("click", () => {
      const textOpen = name.getAttribute("aria-expanded") === "true";
      if (textOpen && !row.classList.contains("is-open")) {
        setText(name, false);
      }
    });
  }
}
