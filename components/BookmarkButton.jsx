'use client';
import { useState, useEffect } from 'react';
import { FaBookmark } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import bookmarkProperty from '@/app/actions/bookmarkProperty';
import checkBookmarkStatus from '@/app/actions/checkBookmarkStatus';
import { toast } from 'react-toastify';

const BookmarkButton = ({ property }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    checkBookmarkStatus(property._id).then((res) => {
      if (res?.error) {
        toast.error(res.error);
      }
      setIsBookmarked(res?.isBookmarked ?? false);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [userId, property._id]);

  const handleClick = async () => {
    if (!userId) {
      toast.error('Debes iniciar sesión para guardar una propiedad');
      return;
    }

    const res = await bookmarkProperty(property._id);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    setIsBookmarked(res?.isBookmarked ?? false);
    if (res?.isBookmarked) {
      toast.success('Propiedad guardada');
    } else {
      toast.success('Propiedad removida de favoritos');
    }
  };

  if (loading) return null;

  return isBookmarked ? (
    <button
      onClick={handleClick}
      className='flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#E94560] hover:bg-[#d13a54] text-white font-semibold text-sm rounded-none md:rounded-[18px] transition-all duration-200'
    >
      <FaBookmark className='w-4 h-4' />
      Guardada
    </button>
  ) : (
    <button
      onClick={handleClick}
      className='flex items-center justify-center gap-2 w-full py-3 px-4 bg-white hover:bg-gray-50 text-[#0F172A] font-semibold text-sm rounded-none md:rounded-[18px] border border-[#ddd] transition-all duration-200'
    >
      <FaBookmark className='w-4 h-4' />
      Guardar Propiedad
    </button>
  );
};
export default BookmarkButton;
