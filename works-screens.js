// Photography and graphics pages: every work shows on the page with its name under it
// (the rows of photos are open all the time; the books turn their pages by themselves).
// A click on a work (or its name, or Enter on the name) opens the work on a screen of its own,
// like the branding projects (project-panels.js opens and closes it): its text and all its parts
// (photos, books, videos) in one row that scrolls sideways, without the other works under it.
// On that screen:
//   - bottom left "‹ Photography" / "‹ Graphics" goes back to the page (Esc too),
//   - bottom right "‹ 2 / 5 ›" opens the work before / after (after the last one comes the first).
//     Under the mouse they say where they lead ("Next work: Megi Solar", the name in red).
//   - the arrow keys ← → scroll it (project-panels.js), and a click on a book turns its pages.
// Next to the mouse, on the page, a tag says "Open the project".
// A work on the page = a row of photos (.photo-overlay) or a book (.book) in the column of works.
// Its text = <aside id="text-" + the id of the work>. Its name = the caption right after it.
// This file is loaded before photo-overlays.js, book-pages.js and project-panels.js (they use what it makes).

{
  // The names under the works become buttons (so they can be clicked, and reached with Tab).
  // "Dissociative self" has a name only in the text layout in Figma: here it shows always,
  // so it stands under its photo, like the other names
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
    if (caption.classList.contains("only-open")) {
      caption.style.setProperty("--left", row.style.getPropertyValue("--left"));
      caption.style.setProperty("--space-before", 19);
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

    const stage = document.createElement("div");
    stage.className = "photo-panel-stage";
    const text = document.getElementById("text-" + row.id);
    if (text) {
      const copy = text.cloneNode(true);
      copy.removeAttribute("id");
      copy.hidden = false;
      copy.className = "project-text photo-panel-text";
      stage.appendChild(copy);
      panel.setAttribute("aria-label", copy.querySelector("h2").textContent.trim());
    }

    // Each part in the shape it has on the page (from Figma), cut the same way.
    // A book is copied whole (book-pages.js makes the copy turn its pages too)
    const parts = row.classList.contains("book") ? [row] : row.querySelectorAll(".photo-box, .photo-overlay-row > div");
    for (const part of parts) {
      const isFirst = part.classList.contains("photo-box");
      const width = parseFloat(part.style.getPropertyValue(isFirst ? "--width" : "--w"));
      const height = parseFloat(part.style.getPropertyValue(isFirst ? "--height" : "--h"));
      const box = document.createElement("div");
      box.className = "photo-panel-photo"; // (not "panel-item": a click on it doesn't close the screen)
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
      stage.appendChild(box);
    }
    panel.appendChild(stage);
    // Before the arrows, so Tab goes from the screen to its arrows
    document.body.insertBefore(panel, document.querySelector(".panel-back"));

    // A click on the row (its first photo is a button, for Tab and Enter) or on its name opens it
    row.dataset.panel = panel.id;
    const name = row.nextElementSibling && row.nextElementSibling.querySelector(".caption-button");
    if (name) name.dataset.panel = panel.id;
  }

  // "‹ 2 / 5 ›": the work before / which work it is / the next work.
  // (openProjectPanel and closeProjectPanel are in project-panels.js)
  const count = document.querySelector(".panel-count");
  const openIndex = () => {
    const openPanel = document.querySelector(".project-panel:not([hidden])");
    return openPanel ? rows.findIndex((row) => row.dataset.panel === openPanel.id) : -1;
  };
  const showCount = () => {
    count.textContent = (openIndex() + 1) + " / " + rows.length;
  };
  const rowAfter = (step) => rows[(openIndex() + step + rows.length) % rows.length];
  const goTo = (step) => {
    if (openIndex() === -1) return;
    const next = rowAfter(step);
    closeProjectPanel();
    openProjectPanel(next);
    showCount();
  };

  // Under the mouse (or with Tab), the arrows say where they lead, above them:
  // "Next work: Megi Solar". The name of a work = the name in its text (the panel's aria-label)
  const nameOf = (row) => document.getElementById(row.dataset.panel).getAttribute("aria-label");
  const navHint = document.querySelector(".panel-nav .panel-hint");
  for (const [selector, step, words] of [[".panel-prev", -1, "Previous work: "], [".panel-next", 1, "Next work: "]]) {
    const arrow = document.querySelector(selector);
    // Two parts, so each one can have its own color: "Next work: " and the name
    const showHint = () => {
      if (openIndex() === -1) return;
      const wordsPart = document.createElement("span");
      wordsPart.className = "panel-hint-words";
      wordsPart.textContent = words;
      const namePart = document.createElement("span");
      namePart.className = "panel-hint-name";
      namePart.textContent = nameOf(rowAfter(step));
      navHint.replaceChildren(wordsPart, namePart);
    };
    const hideHint = () => navHint.replaceChildren();
    arrow.addEventListener("click", () => {
      goTo(step);
      arrow.focus(); // (with the keyboard, Enter again goes on to the one after)
      showHint(); // the mouse is still there: now it leads to the one after
    });
    arrow.addEventListener("mouseenter", showHint);
    arrow.addEventListener("focus", showHint);
    arrow.addEventListener("mouseleave", hideHint);
    arrow.addEventListener("blur", hideHint);
  }

  // A work opens with a click on it, or from a link (photography.html#megi-solar)
  document.addEventListener("click", showCount);
  document.addEventListener("DOMContentLoaded", showCount);

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
