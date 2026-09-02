import { ImageResponse } from 'next/og';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getAreaDisplay } from '@/utils/propertyDisplay';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── helpers ────────────────────────────────────────────
const STATUS_MAP = {
  'PRECIO MEJORADO': 'Precio Mejorado',
  'ULTIMA UNIDAD': 'Última Unidad',
  'UNICO EN SU TIPO': 'Única en su Tipo',
  'MEJOR PRECIO': 'Mejor Precio del Mercado',
  'NUEVA': 'Nueva',
  'EXCELENTE PRECIO': 'Excelente Precio',
  'AMOBLADA': 'Amoblada',
};

function getOperationLabel(op) {
  if (op === 'venta') return 'Venta';
  if (op === 'alquiler') return 'Alquiler';
  if (op === 'compra') return 'Compra';
  return '';
}

// ── SVG icons as JSX (satori can't load external SVGs) ──
function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#e8731a" strokeWidth="1.5" style={{ marginRight: 10, flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.5" style={{ marginRight: 12 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5Z" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.5" style={{ marginRight: 12 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.5" style={{ marginRight: 12 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

// ── route handler ──────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id } = params;

    await connectDB();
    const property = await Property.findById(id).lean();
    if (!property) {
      return new Response('Propiedad no encontrada', { status: 404 });
    }

    const imageUrl = property.images?.[0]?.url || '';
    const price = property.price || 'Consultar';
    const op = (property.operation || 'venta').toUpperCase();
    const title = property.name || '';
    const city = property.location?.city || '';
    const street = property.location?.street || '';
    const state = property.location?.state || '';
    const displayArea = getAreaDisplay(property);
    const operationLabel = getOperationLabel(property.operation);
    const statusLabel = STATUS_MAP[property.status] || '';

    // Build location string
    const locationParts = [street, city, state].filter(Boolean);
    const location = locationParts.join(', ');

    // Fetch the logo from disk as base64
    let logoSrc = '';
    try {
      const logoPath = join(process.cwd(), 'public', 'images', 'logo_only.png');
      const logoBuffer = readFileSync(logoPath);
      logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (e) {
      console.error('Could not read logo:', e.message);
    }

    // Fetch font from Google Fonts
    const fontUrl = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff';
    const fontBoldUrl = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff';
    
    const [fontData, fontBoldData] = await Promise.all([
      fetch(fontUrl).then(r => r.arrayBuffer()),
      fetch(fontBoldUrl).then(r => r.arrayBuffer()),
    ]);

    return new ImageResponse(
      (
        <div style={{
          width: 1080,
          height: 1920,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1080,
                height: 1920,
                objectFit: 'cover',
              }}
            />
          )}

          {/* Top bar: Logo + Operation badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: 70,
            position: 'relative',
          }}>
            {/* Logo */}
            {logoSrc && (
              <img src={logoSrc} alt="Logo" style={{ width: 320, height: 320 }} />
            )}

            {/* Operation badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#e8731a',
              color: '#fff',
              fontSize: 42,
              fontWeight: 900,
              fontFamily: 'Inter',
              textTransform: 'uppercase',
              letterSpacing: 5,
              paddingLeft: 36,
              paddingRight: 36,
              height: 80,
              borderRadius: 20,
              border: '3px solid rgba(255,255,255,0.35)',
            }}>
              {op}
            </div>
          </div>

          {/* Spacer to push bottom section down */}
          <div style={{ display: 'flex', flex: 1 }} />

          {/* Bottom info section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.92)',
            paddingLeft: 60,
            paddingRight: 60,
            paddingTop: 50,
            paddingBottom: 50,
          }}>
            {/* Title */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              fontSize: 50,
              lineHeight: 1.2,
              fontWeight: 400,
              fontFamily: 'Inter',
              color: '#fff',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              {title}
            </div>

            {/* Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 25,
              color: '#b8b8b8',
              fontFamily: 'Inter',
              marginBottom: 35,
            }}>
              <PinIcon />
              <span>{location}</span>
            </div>

            {/* Price */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              fontSize: 78,
              fontWeight: 700,
              fontFamily: 'Inter',
              color: '#fff',
              lineHeight: 1,
              marginBottom: 18,
            }}>
              {price}
            </div>

            {/* Bottom row: amenities + operation/status */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              width: '100%',
            }}>
              {/* Amenities */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {property.beds > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontFamily: 'Inter', color: '#fff', marginRight: 30 }}>
                    <BedIcon />
                    <span>{property.beds}</span>
                  </div>
                )}
                {property.baths > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontFamily: 'Inter', color: '#fff', marginRight: 30 }}>
                    <BathIcon />
                    <span>{property.baths}</span>
                  </div>
                )}
                {displayArea && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontFamily: 'Inter', color: '#fff' }}>
                    <AreaIcon />
                    <span>{displayArea}</span>
                  </div>
                )}
              </div>

              {/* Operation & Status labels */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {operationLabel && (
                  <div style={{ fontSize: 22, color: '#b8b8b8', fontFamily: 'Inter' }}>
                    Operación <span style={{ color: '#fff', fontWeight: 700 }}>{operationLabel}</span>
                  </div>
                )}
                {statusLabel && (
                  <div style={{ fontSize: 22, color: '#b8b8b8', fontFamily: 'Inter' }}>
                    Estado <span style={{ color: '#fff', fontWeight: 700 }}>{statusLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
        fonts: [
          { name: 'Inter', data: fontData, weight: 400, style: 'normal' },
          { name: 'Inter', data: fontBoldData, weight: 700, style: 'normal' },
        ],
      }
    );
  } catch (error) {
    console.error('[generate-story] Error:', error);
    return new Response(`Error generando imagen: ${error.message}`, { status: 500 });
  }
}
