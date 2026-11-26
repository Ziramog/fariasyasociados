'use client';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import updateProperty from '@/app/actions/updateProperty';
import { generateDescription } from '@/app/actions/generateDescription';
import LocationPickerMap from '@/components/shared/LocationPickerMap';
import FullScreenLoader from '@/components/shared/FullScreenLoader';
import CustomLabelsManager from '@/components/admin/CustomLabelsManager';
import PropertyImageSorter from '@/components/admin/PropertyImageSorter';
import { getAvailableStampOptions, normalizeStampStatus, RESERVED_SYSTEM_STATUSES } from '@/utils/propertyDisplay';
import { uploadPropertyImageToCloudinary, resolveGalleryOrderUrls } from '@/utils/cloudinaryClientUpload';

const SubmitButton = ({ isUploading, isSuccess, error, onCloseError }) => {
  const disabled = isUploading || isSuccess;
  return (
    <>
      <FullScreenLoader isUploading={isUploading} isSuccess={isSuccess} error={error} onCloseError={onCloseError} />
      <div className="mt-8 flex gap-4">
        <Link href="/admin/properties" className={`bg-transparent border border-[#555] hover:bg-[#222] text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          Cancelar
        </Link>
        <button
          className='bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold py-3 px-4 rounded-md flex-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
          type='submit'
          disabled={disabled}
        >
          {isSuccess ? 'Redirigiendo...' : isUploading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </>
  );
};

const PropertyEditForm = ({ property, customLabels = [] }) => {
  const [labels, setLabels] = useState(customLabels);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(
    normalizeStampStatus(property.status || 'active', property.operation || 'venta')
  );

  const getExistingExpiration = () => {
    if (property.badgeExpiresAt) {
      return new Date(property.badgeExpiresAt).toISOString().split('T')[0];
    }
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  };

  const router = useRouter();

  const initialImageItems = (property.images || []).map((img, idx) => {
    const url = typeof img === 'string' ? img : img?.url;
    return {
      id: `existing_${idx}_${url}`,
      type: 'existing',
      url,
      original: img,
    };
  });

  const [imageItems, setImageItems] = useState(initialImageItems);
  const [galleryOrderIds, setGalleryOrderIds] = useState(() => {
    const savedOrder = property.gallery_order || [];
    if (!savedOrder.length) return initialImageItems.map((it) => it.id);
    const sorted = [...initialImageItems].sort((a, b) => {
      const idxA = savedOrder.indexOf(a.url);
      const idxB = savedOrder.indexOf(b.url);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });
    return sorted.map((it) => it.id);
  });
  const [removedImages, setRemovedImages] = useState([]);

  const handleRemoveExisting = (imgUrl) => {
    setRemovedImages((prev) => (prev.includes(imgUrl) ? prev : [...prev, imgUrl]));
  };

  const handleUndoRemoveExisting = (imgUrl) => {
    setRemovedImages((prev) => prev.filter((url) => url !== imgUrl));
    const originalImg = (property.images || []).find(
      (img) => (typeof img === 'string' ? img : img?.url) === imgUrl
    );
    const restoredId = `existing_restored_${Date.now()}_${imgUrl}`;
    setImageItems((prev) => [
      ...prev,
      {
        id: restoredId,
        type: 'existing',
        url: imgUrl,
        original: originalImg || imgUrl,
      },
    ]);
    setGalleryOrderIds((prev) => [...prev, restoredId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      formData.delete('images');
      formData.delete('orderedImages');
      formData.delete('galleryOrder');
      formData.delete('removedImages');

      if (imageItems.length === 0) {
        const msg = 'Es necesario mantener al menos una foto de la propiedad.';
        setError(msg);
        toast.error(msg);
        setIsUploading(false);
        return;
      }

      const idToUrlMap = {};

      for (const item of imageItems) {
        if (item.type === 'existing') {
          idToUrlMap[item.id] = item.url;
          formData.append('orderedImages', item.url);
        } else if (item.type === 'new' && item.file) {
          const file = item.file;
          if (!file || file.name === '' || file.size === 0) continue;
          const uploaded = await uploadPropertyImageToCloudinary(file);
          formData.append('uploadedImages', JSON.stringify(uploaded));
          idToUrlMap[item.id] = uploaded.url;
          formData.append('orderedImages', uploaded.url);
        }
      }

      const galleryUrls = resolveGalleryOrderUrls(galleryOrderIds, imageItems, idToUrlMap);
      galleryUrls.forEach((url) => formData.append('galleryOrder', url));
      removedImages.forEach((imgUrl) => formData.append('removedImages', imgUrl));

      const result = await updateProperty({}, formData);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        setIsUploading(false);
      } else if (result?.success) {
        setIsSuccess(true);
        if (result.redirected) {
          setTimeout(() => {
            router.push(result.redirected);
          }, 800);
        }
      }
    } catch (err) {
      console.error("Action error:", err);
      const msg = err?.message || 'Error desconocido al subir la propiedad.';
      setError(msg);
      toast.error(msg);
      setIsUploading(false);
    }
  };

  const [operation, setOperation] = useState(property.operation || 'venta');
  const [currency, setCurrency] = useState(() => {
    const p = String(property.price || '').trim().toUpperCase();
    if (p.startsWith('ARS') || p.startsWith('$')) return 'ARS';
    return 'USD';
  });
  const [type, setType] = useState(property.type || '');
  const [name, setName] = useState(property.name || '');
  const stampOptions = getAvailableStampOptions({ type, operation, name });
  const isLandOrCommercial = ['Terreno', 'Campo', 'Gran Inversión'].includes(type);
  const [isGenerating, setIsGenerating] = useState(false);
  const formRef = useRef(null);
  const [description, setDescription] = useState(property.description || '');

  const [coordinates, setCoordinates] = useState({
    lat: property.coordinates?.lat || '',
    lng: property.coordinates?.lng || '',
  });

  const handleLocationChange = (lat, lng) => {
    setCoordinates({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
  };

  const handleGenerateAI = async () => {
    if (!formRef.current) return;
    
    const currentFormData = new FormData(formRef.current);
    const type = currentFormData.get('type');
    const city = currentFormData.get('location.city');
    const beds = currentFormData.get('beds');
    const baths = currentFormData.get('baths');
    const sqft = currentFormData.get('square_feet');

    const isLand = type === 'Terreno' || type === 'Campo' || type === 'Gran Inversión';

    if (!type || !city) {
      toast.warn('Complete Tipo y Ciudad antes de generar.');
      return;
    }

    if (!isLand && (!beds || !baths || !sqft)) {
      toast.warn('Para este tipo de propiedad, complete Dormitorios, Baños y Metros².');
      return;
    }

    setIsGenerating(true);
    const res = await generateDescription(currentFormData);
    if (res.error) {
      toast.error(res.error);
    } else if (res.description) {
      setDescription(res.description);
      toast.success('Descripción generada con IA');
    }
    setIsGenerating(false);
  };

  const inputClass = 'bg-[#111] border border-[#333] text-white rounded w-full py-2 px-3 focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-colors';
  const labelClass = 'block text-white/80 font-bold mb-2 text-sm';
  const helperClass = 'text-[11px] text-gray-400 mt-1';

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type='hidden' name='propertyId' value={property._id} />

      <h2 className='text-[28px] md:text-3xl text-center font-normal mb-8 text-white' style={{ fontFamily: 'var(--font-heading)' }}>
        Editar Propiedad
      </h2>

      {/* Tipo */}
      <div className='mb-4'>
        <label htmlFor='type' className={labelClass}>Tipo de Propiedad</label>
        <select id='type' name='type' className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
          <option value=''>Sin tipo específico</option>
          <option value='Casa'>Casa</option>
          <option value='Departamento'>Departamento</option>
          <option value='Campo'>Campo</option>
          <option value='Terreno'>Terreno</option>
          <option value='Inmueble Comercial'>Inmueble Comercial</option>
          <option value='Gran Inversión'>Gran Inversión</option>
        </select>
      </div>

      {/* Operacion */}
      <div className='mb-4'>
        <label htmlFor='operation' className={labelClass}>Operación</label>
        <select
          id='operation'
          name='operation'
          className={inputClass}
          value={operation}
          onChange={(e) => {
            const nextOp = e.target.value;
            setOperation(nextOp);
            setStatus((prev) => normalizeStampStatus(prev, nextOp));
            if (!property.price || /^consultar$/i.test(String(property.price).trim())) {
              setCurrency(nextOp === 'alquiler' ? 'ARS' : 'USD');
            }
          }}
        >
          <option value='venta'>Venta</option>
          <option value='alquiler'>Alquiler</option>
        </select>
      </div>

      {/* Estado */}
      <div className='mb-4'>
        <div className="flex justify-between items-end mb-2">
          <label htmlFor='status' className="block text-white/80 font-bold text-sm">Etiqueta Especial</label>
          <CustomLabelsManager labels={labels} setLabels={setLabels} />
        </div>
        <select id='status' name='status' className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value='active'>Sin etiqueta</option>
          <option value='NUEVA'>Nueva</option>
          {stampOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label} (Sello transparente)</option>
          ))}
          {Array.from(new Set([...labels, property.status || 'active']))
            .filter(l => l && l !== 'active' && !RESERVED_SYSTEM_STATUSES.includes(l))
            .map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
        </select>
      </div>

      {status === 'NUEVA' && (
        <div className='mb-4'>
          <label htmlFor='badgeExpiresAt' className={labelClass}>Vence</label>
          <input type='date' id='badgeExpiresAt' name='badgeExpiresAt' className={inputClass} defaultValue={getExistingExpiration()} required />
          <p className={helperClass}>La etiqueta "Nueva" dejará de mostrarse automáticamente después de esta fecha.</p>
        </div>
      )}

      {/* Nombre */}
      <div className='mb-4'>
        <label htmlFor='name' className={labelClass}>Nombre del Anuncio</label>
        <input type='text' id='name' name='name' className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        <p className={helperClass}>Un título atractivo y descriptivo, sin mayúsculas sostenidas.</p>
      </div>

      {/* Descripción */}
      <div className='mb-4'>
        <div className="flex justify-between items-end mb-2">
          <label htmlFor='description' className="block text-white/80 font-bold text-sm">Descripción</label>
          <div className="flex items-center gap-2">
            <select name="ai_tone" id="ai_tone" className="bg-[#111] border border-[#333] text-white/80 text-[11px] rounded px-2 py-1 outline-none">
              <option value="estándar">Estándar</option>
              <option value="corta">Corta</option>
              <option value="larga">Larga</option>
              <option value="formal">Formal</option>
              <option value="informal">Informal</option>
            </select>
            <button type="button" onClick={handleGenerateAI} disabled={isGenerating} className="text-[var(--color-brand)] hover:text-white text-[12px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50">
              {isGenerating ? 'Generando...' : '✨ Generar con IA'}
            </button>
          </div>
        </div>
        <textarea id='description' name='description' className={inputClass} rows='5' value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
        <p className={helperClass}>Usa el botón de IA si necesitas ayuda para reescribir una descripción atractiva.</p>
      </div>

      {/* Ubicacion */}
      <div className='mb-4 bg-[#181818] border border-[#222] p-4 rounded-lg'>
        <label className={labelClass}>Ubicación</label>
        <input type='text' id='street' name='location.street' className={`${inputClass} mb-3`} placeholder='Calle' defaultValue={property.location?.street} />
        <div className='grid grid-cols-2 gap-3 mb-3'>
          <input type='text' id='city' name='location.city' className={inputClass} placeholder='Ciudad' required defaultValue={property.location?.city} />
          <input type='text' id='state' name='location.state' className={inputClass} placeholder='Provincia' required defaultValue={property.location?.state} />
        </div>
        <input type='text' id='zipcode' name='location.zipcode' className={`${inputClass} mb-3`} placeholder='Código Postal' defaultValue={property.location?.zipcode} />
        
        <label className={`${labelClass} mt-4`}>Coordenadas del Mapa</label>
        <div className='flex gap-3 mb-3'>
          <input type='number' step='any' id='lat' name='coordinates.lat' className={inputClass} placeholder='Latitud' value={coordinates.lat} onChange={(e) => setCoordinates(prev => ({...prev, lat: e.target.value}))} />
          <input type='number' step='any' id='lng' name='coordinates.lng' className={inputClass} placeholder='Longitud' value={coordinates.lng} onChange={(e) => setCoordinates(prev => ({...prev, lng: e.target.value}))} />
        </div>
        <div className="mb-2">
          <LocationPickerMap
            initialLat={coordinates.lat ? parseFloat(coordinates.lat) : undefined}
            initialLng={coordinates.lng ? parseFloat(coordinates.lng) : undefined}
            onLocationChange={handleLocationChange}
          />
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className={helperClass}>El pin inicia en el centro de la ciudad o en su ubicación guardada. Podés arrastrarlo para afinar la ubicación.</p>
          <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="text-[var(--color-brand)] hover:underline text-[11px] font-medium flex items-center gap-1">
            Abrir Google Maps ↗
          </a>
        </div>
      </div>

      {/* Características */}
      <div className='mb-4 flex flex-wrap gap-4'>
        <div className='w-[calc(50%-8px)] md:flex-1 md:min-w-[20%]'>
          <label className={labelClass}>Dormitorios</label>
          <input type='number' id='beds' name='beds' className={inputClass} defaultValue={property.beds} />
        </div>
        <div className='w-[calc(50%-8px)] md:flex-1 md:min-w-[20%]'>
          <label className={labelClass}>Baños</label>
          <input type='number' id='baths' name='baths' className={inputClass} defaultValue={property.baths} />
        </div>
        <div className='w-full md:flex-1 md:min-w-[20%]'>
          <label className={labelClass}>Sup. Total</label>
          <div className='flex'>
            <input type='number' id='square_feet' name='square_feet' className={`${inputClass} rounded-r-none`} defaultValue={property.total_area ?? property.square_feet} />
            <select name='area_unit' className='bg-[#2a2626] border border-[#2a2626] text-white px-2 rounded-r-md outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]'>
              <option value='m2'>m²</option>
              <option value='has'>has</option>
            </select>
          </div>
        </div>
        {!isLandOrCommercial && (
          <div className='w-full md:flex-1 md:min-w-[20%]'>
            <label className={labelClass}>Sup. Cubierta (m²)</label>
            <input type='number' id='covered_area' name='covered_area' className={inputClass} defaultValue={property.covered_area} />
          </div>
        )}
      </div>

      {/* Precio */}
      <div className='mb-6'>
        <label className={labelClass}>
          {operation === 'alquiler' ? 'Precio de Alquiler Mensual' : 'Precio de Venta'}
        </label>
        <div className='flex gap-2 items-start'>
          <select name='price_currency' value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${inputClass} !w-[110px] flex-shrink-0`}>
            <option value='USD'>U$D</option>
            <option value='ARS'>ARS ($)</option>
          </select>
          <div className='flex-1'>
            <input
              type='text'
              name='price'
              className={inputClass}
              placeholder={operation === 'alquiler' ? 'Ej: 450000' : 'Ej: 150000'}
              defaultValue={(() => {
                const raw = String(property.price || '').trim();
                if (!raw) return '';
                if (/^consultar$/i.test(raw)) return 'Consultar';
                return raw.replace(/^(USD|U\$D|ARS|\$)\s*/i, '').trim();
              })()}
            />
            <p className={helperClass}>
              {operation === 'alquiler'
                ? 'Ej: 450000 — Escribí el valor mensual (con o sin puntos de miles). Escribí "Consultar" si no querés publicar el precio.'
                : 'Ej: 150000 — Escribí el valor (con o sin puntos de miles). Escribí "Consultar" si no querés publicar el precio.'}
            </p>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className='mb-6'>
        <label className={labelClass}>Servicios</label>
        <div className='bg-[#181818] border border-[#222] p-5 rounded-lg'>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Básicos</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              ['Agua Corriente', 'Agua Corriente'],
              ['Gas Natural', 'Gas Natural'],
              ['Internet / Wifi', 'Internet / Wifi'],
              ['Luz', 'Luz / Energía'],
              ['Cloaca', 'Cloaca'],
              ['Pavimento', 'Pavimento'],
            ].map(([val, label]) => (
              <label key={val} className="cursor-pointer">
                <input type='checkbox' name='amenities' value={val} className='peer sr-only' defaultChecked={property.amenities?.includes(val)} />
                <div className='px-3 py-1.5 rounded-md border border-[#444] text-sm bg-[#222] text-white/80 hover:bg-[#333] peer-checked:bg-[var(--color-brand)] peer-checked:text-white peer-checked:border-[var(--color-brand)] transition-colors'>
                  {label}
                </div>
              </label>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-gray-400 mb-3">Seguridad</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              ['Seguridad 24hs', 'Seguridad 24hs'],
              ['Alarma', 'Alarma'],
              ['Cámaras', 'Cámaras (CCTV)'],
            ].map(([val, label]) => (
              <label key={val} className="cursor-pointer">
                <input type='checkbox' name='amenities' value={val} className='peer sr-only' defaultChecked={property.amenities?.includes(val)} />
                <div className='px-3 py-1.5 rounded-md border border-[#444] text-sm bg-[#222] text-white/80 hover:bg-[#333] peer-checked:bg-[var(--color-brand)] peer-checked:text-white peer-checked:border-[var(--color-brand)] transition-colors'>
                  {label}
                </div>
              </label>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-gray-400 mb-3">Instalaciones</h3>
          <div className="flex flex-wrap gap-2">
            {[
              ['Pileta', 'Pileta'],
              ['Gimnasio', 'Gimnasio'],
              ['Estacionamiento', 'Estacionamiento'],
              ['Ascensor', 'Ascensor'],
              ['Balcón/Patio', 'Balcón / Patio'],
              ['Oficina / Privado', 'Oficina / Privado'],
              ['Hidromasaje', 'Hidromasaje'],
              ['Acceso Discapacitados', 'Acceso Discapacitados'],
            ].map(([val, label]) => (
              <label key={val} className="cursor-pointer">
                <input type='checkbox' name='amenities' value={val} className='peer sr-only' defaultChecked={property.amenities?.includes(val)} />
                <div className='px-3 py-1.5 rounded-md border border-[#444] text-sm bg-[#222] text-white/80 hover:bg-[#333] peer-checked:bg-[var(--color-brand)] peer-checked:text-white peer-checked:border-[var(--color-brand)] transition-colors'>
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>


      {/* Imagenes */}
      <div className='mb-8'>
        <label className={labelClass}>Imágenes de la Propiedad</label>
        <PropertyImageSorter
          items={imageItems}
          setItems={setImageItems}
          galleryOrderIds={galleryOrderIds}
          setGalleryOrderIds={setGalleryOrderIds}
          removedImages={removedImages}
          onRemoveExisting={handleRemoveExisting}
          onUndoRemoveExisting={handleUndoRemoveExisting}
          helperClass={helperClass}
        />
      </div>

      <SubmitButton 
        isUploading={isUploading} 
        isSuccess={isSuccess} 
        error={error} 
        onCloseError={() => setError(null)} 
      />
    </form>
  );
};
export default PropertyEditForm;
