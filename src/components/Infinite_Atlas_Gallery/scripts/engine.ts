import * as THREE from "three";
import { state, config, DRAG_CURVATURE, FLATTENED_DRAG_CURVATURE } from "./core";
import { projects } from "../data/asset_data";
import { vertexShader, fragmentShader } from "../shadder";
import { rgbaToArray, loadTextures, createTextureAtlas } from "./utils";

// Interaction Hooks
export const setupEventListeners = () => {
   const startDrag = (x: number, y: number) => {
      state.isDragging = true; state.isClick = true; state.clickStartTime = Date.now();
      const gallery = document.getElementById("gallery");
      if (gallery) gallery.classList.add("dragging");
      state.previousMouse = { x, y };
      setTimeout(() => state.isDragging && (state.targetZoom = config.zoomLevel), 150);
      state.targetCurvature = state.isFlattened ? FLATTENED_DRAG_CURVATURE : DRAG_CURVATURE;
   };

   const onPointerUp = (event: MouseEvent | TouchEvent) => {
      state.isDragging = false;
      const gallery = document.getElementById("gallery");
      if (gallery) gallery.classList.remove("dragging");
      state.targetZoom = state.isFlattened ? config.zoomLevel * 0.96 : 1.0;
      state.targetCurvature = state.isFlattened ? 0.0 : state.baseCurvature;
      if (state.isClick && Date.now() - state.clickStartTime < 200) {
         const endX = 'clientX' in event ? (event as MouseEvent).clientX : (event as TouchEvent).changedTouches?.[0]?.clientX;
         const endY = 'clientY' in event ? (event as MouseEvent).clientY : (event as TouchEvent).changedTouches?.[0]?.clientY;
         if (endX !== undefined && endY !== undefined && state.renderer) {
            const rect = state.renderer.domElement.getBoundingClientRect();
            const screenX = ((endX - rect.left) / rect.width) * 2 - 1;
            const screenY = -(((endY - rect.top) / rect.height) * 2 - 1);
            const radius = Math.sqrt(screenX * screenX + screenY * screenY);
            const distortion = 1.1 - state.curvatureLevel * radius * radius;
            const worldX = screenX * distortion * (rect.width / rect.height) * state.zoomLevel + state.offset.x;
            const worldY = screenY * distortion * state.zoomLevel + state.offset.y;
            const cellX = Math.floor(worldX / config.cellSize);
            const cellY = Math.floor(worldY / config.cellSize);
            const atlasSize = Math.ceil(Math.sqrt(projects.length));
            const totalSlots = atlasSize * atlasSize;
            const hash = (p: {x: number, y: number}) => {
               const dot = (Math.floor(p.x) * 12.9898 + Math.floor(p.y) * 78.233);
               return (Math.sin(dot) * 43758.5453) % 1;
            };
            const texIndex = Math.floor(Math.abs(hash({x: cellX, y: cellY})) * totalSlots);
            const actualIndex = (texIndex % projects.length + projects.length) % projects.length;
            if (projects[actualIndex]?.href) window.location.href = projects[actualIndex].href;
         }
      }
   };

   const handleMove = (currentX: number, currentY: number) => {
      if (!state.isDragging || currentX === undefined || currentY === undefined) return;
      const deltaX = currentX - state.previousMouse.x;
      const deltaY = currentY - state.previousMouse.y;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
         state.isClick = false;
         if (state.targetZoom === 1.0 || (state.isFlattened && state.targetZoom === config.zoomLevel * 0.96)) {
            state.targetZoom = config.zoomLevel;
         }
      }
      state.targetOffset.x -= deltaX * 0.003;
      state.targetOffset.y += deltaY * 0.003;
      state.previousMouse = { x: currentX, y: currentY };
   };

   document.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
   document.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
   document.addEventListener("mouseup", onPointerUp);
   document.addEventListener("mouseleave", onPointerUp);
   document.addEventListener("touchstart", (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: false });
   document.addEventListener("touchmove", (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY), { passive: false });
   document.addEventListener("touchend", onPointerUp);
   window.addEventListener("resize", () => {
      const container = document.getElementById("gallery");
      if (!container || !state.camera || !state.renderer) return;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(container.offsetWidth, container.offsetHeight);
      state.renderer.setPixelRatio(window.devicePixelRatio);
      state.plane?.material.uniforms.uResolution.value.set(container.offsetWidth, container.offsetHeight);
   });
   if (state.renderer) {
      state.renderer.domElement.addEventListener("mousemove", (e) => {
         if (!state.renderer) return;
         const rect = state.renderer.domElement.getBoundingClientRect();
         state.mousePosition = { x: e.clientX - rect.left, y: e.clientY - rect.top };
         state.plane?.material.uniforms.uMousePos.value.set(state.mousePosition.x, state.mousePosition.y);
      });
   }
};

