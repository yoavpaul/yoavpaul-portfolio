// Top bar: the blurred strip behind a word shows only when there is a picture, a video
// or text under that word. Over an empty background (white, or the black of a project panel)
// there is no strip. A part of a picture that has the same colour as the background
// (like the black around a logo on a black panel) also counts as empty.
// This script checks what is under each word a few times a second,
// and adds the class "has-backdrop" to the words that need a strip (see styles.css).

{
  // The words of the bar that can have a strip
  const barWords = () => [
    ...document.querySelectorAll(".top-bar-left:not(:has(.is-current))"),
    ...document.querySelectorAll(".top-bar-left:has(.is-current) > *"),
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

  // The colour (r, g, b) of a CSS colour, or null if it is see-through
  function solidColour(cssColour) {
    const numbers = cssColour.match(/[\d.]+/g);
    if (!numbers) return null;
    const alpha = numbers.length > 3 ? parseFloat(numbers[3]) : 1;
    return alpha > 0.9 ? numbers.slice(0, 3).map(Number) : null;
  }

  // The background colour behind an element (the first solid one), white if there is none
  function backgroundBehind(element) {
    for (let e = element; e; e = e.parentElement) {
      const colour = solidColour(getComputedStyle(e).backgroundColor);
      if (colour) return colour;
    }
    return [255, 255, 255];
  }

  // A small copy of each picture, to read the colour of its pixels
  const smallCopies = new Map();
  function smallCopy(img) {
    if (smallCopies.has(img.currentSrc)) return smallCopies.get(img.currentSrc);
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = Math.max(1, Math.round(100 * img.naturalHeight / img.naturalWidth));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    smallCopies.set(img.currentSrc, context);
    return context;
  }

  // True if the picture has the same colour as the background at the point (x, y)
  function isEmptyPartOf(img, x, y) {
    if (!img.complete || !img.naturalWidth) return false;
    const box = img.getBoundingClientRect();
    // Where the picture is drawn in its box ("cover" fills the box and cuts the edges)
    let width = box.width, height = box.height, left = box.left, top = box.top;
    if (getComputedStyle(img).objectFit === "cover") {
      const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
      width = img.naturalWidth * scale;
      height = img.naturalHeight * scale;
      left = box.left + (box.width - width) / 2;
      top = box.top + (box.height - height) / 2;
    }
    const context = smallCopy(img);
    const px = Math.floor(((x - left) / width) * context.canvas.width);
    const py = Math.floor(((y - top) / height) * context.canvas.height);
    if (px < 0 || py < 0 || px >= context.canvas.width || py >= context.canvas.height) return false;
    const [r, g, b] = context.getImageData(px, py, 1, 1).data;
    const [br, bg, bb] = backgroundBehind(img);
    return Math.abs(r - br) < 30 && Math.abs(g - bg) < 30 && Math.abs(b - bb) < 30;
  }

  // True if there is a picture, a video or text under the point (x, y)
  function somethingUnder(x, y) {
    for (const element of document.elementsFromPoint(x, y)) {
      if (element.closest(".top-bar")) continue; // the bar itself
      if (element.matches("img")) {
        if (!isEmptyPartOf(element, x, y)) return true;
        continue; // this part of the picture looks like the background, look under it
      }
      if (element.matches("video, canvas")) return true;
      if (isOverText(element, x, y)) return true;
      // A solid background (like a project panel) hides everything under it
      if (solidColour(getComputedStyle(element).backgroundColor) && element !== document.body && element !== document.documentElement) {
        return false;
      }
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
