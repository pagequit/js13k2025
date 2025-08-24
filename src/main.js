import getSong from "./song";
import useZzFX from "./zzfx";

app.width = 360;
app.height = 740;

let ctx = app.getContext("2d");
ctx.imageSmoothingEnabled = false;

let appRect = app.getBoundingClientRect();

let cyan = "117, 252, 253";
let blue = "103, 190, 250";
let indigo = "128, 130, 247";
let phinox = "177, 78, 246";
let fuchsia = "234, 59, 247";
let bgc = "#0f0027";

let bpm = 60;
let [song, beats] = getSong(bpm);

// I have no clue where this 8.47 came from >.<
// https://github.com/keithclark/ZzFXM/blob/cb07fa9ca36aefd67a0c8c656d2958b62f8ed9fe/tools/tracker/src/components/SongProperties.svelte#L20
let songSec = ((12 + 8 + 8 + 16) * (125 / bpm)) / 8.47;

let bgm = {
  v: 0.5,
  r: 44100,
  x: new AudioContext(),
};
let sfx = {
  v: 0.5,
  r: 44100,
  x: new AudioContext(),
};

let [__, zzfxP, zzfxM] = useZzFX(bgm);
let [zzfx] = useZzFX(sfx);

let songBuffer = zzfxM(...song);
let songNode;

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

self.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w": {
      console.log("up");
      break;
    }
    case "ArrowLeft":
    case "a": {
      console.log("left");
      break;
    }
    case "ArrowDown":
    case "s": {
      console.log("down");
      break;
    }
    case "ArrowRight":
    case "d": {
      console.log("right");
      break;
    }
    case "Enter":
    case " ": {
      console.log("select");
      break;
    }
  }
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

let bastet = new Image();
bastet.src = "bastet.png";
let drawSprite = (col, row, x, y) => {
  ctx.drawImage(bastet, col * 16, row * 16, 16, 16, x, y, 120, 120);
};

