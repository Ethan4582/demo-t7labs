
import * as THREE from "three";
import { projects, type Project } from "./data/asset_data";
import { vertexShader, fragmentShader } from "./shadder";

interface Config {
   cellSize: number;
   zoomLevel: number;
   lerpFactor: number;
   borderColor: string;
   backgroundColor: string;
   textColor: string;
   hoverColor: string;
}

const config: Config = {
   cellSize: 0.75,
   zoomLevel: 1.25,
   lerpFactor: 0.075,
   borderColor: "rgba(255, 255, 255, 0.15)",
   backgroundColor: "rgba(0, 0, 0, 1)",
   textColor: "rgba(128, 128, 128, 1)",
   hoverColor: "rgba(255, 255, 255, 0)",
};

let scene: THREE.Scene | undefined;
let camera: THREE.OrthographicCamera | undefined;
let renderer: THREE.WebGLRenderer | undefined;
let plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | undefined;

let isDragging = false;
let isClick = true;
let clickStartTime = 0;

let previousMouse = { x: 0, y: 0 };
let offset = { x: 0, y: 0 };
let targetOffset = { x: 0, y: 0 };

let mousePosition = { x: -1, y: -1 };

let zoomLevel = 1.0;
let targetZoom = 1.0;

let curvatureLevel = 0.14;
let targetCurvature = 0.14;

let BASE_CURVATURE = 0.14;
const DRAG_CURVATURE = 0.20;
const FLATTENED_DRAG_CURVATURE = 0.08; // Increased from 0 to show sliding effect

let textTextures: THREE.CanvasTexture[] = [];
let animationFrameId: number;
let isFlattened = false;

export const setConfig = (updates: { curvature?: number; zoom?: number; isFlattened?: boolean }) => {
   if (updates.curvature !== undefined) {
      BASE_CURVATURE = updates.curvature;
      if (!isDragging) targetCurvature = updates.curvature;
   }
   if (updates.zoom !== undefined) {
      config.zoomLevel = updates.zoom;
      if (!isDragging) targetZoom = updates.isFlattened ? updates.zoom * 0.96 : 1.0;
   }
   if (updates.isFlattened !== undefined) {
      isFlattened = updates.isFlattened;
      targetCurvature = isFlattened ? 0.0 : BASE_CURVATURE;
      targetZoom = isFlattened ? config.zoomLevel * 0.96 : 1.0;
   }
};

const rgbaToArray = (rgba: string): number[] => {
   const match = rgba.match(/rgba?\(([^)]+)\)/);
   if (!match) return [1, 1, 1, 1];
   return match[1]
      .split(",")
      .map((v, i) =>
         i < 3 ? parseFloat(v.trim()) / 255 : parseFloat(v.trim()) || 1
      );
};

const CELL_TEX_SIZE = 1024;

const createTextTexture = (project: Project): THREE.CanvasTexture => {
   const S = CELL_TEX_SIZE;
   const canvas = document.createElement("canvas");
   canvas.width = S;
   canvas.height = S;
   const ctx = canvas.getContext("2d");
   if (!ctx) throw new Error("Could not get 2D context");

   ctx.clearRect(0, 0, S, S);

   const pad = 28;
   const dimColor = "rgba(255, 255, 255, 0.95)";
   const tagBg = "rgba(50, 50, 50, 0.85)";
   const tagText = "rgba(255, 255, 255, 0.95)";
   const tagBorder = "rgba(100, 100, 100, 0.9)";

   const monoFont = `"IBM Plex Mono", "Courier New", monospace`;

   // TOP-RIGHT: Project title
   ctx.font = `500 36px ${monoFont}`;
   ctx.fillStyle = dimColor;
   ctx.textAlign = "right";
   ctx.textBaseline = "top";
   const maxTitleW = S - pad * 2;
   let titleStr = project.title.toUpperCase();
   ctx.font = `500 30px ${monoFont}`;
   while (ctx.measureText(titleStr).width > maxTitleW && titleStr.length > 4) {
      titleStr = titleStr.slice(0, -2);
   }
   ctx.fillText(titleStr, S - pad, pad);

   // BOTTOM-LEFT: Tags
   if (project.Tags && project.Tags.length > 0) {
      const tagFontSize = 22;
      ctx.font = `500 ${tagFontSize}px ${monoFont}`;
      const pillH = 36;
      const pillPadX = 14;
      const pillGap = 10;
      const bottomY = S - pad - pillH;

      let curX = pad;
      project.Tags.forEach((tag, idx) => {
         const label = tag.toUpperCase();
         const textW = ctx.measureText(label).width;
         const isFirst = idx === 0;
         const pillW = isFirst ? textW : textW + pillPadX * 2;

         if (!isFirst) {
            ctx.beginPath();
            const r = pillH / 2;
            ctx.moveTo(curX + r, bottomY);
            ctx.lineTo(curX + pillW - r, bottomY);
            ctx.arcTo(curX + pillW, bottomY, curX + pillW, bottomY + pillH, r);
            ctx.lineTo(curX + pillW, bottomY + r);
            ctx.arcTo(curX + pillW, bottomY + pillH, curX + pillW - r, bottomY + pillH, r);
            ctx.lineTo(curX + r, bottomY + pillH);
            ctx.arcTo(curX, bottomY + pillH, curX, bottomY + r, r);
            ctx.lineTo(curX, bottomY + r);
            ctx.arcTo(curX, bottomY, curX + r, bottomY, r);
            ctx.closePath();

            ctx.fillStyle = tagBg;
            ctx.fill();
            ctx.strokeStyle = tagBorder;
            ctx.lineWidth = 1.5;
            ctx.stroke();
         }

         ctx.fillStyle = isFirst ? dimColor : tagText;
         ctx.textAlign = "left";
         ctx.textBaseline = "middle";
         const textX = isFirst ? curX : curX + pillPadX;
         ctx.fillText(label, textX, bottomY + pillH / 2);

         curX += pillW + pillGap * (isFirst ? 1.5 : 1);
         if (curX > S - pad * 3) return;
      });
   }

   // BOTTOM-RIGHT: Year
   ctx.font = `500 30px ${monoFont}`;
   ctx.fillStyle = dimColor;
   ctx.textAlign = "right";
   ctx.textBaseline = "bottom";
   ctx.fillText(project.year.toString(), S - pad, S - pad);

   const texture = new THREE.CanvasTexture(canvas);
   Object.assign(texture, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      flipY: false,
      generateMipmaps: false,
      format: THREE.RGBAFormat,
   });

   return texture;
};


