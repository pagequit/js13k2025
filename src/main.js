import ZzFX from "./zzfx.js";

let zzfx = ZzFX({
  vol: 0.3,
  ctx: new AudioContext(),
});

document.addEventListener("click", () => {
  zzfx(...[1.5, 0.8, 270, , 0.1, , 1, 1.5, , , , , , , , 0.1, 0.01]);
});

let main = "main";
console.log(main);
