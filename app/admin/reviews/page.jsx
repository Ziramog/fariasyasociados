export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Reseñas',
  robots: { index: false, follow: false },
};

import Link from 'next/link';
import connectDB from '@/config/database';
import Review from '@/models/Review';
import BusinessInfo from '@/models/BusinessInfo';
import { syncReviews } from '@/lib/sync/sync-reviews';
import addManualReview from '@/app/actions/addManualReview';
import toggleReviewFeatured from '@/app/actions/toggleReviewFeatured';
import toggleReviewHidden from '@/app/actions/toggleReviewHidden';
import updateReviewPriority from '@/app/actions/updateReviewPriority';
import deleteReview from '@/app/actions/deleteReview';

const inputCls = 'w-full bg-[#0a0a0a] border border-[#333] rounded-sm px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[#555]';

const AdminReviewsPage = async ({ searchParams }) => {
  await connectDB();

  const syncNow = searchParams?.sync === '1';
  const showAdd = searchParams?.add === '1';
  let syncResult = null;
  let addResult = null;

  if (syncNow) syncResult = await syncReviews();

  const reviews = await Review.find({}).sort({ priority: -1, publishTime: -1 }).lean();
  const businessInfo = await BusinessInfo.findOne({}).lean();
  const googleRating = businessInfo?.overallRating;
  const dbAvg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const avgRating = googleRating || dbAvg;
  const totalUserRatings = businessInfo?.totalUserRatings;
  const stats = {
    total: reviews.length,
    featured: reviews.filter(r => r.featured).length,
    hidden: reviews.filter(r => r.hidden).length,
    avgRating: avgRating ? avgRating.toFixed(1) : '—',
    totalUserRatings,
  };

  return (
    <div className="p-3 md:p-6">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-[24px] md:text-[36px] font-normal text-white flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Reseñas Google
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#444] text-[#888] text-[12px] font-bold cursor-help" title="Modera y visualiza las reseñas públicas. Destaca tus favoritas para que aparezcan primeras y oculta las que no aporten valor.">?</span>
        </h1>
        <div className="flex gap-2">
          <a href={showAdd ? '/admin/reviews' : '/admin/reviews?add=1'} className="text-[12px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm border border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-colors">
            {showAdd ? 'Volver' : '+ Agregar'}
          </a>
          <a href="/admin/reviews?sync=1" className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-[12px] md:text-[13px] font-bold uppercase tracking-wider px-4 md:px-5 py-2.5 rounded-sm transition-colors">
            Sincronizar
          </a>
        </div>
      </div>

      {syncResult && (
        <div className={`mb-4 p-4 rounded-sm text-sm ${syncResult.success ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
          {syncResult.success
            ? `✅ Sync Google — ${syncResult.inserted} nuevas, ${syncResult.updated} actualizadas${syncResult.duplicatesRemoved > 0 ? `, ${syncResult.duplicatesRemoved} duplicadas eliminadas` : ''} (${syncResult.durationMs}ms). Tenés ${stats.total} reseñas en total. ${syncResult.overallRating ? `★ ${syncResult.overallRating} en Google (${syncResult.totalRatings} reseñas).` : ''}`
            : `❌ Error: ${syncResult.error}`}
        </div>
      )}

      {/* Manual add form */}
      {showAdd && (
        <div className="bg-[#161616] border border-[#222] rounded-sm p-6 mb-6">
          <h2 className="text-[18px] font-semibold text-white mb-4">Agregar reseña manual</h2>
          <form action={addManualReview} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">Nombre del autor</label>
              <input type="text" name="authorName" required className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">Rating (1-5)</label>
              <select name="rating" required className={inputCls}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">Fecha</label>
              <input type="date" name="publishDate" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">Texto de la reseña</label>
              <textarea name="text" rows={3} className={inputCls} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="featured" id="featured" className="w-4 h-4 accent-[var(--color-brand)]" />
              <label htmlFor="featured" className="text-sm text-[#ccc]">Destacada</label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-sm font-bold px-6 py-2.5 rounded-sm transition-colors uppercase tracking-wider">
                Guardar reseña
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      {!showAdd && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { value: stats.total, label: 'Total', color: '#fff' },
              { value: stats.featured, label: 'Destacadas', color: '#fe8b01' },
              { value: stats.hidden, label: 'Ocultas', color: '#888' },
              { value: stats.avgRating, label: `★ Google${stats.totalUserRatings ? ` (${stats.totalUserRatings})` : ''}`, color: '#F59E0B' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#161616] border border-[#222] rounded-sm p-3 md:p-4 text-center">
                <p className="text-[20px] md:text-[28px] font-bold leading-none mb-1" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] font-medium text-[#888] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Reviews table (Desktop) */}
          <div className="hidden md:block bg-[#161616] border border-[#222] rounded-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative">
              <table className="w-full text-left min-w-[800px]">
                <thead className="sticky top-0 bg-[#161616] z-10 shadow-[0_1px_0_#222]">
                  <tr className="border-b border-[#222] text-[10px] font-bold uppercase tracking-wider text-[#888]">
                    <th className="px-3 md:px-4 py-3">Autor</th>
                    <th className="px-2 md:px-3 py-3">★</th>
                    <th className="px-2 md:px-3 py-3 hidden md:table-cell">Reseña</th>
                    <th className="px-2 md:px-3 py-3 hidden md:table-cell">Fecha</th>
                    <th className="px-2 md:px-3 py-3 text-center">Dest</th>
                    <th className="px-2 md:px-3 py-3 text-center">Visibilidad</th>
                    <th className="px-3 md:px-4 py-3 text-right">Prior.</th>
                    <th className="px-2 md:px-3 py-3 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {reviews.map(r => (
                    <tr key={r._id.toString()} className="hover:bg-[#1a1a1a] transition-colors text-[13px]">
                      <td className="px-3 md:px-4 py-3"><p className="font-medium text-white truncate max-w-[120px]">{r.authorName}</p></td>
                      <td className="px-2 md:px-3 py-3 text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                      <td className="px-2 md:px-3 py-3 text-[#bbb] hidden md:table-cell truncate max-w-[300px]">{r.text || '—'}</td>
                      <td className="px-2 md:px-3 py-3 text-[#888] hidden md:table-cell text-[12px]">{r.relativeTimeDescription || r.publishTime?.toISOString().split('T')[0]}</td>
                      <td className="px-2 md:px-3 py-3 text-center">
                        <form action={toggleReviewFeatured}>
                          <input type="hidden" name="reviewId" value={r._id.toString()} />
                          <input type="hidden" name="current" value={r.featured ? 'true' : 'false'} />
                          <button type="submit" className={`inline-block w-6 h-6 rounded-full text-[12px] leading-6 font-bold cursor-pointer transition-colors ${r.featured ? 'bg-[var(--color-brand)] text-white' : 'bg-[#333] text-[#888] hover:bg-[#444]'}`}>★</button>
                        </form>
                      </td>
                      <td className="px-2 md:px-3 py-3 text-center">
                        <form action={toggleReviewHidden}>
                          <input type="hidden" name="reviewId" value={r._id.toString()} />
                          <input type="hidden" name="current" value={r.hidden ? 'true' : 'false'} />
                          <button type="submit" className={`p-1.5 rounded-md cursor-pointer transition-colors inline-flex ${r.hidden ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}>
                            {r.hidden ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                          </button>
                        </form>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <form action={updateReviewPriority}>
                            <input type="hidden" name="reviewId" value={r._id.toString()} />
                            <input type="hidden" name="delta" value="-1" />
                            <button type="submit" className="text-[#888] hover:text-[var(--color-brand)] text-xs leading-none px-1 cursor-pointer">−</button>
                          </form>
                          <span className="text-[12px] text-[#888] w-4 text-center leading-none">{r.priority}</span>
                          <form action={updateReviewPriority}>
                            <input type="hidden" name="reviewId" value={r._id.toString()} />
                            <input type="hidden" name="delta" value="1" />
                            <button type="submit" className="text-[#888] hover:text-[var(--color-brand)] text-xs leading-none px-1 cursor-pointer">+</button>
                          </form>
                        </div>
                      </td>
                      <td className="px-2 md:px-3 py-3 text-center">
                        <form action={deleteReview}>
                          <input type="hidden" name="reviewId" value={r._id.toString()} />
                          <button type="submit" className="p-1.5 rounded-md text-[#555] hover:bg-red-500/20 hover:text-red-500 transition-colors inline-flex">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#888] text-[14px]">
                        No hay reseñas. Hacé clic en "Sincronizar" para traerlas desde Google.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden bg-[#161616] border border-[#222] rounded-sm flex flex-col divide-y divide-[#222] overflow-y-auto max-h-[500px]">
            {reviews.map(r => (
              <div key={r._id.toString()} className="p-4 flex flex-col gap-2 hover:bg-[#1a1a1a] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate text-[14px]">{r.authorName}</p>
                    <div className="text-amber-400 text-[12px] tracking-widest mt-0.5">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <span className="text-[11px] text-[#888] flex-shrink-0">{r.relativeTimeDescription || r.publishTime?.toISOString().split('T')[0]}</span>
                </div>
                
                {r.text && (
                  <p className="text-[13px] text-[#bbb] line-clamp-3 mt-1 leading-relaxed">
                    "{r.text}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#222]">
                  <div className="flex gap-2">
                    <form action={toggleReviewFeatured}>
                      <input type="hidden" name="reviewId" value={r._id.toString()} />
                      <input type="hidden" name="current" value={r.featured ? 'true' : 'false'} />
                      <button type="submit" className={`inline-block w-7 h-7 rounded-full text-[14px] leading-[28px] font-bold cursor-pointer transition-colors ${r.featured ? 'bg-[var(--color-brand)] text-white' : 'bg-[#333] text-[#888] hover:bg-[#444]'}`} title="Destacar">★</button>
                    </form>
                    <form action={toggleReviewHidden}>
                      <input type="hidden" name="reviewId" value={r._id.toString()} />
                      <input type="hidden" name="current" value={r.hidden ? 'true' : 'false'} />
                      <button type="submit" className={`w-7 h-7 flex items-center justify-center rounded-sm cursor-pointer transition-colors ${r.hidden ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`} title="Visibilidad">
                        {r.hidden ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </form>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#0a0a0a] border border-[#333] rounded-sm px-1 py-0.5">
                      <form action={updateReviewPriority}>
                        <input type="hidden" name="reviewId" value={r._id.toString()} />
                        <input type="hidden" name="delta" value="-1" />
                        <button type="submit" className="text-[#888] hover:text-[var(--color-brand)] w-5 h-5 flex items-center justify-center">−</button>
                      </form>
                      <span className="text-[12px] text-[#888] w-4 text-center font-medium">{r.priority}</span>
                      <form action={updateReviewPriority}>
                        <input type="hidden" name="reviewId" value={r._id.toString()} />
                        <input type="hidden" name="delta" value="1" />
                        <button type="submit" className="text-[#888] hover:text-[var(--color-brand)] w-5 h-5 flex items-center justify-center">+</button>
                      </form>
                    </div>

                    <form action={deleteReview}>
                      <input type="hidden" name="reviewId" value={r._id.toString()} />
                      <button type="submit" className="w-7 h-7 flex items-center justify-center rounded-sm text-[#555] hover:bg-red-500/20 hover:text-red-500 transition-colors" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="p-8 text-center text-[#888] text-[13px]">
                No hay reseñas. Hacé clic en "Sincronizar" para traerlas desde Google.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReviewsPage;
