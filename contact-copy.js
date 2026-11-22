// Me page: a "Copy" button for the email and the phone number.
// On a computer it shows when the mouse is on them (see styles.css), and the email / phone
// still opens the email app or the phone when clicked.
// On a phone or tablet (no mouse) a tap on them shows the "Copy" button instead,
// and a tap anywhere else hides it.
// A click on "Copy" copies the email / number, the button says "Copied",
// and 2 seconds later it hides (until the mouse leaves and comes back).
// (It shows by the keyboard too, with Tab: ":focus-visible" in styles.css. A mouse click
// doesn't count, so "Copy" doesn't stay after the mouse moves away.)

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
      contact.classList.remove("is-copied"); // after a copy, a new tap shows it again
      contact.classList.toggle("is-showing-copy");
    });

    button.addEventListener("click", async () => {
      await copyText(button.dataset.copy);
      button.textContent = "Copied";
      setTimeout(() => {
        contact.classList.add("is-copied");
        contact.classList.remove("is-showing-copy");
        button.textContent = "Copy";
      }, 2000);
    });

    // When the mouse leaves, "Copy" can show again next time
    contact.addEventListener("mouseleave", () => contact.classList.remove("is-copied"));
  }

  // A tap anywhere else hides "Copy"
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".about-contact")) hideAllCopyButtons(null);
  });
}
