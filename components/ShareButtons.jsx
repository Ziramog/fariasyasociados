'use client';
import { FaWhatsapp } from 'react-icons/fa';

const ShareButtons = ({ property }) => {
  const shareUrl = `${process.env.NEXT_PUBLIC_DOMAIN || 'https://farias-asociados.vercel.app'}/properties/${property._id}`;
  const shareTitle = property?.name || 'Propiedad';

  const btnClass = 'inline-flex items-center justify-center opacity-35 hover:opacity-100 transition-all duration-200';

  return (
    <div className="flex justify-center gap-4">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Compartir en Facebook"
      >
        <img src="/senada/images/icons/icon_share_facebook.svg" alt="" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Compartir en Twitter"
      >
        <img src="/senada/images/icons/icon_share_twitter.svg" alt="" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Compartir en LinkedIn"
      >
        <img src="/senada/images/icons/icon_share_linked.svg" alt="" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
      </a>

      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Compartir en WhatsApp"
      >
        <FaWhatsapp className="w-5 h-5" />
      </a>
    </div>
  );
};

export default ShareButtons;
