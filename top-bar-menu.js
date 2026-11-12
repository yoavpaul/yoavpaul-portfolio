// The menu on the project pages: a click on "Index" folds the menu,
// so only the page you are on (in red) stays under it. Another click opens it again.

{
  const indexButton = document.querySelector(".top-bar-index");
  const menu = indexButton.parentElement;

  indexButton.addEventListener("click", () => {
    const isFolded = menu.classList.toggle("is-folded");
    indexButton.setAttribute("aria-expanded", !isFolded);
  });
}
