CREATE TABLE schema_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now());
CREATE TABLE users (
 id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL,
 role text NOT NULL DEFAULT 'admin' CHECK(role='admin'), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE login_attempts (key text PRIMARY KEY, attempts integer NOT NULL, window_start timestamptz NOT NULL);
CREATE TABLE products (
 id uuid PRIMARY KEY, name text NOT NULL, slug text UNIQUE NOT NULL,
 collection text NOT NULL CHECK(collection IN ('nueva','vintage')), category text NOT NULL,
 price_cents integer NOT NULL CHECK(price_cents BETWEEN 1 AND 10000000),
 measurements text NOT NULL, description text NOT NULL, condition text NOT NULL,
 published boolean NOT NULL DEFAULT false, featured boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_public ON products(published,collection,category);
CREATE TABLE variants (
 product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE, size text NOT NULL,
 stock integer NOT NULL CHECK(stock BETWEEN 0 AND 10000), position integer NOT NULL DEFAULT 0,
 PRIMARY KEY(product_id,size)
);
CREATE TABLE images (
 id uuid PRIMARY KEY, product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 object_key text UNIQUE, sample_url text, alt text NOT NULL, position integer NOT NULL DEFAULT 0,
 CHECK ((object_key IS NOT NULL)::integer + (sample_url IS NOT NULL)::integer = 1)
);
CREATE INDEX images_product ON images(product_id,position);
CREATE TABLE media_cleanup (object_key text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), not_before timestamptz NOT NULL DEFAULT now());

-- Mantiene la base de datos alineada con el campo Product.gender de Prisma.
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'MIX');
ALTER TABLE products ADD COLUMN gender "Gender" NOT NULL DEFAULT 'MIX';
