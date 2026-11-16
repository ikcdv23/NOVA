import { db } from '../src/lib/db';
import { cleanupMedia } from '../src/modules/media/storage';
try {
  console.log(`Removed ${await cleanupMedia()} unused objects.`);
} finally {
  await db.end();
}
