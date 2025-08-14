let _ = null;
let svgNS = "http://www.w3.org/2000/svg";

let doc = document;
let body = doc.body;
let cE = doc.createElementNS.bind(doc);

export let svg = (d) => {
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
};
