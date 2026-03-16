import * as THREE from "three";

export interface Config {
   cellSize: number;
   zoomLevel: number;
   lerpFactor: number;
   borderColor: string;
   backgroundColor: string;
   textColor: string;
   hoverColor: string;
}

export interface GalleryState {
   scene: THREE.Scene | undefined;
   camera: THREE.OrthographicCamera | undefined;
   renderer: THREE.WebGLRenderer | undefined;
   plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | undefined;
   isDragging: boolean;
   isClick: boolean;
   clickStartTime: number;
   previousMouse: { x: number; y: number };
   offset: { x: number; y: number };
   targetOffset: { x: number; y: number };
   mousePosition: { x: number; y: number };
   zoomLevel: number;
   targetZoom: number;
   curvatureLevel: number;
   targetCurvature: number;
   baseCurvature: number;
   textTextures: THREE.CanvasTexture[];
   animationFrameId: number;
   isFlattened: boolean;
}

export const config: Config = {
   cellSize: 0.75,
   zoomLevel: 1.25,
   lerpFactor: 0.075,
   borderColor: "rgba(255, 255, 255, 0.15)",
   backgroundColor: "rgba(0, 0, 0, 1)",
   textColor: "rgba(128, 128, 128, 1)",
   hoverColor: "rgba(255, 255, 255, 0)",
};

export const state: GalleryState = {
   scene: undefined,
   camera: undefined,
   renderer: undefined,
   plane: undefined,
   isDragging: false,
   isClick: true,
   clickStartTime: 0,
   previousMouse: { x: 0, y: 0 },
   offset: { x: 0, y: 0 },
   targetOffset: { x: 0, y: 0 },
   mousePosition: { x: -1, y: -1 },
   zoomLevel: 1.0,
   targetZoom: 1.0,
   curvatureLevel: 0.14,
   targetCurvature: 0.14,
   baseCurvature: 0.14,
   textTextures: [],
   animationFrameId: 0,
   isFlattened: false,
};

export const DRAG_CURVATURE = 0.20;
export const FLATTENED_DRAG_CURVATURE = 0.08;
export const CELL_TEX_SIZE = 1024;
