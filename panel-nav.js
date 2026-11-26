// The works' own screens (branding, photography and graphics pages): "‹ 2 / 5 ›" at the bottom right.
//   ‹ / › open the work before / after (after the last one comes the first), "2 / 5" = which work it is.
//   Under the mouse (or with Tab) they say where they lead, above them: "Next work: Megi Solar" (the name in red).
// The works = everything that opens a screen ([data-panel]), in their order on the page (one per screen).
// The name of a work = its screen's aria-label.
// (openProjectPanel and closeProjectPanel are in project-panels.js, loaded before this file)

{
  // One opener for each screen, in the order of the page
  const rows = [];
  for (const opener of document.querySelectorAll("[data-panel]")) {
    if (!rows.some((row) => row.dataset.panel === opener.dataset.panel)) rows.push(opener);
  }

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

  // Under the mouse (or with Tab), the arrows say where they lead
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

}
