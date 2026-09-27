export function parsePrice(priceStr) {
  if (!priceStr) return { currency: 'USD', symbol: 'U$D', numericPrice: null };
  
  const rawString = String(priceStr).toUpperCase().trim();
  
  // Extract numbers (support Argentine dots and commas)
  const numericString = rawString.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
  const numericPrice = numericString ? parseFloat(numericString) : null;
  
  // Determine currency
  let currency = 'USD';
  let symbol = 'U$D';
  
  if (rawString.startsWith('ARS') || rawString.startsWith('$ ') || rawString === '$' + numericString) {
    currency = 'ARS';
    symbol = '$';
  } else if (rawString.startsWith('USD') || rawString.startsWith('U$D')) {
    currency = 'USD';
    symbol = 'U$D';
  }

  return { currency, symbol, numericPrice };
}

export function formatPriceDisplay(priceStr) {
  const { symbol, numericPrice } = parsePrice(priceStr);
  if (!numericPrice) return 'Consultar';
  return `${symbol} ${numericPrice.toLocaleString('es-AR')}`;
}
