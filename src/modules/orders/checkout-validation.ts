import { z } from 'zod';

// No permite elegir un país si el servidor aún no tiene una tarifa disponible.
export function validateCheckoutDetails(input: unknown, allowedCountries: string[]) {
  const required = (label: string, max: number) => z.string().trim().min(1, `Indica ${label}.`).max(max);
  const schema = z.object({
    email: z.string().trim().toLowerCase().max(254).pipe(z.email('Introduce un correo válido.')),
    name: required('el nombre', 120),
    address: required('la dirección', 200),
    city: required('la localidad', 100),
    postalCode: required('el código postal', 20),
    country: z.string().trim().toUpperCase().refine(
      (country) => /^[A-Z]{2}$/.test(country) && allowedCountries.includes(country),
      'No hay envíos disponibles para este país.',
    ),
  });
  return schema.safeParse(input);
}
