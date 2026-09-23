'use client';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import addProperty from '@/app/actions/addProperty';
import { parsePropertyAudio } from '@/app/actions/parsePropertyAudio';
import FullScreenLoader from '@/components/shared/FullScreenLoader';
import { FaMicrophone, FaStop, FaMagic } from 'react-icons/fa';

export default function SmartPropertyAddForm() {
  const router = useRouter();

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // File Upload State
  const [selectedImages, setSelectedImages] = useState([]);

  // Process State
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [cloudinaryImages, setCloudinaryImages] = useState([]);
  const [transcription, setTranscription] = useState('');

  // Submission State
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('No se pudo acceder al micrófono. Por favor, otorga los permisos necesarios.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleProcessAI = async () => {
    if (!audioBlob) {
      toast.warn('Por favor, graba un audio describiendo la propiedad.');
      return;
    }
    if (selectedImages.length === 0) {
      toast.warn('Por favor, selecciona al menos una imagen.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Process Audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const audioPromise = parsePropertyAudio(formData);

      // 2. Upload Images to Cloudinary
      const imageUploadPromises = selectedImages.map(async (file) => {
        const options = { maxSizeMB: 0.6, maxWidthOrHeight: 1600, useWebWorker: false };
        let fileToUpload = file;
        try {
          fileToUpload = await imageCompression(file, options);
        } catch (compressError) {
          console.error('Error compressing image:', compressError);
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        const uploadFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER;

        const uploadData = new FormData();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e5)}-${file.name}`;
        uploadData.append('file', fileToUpload, uniqueName);
        uploadData.append('upload_preset', uploadPreset);
        if (uploadFolder) uploadData.append('folder', uploadFolder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadData
        });

        if (!uploadRes.ok) throw new Error('Fallo al subir imagen a Cloudinary');

        const cloudinaryResult = await uploadRes.json();
        return {
          url: cloudinaryResult.secure_url,
          public_id: cloudinaryResult.public_id
        };
      });

      // Run both in parallel
      const [audioResult, uploadedImages] = await Promise.all([
        audioPromise,
        Promise.all(imageUploadPromises)
      ]);

      if (audioResult.error) {
        throw new Error(audioResult.error);
      }

      setTranscription(audioResult.transcription);
      setParsedData(audioResult.data);
      setCloudinaryImages(uploadedImages);
      toast.success('¡Propiedad analizada con éxito!');

    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al procesar la propiedad.');
      toast.error(err.message || 'Error al procesar la propiedad');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Append the already uploaded images
      cloudinaryImages.forEach(img => {
        formData.append('uploadedImages', JSON.stringify(img));
      });

      const result = await addProperty({}, formData);

      if (result?.error) {
        throw new Error(result.error);
      } else if (result?.success) {
        setIsSuccess(true);
        toast.success('¡Propiedad creada exitosamente!');
        setTimeout(() => {
          router.push(result.redirected || '/admin/properties');
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const inputClass = 'bg-[#111] border border-[#333] text-white rounded w-full py-2 px-3 focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-colors';
  const labelClass = 'block text-white/80 font-bold mb-2 text-sm';
  const helperClass = 'text-[11px] text-gray-400 mt-1';

  // State 1: Input
  if (!parsedData) {
    return (
      <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-6 md:p-8 rounded-xl shadow-xl border border-[#333]">
        <h2 className='text-[28px] md:text-3xl text-center font-normal mb-8 text-white' style={{ fontFamily: 'var(--font-heading)' }}>
          Carga Inteligente con IA
        </h2>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6">{error}</div>}

        <div className="space-y-8">
          {/* Audio Section */}
          <div className="bg-[#111] p-6 rounded-lg border border-[#333] text-center">
            <h3 className="text-white font-bold mb-2">1. Describe la propiedad</h3>
            <p className={helperClass + " mb-6"}>Graba un audio mencionando el título, precio, ubicación, comodidades y detalles del inmueble.</p>
            
            <div className="flex justify-center items-center gap-4">
              {!isRecording ? (
                <button 
                  type="button" 
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white flex items-center justify-center transition-all shadow-lg hover:shadow-[var(--color-brand)]/50"
                >
                  <FaMicrophone size={24} />
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all animate-pulse shadow-lg shadow-red-500/50"
                >
                  <FaStop size={24} />
                </button>
              )}
            </div>
            
            {isRecording && <p className="text-red-400 text-sm mt-4 font-medium animate-pulse">Grabando...</p>}
            
            {audioUrl && !isRecording && (
              <div className="mt-6">
                <audio src={audioUrl} controls className="w-full h-10 max-w-sm mx-auto rounded-md" />
                <button type="button" onClick={() => {setAudioBlob(null); setAudioUrl(null);}} className="text-xs text-red-400 mt-2 hover:underline">Eliminar grabación</button>
              </div>
            )}
          </div>

          {/* Images Section */}
          <div className="bg-[#111] p-6 rounded-lg border border-[#333]">
            <h3 className="text-white font-bold mb-2 text-center">2. Selecciona las fotos</h3>
            <div className="border-2 border-dashed border-[#444] hover:border-[var(--color-brand)] transition-colors rounded-lg p-6 text-center mt-4 cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-gray-400 text-sm font-medium">
                {selectedImages.length > 0 ? (
                  <span className="text-[var(--color-brand)] font-bold">{selectedImages.length} imagen(es) seleccionada(s)</span>
                ) : (
                  "Toca aquí para seleccionar imágenes"
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleProcessAI}
            disabled={isProcessing || !audioBlob || selectedImages.length === 0}
            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              isProcessing || !audioBlob || selectedImages.length === 0 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white shadow-lg shadow-[var(--color-brand)]/20 hover:scale-[1.02]'
            }`}
          >
            {isProcessing ? (
              <>Procesando con IA (puede tardar un minuto)...</>
            ) : (
              <><FaMagic /> Extraer y Crear Propiedad</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // State 2: Review and Submit
  return (
    <div className="max-w-4xl mx-auto bg-[#1a1a1a] p-6 md:p-8 rounded-xl shadow-xl border border-[#333]">
      <h2 className='text-[28px] md:text-3xl text-center font-normal mb-2 text-white' style={{ fontFamily: 'var(--font-heading)' }}>
        Revisar Propiedad
      </h2>
      <p className="text-center text-gray-400 mb-8 text-sm">
        La IA extrajo estos datos. Revísalos y presiona "Guardar" al final.
      </p>

      <FullScreenLoader isUploading={isUploading} isSuccess={isSuccess} error={error} onCloseError={() => setError(null)} />

      <form onSubmit={handleFinalSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Basicos */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Título</label>
              <input type="text" name="name" defaultValue={parsedData.name} className={inputClass} required />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelClass}>Operación</label>
                <select name="operation" defaultValue={parsedData.operation} className={inputClass}>
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Tipo</label>
                <input type="text" name="type" defaultValue={parsedData.type} className={inputClass} required />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className={labelClass}>Moneda</label>
                <select name="price_currency" defaultValue={parsedData.price_currency} className={inputClass}>
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                  <option value="$">$</option>
                </select>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Precio</label>
                <input type="text" name="price" defaultValue={parsedData.price} className={inputClass} required />
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelClass}>Dormitorios</label>
                <input type="number" name="beds" defaultValue={parsedData.beds} className={inputClass} />
              </div>
              <div className="flex-1">
                <label className={labelClass}>Baños</label>
                <input type="number" name="baths" defaultValue={parsedData.baths} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={labelClass}>Sup. Total</label>
                <input type="number" name="square_feet" defaultValue={parsedData.square_feet} className={inputClass} required />
              </div>
              <div className="w-1/3">
                <label className={labelClass}>Unidad</label>
                <select name="area_unit" defaultValue={parsedData.area_unit} className={inputClass}>
                  <option value="m2">m2</option>
                  <option value="has">has</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Sup. Cubierta (m2)</label>
              <input type="number" name="covered_area" defaultValue={parsedData.covered_area} className={inputClass} />
            </div>
          </div>
          
          {/* Ubicacion */}
          <div className="space-y-4 md:col-span-2 bg-[#111] p-4 rounded-lg border border-[#333]">
            <h4 className="text-white font-bold mb-2">Ubicación</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <input type="text" name="location.street" defaultValue={parsedData.location?.street} placeholder="Calle" className={inputClass} />
              </div>
              <div>
                <input type="text" name="location.city" defaultValue={parsedData.location?.city} placeholder="Ciudad" className={inputClass} required />
              </div>
              <div>
                <input type="text" name="location.state" defaultValue={parsedData.location?.state} placeholder="Provincia" className={inputClass} required />
              </div>
            </div>
          </div>

          {/* Descripcion */}
          <div className="md:col-span-2">
            <label className={labelClass}>Descripción (Redactada por IA)</label>
            <textarea name="description" defaultValue={parsedData.description} rows="6" className={inputClass} required></textarea>
            <details className="mt-2 text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-300">Ver transcripción original</summary>
              <div className="mt-2 p-3 bg-[#0a0a0a] rounded border border-[#222]">
                "{transcription}"
              </div>
            </details>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex gap-4">
          <button 
            type="button" 
            onClick={() => setParsedData(null)}
            className="px-6 py-3 border border-[#444] text-white rounded-lg hover:bg-[#222] transition-colors"
          >
            Volver
          </button>
          <button 
            type="submit"
            className="flex-1 py-3 bg-[var(--color-brand)] text-white font-bold rounded-lg hover:bg-[var(--color-brand-dark)] transition-colors shadow-lg shadow-[var(--color-brand)]/20"
          >
            Guardar Propiedad Definitivamente
          </button>
        </div>
      </form>
    </div>
  );
}
