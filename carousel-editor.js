// The carousel editor (carousel-editor.html). Only for designing, not part of the site.
// Every change shows in the row right away. "Save" sends the values to
// tools/carousel-editor.py, which writes them to projects.json, styles.css and phone.css.
//
// "Computer / Phone" at the top switches between the two versions:
// - Computer: the row is shown on this page, as wide as the window.
// - Phone: the row is shown in a phone-sized frame (390px wide). The frame is this same page,
//   opened with "?phone-frame" at the end of its address: then it only shows the row,
//   and gets the values from the editor around it.

const carousel = document.querySelector(".carousel");
const track = document.querySelector(".carousel-track");
const controls = document.querySelector(".editor-controls");
const saveButton = document.getElementById("save");
const undoButton = document.getElementById("undo");
const statusText = document.querySelector(".editor-status");
const phoneFrame = document.querySelector(".editor-phone-frame");
const modeButtons = document.querySelectorAll(".editor-mode");

const isPhoneFrame = location.search.includes("phone-frame");

// The space between the works is in the CSS (.carousel-item), so it is changed here with a small style
const gapStyle = document.createElement("style");
document.head.appendChild(gapStyle);

let mode = "computer"; // or "phone"
let settings = {};     // the whole row: { rowHeight, gap, phoneRowHeight, phoneGap }
let works = [];        // every work: { slug, title, src, size, align, phoneSize, phoneAlign, item, card }

// --- Showing the values in the row ---

// Computer: Figma pixels. Phone: height in % of the screen width (vw), space in px
function showRow() {
  if (isPhoneFrame) {
    carousel.style.height = settings.phoneRowHeight + "vw";
    gapStyle.textContent = `.carousel-item { margin-right: ${settings.phoneGap}px; }`;
  } else {
    carousel.style.height = `calc(${settings.rowHeight} * var(--px))`;
    gapStyle.textContent = `.carousel-item { margin-right: calc(${settings.gap} * var(--px)); }`;
  }
}

function showWork(work) {
  work.item.style.setProperty("--item-height", work.size + "%");
  work.item.style.setProperty("--item-align", work.align);
  work.item.style.setProperty("--item-height-phone", work.phoneSize + "%");
  work.item.style.setProperty("--item-align-phone", work.phoneAlign);
}

// Sends all the values to the phone frame, so it shows them too
function updatePhoneFrame() {
  if (!phoneFrame.contentWindow) return;
  // The frame is as high as the row in it (390px wide, the row's height is a % of that), plus space
  phoneFrame.style.height = Math.round(390 * settings.phoneRowHeight / 100 + 80) + "px";
  phoneFrame.contentWindow.postMessage({
    settings,
    works: works.map(({ slug, size, align, phoneSize, phoneAlign }) => ({ slug, size, align, phoneSize, phoneAlign })),
  }, "*");
}

