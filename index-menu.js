// Index page: the three categories (Branding, Photography, Graphics), each with the list of its projects.
// - A click on a category leads to its page, a click on a project leads to that project.
// - Above them is a "screen" with all the works moving in a row, like the home page (home-carousel.js).
//   Under the mouse on a category (or on its list) the screen shows only that category's works,
//   and on the name of a project it shows that project. Away from the categories: all the works again.
// The projects in each list come from projects.json, in their "order".

const screenSection = document.querySelector(".index-screen");
const preview = document.querySelector(".index-preview");
let shownCategory = null; // the category the screen shows now (null = all the works)

// The row needs enough works to go round and round across the whole screen:
// a category with only a few works gets them again (copies) until there are at least 8
function enoughToLoop(items) {
  let row = [...items];
  while (row.length > 0 && row.length < 8) {
    row = row.concat(items.map((item) => {
      const copy = item.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.setAttribute("tabindex", "-1");
      return copy;
    }));
  }
  return row;
}

// The screen shows the works of one category (or all of them, with null).
// "works" and "fillRow" are in home-carousel.js
function showCategory(category) {
  if (category === shownCategory || works.length === 0) return;
  shownCategory = category;
  const inOrder = [...works].sort((a, b) => a.dataset.index - b.dataset.index);
  const chosen = category ? inOrder.filter((work) => work.dataset.category === category) : inOrder;
  fillRow(category ? enoughToLoop(chosen) : chosen);
}

// One project on the screen (its cover, cut like in the row: makeCarouselItem is in projects.js),
// or back to the moving row with null
function showPreview(project) {
  if (project && project.cover) {
    preview.replaceChildren(makeCarouselItem(project));
    screenSection.classList.add("is-previewing");
  } else {
    screenSection.classList.remove("is-previewing");
  }
}

// Under the mouse: a category (or its list) shows its works
for (const category of document.querySelectorAll(".index-category")) {
  const list = category.nextElementSibling; // the list of its projects
  for (const part of [category, list]) {
    part.addEventListener("mouseenter", () => showCategory(category.dataset.category));
  }
}
// Away from the categories: all the works again
document.querySelector(".index-categories").addEventListener("mouseleave", () => {
  showPreview(null);
  showCategory(null);
});

// Fills the lists: each project goes to the list of its category (list-branding, list-photography...).
// Under the mouse (or with Tab) its name shows the project on the screen
loadProjects().then((projects) => {
  const inOrder = [...projects].sort((a, b) => a.order - b.order);
  for (const project of inOrder) {
    const list = document.getElementById("list-" + project.category.toLowerCase());
    if (!list) continue; // a category that has no list on this page

    const link = document.createElement("a");
    link.href = project.page;
    link.textContent = project.indexTitle;
    link.addEventListener("mouseenter", () => showPreview(project));
    link.addEventListener("focus", () => showPreview(project));
    link.addEventListener("mouseleave", () => showPreview(null));
    link.addEventListener("blur", () => showPreview(null));
    const line = document.createElement("li");
    line.appendChild(link);
    list.appendChild(line);
  }
});
