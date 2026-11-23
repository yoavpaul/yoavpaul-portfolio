// A click on "YP" in the top bar: a little "transition" to the home page.
// "YP" turns on its side (like a card), a fly turns in its place (turned like the fly on the home page),
// and the fly flies out of the screen to the left or right, a little down, growing to the size
// of the fly on the home page.
// When it is out of the screen, the home page opens.
// People who turned off animations in their settings get the plain link.
//
// The names here are inside { }, so they don't mix with script.js (the fly on the home page).

{
  const logo = document.querySelector(".top-bar-name");
  const wantsStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (logo && !wantsStill) {
    const TURN_TIME = 0.2;    // seconds for each half of the turn ("YP" away, then the fly in; the same as in styles.css)
    const MAX_FLY_TIME = 2.5;   // seconds: the home page opens by then even if the fly is still on the screen
    const START_HEADING = -116.64; // the turn of the fly on the home page at the start (from Figma)
    const random = (min, max) => min + Math.random() * (max - min);

    let fly = null;      // the fly picture, while it is out
    let phase = null;    // "turn" (YP turns, the fly turns in), then "away" (it flies out)
    let time = 0;        // seconds since this phase started
    let x = 0;           // the middle of the fly on the screen (pixels)
    let y = 0;
    let heading = 0;     // where it is facing (degrees, 0 = right, 90 = down)
    let exitHeading = 0; // the direction out of the screen it heads to
    let speed = 0;       // pixels per second
    let width = 0;       // the width of the fly picture (pixels)
    let turn = 90;       // its turn on its side (90 = on its side, so not seen; 0 = flat)

    // Puts the fly picture where the fly is (+90 because the fly's head points up in the picture)
    const drawFly = () => {
      const buzz = phase === "away" ? 1.2 : 0; // a tiny shake, like buzzing wings
      fly.style.width = width + "px";
      fly.style.transform =
        `translate(${x + random(-buzz, buzz)}px, ${y + random(-buzz, buzz)}px) translate(-50%, -50%)` +
        ` perspective(${width * 3}px) rotate(${heading + 90}deg) rotateY(${turn}deg)`; // perspective: the near side looks bigger while it turns
    };

    // True when the whole fly is outside the screen
    const isOutOfScreen = () =>
      x < -width || y < -width || x > window.innerWidth + width || y > window.innerHeight + width;

    // ----- A click on "YP": it turns, and the fly comes out -----
    logo.addEventListener("click", (event) => {
      event.preventDefault();
      if (fly) return; // already on its way

      // Where the letters are ("YP" is pulled together, so its box ends 0.24em before the end of the "P")
      const box = logo.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(logo).fontSize);
      x = box.left + (box.width + 0.24 * fontSize) / 2;
      y = box.top + box.height / 2;

      fly = document.createElement("img");
      fly.src = "images/fly.webp";
      fly.className = "yp-fly";
      fly.alt = "";
      fly.setAttribute("aria-hidden", "true");
      document.body.appendChild(fly);

      width = fontSize * 1.9; // about twice as wide as "YP" is high
      heading = START_HEADING;
      // Its way out: to the right or to the left, a little down (15 degrees), over the top of the page
      exitHeading = Math.random() < 0.5 ? 15 : 165;
      turn = 90;
      logo.classList.add("is-turned-away"); // "YP" turns on its side (styles.css)
      phase = "turn";
      time = 0;
      drawFly();
    });

    // ----- Every frame: moves the fly -----
    const step = (seconds) => {
      time += seconds;

      if (phase === "turn") {
        // First "YP" turns away, then the fly turns in.
        // While it turns in, it also turns from facing up (like on the home page) to its way out:
        // to the right for a way out on the right, to the left for one on the left
        // (-360 is the same direction, reached by turning the other way)
        const turnIn = Math.min(1, Math.max(0, (time - TURN_TIME) / TURN_TIME)); // 0 to 1
        turn = 90 * (1 - turnIn);
        const target = exitHeading < 90 ? exitHeading : exitHeading - 360;
        heading = START_HEADING + (target - START_HEADING) * turnIn;
        if (time >= TURN_TIME * 2) {
          phase = "away";
          time = 0;
          heading = exitHeading;
          speed = 400;
        }
      } else if (phase === "away") {
        // Grows to the size of the fly on the home page (113 Figma pixels)
        const homeSize = 113 * Math.min(1, window.innerWidth / 1440);
        width += (homeSize - width) * Math.min(1, seconds * 2);

        // Wobbles a little like a fly, but keeps turning toward its way out, faster and faster
        heading += random(-120, 120) * seconds;
        heading += (exitHeading - heading) * Math.min(1, seconds * 3);
        speed += 600 * seconds;
        const radians = heading * (Math.PI / 180);
        x += Math.cos(radians) * speed * seconds;
        y += Math.sin(radians) * speed * seconds;

        if (isOutOfScreen() || time >= MAX_FLY_TIME) {
          phase = "gone";
          location.href = logo.href; // the home page
          return;
        }
      }

      drawFly();
    };

    // Coming back to this page with the browser's back button: "YP" as it was, no fly
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      logo.classList.remove("is-turned-away");
      if (fly) fly.remove();
      fly = null;
      phase = null;
    });

    // About 60 times a second (only does something while the fly is out)
    let lastTime = null;
    const animate = (now) => {
      if (fly && lastTime !== null && phase !== "gone") {
        step(Math.min((now - lastTime) / 1000, 0.1)); // no big jump after switching tabs
      }
      lastTime = now;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
}
