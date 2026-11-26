# Estilos

[← Índice de documentación](../../docs/README.md) · Referencia transversal de diseño.

`src/app/globals.css` solo ordena las importaciones:

- `tokens.css`: colores, tipografía, espaciado y curvas compartidas.
- `base.css`: elementos, controles, estados y utilidades.
- `storefront.css`: cabecera, portada y pie.
- `commerce.css`: catálogo, ficha, carrito e información de tienda.
- `admin.css`: inventario y formularios privados existentes.
- `motion.css`: entradas progresivas y alternativa de movimiento reducido; las animaciones no ocultan el contenido antes de activarse.

Añade cada regla en su capa; evita acumular correcciones al final de `globals.css`. Las imágenes de producto conservan su color original.
