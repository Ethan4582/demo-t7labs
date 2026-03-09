"use client";

import { useRef, useState, useEffect } from "react";
import { useSpring, motion } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { assets, getAsset } from './asset_scroll_data'
import LenisProvider from "./lenis_scroll";

gsap.registerPlugin(ScrollTrigger);

type LayoutItem = {
   assetId: string;  // references assets[id] in assetData.ts
   x: number;        // vw — left position from screen left
   y: number;        // vh — top position in canvas
   w: number;        // vw — image width
   h: number;        // vh — image height (thickness)
   rotate: number;   // deg — rotation when ENTERING viewport (top/bottom)
   rotateTo: number; // deg — rotation when at CENTER of viewport (natural/resting)
   mt: number;       // vh — extra margin/space ABOVE this image
   mb: number;       // vh — documents desired space BELOW
};

const layoutData: LayoutItem[] = [
   { assetId: "a01", x: 8, y: 8, w: 40, h: 48, rotate: -9, rotateTo: -1, mt: 0, mb: 5 },
   { assetId: "a02", x: 56, y: 10, w: 24, h: 48, rotate: 6, rotateTo: 2, mt: 30, mb: 5 },
   { assetId: "a03", x: 3, y: 76, w: 32, h: 48, rotate: 9, rotateTo: 2, mt: 0, mb: 0 },
   { assetId: "a04", x: 42, y: 144, w: 20, h: 52, rotate: 15, rotateTo: 4, mt: 0, mb: 10 },
   { assetId: "a05", x: 52, y: 220, w: 44, h: 48, rotate: -15, rotateTo: -2, mt: 0, mb: 10 },
   { assetId: "a06", x: 2, y: 240, w: 44, h: 48, rotate: 9, rotateTo: 2, mt: 0, mb: 5 },
   { assetId: "a07", x: 66, y: 280, w: 20, h: 49, rotate: -5, rotateTo: 0, mt: 0, mb: 10 },
   { assetId: "a08", x: 14, y: 320, w: 44, h: 48, rotate: 9, rotateTo: 2, mt: 0, mb: 10 },
   { assetId: "a09", x: 56, y: 367, w: 26, h: 49, rotate: -12, rotateTo: -3, mt: 0, mb: 0 },
   { assetId: "a10", x: 26, y: 430, w: 20, h: 50, rotate: -12, rotateTo: -4, mt: 0, mb: 10 },
   { assetId: "a11", x: 52, y: 465, w: 44, h: 48, rotate: -15, rotateTo: -4, mt: 0, mb: 0 },
   { assetId: "a12", x: 12, y: 510, w: 26, h: 48, rotate: -12, rotateTo: -2, mt: 0, mb: 10 },
   { assetId: "a13", x: 29, y: 560, w: 44, h: 48, rotate: -6, rotateTo: -1, mt: 6, mb: 10 },
   { assetId: "a14", x: 61, y: 630, w: 20, h: 49, rotate: -6, rotateTo: 0, mt: 6, mb: 10 },
   { assetId: "a15", x: 1, y: 650, w: 42, h: 48, rotate: 12, rotateTo: 2, mt: 0, mb: 0 },
   { assetId: "a16", x: 51, y: 710, w: 46, h: 48, rotate: 16, rotateTo: 4, mt: 0, mb: 0 },
   { assetId: "a17", x: 31, y: 760, w: 20, h: 49, rotate: -9, rotateTo: -2, mt: 6, mb: 10 },
   { assetId: "a18", x: 61, y: 810, w: 20, h: 49, rotate: -9, rotateTo: -2, mt: 6, mb: 10 },
   { assetId: "a19", x: 8, y: 880, w: 44, h: 48, rotate: 15, rotateTo: 3, mt: 0, mb: 0 },
   { assetId: "a20", x: 49, y: 910, w: 46, h: 46, rotate: 15, rotateTo: 3, mt: 0, mb: 0 },
   { assetId: "a21", x: 16, y: 950, w: 20, h: 49, rotate: -6, rotateTo: -1, mt: 6, mb: 10 },
   { assetId: "a22", x: 28, y: 1020, w: 44, h: 48, rotate: -12, rotateTo: -3, mt: 0, mb: 0 },
   { assetId: "a23", x: 52, y: 1080, w: 44, h: 48, rotate: -15, rotateTo: -3, mt: 0, mb: 10 },
   { assetId: "a24", x: 2, y: 1100, w: 44, h: 48, rotate: 9, rotateTo: 2, mt: 0, mb: 5 },
   { assetId: "a25", x: 62, y: 1160, w: 28, h: 49, rotate: -15, rotateTo: -3, mt: 0, mb: 10 },
   { assetId: "a26", x: 28, y: 1200, w: 20, h: 49, rotate: -15, rotateTo: -3, mt: 0, mb: 10 },
   { assetId: "a27", x: 46, y: 1250, w: 44, h: 48, rotate: -9, rotateTo: -2, mt: 0, mb: 5 },
   { assetId: "a28", x: 22, y: 1310, w: 20, h: 49, rotate: 9, rotateTo: 2, mt: 0, mb: 10 },
   { assetId: "a29", x: 61, y: 1350, w: 20, h: 49, rotate: 9, rotateTo: 2, mt: 0, mb: 10 },
   { assetId: "a30", x: 2, y: 1410, w: 44, h: 48, rotate: -15, rotateTo: -3, mt: 0, mb: 10 },
   { assetId: "a31", x: 18, y: 1460, w: 44, h: 48, rotate: 9, rotateTo: 2, mt: 0, mb: 10 },
   { assetId: "a32", x: 60, y: 1495, w: 20, h: 49, rotate: -12, rotateTo: -3, mt: 6, mb: 10 },
   { assetId: "a33", x: 6, y: 1540, w: 42, h: 48, rotate: 15, rotateTo: 3, mt: 0, mb: 5 },
   { assetId: "a34", x: 52, y: 1580, w: 44, h: 48, rotate: -9, rotateTo: -2, mt: 0, mb: 10 },
   { assetId: "a35", x: 26, y: 1635, w: 20, h: 50, rotate: -6, rotateTo: -1, mt: 0, mb: 10 },
   { assetId: "a36", x: 64, y: 1680, w: 26, h: 49, rotate: 12, rotateTo: 3, mt: 0, mb: 0 },
   { assetId: "a37", x: 10, y: 1720, w: 44, h: 48, rotate: -15, rotateTo: -3, mt: 0, mb: 10 },
];

