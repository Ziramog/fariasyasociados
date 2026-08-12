import { renderToBuffer } from '@react-pdf/renderer';
import { ModernTemplate } from './templates/modern';

export async function renderQuotationPDF(quotation, branding = {}, forceHelvetica = false) {
  const pdfBuffer = await renderToBuffer(
    <ModernTemplate quotation={quotation} branding={branding} forceHelvetica={forceHelvetica} />
  );

  return Buffer.from(pdfBuffer);
}
