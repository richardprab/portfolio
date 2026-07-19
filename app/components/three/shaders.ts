// Inline template-literal GLSL keeps the build free of loader config under
// both Turbopack and webpack.

export const terrainVertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const terrainFragmentShader = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uFog;
  uniform vec3 uAccent;
  uniform float uFogDensity;
  uniform float uDim;
  uniform float uTime;
  uniform float uDay;

  varying vec3 vWorldPos;
  varying vec3 vNormal;

  // Antialiased iso-line at the given contour spacing. (fwidth is ZERO on
  // the carve's dead-flat quads — an unguarded 0/0 there is a NaN, and one
  // NaN fragment entering bloom's mip chain blacks out the whole frame.)
  float contour(float h, float spacing) {
    float v = h / spacing;
    float g = abs(fract(v - 0.5) - 0.5) / max(fwidth(v), 1e-5);
    return 1.0 - smoothstep(0.0, 1.2, g);
  }

  // Interleaved gradient noise: cheap per-pixel dither against banding.
  float ign(vec2 p) {
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // Smooth value noise for surface grain.
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    // DELIBERATE LOW-POLY: flat facet normals from screen-space derivatives
    // — every triangle shades as one crisp face (the up-bias keeps
    // normalize() finite on degenerate pixels; terrain never overhangs, so
    // flipping toward +Y is always correct).
    vec3 n = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)) + vec3(0.0, 1e-4, 0.0));
    if (n.y < 0.0) n = -n;
    float h = vWorldPos.y;
    float slope = 1.0 - n.y;

    // Altitude ramp: dark valley floors rising to lit slate — kept SUBTLE:
    // a strong height-brightening read as "a sun sitting on the peak";
    // direction must carry the summit's light, not altitude.
    vec3 col = uBase;
    col = mix(uBase * 0.62, col, smoothstep(0.4, 9.0, h));
    col = mix(col, mix(uBase, uLine, 0.35), smoothstep(14.0, 34.0, h) * 0.22);

    // Surface grain + noise-perturbed shading: faces stop being flat.
    float tex = vnoise(vWorldPos.xz * 0.45) * 0.6 + vnoise(vWorldPos.xz * 1.7) * 0.4;
    float b1 = vnoise(vWorldPos.xz * 2.7);
    float b2 = vnoise(vWorldPos.xz * 2.7 + vec2(0.71, 0.33));
    // ONE sun, one direction: moonlight from the moon's own side of the
    // sky at night, swinging to the LOW dawn azimuth as morning comes —
    // an overhead lambert at full day read as "the sun sits on the peak".
    vec3 sunDir = normalize(mix(vec3(0.45, 0.8, -0.5), vec3(-0.62, 0.3, 0.3), uDay));
    float light = clamp(
      dot(n, sunDir) + (b1 - b2) * slope * 0.55,
      0.0,
      1.0
    );
    // Deep directional contrast: on a faceted mountain the sun's side must
    // be unmistakable — away-faces fall into real shadow.
    col *= mix(0.58, 1.24, light);
    col *= 1.0 - slope * 0.3;
    col *= 0.95 + tex * 0.09;

    // Geological strata banding on the cliffs.
    float strata = smoothstep(0.35, 0.8, vnoise(vec2(h * 0.5, (vWorldPos.x + vWorldPos.z) * 0.05)));
    col *= 1.0 - strata * slope * 0.28;

    // Snow: a noisy snowline, settling on gentler ground, with glints.
    float snowline = 27.0 + vnoise(vWorldPos.xz * 0.12) * 6.5;
    // A wide slope gate: a sharp one flickers on/off across single grid
    // facets of steep faces and draws staircase bands; a gradient lets
    // steep snow thin out smoothly instead.
    float snow = smoothstep(snowline, snowline + 5.0, h) * smoothstep(0.18, 0.85, n.y + tex * 0.15);
    // Grained and slope-shaded so flat fields read as snowpack, not paper.
    // Snow shades directionally too: sun-facing facets blaze, away-facets
    // fall to cool blue shadow — uniform white read as top-lit.
    vec3 snowCol = mix(uLine, vec3(0.84, 0.88, 0.97), 0.62) * (0.6 + 0.56 * light);
    snowCol = mix(snowCol, snowCol * vec3(0.82, 0.88, 1.06), 1.0 - light);
    snowCol *= 0.88 + tex * 0.16;
    col = mix(col, snowCol, snow * 0.95);
    float glint = step(0.986, vnoise(vWorldPos.xz * 16.0)) * snow;
    col += vec3(glint) * 0.45;

    // Contours, quieter where snow lies.
    float minor = contour(h, 2.0);
    float major = contour(h, 10.0);
    float cAlpha = mix(1.0, 0.45, snow);
    col = mix(col, uLine, minor * 0.16 * cAlpha);
    col = mix(col, uLine, major * 0.36 * cAlpha);

    // Night falls away as the climb rises: the ground itself brightens.
    col *= mix(0.42, 1.0, uDay);

    // The rising sun's rim, growing from nothing overnight to full blaze.
    float rim = pow(clamp(dot(n, normalize(vec3(-0.6, 0.18, 0.3))), 0.0, 1.0), 2.2);
    col += uAccent * rim * mix(0.13, 0.05, snow) * mix(0.15, 1.5, uDay);

    // Aerial perspective: distance cools and lifts the palette before fog.
    float dist = length(vWorldPos - cameraPosition);
    col = mix(col, col * vec3(0.84, 0.9, 1.08), clamp(dist / 150.0, 0.0, 1.0) * 0.45);

    // Distance fog plus mist pooled in the valleys, breathing slowly —
    // strictly neutral: any warmth in the haze paints "sunlight" onto
    // faces pointing away from the sun.
    vec3 fogC = uFog * mix(0.4, 1.0, uDay);
    float fogF = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
    float mist = exp(-max(h - 2.0, 0.0) * 0.14) *
      (0.72 + 0.28 * sin(uTime * 0.07 + vWorldPos.x * 0.045 + vWorldPos.z * 0.03));
    fogF = max(fogF, mist * 0.55);
    col = mix(col, fogC, clamp(fogF, 0.0, 1.0));

    col *= 1.0 - uDim * 0.35;
    col += (ign(gl_FragCoord.xy) - 0.5) * 0.012;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// A sea of cloud filling the valleys below the climb: one translucent
