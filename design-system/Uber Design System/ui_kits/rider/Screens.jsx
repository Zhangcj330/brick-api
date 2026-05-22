// Rider UI Kit — primary screens

// =================== HomeScreen — map with "Where to?" sheet ===================
const HomeScreen = ({ onSearch, onMenu, savedPlaces = [] }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
    <MapBackground withPickup/>
    {/* Top floating round button — menu */}
    <button onClick={onMenu} style={{
      position: 'absolute', top: 56, left: 16, width: 44, height: 44, borderRadius: 999,
      background: '#fff', border: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    }}>
      <Icon name="menu" size={22}/>
    </button>

    {/* Locate-me FAB */}
    <button style={{
      position: 'absolute', bottom: 360, right: 16, width: 44, height: 44, borderRadius: 999,
      background: '#fff', border: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    }}>
      <Icon name="crosshair" size={22}/>
    </button>

    {/* Bottom sheet */}
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.12)', padding: '12px 16px 28px',
    }}>
      <div style={{ width: 36, height: 4, background: '#E2E2E2', borderRadius: 999, margin: '4px auto 14px' }}/>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1.1 }}>Where to?</h2>

      {/* Search field */}
      <button onClick={onSearch} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        background: '#F6F6F6', border: 0, borderRadius: 8, padding: '14px 16px',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <Icon name="search" size={20}/>
        <span style={{ flex: 1, fontSize: 15, color: '#000', fontWeight: 500 }}>Search destinations</span>
        <span style={{
          fontSize: 12, fontWeight: 600, padding: '4px 10px', background: '#fff',
          borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Icon name="clock" size={12}/> Later
        </span>
      </button>

      {/* Saved places */}
      <div style={{ marginTop: 16 }}>
        {savedPlaces.map((p, i) => (
          <button key={i} onClick={() => onSearch(p)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 4px', background: 'transparent', border: 0, cursor: 'pointer',
            borderBottom: i < savedPlaces.length - 1 ? '1px solid #EEEEEE' : 0, textAlign: 'left',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: '#F6F6F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={p.icon} size={18}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>{p.name}</div>
              <div style={{ fontSize: 13, color: '#757575', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// =================== SearchScreen — destination picker ===================
const SearchScreen = ({ onClose, onSelect }) => {
  const [query, setQuery] = React.useState('');
  const results = [
    { icon: 'pin', name: 'SFO Airport · Terminal 2', address: 'San Francisco International, 780 S Airport Blvd', eta: '38 min' },
    { icon: 'pin', name: 'Ferry Building', address: '1 Ferry Building, San Francisco', eta: '12 min' },
    { icon: 'pin', name: 'Salesforce Tower', address: '415 Mission St, San Francisco', eta: '7 min' },
    { icon: 'clock', name: '24th St Mission BART', address: '2800 Mission St, San Francisco', eta: '14 min', recent: true },
    { icon: 'clock', name: 'Tartine Bakery', address: '600 Guerrero St, San Francisco', eta: '9 min', recent: true },
  ];
  const filtered = query ? results.filter(r => r.name.toLowerCase().includes(query.toLowerCase())) : results;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <div style={{ padding: '52px 16px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onClose} style={{ width: 40, height: 40, background: 'transparent', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="arrow-left" size={22}/>
        </button>
        <div style={{ flex: 1, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Plan your ride</div>
      </div>
      {/* Two-line pickup/destination input */}
      <div style={{ margin: '4px 16px 12px', background: '#F6F6F6', borderRadius: 12, padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #EEEEEE' }}>
          <div style={{ width: 10, height: 10, background: '#000', borderRadius: 999 }}/>
          <input defaultValue="Current location" style={{ flex: 1, border: 0, background: 'transparent', fontSize: 15, fontWeight: 500, outline: 'none' }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
          <div style={{ width: 10, height: 10, background: '#06C167', borderRadius: 2 }}/>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Where to?" style={{ flex: 1, border: 0, background: 'transparent', fontSize: 15, fontWeight: 500, outline: 'none' }}/>
        </div>
      </div>
      {/* Results */}
      <div>
        {filtered.map((r, i) => (
          <button key={i} onClick={() => onSelect(r)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            background: 'transparent', border: 0, borderBottom: '1px solid #F6F6F6', textAlign: 'left', cursor: 'pointer',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: '#F6F6F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={r.icon} size={18}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>{r.name}</div>
              <div style={{ fontSize: 13, color: '#757575', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address}</div>
            </div>
            <div style={{ fontSize: 12, color: '#757575', fontFeatureSettings: '"tnum"' }}>{r.eta}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// =================== RideOptions — pick a vehicle ===================
const RideOptions = ({ destination, onBack, onConfirm }) => {
  const [selected, setSelected] = React.useState(0);
  // Tier illustrations — simple SVG car silhouettes (placeholder for licensed Uber 3D vehicle art).
  const CarMark = ({ tier }) => {
    const sizes = { X: 36, Comfort: 40, XL: 44, Black: 38 };
    const fills = { X: '#1F1F1F', Comfort: '#2E2E2E', XL: '#1F1F1F', Black: '#000' };
    return (
      <svg width="56" height="36" viewBox="0 0 56 36" fill="none">
        <ellipse cx="28" cy="33" rx="22" ry="2" fill="#000" opacity="0.08"/>
        <path d={tier === 'XL'
          ? 'M6 26 L 6 18 Q 6 16 7 14 L 13 6 Q 14 4 17 4 L 39 4 Q 42 4 43 6 L 49 14 Q 50 16 50 18 L 50 26 Q 50 28 48 28 L 8 28 Q 6 28 6 26 Z'
          : 'M5 25 L 5 17 Q 5 14 7 12 L 13 7 Q 16 5 19 5 L 37 5 Q 40 5 43 7 L 49 12 Q 51 14 51 17 L 51 25 Q 51 27 49 27 L 7 27 Q 5 27 5 25 Z'}
          fill={fills[tier]}/>
        <path d="M12 13 L 17 8 Q 18 7 20 7 L 36 7 Q 38 7 39 8 L 44 13 Z" fill="#fff" opacity="0.92"/>
        <circle cx="14" cy="27" r="4" fill="#000"/><circle cx="14" cy="27" r="1.6" fill="#666"/>
        <circle cx="42" cy="27" r="4" fill="#000"/><circle cx="42" cy="27" r="1.6" fill="#666"/>
      </svg>
    );
  };
  const options = [
    { name: 'UberX',   tier: 'X',       sub: 'Affordable rides, all to yourself',  price: '$12.40', eta: '3 min' },
    { name: 'Comfort', tier: 'Comfort', sub: 'Newer cars with extra legroom',      price: '$15.80', eta: '5 min' },
    { name: 'UberXL',  tier: 'XL',      sub: 'Affordable rides for groups up to 6', price: '$22.10', eta: '6 min' },
    { name: 'Black',   tier: 'Black',   sub: 'Premium rides in luxury cars',       price: '$28.90', eta: '8 min' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <MapBackground withRoute withPickup withDestination/>
      <button onClick={onBack} style={{ position: 'absolute', top: 56, left: 16, width: 44, height: 44, borderRadius: 999,
        background: '#fff', border: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name="arrow-left" size={22}/>
      </button>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.12)', maxHeight: '70%', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ width: 36, height: 4, background: '#E2E2E2', borderRadius: 999, margin: '10px auto 8px' }}/>
        <div style={{ padding: '4px 16px 8px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Choose a ride</div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {options.map((o, i) => (
            <button key={i} onClick={() => setSelected(i)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: i === selected ? '#F6F6F6' : 'transparent', border: 0, textAlign: 'left', cursor: 'pointer',
              borderLeft: i === selected ? '3px solid #000' : '3px solid transparent',
            }}>
              <div style={{ width: 56, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CarMark tier={o.tier}/></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.005em' }}>{o.name}</span>
                  <span style={{ fontSize: 13, color: '#757575', fontFeatureSettings: '"tnum"' }}>· {o.eta}</span>
                </div>
                <div style={{ fontSize: 13, color: '#757575', marginTop: 2 }}>{o.sub}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFeatureSettings: '"tnum"', letterSpacing: '-0.01em' }}>{o.price}</div>
            </button>
          ))}
        </div>

        {/* Payment + confirm */}
        <div style={{ borderTop: '1px solid #EEEEEE', padding: '12px 16px 26px' }}>
          <button style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: 'transparent', border: '1px solid #E2E2E2', borderRadius: 8, marginBottom: 10,
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>
            <Icon name="card" size={18}/>
            <span style={{ flex: 1, textAlign: 'left' }}>Personal · Visa ··4242</span>
            <Icon name="chevron-down" size={16}/>
          </button>
          <button onClick={() => onConfirm(options[selected])} style={{
            width: '100%', padding: '16px', background: '#000', color: '#fff', border: 0,
            borderRadius: 8, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, letterSpacing: '-0.005em', cursor: 'pointer',
          }}>
            Choose {options[selected].name}
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== Tracking — driver arriving / en route ===================
const TrackingScreen = ({ ride, onCancel, onComplete }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
    <MapBackground withRoute withPickup withDestination animateCar/>
    <button style={{ position: 'absolute', top: 56, right: 16, width: 44, height: 44, borderRadius: 999,
      background: '#fff', border: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <Icon name="shield" size={20}/>
    </button>

    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.14)', padding: '12px 16px 28px',
    }}>
      <div style={{ width: 36, height: 4, background: '#E2E2E2', borderRadius: 999, margin: '4px auto 14px' }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Arriving in 3 min</h2>
      </div>
      <div style={{ fontSize: 13, color: '#757575', marginBottom: 14 }}>{ride?.name || 'UberX'} · meeting at curb</div>

      {/* Driver card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid #EEEEEE', borderBottom: '1px solid #EEEEEE' }}>
        <div style={{ width: 48, height: 48, borderRadius: 999, background: '#1F1F1F', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>M</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.005em', display: 'flex', alignItems: 'center', gap: 6 }}>
            Maria <span style={{ fontSize: 12, color: '#757575', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}>★ 4.92</span>
          </div>
          <div style={{ fontSize: 13, color: '#757575' }}>Silver Toyota Prius · 7XKT420</div>
        </div>
        <button style={{ width: 44, height: 44, borderRadius: 999, background: '#F6F6F6', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="message" size={20}/>
        </button>
        <button style={{ width: 44, height: 44, borderRadius: 999, background: '#F6F6F6', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="phone" size={20}/>
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button style={{ flex: 1, padding: '12px', background: '#F6F6F6', border: 0, borderRadius: 8, fontFamily: 'inherit',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="shield-check" size={16}/> Share trip
        </button>
        <button onClick={onCancel} style={{ flex: 1, padding: '12px', background: '#F6F6F6', border: 0, borderRadius: 8, fontFamily: 'inherit',
          fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      <button onClick={onComplete} style={{
        width: '100%', padding: '14px', background: '#fff', color: '#000', border: '1px solid #000',
        borderRadius: 8, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 10,
      }}>
        Simulate arrival
      </button>
    </div>
  </div>
);

// =================== ReceiptScreen — trip complete ===================
const ReceiptScreen = ({ ride, onDone }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '52px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button onClick={onDone} style={{ width: 40, height: 40, background: 'transparent', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name="x" size={22}/>
      </button>
      <button style={{ background: 'transparent', border: 0, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Help</button>
    </div>

    <div style={{ padding: '18px 24px 24px', flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#757575', marginBottom: 8 }}>Trip complete</div>
      <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{ride?.price || '$12.40'}</div>
      <div style={{ fontSize: 14, color: '#757575', marginTop: 8 }}>14 min · 2.6 mi · arrived 4:26 PM</div>

      {/* rate */}
      <div style={{ marginTop: 32, padding: '20px', background: '#F6F6F6', borderRadius: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.005em' }}>How was your trip with Maria?</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ width: 40, height: 40, borderRadius: 999, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="star" size={22} color={n <= 5 ? '#000' : '#CBCBCB'}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #EEEEEE', fontSize: 14 }}>
          <span style={{ color: '#757575' }}>Trip fare</span>
          <span style={{ fontWeight: 600, fontFeatureSettings: '"tnum"' }}>$10.80</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #EEEEEE', fontSize: 14 }}>
          <span style={{ color: '#757575' }}>Booking fee</span>
          <span style={{ fontWeight: 600, fontFeatureSettings: '"tnum"' }}>$1.60</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 15 }}>
          <span style={{ fontWeight: 700 }}>Total</span>
          <span style={{ fontWeight: 700, fontFeatureSettings: '"tnum"' }}>$12.40</span>
        </div>
      </div>
    </div>

    <div style={{ padding: '12px 16px 26px' }}>
      <button onClick={onDone} style={{
        width: '100%', padding: '16px', background: '#000', color: '#fff', border: 0,
        borderRadius: 8, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer',
      }}>
        Done
      </button>
    </div>
  </div>
);

Object.assign(window, { HomeScreen, SearchScreen, RideOptions, TrackingScreen, ReceiptScreen });
