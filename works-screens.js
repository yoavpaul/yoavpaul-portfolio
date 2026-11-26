// Photography and graphics pages: every work shows on the page with its name under it
// (the rows of photos are open all the time; the books turn their pages by themselves).
// A click on a work (or its name, or Enter on the name) opens the work on a screen of its own,
// like the branding projects (project-panels.js opens and closes it): its text and all its parts
// (photos, books, videos) in one row that scrolls sideways, without the other works under it.
// On that screen:
//   - bottom left "‹ Photography" / "‹ Graphics" goes back to the page (Esc too),
//   - bottom right "‹ 2 / 5 ›" opens the work before / after (panel-nav.js).
//   - the arrow keys ← → scroll it (project-panels.js), and a click on a book turns its pages.
// Next to the mouse, on the page, a tag says "Open the project".
// A work on the page = a row of photos (.photo-overlay) or a book (.book) in the column of works.
// Its text = <aside id="text-" + the id of the work>. Its name = the caption right after it.
// This file is loaded before photo-overlays.js, book-pages.js and project-panels.js (they use what it makes).

{
  // The names under the works become buttons (so they can be clicked, and reached with Tab)
  const rows = [...document.querySelectorAll(".figma-column > .photo-overlay, .figma-column > .book")];
  for (const row of rows) {
    const caption = row.nextElementSibling;
    if (!caption || !caption.classList.contains("photo-caption")) continue;
    if (!caption.querySelector(".caption-button")) {
      const button = document.createElement("button");
      button.className = "caption-button";
      button.type = "button";
      button.textContent = caption.textContent;
      caption.replaceChildren(button);
    }
  }

  // The screen of each work (a "panel"): its text, then all its parts (copied from the page)
  for (const row of rows) {
    const panel = document.createElement("div");
    panel.className = "project-panel is-light";
    panel.id = "panel-" + row.id;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("tabindex", "-1");
    panel.hidden = true;

    // A work can have an exact layout from its Figma frame: <template id="screen-" + its id> (graphics.html).
    // Without one: its text, then its parts in a row, as high as each other (photography)
    const layout = document.getElementById("screen-" + row.id);
    const stage = document.createElement("div");
    stage.className = layout ? "screen-stage" : "photo-panel-stage";
    if (layout) {
      stage.style.setProperty("--width", layout.dataset.width);
      stage.appendChild(layout.content.cloneNode(true));
    }
    // The place of the text and of each part in the exact layout ([data-part="text"], [data-part="1"]...)
    const slot = (name) => (layout ? stage.querySelector(`[data-part="${name}"]`) : null) || stage;

    const text = document.getElementById("text-" + row.id);
    if (text) {
      const copy = text.cloneNode(true);
      copy.removeAttribute("id");
      copy.removeAttribute("style");
      copy.hidden = false;
      copy.className = "project-text photo-panel-text";
      slot("text").appendChild(copy);
      panel.setAttribute("aria-label", copy.querySelector("h2").textContent.trim());
    }

    // Each part in the shape it has on the page (from Figma), cut the same way.
    // A book is copied whole (book-pages.js makes the copy turn its pages too)
    const parts = row.classList.contains("book") ? [row] : row.querySelectorAll(".photo-box, .photo-overlay-row > div");
    let partNumber = 0;
    for (const part of parts) {
      partNumber += 1;
      const isFirst = part.classList.contains("photo-box");
      const width = parseFloat(part.style.getPropertyValue(isFirst ? "--width" : "--w"));
      const height = parseFloat(part.style.getPropertyValue(isFirst ? "--height" : "--h"));
      const box = document.createElement("div");
      box.className = "photo-panel-photo"; // (not "panel-item": a click on it doesn't close the screen)
      if (part.classList.contains("has-line")) box.classList.add("has-line"); // its thin gray line too
      box.style.aspectRatio = width + " / " + height;
      if (part.classList.contains("book")) {
        const book = part.cloneNode(true);
        book.removeAttribute("id");
        book.removeAttribute("style");
        book.classList.remove("photo-box", "from-left");
        box.appendChild(book);
      } else {
        box.appendChild(part.querySelector("img, video").cloneNode(true));
      }
      const img = box.querySelector("img");
      if (img) {
        img.sizes = "70vh";
        img.loading = "lazy";
      }
      slot(String(partNumber)).appendChild(box);
    }
    panel.appendChild(stage);
    // Before the arrows, so Tab goes from the screen to its arrows
    document.body.insertBefore(panel, document.querySelector(".panel-back"));

    // A click on the row (its first photo is a button, for Tab and Enter) or on its name opens it
    row.dataset.panel = panel.id;
    const name = row.nextElementSibling && row.nextElementSibling.querySelector(".caption-button");
    if (name) name.dataset.panel = panel.id;
  }

  // The tag next to the mouse on the page: "Open the project" (the same look as the tag on the home page)
  const tag = document.createElement("p");
  tag.className = "carousel-tag";
  tag.setAttribute("aria-hidden", "true");
  tag.textContent = "Open the project";
  document.body.appendChild(tag);

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const overWork = event.target.closest(".photo-overlay") && !document.body.classList.contains("has-open-panel");
    tag.classList.toggle("is-shown", Boolean(overWork));
    if (overWork) tag.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 22}px)`;
  });
  document.addEventListener("click", () => tag.classList.remove("is-shown"));
  document.addEventListener("mouseleave", () => tag.classList.remove("is-shown"));
}
