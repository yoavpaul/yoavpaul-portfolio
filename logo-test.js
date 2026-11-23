// A test of other versions of "YP" in the top bar (for trying them out, see "Logo test" in styles.css).
// Add to the address of any page:
//   ?logo=fly          a picture of the fly instead of "YP"
//   ?logo=fly-around   "YP" with a tiny fly flying around it
//   ?logo=yp           back to the normal "YP"
//   ?blur=off          no blurred strip behind "YP"   (?blur=on brings it back)
// The choice is remembered (in this browser only), so it stays on the other pages too.
// Without anything in the address the site looks as usual, so visitors see no change.
// (This file is loaded in the <head>, so the page shows the chosen version from the start)

{
  const address = new URLSearchParams(location.search);

  for (const test of ["logo", "blur"]) {
    // A new choice in the address is remembered
    if (address.has(test)) {
      localStorage.setItem("test-" + test, address.get(test));
    }
    // The remembered choice puts a class on the page, like "test-logo-fly" or "test-blur-off"
    const choice = localStorage.getItem("test-" + test);
    if (choice) {
      document.documentElement.classList.add("test-" + test + "-" + choice);
    }
  }
}
