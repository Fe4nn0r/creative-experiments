const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");
const compositionConfig = require("./compositions.json");
const { isPointInPolygon, getPolygonBounds } = require("./geometry");
const { drawShapes } = require("./drawing");
const { toHSL } = require("./colors");
const settings = {
  dimensions: [2048, 2048],
  /*
  dimensions: "a4",
  pixelsPerInch: 300,
  units: "cm",
  */
};

const sketch = () => {
  random.setSeed(random.getRandomSeed());

  const palette = random.shuffle(random.pick(palettes));

  let paletteIndex = 0;
  const getNextPaletteColor = () => {
    paletteIndex++;
    if (paletteIndex >= palette.length) {
      paletteIndex = 0;
    }

    return palette[paletteIndex];
  };

  const composition = random.pick(Object.values(compositionConfig));

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    const shape = (() => {
      const randomValue = random.value();
      if (randomValue > 0.5) {
        return "triangle";
      }
      return "circle";
    })();

    const fillShape = (
      shapePoints,
      lightSource,
      shapeSettings = {
        minSize: 30,
        maxSize: 120,
      }
    ) => {
      const bounds = getPolygonBounds(shapePoints);
      const shapes = [];
      const numShapes = 3000;

      for (let i = 0; i < numShapes; i++) {
        const x = random.range(bounds.minX, bounds.maxX);
        const y = random.range(bounds.minY, bounds.maxY);

        if (!isPointInPolygon([x, y], shapePoints)) {
          continue;
        }

        const size = random.range(shapeSettings.minSize, shapeSettings.maxSize);
        const rotation = random.range(0, Math.PI * 2);

        // Calculate height and lighting
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - (bounds.minX + bounds.maxX) / 2, 2) +
            Math.pow(y - (bounds.minY + bounds.maxY) / 2, 2)
        );
        const maxDistance =
          Math.sqrt(
            Math.pow(bounds.maxX - bounds.minX, 2) +
              Math.pow(bounds.maxY - bounds.minY, 2)
          ) / 2;

        const height = 1 - distanceFromCenter / maxDistance;

        // Calculate lighting
        const dx = x - lightSource.x;
        const dy = y - lightSource.y;
        const distanceToLight = Math.sqrt(dx * dx + dy * dy);
        const lightIntensity = Math.min(
          1,
          Math.max(0.2, 1 - distanceToLight / (maxDistance * 2))
        );

        switch (shape) {
          case "triangle":
            const vertices = [];
            for (let j = 0; j < 3; j++) {
              const angle = rotation + (j * 2 * Math.PI) / 3;
              vertices.push([
                x + (Math.cos(angle) * size) / 2,
                y + (Math.sin(angle) * size) / 2,
              ]);
            }
            shapes.push({
              type: "triangle",
              vertices,
              height,
              lightIntensity,
              strokeWidth: random.range(1, 3),
            });
            break;
          case "circle":
            shapes.push({
              type: "circle",
              x,
              y,
              radius: size / 2,
              height,
              lightIntensity,
              strokeWidth: random.range(1, 3),
            });
            break;
        }
      }

      return shapes;
    };

    // Convert relative positions to absolute positions
    const convertToAbsolute = (points) => {
      return points.map(([x, y]) => [x * width, y * height]);
    };

    // Define light source
    const lightSource = {
      x: width * composition.lightSource.xRatio,
      y: height * composition.lightSource.yRatio,
    };

    // Create full canvas background shape
    const backgroundShape = {
      name: "canvas_background",
      points: [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ],
      color: getNextPaletteColor(),
      shapes: fillShape(
        [
          [0, 0],
          [width, 0],
          [width, height],
          [0, height],
        ],
        lightSource,
        {
          minSize: 40,
          maxSize: 150,
          numShapes: 2000,
        }
      ),
    };

    // Process all shapes from JSON
    const shapesEntries = Object.entries(composition.shapes);
    const shapesFromJSON = shapesEntries.map(([name, points], index) => {
      const absolutePoints = convertToAbsolute(points);

      const color = getNextPaletteColor();

      return {
        name,
        points: absolutePoints,
        color,
        shapes: fillShape(absolutePoints, lightSource),
      };
    });

    // Combine background with other shapes, background first
    const allShapes = [backgroundShape, ...shapesFromJSON];

    // Draw all shapes in order
    allShapes.forEach((shape) => {
      const colorHSL = toHSL(shape.color);
      drawShapes(context, shape.shapes, colorHSL);
    });
  };
};

module.exports = {
  paint: (options) => {
    canvasSketch(sketch, {
      ...settings,
      ...options,
    });
  },
};