export const animate = () => {
   state.animationFrameId = requestAnimationFrame(animate);
   state.offset.x += (state.targetOffset.x - state.offset.x) * config.lerpFactor;
   state.offset.y += (state.targetOffset.y - state.offset.y) * config.lerpFactor;
   state.zoomLevel += (state.targetZoom - state.zoomLevel) * config.lerpFactor;
   state.curvatureLevel += (state.targetCurvature - state.curvatureLevel) * config.lerpFactor;
   if (state.plane?.material.uniforms) {
      state.plane.material.uniforms.uOffset.value.set(state.offset.x, state.offset.y);
      state.plane.material.uniforms.uZoom.value = state.zoomLevel;
      state.plane.material.uniforms.uCurvature.value = state.curvatureLevel;
   }
   if (state.renderer && state.scene && state.camera) state.renderer.render(state.scene, state.camera);
};

export const init = async () => {
   const container = document.getElementById("gallery");
   if (!container || container.querySelector("canvas")) return;
   state.scene = new THREE.Scene();
   state.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
   state.camera.position.z = 1;
   state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
   state.renderer.setSize(container.offsetWidth, container.offsetHeight);
   state.renderer.setPixelRatio(window.devicePixelRatio);
   const bgColor = rgbaToArray(config.backgroundColor);
   state.renderer.setClearColor(new THREE.Color(bgColor[0], bgColor[1], bgColor[2]), bgColor[3]);
   container.appendChild(state.renderer.domElement);
   const imageTextures = await loadTextures(state.textTextures);
   const imageAtlas = createTextureAtlas(imageTextures, false);
   const textAtlas = createTextureAtlas(state.textTextures, true);
   const uniforms = {
      uOffset: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(container.offsetWidth, container.offsetHeight) },
      uBorderColor: { value: new THREE.Vector4(...rgbaToArray(config.borderColor)) },
      uBackgroundColor: { value: new THREE.Vector4(...rgbaToArray(config.backgroundColor)) },
      uMousePos: { value: new THREE.Vector2(-1, -1) }, uZoom: { value: 1.0 },
      uCurvature: { value: state.curvatureLevel }, uCellSize: { value: config.cellSize },
      uTextureCount: { value: projects.length }, uImageAtlas: { value: imageAtlas }, uTextAtlas: { value: textAtlas },
   };
   state.plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms }));
   state.scene.add(state.plane);
   setupEventListeners(); animate();
};

export const cleanup = () => {
   if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
   const container = document.getElementById("gallery");
   if (container && state.renderer?.domElement) container.contains(state.renderer.domElement) && container.removeChild(state.renderer.domElement);
   if (state.plane) {
      state.plane.geometry.dispose();
      Object.values(state.plane.material.uniforms).forEach((u: any) => u?.value instanceof THREE.Texture && u.value.dispose());
      state.plane.material.dispose();
   }
   state.scene?.clear(); state.renderer?.dispose(); state.renderer?.forceContextLoss();
   state.textTextures.forEach(t => t.dispose()); state.textTextures = [];
   state.scene = undefined; state.camera = undefined; state.renderer = undefined; state.plane = undefined;
   state.isDragging = false;
};

export const setConfig = (u: { curvature?: number; zoom?: number; isFlattened?: boolean }) => {
   if (u.curvature !== undefined) { state.baseCurvature = u.curvature; if (!state.isDragging) state.targetCurvature = u.curvature; }
   if (u.zoom !== undefined) { config.zoomLevel = u.zoom; if (!state.isDragging) state.targetZoom = u.isFlattened ? u.zoom * 0.96 : 1.0; }
   if (u.isFlattened !== undefined) {
      state.isFlattened = u.isFlattened; state.targetCurvature = u.isFlattened ? 0.0 : state.baseCurvature;
      state.targetZoom = u.isFlattened ? config.zoomLevel * 0.96 : 1.0;
   }
};
