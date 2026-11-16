export const collections = { nueva: 'Nueva', vintage: 'Vintage / segunda mano' } as const;
export const categories = [
  'Chaquetas',
  'Camisas',
  'Denim',
  'Punto',
  'Pantalones',
  'Accesorios',
] as const;
export const conditions = [
  'Nueva con etiquetas',
  'Como nueva',
  'Muy buen estado',
  'Buen estado',
] as const;
export type ProductImage = { id: string; url: string; alt: string; position: number };
export type Variant = { size: string; stock: number };
export type Product = {
  id: string;
  name: string;
  slug: string;
  collection: keyof typeof collections;
  category: string;
  priceCents: number;
  description: string;
  condition: string;
  measurements: string;
  published: boolean;
  featured: boolean;
  variants: Variant[];
  images: ProductImage[];
};
export type Filters = {
  q?: string;
  collection?: string;
  category?: string;
  size?: string;
  min?: string;
  max?: string;
  available?: string;
  condition?: string;
  sort?: string;
};
