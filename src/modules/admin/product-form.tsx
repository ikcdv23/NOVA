'use client';
import { StoreImage } from '@/components/store-image';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { categories, conditions, type Product, type Variant } from '@/modules/catalog/types';
import { saveProduct } from './actions';
import { slugifyProductName, type ActionState } from './validation';
import { uploadPhoto, changePhoto } from '@/modules/media/actions';

const measurementExamples: Record<string, string> = {
  Chaquetas: 'Pecho (de sisa a sisa) 56 cm · Hombros 48 cm · Largo 68 cm · Manga 62 cm',
  Camisas: 'Pecho (de sisa a sisa) 55 cm · Hombros 47 cm · Largo 72 cm · Manga 64 cm',
  Denim: 'Cintura 42 cm · Tiro 29 cm · Largo total 104 cm · Bajo 20 cm',
  Punto: 'Pecho (de sisa a sisa) 54 cm · Hombros 46 cm · Largo 66 cm · Manga 61 cm',
  Pantalones: 'Cintura 43 cm · Tiro 30 cm · Largo total 102 cm · Bajo 21 cm',
  Accesorios: 'Ancho 28 cm · Alto 18 cm · Fondo 8 cm',
};

function FieldName({
  children,
  optional = false,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <span className="field-name">
      {children}
      <small>{optional ? 'Opcional' : 'Obligatorio'}</small>
    </span>
  );
}

function FieldError({ state, name }: { state: ActionState; name: string }) {
  const errors = state.fieldErrors?.[name];
  if (!errors?.length) return null;
  return (
    <span className="field-error" id={`${name}-error`} role="alert">
      {errors[0]}
    </span>
  );
}

