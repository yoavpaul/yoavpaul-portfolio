// Me page: a "Copy" button for the email and the phone number.
// On a computer it shows when the mouse is on them (see styles.css).
// A click on the email copies it too (it doesn't open the email app).
// On a phone or tablet (no mouse) a tap on them shows the "Copy" button instead,
// and a tap anywhere else hides it.
// A click on "Copy" copies the email / number, the button says "Copied" for 2 seconds
// (even if the mouse moves away), and then it hides (until the mouse leaves and comes back).
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

    // The email (data-copies): a click copies it, instead of opening the email app
    if (link.hasAttribute("data-copies")) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        contact.classList.remove("is-copied");
        contact.classList.add("is-showing-copy");
        button.click(); // the same as "Copy": it says "Copied", and hides 2 seconds later
      });
    }

    // Phones: a tap on the phone number shows (or hides) "Copy", instead of calling
    link.addEventListener("click", (event) => {
      if (!noMouse.matches || link.hasAttribute("data-copies")) return;
      event.preventDefault();
      hideAllCopyButtons(contact);
      contact.classList.remove("is-copied"); // after a copy, a new tap shows it again
      contact.classList.toggle("is-showing-copy");
    });

    button.addEventListener("click", async () => {
      await copyText(button.dataset.copy);
      button.textContent = "Copied";
      contact.classList.add("is-showing-copy"); // "Copied" stays 2 seconds, even if the mouse moves away
      setTimeout(() => {
        // Then it hides. If the mouse is still there, it stays hidden until the mouse leaves
        if (contact.matches(":hover")) contact.classList.add("is-copied");
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
