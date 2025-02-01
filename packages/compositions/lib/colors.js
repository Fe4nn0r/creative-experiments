const random = require("canvas-sketch-util/random");

const createColorVariation = (baseHSL) => {
  return {
    h: baseHSL.h + random.range(-3, 3), // Slight hue variation
    s: baseHSL.s + random.range(-3, 3), // Slight saturation variation
    l: baseHSL.l, // Keep original lightness
  };
};

// Adjust the color based on:
// - height: affects lightness (higher = lighter)
// - lightIntensity: affects overall brightness based on distance from light source
export const adjustColor = (baseHSL, height, lightIntensity) => {
  const variation = createColorVariation(baseHSL);
  const adjustedL = Math.min(
    variation.l * (0.3 + height * 0.7) * (0.5 + lightIntensity * 0.5),
    100
  );
  return `hsl(${variation.h}, ${variation.s}%, ${adjustedL}%)`;
};

export const toHSL = (hexColor) => {
  // Remove the # if present
  const hex = hexColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find greatest and smallest channel values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    // Achromatic
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: h * 360, // Convert to degrees
    s: s * 100, // Convert to percentage
    l: l * 100, // Convert to percentage
  };
};