export function ProductForm({ product: p }: { product?: Product }) {
  const [state, action, pending] = useActionState(saveProduct.bind(null, p?.id ?? null), {});
  const [variants, setVariants] = useState<Variant[]>(p?.variants ?? [{ size: 'M', stock: 1 }]);
  const [name, setName] = useState(p?.name ?? '');
  const [slug, setSlug] = useState(p?.slug ?? '');
  const [customSlug, setCustomSlug] = useState(Boolean(p));
  const [category, setCategory] = useState(p?.category ?? categories[0]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const errorSummary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error) errorSummary.current?.focus();
  }, [state.error]);

  const invalid = (field: string) => Boolean(state.fieldErrors?.[field]?.length);
  const updateName = (value: string) => {
    setName(value);
    if (!customSlug) setSlug(slugifyProductName(value));
  };

  return (
    <>
      <div className="admin-heading">
        <div>
          <Link className="back-link" href="/admin">
            ← Inventario
          </Link>
          <h1>{p ? 'Editar prenda' : 'Añadir una prenda'}</h1>
          <p>
            {p
              ? 'Cambia solo lo que necesites. Los campos obligatorios están señalados.'
              : 'Completa la ficha, añade las fotos y guarda. La dirección web se crea sola.'}
          </p>
        </div>
        {p?.published && (
          <Link className="text-link" href={`/producto/${p.slug}`}>
            Ver ficha pública ↗
          </Link>
        )}
      </div>
      <form action={action} className="product-form">
        <nav className="form-roadmap" aria-label="Pasos para publicar una prenda">
          <span className="current">Información</span>
          <span>Talla y stock</span>
          <span className={p?.images.length || selectedPhotos.length ? 'complete' : ''}>
            Fotos y publicación
          </span>
        </nav>

        {state.error && (
          <div className="form-error-summary" ref={errorSummary} tabIndex={-1} role="alert">
            <strong>No hemos podido guardar todavía.</strong>
            <p>{state.error}</p>
            {state.fieldErrors && (
              <ul>
                {Object.entries(state.fieldErrors).map(([field, errors]) => (
                  <li key={field}>
                    <a href={`#${field}`}>{errors[0]}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <section className="form-section" aria-labelledby="details-title">
          <header>
            <h2 id="details-title">Información de la prenda</h2>
            <p>Lo que verá el cliente en el catálogo.</p>
          </header>
          <div className="form-grid">
            <label className="span-two" htmlFor="name">
              <FieldName>Nombre</FieldName>
              <input
                id="name"
                name="name"
                required
                minLength={3}
                maxLength={100}
                value={name}
                onChange={(event) => updateName(event.target.value)}
                placeholder="Ej. Chaqueta bomber verde oliva"
                autoFocus={!p}
                aria-invalid={invalid('name') || undefined}
                aria-describedby={invalid('name') ? 'name-help name-error' : 'name-help'}
              />
              <span className="field-help" id="name-help">
                Usa palabras que alguien buscaría: tipo de prenda, color y detalle principal.
              </span>
              <FieldError state={state} name="name" />
            </label>

            <label htmlFor="collection">
              <FieldName>Colección</FieldName>
              <select id="collection" name="collection" defaultValue={p?.collection ?? 'vintage'}>
                <option value="vintage">Vintage / segunda mano</option>
                <option value="nueva">Ropa nueva</option>
              </select>
              <span className="field-help">
                Indica si la prenda ha tenido un propietario anterior.
              </span>
              <FieldError state={state} name="collection" />
            </label>

            <label htmlFor="category">
              <FieldName>Categoría</FieldName>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <span className="field-help">
                Sirve para que la prenda aparezca en el filtro correcto.
              </span>
              <FieldError state={state} name="category" />
            </label>

            <label htmlFor="price">
              <FieldName>Precio</FieldName>
              <div className="price-input">
                <input
                  id="price"
                  name="price"
                  required
                  inputMode="decimal"
                  pattern="[0-9]+([.,][0-9]{1,2})?"
                  placeholder="45,00"
                  defaultValue={p ? (p.priceCents / 100).toFixed(2) : ''}
                  aria-invalid={invalid('price') || undefined}
                  aria-describedby={invalid('price') ? 'price-help price-error' : 'price-help'}
                />
                <span>€</span>
              </div>
              <span className="field-help" id="price-help">
                Puedes escribir 45, 45,50 o 45.50.
              </span>
              <FieldError state={state} name="price" />
            </label>

            <label htmlFor="condition">
              <FieldName>Estado de conservación</FieldName>
              <select
                id="condition"
                name="condition"
                defaultValue={p?.condition ?? 'Muy buen estado'}
              >
                {conditions.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <span className="field-help">
                Elige la opción más honesta; puedes explicar marcas debajo.
              </span>
              <FieldError state={state} name="condition" />
            </label>

            <label className="span-two" htmlFor="description">
              <FieldName>Descripción</FieldName>
              <textarea
                id="description"
                name="description"
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                placeholder="Ej. Bomber ligera de los años 90, corte relajado y forro interior. Presenta una pequeña marca en el puño derecho, visible en las fotos."
                defaultValue={p?.description}
                aria-invalid={invalid('description') || undefined}
                aria-describedby={
                  invalid('description') ? 'description-help description-error' : 'description-help'
                }
              />
              <span className="field-help" id="description-help">
                Cuenta el tejido, el corte, la época y cualquier señal de uso. No necesitas un
                formato especial.
              </span>
              <FieldError state={state} name="description" />
            </label>

            <label className="span-two" htmlFor="measurements">
              <FieldName>Medidas</FieldName>
              <textarea
                id="measurements"
                name="measurements"
                required
                minLength={3}
                maxLength={2000}
                rows={3}
                placeholder={measurementExamples[category]}
                defaultValue={p?.measurements}
                aria-invalid={invalid('measurements') || undefined}
                aria-describedby={
                  invalid('measurements')
                    ? 'measurements-help measurements-error'
                    : 'measurements-help'
                }
              />
              <span className="field-help" id="measurements-help">
                No hay un formato obligatorio. Para {category.toLowerCase()}, puedes seguir este
                ejemplo: <strong>{measurementExamples[category]}</strong>.
              </span>
              <FieldError state={state} name="measurements" />
            </label>

            <details className="advanced-field span-two" open={invalid('slug') || undefined}>
              <summary>Dirección web — se crea automáticamente</summary>
              <label htmlFor="slug">
                <FieldName optional>Personalizar dirección</FieldName>
                <input
                  id="slug"
                  name="slug"
                  required
                  minLength={3}
                  maxLength={120}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  value={slug}
                  onChange={(event) => {
                    setCustomSlug(true);
                    setSlug(event.target.value.toLowerCase());
                  }}
                  aria-invalid={invalid('slug') || undefined}
                  aria-describedby={invalid('slug') ? 'slug-help slug-error' : 'slug-help'}
                />
                <span className="field-help" id="slug-help">
                  Vista previa: /producto/{slug || 'nombre-de-la-prenda'}
                </span>
                <FieldError state={state} name="slug" />
              </label>
              {customSlug && (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setCustomSlug(false);
                    setSlug(slugifyProductName(name));
                  }}
                >
                  Volver a crearla desde el nombre
                </button>
              )}
            </details>
          </div>
        </section>

        <section className="form-section" aria-labelledby="stock-title">
          <header>
            <h2 id="stock-title">Talla y unidades</h2>
            <p>Para una pieza única, deja una talla y 1 unidad.</p>
          </header>
          <fieldset className="variant-editor" id="variants">
            <legend className="sr-only">Tallas y unidades disponibles</legend>
            <input type="hidden" name="variants" value={JSON.stringify(variants)} />
            {variants.map((variant, index) => (
              <div className="variant-row" key={index}>
                <label>
                  <FieldName>Talla</FieldName>
                  <input
                    required
                    maxLength={20}
                    value={variant.size}
                    placeholder="Ej. M o 42"
                    onChange={(event) =>
                      setVariants((previous) =>
                        previous.map((item, position) =>
                          position === index ? { ...item, size: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <FieldName>Unidades</FieldName>
                  <input
                    required
                    type="number"
                    min={0}
                    max={10000}
                    step={1}
                    value={Number.isNaN(variant.stock) ? '' : variant.stock}
                    onChange={(event) =>
                      setVariants((previous) =>
                        previous.map((item, position) =>
                          position === index
                            ? { ...item, stock: event.target.valueAsNumber }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  className="text-button"
                  disabled={variants.length === 1}
                  onClick={() =>
                    setVariants((previous) => previous.filter((_, position) => position !== index))
                  }
                >
                  Quitar
                </button>
              </div>
            ))}
            <FieldError state={state} name="variants" />
            <button
              type="button"
              className="secondary-button"
              disabled={variants.length >= 20}
              onClick={() => setVariants((previous) => [...previous, { size: '', stock: 0 }])}
            >
              Añadir otra talla
            </button>
          </fieldset>
        </section>

        <section className="form-section publication-section" aria-labelledby="publication-title">
          <header>
            <h2 id="publication-title">Fotos y publicación</h2>
            <p>
              {p
                ? 'Decide dónde aparece la prenda. Para publicarla debe tener al menos una foto.'
                : 'Selecciona hasta 5 fotos. La primera será la imagen principal del catálogo.'}
            </p>
          </header>
          {p ? (
            <div className="publication">
              <label className="checkbox">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={p.published}
                  disabled={!p.images.length}
                />
                <span>
                  <strong>Publicada en la tienda</strong>
                  <small>
                    {p.images.length
                      ? 'Visible para los clientes.'
                      : 'Añade una foto para activarlo.'}
                  </small>
                </span>
              </label>
              <label className="checkbox">
                <input name="featured" type="checkbox" defaultChecked={p.featured} />
                <span>
                  <strong>Destacada en el inicio</strong>
                  <small>Aparecerá en la selección de portada.</small>
                </span>
              </label>
            </div>
          ) : (
            <>
              <label className="photo-picker" htmlFor="photos-input" id="photos">
                <FieldName optional>Fotografías</FieldName>
                <input
                  type="file"
                  name="photos"
                  id="photos-input"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  aria-invalid={invalid('photos') || selectedPhotos.length > 5 || undefined}
                  aria-describedby={invalid('photos') ? 'photos-help photos-error' : 'photos-help'}
                  onChange={(event) =>
                    setSelectedPhotos(Array.from(event.target.files ?? []).map((file) => file.name))
                  }
                />
                <span className="field-help" id="photos-help">
                  JPG, PNG o WebP. Máximo 5 MB por foto. Puedes elegir varias a la vez.
                </span>
                {selectedPhotos.length > 0 && selectedPhotos.length <= 5 && (
                  <span className="selected-files">
                    {selectedPhotos.length}{' '}
                    {selectedPhotos.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}:{' '}
                    {selectedPhotos.join(', ')}
                  </span>
                )}
                {selectedPhotos.length > 5 && (
                  <span className="field-error" role="alert">
                    Has seleccionado {selectedPhotos.length}. Elige como máximo 5 fotos.
                  </span>
                )}
                <FieldError state={state} name="photos" />
              </label>
              <div className="publication">
                <label className="checkbox">
                  <input name="published" type="checkbox" disabled={!selectedPhotos.length} />
                  <span>
                    <strong>Publicar al guardar</strong>
                    <small>
                      {selectedPhotos.length
                        ? 'La prenda será visible inmediatamente.'
                        : 'Selecciona una foto para poder publicar.'}
                    </small>
                  </span>
                </label>
                <label className="checkbox">
                  <input name="featured" type="checkbox" />
                  <span>
                    <strong>Destacada en el inicio</strong>
                    <small>Aparecerá en la selección de portada.</small>
                  </span>
                </label>
              </div>
              <p className="draft-explainer">
                Si todavía no tienes fotos, puedes guardar igualmente; quedará oculta hasta que la
                publiques.
              </p>
            </>
          )}
        </section>

        <div className="form-save-bar">
          <p>
            {p ? 'Los cambios actualizarán el catálogo.' : 'Podrás editar cualquier dato después.'}
          </p>
          <button className="button" disabled={pending || selectedPhotos.length > 5}>
            {pending ? 'Guardando…' : p ? 'Guardar cambios' : 'Guardar prenda'}
          </button>
        </div>
        {state.success && (
          <p className="notice" role="status">
            {state.success}
          </p>
        )}
      </form>
      {p && <PhotoManager product={p} />}
    </>
  );
}
function PhotoManager({ product: p }: { product: Product }) {
  const [state, action, pending] = useActionState(uploadPhoto.bind(null, p.id), {});
  const [working, start] = useTransition(),
    [message, setMessage] = useState(''),
    [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  function change(id: string, operation: 'primary' | 'delete') {
    start(async () => {
      try {
        const r = await changePhoto(p.id, id, operation);
        setMessage(r.error ?? r.success ?? '');
        setDeleting(null);
        router.refresh();
      } catch {
        setMessage('No se ha podido cambiar la imagen. Inténtalo de nuevo.');
      }
    });
  }
  return (
    <section className="photo-manager">
      <h2>Fotografías ({p.images.length}/5)</h2>
      <p>La primera foto aparece en el catálogo. JPG, PNG o WebP, hasta 5 MB por imagen.</p>
      <div className="admin-photos">
        {p.images.map((image, i) => (
          <div key={image.id}>
            <StoreImage src={image.url} alt={image.alt} width="200" height="250" />
            <p>{i === 0 ? 'Imagen principal' : `Foto ${i + 1}`}</p>
            <div className="row-actions">
              {i > 0 && (
                <button disabled={working} onClick={() => change(image.id, 'primary')}>
                  Hacer principal
                </button>
              )}
              <button disabled={working} onClick={() => setDeleting(image.id)}>
                Borrar
              </button>
            </div>
            {deleting === image.id && (
              <div className="delete-confirm">
                <p>¿Borrar esta foto?</p>
                <button disabled={working} onClick={() => change(image.id, 'delete')}>
                  Confirmar
                </button>
                <button onClick={() => setDeleting(null)}>Cancelar</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {p.images.length < 5 && (
        <form action={action} className="upload-form">
          <label>
            Subir una foto
            <input type="file" name="photo" required accept="image/jpeg,image/png,image/webp" />
          </label>
          <button className="button" disabled={pending}>
            {pending ? 'Subiendo…' : 'Subir foto + '}
          </button>
        </form>
      )}
      {state.error && (
        <p role="alert" className="error-text">
          {state.error}
        </p>
      )}
      {state.success && <p role="status">{state.success}</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
