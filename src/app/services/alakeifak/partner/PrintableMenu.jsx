import React from 'react';

export default function PrintableMenu({ restaurant, categories, subcategories, items, themeColor }) {
  if (!restaurant) return null;

  const tc = themeColor || '#1a1a1a';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://khatwah.online';
  const menuUrl = `${baseUrl}/services/alakeifak/${restaurant.slug}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(menuUrl)}&color=1a1a1a&bgcolor=FFFFFF`;

  // ─── DATA PREPROCESSING ───────────────────────────────────────

  const allCats = (categories || []).map(cat => {
    const subs = (subcategories || []).filter(s => s.category_id === cat.id);
    const subsWithItems = subs.map(sub => ({
      ...sub,
      items: (items || []).filter(i => i.subcategory_id === sub.id && i.is_available !== false)
        .map(item => ({ ...item })),
    })).filter(s => s.items.length > 0);
    return { ...cat, subs: subsWithItems };
  }).filter(c => c.subs.length > 0);

  // Classify each item into a layout variant
  allCats.forEach(cat => {
    cat.subs.forEach(sub => {
      let i = 0;
      while (i < sub.items.length) {
        const item = sub.items[i];
        const hasImage = !!item.image_url;
        const sizes = item.item_sizes || [];

        if (i === 0 && hasImage) {
          item._variant = 'hero';
          i++;
          continue;
        }

        if (
          !hasImage && sizes.length <= 2
          && i + 1 < sub.items.length
          && !sub.items[i + 1].image_url
          && (sub.items[i + 1].item_sizes || []).length <= 2
        ) {
          item._variant = 'compact-left';
          sub.items[i + 1]._variant = 'compact-right';
          i += 2;
          continue;
        }

        item._variant = 'standard';
        i++;
      }
    });
  });

  // Adaptive density
  const totalItems = allCats.reduce((s, c) => s + c.subs.reduce((a, sub) => a + sub.items.length, 0), 0);
  const density = totalItems <= 25 ? 'luxurious' : totalItems <= 50 ? 'standard' : 'dense';

  const sp = {
    catGap:    density === 'luxurious' ? '44px' : density === 'standard' ? '36px' : '28px',
    subGap:    density === 'luxurious' ? '28px' : density === 'standard' ? '24px' : '18px',
    itemGap:   density === 'luxurious' ? '18px' : density === 'standard' ? '14px' : '10px',
    heroH:     density === 'luxurious' ? '68mm' : density === 'standard' ? '56mm' : '44mm',
    catFont:   density === 'luxurious' ? '30px' : '28px',
    heroFont:  density === 'luxurious' ? '18px' : '16px',
  };

  // Featured images for cover mosaic
  const featuredImages = [];
  allCats.forEach(cat => {
    cat.subs.forEach(sub => {
      sub.items.forEach(item => {
        if (item.image_url && featuredImages.length < 6) featuredImages.push(item.image_url);
      });
    });
  });

  // Category index for cover
  const catIndex = allCats.map(c => `${c.icon || '🍽️'} ${c.name}`).join('  ◆  ');

  // ─── RENDER HELPERS ───────────────────────────────────────────

  const renderPrices = (sizes, fontSize = '14px', labelSize = '9px') => {
    if (!sizes || sizes.length === 0) {
      return <span className="pm-text" style={{ fontSize: '10px', fontWeight: 500, color: '#aaa' }}>حسب الاختيار</span>;
    }
    if (sizes.length === 1) {
      return (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '3px', whiteSpace: 'nowrap' }}>
          <span className="pm-text" style={{ fontSize, fontWeight: 800, color: '#1a1a1a' }}>{Number(sizes[0].price).toFixed(0)}</span>
          <span className="pm-text" style={{ fontSize: '9px', fontWeight: 500, color: '#bbb' }}>ج.م</span>
        </span>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
        {sizes.slice(0, 4).map((s, idx) => (
          <span key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '4px', whiteSpace: 'nowrap' }}>
            <span className="pm-text" style={{ fontSize: labelSize, fontWeight: 600, color: '#999' }}>{s.name}</span>
            <span className="pm-text" style={{ fontSize, fontWeight: 800, color: '#1a1a1a' }}>{Number(s.price).toFixed(0)}</span>
            <span className="pm-text" style={{ fontSize: '8px', fontWeight: 500, color: '#bbb' }}>ج.م</span>
          </span>
        ))}
        {sizes.length > 4 && (
          <span className="pm-text" style={{ fontSize: '9px', color: '#bbb' }}>+{sizes.length - 4} أحجام</span>
        )}
      </div>
    );
  };

  const renderHeroCard = (item) => {
    const sizes = item.item_sizes || [];
    return (
      <div key={item.id} className="pm-no-break" style={{ marginBottom: sp.itemGap, paddingBottom: sp.itemGap }}>
        {/* Full-width image */}
        <div style={{
          width: '100%', height: sp.heroH, borderRadius: '8px',
          overflow: 'hidden', border: '1px solid #eee', background: '#f5f5f5',
        }}>
          <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Info below image */}
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 className="pm-text" style={{ fontSize: sp.heroFont, fontWeight: 800, color: '#1a1a1a', margin: 0, lineHeight: 1.3 }}>
              {item.name}
            </h4>
            {item.description && (
              <p className="pm-text pm-clamp-2" style={{ fontSize: '10.5px', fontWeight: 400, color: '#999', lineHeight: 1.6, margin: '4px 0 0' }}>
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Size pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          {sizes.length > 0 ? sizes.map((s, idx) => (
            <div key={idx} style={{
              borderRadius: '20px', padding: '5px 14px',
              border: '1px solid #e8e8e8', background: 'white',
              display: 'flex', alignItems: 'baseline', gap: '5px',
            }}>
              {sizes.length > 1 && (
                <span className="pm-text" style={{ fontSize: '9px', fontWeight: 600, color: '#888' }}>{s.name}</span>
              )}
              {sizes.length > 1 && <span style={{ color: '#ddd', fontSize: '8px' }}>·</span>}
              <span className="pm-text" style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a1a' }}>{Number(s.price).toFixed(0)}</span>
              <span className="pm-text" style={{ fontSize: '9px', fontWeight: 500, color: '#bbb' }}>ج.م</span>
            </div>
          )) : (
            <span className="pm-text" style={{ fontSize: '10px', fontWeight: 500, color: '#aaa' }}>حسب الاختيار</span>
          )}
        </div>
      </div>
    );
  };

  const renderStandardRow = (item, isLast) => {
    const sizes = item.item_sizes || [];
    const hasImage = !!item.image_url;
    return (
      <div key={item.id} className="pm-no-break" style={{
        marginBottom: sp.itemGap, paddingBottom: isLast ? 0 : sp.itemGap,
        borderBottom: isLast ? 'none' : '1px dotted #e8e8e8',
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          {hasImage && (
            <img src={item.image_url} alt="" style={{
              width: '44px', height: '44px', borderRadius: '10px',
              objectFit: 'cover', border: '1px solid #eee', flexShrink: 0,
            }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="pm-text" style={{
                fontSize: '14px', fontWeight: 700, color: '#1a1a1a',
                lineHeight: 1.3, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '55%',
              }}>
                {item.name}
              </span>
              <span style={{
                flex: 1, borderBottom: '1.5px dotted #d8d8d8',
                minWidth: '16px', position: 'relative', top: '-3px', margin: '0 4px',
              }} />
              <div style={{ flexShrink: 0 }}>
                {renderPrices(sizes)}
              </div>
            </div>
            {item.description && (
              <p className="pm-text pm-clamp-2" style={{
                fontSize: '10.5px', fontWeight: 400, color: '#999',
                lineHeight: 1.55, margin: '3px 0 0',
              }}>
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCompactPair = (itemA, itemB, isLast) => {
    const renderCompactCell = (item) => {
      const sizes = item.item_sizes || [];
      return (
        <div>
          <h4 className="pm-text" style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.3 }}>
            {item.name}
          </h4>
          {item.description && (
            <p className="pm-text pm-clamp-1" style={{ fontSize: '9.5px', fontWeight: 400, color: '#aaa', lineHeight: 1.5, margin: '2px 0 0' }}>
              {item.description}
            </p>
          )}
          <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'baseline' }}>
            {sizes.length > 0 ? sizes.map((s, idx) => (
              <span key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '3px', whiteSpace: 'nowrap' }}>
                {sizes.length > 1 && (
                  <span className="pm-text" style={{ fontSize: '8px', fontWeight: 600, color: '#aaa' }}>{s.name}</span>
                )}
                <span className="pm-text" style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a' }}>{Number(s.price).toFixed(0)}</span>
                <span className="pm-text" style={{ fontSize: '8px', fontWeight: 500, color: '#bbb' }}>ج.م</span>
                {idx < sizes.length - 1 && <span style={{ color: '#ddd', fontSize: '10px', margin: '0 2px' }}>/</span>}
              </span>
            )) : (
              <span className="pm-text" style={{ fontSize: '9px', color: '#aaa' }}>حسب الاختيار</span>
            )}
          </div>
        </div>
      );
    };

    return (
      <div key={itemA.id} className="pm-no-break" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
        marginBottom: sp.itemGap, paddingBottom: isLast ? 0 : sp.itemGap,
        borderBottom: isLast ? 'none' : '1px dotted #e8e8e8',
      }}>
        <div style={{ paddingLeft: '16px', borderLeft: '0.5px solid #eee' }}>
          {renderCompactCell(itemA)}
        </div>
        <div>
          {renderCompactCell(itemB)}
        </div>
      </div>
    );
  };

  // ─── RENDER ITEMS FOR A SUBCATEGORY ───────────────────────────

  const renderSubItems = (subItems) => {
    const elements = [];
    let i = 0;
    while (i < subItems.length) {
      const item = subItems[i];
      const isLast = (item._variant === 'compact-left')
        ? (i + 1 >= subItems.length - 1)
        : (i >= subItems.length - 1);

      if (item._variant === 'hero') {
        elements.push(renderHeroCard(item));
      } else if (item._variant === 'compact-left' && i + 1 < subItems.length) {
        const pair = subItems[i + 1];
        const pairIsLast = i + 2 >= subItems.length;
        elements.push(renderCompactPair(item, pair, pairIsLast));
        i += 2;
        continue;
      } else if (item._variant === 'compact-right') {
        // already handled by compact-left
        i++;
        continue;
      } else {
        elements.push(renderStandardRow(item, i >= subItems.length - 1));
      }
      i++;
    }
    return elements;
  };

  // ─── JSX ──────────────────────────────────────────────────────

  return (
    <div className="hidden print:block" dir="rtl" style={{ '--pm-accent': tc }}>

      {/* ═══ STYLES ═══ */}
      <style dangerouslySetInnerHTML={{ __html: `

        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          nav, footer, .khatwah-chrome, .no-print { display: none !important; visibility: hidden !important; height: 0 !important; }

          /* Cover */
          .pm-cover {
            background: white; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            page-break-after: always; break-after: page;
          }

          /* Menu body */
          .pm-body { padding: 12mm 14mm 16mm; background: white; }

          /* Page breaks */
          .pm-no-break { page-break-inside: avoid; break-inside: avoid; }
          .pm-keep-next { page-break-after: avoid; break-after: avoid; }

          /* Text clamp */
          .pm-clamp-1 {
            display: -webkit-box; -webkit-line-clamp: 1;
            -webkit-box-orient: vertical; overflow: hidden;
          }
          .pm-clamp-2 {
            display: -webkit-box; -webkit-line-clamp: 2;
            -webkit-box-orient: vertical; overflow: hidden;
          }

          /* Typography */
          .pm-display { font-family: "terrabica", "Cairo", "IBM Plex Sans Arabic", serif; }
          .pm-text { font-family: "Cairo", "IBM Plex Sans Arabic", sans-serif; }
        }

        /* Hide on screen */
        @media screen {
          .pm-cover, .pm-body { display: none !important; }
        }
      `}} />


      {/* ═══════════════════════════════════════════════════════ */}
      {/*                     COVER PAGE                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="pm-cover">
        <div className="pm-frame-outer" />
        <div className="pm-frame-inner" />
        <div className="pm-corner pm-corner-tl" />
        <div className="pm-corner pm-corner-tr" />
        <div className="pm-corner pm-corner-bl" />
        <div className="pm-corner pm-corner-br" />

        {/* Banner */}
        {restaurant.banner_url ? (
          <img src={restaurant.banner_url} alt="" style={{
            width: '170mm', height: '80mm', objectFit: 'cover',
            borderRadius: '8px', border: '1px solid #e8e8e8',
          }} />
        ) : (
          <div style={{
            width: '170mm', height: '80mm', borderRadius: '8px',
            background: `linear-gradient(135deg, ${tc}12 0%, ${tc}06 100%)`,
            border: '1px solid #eee',
          }} />
        )}

        {/* Logo */}
        <div style={{
          width: '96px', height: '96px', borderRadius: '50%',
          border: '3px solid white', overflow: 'hidden', background: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          marginTop: '-48px', position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#ccc' }}>{restaurant.name?.charAt(0)}</span>
          )}
        </div>

        {/* Name */}
        <h1 className="pm-display" style={{
          fontSize: '44px', fontWeight: 900, color: '#1a1a1a',
          marginTop: '18px', lineHeight: 1.1, textAlign: 'center', letterSpacing: '2px',
        }}>
          {restaurant.name}
        </h1>

        {/* Ornamental divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '16px 0 8px' }}>
          <div style={{ width: '55px', height: '1px', background: tc, opacity: 0.35 }} />
          <div style={{ width: '7px', height: '7px', background: tc, transform: 'rotate(45deg)', opacity: 0.4 }} />
          <div style={{ width: '55px', height: '1px', background: tc, opacity: 0.35 }} />
        </div>

        {/* Subtitle */}
        <p className="pm-text" style={{ fontSize: '14px', fontWeight: 600, color: '#999', letterSpacing: '3px', textAlign: 'center' }}>
          قائمة الطعام
        </p>

        {/* Featured food mosaic */}
        {featuredImages.length >= 3 && (
          <div style={{
            display: 'flex', gap: '8px', marginTop: '20px',
            justifyContent: 'center', alignItems: 'center',
          }}>
            {featuredImages.slice(0, 5).map((url, i) => (
              <div key={i} style={{
                width: '76px',
                height: '76px',
                borderRadius: '16px', overflow: 'hidden',
                border: '1.5px solid #eee', flexShrink: 0,
              }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}

        {/* QR code */}
        <div style={{
          marginTop: featuredImages.length >= 3 ? '20px' : '36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        }}>
          <div style={{ padding: '8px', border: '1.5px solid #e0e0e0', borderRadius: '16px', background: 'white' }}>
            <img src={qrSrc} alt="QR" style={{ width: '10rem', height: '10rem', display: 'block' }} />
          </div>
          <span className="pm-text" style={{ fontSize: '9px', fontWeight: 700, color: '#bbb', letterSpacing: '1px' }}>
            امسح للطلب أونلاين
          </span>
        </div>

        {/* Cover footer */}
        <div className="pm-text" style={{
          position: 'absolute', bottom: '12mm', left: '16mm', right: '16mm',
          textAlign: 'center', fontSize: '8px', color: '#ccc', letterSpacing: '0.5px',
        }}>
          {restaurant.name} &mdash; khatwah.online
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════ */}
      {/*                     MENU BODY                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="pm-body">

        {/* Running header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '10px', marginBottom: '28px', borderBottom: '0.5px solid #e8e8e8',
        }}>
          <span className="pm-text" style={{ fontSize: '10px', fontWeight: 700, color: '#c0c0c0', letterSpacing: '1px' }}>
            {restaurant.name}
          </span>
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt="" style={{ width: '20px', height: '20px', borderRadius: '6px', objectFit: 'contain' }} />
          )}
        </div>

        {/* Categories */}
        {allCats.map((cat, catIdx) => (
          <div key={cat.id} style={{ marginBottom: catIdx < allCats.length - 1 ? sp.catGap : 0 }}>

            {/* Category header */}
            <div className="pm-no-break pm-keep-next" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              paddingBottom: '10px', marginBottom: '22px',
              borderBottom: `2.5px solid ${tc}`,
            }}>
              <h2 className="pm-display" style={{
                fontSize: sp.catFont, fontWeight: 900, color: '#1a1a1a',
                lineHeight: 1.15, margin: 0,
              }}>
                {cat.name}
              </h2>
            </div>

            {/* Subcategories */}
            {cat.subs.map((sub, subIdx) => {
              const smallSub = sub.items.length <= 5;
              return (
                <div key={sub.id}
                  className={smallSub ? 'pm-no-break' : undefined}
                  style={{ marginBottom: subIdx < cat.subs.length - 1 ? sp.subGap : 0 }}
                >
                  {/* Subcategory label */}
                  <div className="pm-keep-next" style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ flex: 1, height: '0.5px', background: '#e4e4e4' }} />
                    <h3 className="pm-text" style={{
                      fontSize: '13px', fontWeight: 800, color: tc,
                      whiteSpace: 'nowrap', padding: '0 6px', margin: 0,
                    }}>
                      {sub.name}
                    </h3>
                    <div style={{ width: '28px', height: '0.5px', background: '#e4e4e4' }} />
                  </div>

                  {/* Items */}
                  {renderSubItems(sub.items)}
                </div>
              );
            })}

            {/* Between-category ornament */}
            {catIdx < allCats.length - 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginTop: '12px',
              }}>
                <div style={{ width: '40px', height: '0.5px', background: '#e0e0e0' }} />
                <div style={{ width: '5px', height: '5px', background: '#ddd', transform: 'rotate(45deg)' }} />
                <div style={{ width: '40px', height: '0.5px', background: '#e0e0e0' }} />
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {allCats.length === 0 && (
          <div className="pm-text" style={{ textAlign: 'center', padding: '60px 0', color: '#bbb', fontSize: '14px', fontWeight: 600 }}>
            لا توجد أصناف متاحة حالياً
          </div>
        )}

        {/* Page footer */}
        <div style={{
          marginTop: '44px', paddingTop: '14px', borderTop: '1px solid #eee',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '14px', flexWrap: 'wrap',
        }}>
          <span className="pm-text" style={{ fontSize: '9px', fontWeight: 600, color: '#c0c0c0' }}>الأسعار بالجنيه المصري</span>
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ddd' }} />
          <span className="pm-text" style={{ fontSize: '9px', fontWeight: 600, color: '#c0c0c0' }}>امسح الـ QR للصور والطلب أونلاين</span>
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ddd' }} />
          <span className="pm-text" style={{ fontSize: '9px', fontWeight: 600, color: '#c0c0c0' }}>khatwah.online</span>
        </div>
      </div>
    </div>
  );
}
