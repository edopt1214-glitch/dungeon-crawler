import { VIS } from './constants.js';

// Recursive shadowcasting in 8 octants.
// Reference: http://www.roguebasin.com/index.php/FOV_using_recursive_shadowcasting
//
// Octant transformation multipliers:
//   world_x = ox + col * xx + row * xy
//   world_y = oy + col * yx + row * yy
const OCTANTS = [
  [ 1,  0,  0, -1],
  [ 0,  1, -1,  0],
  [ 0, -1, -1,  0],
  [-1,  0,  0, -1],
  [-1,  0,  0,  1],
  [ 0, -1,  1,  0],
  [ 0,  1,  1,  0],
  [ 1,  0,  0,  1],
];

function castLight(map, ox, oy, row, startSlope, endSlope, radius, xx, xy, yx, yy) {
  if (startSlope < endSlope) return;

  let nextStart = startSlope;
  let blocked   = false;

  for (let distance = row; distance <= radius && !blocked; distance++) {
    const dy = -distance;

    for (let dx = -distance; dx <= 0; dx++) {
      const wx = ox + dx * xx + dy * xy;
      const wy = oy + dx * yx + dy * yy;

      const lSlope = (dx - 0.5) / (dy + 0.5);
      const rSlope = (dx + 0.5) / (dy - 0.5);

      if (startSlope < rSlope) continue;
      if (endSlope   > lSlope) break;

      // Within the lit cone — mark visible if within radius
      if (dx * dx + dy * dy < radius * radius) {
        map.setVisible(wx, wy);
      }

      if (blocked) {
        if (map.isOpaque(wx, wy)) {
          nextStart = rSlope;
        } else {
          blocked   = false;
          startSlope = nextStart;
        }
      } else if (map.isOpaque(wx, wy) && distance < radius) {
        blocked = true;
        castLight(map, ox, oy, distance + 1, startSlope, lSlope, radius, xx, xy, yx, yy);
        nextStart = rSlope;
      }
    }
  }
}

// Update map visibility from (ox, oy) with the given radius.
// Fades previously-visible tiles to REMEMBERED before computing.
export function computeFOV(map, ox, oy, radius) {
  map.fadeVisible();
  map.setVisible(ox, oy);

  for (const [xx, xy, yx, yy] of OCTANTS) {
    castLight(map, ox, oy, 1, 1.0, 0.0, radius, xx, xy, yx, yy);
  }
}
