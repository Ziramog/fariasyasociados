export function parsePrice(priceStr) {
  if (!priceStr) return { currency: 'USD', symbol: 'U$D', numericPrice: null };
  
  const rawString = String(priceStr).toUpperCase().trim();
  
  // Extract numbers (support Argentine dots and commas without breaking thousands comma)
  const cleaned = rawString.replace(/[.,]00$/, '').replace(/[^0-9]/g, '');
  const numericPrice = cleaned ? parseFloat(cleaned) : null;
  
  // Determine currency
  let currency = 'USD';
  let symbol = 'U$D';
  
  if (rawString.startsWith('ARS') || rawString.startsWith('$ ') || rawString.startsWith('$')) {
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
