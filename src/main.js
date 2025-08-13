import song from "./song";
import { useZzFX } from "./zzfx";

let bgm = {
  v: 0.3,
  r: 44100,
  x: new AudioContext(),
};
let sfx = {
  v: 0.3,
  r: 44100,
  x: new AudioContext(),
};

let [_, zzfxP, zzfxM] = useZzFX(bgm);
let [zzfx] = useZzFX(sfx);

let buffer = zzfxM(...song);
let node;
let pause = !!node;
self.addEventListener("click", async () => {
  // prettier-ignore
  // zzfx(...[,,281,.03,.09,.08,1,3.3,,,,,,,,,,.93,.02]); // ???
  // zzfx(...[,,141,.31,.09,.08,,3.6,,54,,,.15,,5.5,,,.57,.45,.47]); // wobble
  // zzfx(...[.7,,404,.03,.02,.07,1,1.4,1,88,,,,.8,,,,.77,.05,,169]); // jump

  // prettier-ignore
  zzfx(...[,,281,.03,.09,.08,1,3.3,,,,,,,,,,.93,.02]);

  if ((pause = !pause)) {
    if (!node) {
      node = zzfxP(...buffer);
      node.loop = true;
    } else {
      await bgm.x.resume();
    }
    console.log("playing...");
  } else {
    await bgm.x.suspend();
    console.log("...paused");
  }
});

let prev = 0;
let fps = 1000 / 60;
(function animate(time) {
  let delta = time - prev;
  if (delta < fps) {
    return;
  }
  prev = time - (delta % fps);

  requestAnimationFrame(animate);
})(0);
