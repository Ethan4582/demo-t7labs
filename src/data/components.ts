export interface ComponentData {
   id: string;
   name: string;
   description: string;
   image: string;
}

export const components: ComponentData[] = [
   {
      id: "water-ripple",
      name: "Water Ripple",
      description: "An interactive, high-performance water ripple effect powered by Three.js and custom GLSL shaders. Move your cursor to create ripples.",
      image: "/images/water-ripple.jpg",
   },
];
