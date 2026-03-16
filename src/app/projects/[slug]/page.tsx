import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projectName = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white px-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">{projectName}</h1>
        <Link 
          href="/gallery/infinite-atlas-gallery"
          className="text-zinc-500 hover:text-white transition-colors text-lg"
        >
          ← Back to Demo
        </Link>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
   return [
    { slug: "motion-study" },
    { slug: "idle-form" },
    { slug: "blur-signal" },
    { slug: "still-drift" },
    { slug: "silent-horizon" },
    { slug: "neon-pulse" },
    { slug: "echo-frame" },
    { slug: "lunar-static" },
    { slug: "crimson-fade" },
    { slug: "golden-offset" },
    { slug: "phantom-grid" },
    { slug: "shadow-bloom" },
    { slug: "digital-mirage" },
    { slug: "static-bloom" },
    { slug: "midnight-vector" },
    { slug: "silver-current" },
    { slug: "urban-flux" },
    { slug: "aurora-shift" },
   ];
}
