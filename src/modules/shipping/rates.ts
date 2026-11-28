/** Una regla debe estar aprobada antes de poder usarse para una venta. */
export type ShippingRate = {
  zone: string;
  country: string;
  postalPrefixes: string[];
  priceCents: number;
  approved: boolean;
};

export type ShippingDestination = { country: string; postalCode: string };

/** Si dos zonas coinciden, no elegimos una tarifa por error: debe corregirse la configuración. */
export function calculateShipping(destination: ShippingDestination, rates: ShippingRate[]) {
  const country = destination.country.trim().toUpperCase();
  const postalCode = destination.postalCode.trim().toUpperCase().replace(/\s+/g, '');
  if (!/^[A-Z]{2}$/.test(country) || !postalCode) return null;

  const matches = rates.filter((rate) =>
    rate.approved && rate.country === country &&
    Number.isSafeInteger(rate.priceCents) && rate.priceCents >= 0 &&
    rate.zone.trim().length > 0 &&
    (rate.postalPrefixes.length === 0 || rate.postalPrefixes.some((prefix) =>
      prefix.length > 0 && postalCode.startsWith(prefix.toUpperCase().replace(/\s+/g, '')),
    )),
  );
  if (matches.length !== 1) return null;
  return { zone: matches[0].zone, priceCents: matches[0].priceCents };
}
