export function parsePrice(priceStr) {
  if (!priceStr) return { currency: 'USD', symbol: 'U$D', numericPrice: null };

  const rawString = String(priceStr).toUpperCase().trim();
  if (rawString.includes('CONSULTAR')) {
    return { currency: 'USD', symbol: 'U$D', numericPrice: null };
  }

  // Extract numbers (support Argentine dots and commas without breaking thousands comma)
  const cleaned = rawString.replace(/[.,]00$/, '').replace(/[^0-9]/g, '');
  const numericPrice = cleaned ? parseFloat(cleaned) : null;

  // Determine currency
  let currency = 'USD';
  let symbol = 'U$D';

  if (rawString.startsWith('ARS') || rawString.startsWith('$')) {
    currency = 'ARS';
    symbol = '$';
  } else if (rawString.startsWith('USD') || rawString.startsWith('U$D')) {
    currency = 'USD';
    symbol = 'U$D';
  }

  return { currency, symbol, numericPrice };
}

export function formatPriceDisplay(priceStr, operation = null) {
  const { symbol, numericPrice } = parsePrice(priceStr);
  if (!numericPrice) return 'Consultar';
  const suffix = operation && String(operation).toLowerCase() === 'alquiler' ? '/mes' : '';
  return `${symbol} ${numericPrice.toLocaleString('es-AR')}${suffix}`;
}

export function normalizePriceValue(rawPrice, currency) {
  const trimmed = String(rawPrice || '').trim();
  if (!trimmed || /^consultar$/i.test(trimmed)) return 'Consultar';
  const cleanedDigits = trimmed.replace(/[.,]00$/, '').replace(/[^0-9]/g, '');
  if (!cleanedDigits) return 'Consultar';
  const safeCurrency = currency === 'ARS' ? 'ARS' : 'USD';
  return `${safeCurrency} ${cleanedDigits}`;
}