const createTextureAtlas = (textures: THREE.Texture[], isText = false): THREE.CanvasTexture => {
   const atlasSize = Math.ceil(Math.sqrt(textures.length));
   const textureSize = isText ? CELL_TEX_SIZE : 512;

   const canvas = document.createElement("canvas");
   canvas.width = canvas.height = atlasSize * textureSize;
   const ctx = canvas.getContext("2d");
   if (!ctx) throw new Error("Could not get 2D context");

   if (isText) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
   } else {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
   }

   const totalSlots = atlasSize * atlasSize;
   for (let slot = 0; slot < totalSlots; slot++) {
      const texture = textures[slot % textures.length];
      const x = (slot % atlasSize) * textureSize;
      const y = Math.floor(slot / atlasSize) * textureSize;

      if (!texture?.image) continue;

      try {
         if (isText) {
            ctx.drawImage(texture.image as HTMLCanvasElement, x, y, textureSize, textureSize);
         } else {
            ctx.drawImage(texture.image as HTMLImageElement, x, y, textureSize, textureSize);
         }
      } catch {
         if (!isText) {
            ctx.fillStyle = "#1c1c2e";
            ctx.fillRect(x, y, textureSize, textureSize);
         }
      }
   }

   const atlasTexture = new THREE.CanvasTexture(canvas);
   Object.assign(atlasTexture, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      flipY: false,
   });

   return atlasTexture;
};

const loadTextures = (): Promise<THREE.Texture[]> => {
   const textureLoader = new THREE.TextureLoader();
   textureLoader.crossOrigin = "anonymous";
   const imageTextures: THREE.Texture[] = [];
   let loadedCount = 0;

   return new Promise((resolve) => {
      projects.forEach((project: Project, projectIndex: number) => {
         const placeholder = new THREE.Texture();
         imageTextures.push(placeholder);
         textTextures.push(createTextTexture(project));

         const texture = textureLoader.load(
            project.image,
            () => {
               imageTextures[projectIndex] = texture;
               if (++loadedCount === projects.length) resolve(imageTextures);
            },
            undefined,
            () => {
               const fb = document.createElement("canvas");
               fb.width = fb.height = 64;
               const ctx = fb.getContext("2d");
               if (ctx) {
                  ctx.fillStyle = project.bgColor || "#1a1a2e";
                  ctx.fillRect(0, 0, 64, 64);
                  ctx.fillStyle = "rgba(255,255,255,0.3)";
                  ctx.font = "bold 10px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText(project.title.slice(0, 8).toUpperCase(), 32, 36);
               }
               const fallback = new THREE.CanvasTexture(fb);
               Object.assign(fallback, {
                  wrapS: THREE.ClampToEdgeWrapping,
                  wrapT: THREE.ClampToEdgeWrapping,
                  minFilter: THREE.LinearFilter,
                  magFilter: THREE.LinearFilter,
               });
               imageTextures[projectIndex] = fallback;
               if (++loadedCount === projects.length) resolve(imageTextures);
            }
         );

         Object.assign(texture, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
         });
      });
   });
};


