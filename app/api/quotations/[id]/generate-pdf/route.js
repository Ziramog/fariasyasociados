import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectDB from '@/config/database';
import Quotation from '@/models/Quotation';
import SiteConfig from '@/models/SiteConfig';
import User from '@/models/User';
import { renderQuotationPDF } from '@/lib/quotations/pdf/renderer';

export const dynamic = 'force-dynamic';

function getDefaultLogoBase64() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'images', 'farias-logo-placeholder.png');
    const buffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.log('[generate-pdf] Logo fallback failed:', e.message);
    return null;
  }
}

async function generatePDF(quotationId) {
  await connectDB();
  const quotation = await Quotation.findById(quotationId).lean();
  if (!quotation) {
    return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
  }

  const config = await SiteConfig.findOne({}).lean();

  // Find creator user for agent name
  let agentName = 'Farias & Asociados';
  try {
    const creator = await User.findById(quotation.createdBy).lean();
    if (creator) {
      agentName = creator.agentName || creator.username || 'Farias & Asociados';
    }
  } catch (e) {
    console.log('[generate-pdf] Could not fetch creator user:', e.message);
  }

  const branding = {
    name: agentName,
    logoUrl: config?.logoUrl || getDefaultLogoBase64(),
    signatureBase64: config?.signatureBase64 || null,
  };

  let pdfBuffer;
  try {
    pdfBuffer = await renderQuotationPDF(quotation, branding);
  } catch (renderErr) {
    console.error('[generate-pdf] Render with custom fonts failed:', renderErr.message);
    // Retry with Helvetica-only (no custom font registration required)
    try {
      console.log('[generate-pdf] Retrying with Helvetica fallback...');
      pdfBuffer = await renderQuotationPDF(quotation, branding, true);
    } catch (e2) {
      console.error('[generate-pdf] Helvetica fallback also failed:', e2);
      return NextResponse.json({ error: 'Error al renderizar PDF: ' + e2.message }, { status: 500 });
    }
  }

  // Try to save to Vercel Blob if token is set
  let pdfUrl = null;
  try {
    const { put } = await import('@vercel/blob');
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const prefix = process.env.BLOB_PREFIX ? `${process.env.BLOB_PREFIX.replace(/\/$/, '')}/` : '';
      const blob = await put(`${prefix}quotations/propuesta-${quotation.quoteNumber}.pdf`, pdfBuffer, {
        contentType: 'application/pdf',
        access: 'public',
      });
      pdfUrl = blob.url;
    }
  } catch (blobError) {
    console.log('[generate-pdf] Blob upload skipped:', blobError.message);
  }

  // Update delivery record
  const update = { 'delivery.pdfGeneratedAt': new Date() };
  if (pdfUrl) update['delivery.pdfUrl'] = pdfUrl;
  await Quotation.findByIdAndUpdate(quotationId, { $set: update });

  // If saved to blob, redirect to the permanent URL
  if (pdfUrl) {
    return NextResponse.redirect(pdfUrl, 302);
  }

  // Fallback: return inline PDF
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="propuesta-${quotation.quoteNumber}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  });
}

export async function POST(request, { params }) {
  try {
    return await generatePDF(params.id);
  } catch (err) {
    console.error('[generate-pdf] Error:', err);
    return NextResponse.json({ error: err.message || 'Error al generar PDF' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    return await generatePDF(params.id);
  } catch (err) {
    console.error('[generate-pdf] Error:', err);
    return NextResponse.json({ error: err.message || 'Error al generar PDF' }, { status: 500 });
  }
}