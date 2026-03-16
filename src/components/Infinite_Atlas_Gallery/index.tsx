"use client";

import { useEffect, useRef, useState } from "react";
import { init, cleanup, setConfig } from "./script";
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

   const handleCurvatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setCurvature(val);
      setConfig({ curvature: val });
   };

   const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
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

         {/* Control Card */}
         <div className="absolute bottom-10 left-10 z-50 pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 w-72 shadow-2xl">
               <h3 className="text-white/90 text-sm font-medium mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  VIEWPORT SETTINGS
               </h3>
               
               <div className="space-y-6">
                  {/* Curvature Slider */}
                  <div className="space-y-3">
                     <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        <span>Curvature</span>
                        <span className="text-white/60">{curvature.toFixed(2)}</span>
                     </div>
                     <input 
                        type="range" 
                        min="0" 
                        max="0.4" 
                        step="0.01" 
                        value={curvature}
                        onChange={handleCurvatureChange}
                        disabled={isFlattened}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
                     />
                  </div>

                  {/* Zoom Slider */}
                  <div className="space-y-3">
                     <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        <span>Zoom</span>
                        <span className="text-white/60">{zoom.toFixed(2)}</span>
                     </div>
                     <input 
                        type="range" 
                        min="1" 
                        max="2.5" 
                        step="0.05" 
                        value={zoom}
                        onChange={handleZoomChange}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                     />
                  </div>

                  {/* Flatten Toggle */}
                  <button 
                     onClick={toggleFlatten}
                     className={`w-full py-3 rounded-xl border transition-all text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-3 ${
                        isFlattened 
                        ? "bg-white text-black border-white" 
                        : "bg-transparent text-white border-white/10 hover:border-white/30"
                     }`}
                  >
                     {isFlattened ? (
                        <>
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                           </svg>
                           RESTORE CURVE
                        </>
                     ) : (
                        <>
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h16m-7 7h7" />
                           </svg>
                           FLATTEN VIEW
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>
      </section>
   );
}