const updateMousePosition = (event: MouseEvent) => {
   if (!renderer) return;
   const rect = renderer.domElement.getBoundingClientRect();
   mousePosition.x = event.clientX - rect.left;
   mousePosition.y = event.clientY - rect.top;

   plane?.material.uniforms.uMousePos.value.set(
      mousePosition.x,
      mousePosition.y
   );
};

const startDrag = (x: number, y: number) => {
   isDragging = true;
   isClick = true;
   clickStartTime = Date.now();
   const gallery = document.getElementById("gallery");
   if (gallery) gallery.classList.add("dragging");
   previousMouse.x = x;
   previousMouse.y = y;

   setTimeout(() => isDragging && (targetZoom = isFlattened ? config.zoomLevel : config.zoomLevel), 150);
   targetCurvature = isFlattened ? FLATTENED_DRAG_CURVATURE : DRAG_CURVATURE;
};

const onPointerDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY);

const onTouchStart = (e: TouchEvent) => {
   startDrag(e.touches[0].clientX, e.touches[0].clientY);
};

const handleMove = (currentX: number, currentY: number) => {
   if (!isDragging || currentX === undefined || currentY === undefined) return;

   const deltaX = currentX - previousMouse.x;
   const deltaY = currentY - previousMouse.y;

   if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      isClick = false;
      if (targetZoom === 1.0 || (isFlattened && targetZoom === config.zoomLevel * 0.96)) {
         targetZoom = config.zoomLevel;
      }
   }

   targetOffset.x -= deltaX * 0.003;
   targetOffset.y += deltaY * 0.003;

   previousMouse.x = currentX;
   previousMouse.y = currentY;
};

const onPointerMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);

const onTouchMove = (e: TouchEvent) => {
   handleMove(e.touches[0].clientX, e.touches[0].clientY);
};

const onPointerUp = (event: MouseEvent | TouchEvent) => {
   isDragging = false;
   const gallery = document.getElementById("gallery");
   if (gallery) gallery.classList.remove("dragging");
   targetZoom = isFlattened ? config.zoomLevel * 0.96 : 1.0;
   targetCurvature = isFlattened ? 0.0 : BASE_CURVATURE;

   if (isClick && Date.now() - clickStartTime < 200) {
      const endX = 'clientX' in event ? (event as MouseEvent).clientX : (event as TouchEvent).changedTouches?.[0]?.clientX;
      const endY = 'clientY' in event ? (event as MouseEvent).clientY : (event as TouchEvent).changedTouches?.[0]?.clientY;

      if (endX !== undefined && endY !== undefined && renderer) {
         const rect = renderer.domElement.getBoundingClientRect();
         const screenX = ((endX - rect.left) / rect.width) * 2 - 1;
         const screenY = -(((endY - rect.top) / rect.height) * 2 - 1);

         const radius = Math.sqrt(screenX * screenX + screenY * screenY);
         const distortion = 1.1 - curvatureLevel * radius * radius;

         const worldX =
            screenX * distortion * (rect.width / rect.height) * zoomLevel +
            offset.x;
         const worldY = screenY * distortion * zoomLevel + offset.y;

         const cellX = Math.floor(worldX / config.cellSize);
         const cellY = Math.floor(worldY / config.cellSize);
         
         const atlasSize = Math.ceil(Math.sqrt(projects.length));
         const totalSlots = atlasSize * atlasSize;
         
         const hash = (p: {x: number, y: number}) => {
            const x = Math.floor(p.x);
            const y = Math.floor(p.y);
            const dot = (x * 12.9898 + y * 78.233);
            const sin = Math.sin(dot) * 43758.5453;
            return fract(sin);
         };
         
         const fract = (x: number) => x - Math.floor(x);
         
         const texIndex = Math.floor(hash({x: cellX, y: cellY}) * totalSlots);
         const actualIndex = (texIndex % projects.length + projects.length) % projects.length;

         if (projects[actualIndex]?.href) {
            window.location.href = projects[actualIndex].href;
         }
      }
   }
};

const onWindowResize = () => {
   const container = document.getElementById("gallery");
   if (!container || !camera || !renderer) return;

   const { offsetWidth: width, offsetHeight: height } = container;
   camera.updateProjectionMatrix();
   renderer.setSize(width, height);
   renderer.setPixelRatio(window.devicePixelRatio);
   plane?.material.uniforms.uResolution.value.set(width, height);
};

