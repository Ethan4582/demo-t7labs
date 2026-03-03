import Link from "next/link";
import Image from "next/image";
import { components } from "@/src/data/components";

export default function GalleryPage() {
   return (
      <div className="min-h-screen bg-zinc-50 py-20 px-6 dark:bg-[#0a0a0a]">
         <div className="mx-auto max-w-6xl">
            <header className="mb-16 text-center">
               <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                  Component Gallery
               </h1>
               <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                  A collection of premium web components and interactive demos built with modern technologies.
               </p>
            </header>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
               {components.map((component) => (
                  <Link
                     key={component.id}
                     href={`/gallery/${component.id}`}
                     className="group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all hover:scale-[1.02] hover:shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  >
                     <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {/* Fallback pattern for missing images */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 opacity-50 dark:from-zinc-800 dark:to-zinc-900">
                           <span className="text-zinc-400 dark:text-zinc-600 font-mono text-xs uppercase tracking-widest">
                              Preview Coming Soon
                           </span>
                        </div>
                        <Image
                           src={component.id === "water-ripple" ? "/next.svg" : "/placeholder.jpg"} // Using next.svg as a temporary placeholder since the user said they'll handle images
                           alt={component.name}
                           fill
                           className="object-contain p-8 transition-transform duration-500 group-hover:scale-110 opacity-20"
                        />
                     </div>
                     <div className="flex flex-1 flex-col p-6">
                        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                           {component.name}
                        </h2>
                        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                           {component.description}
                        </p>
                        <div className="mt-6 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                           View Demo
                           <svg
                              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M9 5l7 7-7 7"
                              />
                           </svg>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </div>
   );
}
