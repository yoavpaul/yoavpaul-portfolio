// The 1+1= book on the graphics page.
// The book is in Hebrew, so it opens from right to left.
// At first it turns its pages by itself, one every second, again and again (like a video).
// A click on the book stops that, and from then on the pages turn with clicks:
// a click on the left half shows the next pages, a click on the right half the pages before.
// The keyboard works too: the left arrow = next, the right arrow = back (after Tab to the book).
// Every picture of the book is an image: 00 is the cover, 01 to 28 are the pages.

{
  const book = document.getElementById("one-plus-one");
  const picture = book.querySelector("img");
  const pageCount = 29;   // the cover + 28 pictures of pages
  const turnEvery = 1000; // turning by itself: one page every 1000ms (1 second)
  let page = 0;           // 0 = the cover
  let timer = null;       // the timer that turns the pages by itself (null = stopped)

  // The file of a page, e.g. 5 -> images/one-plus-one-page-05.webp
  function fileOf(number) {
    return "images/one-plus-one-page-" + String(number).padStart(2, "0") + ".webp";
  }

  function showPage(number) {
    // After the last pages comes the cover again (and before the cover, the last pages)
    page = (number + pageCount) % pageCount;
    picture.src = fileOf(page);
    picture.alt = page === 0 ? "1+1=, the cover" : "1+1=, pages " + page + " of " + (pageCount - 1);
  }

  // Load all the pages already (about 2MB), so every page shows right away
  for (let number = 1; number < pageCount; number++) {
    new Image().src = fileOf(number);
  }

  // Turning by itself. Not for people who asked their computer for less motion
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timer = setInterval(() => showPage(page + 1), turnEvery);
  }

  // The first click (or key) stops the turning by itself
  function stopTurningByItself() {
    clearInterval(timer);
    timer = null;
  }

  book.addEventListener("click", (event) => {
    stopTurningByItself();
    const box = book.getBoundingClientRect();
    const onRightHalf = event.clientX > box.left + box.width / 2;
    // On the cover every click opens the book
    if (onRightHalf && page > 0) {
      showPage(page - 1);
    } else {
      showPage(page + 1);
    }
  });

  book.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      stopTurningByItself();
      showPage(page + 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stopTurningByItself();
      showPage(page - 1);
    }
  });
}
