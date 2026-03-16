

export const Controls = ({
   curvature,
   zoom,
   isFlattened,
   onCurvatureChange,
   onZoomChange,
   onToggleFlatten,
}: any) => {
   return (
      <div className="absolute bottom-6 left-6 z-50 pointer-events-auto">
         <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl p-4 w-52 shadow-2xl">
            <h3 className="text-white/80 text-[10px] font-mono tracking-[0.2em] mb-4 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
               VIEWPORT
            </h3>
            
            <div className="space-y-4">
               {/* Curvature Slider */}
               <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                     <span>Curvature</span>
                     <span className="text-white/60">{curvature.toFixed(2)}</span>
                  </div>
                  <input 
                     type="range" 
                     min="0" 
                     max="0.4" 
                     step="0.01" 
                     value={curvature}
                     onChange={(e) => onCurvatureChange(parseFloat(e.target.value))}
                     disabled={isFlattened}
                     className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-20"
                  />
               </div>

               {/* Zoom Slider */}
               <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                     <span>Zoom</span>
                     <span className="text-white/60">{zoom.toFixed(2)}</span>
                  </div>
                  <input 
                     type="range" 
                     min="1" 
                     max="2.5" 
                     step="0.05" 
                     value={zoom}
                     onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                     className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
               </div>

               {/* Flatten Toggle */}
               <button 
                  onClick={onToggleFlatten}
                  className={`w-full py-2 rounded-lg border transition-all text-[9.5px] font-mono tracking-widest uppercase flex items-center justify-center gap-2 ${
                     isFlattened 
                     ? "bg-white text-black border-white" 
                     : "bg-transparent text-white/80 border-white/20 hover:border-white/40"
                  }`}
               >
                  {isFlattened ? "RESTORE CURVE" : "FLATTEN VIEW"}
               </button>
            </div>
         </div>
      </div>
   );
};
