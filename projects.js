// The list of all the works lives in projects.json (the "content" file).
// The home page carousel (home-carousel.js) and the lists on the index page (index-menu.js)
// are built from it, so adding, removing or reordering a work only needs projects.json.
//
// What each work in projects.json has:
//   slug        its id (the same as the id of the project on its page)
//   title       its name in the carousel
//   indexTitle  its name in the list on the index page
//   category    Branding, Photography or Graphics
//   page        where a click leads (page + #slug)
//   order       its place in the "Index" order (1 = first). The order of the works in the file
//               is the "Random" order of the carousel
//   cover       the picture in the carousel:
//                 src, width, height = the image file and its real size in pixels
//                 ratio = the width / height of its box in the carousel (from Figma)
//                 size  = (optional) how high it is compared to the row, e.g. "50%"
//                 align = (optional) where a smaller work sits in the row's height:
//                         "start" (top), "center" (middle, the default) or "end" (bottom)
//                 phoneSize, phoneAlign = (optional) the same, only on phones
//                 crop  = (optional) shows only part of the image: top, left, width, height in %

// Reads projects.json and gives back the list of works
async function loadProjects() {
  const response = await fetch("projects.json");
  const data = await response.json();
  return data.projects;
}

// Makes one work of the home carousel from its line in projects.json
// (used by home-carousel.js and by the carousel editor, carousel-editor.html)
function makeCarouselItem(project) {
  const cover = project.cover;
  const item = document.createElement("a");
  item.className = "carousel-item";
  item.href = project.page;
  item.dataset.name = project.title;
  item.dataset.category = project.category;
  item.dataset.index = project.order;
  item.style.setProperty("--ratio", cover.ratio);
  if (cover.size) item.style.setProperty("--item-height", cover.size);
  if (cover.align) item.style.setProperty("--item-align", cover.align);
  if (cover.phoneSize) item.style.setProperty("--item-height-phone", cover.phoneSize);
  if (cover.phoneAlign) item.style.setProperty("--item-align-phone", cover.phoneAlign);

  const img = document.createElement("img");
  img.src = cover.src;
  img.width = cover.width;
  img.height = cover.height;
  img.alt = project.title;
  if (cover.crop) {
    img.className = "is-cropped";
    img.style.setProperty("--img-top", cover.crop.top);
    img.style.setProperty("--img-left", cover.crop.left);
    img.style.setProperty("--img-width", cover.crop.width);
    img.style.setProperty("--img-height", cover.crop.height);
  }
  item.appendChild(img);
  return item;
}
