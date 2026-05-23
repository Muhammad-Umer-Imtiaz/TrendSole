export type ProductItem = {
  title: string;
  subtitle: string;
  price: string;
  image: string;
  label: string;
  surfaceClassName: string;
  imageClassName?: string;
};

export type DisciplineItem = {
  title: string;
  subtitle: string;
  description: string;
  surfaceClassName: string;
  imageClassName?: string;
};

const sharedProductImage = "/ShoesImage.webp";

export const featuredProducts: ProductItem[] = [
  {
    title: "Aura Elite 01",
    subtitle: "Midnight Black / White",
    price: "$210.00",
    image: sharedProductImage,
    label: "Editors' Pick",
    surfaceClassName: "from-stone-100 via-white to-stone-200",
    imageClassName: "rotate-[-16deg]",
  },
  {
    title: "Prism Runner",
    subtitle: "Multi Color Vibe",
    price: "$185.00",
    image: sharedProductImage,
    label: "Limited Drop",
    surfaceClassName: "from-zinc-200 via-stone-100 to-white",
    imageClassName: "rotate-[10deg] scale-[1.04]",
  },
  {
    title: "Zenith Low",
    subtitle: "Triple White",
    price: "$160.00",
    image: sharedProductImage,
    label: "Daily Luxury",
    surfaceClassName: "from-white via-stone-100 to-zinc-100",
    imageClassName: "rotate-[-6deg] translate-y-1",
  },
  {
    title: "Velocity Pro",
    subtitle: "Racing Red",
    price: "$240.00",
    image: sharedProductImage,
    label: "Race Spec",
    surfaceClassName: "from-zinc-200 via-stone-100 to-white",
    imageClassName: "rotate-[14deg] brightness-105",
  },
];

export const newArrivals: ProductItem[] = [
  {
    title: "Vector 3 Limited",
    subtitle: "Running Edition",
    price: "$250.00",
    image: sharedProductImage,
    label: "Just Landed",
    surfaceClassName: "from-stone-100 via-zinc-50 to-white",
    imageClassName: "rotate-[12deg]",
  },
  {
    title: "Oasis Breathable",
    subtitle: "Lightweight Comfort",
    price: "$145.00",
    image: sharedProductImage,
    label: "Soft Foam",
    surfaceClassName: "from-white via-stone-50 to-stone-200",
    imageClassName: "rotate-[-12deg]",
  },
  {
    title: "Drift Bounce",
    subtitle: "Performance Series",
    price: "$175.00",
    image: sharedProductImage,
    label: "Energy Return",
    surfaceClassName: "from-stone-200 via-zinc-100 to-white",
    imageClassName: "rotate-[8deg] brightness-110",
  },
  {
    title: "Shadow Runner",
    subtitle: "Urban Sneaker",
    price: "$230.00",
    image: sharedProductImage,
    label: "City Ready",
    surfaceClassName: "from-stone-200 via-white to-zinc-100",
    imageClassName: "rotate-[-18deg]",
  },
];

export const bestSellerProducts: ProductItem[] = [
  {
    title: "Origin One",
    subtitle: "Core White Edition",
    price: "$150.00",
    image: sharedProductImage,
    label: "Best Seller",
    surfaceClassName: "from-white via-zinc-50 to-stone-100",
    imageClassName: "rotate-[-9deg]",
  },
  {
    title: "Apex Stealth",
    subtitle: "Stealth Black / Orange",
    price: "$195.00",
    image: sharedProductImage,
    label: "Best Seller",
    surfaceClassName: "from-stone-200 via-zinc-100 to-white",
    imageClassName: "rotate-[13deg] brightness-105",
  },
  {
    title: "Retro Flux",
    subtitle: "Classic Street Series",
    price: "$170.00",
    image: sharedProductImage,
    label: "Best Seller",
    surfaceClassName: "from-stone-100 via-white to-zinc-100",
    imageClassName: "rotate-[-14deg]",
  },
  {
    title: "Marathon Elite",
    subtitle: "Race Blue / White",
    price: "$265.00",
    image: sharedProductImage,
    label: "Best Seller",
    surfaceClassName: "from-stone-100 via-white to-zinc-100",
    imageClassName: "rotate-[15deg] brightness-110",
  },
];

export const disciplines: DisciplineItem[] = [
  {
    title: "Lifestyle",
    subtitle: "Everyday Elite",
    description: "Clean lines and all-day comfort tuned for off-duty rotation.",
    surfaceClassName: "from-stone-100 via-stone-200 to-zinc-300",
    imageClassName: "rotate-[-18deg] -right-10 bottom-2",
  },
  {
    title: "Performance",
    subtitle: "Pro Tech",
    description: "Responsive cushioning and breathable structure for serious sessions.",
    surfaceClassName: "from-stone-200 via-zinc-100 to-white",
    imageClassName: "rotate-[12deg] -right-16 -bottom-2 brightness-110",
  },
  {
    title: "Streetwear",
    subtitle: "Urban Edge",
    description: "Statement silhouettes built to carry sharp looks through the city.",
    surfaceClassName: "from-white via-stone-100 to-zinc-200",
    imageClassName: "rotate-[-8deg] -right-12 bottom-0",
  },
];