// quad, all texture from noise — the cheapest possible way to make every
// wide shot read as high alpine.
export const cloudSeaVertexShader = /* glsl */ `
  varying vec3 vWorldPos;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const cloudSeaFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uShade;
  uniform vec3 uAccent;
  uniform float uTime;
  uniform float uDay;

  varying vec3 vWorldPos;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    float r = length(vWorldPos.xz);
    // Fades to nothing before the quad's edge, and parts around the
    // mountain so the banks lap at the aprons instead of crossing rock.
    float edge = 1.0 - smoothstep(95.0, 140.0, r);
    float hole = smoothstep(16.0, 30.0, r);

    // Two octaves of slow drift.
    float n = vnoise(vWorldPos.xz * 0.045 + vec2(uTime * 0.008, uTime * 0.005));
    n = n * 0.62 + 0.38 * vnoise(vWorldPos.xz * 0.11 - vec2(uTime * 0.006, 0.0));
    float bank = smoothstep(0.36, 0.74, n);

    // The morning burns part of the sea away.
    float alpha = bank * edge * hole * mix(0.48, 0.3, uDay);
    vec3 col = mix(uShade, uColor, n) * mix(0.34, 1.05, uDay);
    // First light catches the bank tops ONLY on the sun's side of the sea.
    float hl = max(r, 1e-4);
    float sunward = clamp(dot(vWorldPos.xz / hl, normalize(vec2(-0.62, 0.3))) * 0.5 + 0.5, 0.0, 1.0);
    col += uAccent * n * n * 0.14 * uDay * sunward * sunward;
    gl_FragColor = vec4(col, alpha);
  }
`;

