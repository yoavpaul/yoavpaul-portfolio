// The menu on the project pages starts folded: only the page you are on (in red) shows under "Index".
// A click on "Index" opens the list of categories, another click folds it again.
// A double click (or a double tap on a phone) on "Index" leads to the index page.

{
  const indexButton = document.querySelector(".top-bar-index");
  const menu = indexButton.parentElement;
  const DOUBLE_CLICK_TIME = 350; // two clicks closer than this (in milliseconds) are a double click
  let lastClickTime = 0;

  indexButton.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastClickTime < DOUBLE_CLICK_TIME) {
      location.href = "projects.html"; // double click: the index page
      return;
    }
    lastClickTime = now;

    // One click: open or fold the menu
    const isFolded = menu.classList.toggle("is-folded");
    indexButton.setAttribute("aria-expanded", !isFolded);
  });
}
