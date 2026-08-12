import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { fontsLoaded } from '../fonts';

const BODY = fontsLoaded ? 'Lato' : 'Helvetica';
const HEADING = fontsLoaded ? 'PT Serif' : 'Helvetica';

const BRAND = '#f26b2e';
const INK = '#1a1a18';
const INK2 = '#4b4b48';
const INK3 = '#8c8c88';
const BORDER = '#e8e6e0';
const WHITE = '#ffffff';
const BLACK = '#000000';
const MUTED = '#b8b8b8';

const PAD_X = 24;

const STATUS_COLORS = {
  'NUEVA': { bg: '#22C55E', text: WHITE },
  'PRECIO MEJORADO': { bg: '#F59E0B', text: WHITE },
  'ULTIMA UNIDAD': { bg: '#EF4444', text: WHITE },
  'UNICO EN SU TIPO': { bg: '#8B5CF6', text: WHITE },
  'MEJOR PRECIO': { bg: '#10B981', text: WHITE },
};

const s = StyleSheet.create({
  page: { fontFamily: BODY, backgroundColor: WHITE, padding: 0, fontSize: 9, color: INK2, lineHeight: 1.5 },

  // ── Compact Black Header ──
  headerBar: { backgroundColor: BLACK, paddingTop: 12, paddingBottom: 12, paddingLeft: PAD_X, paddingRight: PAD_X, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogoImg: { width: 64, height: 64, objectFit: 'contain', marginRight: 10 },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: { fontFamily: HEADING, fontSize: 14, fontWeight: 700, color: WHITE, lineHeight: 1.2, textAlign: 'right' },
  headerPrice: { fontFamily: BODY, fontSize: 12, fontWeight: 700, color: WHITE, marginTop: 2, textAlign: 'right' },

  // ── Client Bar ──
  clientBar: { paddingTop: 8, paddingBottom: 8, paddingLeft: PAD_X, paddingRight: PAD_X, borderBottom: `0.5 solid ${BORDER}`, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientLabel: { fontFamily: BODY, fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: INK3 },
  clientValue: { fontFamily: BODY, fontSize: 9, fontWeight: 600, color: INK, marginTop: 1 },
  clientMeta: { fontFamily: BODY, fontSize: 8, color: INK3 },

  // ── Photo Row ──
  photoRow: { flexDirection: 'row', height: 130, borderBottom: `0.5 solid ${BORDER}` },
  photoCell: { width: '25%', height: 130 },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  photoEmpty: { width: '25%', height: 130, backgroundColor: '#111' },

  // ── Two-Column Section ──
  twoColSection: { flexDirection: 'row', paddingTop: 16, paddingBottom: 12, paddingLeft: PAD_X, paddingRight: PAD_X, flex: 1 },
  leftCol: { width: '42%', paddingRight: 14 },
  rightCol: { width: '58%', paddingLeft: 14, borderLeft: `0.5 solid ${BORDER}` },

  // Section heading
  sectionHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontFamily: HEADING, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: INK },
  brandBar: { width: 40, height: 2.5, backgroundColor: BRAND, marginLeft: 8 },

  // Feature items: label on top, value below
  featureRow: { paddingVertical: 5, borderBottom: `0.5 solid ${BORDER}` },
  featureLabel: { fontFamily: BODY, fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: INK3, marginBottom: 2 },
  featureValue: { fontFamily: BODY, fontSize: 10, fontWeight: 700, color: INK },
  statusPill: { borderRadius: 3, paddingTop: 2, paddingBottom: 2, paddingLeft: 6, paddingRight: 6, alignSelf: 'flex-start', marginTop: 3 },
  statusPillText: { fontFamily: BODY, fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Price table with dotted lines (manual dots for reliability)
  priceRow: { flexDirection: 'row', alignItems: 'baseline', paddingVertical: 4, marginBottom: 1 },
  priceLabel: { fontFamily: BODY, fontSize: 8.5, fontWeight: 400, color: INK2, width: '42%' },
  priceDots: { fontFamily: BODY, fontSize: 8, color: INK3, flex: 1, textAlign: 'center', letterSpacing: 2 },
  priceValue: { fontFamily: BODY, fontSize: 9, fontWeight: 700, color: INK, textAlign: 'right', minWidth: 80 },
  priceValueLarge: { fontFamily: BODY, fontSize: 11, fontWeight: 700, color: INK, textAlign: 'right', minWidth: 80 },

  totalBox: { backgroundColor: INK, borderRadius: 4, paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12, marginTop: 14, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: BODY, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.7)' },
  totalValue: { fontFamily: BODY, fontSize: 12, fontWeight: 700, color: WHITE },

  contadoBox: { border: `0.5 solid ${BORDER}`, borderRadius: 4, padding: 10, marginTop: 4, marginBottom: 8 },
  contadoLabel: { fontFamily: BODY, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: INK3, marginBottom: 4 },
  contadoValue: { fontFamily: HEADING, fontSize: 14, fontWeight: 700, color: INK },

  // Notes
  notesSection: { paddingTop: 6, paddingBottom: 8, paddingLeft: PAD_X, paddingRight: PAD_X, borderTop: `0.5 solid ${BORDER}` },
  notesText: { fontFamily: BODY, fontSize: 8.5, color: INK2, lineHeight: 1.5 },

  // Signature
  signatureSection: { paddingTop: 8, paddingBottom: 14, paddingLeft: PAD_X, paddingRight: PAD_X },
  signatureBlock: { alignItems: 'center' },
  signatureImg: { height: 28, maxWidth: 120, objectFit: 'contain', marginBottom: 3 },
  signatureName: { fontFamily: BODY, fontSize: 9, fontWeight: 700, color: INK, textAlign: 'center' },
  signatureAgency: { fontFamily: BODY, fontSize: 7.5, fontWeight: 700, color: INK3, textAlign: 'center', marginTop: 1 },
  signatureQuote: { fontFamily: BODY, fontSize: 7.5, color: INK3, textAlign: 'center', marginTop: 1 },
});

function fmt(n) { return n?.toLocaleString('es-AR') || '0'; }

function opLabel(op) {
  if (op === 'venta') return 'Venta';
  if (op === 'alquiler') return 'Alquiler';
  return op || '';
}

function todayShort() {
  return new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

function SectionHeading({ title }) {
  return (
    <View style={s.sectionHeading}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.brandBar} />
    </View>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_COLORS[status];
  if (!cfg) return null;
  return (
    <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
      <Text style={[s.statusPillText, { color: cfg.text }]}>
        {status === 'NUEVA' ? 'Nueva' : status === 'PRECIO MEJORADO' ? 'Precio Mejorado' : status === 'ULTIMA UNIDAD' ? 'Última Unidad' : 'Único en su Tipo'}
      </Text>
    </View>
  );
}

// ── Price Row with manual dotted line ──
function PriceRow({ label, value, large = false }) {
  return (
    <View style={s.priceRow}>
      <Text style={s.priceLabel}>{label}</Text>
      <Text style={s.priceDots}>· · · · · · · · · · · · · · · · · · · · · · · · ·</Text>
      <Text style={large ? s.priceValueLarge : s.priceValue}>{value}</Text>
    </View>
  );
}

export function ModernTemplate({ quotation, branding = {} }) {
  const prop = quotation.properties?.[0] || {};
  const pay = quotation.payment || {};
  const hasLogo = !!branding.logoUrl;
  const hasSignature = !!branding.signatureBase64;
  const isFinanced = pay?.type === 'financiado';
  const photos = prop?.photos || [];

  const photo1 = photos[0];
  const photo2 = photos[1];
  const photo3 = photos[2];
  const photo4 = photos[3];

  return (
    <Document title={`Propuesta ${quotation.quoteNumber}`} author={branding.name || 'Farias & Asociados'}>
      <Page size="A4" style={s.page}>

        {/* ═════ HEADER ═════ */}
        <View style={s.headerBar}>
          <View style={s.headerLeft}>
            {hasLogo ? (
              <Image style={s.headerLogoImg} src={branding.logoUrl} />
            ) : null}
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerTitle}>{prop?.title || ''}</Text>
          </View>
        </View>

        {/* ═════ CLIENT BAR ═════ */}
        <View style={s.clientBar}>
          <View>
            <Text style={s.clientLabel}>Preparado para</Text>
            <Text style={s.clientValue}>{quotation.client?.name || ''}</Text>
          </View>
          <Text style={s.clientMeta}>Propuesta N° {quotation.quoteNumber} · {todayShort()}</Text>
        </View>

        {/* ═════ 4 PHOTOS ═════ */}
        <View style={s.photoRow}>
          {photo1 ? (
            <View style={s.photoCell}>
              <Image style={s.photoImg} src={photo1} />
            </View>
          ) : <View style={s.photoEmpty} />}
          {photo2 ? (
            <View style={s.photoCell}>
              <Image style={s.photoImg} src={photo2} />
            </View>
          ) : <View style={s.photoEmpty} />}
          {photo3 ? (
            <View style={s.photoCell}>
              <Image style={s.photoImg} src={photo3} />
            </View>
          ) : <View style={s.photoEmpty} />}
          {photo4 ? (
            <View style={s.photoCell}>
              <Image style={s.photoImg} src={photo4} />
            </View>
          ) : <View style={s.photoEmpty} />}
        </View>

        {/* ═════ INTRO TEXT (AI Description) ═════ */}
        {quotation.customization?.aiDescription && (
           <View style={{ paddingTop: 16, paddingBottom: 4, paddingLeft: PAD_X, paddingRight: PAD_X }}>
             <Text style={{ fontFamily: BODY, fontSize: 10, color: INK, lineHeight: 1.5 }}>{quotation.customization.aiDescription}</Text>
           </View>
        )}

        {/* ═════ TWO-COLUMN: CARACTERÍSTICAS + PRECIO ═════ */}
        <View style={s.twoColSection}>

          {/* LEFT: Características */}
          <View style={s.leftCol}>
            <SectionHeading title="Características" />

            <View style={s.featureRow}>
              <Text style={s.featureLabel}>Tipo</Text>
              <Text style={s.featureValue}>{prop?.type || '—'}</Text>
            </View>

            <View style={s.featureRow}>
              <Text style={s.featureLabel}>Operación</Text>
              <Text style={s.featureValue}>{opLabel(prop?.operation)}</Text>
            </View>

            {prop?.bedrooms != null && (
              <View style={s.featureRow}>
                <Text style={s.featureLabel}>Dormitorios</Text>
                <Text style={s.featureValue}>{prop.bedrooms}</Text>
              </View>
            )}

            {prop?.bathrooms != null && (
              <View style={s.featureRow}>
                <Text style={s.featureLabel}>Baños</Text>
                <Text style={s.featureValue}>{prop.bathrooms}</Text>
              </View>
            )}

            {prop?.surface != null && (
              <View style={s.featureRow}>
                <Text style={s.featureLabel}>Área Total</Text>
                <Text style={s.featureValue}>{fmt(prop.surface)} m²</Text>
              </View>
            )}

            {prop?.garage != null && (
              <View style={s.featureRow}>
                <Text style={s.featureLabel}>Cochera</Text>
                <Text style={s.featureValue}>{prop.garage} {prop.garage === 1 ? 'lugar' : 'lugares'}</Text>
              </View>
            )}

            {prop?.coveredArea != null && (
              <View style={s.featureRow}>
                <Text style={s.featureLabel}>Sup. Cubierta</Text>
                <Text style={s.featureValue}>{fmt(prop.coveredArea)} m²</Text>
              </View>
            )}

            {prop?.address && (
              <View style={s.featureRow}>
                <Text style={s.featureLabel}>Ubicación</Text>
                <Text style={s.featureValue}>{prop.address}</Text>
              </View>
            )}
          </View>

          {/* RIGHT: Detalle de Precio */}
          <View style={s.rightCol}>
            <SectionHeading title="Detalle de Precio" />

            {isFinanced ? (
              <>
                <PriceRow label="Precio Total" value={`U$D ${fmt(quotation.totalValue)}`} large />

                {pay?.downPayment > 0 && (
                  <PriceRow label={`Seña / Anticipo (${pay.downPaymentPct}%)`} value={`U$D ${fmt(pay.downPayment)}`} />
                )}

                {pay?.installments > 0 && (
                  <PriceRow label={`${pay.installments} Cuotas de`} value={`U$D ${fmt(pay.installmentAmount)}`} />
                )}

                {pay?.interestRate > 0 && (
                  <PriceRow label="Tasa de Interés" value={`${pay.interestRate}% anual`} />
                )}

                {pay?.totalInterest > 0 && (
                  <PriceRow label="Intereses Totales" value={`U$D ${fmt(pay.totalInterest)}`} />
                )}

                {pay?.totalPaid > 0 && (
                  <View style={s.totalBox}>
                    <Text style={s.totalLabel}>Total Financiado</Text>
                    <Text style={s.totalValue}>U$D {fmt(pay.totalPaid)}</Text>
                  </View>
                )}

                {!pay?.totalPaid && (
                  <View style={s.totalBox}>
                    <Text style={s.totalLabel}>Valor Total</Text>
                    <Text style={s.totalValue}>U$D {fmt(quotation.totalValue)}</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={s.contadoBox}>
                  <Text style={s.contadoLabel}>Pago de Contado</Text>
                  <Text style={s.contadoValue}>U$D {fmt(quotation.totalValue)}</Text>
                </View>
              </>
            )}

            {/* Notas de cotización (dentro de la columna de precio) */}
            {pay?.notes && (
              <View style={{ marginTop: 10, paddingTop: 8, borderTop: `0.5 solid ${BORDER}` }}>
                <Text style={{ fontFamily: BODY, fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: INK3, marginBottom: 3 }}>Notas de cotización</Text>
                <Text style={{ fontFamily: BODY, fontSize: 8.5, color: INK2, lineHeight: 1.5 }}>{pay.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ═════ SIGNATURE (centered) ═════ */}
        {hasSignature && (
          <View style={s.signatureSection}>
            <View style={s.signatureBlock}>
              <Image style={s.signatureImg} src={branding.signatureBase64} />
              <Text style={s.signatureName}>{branding.name}</Text>
              <Text style={{ ...s.signatureAgency, marginTop: 4 }}>Farias & Asociados</Text>
              <Text style={s.signatureAgency}>NEGOCIOS INMOBILIARIOS</Text>
              <Text style={s.signatureQuote}>Propuesta N° {quotation.quoteNumber}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
