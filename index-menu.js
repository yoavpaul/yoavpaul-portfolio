// Index page: a click on a category (Branding, Photography, Graphics)
// opens the list of its projects under it, and a second click closes it.
// The projects in each list come from projects.json, in their "order".

for (const category of document.querySelectorAll(".index-category")) {
  const list = document.getElementById(category.getAttribute("aria-controls"));

  category.addEventListener("click", () => {
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
