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
      id: "water-ripple",
      name: "Water Ripple",
      shortDescription: "Interactive WebGL water ripples with real-time physics and distortions.",
      instruction: "Move your cursor to create ripples.",
      image: "https://res.cloudinary.com/dbgee370f/image/upload/v1772525777/Screenshot_2026-03-03_124655_lgc6rs.png",
      category: "Three.js",
      date: "March 3, 2026",
   },
];
