'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegHeart, FaHeart, FaWhatsapp } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import PropertyCardInfo from '@/components/PropertyCardInfo';
import { getPriceDisplay, getPropertyImage, getStatusBadge } from '@/utils/propertyDisplay';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import bookmarkProperty from '@/app/actions/bookmarkProperty';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const PropertyCard = ({ property, isSelected = false, onMouseEnter, onMouseLeave }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'admin';
  const router = useRouter();

  const image = getPropertyImage(property);
  const price = getPriceDisplay(property);
  const badge = getStatusBadge(property);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      toast.error('Debes iniciar sesión para guardar una propiedad');
      return;
    }
    if (toggling) return;
    setToggling(true);
    const res = await bookmarkProperty(property._id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      setIsBookmarked(res?.isBookmarked ?? false);
      toast.success(res?.isBookmarked ? 'Propiedad guardada' : 'Propiedad removida');
    }
    setToggling(false);
  };

  return (
    <div
      className={`
        group relative bg-white rounded-xl overflow-hidden border transition-all duration-300
        shadow-card hover:shadow-card-hover hover:-translate-y-1
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 border-primary/30' : 'border-gray-100'}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link href={`/properties/${property._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            <Image
              src={image}
              alt={property.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Black gradient overlay — default */}
            <div className="absolute inset-0 z-10 group-hover:opacity-0 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 10%, transparent 100%)' }} />
            {/* Orange gradient overlay — on hover, bottom 20% */}
            <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(180deg, transparent 80%, var(--color-brand))' }} />

            {/* Status badge — top left */}
          <div className="absolute top-3 left-3 z-10">
            {badge ? (
              <span className="bg-[var(--color-brand)] backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                {badge.label}
              </span>
            ) : (
              <span className="bg-navy/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
                {price}
              </span>
            )}
          </div>

          {/* Heart bookmark button */}
          <button
            onClick={handleBookmark}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
              isBookmarked
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                : 'bg-white/90 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-red-500 shadow-sm'
            }`}
            aria-label={isBookmarked ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            {isBookmarked
              ? <FaHeart className="w-3.5 h-3.5" />
              : <FaRegHeart className="w-3.5 h-3.5" />
            }
          </button>

          <a
            href={generateWhatsAppLink({ property })}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 bg-whatsapp hover:bg-whatsapp-hover text-white p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 z-10"
            onClick={(e) => e.stopPropagation()}
            aria-label="Consultar por WhatsApp"
          >
            <FaWhatsapp className="w-4 h-4" />
          </a>

          {/* Edit button — admin only */}
          {isAdmin && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/properties/${property._id}/edit`); }}
              className="absolute bottom-12 right-3 bg-[var(--color-ink)]/80 hover:bg-[var(--color-ink)] text-white p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
              aria-label="Editar propiedad"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
        </div>

        <div className="p-4">
          <PropertyCardInfo property={property} />
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
