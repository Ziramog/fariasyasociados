'use client';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import updateProperty from '@/app/actions/updateProperty';
import { generateDescription } from '@/app/actions/generateDescription';
import LocationPickerMap from '@/components/shared/LocationPickerMap';
import FullScreenLoader from '@/components/shared/FullScreenLoader';
import CustomLabelsManager from '@/components/admin/CustomLabelsManager';

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
  const [status, setStatus] = useState(property.status || 'active');

  const getExistingExpiration = () => {
    if (property.badgeExpiresAt) {
      return new Date(property.badgeExpiresAt).toISOString().split('T')[0];
    }
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
      // Get files from previewImages state instead of form input to support multiple drag/drop/selects
      const imageFiles = previewImages.map(p => p.file);
      
      formData.delete('images');
      
      if (imageFiles.length > 0) {
        const options = { maxSizeMB: 0.6, maxWidthOrHeight: 1600, useWebWorker: true };
        for (const file of imageFiles) {
          if (!file || file.name === '' || file.size === 0) continue;
          let fileToUpload = file;
          try {
            fileToUpload = await imageCompression(file, options);
          } catch (compressError) {
            console.error('Error compressing image:', compressError);
          }
          
          // Upload directly to the client-specific Cloudinary cloud/preset
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
          const uploadFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER;

          if (!cloudName || !uploadPreset) {
            throw new Error('Cloudinary no está configurado para Farias. Revisar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
          }

          const uploadData = new FormData();
          uploadData.append('file', fileToUpload);
          uploadData.append('upload_preset', uploadPreset);
          if (uploadFolder) uploadData.append('folder', uploadFolder);
          
          const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: uploadData
          });
          
          if (!uploadRes.ok) {
            throw new Error('Fallo al subir imagen a Cloudinary');
          }
          
          const cloudinaryResult = await uploadRes.json();
          formData.append('uploadedImages', JSON.stringify({
            url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id
          }));
        }
      }

      previewImages.forEach((img) => formData.append('orderedImages', img.url));
      removedImages.forEach((img) => formData.append('removedImages', img));

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
      const msg = 'Error de red. Las imágenes pueden ser demasiado grandes (límite 4.5MB).';
      setError(msg);
      toast.error(msg);
      setIsUploading(false);
    }
  };

  const [removedImages, setRemovedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [operation, setOperation] = useState(property.operation || 'venta');
  const [type, setType] = useState(property.type || '');
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

  const [existingImagesState, setExistingImagesState] = useState(property.images || []);
  const [draggedIdx, setDraggedIdx] = useState(null);

  const visibleImages = existingImagesState.filter(
    (img) => !removedImages.includes(typeof img === 'string' ? img : img?.url)
  );

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const newItems = [...existingImagesState];
    const draggedItem = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setExistingImagesState(newItems);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleRemoveImage = (imgUrl) => setRemovedImages([...removedImages, imgUrl]);
  const handleUndoRemove = (imgUrl) => setRemovedImages(removedImages.filter((url) => url !== imgUrl));

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));
    setPreviewImages([...previewImages, ...previews]);
  };

  const handleRemovePreview = (index) => {
    const updated = [...previewImages];
    updated.splice(index, 1);
    setPreviewImages(updated);
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
  const helperClass = 'text-[11px] text-gray-500 mt-1';

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type='hidden' name='propertyId' value={property._id} />
      {removedImages.map((url) => <input key={url} type='hidden' name='removedImages' value={url} />)}
      {visibleImages.map((img) => <input key={'order_' + (typeof img === 'string' ? img : img.url)} type='hidden' name='orderedImages' value={typeof img === 'string' ? img : img.url} />)}

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
        <select id='operation' name='operation' className={inputClass} value={operation} onChange={(e) => setOperation(e.target.value)}>
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
          {Array.from(new Set([...labels, property.status || 'active'])).filter(l => l && l !== 'active' && l !== 'NUEVA').map(label => (
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
        <input type='text' id='name' name='name' className={inputClass} defaultValue={property.name} required />
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
      <div className='mb-4 flex flex-wrap gap-3'>
        <div className='flex-1 min-w-[30%]'>
          <label className={labelClass}>Dormitorios</label>
          <input type='number' id='beds' name='beds' className={inputClass} defaultValue={property.beds} />
        </div>
        <div className='flex-1 min-w-[30%]'>
          <label className={labelClass}>Baños</label>
          <input type='number' id='baths' name='baths' className={inputClass} defaultValue={property.baths} />
        </div>
        <div className='flex-1 min-w-[30%]'>
          <label className={labelClass}>Sup. Total (m²)</label>
          <input type='number' id='square_feet' name='square_feet' className={inputClass} defaultValue={property.square_feet} />
        </div>
        {!isLandOrCommercial && (
          <div className='flex-1 min-w-[30%]'>
            <label className={labelClass}>Sup. Cubierta (m²)</label>
            <input type='number' id='covered_area' name='covered_area' className={inputClass} defaultValue={property.covered_area} />
          </div>
        )}
      </div>

      {/* Precio */}
      <div className='mb-6'>
        <label className={labelClass}>Precio de Venta</label>
        <div className='flex gap-2 items-start'>
          <select name='price_currency' className={`${inputClass} !w-[110px] flex-shrink-0`} disabled={operation === 'alquiler'} defaultValue={(() => { const p = property.price || ''; if (p.startsWith('$')) return '$'; if (p.startsWith('ARS')) return 'ARS'; return 'USD'; })()}>
            <option value='USD'>U$D</option>
            <option value='$'>$</option>
            <option value='ARS'>ARS</option>
          </select>
          <div className='flex-1'>
            {operation === 'alquiler' ? (
              <input type='text' name='price' className={`${inputClass} bg-[#222] text-gray-500`} value='Consultar' readOnly />
            ) : (
              <input type='text' name='price' className={inputClass} placeholder='Ej: 502,000' defaultValue={String(property.price || '').replace(/^[A-Z$]+\s*/i, '')} />
            )}
            <p className={helperClass}>
              {operation === 'alquiler' 
                ? 'Para alquileres, el precio se fija en "Consultar".' 
                : 'Ej: 502000 — Escribí solo números. Usá coma para miles. Escribí "Consultar" si no querés publicar el precio.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comodidades */}
      <div className='mb-6'>
        <label className={labelClass}>Comodidades</label>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3 bg-[#181818] border border-[#222] p-4 rounded-lg'>
          {[
            ['Wifi', 'Wifi'],
            ['Free Parking', 'Estacionamiento'],
            ['24/7 Security', 'Seguridad 24hs'],
            ['Balcony/Patio', 'Balcón/Patio'],
            ['Swimming Pool', 'Pileta'],
            ['Hot Tub', 'Hidromasaje'],
            ['Gym/Fitness Center', 'Gimnasio'],
            ['Elevator Access', 'Ascensor'],
            ['Wheelchair Accessible', 'Acceso Discapacitados'],
          ].map(([val, label]) => (
            <div key={val} className="flex items-center gap-2">
              <input type='checkbox' id={`amenity_${val}`} name='amenities' value={val} className='w-4 h-4 accent-[var(--color-brand)] bg-[#111] border-[#333]' defaultChecked={property.amenities?.includes(val)} />
              <label htmlFor={`amenity_${val}`} className="text-white/70 text-sm cursor-pointer">{label}</label>
            </div>
          ))}
        </div>
      </div>


      {/* Imagenes */}
      <div className='mb-8'>
        <label className={labelClass}>Imágenes Existentes (Arrastra para reordenar, la primera será la portada)</label>

        {visibleImages.length > 0 && (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4'>
            {visibleImages.map((img, i) => {
              const imgUrl = typeof img === 'string' ? img : img?.url;
              let labelText = i === 0 ? 'MAIN' : i <= 6 ? `MINI ${i}` : 'GALERÍA';
              let labelColorClass = i === 0 ? 'bg-[var(--color-brand)] text-white' : i <= 6 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white';

              return (
              <div 
                key={imgUrl || i} 
                draggable 
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className={`relative group cursor-move ${draggedIdx === i ? 'opacity-50' : 'opacity-100'}`}
              >
                <Image src={imgUrl} alt={`Imagen ${i + 1}`} width={200} height={150} className='w-full h-32 object-cover rounded-t-lg border-t border-l border-r border-[#333] pointer-events-none' />
                <div className={`text-center text-[10px] font-bold py-1 rounded-b-lg ${labelColorClass}`}>
                  {labelText}
                </div>
                <button type='button' onClick={() => handleRemoveImage(imgUrl)} className='absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow' title='Eliminar imagen'>
                  ×
                </button>
              </div>
              );
            })}
          </div>
        )}

        {removedImages.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {removedImages.map((url) => (
              <span key={url} className='bg-red-900/30 border border-red-800 text-red-500 text-xs px-2 py-1 rounded flex items-center gap-1'>
                Marcada para eliminar
                <button type='button' onClick={() => handleUndoRemove(url)} className='font-bold hover:text-red-400'>↩ Deshacer</button>
              </span>
            ))}
          </div>
        )}

        <label className={labelClass}>Agregar Nuevas Imágenes</label>
        <div className='border-2 border-dashed border-[#333] hover:border-[var(--color-brand)] transition-colors bg-[#111] rounded-lg p-6 text-center'>
          <input type='file' id='new_images' name='images' className='hidden' accept='image/*' multiple onChange={handleNewImageChange} />
          <label htmlFor='new_images' className='cursor-pointer text-[var(--color-brand)] text-sm font-bold flex items-center justify-center gap-2'>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Seleccionar fotos
          </label>
          <p className={helperClass + ' mt-2'}>Las imágenes se comprimirán automáticamente al guardar.</p>
        </div>

        {previewImages.length > 0 && (
          <div className='grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4'>
            {previewImages.map((preview, i) => (
              <div key={i} className='relative'>
                <img src={preview.url} alt={`Nuevo ${i + 1}`} className='w-full h-32 object-cover rounded-lg border border-[var(--color-brand)]' />
                <button type='button' onClick={() => handleRemovePreview(i)} className='absolute top-1 right-1 w-6 h-6 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold' title='Quitar'>
                  ×
                </button>
                <div className='absolute bottom-1 left-1 bg-black text-[var(--color-brand)] font-bold text-[10px] px-2 py-0.5 rounded'>NUEVA</div>
              </div>
            ))}
          </div>
        )}
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
