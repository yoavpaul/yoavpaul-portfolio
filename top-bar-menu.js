// The menu on the project pages (Branding, Photography, Graphics): open all the time,
// "Index" and under it the three categories, the page you are on in red.
// "Index" leads to the index page.
// At the end of the page: "Next: Graphics ›", a link to the next category (after Graphics, Branding).

{
  const menu = document.querySelector(".top-bar-left");
  const pages = [["Branding", "branding.html"], ["Photography", "photography.html"], ["Graphics", "graphics.html"]];
  const here = pages.findIndex(([name]) => name === menu.querySelector(".is-current").textContent);
  const [name, href] = pages[(here + 1) % pages.length];

  const next = document.createElement("p");
  next.className = "next-category";
  next.innerHTML = `<a class="page-link" href="${href}">Next: ${name} <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m9 4 8 8-8 8" fill="none" stroke="currentColor" stroke-width="1.25"/></svg></a>`;
  document.querySelector("main").after(next);
}