export const skyVertexShader = /* glsl */ `
  varying vec3 vDir;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vDir = normalize(worldPos.xyz - cameraPosition);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const skyFragmentShader = /* glsl */ `
  uniform vec3 uSky;
  uniform vec3 uHorizon;
  uniform vec3 uAccent;
  uniform float uWarmth;
  uniform float uDim;
  uniform float uTime;
  uniform float uDay;

  varying vec3 vDir;

  float ign(vec2 p) {
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec3 dir = normalize(vDir);
    float hl = max(length(dir.xz), 1e-4);
    vec2 sunH = normalize(vec2(-0.62, 0.3));
    float sunward = clamp(dot(dir.xz / hl, sunH) * 0.5 + 0.5, 0.0, 1.0);
    sunward = sunward * sunward;

    float t = clamp(dir.y * 1.35 + 0.28, 0.0, 1.0);
    // Three stops: horizon, mid sky, deep zenith — darkened toward night.
    // The horizon's ember warmth belongs to the SUN'S side; away from it
    // the horizon cools toward the sky slate.
    vec3 horizonCol = mix(mix(uHorizon, uSky, 0.5), uHorizon, mix(0.3, 1.0, sunward));
    vec3 col = mix(horizonCol, uSky, pow(smoothstep(0.0, 1.0, t), 0.85));
    col = mix(col, uSky * 0.55, smoothstep(0.55, 1.0, t));
    col *= mix(0.3, 1.0, uDay);

    // Dawn breaking with the climb — FROM ONE DIRECTION. The blaze
    // concentrates toward the sun's azimuth (matching the terrain's
    // sunDir); an omnidirectional band read as a sunrise on every side.
    float band = exp(-abs(dir.y - 0.02) * 7.0);
    float dawn = 0.03 + (0.14 + uWarmth * 0.34) * uDay * mix(0.25, 1.35, sunward);
    col = mix(col, uAccent, band * dawn);
    col += uAccent * band * band * (0.1 + uWarmth * 0.55) * uDay * mix(0.1, 1.5, sunward);
    // The sun itself, low on the dawn side: the direction is unmistakable.
    vec3 sunDir = normalize(vec3(-0.62, 0.1, 0.3));
    float sunGlow = pow(clamp(dot(dir, sunDir), 0.0, 1.0), 42.0);
    col += uAccent * sunGlow * (0.4 + uWarmth) * uDay;

    // Wispy cloud bands, catching more light as morning comes.
    // (Epsilon guards atan(0,0) at the sky sphere's poles — a single NaN
    // fragment poisons the bloom chain and blacks out the whole frame.)
    float az = atan(dir.z, dir.x + 1e-4);
    float cloudMask = exp(-pow((dir.y - 0.11) * 8.5, 2.0));
    float cn = vnoise(vec2(az * 2.6 + uTime * 0.012, dir.y * 26.0));
    cn = cn * 0.65 + 0.35 * vnoise(vec2(az * 6.5 - uTime * 0.007, dir.y * 60.0));
    cn = smoothstep(0.52, 0.86, cn);
    // Clouds catch the sun's colour only on the sun's side; elsewhere they
    // stay slate — warm clouds on every horizon read as many suns.
    vec3 cloudCol = mix(uHorizon, uAccent, 0.32 * mix(0.15, 1.0, sunward)) * 1.06;
    col = mix(col, cloudCol, cloudMask * cn * mix(0.14, 0.44, uDay));

    // The moon, brightest in the night, giving way to morning.
    vec3 moonDir = normalize(vec3(0.55, 0.4, -0.72));
    float md = dot(dir, moonDir);
    float disc = smoothstep(0.99955, 0.99978, md);
    float halo = pow(clamp(md, 0.0, 1.0), 160.0) * 0.4;
    col += vec3(0.85, 0.89, 0.99) * (disc * 1.35 + halo * 0.4) * mix(1.25, 0.3, uDay);

    // Aurora curtains: a night phenomenon, fading with first light.
    float aur = vnoise(vec2(az * 3.5 + uTime * 0.02, dir.y * 5.0 - uTime * 0.015));
    aur *= vnoise(vec2(az * 9.0 - uTime * 0.013, dir.y * 14.0));
    float aurMask = smoothstep(0.16, 0.42, dir.y) * (1.0 - smoothstep(0.55, 0.85, dir.y));
    float moonSide = smoothstep(0.15, 0.85, dot(normalize(vec3(dir.x, 0.0, dir.z)), normalize(vec3(0.55, 0.0, -0.72))));
    col += vec3(0.32, 0.9, 0.72) * aur * aur * aurMask * moonSide * mix(0.24, 0.03, uDay);

    col *= 1.0 - uDim * 0.35;
    col += (ign(gl_FragCoord.xy) - 0.5) * 0.016;
    gl_FragColor = vec4(col, 1.0);
  }
`;
