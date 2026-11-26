'use client';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import addProperty from '@/app/actions/addProperty';
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
          {isSuccess ? 'Redirigiendo...' : isUploading ? 'Guardando...' : 'Agregar Propiedad'}
        </button>
      </div>
    </>
  );
};

const PropertyAddForm = ({ customLabels = [] }) => {
  const [labels, setLabels] = useState(customLabels);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('active');
  const [imageItems, setImageItems] = useState([]);
  const [galleryOrderIds, setGalleryOrderIds] = useState([]);

  const getDefaultExpiration = () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  };

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      formData.delete('images');
      formData.delete('galleryOrder');

      if (imageItems.length === 0) {
        const msg = 'Es necesario seleccionar al menos una foto de la propiedad.';
        setError(msg);
        toast.error(msg);
        setIsUploading(false);
        return;
      }

      const idToUrlMap = {};

      for (const item of imageItems) {
        const file = item.file;
        if (!file || file.name === '' || file.size === 0) continue;
        const uploaded = await uploadPropertyImageToCloudinary(file);
        idToUrlMap[item.id] = uploaded.url;
        formData.append('uploadedImages', JSON.stringify(uploaded));
      }

      if (formData.getAll('uploadedImages').length === 0) {
        throw new Error('No se pudo subir ninguna imagen a Cloudinary.');
      }

      const galleryUrls = resolveGalleryOrderUrls(galleryOrderIds, imageItems, idToUrlMap);
      galleryUrls.forEach((url) => formData.append('galleryOrder', url));

      const result = await addProperty({}, formData);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        setIsUploading(false);
        alert(result.error);
      } else if (result?.success) {
        setIsSuccess(true);
        toast.success('Propiedad agregada exitosamente');
        setTimeout(() => {
          router.push(result.redirected || '/admin/properties');
        }, 2000);
      }
    } catch (err) {
      console.error("Action error:", err);
      let msg = err?.message || 'Error desconocido al subir la propiedad.';
      setError(msg);
      toast.error(msg);
      setIsUploading(false);
      alert(msg);
    }
  };

  const [operation, setOperation] = useState('venta');
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const stampOptions = getAvailableStampOptions({ type, operation, name });
  const isLandOrCommercial = ['Terreno', 'Campo', 'Gran Inversión'].includes(type);
  const [isGenerating, setIsGenerating] = useState(false);
  const formRef = useRef(null);
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });

  const handleOperationChange = (e) => {
    const nextOp = e.target.value;
    setOperation(nextOp);
    setCurrency(nextOp === 'alquiler' ? 'ARS' : 'USD');
    setStatus((prev) => normalizeStampStatus(prev, nextOp));
  };

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
      <h2 className='text-[28px] md:text-3xl text-center font-normal mb-8 text-white' style={{ fontFamily: 'var(--font-heading)' }}>
        Agregar Propiedad
      </h2>

      {/* Tipo */}
      <div className='mb-4'>
        <label htmlFor='type' className={labelClass}>Tipo de Propiedad</label>
        <select id='type' name='type' className={inputClass} required value={type} onChange={(e) => setType(e.target.value)}>
          <option value=''>Seleccione un tipo</option>
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
          onChange={handleOperationChange}
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
          {labels.filter(l => l && l !== 'active' && !RESERVED_SYSTEM_STATUSES.includes(l)).map(label => (
            <option key={label} value={label}>{label}</option>
          ))}
        </select>
      </div>

      {status === 'NUEVA' && (
        <div className='mb-4'>
          <label htmlFor='badgeExpiresAt' className={labelClass}>Vence</label>
          <input type='date' id='badgeExpiresAt' name='badgeExpiresAt' className={inputClass} defaultValue={getDefaultExpiration()} required />
          <p className={helperClass}>La etiqueta "Nueva" dejará de mostrarse automáticamente después de esta fecha.</p>
        </div>
      )}

      {/* Nombre */}
      <div className='mb-4'>
        <label htmlFor='name' className={labelClass}>Nombre del Anuncio</label>
        <input type='text' id='name' name='name' className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder='Ej. Hermosa Casa en Alta Gracia' required />
        <p className={helperClass}>Un título atractivo y descriptivo, sin mayúsculas sostenidas.</p>
      </div>

      {/* Descripción */}
      <div className='mb-4'>
        <div className="flex justify-between items-end mb-2">
          <label htmlFor='description' className="block text-white/80 font-bold text-sm">Descripción</label>
          <button type="button" onClick={handleGenerateAI} disabled={isGenerating} className="text-[var(--color-brand)] hover:text-white text-[12px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50">
            {isGenerating ? 'Generando...' : '✨ Generar con IA'}
          </button>
        </div>
        <textarea id='description' name='description' className={inputClass} rows='5' placeholder='Describe tu propiedad o usa el botón de IA...' value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
        <p className={helperClass}>Si vas a usar la IA, completa primero el tipo, ubicación, y comodidades para un mejor resultado.</p>
      </div>

      {/* Ubicacion */}
      <div className='mb-4 bg-[#181818] border border-[#222] p-4 rounded-lg'>
        <label className={labelClass}>Ubicación</label>
        <input type='text' id='street' name='location.street' className={`${inputClass} mb-3`} placeholder='Calle' />
        <div className='grid grid-cols-2 gap-3 mb-3'>
          <input type='text' id='city' name='location.city' className={inputClass} placeholder='Ciudad' required />
          <input type='text' id='state' name='location.state' className={inputClass} placeholder='Provincia' required />
        </div>
        <input type='text' id='zipcode' name='location.zipcode' className={`${inputClass} mb-3`} placeholder='Código Postal' />
        
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
          <p className={helperClass}>El pin inicia en el centro de la ciudad. Podés arrastrarlo para afinar la ubicación.</p>
          <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="text-[var(--color-brand)] hover:underline text-[11px] font-medium flex items-center gap-1">
            Abrir Google Maps ↗
          </a>
        </div>
      </div>

      {/* Características */}
      <div className='mb-4 flex flex-wrap gap-4'>
        <div className='w-[calc(50%-8px)] md:flex-1 md:min-w-[20%]'>
          <label htmlFor='beds' className={labelClass}>
            Dormitorios
            {isLandOrCommercial && <span className="block text-gray-400 font-normal text-xs md:ml-2 md:inline">Opcional</span>}
          </label>
          <input type='number' id='beds' name='beds' className={inputClass} required={!isLandOrCommercial} />
        </div>
        <div className='w-[calc(50%-8px)] md:flex-1 md:min-w-[20%]'>
          <label htmlFor='baths' className={labelClass}>
            Baños
            {isLandOrCommercial && <span className="block text-gray-400 font-normal text-xs md:ml-2 md:inline">Opcional</span>}
          </label>
          <input type='number' id='baths' name='baths' className={inputClass} required={!isLandOrCommercial} />
        </div>
        <div className='w-full md:flex-1 md:min-w-[20%]'>
          <label htmlFor='square_feet' className={labelClass}>Sup. Total</label>
          <div className='flex'>
            <input type='number' id='square_feet' name='square_feet' className={`${inputClass} rounded-r-none`} required />
            <select name='area_unit' className='bg-[#2a2626] border border-[#2a2626] text-white px-2 rounded-r-md outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]'>
              <option value='m2'>m²</option>
              <option value='has'>has</option>
            </select>
          </div>
        </div>
        {!isLandOrCommercial && (
          <div className='w-full md:flex-1 md:min-w-[20%]'>
            <label htmlFor='covered_area' className={labelClass}>Sup. Cubierta (m²)</label>
            <input type='number' id='covered_area' name='covered_area' className={inputClass} />
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
            <input type='text' name='price' className={inputClass} placeholder={operation === 'alquiler' ? 'Ej: 450000' : 'Ej: 150000'} />
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
                <input type='checkbox' name='amenities' value={val} className='peer sr-only' />
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
                <input type='checkbox' name='amenities' value={val} className='peer sr-only' />
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
                <input type='checkbox' name='amenities' value={val} className='peer sr-only' />
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

export default PropertyAddForm;
