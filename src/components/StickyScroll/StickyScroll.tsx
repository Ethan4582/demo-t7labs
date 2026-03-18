"use client";

import { useEffect, useRef } from "react";
import { Instrument_Serif } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./StickyScroll.module.css";

gsap.registerPlugin(ScrollTrigger);

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});


const fallbackImages: string[] = [
  "https://picsum.photos/id/1069/900/1200",
  "https://picsum.photos/id/1071/900/1200",
  "https://picsum.photos/id/1076/900/1200",
  "https://picsum.photos/id/1079/900/1200",
  "https://picsum.photos/id/1068/900/1200",
  "https://picsum.photos/id/1067/900/1200",
  "https://picsum.photos/id/1050/900/1200",
  "https://picsum.photos/id/1065/900/1200",
];

type Props = {
  images?: string[]; // optional now (safe)
  enableScale?: boolean;
  title?: string;
};

export default function StickyScroll({
  images,
  enableScale = false,
  title = "ScrollTrigger",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const safeImages = images && images.length > 0 ? images : fallbackImages;

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const lastCard = containerRef.current!.querySelector(
        `.${styles.scroll}`
      ) as HTMLElement;

      const pinnedSections = gsap.utils.toArray<HTMLElement>(
        `.${styles.pinned}`
      );

      pinnedSections.forEach((section, index, sections) => {
        const img = section.querySelector(`.${styles.img}`) as HTMLElement;
        const nextSection = sections[index + 1] || lastCard;

        const endScalePoint = `top+=${nextSection.offsetTop - section.offsetTop
          } top`;

        
        gsap.to(section, {
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () =>
              index === sections.length - 1
                ? `+=${lastCard.offsetHeight}`
                : `+=${document.body.offsetHeight}`,
            pin: true,
            pinSpacing: false,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // 🔹 OPTIONAL SCALE
        if (enableScale && img) {
          gsap.fromTo(
            img,
            { scale: 1 },
            {
              scale: 0.5,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: endScalePoint,
                scrub: 1,
              },
            }
          );
        }
      });

      // 🔹 HERO FADE (safe)
      const heroH1 = containerRef.current!.querySelector(
        `.${styles.hero} h1`
      ) as HTMLElement | null;

      if (heroH1) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "+=400vh",
          scrub: 1,
          onUpdate: (self) => {
            heroH1.style.opacity = `${1 - self.progress}`;
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [enableScale, safeImages]);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{
        backgroundImage:
          "url(https://pub-30f77b34698b4af9acb780d4dfe7ee4d.r2.dev/good_bg/black_glass.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* HERO */}
      <section className={`${styles.section} ${styles.hero} ${styles.pinned}`}>
        <div className={styles.img} />
        <h1 className={instrumentSerif.className}>{title}</h1>
      </section>

      {/* CARDS */}
      {safeImages.slice(0, -1).map((src, i) => (
        <section
          key={i}
          className={`${styles.section} ${styles.card} ${styles.pinned}`}
        >
          <div className={styles.img}>
            <img src={src} alt={`img-${i}`} />
          </div>
        </section>
      ))}

      {/* LAST */}
      <section
        className={`${styles.section} ${styles.card} ${styles.scroll}`}
      >
        <div className={styles.img}>
          <img src={safeImages[safeImages.length - 1]} alt="last" />
        </div>
      </section>
    </div>
  );
}