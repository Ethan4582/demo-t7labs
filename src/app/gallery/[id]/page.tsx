import { components } from "@/src/data/components";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic import registry
const ComponentRegistry: Record<string, any> = {
   "water-ripple": dynamic(() => import("@/src/components/Water_Ripple")),
};

interface Props {
   params: Promise<{ id: string }>;
}

export default async function ComponentDemoPage({ params }: Props) {
   const { id } = await params;
   const componentData = components.find((c) => c.id === id);

   if (!componentData) {
      notFound();
   }

   const DemoComponent = ComponentRegistry[id];

   if (!DemoComponent) {
      return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
            <h1 className="text-2xl font-bold dark:text-white">Component Preview Unavailable</h1>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">The implementation for "{componentData.name}" could not be found.</p>
            <Link href="/gallery" className="mt-8 text-blue-600 hover:underline">
               Back to Gallery
            </Link>
         </div>
      );
   }

   return (
      <div className="relative min-h-screen bg-black overflow-hidden">
         {/* Navigation Overlay */}
         <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 pointer-events-none">
            <Link
               href="/gallery"
               className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-black/70 border border-white/10"
            >
               <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
               Back to Gallery
            </Link>

            <div className="pointer-events-auto rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-md border border-white/5">
               {componentData.name}
            </div>
         </nav>

         {/* Demo Container */}
         <div className="absolute inset-0">
            <DemoComponent />
         </div>

         {/* Info Overlay (Optional, could be toggled) */}
         <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-xs transition-opacity duration-300">
            <div className="pointer-events-auto rounded-2xl bg-black/50 p-6 text-white backdrop-blur-xl border border-white/10 shadow-2xl">
               <h3 className="text-lg font-semibold">{componentData.name}</h3>
               <p className="mt-2 text-sm text-white/60 leading-relaxed">
                  {componentData.description}
               </p>
            </div>
         </div>
      </div>
   );
}

// Generate static params for Vercel/Cloudflare static generation
export async function generateStaticParams() {
   return components.map((component) => ({
      id: component.id,
   }));
}
