'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Hash,
  Check,
  RotateCcw,
  ArrowUpToLine,
} from 'lucide-react';

const getTopGridLabel = (index) => {
  if (index === 0) return 'Portada';
  return `Mini ${index}`;
};

const getTopGridColorClass = (index) => {
  if (index === 0) return 'bg-[var(--color-brand)] text-white';
  return 'bg-[#222] text-gray-200 border-t border-[#333]';
};

const PropertyImageSorter = ({
  items,
  setItems,
  galleryOrderIds = [],
  setGalleryOrderIds,
  removedImages = [],
  onRemoveExisting,
  onUndoRemoveExisting,
  helperClass = 'text-[11px] text-gray-400 mt-1',
}) => {
  const [activeTab, setActiveTab] = useState('top'); // 'top' | 'gallery'
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [isNumberingMode, setIsNumberingMode] = useState(false);
  const [numberedIds, setNumberedIds] = useState([]);
  const [topGridCount, setTopGridCount] = useState(7);

  // Gallery ALWAYS contains the total of photos in its own independent order
  const galleryItems = (() => {
    if (!galleryOrderIds || galleryOrderIds.length === 0) return items;
    const ordered = galleryOrderIds
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean);
    const missing = items.filter((item) => !galleryOrderIds.includes(item.id));
    return [...ordered, ...missing];
  })();

  const effectiveTopCount = Math.min(items.length, topGridCount, 7);
  const topGridItems = items.slice(0, effectiveTopCount);

  // Ensure galleryOrderIds is snapshotted before modifying `items` (Top Grid)
  const ensureGallerySnapshot = () => {
    if (setGalleryOrderIds && (!galleryOrderIds || galleryOrderIds.length === 0)) {
      setGalleryOrderIds(items.map((it) => it.id));
    }
  };

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setIsNumberingMode(false);
    setNumberedIds([]);
    setDraggedIdx(null);
    setDragOverIdx(null);
    setActiveTab(tab);
  };

  const moveTopGridItem = (fromIdx, toIdx) => {
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= topGridItems.length ||
      toIdx >= topGridItems.length
    ) {
      return;
    }
    ensureGallerySnapshot();
    const updatedTop = [...topGridItems];
    const [moved] = updatedTop.splice(fromIdx, 1);
    updatedTop.splice(toIdx, 0, moved);
    const rest = items.slice(effectiveTopCount);
    setItems([...updatedTop, ...rest]);
  };

  const moveGalleryItem = (fromIdx, toIdx) => {
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= galleryItems.length ||
      toIdx >= galleryItems.length
    ) {
      return;
    }
    const updated = [...galleryItems];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    if (setGalleryOrderIds) {
      setGalleryOrderIds(updated.map((it) => it.id));
    }
  };

  // Remove a photo from the Top Grid (does NOT delete it from the Gallery total)
  const removeFromTopGridOnly = (itemId) => {
    if (effectiveTopCount <= 1) return;
    ensureGallerySnapshot();
    const target = items.find((it) => it.id === itemId);
    if (!target) return;
    const currentTop = items.slice(0, effectiveTopCount).filter((it) => it.id !== itemId);
    const others = items.filter((it) => it.id !== itemId && !currentTop.some((t) => t.id === it.id));
    setTopGridCount(currentTop.length);
    setItems([...currentTop, target, ...others]);
  };

  // Add or promote a photo from the Gallery pool into the Top Grid
  const addToTopGridFromPool = (itemId, asCover = false) => {
    ensureGallerySnapshot();
    const target = items.find((it) => it.id === itemId);
    if (!target) return;
    const currentTop = items.slice(0, effectiveTopCount).filter((it) => it.id !== itemId);
    let newTop;
    if (asCover) {
      newTop = [target, ...currentTop].slice(0, 7);
    } else if (currentTop.length < 7) {
      newTop = [...currentTop, target];
    } else {
      newTop = [...currentTop.slice(0, 6), target];
    }
    const newTopIds = new Set(newTop.map((it) => it.id));
    const rest = items.filter((it) => !newTopIds.has(it.id));
    setTopGridCount(newTop.length);
    setItems([...newTop, ...rest]);
  };

  // Handle adding new files from input
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newEntries = files.map((file, idx) => ({
      id: `new_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
      type: 'new',
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));

    setItems((prev) => [...prev, ...newEntries]);
    setTopGridCount((prev) => Math.max(prev, Math.min(7, items.length + newEntries.length)));
    if (setGalleryOrderIds) {
      setGalleryOrderIds((prev) => {
        const baseIds = prev && prev.length > 0 ? prev : items.map((it) => it.id);
        return [...baseIds, ...newEntries.map((ne) => ne.id)];
      });
    }
    e.target.value = '';
  };

  // Delete photo completely from the property
  const handleDeletePhotoCompletely = (itemId) => {
    const target = items.find((it) => it.id === itemId);
    if (!target) return;

    if (target.type === 'existing' && onRemoveExisting) {
      onRemoveExisting(target.url);
    }
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    if (setGalleryOrderIds) {
      setGalleryOrderIds((prev) => prev.filter((id) => id !== itemId));
    }
    setNumberedIds((prev) => prev.filter((id) => id !== itemId));
  };

  // Numbering mode handlers
  const startNumberingMode = () => {
    setNumberedIds([]);
    setIsNumberingMode(true);
  };

  const cancelNumberingMode = () => {
    setNumberedIds([]);
    setIsNumberingMode(false);
  };

  const toggleNumberedItem = (itemId) => {
    setNumberedIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      if (activeTab === 'top' && prev.length >= 7) {
        return prev;
      }
      return [...prev, itemId];
    });
  };

  const applyNumberingOrder = () => {
    if (numberedIds.length === 0) {
      setIsNumberingMode(false);
      return;
    }

    if (activeTab === 'top') {
      ensureGallerySnapshot();
      const chosenTop = numberedIds
        .slice(0, 7)
        .map((id) => items.find((item) => item.id === id))
        .filter(Boolean);
      const remaining = items.filter((item) => !chosenTop.some((t) => t.id === item.id));
      setTopGridCount(chosenTop.length);
      setItems([...chosenTop, ...remaining]);
    } else if (setGalleryOrderIds) {
      const numberedGallery = numberedIds
        .map((id) => galleryItems.find((item) => item.id === id))
        .filter(Boolean);
      const remainingGallery = galleryItems.filter((item) => !numberedIds.includes(item.id));
      setGalleryOrderIds([...numberedGallery, ...remainingGallery].map((it) => it.id));
    }

    setNumberedIds([]);
    setIsNumberingMode(false);
  };

  // Drag & Drop handlers
  const handleDragStart = (e, index) => {
    if (isNumberingMode) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (isNumberingMode || draggedIdx === null) return;
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (isNumberingMode || draggedIdx === null) return;
    if (activeTab === 'top') {
      moveTopGridItem(draggedIdx, index);
    } else {
      moveGalleryItem(draggedIdx, index);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const getTopGridRank = (itemId) => {
    const idx = topGridItems.findIndex((it) => it.id === itemId);
    if (idx === -1) return null;
    return idx === 0 ? '#1 Portada' : `#${idx + 1}`;
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs: Grid Superior vs Galería Inferior */}
      <div className="grid grid-cols-2 gap-2 bg-[#121212] p-1.5 rounded-lg border border-[#2a2a2a]">
        <button
          type="button"
          onClick={() => switchTab('top')}
          className={`flex flex-col items-start p-2.5 sm:p-3 rounded-md text-left transition-all border ${
            activeTab === 'top'
              ? 'bg-[#1f1a14] border-[var(--color-brand)] text-white shadow'
              : 'bg-transparent border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate">
              <Star className={`w-4 h-4 flex-shrink-0 ${activeTab === 'top' ? 'text-[var(--color-brand)] fill-current' : 'text-gray-500'}`} />
              <span className="truncate">1. Grid Superior</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-brand)]/20 text-[var(--color-brand)] border border-[var(--color-brand)]/40 flex-shrink-0">
              {topGridItems.length}/7
            </span>
          </div>
          <span className="hidden sm:block text-[11px] text-gray-400 mt-1">
            Portada + 6 miniaturas del encabezado (sin afectar Galería).
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab('gallery')}
          className={`flex flex-col items-start p-2.5 sm:p-3 rounded-md text-left transition-all border ${
            activeTab === 'gallery'
              ? 'bg-[#181818] border-white/40 text-white shadow'
              : 'bg-transparent border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate">
              <Hash className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">2. Galería Total</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-200 border border-white/20 flex-shrink-0">
              {galleryItems.length}
            </span>
          </div>
          <span className="hidden sm:block text-[11px] text-gray-400 mt-1">
            Contiene siempre el total de fotos con su propio orden.
          </span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: GRID SUPERIOR (INDEPENDENT SELECTION & ORDER OF 7)
         ========================================================= */}
      {activeTab === 'top' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#161616] border border-[#2a2a2a] p-3 rounded-lg">
            <div>
              <p className="text-white text-xs sm:text-sm font-bold">
                Grid Superior ({topGridItems.length} de 7)
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tocá <Star className="w-3 h-3 inline text-gray-300" /> para elegir la <span className="text-[var(--color-brand)] font-semibold">Portada (#1)</span> o <X className="w-3 h-3 inline text-gray-300" /> para quitar del Grid.
              </p>
            </div>

            {items.length > 1 && !isNumberingMode && (
              <button
                type="button"
                onClick={startNumberingMode}
                className="flex-shrink-0 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Elegir las 7 tocando (1 a 7)</span>
              </button>
            )}
          </div>

          {isNumberingMode ? (
            /* Numbering Mode for Top Grid */
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[#1e1a14] border-2 border-[var(--color-brand)] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-white text-xs sm:text-sm font-bold flex items-center gap-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[var(--color-brand)] text-white text-xs">
                        {numberedIds.length}/7
                      </span>
                      Tocá hasta 7 fotos para el Grid Superior (1° Portada, 2° a 7° Miniaturas)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={applyNumberingOrder}
                      disabled={numberedIds.length === 0}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aplicar ({numberedIds.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNumberedIds([])}
                      disabled={numberedIds.length === 0}
                      className="bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-40 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors"
                      title="Reiniciar"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelNumberingMode}
                      className="bg-transparent border border-[#555] hover:bg-[#2a2a2a] text-gray-300 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {galleryItems.map((item, idx) => {
                  const numberedOrder = numberedIds.indexOf(item.id);
                  const isSelected = numberedOrder !== -1;
                  return (
                    <div
                      key={`top_num_${item.id}`}
                      onClick={() => toggleNumberedItem(item.id)}
                      className={`relative rounded-lg overflow-hidden border transition-all select-none cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]'
                          : 'border-[#333] opacity-80 hover:opacity-100'
                      } bg-[#141414]`}
                    >
                      <div className="relative w-full h-32 sm:h-36 bg-[#0d0d0d]">
                        {item.type === 'existing' ? (
                          <Image
                            src={item.url}
                            alt={`Foto ${idx + 1}`}
                            width={300}
                            height={220}
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={`Nueva foto ${idx + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        )}
                        <div
                          className={`absolute inset-0 flex flex-col items-center justify-center transition-colors ${
                            isSelected ? 'bg-black/50' : 'bg-black/20'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-extrabold shadow-lg border-2 ${
                              isSelected
                                ? numberedOrder === 0
                                  ? 'bg-[var(--color-brand)] text-white border-white scale-110'
                                  : 'bg-[#222] text-white border-white scale-105'
                                : 'bg-black/60 text-white/70 border-white/50'
                            }`}
                          >
                            {isSelected ? numberedOrder + 1 : '+'}
                          </div>
                          {isSelected && (
                            <span
                              className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                numberedOrder === 0
                                  ? 'bg-[var(--color-brand)] text-white'
                                  : 'bg-black/80 text-gray-200'
                              }`}
                            >
                              {numberedOrder === 0 ? 'PORTADA' : `MINI ${numberedOrder}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Active 7 Slots of Top Grid */}
              {topGridItems.length > 0 && (
                <div className="bg-[#141414] border border-[#2a2a2a] p-3 rounded-lg space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">
                      Las {topGridItems.length} fotos en el Grid Superior
                    </span>
                    <span className="hidden sm:inline text-[11px] text-gray-400">
                      Solo la #1 (Portada) se destaca en color
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {topGridItems.map((item, i) => {
                      const isCover = i === 0;
                      const isBeingDragged = draggedIdx === i;
                      const isDragTarget = dragOverIdx === i && draggedIdx !== null && draggedIdx !== i;

                      return (
                        <div
                          key={`top_slot_${item.id}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, i)}
                          onDragOver={(e) => handleDragOver(e, i)}
                          onDrop={(e) => handleDrop(e, i)}
                          onDragEnd={handleDragEnd}
                          className={`relative rounded-lg overflow-hidden border transition-all select-none ${
                            isDragTarget
                              ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)] scale-[1.02]'
                              : isBeingDragged
                              ? 'opacity-40 border-dashed border-gray-400'
                              : isCover
                              ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]'
                              : 'border-[#333]'
                          } bg-[#181818]`}
                        >
                          <div className="relative w-full h-28 sm:h-36 bg-[#0d0d0d]">
                            {item.type === 'existing' ? (
                              <Image
                                src={item.url}
                                alt={`Grid Superior ${i + 1}`}
                                width={300}
                                height={220}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            ) : (
                              <img
                                src={item.url}
                                alt={`Nueva ${i + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            )}

                            {/* Top-Left: Cover indicator (colorful ONLY for #1) or monochrome Star icon button for #2..#7 */}
                            {isCover ? (
                              <span
                                className="absolute top-1.5 left-1.5 bg-[var(--color-brand)] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow flex items-center gap-1"
                                title="Esta foto es la Portada principal (#1)"
                              >
                                <Star className="w-3 h-3 fill-current" />
                                <span>PORTADA</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => moveTopGridItem(i, 0)}
                                className="absolute top-1.5 left-1.5 w-7 h-7 bg-black/75 hover:bg-[var(--color-brand)] text-gray-300 hover:text-white border border-white/15 rounded-full flex items-center justify-center shadow transition-colors"
                                title="Elegir como Portada (#1)"
                                aria-label="Elegir como Portada"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Top-Right: Compact icon button to remove from Top Grid */}
                            {topGridItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFromTopGridOnly(item.id)}
                                className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/75 hover:bg-red-600 text-gray-300 hover:text-white border border-white/15 rounded-full flex items-center justify-center shadow transition-colors"
                                title="Quitar del Grid Superior (se mantiene en la Galería)"
                                aria-label="Quitar del Grid Superior"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Bottom Bar */}
                          <div
                            className={`flex items-center justify-between px-1 py-1 text-[11px] font-bold ${getTopGridColorClass(
                              i
                            )}`}
                          >
                            <button
                              type="button"
                              onClick={() => moveTopGridItem(i, i - 1)}
                              disabled={i === 0}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/25 disabled:opacity-25 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                              title="Mover a la izquierda"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <select
                              aria-label={`Posición en Grid Superior ${i + 1}`}
                              value={i}
                              onChange={(e) => moveTopGridItem(i, Number(e.target.value))}
                              className="bg-transparent text-center font-bold text-[11px] cursor-pointer focus:outline-none py-0.5 truncate max-w-[110px]"
                            >
                              {topGridItems.map((_, posIdx) => (
                                <option key={posIdx} value={posIdx} className="bg-[#181818] text-white">
                                  #{posIdx + 1} · {getTopGridLabel(posIdx)}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => moveTopGridItem(i, i + 1)}
                              disabled={i === topGridItems.length - 1}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/25 disabled:opacity-25 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                              title="Mover a la derecha"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pool of all photos to pick from */}
              {galleryItems.length > 0 && (
                <div className="bg-[#121212] border border-[#252525] p-3 rounded-lg space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-gray-300">
                      Total de fotos ({galleryItems.length}) — Tocá <Plus className="w-3 h-3 inline" /> para subir al Grid o <Star className="w-3 h-3 inline" /> para hacer Portada:
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {galleryItems.map((item, idx) => {
                      const topIdx = topGridItems.findIndex((it) => it.id === item.id);
                      const inTop = topIdx !== -1;
                      const isCover = topIdx === 0;

                      return (
                        <div
                          key={`pool_${item.id}`}
                          className={`relative rounded-md overflow-hidden border transition-all ${
                            isCover
                              ? 'border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]'
                              : inTop
                              ? 'border-white/40'
                              : 'border-[#2a2a2a]'
                          } bg-[#181818]`}
                        >
                          <div className="relative w-full h-20 sm:h-24 bg-[#0d0d0d]">
                            {item.type === 'existing' ? (
                              <Image
                                src={item.url}
                                alt={`Total ${idx + 1}`}
                                width={200}
                                height={150}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            ) : (
                              <img
                                src={item.url}
                                alt={`Nueva ${idx + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            )}

                            {inTop ? (
                              <div
                                className={`absolute inset-x-0 bottom-0 text-[10px] font-bold py-0.5 text-center ${
                                  isCover
                                    ? 'bg-[var(--color-brand)] text-white'
                                    : 'bg-black/80 text-gray-200'
                                }`}
                              >
                                {isCover ? '★ #1 Portada' : `En Grid (#${topIdx + 1})`}
                              </div>
                            ) : (
                              <div className="absolute inset-x-0 top-1 px-1 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => addToTopGridFromPool(item.id, true)}
                                  className="w-6 h-6 bg-black/75 hover:bg-[var(--color-brand)] text-gray-300 hover:text-white rounded-full flex items-center justify-center shadow border border-white/15"
                                  title="Usar como Portada (#1)"
                                  aria-label="Usar como Portada"
                                >
                                  <Star className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => addToTopGridFromPool(item.id, false)}
                                  className="w-6 h-6 bg-black/75 hover:bg-white/20 text-white rounded-full flex items-center justify-center shadow border border-white/15"
                                  title="Subir al Grid Superior"
                                  aria-label="Subir al Grid Superior"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: GALERÍA INFERIOR (ALWAYS CONTAINS THE TOTAL)
         ========================================================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#161616] border border-[#2a2a2a] p-3 rounded-lg">
            <div>
              <p className="text-white text-xs sm:text-sm font-bold">
                Galería Inferior (Total: {galleryItems.length} fotos)
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Contiene siempre el total de fotos con su propio orden independiente del Grid Superior.
              </p>
            </div>

            {galleryItems.length > 1 && !isNumberingMode && (
              <button
                type="button"
                onClick={startNumberingMode}
                className="flex-shrink-0 bg-[#2a2a2a] hover:bg-[#383838] border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Ordenar Galería tocando (1, 2, 3...)</span>
              </button>
            )}
          </div>

          {isNumberingMode && (
            <div className="p-3.5 rounded-lg bg-[#181818] border-2 border-white/40 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-white text-xs sm:text-sm font-bold flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-black text-xs">
                      {numberedIds.length}
                    </span>
                    Tocá las fotos en el orden en que querés que aparezcan en la Galería Inferior
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={applyNumberingOrder}
                    disabled={numberedIds.length === 0}
                    className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar ({numberedIds.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNumberedIds([])}
                    disabled={numberedIds.length === 0}
                    className="bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-40 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelNumberingMode}
                    className="bg-transparent border border-[#555] hover:bg-[#2a2a2a] text-gray-300 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {galleryItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {galleryItems.map((item, i) => {
                const numberedOrder = numberedIds.indexOf(item.id);
                const isSelectedInNumbering = numberedOrder !== -1;
                const isBeingDragged = draggedIdx === i;
                const isDragTarget = dragOverIdx === i && draggedIdx !== null && draggedIdx !== i;
                const topRank = getTopGridRank(item.id);

                return (
                  <div
                    key={`gal_${item.id}`}
                    draggable={!isNumberingMode}
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (isNumberingMode) toggleNumberedItem(item.id);
                    }}
                    className={`relative rounded-lg overflow-hidden border transition-all select-none ${
                      isNumberingMode
                        ? isSelectedInNumbering
                          ? 'border-white ring-2 ring-white cursor-pointer'
                          : 'border-[#333] hover:border-gray-400 cursor-pointer opacity-80 hover:opacity-100'
                        : isDragTarget
                        ? 'border-white ring-2 ring-white scale-[1.02]'
                        : isBeingDragged
                        ? 'opacity-40 border-dashed border-gray-400'
                        : 'border-[#333]'
                    } bg-[#141414]`}
                  >
                    <div className="relative w-full h-28 sm:h-36 bg-[#0d0d0d]">
                      {item.type === 'existing' ? (
                        <Image
                          src={item.url}
                          alt={`Galería ${i + 1}`}
                          width={300}
                          height={220}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`Nueva ${i + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      )}

                      {item.type === 'new' && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-[var(--color-brand)] border border-[var(--color-brand)] font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Nueva
                        </span>
                      )}

                      {topRank && !isNumberingMode && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-gray-200 border border-white/20 font-semibold text-[9px] px-1.5 py-0.5 rounded">
                          Grid: {topRank}
                        </span>
                      )}

                      {isNumberingMode && (
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-colors ${
                            isSelectedInNumbering ? 'bg-black/45' : 'bg-black/15'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-extrabold shadow-lg border-2 ${
                              isSelectedInNumbering
                                ? 'bg-white text-black border-white scale-110'
                                : 'bg-black/60 text-white/70 border-white/50'
                            }`}
                          >
                            {isSelectedInNumbering ? numberedOrder + 1 : '+'}
                          </div>
                        </div>
                      )}

                      {!isNumberingMode && (
                        <>
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveGalleryItem(i, 0);
                              }}
                              className="absolute top-1.5 left-1.5 w-7 h-7 bg-black/75 hover:bg-white/20 text-gray-200 rounded-full flex items-center justify-center shadow border border-white/15 transition-colors"
                              title="Enviar al puesto #1 de la Galería"
                              aria-label="Enviar al puesto 1 de la Galería"
                            >
                              <ArrowUpToLine className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhotoCompletely(item.id);
                            }}
                            className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/75 hover:bg-red-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center shadow border border-white/15 transition-colors"
                            title="Eliminar foto de la propiedad"
                            aria-label="Eliminar foto de la propiedad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between px-1 py-1 text-[11px] font-bold bg-[#222] text-gray-200 border-t border-[#333]">
                      {!isNumberingMode ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveGalleryItem(i, i - 1);
                            }}
                            disabled={i === 0}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/25 disabled:opacity-25 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            title="Mover antes"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <select
                            aria-label={`Posición en Galería ${i + 1}`}
                            value={i}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => moveGalleryItem(i, Number(e.target.value))}
                            className="bg-transparent text-center font-bold text-[11px] cursor-pointer focus:outline-none py-0.5 truncate max-w-[110px]"
                          >
                            {galleryItems.map((_, posIdx) => (
                              <option key={posIdx} value={posIdx} className="bg-[#181818] text-white">
                                #{posIdx + 1} de {galleryItems.length}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveGalleryItem(i, i + 1);
                            }}
                            disabled={i === galleryItems.length - 1}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/25 disabled:opacity-25 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            title="Mover después"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center py-0.5">
                          #{i + 1} en Galería
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Undo bar for removed existing images */}
      {removedImages.length > 0 && onUndoRemoveExisting && (
        <div className="flex flex-wrap gap-2 p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
          <span className="text-xs text-red-400 font-semibold mr-1 flex items-center">
            Eliminadas ({removedImages.length}):
          </span>
          {removedImages.map((url, idx) => (
            <button
              key={url}
              type="button"
              onClick={() => onUndoRemoveExisting(url)}
              className="bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-200 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
            >
              <span>Foto #{idx + 1}</span>
              <span className="font-bold underline">↩ Deshacer</span>
            </button>
          ))}
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-[#333] hover:border-[var(--color-brand)] transition-colors bg-[#111] rounded-lg p-5 text-center">
        <input
          type="file"
          id="property_images_input"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
        />
        <label
          htmlFor="property_images_input"
          className="cursor-pointer text-[var(--color-brand)] hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{items.length > 0 ? 'Agregar más fotos al total' : 'Seleccionar fotos de la propiedad'}</span>
        </label>
        <p className={helperClass}>
          Podés seleccionar varias fotos a la vez. Se comprimirán automáticamente al guardar.
        </p>
      </div>
    </div>
  );
};

export default PropertyImageSorter;
