import * as THREE from "three";
import { projects, type Project } from "./data/asset_data";

export const CELL_TEX_SIZE = 1024;

export const rgbaToArray = (rgba: string): number[] => {
   const match = rgba.match(/rgba?\(([^)]+)\)/);
   if (!match) return [1, 1, 1, 1];
   return match[1]
      .split(",")
      .map((v, i) =>
         i < 3 ? parseFloat(v.trim()) / 255 : parseFloat(v.trim()) || 1
      );
};

export const createTextTexture = (project: Project): THREE.CanvasTexture => {
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

export const createTextureAtlas = (textures: THREE.Texture[], isText = false): THREE.CanvasTexture => {
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

export const loadTextures = (textTexturesOut: THREE.CanvasTexture[]): Promise<THREE.Texture[]> => {
   const textureLoader = new THREE.TextureLoader();
   textureLoader.crossOrigin = "anonymous";
   const imageTextures: THREE.Texture[] = [];
   let loadedCount = 0;

   return new Promise((resolve) => {
      projects.forEach((project: Project, projectIndex: number) => {
         const placeholder = new THREE.Texture();
         imageTextures.push(placeholder);
         textTexturesOut.push(createTextTexture(project));

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
               }
               const fallback = new THREE.CanvasTexture(fb);
               imageTextures[projectIndex] = fallback;
               if (++loadedCount === projects.length) resolve(imageTextures);
            }
         );
      });
   });
};
