import song from "./song";
import { useZzFX } from "./zzfx";

canvas.width = 360;
canvas.height = 740;
let ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let bgm = {
  v: 0.3,
  r: 44100,
  x: new AudioContext(),
};
let sfx = {
  v: 0.05,
  r: 44100,
  x: new AudioContext(),
};

let [_, zzfxP, zzfxM] = useZzFX(bgm);
let [zzfx] = useZzFX(sfx);

let buffer = zzfxM(...song);
let node;
// prettier-ignore
// zzfx(...[,,281,.03,.09,.08,1,3.3,,,,,,,,,,.93,.02]); // ???
// zzfx(...[,,141,.31,.09,.08,,3.6,,54,,,.15,,5.5,,,.57,.45,.47]); // wobble
// zzfx(...[.7,,404,.03,.02,.07,1,1.4,1,88,,,,.8,,,,.77,.05,,169]); // jump

let unPaused = !!node;
self.addEventListener("click", async () => {
  // prettier-ignore
  zzfx(...[1.7,,61,.2,,.04,3,.4,,,150,.07,.01,,,,.12,.67]);
  if ((unPaused = !unPaused)) {
    if (!node) {
      node = zzfxP(...buffer);
      node.loop = true;
    } else {
      await bgm.x.resume();
    }
  } else {
    await bgm.x.suspend();
  }
});

let prev = 0;
let fps = 1000 / 60;
(function animate(time) {
  let delta = time - prev;
  if (delta >= fps) {
    prev = time - (delta % fps);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!unPaused) {
      ctx.font = "24px monospace";
      ctx.fillStyle = "white";
      ctx.fillText("Paused", 136, 360);
    }
  }
  requestAnimationFrame(animate);
})(0);
