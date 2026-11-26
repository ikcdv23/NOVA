# Dirección de D Bamba

[← Documentación](README.md) · Referencia transversal de diseño; no corresponde a un reto concreto.

Rebranding: moda urbana editorial con Represent como referencia de composición y compra. Nombre centralizado en `src/config/store.ts`; firma tipográfica propia, sin reutilizar logotipos o fotografías de la referencia.

Dirección sorteada: **The name as a monument**, seed **1400661667**. Se conservan los colores negro/blanco/plata y DM Sans local. Se adapta el hero a una campaña a sangre y se sustituyen las secciones de retratos y galería vacía por prendas y colecciones: la tienda no tiene equipo fotografiado ni contenido para esas composiciones.

Idea: el nombre D Bamba se convierte en el rótulo de su propia campaña. Interacción principal: explorar por colección y talla y preparar la selección para WhatsApp.

Imagen nueva: `public/images/bamba-campaign.webp`, creada con ImageGen integrado. Prompt: fotografía panorámica de moda masculina, modelo adulto con denim lavado oscuro y camiseta blanca ante hormigón industrial; luz natural, tonos neutros, sin texto ni logos. Es una campaña demostrativa, no stock real. Las siete imágenes anteriores de producto se conservan sin recolorear las prendas.

Verificación del rebranding: compilación y TypeScript correctos, 7/7 pruebas de lógica, navegación y compra en demo comprobadas en navegador. Inspector a 1440, 768 y 390 px: **0 FAIL**. Revisión visual final: diseño 8, usabilidad 8, creatividad 7, contenido 7 (7,7/10). Avisos aceptados: escalas adicionales para controles y precios; sin vídeo propio; el texto visible «Ropa masculina nueva y vintage» explica el nombre en portada. Capturas actuales en `preview-desktop.jpg` y `preview-mobile.jpg`.

## Dirección anterior de NOVA (histórico)

Inventario: nombre NOVA y su idea de renovación; Archive como selección; colecciones nueva/vintage; prendas únicas; talla y medidas antes de comprar; cuero con pátina; algodón Oxford; denim lavado; lana avena; conversación por WhatsApp; confirmación manual.

Argumento: el archivo se lleva puesto (hero editorial); la selección se demuestra con prendas y precios (destacados); nueva y segunda mano comparten criterio (dos accesos); las dudas se resuelven hablando (contacto).

Idea: el archivo de NOVA se convierte en una pared de fotografías desiguales que conecta el pasado de una prenda con su siguiente uso. Interacción real: explorar las dos colecciones, filtrar y construir una selección por talla.

Dirección sorteada: Photographs at uneven sizes, seed 1504924289. STIX Two Text para titulares y DM Sans para texto funcional. Paleta de la petición: crema, grafito y oliva discreto. Se mantiene la escala desigual y el título escalonado. El módulo de retratos fijados se sustituye por dos prendas enlazadas porque la marca ficticia no tiene retratos de equipo. Sin escenas de scroll fijadas: la compra mantiene prioridad y lectura continua.

Panel: Achromatic ledger, seed 318724486, adaptado a un único inventario. Navegación superior con etiquetas en vez de rail de iconos porque no hay destinos adicionales. Tablas de prendas y tallas reales, sin estadísticas inventadas. Los borradores y las fotos son la información principal.

Imágenes de muestra: siete imágenes generadas con la herramienta integrada ImageGen, sin fotos de terceros. Archivos en `public/images`: editorial, bomber, shirt, denim, knit, trousers, cap. Son contenido ficticio, identificado en Sobre la tienda. No son fotografías de stock real. Sustituir antes de publicar.

Prompt editorial: fotografía de moda masculina 4:5, joven adulto con bomber de piel marrón y denim holgado, patio mediterráneo de piedra, luz natural, grano de película, sin texto ni logos.

Prompts de producto: fotografía de estudio 4:5 de una sola prenda completa sobre gris cálido, luz difusa y textura realista, sin personas ni logos; una variante para bomber marrón, camisa Oxford azul, denim recto, jersey avena, pantalón beige de pinzas y gorra oliva.

Textos, nombres, precios, estado, medidas y cantidades son ejemplos sustituibles en `src/modules/catalog/demo.ts`; marca y contacto en `src/config/store.ts`.

## Revisión visual

ROUND 1
Seen in one second: título serif escalonado, piel y denim.
Idea (one sentence): el archivo se convierte en fotografías desiguales y una selección que el visitante puede continuar.
Live thing: colecciones navegables, filtros por talla y selección para WhatsApp.
Layout words by section: hero=escalonado / destacados=banda desigual / colecciones=díptico / contacto=franja / footer=marca.
Scores: design 7.5 · usability 7 · creativity 7 · content 8 → overall 7.3, limitado a 6 por las incidencias del inspector.
Caps applied: texto pequeño y una detección de solapamiento durante la entrada de contacto.
Top three problems:
1. Etiquetas y pie demasiado pequeños en mobile-fold y mobile-page: aumentar a 13 px.
2. El texto del hero pierde un espacio al esconder el salto de línea: conservar espacio explícito.
3. Los pies sobre el hero y antes de destacados se leen como ante títulos en móvil: retirar esas líneas; cambiar la entrada del bloque de contacto a opacidad para evitar solapamiento temporal.

ROUND 2
Seen in one second: titular editorial y la chaqueta de piel.
Idea (one sentence): prendas con pasado expuestas como un archivo vivo.
Live thing: las dos colecciones y el carrito por talla conducen a una consulta real.
Layout words by section: hero=escalonado / destacados=banda desigual / colecciones=díptico / contacto=franja / footer=marca.
Scores: design 7 · usability 8 · creativity 7 · content 8 → overall 7.4.
Caps applied: creatividad limitada a 7 por una composición editorial reconocible; movimiento contenido limita diseño a 7.
Top three observations remaining:
1. El hero móvil mantiene dos columnas estrechas; es legible y los dos enlaces están visibles, pero admite una futura variante de una columna.
2. La escala tipográfica tiene más tamaños que el ideal de la skill; corresponden a identidad, títulos editoriales, precios y controles de tienda.
3. Las imágenes son demostrativas y algunos productos las comparten; sustituir por fotos reales antes de lanzamiento.

Verificación: inspector sobre producción a 1440, 768 y 390 px, **0 FAIL**. Se abrieron las siete capturas del informe final. Avisos aceptados: crema exigido por el brief; mezcla de tipografías solo en el logotipo; tamaños adicionales de comercio; ausencia de vídeo propio; 15 elementos con entrada y feedback contenido para no distraer de la compra. No se emplean vídeos ajenos para representar un negocio ficticio.
