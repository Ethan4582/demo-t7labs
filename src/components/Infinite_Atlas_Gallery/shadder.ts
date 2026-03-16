export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform vec2  uOffset;
  uniform vec2  uResolution;
  uniform vec4  uBorderColor;
  uniform vec4  uBackgroundColor;
  uniform vec2  uMousePos;
  uniform float uZoom;
  uniform float uCurvature;
  uniform float uCellSize;
  uniform float uTextureCount;
  uniform sampler2D uImageAtlas;
  uniform sampler2D uTextAtlas;
  varying vec2 vUv;

  // ── IQ-style hash: sin-free, stable on all GPUs at any coordinate ────────────
  float cellHash(vec2 p) {
    p = fract(p * vec2(0.1031, 0.1030));
    p += dot(p, p.yx + 33.33);
    return fract((p.x + p.y) * p.x);
  }

  // ── 9-tap Gaussian blur on the image atlas (Optimized) ────────────────────
  vec3 blurAtlas(vec2 uv, float r) {
    vec3 c  = texture2D(uImageAtlas, uv).rgb * 4.0;
    c += texture2D(uImageAtlas, uv + vec2( r,  0.)).rgb * 2.0;
    c += texture2D(uImageAtlas, uv + vec2(-r,  0.)).rgb * 2.0;
    c += texture2D(uImageAtlas, uv + vec2( 0.,  r)).rgb * 2.0;
    c += texture2D(uImageAtlas, uv + vec2( 0., -r)).rgb * 2.0;
    c += texture2D(uImageAtlas, uv + vec2( r,  r)).rgb;
    c += texture2D(uImageAtlas, uv + vec2(-r,  r)).rgb;
    c += texture2D(uImageAtlas, uv + vec2( r, -r)).rgb;
    c += texture2D(uImageAtlas, uv + vec2(-r, -r)).rgb;
    return c / 16.0;
  }

  void main() {
    vec2 screenUV = (vUv - 0.5) * 2.0;
    float radius = length(screenUV);
    
    // Optimized distortion: skip math if flat
    float distortion = 1.1;
    if (uCurvature > 0.001) {
      distortion -= uCurvature * radius * radius;
    }
    
    vec2 worldCoord = screenUV * distortion * vec2(uResolution.x / uResolution.y, 1.0);
    worldCoord = worldCoord * uZoom + uOffset;

    vec2 cellPos = worldCoord / uCellSize;
    vec2 cellId  = floor(cellPos);
    vec2 cellUV  = fract(cellPos);

    // ── Mouse hover ────────────────────────────────────────────────────────────
    vec2 mUV = (uMousePos / uResolution) * 2.0 - 1.0;
    mUV.y = -mUV.y;
    float mRad = length(mUV);
    float mDistort = 1.1;
    if (uCurvature > 0.001) {
      mDistort -= uCurvature * mRad * mRad;
    }
    vec2 mWorld = mUV * mDistort * vec2(uResolution.x / uResolution.y, 1.0);
    mWorld = mWorld * uZoom + uOffset;
    vec2 mouseCellId = floor(mWorld / uCellSize);

    float cellDist = length((cellId + 0.5) - (mouseCellId + 0.5));
    float hoverI   = (uMousePos.x >= 0.0) ? 1.0 - smoothstep(0.4, 0.7, cellDist) : 0.0;

    // ── Texture index ─────────────────────────────────────────────────────────
    // All atlasSize² slots are now filled (JS wraps textures[] to fill every slot).
    // Hash into the full atlas slot range — guaranteed valid, no empty cells possible.
    float atlasSize = ceil(sqrt(uTextureCount));
    float totalSlots = atlasSize * atlasSize;
    float texIndex  = floor(cellHash(cellId) * totalSlots);
    texIndex = mod(clamp(texIndex, 0.0, totalSlots - 1.0), totalSlots);
    vec2  atlasPos  = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));

    // ── Center image geometry ──────────────────────────────────────────────────
    float imageSize   = 0.62;
    float imageBorder = (1.0 - imageSize) * 0.5;
    vec2  imageUV     = (cellUV - imageBorder) / imageSize;
    float edgeS       = 0.012;
    vec2  imgMask     = smoothstep(-edgeS, edgeS, imageUV) * smoothstep(-edgeS, edgeS, 1.0 - imageUV);
    float imageAlpha  = imgMask.x * imgMask.y;
    bool  inImage     = imageUV.x >= 0.0 && imageUV.x <= 1.0 && imageUV.y >= 0.0 && imageUV.y <= 1.0;

    // ── LAYER 1: Base background ───────────────────────────────────────────────
    vec3 color = uBackgroundColor.rgb;

    // ── LAYER 2: Hover — frosted glass blur ───────────────────────────────────
    if (hoverI > 0.0) {
      // Scale image outward to fill cell as blurred backdrop
      vec2 bgUV = (cellUV - 0.5) / 1.8 + 0.5;
      bgUV = clamp(bgUV, 0.0, 1.0);

      vec2 bgAtlasUV = (atlasPos + bgUV) / atlasSize;
      bgAtlasUV.y = 1.0 - bgAtlasUV.y;

      vec3 blurred = blurAtlas(bgAtlasUV, 0.04 / atlasSize);

      // Moderate desaturation — frosted glass mutes colors
      float luma = dot(blurred, vec3(0.299, 0.587, 0.114));
      blurred = mix(blurred, vec3(luma), 0.35);

      // Cool silver-grey tint to match reference
      vec3 frostTint = vec3(0.55, 0.57, 0.60);
      vec3 frosted = mix(blurred, frostTint, 0.30);
      frosted *= 1.1;

      color = mix(color, frosted, hoverI * 0.92);
    }

    // ── LAYER 3: Sharp center card image ──────────────────────────────────────
    if (inImage && imageAlpha > 0.0) {
      vec2 sUV = (atlasPos + imageUV) / atlasSize;
      sUV.y = 1.0 - sUV.y;
      vec3 imgColor = texture2D(uImageAtlas, sUV).rgb;

      float shadow = smoothstep(0.0, 0.06, imageUV.x) * smoothstep(0.0, 0.06, 1.0 - imageUV.x)
                   * smoothstep(0.0, 0.06, imageUV.y) * smoothstep(0.0, 0.06, 1.0 - imageUV.y);
      imgColor *= mix(0.75, 1.0, shadow);
      color = mix(color, imgColor, imageAlpha);
    }

    // ── LAYER 4: Text overlay — always topmost ─────────────────────────────────
    vec2 overlayUV = (atlasPos + cellUV) / atlasSize;
    overlayUV.y = 1.0 - overlayUV.y;
    vec4 overlay = texture2D(uTextAtlas, overlayUV);
    color = mix(color, overlay.rgb, overlay.a);

    // ── Grid border ────────────────────────────────────────────────────────────
    float lw = 0.006;
    float gx = smoothstep(0.0, lw, cellUV.x) * smoothstep(0.0, lw, 1.0 - cellUV.x);
    float gy = smoothstep(0.0, lw, cellUV.y) * smoothstep(0.0, lw, 1.0 - cellUV.y);
    color = mix(color, uBorderColor.rgb, (1.0 - gx * gy) * uBorderColor.a);

    // ── Edge vignette ──────────────────────────────────────────────────────────
    float fade = 1.0 - smoothstep(0.4, 1.6, radius);
    gl_FragColor = vec4(color * fade, 1.0);
  }
`;





















