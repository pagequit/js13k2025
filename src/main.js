import getSong from "./song";
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
  "color:white;position:absolute;bottom:0;left:0;margin:8px;padding:4px;height:4%;width:auto;border:1px solid white;border-radius:50%;";
wrap.appendChild(ppBtn);

let cyan = "117, 252, 253";
let blue = "103, 190, 250";
let indigo = "128, 130, 247";
let phinox = "177, 78, 246";
let fuchsia = "234, 59, 247";

// prettier-ignore
// zzfx(...[1.2,0,90,.01,.06,.05,4,2,5,,,,.3,.3,,,.16,.97,.09,.1,-2375]); // Hit
// zzfx(...[,,281,.03,.09,.08,1,3.3,,,,,,,,,,.93,.02]); // ???
// zzfx(...[,,141,.31,.09,.08,,3.6,,54,,,.15,,5.5,,,.57,.45,.47]); // wobble
// zzfx(...[.7,,404,.03,.02,.07,1,1.4,1,88,,,,.8,,,,.77,.05,,169]); // jump

let bpm = 80;
let song = getSong(bpm);

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

let drawText = (text, x, y, size = 24, color = "white") => {
  ctx.font = size + "px monospace";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

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

let inAABB = (point, min, max) => {
  return (
    point.x >= min.x && point.x <= max.x && point.y >= min.y && point.y <= max.y
  );
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

let createEntityBuffer = (size, create) => {
  return [...Array(size)].map(create);
};

let pointerParticleIndex = 0;
let pointerParticles = createEntityBuffer(16, () => ({
  age: 0,
  pos: vec(),
}));

let updatePointerParticles = () => {
  if (isPointerDown) {
    let currentParticle = pointerParticles[pointerParticleIndex];
    if (currentParticle.age < 1) {
      currentParticle.age = 1;
      vecSet(currentParticle.pos, pointerPos);
    }

    if (++pointerParticleIndex >= pointerParticles.length) {
      pointerParticleIndex = 0;
    }
  } else {
    pointerParticleIndex = 0;
  }

  ctx.fillStyle = "white";
  for (let particle of pointerParticles) {
    if (particle.age > 0) {
      ctx.beginPath();
      ctx.arc(particle.pos.x, particle.pos.y, 8 / particle.age, 0, 2 * Math.PI);
      ctx.fill();

      if (++particle.age > 8) {
        particle.age = 0;
      }
    }
  }
};

let scoreAreas = [
  {
    min: vec(0, 32),
    max: vec(app.width, 120),
  },
  {
    min: vec(0, 120),
    max: vec(app.width, 208),
  },
];

let drawScoreArea = () => {
  scoreAreas.forEach((area, index) => {
    ctx.fillStyle = `rgba(${index % 2 ? cyan : fuchsia}, 0.1)`;
    ctx.strokeStyle = `rgb(${index % 2 ? cyan : fuchsia})`;
    ctx.beginPath();
    ctx.rect(
      area.min.x,
      area.min.y,
      area.max.x,
      area.max.y - (32 + index * 80),
    );
    ctx.stroke();
    ctx.fill();
  });
};

let beats = [
  [1, 0],
  [0, 0],
  [0, 2],
  [0, 0],
  [1, 2],
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [0, 0],
  [0, 1],
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 1],
];

let thingRadius = 40;
let things = beats.reduce((acc, cur, idx) => {
  cur.forEach((ct, i) => {
    if (ct) {
      acc.push({
        col: ct,
        pos: vec(i * 80 + 140, idx * thingRadius * 2 + app.height),
      });
    }
  });

  return acc;
}, []);

let then = performance.now();
let delta = 0;
let interval = 1000 / 60;

let score = 0;
let bgmPrev = 0;
let bgmDelta = 0;

let processGame = () => {
  let bgmTime = bgm.x.currentTime;
  bgmDelta = bgmTime - bgmPrev;
  bgmPrev = bgmTime;

  for (let thing of things) {
    scoreAreas.forEach((area, areaIndex) => {
      if (
        isPointerDown &&
        vecDis(pointerPos, thing.pos) <= thingRadius &&
        inAABB(thing.pos, area.min, area.max)
      ) {
        score += areaIndex + 1 === thing.col ? -1 : 1;
        thing.pos.y -= app.height;
      }
    });

    ctx.fillStyle = `rgba(${thing.col % 2 ? cyan : fuchsia}, 0.1)`;
    ctx.strokeStyle = `rgb(${thing.col % 2 ? cyan : fuchsia})`;
    thing.pos.y -= bgmDelta * (bpm * 2);
    ctx.beginPath();
    ctx.arc(thing.pos.x, thing.pos.y, thingRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }
};

(function animate(timestamp) {
  delta = timestamp - then;
  if (delta > interval) {
    then = timestamp - (delta % interval);

    if (unPaused) {
      ppBtnContent(pauseIcon);
      ctx.clearRect(0, 0, app.width, app.height);

      drawScoreArea();
      updatePointerParticles();

      processGame();

      drawText("Score: " + score, 12, 20, 16);
      drawText("Delta: " + delta.toFixed(2), 244, 20, 16);
    } else {
      ppBtnContent(playIcon);
      drawText("paused", 140, 360);
    }
  }
  requestAnimationFrame(animate);
})(then);
