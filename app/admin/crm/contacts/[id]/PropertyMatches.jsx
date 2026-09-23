'use client';
import { useEffect, useState } from 'react';
import { getMatchesForProfile } from '@/app/actions/crmMatching';
import Link from 'next/link';
import { FaBolt, FaMapMarkerAlt, FaBed, FaExternalLinkAlt, FaWhatsapp } from 'react-icons/fa';

export default function PropertyMatches({ profileId, contactPhone }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getMatchesForProfile(profileId);
      if (res.success) {
        setMatches(res.matches);
      }
      setLoading(false);
    }
    load();
  }, [profileId]);

  if (loading) {
    return <div className="animate-pulse flex space-x-4 p-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-[#333] rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-[#333] rounded"></div></div></div></div>;
  }

  if (matches.length === 0) {
    return <p className="text-gray-500 text-xs mt-2 italic">No hay propiedades compatibles (Match &gt; 0%) en inventario actualmente.</p>;
  }

  const handleShare = (property) => {
    // Generate the public URL for the property. 
    // Assuming the app is running on the standard origin. We use window.location.origin to be safe.
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fariasyasociados.com.ar';
    const propertyUrl = `${baseUrl}/properties/${property._id}`;
    
    const message = `¡Hola! Creo que esta propiedad podría interesarte según lo que estás buscando:%0A%0A*${property.name}*%0A${property.city ? `Ubicación: ${property.city}%0A` : ''}Precio: USD ${property.price}%0A%0APuedes ver las fotos y más detalles aquí:%0A${propertyUrl}`;
    
    let waUrl = '';
    if (contactPhone) {
      const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
      waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    } else {
      waUrl = `https://api.whatsapp.com/send?text=${message}`;
    }
    
    window.open(waUrl, '_blank');
  };

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
        <FaBolt className="text-amber-400" /> Inteligencia de Matching
      </h3>
      {matches.map((m) => (
        <div key={m.property._id} className="flex gap-3 bg-[#161616] border border-[#333] p-2 rounded-lg hover:border-[#555] transition">
          <div className="w-16 h-16 shrink-0 rounded bg-[#222] overflow-hidden">
            {m.property.image ? (
              <img src={m.property.image} alt={m.property.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#444] text-[10px]">Sin foto</div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <Link href={`/admin/properties/${m.property._id}/edit`} className="text-sm font-bold text-white hover:text-[var(--color-brand)] truncate transition flex items-center gap-1">
                {m.property.name} <FaExternalLinkAlt size={10} className="text-gray-500" />
              </Link>
              
              <div className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                m.score >= 90 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                m.score >= 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {m.score}% Match
              </div>
            </div>
            
            <div className="flex justify-between items-end mt-1">
              <div>
                <p className="text-[var(--color-brand)] font-bold text-xs">USD {m.property.price}</p>
                <div className="flex gap-2 text-[10px] text-gray-400 mt-1">
                  {m.property.city && <span className="flex items-center gap-1"><FaMapMarkerAlt /> {m.property.city}</span>}
                  {m.property.beds > 0 && <span className="flex items-center gap-1"><FaBed /> {m.property.beds} Dorm.</span>}
                </div>
              </div>
              
              <button 
                onClick={() => handleShare(m.property)}
                className="bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/50 p-1.5 rounded transition"
                title="Enviar propuesta por WhatsApp"
              >
                <FaWhatsapp size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
