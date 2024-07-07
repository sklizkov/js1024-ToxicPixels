// Variables
var
  // a = the canvas element
  // b = the body element
  // c = the 2d context
  // d = the document element
  // M = a bool that indicates if the user is on mobile
  m = Math,
  f = m.floor,
  w = a.width,
  h = a.height

var
  GRID_SIZE = 64,
  PIXEL_SIZE = f(m.min(w, h) / GRID_SIZE),
  ARIA_SIZE = PIXEL_SIZE * GRID_SIZE,
  PIXEL_COUNT = GRID_SIZE * GRID_SIZE,
  OFFSET_X = f((w - ARIA_SIZE) / 2),
  OFFSET_Y = f((h - ARIA_SIZE) / 2)

var
  permutation = [],
  gradient = [],
  trace = {}

// Utils
var
  dot = (a, b) => a[0] * b[0] + a[1] * b[1],
  fade = (t) => t * t * t * (t * (t * 6 - 15) + 10),
  lerp = (a, b, t) => (1 - t) * a + t * b
  // distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  // clamp = (min, val, max) => Math.min(Math.max(min, val), max)

// 2D Perlin Noise
for (var i = 256; i--;) {
  permutation[i] = permutation[i + 256] = f(m.random() * 256)
  gradient[i] = gradient[i + 256] = [
    [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
    [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
    [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1],
  ][permutation[i] % 8]
}

var noise = (x, y) => {
  var
    X = f(x),
    Y = f(y)

  x -= X
  y -= Y

  X &= 255
  Y &= 255

  return lerp(
    lerp(
      dot(gradient[X + permutation[Y]], [x, y]),
      dot(gradient[X + 1 + permutation[Y]], [x - 1, y]),
      fade(x)
    ),
    lerp(
      dot(gradient[X + permutation[Y + 1]], [x, y - 1]),
      dot(gradient[X + 1 + permutation[Y + 1]], [x - 1, y - 1]),
      fade(x)
    ),
    fade(y)
  )
}

// Mouse
a.onmousemove = e => {
  var
    x = e.offsetX,
    y = e.offsetY,
    i = f((x - OFFSET_X) / PIXEL_SIZE) + f((y - OFFSET_Y) / PIXEL_SIZE) * GRID_SIZE

  if (x > OFFSET_X && x < OFFSET_X + ARIA_SIZE && y > OFFSET_Y && y < OFFSET_Y + ARIA_SIZE) trace[i] = 1
}

// Draw loop
var tick = (t = 0) => {
  t *= .0002

  for (var i = PIXEL_COUNT; i--;) {
    var
      x = i % GRID_SIZE,
      y = i >> 6 // Math.floor(i / (2 ** 6)) // 2 ** 6 === 64 === GRID_SIZE

    // Background (Noise)
    var h = noise(x / 30 + t, y / 30 + t) * noise(x / 45 - t, y / 45 - t) * 720

    // Waves
    for (var j in trace) {
      var distance = m.hypot((j % GRID_SIZE) - x, (j >> 6) - y)

      h += m.min(m.max(0, (150 - (8 - m.sin(distance * (.2 + trace[j]) - t * 25) * 2) * distance)), 255) * trace[j] * .1
    }

    trace[i] && trace[i] > 0 ? (trace[i] -= .01) : delete trace[i]

    // Draw
    c.fillStyle = `hsl(${ h + t * 64 },50%,50%)`
    c.fillRect(OFFSET_X + x * PIXEL_SIZE, OFFSET_Y + y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
  }

  requestAnimationFrame(tick)
}
tick()
