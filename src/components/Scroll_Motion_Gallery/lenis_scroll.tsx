"use client";
import { useEffect, useRef, ReactNode } from "react";
import Lenis from "lenis";

export default function LenisProvider({ children }: { children: ReactNode }) {
   const lenisRef = useRef<Lenis | null>(null);

   useEffect(() => {
      if (!lenisRef.current) {
         lenisRef.current = new Lenis({ lerp: 0.1, smoothWheel: true });

         function raf(time: number) {
            lenisRef.current?.raf(time);
            requestAnimationFrame(raf);
         }
         requestAnimationFrame(raf);
      }

      return () => {
         if (lenisRef.current) {
            lenisRef.current.destroy();
            lenisRef.current = null;
         }
      };
   }, []);

   return <>{children}</>;
}