function changed() {
  updatePhoneFrame();
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

// Top / Middle / Bottom
function makePlaceButtons(value, onChange) {
  const line = document.createElement("div");
  line.className = "editor-line editor-align";
  line.innerHTML = "<label>Place</label>";
  for (const [place, name] of [["start", "Top"], ["center", "Middle"], ["end", "Bottom"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = name;
    button.classList.toggle("is-active", value === place);
    button.addEventListener("click", () => {
      for (const other of line.querySelectorAll("button")) {
        other.classList.toggle("is-active", other === button);
      }
      onChange(place);
      changed();
    });
    line.appendChild(button);
  }
  return line;
}

// --- Selecting a work (in the row or in its card) ---

function select(slug) {
  for (const work of works) {
    work.item.classList.toggle("is-selected", work.slug === slug);
    if (work.card) work.card.classList.toggle("is-selected", work.slug === slug);
  }
  const work = works.find((other) => other.slug === slug);
  if (work && work.card) work.card.scrollIntoView({ behavior: "smooth", block: "center" });
}

// --- The controls (made again when switching between computer and phone) ---

function makeControls() {
  const onPhone = mode === "phone";
  controls.replaceChildren();

  // The card of the whole row
  const rowCard = document.createElement("div");
  rowCard.className = "editor-card is-row";
  if (onPhone) {
    rowCard.innerHTML = "<strong>The whole row (phone)</strong>";
    rowCard.append(
      makeSlider("Height", settings.phoneRowHeight, 20, 150, (value) => { settings.phoneRowHeight = value; }),
      makeSlider("Space", settings.phoneGap, 0, 80, (value) => { settings.phoneGap = value; }),
    );
  } else {
    rowCard.innerHTML = "<strong>The whole row (computer)</strong>";
    rowCard.append(
      makeSlider("Height", settings.rowHeight, 200, 1000, (value) => { settings.rowHeight = value; showRow(); }),
      makeSlider("Space", settings.gap, 0, 300, (value) => { settings.gap = value; showRow(); }),
    );
  }
  controls.appendChild(rowCard);

  // A card for every work
  for (const work of works) {
    const card = document.createElement("div");
    card.className = "editor-card";
    card.innerHTML = `<img src="${work.src}" alt=""><strong></strong>`;
    card.querySelector("strong").textContent = work.title;

    if (onPhone) {
      card.append(
        makeSlider("Size %", work.phoneSize, 10, 100, (value) => { work.phoneSize = value; showWork(work); }),
        makePlaceButtons(work.phoneAlign, (place) => { work.phoneAlign = place; showWork(work); }),
      );
    } else {
      card.append(
        makeSlider("Size %", work.size, 10, 100, (value) => {
          // A phone size that was the same as the computer's follows it
          if (work.phoneSize === work.size) work.phoneSize = value;
          work.size = value;
          showWork(work);
        }),
        makePlaceButtons(work.align, (place) => {
          if (work.phoneAlign === work.align) work.phoneAlign = place;
          work.align = place;
          showWork(work);
        }),
      );
    }

    card.addEventListener("pointerdown", () => select(work.slug));
    work.card = card;
    controls.appendChild(card);
  }
}

function setMode(newMode) {
  mode = newMode;
  for (const button of modeButtons) {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  }
  document.body.classList.toggle("is-phone-mode", mode === "phone");
  makeControls();
  updatePhoneFrame();
}

// --- Loading the saved values ---

async function start() {
  statusText.textContent = isPhoneFrame ? "" : "Loading…";
  const projects = (await loadProjects()).filter((project) => project.cover);
  settings = await (await fetch("/carousel-settings")).json();

  // The row, in the Index order (like the home page when it opens)
  projects.sort((a, b) => a.order - b.order);
  works = projects.map((project) => {
    const size = parseFloat(project.cover.size) || 100;
    const align = project.cover.align || "center";
    return {
      slug: project.slug,
      title: project.title,
      src: project.cover.src,
      size,
      align,
      phoneSize: parseFloat(project.cover.phoneSize) || size,
      phoneAlign: project.cover.phoneAlign || align,
      item: makeCarouselItem(project),
    };
  });

  // Like on the home page: the first work on the right, the next ones to its left
  track.replaceChildren(...works.map((work) => work.item).reverse());

  for (const work of works) {
    // A click on a work: select it and show its card (instead of opening the project)
    work.item.addEventListener("click", (event) => {
      event.preventDefault();
      if (isPhoneFrame) {
        parent.postMessage({ select: work.slug }, "*");
      } else {
        select(work.slug);
      }
    });
    showWork(work);
  }

  showRow();
  carousel.scrollLeft = carousel.scrollWidth; // start at the right end, where the first work is

  if (isPhoneFrame) {
    parent.postMessage({ ready: true }, "*");
  } else {
    setMode(mode);
    saveButton.disabled = true;
    undoButton.disabled = true;
    statusText.textContent = "";
  }
}

// --- The phone frame: gets the values from the editor ---

if (isPhoneFrame) {
  document.body.classList.add("is-phone-frame");
  window.addEventListener("message", (event) => {
    if (!event.data.settings) return;
    settings = event.data.settings;
    for (const values of event.data.works) {
      const work = works.find((other) => other.slug === values.slug);
      if (work) {
        Object.assign(work, values);
        showWork(work);
      }
    }
    showRow();
  });
} else {
  // Messages from the phone frame: it is ready (send it the values), or a work was clicked in it
  window.addEventListener("message", (event) => {
    if (event.data.ready) updatePhoneFrame();
    if (event.data.select) select(event.data.select);
  });

  for (const button of modeButtons) {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  }

  // --- Saving and undoing ---

  saveButton.addEventListener("click", async () => {
    statusText.textContent = "Saving…";
    const response = await fetch("/save-carousel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
        works: works.map(({ slug, size, align, phoneSize, phoneAlign }) => ({ slug, size, align, phoneSize, phoneAlign })),
      }),
    });
    if (response.ok) {
      saveButton.disabled = true;
      undoButton.disabled = true;
      statusText.textContent = "Saved ✓";
    } else {
      statusText.textContent = "Could not save. Is tools/carousel-editor.py running?";
    }
  });

  // Goes back to what is saved (the phone frame loads again too)
  undoButton.addEventListener("click", () => {
    phoneFrame.contentWindow.location.reload();
    start();
  });

}

// The mouse wheel scrolls the row sideways (like on the home page)
carousel.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
  event.preventDefault();
  carousel.scrollLeft += event.deltaY;
}, { passive: false });

start();
