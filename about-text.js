// Contact page: the text under "ME" comes from content/about.md,
// so it can be changed there without touching the code.
// Every paragraph in the file (separated by an empty line) becomes a paragraph on the page.

{
  const aboutText = document.querySelector(".about-text");

  fetch("content/about.md")
    .then((response) => response.text())
    .then((text) => {
      const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
      aboutText.replaceChildren(...paragraphs.map((part) => {
        const p = document.createElement("p");
        p.textContent = part;
        return p;
      }));
    });
}
