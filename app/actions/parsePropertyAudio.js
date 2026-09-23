'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import connectDB from '@/config/database';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';

export async function parsePropertyAudio(formData) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.userId) {
      return { error: 'No autorizado.' };
    }

    const useVision = formData.get('useVision') === 'true';
    const creditsNeeded = useVision ? 2 : 1;

    const user = await User.findById(sessionUser.userId);
    if (!user || user.ai_credits < creditsNeeded) {
      return { error: `No tienes créditos suficientes. Esta acción requiere ${creditsNeeded} créditos.` };
    }

    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return { error: 'No se encontró un archivo de audio.' };
    }

    // 1. Transcribe the audio using Whisper
    console.log('Transcribing audio...');
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });
    
    const transcribedText = transcription.text;
    console.log('Transcription:', transcribedText);

    // 2. Extract structured data using GPT-4o
    console.log('Extracting data with GPT-4o...');
    let userMessageContent = [
      { type: 'text', text: `Transcripción: "${transcribedText}"` }
    ];

    if (useVision) {
      const imageUrlsStr = formData.get('imageUrls');
      if (imageUrlsStr) {
        const imageUrls = JSON.parse(imageUrlsStr);
        imageUrls.forEach(url => {
          userMessageContent.push({
            type: 'image_url',
            image_url: { url: url }
          });
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente experto inmobiliario. Tu tarea es extraer la información de una propiedad a partir de la transcripción de un agente. Si recibes imágenes, utilízalas para deducir comodidades adicionales (ej. Piscina, Garage, Balcón), estado del inmueble, materiales, y mejorar la redacción de la descripción. Debes devolver la información estrictamente en un JSON válido con la siguiente estructura exacta:
{
  "name": "Un título breve",
  "type": "Tipo de inmueble (ej. Casa)",
  "operation": "venta | alquiler",
  "price": "Valor numérico o Consultar",
  "price_currency": "USD | ARS",
  "location": { "street": "", "city": "", "state": "", "zipcode": "" },
  "beds": 0,
  "baths": 0,
  "covered_area": 0,
  "square_feet": 0,
  "area_unit": "m2 | has",
  "description": "Descripción para la web",
  "amenities": ["Piscina", "Garage"]
}
Si un dato no se menciona ni se infiere de la imagen, déjalo vacío ("" o 0 según corresponda).`
        },
        {
          role: 'user',
          content: userMessageContent
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);
    
    // Deduct credits
    user.ai_credits -= creditsNeeded;
    await user.save();

    return { success: true, data: parsedData, transcription: transcribedText, creditsConsumed: creditsNeeded };

  } catch (error) {
    console.error('Error in parsePropertyAudio:', error);
    return { error: 'Ocurrió un error al procesar el audio con IA. ' + error.message };
  }
}