const CANVAS_HEIGHT_VH = 1800;


function ParallaxImage({ item }: { item: LayoutItem }) {
   const scrollRef = useRef<HTMLDivElement>(null);
   const rotateRef = useRef<HTMLDivElement>(null);
   const videoRef = useRef<HTMLVideoElement>(null);
   const [isHovered, setIsHovered] = useState(false);

   const asset = getAsset(item.assetId);
   const hasImage = !!(asset?.image);
   const hasVideo = !!(asset?.video);

   const { scrollYProgress } = useScroll({
      target: scrollRef,
      offset: ["start end", "end start"],
   });
   const smoothProgress = useSpring(scrollYProgress, {
      damping: 50,
      stiffness: 80,
      mass: 0.5,
   });
   const scrollY = useTransform(smoothProgress, [0, 1], [12, -12]);


   useEffect(() => {
      const el = rotateRef.current;
      if (!el) return;


      gsap.set(el, { rotation: item.rotate });


      const tweenIn = gsap.fromTo(
         el,
         { rotation: item.rotate },
         {
            rotation: item.rotateTo,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
               trigger: scrollRef.current,
               start: "top bottom",
               end: "center center",
               scrub: 1.5,
               invalidateOnRefresh: true,
            },
         }
      )


      const tweenOut = gsap.fromTo(
         el,
         { rotation: item.rotateTo },
         {
            rotation: item.rotate * 0.6,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
               trigger: scrollRef.current,
               start: "center center",
               end: "bottom top",
               scrub: 1.5,
               invalidateOnRefresh: true,
            },
         }
      );

      return () => {
         tweenIn.scrollTrigger?.kill();
         tweenOut.scrollTrigger?.kill();
      };
   }, [item.rotate, item.rotateTo]);

   const topVh = item.y + item.mt;

   if (!asset) return null;

   return (

      <motion.div
         ref={scrollRef}
         style={{
            position: "absolute",
            left: `${item.x}vw`,
            top: `${topVh}vh`,
            width: `${item.w}vw`,
            height: `${item.h}vh`,
            y: scrollY,
            zIndex: isHovered ? 10 : 1,
         }}
      >

         <div
            ref={rotateRef}
            className="relative w-full h-full cursor-pointer"
            onPointerEnter={() => {
               setIsHovered(true);
            }}
            onPointerLeave={() => {
               setIsHovered(false);
            }}
         >

            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
               {hasImage && (

                  <img
                     src={asset.image}
                     alt={asset.label}
                     className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out"
                     style={{
                        transform: isHovered && !hasVideo ? "scale(1.05)" : "scale(1)",
                        opacity: hasVideo && isHovered ? 0 : 1,
                     }}
                     loading="lazy"
                  />
               )}
               {hasVideo && (
                  <video
                     ref={videoRef}
                     src={asset.video}
                     muted
                     loop
                     autoPlay
                     playsInline
                     className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                     style={{
                        opacity: hasImage ? (isHovered ? 1 : 0) : 1,
                     }}
                  />
               )}
            </div>


            <div className="absolute top-[calc(100%-1px)] left-0 w-full bg-black text-white pointer-events-none font-merchant">
               <div
                  className={`grid transition-all duration-300 ease-out ${isHovered ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                     }`}
               >
                  <div className="overflow-hidden">
                     <div className="px-2 py-1 flex justify-between items-center text-[9px] sm:text-[11px] tracking-widest uppercase gap-2 whitespace-nowrap">
                        <span className="truncate" style={{ lineHeight: "1.1" }}>{asset.label}</span>
                        <span className="shrink-0" style={{ lineHeight: "1.1" }}>{asset.time}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
   );
}



export default function ScrollGallery() {
   return (
      <LenisProvider>
         <div className="relative w-full">
            <div style={{ backgroundColor: "#ffffff", paddingTop: "15vh", paddingBottom: "20vh" }}>
               <div
                  style={{
                     position: "relative",
                     width: "100%",
                     height: `${CANVAS_HEIGHT_VH}vh`,
                     overflow: "hidden",
                  }}
               >
                  {layoutData.map((item, i) => (
                     <ParallaxImage key={item.assetId + i} item={item} />
                  ))}
               </div>
            </div>
         </div>
      </LenisProvider>
   );
}
