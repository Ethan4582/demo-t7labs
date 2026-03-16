import Link from "next/link";

import { projects } from "../../../components/Infinite_Atlas_Gallery/data/asset_data";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  const projectName = project ? project.title : slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

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
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

