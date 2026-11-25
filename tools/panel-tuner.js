// A tool for the photography test: sliders that change the spaces of a work's own screen live.
// Only with ?tune in the address (photography.html?rows=open&tune). It changes the CSS variables
// --panel-photo-gap, --panel-text-gap and --panel-photo-height (see styles.css), only in this browser
// window: nothing is saved. When it looks right, send the numbers (or "Copy") and they go into styles.css.

{
  if (new URLSearchParams(location.search).has("tune")) {
    const root = document.documentElement;
    const settings = [
      { name: "--panel-photo-gap", label: "Space between the photos", min: 0, max: 120 },
      { name: "--panel-text-gap", label: "Space after the text", min: 0, max: 200 },
      { name: "--panel-photo-height", label: "Height of the photos", min: 500, max: 1000 },
    ];

    const box = document.createElement("div");
    box.className = "panel-tuner";
    box.innerHTML = '<p class="panel-tuner-title">Spaces (Figma pixels)</p>';

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy";

    const valuesText = () => settings.map((s) => s.label + ": " + getComputedStyle(root).getPropertyValue(s.name).trim()).join(", ");

    for (const setting of settings) {
      const value = parseFloat(getComputedStyle(root).getPropertyValue(setting.name));
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
        root.style.setProperty(setting.name, slider.value);
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
