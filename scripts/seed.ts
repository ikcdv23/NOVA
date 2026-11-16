import { randomUUID } from 'node:crypto';
import { db, transaction } from '../src/lib/db';
import { demoProducts } from '../src/modules/catalog/demo';
try {
  await transaction(async (c) => {
    for (const p of demoProducts) {
      const result = await c.query(
        `INSERT INTO products(id,name,slug,collection,category,price_cents,description,condition,measurements,published,featured)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING RETURNING id`,
        [
          p.id,
          p.name,
          p.slug,
          p.collection,
          p.category,
          p.priceCents,
          p.description,
          p.condition,
          p.measurements,
          p.published,
          p.featured,
        ],
      );
      if (!result.rowCount) continue;
      for (const [i, v] of p.variants.entries())
        await c.query('INSERT INTO variants(product_id,size,stock,position) VALUES($1,$2,$3,$4)', [
          p.id,
          v.size,
          v.stock,
          i,
        ]);
      for (const i of p.images)
        await c.query(
          'INSERT INTO images(id,product_id,sample_url,alt,position) VALUES($1,$2,$3,$4,$5)',
          [randomUUID(), p.id, i.url, i.alt, i.position],
        );
    }
  });
  console.log('Sample garments inserted; existing garments were preserved.');
} finally {
  await db.end();
}
