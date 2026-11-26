'use client';
import Image from 'next/image';
import { Item } from 'react-photoswipe-gallery';
import PropertyLightbox, { registerImageDimensions } from './shared/PropertyLightbox';

const FullGallery = ({ images = [], propertyName }) => {
  if (images.length === 0) return null;

  return (
    <PropertyLightbox>
      <section className="rounded-none md:rounded-[30px] overflow-hidden mx-[-16px] md:mx-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[5px]">
            {images.map((image, index) => (
              <Item key={index} original={image?.url} width="1920" height="1280">
                {({ ref, open }) => (
                  <div
                    ref={ref}
                    onClick={open}
                    className="relative group cursor-pointer overflow-hidden bg-[#111] aspect-[4/3]"
                  >
                    <Image
                      src={image?.url}
                      alt={`${propertyName || 'Propiedad'} foto ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                      onLoad={(e) => registerImageDimensions(image?.url, e.currentTarget)}
                    />
                    <div className="absolute inset-0 bg-[#1C1C1A]/0 group-hover:bg-[#1C1C1A]/60 transition-all duration-300 ease-in-out pointer-events-none" />
                  </div>
                )}
              </Item>
            ))}
        </div>
      </section>
    </PropertyLightbox>
  );
};

export default FullGallery;
