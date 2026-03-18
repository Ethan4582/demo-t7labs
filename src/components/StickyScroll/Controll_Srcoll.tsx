"use client";

import React, { useState } from "react";
import StickyScroll from "./StickyScroll";

export default function Controll_Srcoll() {
  const [enableScale, setEnableScale] = useState(false);

  return (
    <div className="relative w-full min-h-screen">
     
      <div className="fixed bottom-8 left-8 z-[100]">
        <button
          onClick={() => setEnableScale(!enableScale)}
          className="px-5 py-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-lg border border-white/10 text-white rounded-full text-[11px] font-medium tracking-widest uppercase transition-all active:scale-95 shadow-2xl"
        >
          {enableScale ? "Disable Stacking" : "Enable Stacking"}
        </button>
      </div>

   
      <StickyScroll enableScale={enableScale} />
    </div>
  );
}