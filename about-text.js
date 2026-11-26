// Contact page: the text under "ME" comes from content/about.md,
// so it can be changed there without touching the code.
// Every paragraph in the file (separated by an empty line) becomes a paragraph on the page,
// and a single line break in the file starts a new line on the page.

{
  const aboutText = document.querySelector(".about-text");

  fetch("content/about.md")
    .then((response) => response.text())
    .then((text) => {
      const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
      aboutText.replaceChildren(...paragraphs.map((part) => {
        const p = document.createElement("p");
        part.split("\n").forEach((line, i) => {
          if (i > 0) p.appendChild(document.createElement("br"));
          p.appendChild(document.createTextNode(line));
        });
        return p;
      }));
    });
}
