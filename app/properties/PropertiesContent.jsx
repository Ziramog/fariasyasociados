import FeaturedPropertyCard from '@/components/FeaturedPropertyCard';
import Pagination from '@/components/Pagination';
import SortBar from '@/components/shared/SortBar';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SectionTitle from '@/components/shared/SectionTitle';
import connectDB from '@/config/database';
import Property from '@/models/Property';
import User from '@/models/User';
import CategoryMap from '@/components/CategoryMap';
import MapErrorBoundary from '@/components/shared/MapErrorBoundary';
import { getSessionUser } from '@/utils/getSessionUser';
import ScrollToResults from '@/components/ScrollToResults';

export default async function PropertiesContent({ searchParams, subtitle }) {
  const dbReady = Boolean(process.env.MONGODB_URI);
  if (dbReady) {
    try {
      await connectDB();
    } catch (error) {
      console.log('[properties] DB unavailable:', error.message);
    }
  }

  const { pageSize = 9, page = 1, type, term, minPrice, maxPrice, bedrooms, baths, operation, area, propertyType, status, sort, favoritos, granInversion } = searchParams;

  const filter = { is_published: { $ne: false } };

  if (granInversion !== 'true') {
    if (type && type !== 'Todos') filter.type = type;
  }
  if (term && term !== 'Ciudad') {
    const termRegex = new RegExp(term, 'i');
    filter.$or = [
      { name: termRegex },
      { description: termRegex },
      { 'location.city': termRegex },
      { 'location.street': termRegex },
      { 'location.state': termRegex },
      { 'location.zipcode': termRegex },
      { type: termRegex },
    ];
  }
  if (bedrooms) {
    const num = parseInt(bedrooms.replace('+', ''));
    filter.beds = { $gte: num };
  }
  if (baths) {
    const num = parseInt(baths.replace('+', ''));
    filter.baths = { $gte: num };
  }
  if (area) {
    const [minArea, maxArea] = area.split('-');
    filter.square_feet = {};
    if (minArea && minArea !== '0') filter.square_feet.$gte = Number(minArea);
    if (maxArea && maxArea !== '0') filter.square_feet.$lte = Number(maxArea);
  }
  if (propertyType) {
    const types = propertyType.split('|');
    if (types.length === 1) {
      filter.property_type = types[0];
    } else {
      filter.property_type = { $in: types };
    }
  }
  if (status) {
    const statuses = status.split('|');
    if (statuses.length === 1) {
      filter.status = statuses[0];
    } else {
      filter.status = { $in: statuses };
    }
  }

  let bookmarkedIds = [];
  if (dbReady && favoritos === 'true') {
    const sessionUser = await getSessionUser();
    if (sessionUser?.userId) {
      const user = await User.findById(sessionUser.userId).lean();
      bookmarkedIds = (user?.bookmarks || []).map((b) => b.toString());
      if (bookmarkedIds.length > 0) {
        filter._id = { $in: bookmarkedIds };
      }
    }
  }

  let sortObj = {};
  if (sort === 'newest') sortObj = { createdAt: -1 };
  else sortObj = { createdAt: -1 };

  let properties = [];
  if (dbReady) {
    try {
      properties = await Property.find(filter).sort(sortObj);
    } catch (error) {
      console.log('[properties] Query failed:', error.message);
      properties = [];
    }
  }

  const parsePrice = (priceStr) => {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    if (!cleaned) return null;
    return parseInt(cleaned, 10);
  };

  const priceMin = minPrice ? Number(minPrice) : null;
  const priceMax = maxPrice ? Number(maxPrice) : null;

  let filteredProperties = properties.map((p) => ({
    ...p.toObject(),
    _id: p._id.toString(),
    owner: p.owner?.toString(),
  }));

  if (priceMin || priceMax) {
    filteredProperties = filteredProperties.filter((p) => {
      const numericPrice = parsePrice(p.price);
      if (numericPrice === null) return true;
      if (priceMin && numericPrice < priceMin) return false;
      if (priceMax && numericPrice > priceMax) return false;
      return true;
    });
  }

  if (granInversion === 'true') {
    const { isGranInversion } = await import('@/utils/filterProperties');
    filteredProperties = filteredProperties.filter(isGranInversion);
  }

  if (sort === 'price-asc') {
    filteredProperties.sort((a, b) => (parsePrice(a.price) || 0) - (parsePrice(b.price) || 0));
  } else if (sort === 'price-desc') {
    filteredProperties.sort((a, b) => (parsePrice(b.price) || 0) - (parsePrice(a.price) || 0));
  }

  const isFiltered = !!(type && type !== 'Todos') || !!(term && term !== 'Ciudad');

  const parsedPage = parseInt(page, 10) || 1;
  const parsedPageSize = parseInt(pageSize, 10) || 9;
  const paginatedProperties = filteredProperties.slice(
    (parsedPage - 1) * parsedPageSize,
    parsedPage * parsedPageSize
  );
  const finalTotal = filteredProperties.length;

  return (
    <div className="bg-white">
      <ScrollToResults searchParams={searchParams} isFiltered={isFiltered} />
      {/* Sort Bar */}
      <div id="resultados" className="bg-white px-4 md:px-[50px] pt-6 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <SectionTitle size="normal">{subtitle}</SectionTitle>
        <ScrollReveal delay={100}>
          <SortBar
            total={finalTotal}
            activeSort={sort}
            searchParams={searchParams}
          />
        </ScrollReveal>
      </div>

      {/* Results */}
      <section className="bg-white px-4 md:px-[50px] pb-12">
          {finalTotal === 0 ? (
            <ScrollReveal variant="fadeScale">
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-[#999]">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <p className="text-[15px] font-semibold text-[#333] mb-2">
                  No se encontraron propiedades
                </p>
                <p className="text-[13px] text-[#999]">
                  Probá cambiando los filtros o{' '}
                  <a href="/properties" className="text-[#652660] hover:underline font-medium">ver todas</a>
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {paginatedProperties.map((property, i) => (
                  <FeaturedPropertyCard key={property._id} property={property} />
                ))}
              </div>
              <Pagination page={parsedPage} pageSize={parsedPageSize} totalItems={finalTotal} searchParams={searchParams} />
            </>
          )}
      </section>

      {/* Category Map */}
      {filteredProperties.length > 0 && (
      <section className="relative bg-white px-4 md:px-[50px] pb-12">
          <div className="bg-white rounded-[30px] overflow-hidden">
            <div className="mx-auto px-4 md:px-[50px] py-[30px] md:py-[40px]">
              <div className="pb-[30px]">
                <SectionTitle size="normal">Vista en Mapa</SectionTitle>
              </div>
              <ScrollReveal delay={100}>
                <MapErrorBoundary>
                  <CategoryMap properties={filteredProperties} />
                </MapErrorBoundary>
              </ScrollReveal>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
