import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json({ error: 'No search term provided' }, { status: 400 });
    }

    const isBarcode = /^\d+$/.test(q) && q.length >= 8;
    const url = isBarcode
      ? `https://world.openfoodfacts.org/api/v2/product/${q}.json`
      : `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=1`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'SafeSwap/1.0' }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'External API error' }, { status: response.status });
    }

    const data = await response.json();

    let product = null;
    if (isBarcode) {
      product = data.product;
    } else if (data.products && data.products.length > 0) {
      product = data.products[0];
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}