// Index page: a click on a category (Branding, Photography, Graphics)
// opens the list of its projects under it, and a second click closes it.
// A double click (or a double tap on a phone) leads to the category's own page.
// The projects in each list come from projects.json, in their "order",
// and each one leads straight to its project.

const DOUBLE_CLICK_TIME = 350; // two clicks closer than this (in milliseconds) are a double click

for (const category of document.querySelectorAll(".index-category")) {
  const list = document.getElementById(category.getAttribute("aria-controls"));
  let lastClickTime = 0;

  category.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastClickTime < DOUBLE_CLICK_TIME) {
      location.href = category.dataset.page; // double click: go to the category's page
      return;
    }
    lastClickTime = now;

    // One click: open or close the list
    list.hidden = !list.hidden;
    category.setAttribute("aria-expanded", !list.hidden);
  });
}

// Fills the lists: each project goes to the list of its category (list-branding, list-photography...)
loadProjects().then((projects) => {
  const inOrder = [...projects].sort((a, b) => a.order - b.order);
  for (const project of inOrder) {
    const list = document.getElementById("list-" + project.category.toLowerCase());
    if (!list) continue; // a category that has no list on this page

    const link = document.createElement("a");
    link.href = project.page;
    link.textContent = project.indexTitle;
    const line = document.createElement("li");
    line.appendChild(link);
    list.appendChild(line);
  }
});
