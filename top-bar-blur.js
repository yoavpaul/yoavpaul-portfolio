// Top bar: the blurred strip behind a word shows only when there is a picture, a video
// or text under that word. Over an empty background (white, or the black of a project panel)
// there is no strip. This script checks what is under each word a few times a second,
// and adds the class "has-backdrop" to the words that need a strip (see styles.css).

{
  // The words of the bar that can have a strip
  const barWords = () => [
    ...document.querySelectorAll(".top-bar-left:not(:has(.is-current))"),
    ...document.querySelectorAll(".top-bar-left:has(.is-current) > a, .top-bar-left:has(.is-current) > span"),
    ...document.querySelectorAll(".top-bar-name, .top-bar-contact"),
  ];

  // True if the point (x, y) on the screen is over a text
  function isOverText(element, x, y) {
    for (const node of element.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE || node.textContent.trim() === "") continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) {
        if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return true;
      }
    }
    return false;
  }

  // True if there is a picture, a video or text under the point (x, y)
  function somethingUnder(x, y) {
    for (const element of document.elementsFromPoint(x, y)) {
      if (element.closest(".top-bar")) continue; // the bar itself
      if (element.matches("img, video, canvas")) return true;
      if (isOverText(element, x, y)) return true;
      // A solid background (like a project panel) hides everything under it
      const background = getComputedStyle(element).backgroundColor;
      const alpha = background.startsWith("rgba") ? parseFloat(background.split(",")[3]) : background === "transparent" ? 0 : 1;
      if (alpha > 0.9 && element !== document.body && element !== document.documentElement) return false;
    }
    return false;
  }

  // Checks a few points around each word (where its strip would be)
  function updateStrips() {
    for (const word of barWords()) {
      const box = word.getBoundingClientRect();
      const margin = 8; // the strip is a little bigger than the word
      const xs = [box.left - margin, box.left + box.width / 2, box.right + margin];
      const ys = [box.top + 2, box.bottom - 2];
      let needsStrip = false;
      for (const x of xs) {
        for (const y of ys) {
          if (somethingUnder(x, y)) needsStrip = true;
        }
      }
      word.classList.toggle("has-backdrop", needsStrip);
    }
  }

  // Check often, because things move under the bar (scrolling, the moving row on the home page)
  updateStrips();
  setInterval(updateStrips, 150);
  window.addEventListener("scroll", () => requestAnimationFrame(updateStrips), { passive: true });
  window.addEventListener("resize", updateStrips);
}
