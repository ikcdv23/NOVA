import { z } from 'zod';
import { categories, conditions } from '../catalog/types';

export function slugifyProductName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const productSchema = z.object({
  name: z.string().trim().min(3, 'El nombre necesita al menos 3 caracteres.').max(100),
  slug: z
    .string()
    .trim()
    .min(3, 'Escribe un nombre de al menos 3 caracteres para crear la dirección web.')
    .max(120, 'La dirección web es demasiado larga.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa solo letras, números y guiones.'),
  collection: z.enum(['nueva', 'vintage']),
  category: z.enum(categories),
  price: z
    .string()
    .regex(/^\d{1,6}([.,]\d{1,2})?$/, 'Introduce un precio válido, con hasta 2 decimales.')
    .transform((v) => Math.round(Number(v.replace(',', '.')) * 100))
    .pipe(
      z
        .number()
        .int()
        .min(1, 'El precio debe ser mayor que 0 €.')
        .max(10000000, 'El precio es demasiado alto.'),
    ),
  description: z
    .string()
    .trim()
    .min(10, 'Cuenta algo más sobre la prenda (mínimo 10 caracteres).')
    .max(5000, 'La descripción es demasiado larga.'),
  measurements: z
    .string()
    .trim()
    .min(3, 'Añade al menos una medida para ayudar al cliente.')
    .max(2000, 'Las medidas son demasiado largas.'),
  condition: z.enum(conditions),
  published: z.boolean(),
  featured: z.boolean(),
  variants: z
    .array(
      z.object({
        size: z.string().trim().min(1, 'Indica la talla.').max(20, 'La talla es demasiado larga.'),
        stock: z
          .number({ error: 'Indica cuántas unidades hay.' })
          .int('El stock debe ser un número entero.')
          .min(0, 'El stock no puede ser negativo.')
          .max(10000, 'El stock es demasiado alto.'),
      }),
    )
    .min(1)
    .max(20)
    .refine(
      (v) => new Set(v.map((x) => x.size.toLowerCase())).size === v.length,
      'No repitas tallas.',
    ),
});
export const idSchema = z.uuid();
export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};
