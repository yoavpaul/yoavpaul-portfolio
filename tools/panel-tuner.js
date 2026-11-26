// A tool for the photography page: sliders that change the spaces live.
// Only with ?tune in the address (photography.html?tune). Only in this browser window: nothing is saved.
// When it looks right, press "Copy" and send the numbers (they go into styles.css / photography.html).
//   - Space between the photos: one space for all of them, in the rows on the page and on the works'
//     own screens (--photo-row-gap; photo-overlays.js places the rows again)
//   - Space between the works: from a work's name to the next work, the same for all (--space-before)
//   - Space after the text and height of the photos: on the works' own screens

{
  if (new URLSearchParams(location.search).has("tune")) {
    const root = document.documentElement;
    const works = [...document.querySelectorAll(".has-even-rows > .photo-overlay")].slice(1); // (not the first)
    const settings = [
      { name: "--photo-row-gap", label: "Space between the photos", min: 0, max: 120,
        apply: () => layoutEvenRows() },
      { label: "Space between the works", min: 0, max: 200,
        value: () => parseFloat(works[0].style.getPropertyValue("--space-before")),
        apply: (value) => works.forEach((work) => work.style.setProperty("--space-before", value)) },
      { name: "--panel-text-gap", label: "Space after the text (work screen)", min: 0, max: 200 },
      { name: "--panel-photo-height", label: "Height of the photos (work screen)", min: 500, max: 1000 },
    ];

    const box = document.createElement("div");
    box.className = "panel-tuner";
    box.innerHTML = '<p class="panel-tuner-title">Spaces (Figma pixels)</p>';

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy";

    const valueOf = (setting) => setting.value ? setting.value() : parseFloat(getComputedStyle(root).getPropertyValue(setting.name));
    const valuesText = () => settings.map((s) => s.label + ": " + valueOf(s)).join(", ");

    for (const setting of settings) {
      const value = valueOf(setting);
      const row = document.createElement("label");
      row.innerHTML = `<span>${setting.label}</span>`;
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = setting.min;
      slider.max = setting.max;
      slider.value = value;
      const number = document.createElement("b");
      number.textContent = value;
      slider.addEventListener("input", () => {
        if (setting.name) root.style.setProperty(setting.name, slider.value);
        if (setting.apply) setting.apply(slider.value);
        number.textContent = slider.value;
      });
      row.append(slider, number);
      box.appendChild(row);
    }

    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(valuesText());
      copyButton.textContent = "Copied";
      setTimeout(() => (copyButton.textContent = "Copy"), 1500);
    });
    box.appendChild(copyButton);
    document.body.appendChild(box);

    // The tool's look (only here, so styles.css stays clean)
    const style = document.createElement("style");
    style.textContent = `
      .panel-tuner { position: fixed; top: 70px; right: 16px; z-index: 20; width: 260px; padding: 12px;
        background: #fff; border: 1px solid #ccc; font: 13px/1.4 system-ui, sans-serif; color: #000; }
      .panel-tuner-title { margin: 0 0 8px; font-weight: 600; }
      .panel-tuner label { display: grid; grid-template-columns: 1fr 40px; gap: 2px 8px; margin-bottom: 8px; }
      .panel-tuner label span { grid-column: 1 / -1; }
      .panel-tuner b { text-align: right; }
      .panel-tuner button { padding: 4px 12px; cursor: pointer; }`;
    document.head.appendChild(style);
  }
}
