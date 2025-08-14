let _ = null;
let svgNS = "http://www.w3.org/2000/svg";

let doc = document;
let body = doc.body;
let cE = doc.createElementNS.bind(doc);

export let svg = (d) => {
  let svg = cE(svgNS, "svg");
  let svgSA = body.setAttributeNS.bind(svg);
  svgSA(_, "width", 24);
  svgSA(_, "height", 24);
  svgSA(_, "viewBox", "0 0 24 24");

  let path = cE(svgNS, "path");
  let pathSA = body.setAttributeNS.bind(path);
  pathSA(_, "fill", "none");
  pathSA(_, "stroke", "currentColor");
  pathSA(_, "strokeWidth", 2);
  pathSA(_, "d", d);
  svg.appendChild(path);

  return [
    svg,
    (d) => {
      pathSA(_, "d", d);
    },
  ];
};
