"use client";

import { useEffect, useRef, useState } from "react";
import { init, cleanup, setConfig } from "./script";
import { Controls } from "./Controls";
import styles from "./style.module.scss";

export default function Infinite_Atlas_Gallery() {
   const initialized = useRef(false);
   const [curvature, setCurvature] = useState(0.14);
   const [zoom, setZoom] = useState(1.25);
   const [isFlattened, setIsFlattened] = useState(false);

   useEffect(() => {
      if (!initialized.current) {
         initialized.current = true;
         init();
      }

      return () => {
         cleanup();
         initialized.current = false;
      };
   }, []);

   const handleCurvatureChange = (val: number) => {
      setCurvature(val);
      setConfig({ curvature: val });
   };

   const handleZoomChange = (val: number) => {
      setZoom(val);
      setConfig({ zoom: val });
   };

   const toggleFlatten = () => {
      const next = !isFlattened;
      setIsFlattened(next);
      setConfig({ isFlattened: next });
   };

   return (
      <section 
         id="gallery" 
         className={`${styles.container} relative w-[100vw] h-[100svh]`}
      >
         <div className={styles.vignette}></div>

         <Controls 
            curvature={curvature}
            zoom={zoom}
            isFlattened={isFlattened}
            onCurvatureChange={handleCurvatureChange}
            onZoomChange={handleZoomChange}
            onToggleFlatten={toggleFlatten}
         />
      </section>
   );
}
