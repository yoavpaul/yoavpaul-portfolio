// A TEST for phones, only with ?mobile=test in the address (?mobile=off turns it off).
// The choice is remembered in this browser, so it stays when going to other pages.
// Visitors without it see the site as usual.
//   1. The same proportions as on a computer: the phone shows the computer layout, made smaller
//      (phone.css is turned off).
//   2. A phone held upright: a work's own screen is a page that scrolls down (its text, then all its
//      parts one under the other, as wide as the screen), instead of asking to turn the phone.
//      Turned sideways it is the usual screen that scrolls sideways. (styles.css: "Mobile test")
// (This file is loaded in the <head>, right after phone.css, so it can turn it off before the page shows)

{
  const address = new URLSearchParams(location.search);
  if (address.get("mobile") === "test") localStorage.setItem("mobile-test", "on");
  if (address.get("mobile") === "off") localStorage.removeItem("mobile-test");

  if (localStorage.getItem("mobile-test") === "on") {
    document.documentElement.classList.add("test-mobile");
    const phoneStyles = document.querySelector('link[href="phone.css"]');
    if (phoneStyles) phoneStyles.disabled = true;

    // In a branding project the parts are placed by --x (left to right): in the page that scrolls down
    // they come one under the other in that order
    document.addEventListener("DOMContentLoaded", () => {
      for (const stage of document.querySelectorAll(".project-panel-stage")) {
        for (const part of stage.children) {
          part.style.order = Math.round(parseFloat(part.style.getPropertyValue("--x")) || 0);
        }
      }
    });
  }
}
