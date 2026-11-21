// Branding and public contact data: replace this file for another client.
export const store = {
  name: 'D Bamba',
  shortName: 'D Bamba',
  email: 'nogayediop307@gmail.com ',
  whatsapp: '34695056234',
  instagram: 'https://www.instagram.com/bambaaa06/',
  tagline: 'Tu forma de llevarlo.',
  description:
    'Ropa masculina nueva y vintage. Denim, prendas de abrigo y básicos con carácter. Elige tu talla y consúltanos por WhatsApp.',
};
export const money = (cents: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
