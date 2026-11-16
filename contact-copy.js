// Me page: a "Copy" button for the email and the phone number.
// On a computer it shows when the mouse is on them (see styles.css), and the email / phone
// still opens the email app or the phone when clicked.
// On a phone or tablet (no mouse) a tap on them shows the "Copy" button instead,
// and a tap anywhere else hides it.
// A click on "Copy" copies the email / number, and the button says "Copied" for a moment.

{
  const noMouse = window.matchMedia("(hover: none)");

  function hideAllCopyButtons(except) {
    for (const contact of document.querySelectorAll(".about-contact.is-showing-copy")) {
      if (contact !== except) contact.classList.remove("is-showing-copy");
    }
  }

  // Puts the text in the clipboard (with an older way, for browsers that don't allow the new one)
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
  }

  for (const contact of document.querySelectorAll(".about-contact")) {
    const link = contact.querySelector("a");
    const button = contact.querySelector(".copy-button");

    // Phones: a tap shows (or hides) "Copy", instead of opening the email app / calling
    link.addEventListener("click", (event) => {
      if (!noMouse.matches) return;
      event.preventDefault();
      hideAllCopyButtons(contact);
      contact.classList.toggle("is-showing-copy");
    });

    button.addEventListener("click", async () => {
      await copyText(button.dataset.copy);
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1500);
    });
  }

  // A tap anywhere else hides "Copy"
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".about-contact")) hideAllCopyButtons(null);
  });
}
