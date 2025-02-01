const { paint } = require("../lib/index.js");

window.paintExperiment = (options = {}) => {
  const canvas = document.querySelector("canvas");
  paint({
    ...options,
    canvas,
  });
};
