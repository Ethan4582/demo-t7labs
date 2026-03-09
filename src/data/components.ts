export interface ComponentData {
   id: string;
   name: string;
   shortDescription: string;

   instruction: string;
   image: string;
   category: string;
   date: string;
}

export const components: ComponentData[] = [
   {
      id: "scroll-motion-gallery",
      name: "Scroll Motion Gallery",
      shortDescription: "A scroll-driven gallery where images rotate with depth and motion. Hover reveals video previews and metadata. ",
      instruction: "Scroll to see the magic✨.",
      image: "https://res.cloudinary.com/dbgee370f/image/upload/v1773086721/demp_scrool_Gallery_ilnemr.png",
      category: "SCROLL",
      date: "March 10, 2026",
   },
   {
      id: "loader-split-counter",
      name: "Loader Split Counter",
      shortDescription: "A stylish animated loading screen with split counting numbers and progress bars.",
      instruction: "Wait for the animation to resolve. Refresh the page to see it again.",
      image: "https://res.cloudinary.com/dbgee370f/image/upload/v1772610618/Screenshot_2026-03-04_131933_wkmqqm.png",
      category: "PAGE REVEAL",
      date: "March 4, 2026",
   },
   {
      id: "water-ripple",
      name: "Water Ripple",
      shortDescription: "Interactive WebGL water ripples with real-time physics and distortions. If see an error, it means your browser doesn't support WebGL.",
      instruction: "Move your cursor to create ripples.",
      image: "https://res.cloudinary.com/dbgee370f/image/upload/v1772525777/Screenshot_2026-03-03_124655_lgc6rs.png",
      category: "MISC",
      date: "March 3, 2026",
   }
];
