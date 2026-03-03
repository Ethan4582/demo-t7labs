import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/Hero.png')" }}
      />

      {/* Overlay for contrast */}
      <div className="absolute inset-0 z-10 bg-black/30" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/70 backdrop-blur-sm">
          Component Showcase
        </div>

        {/* Heading */}
        <h1 className="mb-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Interactive{" "}
          <span className="italic font-light text-blue-200">components</span>{" "}
          for your projects
        </h1>

        {/* Subheading */}
        <p className="mb-10 max-w-xl text-base text-white/60 sm:text-lg">
          A curated collection of handcrafted, high-performance UI components and interactive demos.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/gallery"
            className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:scale-105 active:scale-95"
          >
            Explore Gallery
          </Link>
          <a
            href="https://github.com/Ethan4582/demo-t7block/tree/master"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-32 bg-gradient-to-t from-black/60 to-transparent" />
    </main>
  );
}
