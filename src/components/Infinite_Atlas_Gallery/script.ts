
import * as THREE from "three";
import { projects } from "./data/asset_data";
import { vertexShader, fragmentShader } from "./shadder";
import { loadTextures, createTextureAtlas, rgbaToArray, CELL_TEX_SIZE } from "./textures";

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
const FLATTENED_DRAG_CURVATURE = 0.08;

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

const updateMousePosition = (event: MouseEvent) => {
   if (!renderer) return;
   const rect = renderer.domElement.getBoundingClientRect();
   mousePosition.x = event.clientX - rect.left;
   mousePosition.y = event.clientY - rect.top;

   plane?.material.uniforms.uMousePos.value.set(mousePosition.x, mousePosition.y);
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

         const worldX = screenX * distortion * (rect.width / rect.height) * zoomLevel + offset.x;
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
   document.addEventListener("touchstart", onTouchStart, passiveOpts as any);
   document.addEventListener("touchmove", onTouchMove, passiveOpts as any);
   document.addEventListener("touchend", onPointerUp, passiveOpts as any);

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

   textTextures.forEach(t => t.dispose());
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

   const imageTextures = await loadTextures(textTextures);
   const imageAtlas = createTextureAtlas(imageTextures, false);
   const textAtlas = createTextureAtlas(textTextures, true);

   const uniforms = {
      uOffset: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(container.offsetWidth, container.offsetHeight) },
      uBorderColor: { value: new THREE.Vector4(...rgbaToArray(config.borderColor)) },
      uBackgroundColor: { value: new THREE.Vector4(...rgbaToArray(config.backgroundColor)) },
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
