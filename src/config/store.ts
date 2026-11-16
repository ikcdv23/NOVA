// Branding and public contact data: replace this file for another client.
export const store = {
  name: 'NOVA Archive',
  shortName: 'NOVA',
  email: 'hola@nova-archive.example',
  whatsapp: '34695056234',
  instagram: 'https://www.instagram.com/',
  tagline: 'Prendas con pasado. Estilo de ahora.',
  description:
    'Una selección de ropa masculina nueva y vintage. Buenos cortes, texturas honestas y prendas que se quedan.',
};
export const money = (cents: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
