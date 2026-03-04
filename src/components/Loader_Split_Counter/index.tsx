'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import styles from './style.module.scss';

const COUNTER_2_DIGITS = [0, 1, 2, 3, 4, 5, 6, 6, 8, 9, 0];

function generateCounter3Digits(): number[] {
   const digits: number[] = [];
   for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 10; j++) digits.push(j);
   }
   digits.push(0);
   return digits;
}

function animateCounter(el: HTMLDivElement | null, duration: number, delay = 0) {
   if (!el?.children.length) return;
   const numHeight = (el.children[0] as HTMLElement).clientHeight;
   const totalDistance = (el.children.length - 1) * numHeight;
   gsap.to(el, { y: -totalDistance, duration, delay, ease: 'power2.inOut' });
}

export default function LoaderSplitCounter() {
   const containerRef = useRef<HTMLDivElement>(null);
   const counter1Ref = useRef<HTMLDivElement>(null);
   const counter2Ref = useRef<HTMLDivElement>(null);
   const counter3Ref = useRef<HTMLDivElement>(null);
   const loaderRef = useRef<HTMLDivElement>(null);
   const loader1Ref = useRef<HTMLDivElement>(null);
   const loader2Ref = useRef<HTMLDivElement>(null);
   const loadingScreenRef = useRef<HTMLDivElement>(null);

   const digitsRef = useRef<HTMLDivElement[]>([]);
   const h1Refs = useRef<HTMLHeadingElement[]>([]);

   const addDigitRef = useCallback((el: HTMLDivElement | null) => {
      if (el && !digitsRef.current.includes(el)) digitsRef.current.push(el);
   }, []);

   const addH1Ref = useCallback((el: HTMLHeadingElement | null) => {
      if (el && !h1Refs.current.includes(el)) h1Refs.current.push(el);
   }, []);

   const counter3Digits = useMemo(() => generateCounter3Digits(), []);

   useEffect(() => {
      const ctx = gsap.context(() => {
         // Counter scroll animations
         animateCounter(counter3Ref.current, 5);
         animateCounter(counter2Ref.current, 6);
         animateCounter(counter1Ref.current, 2, 4);

         // Digits fly up
         gsap.to(digitsRef.current, {
            top: '-150px',
            stagger: { amount: 0.25 },
            delay: 6,
            duration: 1,
            ease: 'power4.inOut',
         });

         // Loader bar grows
         gsap.from(loader1Ref.current, { width: 0, duration: 6, ease: 'power2.inOut' });
         gsap.from(loader2Ref.current, { width: 0, delay: 1.9, duration: 2, ease: 'power2.inOut' });

         // Loader transforms
         gsap.to(loaderRef.current, { background: 'none', delay: 6, duration: 0.1 });
         gsap.to(loader1Ref.current, { rotate: 90, y: -50, duration: 0.5, delay: 6 });
         gsap.to(loader2Ref.current, { x: -75, y: 70, duration: 0.2, delay: 6 });

         // Loader explodes out
         gsap.to(loaderRef.current, { scale: 40, duration: 1, delay: 7, ease: 'power2.inOut' });
         gsap.to(loaderRef.current, { rotate: 45, y: 500, x: 2000, duration: 1, delay: 7, ease: 'power2.inOut' });

         // Loading screen fades
         gsap.to(loadingScreenRef.current, { opacity: 0, duration: 0.5, delay: 7.5, ease: 'power1.inOut' });

         // Content titles reveal
         gsap.to(h1Refs.current, {
            delay: 7,
            y: -80,
            duration: 1.5,
            ease: 'power4.inOut',
            stagger: { amount: 0.1 },
         });
      }, containerRef);

      return () => ctx.revert();
   }, []);

   return (
      <div className={styles.container} ref={containerRef}>
         {/* Revealed content (behind loading screen) */}
         <div className={styles.websiteContent}>
            <img
               src="https://res.cloudinary.com/dbgee370f/image/upload/v1772608962/Lavendery2006_1_tyrprl.jpg"
               alt="Revealed content"
               className={styles.revealedImage}
            />
            <div className={styles.header}>
               <div className={styles.h1Container}>
                  
                  <h1 className={styles.h1Text} ref={addH1Ref}>Hi There</h1>
               </div>

            </div>
         </div>

         {/* Loading Screen */}
         <div className={styles.loadingScreen} ref={loadingScreenRef}>
            <img
               src="https://res.cloudinary.com/dbgee370f/image/upload/v1772608962/Moon2011_1_rm7f7n.png"
               alt="Loading background"
               className={styles.loadingImage}
            />

            <div className={styles.loader} ref={loaderRef}>
               <div className={`${styles.loader1} ${styles.bar}`} ref={loader1Ref} />
               <div className={`${styles.loader2} ${styles.bar}`} ref={loader2Ref} />
            </div>

            <div className={styles.counter}>
               {/* Counter 1: 0 → 1 */}
               <div className={styles.digit} ref={(el) => { counter1Ref.current = el; addDigitRef(el); }}>
                  <div>0</div>
                  <div className={styles.num1offset}>1</div>
               </div>

               {/* Counter 2: 0 → 9 → 0 */}
               <div className={styles.digit} ref={(el) => { counter2Ref.current = el; addDigitRef(el); }}>
                  {COUNTER_2_DIGITS.map((n, i) => (
                     <div key={i} className={i === 1 ? styles.num1offset2 : undefined}>{n}</div>
                  ))}
               </div>

               {/* Counter 3: 0-9 x2 + 0 */}
               <div className={styles.digit} ref={(el) => { counter3Ref.current = el; addDigitRef(el); }}>
                  {counter3Digits.map((n, i) => (
                     <div key={i}>{n}</div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