let drawThing = (dir, x, y) => {
  let angle = (deg) => (deg * Math.PI) / 180;

  switch (dir) {
    case 0: {
      ctx.translate(-25, -25);
      break;
    }
    case 1: {
      ctx.translate(x, y);
      ctx.rotate(angle(90));
      ctx.translate(-x - 25, -y - 25);
      break;
    }
    case 2: {
      ctx.translate(x, y);
      ctx.rotate(angle(180));
      ctx.translate(-x - 25, -y - 25);
      break;
    }
    case 3: {
      ctx.translate(x, y);
      ctx.rotate(angle(270));
      ctx.translate(-x - 25, -y - 25);
      break;
    }
  }
  ctx.drawImage(bastet, 36, 4, 8, 8, x, y, 50, 50);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  ctx.translate(-40, -40);
  ctx.drawImage(bastet, 16, 0, 16, 16, x, y, 80, 80);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

let renderButton = (pos, width, label) => {
  ctx.drawImage(bastet, 16, 0, 8, 16, pos.x, pos.y, 40, 80);
  ctx.drawImage(bastet, 24, 0, 8, 16, pos.x + width - 40, pos.y, 40, 80);

  ctx.drawImage(bastet, 22, 0, 4, 3, pos.x + 40, pos.y, width - 80, 15);
  ctx.drawImage(bastet, 22, 13, 4, 3, pos.x + 40, pos.y + 65, width - 80, 15);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  drawText(label, pos.x + width / 2, pos.y + 40, 29);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
};

let scoreAreas = [
  {
    min: vec(0, 32),
    max: vec(app.width, 112),
  },
  {
    min: vec(0, 112),
    max: vec(app.width, 192),
  },
];

let drawScoreArea = () => {
  ctx.globalAlpha = 0.2;
  scoreAreas.forEach((area, index) => {
    let isTop = index != 0;
    let color = `rgb(${isTop ? cyan : fuchsia})`;
    let grad = ctx.createLinearGradient(
      area.max.x / 2,
      area.min.y,
      area.max.x / 2,
      area.max.y,
    );
    grad.addColorStop(0, bgc);
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, bgc);
    ctx.fillStyle = grad;
    ctx.fillRect(
      area.min.x,
      area.min.y,
      area.max.x,
      area.max.y - (32 + index * 80),
    );

    let x = app.width / 2 + 40;
    let y = area.min.y + 40;
    drawThing(isTop ? 0 : 1, x - 80, y);
    drawThing(isTop ? 2 : 3, x, y);
  });

  ctx.globalAlpha = 1;
  drawSprite(0, 0, -8, 50);
  ctx.scale(-1, 1);
  drawSprite(0, 0, -app.width - 8, 50);
  ctx.scale(1, 1);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

let thingRadius = 40;
let things = beats.reduce((acc, cur, idx) => {
  cur.forEach((ct, i) => {
    if (ct) {
      acc.push({
        col: ct,
        pos: vec(i * 80 + 140, idx * 80 - (ct - 1) * 80 + 152),
      });
    }
  });

  return acc;
}, []);

let missedThing = things.map(() => false);
let score = 0;
let bgmPrev = 0;
let bgmDelta = 0;

let thingPassesY = (thing, y) => thing.pos.y + thingRadius < y;

let gameState = 0;
let process = [
  // 0 -> "main menu"
  () => {
    renderButton(
      {
        x: 64,
        y: app.height / 2 - 40,
      },
      app.width - 128,
      "Start!",
    );
    if (false) {
      // prettier-ignore
      zzfx(...[.2,,61,.1,,.04,3,.4,,,150,.07,.01,,,,.12,.67]); // pause
      songNode = zzfxP(...songBuffer);
      songNode.loop = true;
      gameState = 1;
    }
  },
  // 1 -> "playing"
  () => {
    let bgmTime = bgm.x.currentTime;
    bgmDelta = bgmTime - bgmPrev;
    bgmPrev = bgmTime;

    for (let i in things) {
      let thing = things[i];
      thing.pos.y -= bgmDelta * ((80 * beats.length) / songSec);

      let bitmap = 0;
      bitmap |= thing.pos.x > app.width / 2 ? 2 : 0;
      bitmap |= thing.col > 1 ? 1 : 0;

      scoreAreas.forEach((area, areaIndex) => {
        if (
          isPointerDown &&
          vecDis(pointerPos, thing.pos) <= thingRadius &&
          inAABB(thing.pos, area.min, area.max)
        ) {
          if (areaIndex + 1 === thing.col) {
            score--;
            // prettier-ignore
            zzfx(...[.3,0,164.81,.02,.2,,3,,,,10,.1,,,-1,,.05,.3,.1]); // E3
          } else {
            score += 2;

            switch (bitmap) {
              // (10) v
              case 0: {
                // prettier-ignore
                zzfx(...[.2,0,415.3,.02,.2,,3,,,,10,.1,,,-1,,.05,.3,.1]); // G#4
                break;
              }
              // (20) <
              case 1: {
                // prettier-ignore
                zzfx(...[.2,0,277.18,.02,.2,,3,,,,10,.1,,,-1,,.05,.3,.1]); // C#4
                break;
              }
              // (01) ^
              case 2: {
                // prettier-ignore
                zzfx(...[.2,0,466.16,.02,.2,,3,,,,10,.1,,,-1,,.05,.3,.1]); // A#4
                break;
              }
              // (02) >
              case 3: {
                // prettier-ignore
                zzfx(...[.2,0,329.63,.02,.2,,3,,,,10,.1,,,-1,,.05,.3,.1]); // E4
                break;
              }
            }
          }

          thing.pos.y -= app.height;
        }
      });

      if (thingPassesY(thing, 32) && !missedThing[i]) {
        missedThing[i] = true;
        score--;
      }

      if (thingPassesY(thing, app.height - 80)) {
        ctx.fillStyle = `rgba(${thing.col % 2 ? cyan : fuchsia}, .4)`;
        ctx.beginPath();
        ctx.arc(thing.pos.x, thing.pos.y, 39, 0, 2 * Math.PI);
        ctx.fill();

        ctx.globalAlpha = 0.8;
        drawThing(bitmap, thing.pos.x, thing.pos.y);
        ctx.globalAlpha = 1;
      }
    }
  },
  // 2 -> "game over"
  () => {
    bgm.x.suspend();
    renderButton(
      {
        x: 64,
        y: app.height / 2 - 40,
      },
      app.width - 128,
      "try again",
    );
  },
];

let interval = 1000 / 60;
let delta = 0;
let then = performance.now();

(function animate(timestamp) {
  delta = timestamp - then;
  if (delta > interval) {
    ctx.clearRect(0, 0, app.width, app.height);

    process[gameState]();

    drawScoreArea();

    drawSprite(1, 1, app.width / 2 - 64, app.height - 120 - 16); // cat

    updatePointerParticles();

    drawText("Score: " + score, 12, 20, 16);
    if (bgm.x.currentTime > songSec) {
      gameState = 2;
    }

    then = timestamp - (delta % interval);
  }

  requestAnimationFrame(animate);
})(then);
