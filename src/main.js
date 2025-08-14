import song from "./song";
import useZzFX from "./zzfx";

app.width = 360;
app.height = 740;
let ctx = app.getContext("2d");
ctx.imageSmoothingEnabled = false;

let _ = null;
let svgNS = "http://www.w3.org/2000/svg";

let doc = document;
let body = doc.body;
let cE = doc.createElementNS.bind(doc);

function createSVG(d) {
  let svg = cE(svgNS, "svg");
  let sSA = body.setAttributeNS.bind(svg);
  sSA(_, "width", 24);
  sSA(_, "height", 24);
  sSA(_, "viewBox", "0 0 24 24");

  let path = cE(svgNS, "path");
  let pSA = body.setAttributeNS.bind(path);
  pSA(_, "fill", "none");
  pSA(_, "stroke", "currentColor");
  pSA(_, "strokeWidth", 2);
  pSA(_, "d", d);
  svg.appendChild(path);

  return [
    svg,
    (d) => {
      pSA(_, "d", d);
    },
  ];
}

let playIcon = "M7 4v16l13-8z";
let pauseIcon =
  "M6 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm8 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z";
let [ppBtn, ppBtnContent] = createSVG(playIcon);
ppBtn.style = `
  color: white;
  position: absolute;
  right: 0;
  margin: 16px;
  padding: 8px;
  height: 4%;
  width: auto;
  border: 2px solid white;
  border-radius: 50%;
`;
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
  zzfx(...[1.7,,61,.2,,.04,3,.4,,,150,.07,.01,,,,.12,.67]);
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
      ctx.fillText("paused", 140, 360);
      ppBtnContent(playIcon);
    } else {
      ppBtnContent(pauseIcon);
    }
  }
  requestAnimationFrame(animate);
})(0);
