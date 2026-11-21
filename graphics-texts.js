// Graphics page: only the names of the works open things (a click on the work itself doesn't).
// A click on a name opens its text on the left, and the page changes to the text layout from Figma
// ("graphics option with text"): the works move right, so the texts have room.
//   - I'M HERE? (data-row): its row of posters opens and closes together with its text.
//   - On The Line - Soccer (data-panel): it also opens the whole project on the screen, on the grass
//     (project-panels.js). When the project closes, its text stays open.
// A second click on a name closes its text. A few texts can be open together.
// When all are closed, the page goes back to the first layout.
// (The text layout itself is in styles.css: "body.is-reading")

{
  const names = document.querySelectorAll(".caption-button");

  // The row of a name (only I'M HERE? has one), or null
  function rowOf(name) {
    return name.dataset.row ? document.getElementById(name.dataset.row) : null;
  }

  function isOpen(name) {
    return name.getAttribute("aria-expanded") === "true";
  }

  // Opens or closes the text of a name (and its row or project, if it has one)
  function setText(name, open) {
    const text = document.getElementById(name.getAttribute("aria-controls"));
    text.hidden = !open;
    name.setAttribute("aria-expanded", open);

    // The row follows the text (photo-overlays.js opens or closes it on "toggle-row")
    const row = rowOf(name);
    if (row && row.classList.contains("is-open") !== open) {
      row.dispatchEvent(new Event("toggle-row"));
    }

    // The text layout is on while at least one text is open
    document.body.classList.toggle("is-reading", [...names].some(isOpen));

    // The whole project opens on top (after the layout changed, so the text is ready under it)
    if (open && name.dataset.panel) {
      openProjectPanel(name);
    }
  }

  for (const name of names) {
    name.addEventListener("click", () => {
      // The name you clicked stays in the same place on the screen while the layout changes
      const topBefore = name.getBoundingClientRect().top;
      setText(name, !isOpen(name));
      window.scrollBy(0, name.getBoundingClientRect().top - topBefore);
    });

    // When the I'M HERE? row is closed with a click on a poster, its text closes too
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
