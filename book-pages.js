// The books on the graphics page: 1+1= and the On The Line - Soccer notebook.
// Both are in Hebrew, so they open from right to left.
// At first each one turns its pages by itself, one every second, again and again (like a video).
// A click on a book stops that, and from then on its pages turn with clicks:
// a click on the left half shows the next pages, a click on the right half the pages before.
// The keyboard works too: the left arrow = next, the right arrow = back (after Tab to the book).
//
// Every picture of a book is an image, 00 is the cover. Each book says in graphics.html:
//   data-files = the start of the file names (e.g. "images/one-plus-one-page-" -> ...-page-05.webp)
//   data-pages = how many pictures it has (the cover included)
//   data-name  = its name (for the text that describes the picture, "alt")
//   data-back-cover (optional) = its last picture is the back cover

{
  const turnEvery = 1000; // turning by itself: one page every 1000ms (1 second)
  const wantsStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (const book of document.querySelectorAll(".book")) {
    const picture = book.querySelector("img");
    const pageCount = Number(book.dataset.pages);
    const name = book.dataset.name;
    const hasBackCover = book.hasAttribute("data-back-cover");
    let page = 0;     // 0 = the cover
    let timer = null; // the timer that turns the pages by itself (null = stopped)

    // The file of a page, e.g. 5 -> images/one-plus-one-page-05.webp
    const fileOf = (number) => book.dataset.files + String(number).padStart(2, "0") + ".webp";

    const showPage = (number) => {
      // After the last pages comes the cover again (and before the cover, the last pages)
      page = (number + pageCount) % pageCount;
      picture.src = fileOf(page);
      if (page === 0) {
        picture.alt = name + ", the cover";
      } else if (hasBackCover && page === pageCount - 1) {
        picture.alt = name + ", the back cover";
      } else {
        picture.alt = name + ", pages " + page + " of " + (pageCount - 1);
      }
    };

    // Load all the pages already, so every page shows right away
    for (let number = 1; number < pageCount; number++) {
      new Image().src = fileOf(number);
    }

    // Turning by itself. Not for people who asked their computer for less motion
    if (!wantsStill) {
      timer = setInterval(() => showPage(page + 1), turnEvery);
    }

    // The first click (or key) stops the turning by itself
    const stopTurningByItself = () => {
      clearInterval(timer);
      timer = null;
    };

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
}
