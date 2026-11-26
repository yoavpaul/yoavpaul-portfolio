// The books on the graphics page: 1+1= and the On The Line - Soccer notebook
// (on the page, and their copies on the works' own screens, see works-screens.js).
// Both are in Hebrew, so they open from right to left.
// At first each one turns its pages by itself, one every second, again and again (like a video).
// A click on a book stops that, and from then on its pages turn with clicks:
// a click on the left half shows the next pages, a click on the right half the pages before.
// On a book's own screen it also has arrows on its sides (‹ next, › before). After a click ❚❚ shows
// for a second under it, and a few seconds after the last click it turns by itself again.
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
    // (on the book's screen updatePlayButton shows ❚❚ and starts it again later, see below)
    let updatePlayButton = () => {};
    const stopTurningByItself = () => {
      clearInterval(timer);
      timer = null;
      updatePlayButton();
    };

    // A book on the page (inside a work that opens its own screen): a click opens the screen,
    // so here it only turns its pages by itself. Its copy on the screen turns with clicks
    if (book.closest("[data-panel]")) continue;

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

    // On the book's own screen: arrows on its sides, and ❚❚ under it for a second after a click.
    // ‹ on the left = the next pages, › on the right = the pages before (like a click on that half).
    if (book.closest(".project-panel")) {
      const line = (path) => `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>`;
      const makeButton = (className, label, path, onClick) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "book-control " + className;
        button.setAttribute("aria-label", label);
        button.innerHTML = line(path);
        button.addEventListener("click", onClick);
        book.after(button); // next to the book, in its box (not inside it, so it doesn't turn a page too)
        return button;
      };
      makeButton("book-forward", "Next pages", "M15 4 7 12l8 8", () => {
        stopTurningByItself();
        showPage(page + 1);
      });
      makeButton("book-backward", "Pages before", "m9 4 8 8-8 8", () => {
        stopTurningByItself();
        showPage(page - 1);
      });
      // No play button: every click (on the book or an arrow) shows ❚❚ for a second,
      // and when nobody clicks for a few seconds it starts turning by itself again
      const AUTO_AGAIN_AFTER = 3000; // milliseconds without clicks before it turns by itself again
      const pauseSign = document.createElement("span");
      pauseSign.className = "book-control book-pause-sign";
      pauseSign.setAttribute("aria-hidden", "true");
      pauseSign.innerHTML = line("M9 6v12M15 6v12");
      pauseSign.hidden = true;
      book.after(pauseSign);
      let signTimer = null;
      let againTimer = null;
      updatePlayButton = () => {
        pauseSign.hidden = false; // ❚❚ for a second
        clearTimeout(signTimer);
        signTimer = setTimeout(() => (pauseSign.hidden = true), 1000);
        clearTimeout(againTimer);
        againTimer = setTimeout(() => {
          showPage(page + 1);
          timer = setInterval(() => showPage(page + 1), turnEvery);
        }, AUTO_AGAIN_AFTER);
      };
    }

    book.addEventListener("keydown", (event) => {
      // (the arrow keys turn the book's pages, so they don't also scroll its screen: stopPropagation)
      if (event.key === "ArrowLeft" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        stopTurningByItself();
        showPage(page + 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        stopTurningByItself();
        showPage(page - 1);
      }
    });
  }
}
