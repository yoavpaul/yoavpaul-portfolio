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
//                 crop  = (optional) shows only part of the image: top, left, width, height in %

// Reads projects.json and gives back the list of works
async function loadProjects() {
  const response = await fetch("projects.json");
  const data = await response.json();
  return data.projects;
}
