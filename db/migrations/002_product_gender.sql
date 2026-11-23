-- Mantiene la base de datos alineada con el campo Product.gender de Prisma.
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'MIX');
ALTER TABLE products ADD COLUMN gender "Gender" NOT NULL DEFAULT 'MIX';
