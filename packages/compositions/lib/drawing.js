import { adjustColor } from "./colors";

export const drawShapes = (context, shapes, colorHSL) => {
  shapes.forEach((shape) => {
    context.save();
    context.beginPath();

    if (shape.type === "triangle") {
      context.moveTo(shape.vertices[0][0], shape.vertices[0][1]);
      context.lineTo(shape.vertices[1][0], shape.vertices[1][1]);
      context.lineTo(shape.vertices[2][0], shape.vertices[2][1]);
    } else {
      context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
    }

    context.closePath();

    // Fill the shape
    context.fillStyle = adjustColor(
      colorHSL,
      shape.height,
      shape.lightIntensity
    );
    context.fill();

    // Add stroke
    context.lineWidth = shape.strokeWidth;
    context.strokeStyle = adjustColor(
      {
        h: colorHSL.h,
        s: colorHSL.s,
        l: Math.max(0, colorHSL.l - 20), // Slightly darker than fill
      },
      shape.height,
      shape.lightIntensity
    );
    context.stroke();

    context.restore();
  });
};
