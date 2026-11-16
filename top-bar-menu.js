// The menu on the project pages starts folded: only the page you are on (in red) shows under "Index".
// A click on "Index" opens the list of categories, another click folds it again.

{
  const indexButton = document.querySelector(".top-bar-index");
  const menu = indexButton.parentElement;

  indexButton.addEventListener("click", () => {
    const isFolded = menu.classList.toggle("is-folded");
    indexButton.setAttribute("aria-expanded", !isFolded);
  });
}
