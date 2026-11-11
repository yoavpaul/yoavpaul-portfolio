// Index page: a click on a category (Branding, Photography, Graphics)
// opens the list of its projects under it, and a second click closes it.

for (const category of document.querySelectorAll(".index-category")) {
  const list = document.getElementById(category.getAttribute("aria-controls"));

  category.addEventListener("click", () => {
    list.hidden = !list.hidden;
    category.setAttribute("aria-expanded", !list.hidden);
  });
}
