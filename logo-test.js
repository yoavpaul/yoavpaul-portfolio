// A test of other versions of "YP" in the top bar (for trying them out, see "Logo test" in styles.css).
// Add to the address of any page:
//   ?logo=fly          a picture of the fly instead of "YP"
//   ?logo=fly-tilted   the same, turned like the fly on the home page
//   ?logo=fly-around   "YP" with a tiny fly flying around it
//   ?logo=yp           back to the normal "YP"
// The choice is remembered (in this browser only), so it stays on the other pages too.
// Without anything in the address the site looks as usual, so visitors see no change.
// (This file is loaded in the <head>, so the page shows the chosen version from the start)

{
  // A new choice in the address is remembered
  const address = new URLSearchParams(location.search);
  if (address.has("logo")) {
    localStorage.setItem("test-logo", address.get("logo"));
  }

  // The remembered choice puts a class on the page, like "test-logo-fly"
  const choice = localStorage.getItem("test-logo");
  if (choice) {
    document.documentElement.classList.add("test-logo-" + choice);
  }
}
