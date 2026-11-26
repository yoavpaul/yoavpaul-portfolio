// Photography page: on a work's own screen, a tag "View" shows next to the mouse over a photo,
// and a click on a photo opens it big, on the whole screen
// (the whole photo, not cut). Inside the big gallery:
//   - ‹ › on the sides (or the arrow keys ← →) go to the photo before / after in the same work
//     (after the last one comes the first),
//   - "3 / 10" at the bottom says which photo it is,
//   - × (or Esc, or a click on the empty space around the photo) closes it, back to the work's screen.
// The photos come from the work's screen (works-screens.js makes it).

{
  const line = (path) => `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.25"/></svg>`;

  // The gallery: made once, and filled with the photos of the work that was clicked
  const gallery = document.createElement("div");
  gallery.className = "lightbox";
  gallery.setAttribute("role", "dialog");
  gallery.setAttribute("aria-label", "Photo");
  gallery.hidden = true;
  gallery.innerHTML = `
    <img class="lightbox-photo" alt="">
    <button class="lightbox-prev" type="button" aria-label="Photo before">${line("M15 4 7 12l8 8")}</button>
    <button class="lightbox-next" type="button" aria-label="Photo after">${line("m9 4 8 8-8 8")}</button>
    <button class="lightbox-close" type="button" aria-label="Close">${line("m5 5 14 14M19 5 5 19")}</button>
    <p class="lightbox-count"></p>`;
  document.body.appendChild(gallery);

  const bigPhoto = gallery.querySelector(".lightbox-photo");
  const count = gallery.querySelector(".lightbox-count");
  let photos = []; // the photos of the work (their <img> on the work's screen)
  let index = 0;   // which one shows now

  const show = (number) => {
    index = (number + photos.length) % photos.length;
    const photo = photos[index];
    bigPhoto.src = photo.getAttribute("src"); // the full photo (not the small copy)
    bigPhoto.alt = photo.alt;
    count.textContent = (index + 1) + " / " + photos.length;
  };

  const open = (screen, photo) => {
    photos = [...screen.querySelectorAll(".photo-panel-photo img")];
    show(photos.indexOf(photo));
    gallery.hidden = false;
    gallery.querySelector(".lightbox-close").focus();
  };

  const close = () => {
    gallery.hidden = true;
    const screen = document.querySelector(".project-panel:not([hidden])");
    if (screen) screen.focus(); // back to the work's screen
  };

  // Over a photo on a work's screen, a tag "View" shows next to the mouse
  // (like "Open the project" on the page; the same look as the tag on the home page)
  const tag = document.createElement("p");
  tag.className = "carousel-tag";
  tag.setAttribute("aria-hidden", "true");
  tag.textContent = "View";
  document.body.appendChild(tag);
  document.addEventListener("pointermove", (event) => {
    const overPhoto = event.pointerType === "mouse" && gallery.hidden && event.target.closest(".project-panel .photo-panel-photo");
    tag.classList.toggle("is-shown", Boolean(overPhoto));
    if (overPhoto) tag.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 22}px)`;
  });
  document.addEventListener("click", () => tag.classList.remove("is-shown"));

  // A click on a photo on a work's screen opens it big
  document.addEventListener("click", (event) => {
    const photo = event.target.closest(".project-panel .photo-panel-photo img");
    if (photo) open(photo.closest(".project-panel"), photo);
  });

  gallery.querySelector(".lightbox-prev").addEventListener("click", () => show(index - 1));
  gallery.querySelector(".lightbox-next").addEventListener("click", () => show(index + 1));
  gallery.querySelector(".lightbox-close").addEventListener("click", close);
  // A click on the empty space around the photo closes it too
  gallery.addEventListener("click", (event) => {
    if (event.target === gallery) close();
  });

  // The keyboard, before the work's screen hears it ("true" = first): ← → and Esc are for the gallery
  document.addEventListener("keydown", (event) => {
    if (gallery.hidden) return;
    if (event.key === "ArrowLeft") show(index - 1);
    else if (event.key === "ArrowRight") show(index + 1);
    else if (event.key === "Escape") close();
    else return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
}
