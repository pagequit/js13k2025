import song from "./song";
import useZzFX from "./zzfx";
import { svg } from "./markup";

app.width = 360;
app.height = 740;

let ctx = app.getContext("2d");
ctx.imageSmoothingEnabled = false;

let appRect = app.getBoundingClientRect();

let playIcon = "M7 4v16l13-8z";
let pauseIcon =
  "M6 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm8 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z";
let [ppBtn, ppBtnContent] = svg(playIcon);
ppBtn.style =
  "color:white;position:absolute;right:0;margin:16px;padding:8px;height:4%;width:auto;border:2px solid white;border-radius:50%;";
wrap.appendChild(ppBtn);

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

let [__, zzfxP, zzfxM] = useZzFX(bgm);
let [zzfx] = useZzFX(sfx);

let buffer = zzfxM(...song);
let node;
// prettier-ignore
// zzfx(...[,,281,.03,.09,.08,1,3.3,,,,,,,,,,.93,.02]); // ???
// zzfx(...[,,141,.31,.09,.08,,3.6,,54,,,.15,,5.5,,,.57,.45,.47]); // wobble
// zzfx(...[.7,,404,.03,.02,.07,1,1.4,1,88,,,,.8,,,,.77,.05,,169]); // jump

let unPaused = !!node;
ppBtn.addEventListener("click", () => {
  // prettier-ignore
  zzfx(...[1.7,,61,.2,,.04,3,.4,,,150,.07,.01,,,,.12,.67]); // pause
  if ((unPaused = !unPaused)) {
    if (!node) {
      node = zzfxP(...buffer);
      node.loop = true;
    } else {
      bgm.x.resume(); // no need to await
    }
  } else {
    bgm.x.suspend(); // no need to await
  }
});

let vec = (x = 0, y = 0) => ({ x, y });

let vecSet = (a, b) => {
  a.x = b.x;
  a.y = b.y;
};

let vecMag = (v) => Math.sqrt(v.x * v.x + v.y * v.y);

let vecDis = (a, b) => {
  let dx = a.x - b.x;
  let dy = a.y - b.y;

  return Math.sqrt(dx * dx + dy * dy);
};

let isPointerDown = false;
let pointerPos = vec();

let adjustPointer = (x, y) => {
  // scale is based on CSS (height: 100%; width: auto;)
  let scale = app.height / self.innerHeight;
  pointerPos.x = (x - appRect.x) * scale;
  pointerPos.y = (y - appRect.y) * scale;
};

app.addEventListener("mousedown", (e) => {
  adjustPointer(e.clientX, e.clientY);
  isPointerDown = e.button == 0 ? true : isPointerDown;
});
app.addEventListener("touchstart", (e) => {
  adjustPointer(e.touches[0].clientX, e.touches[0].clientY);
  isPointerDown = true;
});
app.addEventListener("mousemove", (e) => {
  adjustPointer(e.clientX, e.clientY);
});
app.addEventListener("touchmove", (e) => {
  adjustPointer(e.touches[0].clientX, e.touches[0].clientY);
});
app.addEventListener("mouseup", (e) => {
  isPointerDown = e.button == 0 ? false : isPointerDown;
});
app.addEventListener("touchend", (e) => {
  isPointerDown = e.touches.length == 0 ? false : isPointerDown;
});
app.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

let slashOrigin = vec();
let slashDelta = vec();
let isSlashing = false;

let handleSlash = () => {
  if (isPointerDown) {
    vecSet(slashDelta, {
      x: slashOrigin.x - pointerPos.x,
      y: slashOrigin.y - pointerPos.y,
    });
    vecSet(slashOrigin, pointerPos);

    isSlashing = vecMag(slashDelta) > 8; // "slash dead zone"
  } else {
    isSlashing = false;
  }
};

let prev = 0;
let frame = 1000 / 60;
(function animate(time) {
  let delta = time - prev;
  if (delta >= frame) {
    prev = time - (delta % frame);
    ctx.clearRect(0, 0, app.width, app.height);

    if (!unPaused) {
      ctx.font = "24px monospace";
      ctx.fillStyle = "white";
      ctx.fillText("paused", 140, 360);
      ppBtnContent(playIcon);
    } else {
      ppBtnContent(pauseIcon);
    }

    handleSlash();
    if (isSlashing) {
      ctx.beginPath();
      ctx.arc(pointerPos.x, pointerPos.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }
  requestAnimationFrame(animate);
})(0);
