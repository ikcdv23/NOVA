import Image, { type ImageProps } from 'next/image';
// Local demo assets are optimized by Next; protected S3 redirects bypass the image cache.
export function StoreImage(props: ImageProps) {
  return (
    <Image
      {...props}
      unoptimized={typeof props.src === 'string' && !props.src.startsWith('/images/')}
      sizes={props.sizes ?? '(max-width: 767px) 90vw, 50vw'}
      loading={props.fetchPriority === 'high' ? 'eager' : (props.loading ?? 'lazy')}
    />
  );
}
