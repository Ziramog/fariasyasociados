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

    const user = await User.findById(sessionUser.userId);
    if (!user || user.ai_credits <= 0) {
      return { error: 'No tienes créditos suficientes para procesar la propiedad.' };
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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto inmobiliario. Tu tarea es extraer la información de una propiedad a partir de la transcripción de un agente. Debes devolver la información estrictamente en el formato JSON requerido.'
        },
        {
          role: 'user',
          content: `Transcripción: "${transcribedText}"`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "property_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Un título breve y atractivo para la propiedad (ej. Hermosa Casa en Zona Norte)." },
              type: { type: "string", description: "Tipo de inmueble (ej. Casa, Departamento, Lote, Local, Oficina)." },
              operation: { type: "string", enum: ["compra", "venta", "alquiler"], description: "El tipo de operación." },
              price: { type: "string", description: "El valor numérico del precio o la palabra 'Consultar' (ej. 150000 o 250000)." },
              price_currency: { type: "string", enum: ["USD", "ARS"], description: "La moneda del precio." },
              location: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  zipcode: { type: "string" }
                },
                required: ["street", "city", "state", "zipcode"],
                additionalProperties: false
              },
              beds: { type: "number", description: "Cantidad de habitaciones." },
              baths: { type: "number", description: "Cantidad de baños." },
              covered_area: { type: "number", description: "Metros cuadrados cubiertos." },
              square_feet: { type: "number", description: "Metros cuadrados o hectáreas totales." },
              area_unit: { type: "string", enum: ["m2", "has"], description: "Unidad de medida del terreno total." },
              description: { type: "string", description: "Una descripción completa y atractiva de la propiedad, redactada para la web, usando saltos de línea donde sea necesario." },
              amenities: {
                type: "array",
                items: { type: "string" },
                description: "Lista de amenidades (ej. Piscina, Garage, Quincho, Balcón)."
              }
            },
            required: ["name", "type", "operation", "price", "price_currency", "location", "beds", "baths", "covered_area", "square_feet", "area_unit", "description", "amenities"],
            additionalProperties: false
          }
        }
      },
      temperature: 0.2,
    });

    const parsedData = JSON.parse(completion.choices[0].message.content);
    
    // Deduct 1 credit
    user.ai_credits -= 1;
    await user.save();

    return { success: true, data: parsedData, transcription: transcribedText };

  } catch (error) {
    console.error('Error in parsePropertyAudio:', error);
    return { error: 'Ocurrió un error al procesar el audio con IA. ' + error.message };
  }
}
