# Componentes

[← Índice de documentación](../../docs/README.md) · Referencia transversal de interfaz.

- `brand/`: firma de D Bamba, con nombre leído de `src/config/store.ts`.
- `home/`: secciones visuales de portada; la página consulta el catálogo y las compone.
- `catalog/`, `cart/`, `admin/`, `auth/`: presentación de cada funcionalidad.
- `catalog/catalog-filters.tsx`: formulario GET y filtros desplegables nativos; conserva los parámetros del catálogo sin añadir JavaScript cliente.
- `header.tsx`, `footer.tsx`: navegación y marco compartido.

Los componentes no consultan PostgreSQL directamente. Las reglas y operaciones permanecen en `src/modules/`. Usa Server Components salvo que haga falta estado o interacción del navegador.
