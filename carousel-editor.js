// The carousel editor (carousel-editor.html). Only for designing, not part of the site.
// Every change shows in the row right away. "Save" sends the values to
// tools/carousel-editor.py, which writes them to projects.json and styles.css.

const carousel = document.querySelector(".carousel");
const track = document.querySelector(".carousel-track");
const controls = document.querySelector(".editor-controls");
const saveButton = document.getElementById("save");
const undoButton = document.getElementById("undo");
const statusText = document.querySelector(".editor-status");

// The space between the works is in styles.css (.carousel-item), so it is changed here with a small style
const gapStyle = document.createElement("style");
document.head.appendChild(gapStyle);

let settings = {};   // the whole row: { rowHeight, gap } in Figma pixels
let works = [];      // every work: { slug, title, src, size (%), align, item, card }

// --- Showing the values ---

function showRow() {
  carousel.style.height = `calc(${settings.rowHeight} * var(--px))`;
  gapStyle.textContent = `.carousel-item { margin-right: calc(${settings.gap} * var(--px)); }`;
}

function showWork(work) {
  work.item.style.setProperty("--item-height", work.size + "%");
  work.item.style.alignSelf = work.align;
}

function changed() {
  saveButton.disabled = false;
  undoButton.disabled = false;
  statusText.textContent = "Not saved yet";
}

// --- One control: a slider with a number next to it ---

function makeSlider(label, value, min, max, onChange) {
  const line = document.createElement("div");
  line.className = "editor-line";
  line.innerHTML = `<label>${label}</label>
    <input type="range" min="${min}" max="${max}" step="1" value="${value}">
    <input type="number" min="${min}" max="${max}" step="1" value="${value}">`;
  const [slider, number] = line.querySelectorAll("input");
  for (const input of [slider, number]) {
    input.addEventListener("input", () => {
      const newValue = Math.min(max, Math.max(min, Number(input.value) || min));
      slider.value = newValue;
      if (input === slider) number.value = newValue;
      onChange(newValue);
      changed();
    });
  }
  return line;
}

// --- Selecting a work (in the row or in its card) ---

function select(work) {
  for (const other of works) {
    other.item.classList.toggle("is-selected", other === work);
    other.card.classList.toggle("is-selected", other === work);
  }
}

// --- Building the page ---

async function start() {
  statusText.textContent = "Loading…";
  const projects = (await loadProjects()).filter((project) => project.cover);
  settings = await (await fetch("/carousel-settings")).json();

  // The row, in the Index order (like the home page when it opens)
  projects.sort((a, b) => a.order - b.order);
  works = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    src: project.cover.src,
    size: parseFloat(project.cover.size) || 100,
    align: project.cover.align || "center",
    item: makeCarouselItem(project),
  }));

  // Like on the home page: the first work on the right, the next ones to its left
  track.replaceChildren(...works.map((work) => work.item).reverse());
  controls.replaceChildren();

  // The card of the whole row
  const rowCard = document.createElement("div");
  rowCard.className = "editor-card is-row";
  rowCard.innerHTML = "<strong>The whole row</strong>";
  rowCard.append(
    makeSlider("Height", settings.rowHeight, 200, 1000, (value) => { settings.rowHeight = value; showRow(); }),
    makeSlider("Space", settings.gap, 0, 300, (value) => { settings.gap = value; showRow(); }),
  );
  controls.appendChild(rowCard);

  // A card for every work
  for (const work of works) {
    const card = document.createElement("div");
    card.className = "editor-card";
    card.innerHTML = `<img src="${work.src}" alt=""><strong></strong>`;
    card.querySelector("strong").textContent = work.title;
    card.appendChild(makeSlider("Size %", work.size, 10, 100, (value) => { work.size = value; showWork(work); }));

    // Where a smaller work sits: top / middle / bottom
    const alignLine = document.createElement("div");
    alignLine.className = "editor-line editor-align";
    alignLine.innerHTML = "<label>Place</label>";
    for (const [value, name] of [["start", "Top"], ["center", "Middle"], ["end", "Bottom"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name;
      button.classList.toggle("is-active", work.align === value);
      button.addEventListener("click", () => {
        work.align = value;
        for (const other of alignLine.querySelectorAll("button")) {
          other.classList.toggle("is-active", other === button);
        }
        showWork(work);
        changed();
      });
      alignLine.appendChild(button);
    }
    card.appendChild(alignLine);

    card.addEventListener("pointerdown", () => select(work));
    work.card = card;
    controls.appendChild(card);

    // A click on the work in the row: select it and show its card (instead of opening the project)
    work.item.addEventListener("click", (event) => {
      event.preventDefault();
      select(work);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    showWork(work);
  }

  showRow();
  carousel.scrollLeft = carousel.scrollWidth; // start at the right end, where the first work is
  saveButton.disabled = true;
  undoButton.disabled = true;
  statusText.textContent = "";
}

// --- Saving and undoing ---

saveButton.addEventListener("click", async () => {
  statusText.textContent = "Saving…";
  const response = await fetch("/save-carousel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rowHeight: settings.rowHeight,
      gap: settings.gap,
      works: works.map((work) => ({ slug: work.slug, size: work.size, align: work.align })),
    }),
  });
  if (response.ok) {
    saveButton.disabled = true;
    undoButton.disabled = true;
    statusText.textContent = "Saved ✓ (projects.json and styles.css)";
  } else {
    statusText.textContent = "Could not save. Is tools/carousel-editor.py running?";
  }
});

// Goes back to what is saved
undoButton.addEventListener("click", start);

// The mouse wheel scrolls the row sideways (like on the home page)
carousel.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
  event.preventDefault();
  carousel.scrollLeft += event.deltaY;
}, { passive: false });

start();
