'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { components } from "@/src/data/components";

const TAGS = [
   "RECENT",
   "POPULAR",
   "SCROLL",
   "Three.js",
   "MISC",
   "3D",
   "MENU",
   "TRANSITION",
   "SVG",
   "LANDING PAGE",
];

export default function GalleryPage() {
   const [activeTag, setActiveTag] = useState("RECENT");

   // Filtering logic: "RECENT" shows all in this demo, otherwise filter by category
   const filteredComponents = activeTag === "RECENT"
      ? components
      : components.filter(c => c.category === activeTag);

   return (
      <div className="min-h-screen bg-white">
         {/* Container */}
         <div className="mx-auto max-w-[1400px] px-6 py-12 sm:px-12 sm:py-20">
            {/* Navigation / Filter pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-8 scrollbar-hide">
               {TAGS.map((tag) => (
                  <button
                     key={tag}
                     onClick={() => setActiveTag(tag)}
                     className={`shrink-0 rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all ${activeTag === tag
                        ? "bg-[#427DFB] border-[#427DFB] text-white shadow-sm"
                        : "border-zinc-300 bg-white text-zinc-500 hover:border-zinc-800 hover:text-zinc-900"
                        }`}
                  >
                     {tag}
                  </button>
               ))}
            </div>

            {/* Title */}
            <div className="mb-12">
               <h1 className="text-4xl font-bold tracking-tight text-[#0D1B36] sm:text-5xl">
                  All Tutorials
               </h1>
            </div>

            {/* Grid */}
            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
               {filteredComponents.length > 0 ? (
                  filteredComponents.map((component) => (
                     <Link
                        key={component.id}
                        href={`/gallery/${component.id}`}
                        className="group flex flex-col"
                     >
                        {/* Image Container */}
                        <div className="relative aspect-[1.3/1] overflow-hidden rounded-[20px] bg-zinc-100 shadow-sm transition-transform duration-500 hover:scale-[1.02]">
                           <Image
                              src={component.image}
                              alt={component.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                           />
                        </div>

                        {/* Text Content */}
                        <div className="mt-6 flex flex-col">
                           {/* Date */}
                           <p className="text-[13px] font-medium text-zinc-400">
                              {component.date}
                           </p>

                           {/* Sub-tag */}
                           <div className="mt-3">
                              <span className="rounded bg-zinc-100 px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                 {component.category}
                              </span>
                           </div>

                           {/* Title */}
                           <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#0D1B36]">
                              {component.name}
                           </h2>

                           {/* Description */}
                           <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500/90">
                              {component.shortDescription}
                           </p>
                        </div>
                     </Link>
                  ))
               ) : (
                  <div className="col-span-full py-20 text-center">
                     <p className="text-zinc-400">No components found for this category.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