const setupEventListeners = () => {
   document.addEventListener("mousedown", onPointerDown);
   document.addEventListener("mousemove", onPointerMove);
   document.addEventListener("mouseup", onPointerUp);
   document.addEventListener("mouseleave", onPointerUp);

   const passiveOpts = { passive: false };
   document.addEventListener("touchstart", onTouchStart, (passiveOpts as any));
   document.addEventListener("touchmove", onTouchMove, (passiveOpts as any));
   document.addEventListener("touchend", onPointerUp, (passiveOpts as any));

   window.addEventListener("resize", onWindowResize);
   document.addEventListener("contextmenu", (e) => e.preventDefault());

   if (renderer) {
      renderer.domElement.addEventListener("mousemove", updateMousePosition);
      renderer.domElement.addEventListener("mouseleave", () => {
         mousePosition.x = mousePosition.y = -1;
         plane?.material.uniforms.uMousePos.value.set(-1, -1);
      });
   }
};

export const cleanup = () => {
   document.removeEventListener("mousedown", onPointerDown);
   document.removeEventListener("mousemove", onPointerMove);
   document.removeEventListener("mouseup", onPointerUp);
   document.removeEventListener("mouseleave", onPointerUp);

   document.removeEventListener("touchstart", onTouchStart as any);
   document.removeEventListener("touchmove", onTouchMove as any);
   document.removeEventListener("touchend", onPointerUp as any);

   window.removeEventListener("resize", onWindowResize);

   if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
   }

   const container = document.getElementById("gallery");
   if (container && renderer && renderer.domElement) {
      if (container.contains(renderer.domElement)) {
         container.removeChild(renderer.domElement);
      }
   }

   if (plane) {
      if (plane.geometry) plane.geometry.dispose();
      if (plane.material) {
         const uniforms = plane.material.uniforms;
         if (uniforms) {
            Object.values(uniforms).forEach((u) => {
               if (u?.value && u.value instanceof THREE.Texture) {
                  u.value.dispose();
               }
            });
         }
         plane.material.dispose();
      }
   }

   if (scene) scene.clear();
   if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
   }

   textTextures = [];
   scene = undefined;
   camera = undefined;
   renderer = undefined;
   plane = undefined;

   isDragging = false;
   isClick = true;
};


const animate = () => {
   animationFrameId = requestAnimationFrame(animate);

   offset.x += (targetOffset.x - offset.x) * config.lerpFactor;
   offset.y += (targetOffset.y - offset.y) * config.lerpFactor;
   zoomLevel += (targetZoom - zoomLevel) * config.lerpFactor;
   curvatureLevel += (targetCurvature - curvatureLevel) * config.lerpFactor;

   if (plane?.material.uniforms) {
      plane.material.uniforms.uOffset.value.set(offset.x, offset.y);
      plane.material.uniforms.uZoom.value = zoomLevel;
      plane.material.uniforms.uCurvature.value = curvatureLevel;
   }

   if (renderer && scene && camera) {
      renderer.render(scene, camera);
   }
};


export const init = async () => {
   const container = document.getElementById("gallery");
   if (!container) return;
   if (container.querySelector("canvas")) return;

   scene = new THREE.Scene();
   camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
   camera.position.z = 1;

   renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
   renderer.setSize(container.offsetWidth, container.offsetHeight);
   renderer.setPixelRatio(window.devicePixelRatio);

   const bgColor = rgbaToArray(config.backgroundColor);
   renderer.setClearColor(
      new THREE.Color(bgColor[0], bgColor[1], bgColor[2]),
      bgColor[3]
   );

   container.appendChild(renderer.domElement);

   const imageTextures = await loadTextures();
   const imageAtlas = createTextureAtlas(imageTextures, false);
   const textAtlas = createTextureAtlas(textTextures, true);

   const uniforms = {
      uOffset: { value: new THREE.Vector2(0, 0) },
      uResolution: {
         value: new THREE.Vector2(
            container.offsetWidth,
            container.offsetHeight
         ),
      },
      uBorderColor: {
         value: new THREE.Vector4(...rgbaToArray(config.borderColor)),
      },

      uBackgroundColor: {
         value: new THREE.Vector4(...rgbaToArray(config.backgroundColor)),
      },
      uMousePos: { value: new THREE.Vector2(-1, -1) },
      uZoom: { value: 1.0 },
      uCurvature: { value: curvatureLevel },
      uCellSize: { value: config.cellSize },
      uTextureCount: { value: projects.length },
      uImageAtlas: { value: imageAtlas },
      uTextAtlas: { value: textAtlas },
   };

   const geometry = new THREE.PlaneGeometry(2, 2);
   const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
   });

   plane = new THREE.Mesh(geometry, material);
   scene.add(plane);

   setupEventListeners();
   animate();
};
