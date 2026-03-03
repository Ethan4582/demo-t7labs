import Link from "next/link";

export default function NotFound() {
   return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-[#0a0a0a]">
         <h1 className="text-6xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">404</h1>
         <h2 className="mt-4 text-2xl font-semibold text-zinc-700 dark:text-zinc-300">Page Not Found</h2>
         <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
            The component or page you are looking for doesn't exist or has been moved to a different gallery.
         </p>
         <Link
            href="/gallery"
            className="mt-10 rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
         >
            Return to Gallery
         </Link>
      </div>
   );
}
