// =================== Eats top nav with address + delivery toggle ===================
const EatsHeader = ({ address = '500 Howard St' }) => (
  <div style={{ padding: '50px 16px 8px', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
    <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', background: '#F6F6F6', border: 0, borderRadius: 999, fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
      Delivery <Icon name="chevron-down" size={14}/>
    </button>
    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'transparent', border: 0, fontFamily: 'inherit', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', cursor: 'pointer', flex: 1, justifyContent: 'flex-start' }}>
      <Icon name="pin" size={16}/> {address} <Icon name="chevron-down" size={14}/>
    </button>
    <button style={{ width: 36, height: 36, borderRadius: 999, background: '#F6F6F6', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <Icon name="user" size={18}/>
    </button>
  </div>
);

// =================== Eats search bar ===================
const EatsSearch = ({ onClick }) => (
  <button onClick={onClick} style={{
    margin: '6px 16px 6px', width: 'calc(100% - 32px)', display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px', background: '#F6F6F6', border: 0, borderRadius: 999, cursor: 'pointer',
    textAlign: 'left',
  }}>
    <Icon name="search" size={18}/>
    <span style={{ flex: 1, fontSize: 14, color: '#545454', fontWeight: 500 }}>Search Uber Eats</span>
  </button>
);

// =================== Category chips ===================
const Categories = () => {
  const cats = [
    { label: 'Pizza',   bg: '#FFE3D5' },
    { label: 'Sushi',   bg: '#D6E9FF' },
    { label: 'Burgers', bg: '#FFD8C2' },
    { label: 'Tacos',   bg: '#FFEFC4' },
    { label: 'Healthy', bg: '#D8F1DD' },
    { label: 'Coffee',  bg: '#E7DCC9' },
    { label: 'Dessert', bg: '#F7D5E3' },
    { label: 'Asian',   bg: '#FFDDD2' },
  ];
  return (
    <div style={{ overflowX: 'auto', padding: '6px 16px 14px', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
        {cats.map(c => (
          <div key={c.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 70 }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: c.bg, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: '20% 16%', background: 'rgba(0,0,0,0.06)', borderRadius: '50%' }}/>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-0.005em' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// =================== Filter row ===================
const FilterRow = () => {
  const filters = ['Pickup', 'Under 30 min', 'Top Eats', 'Best overall', 'Rating', '$', 'Offers'];
  return (
    <div style={{ overflowX: 'auto', padding: '4px 16px 14px' }}>
      <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
        {filters.map((f, i) => (
          <button key={f} style={{
            padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            border: '1px solid #E2E2E2', background: i === 0 ? '#000' : '#fff', color: i === 0 ? '#fff' : '#000',
            borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
};

// =================== Restaurant card ===================
const RestaurantCard = ({ r, onClick }) => (
  <div onClick={onClick} role="button" tabIndex={0} style={{ width: '100%', padding: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer', marginBottom: 18 }}>
    <div style={{ position: 'relative' }}>
      <FoodArt palette={r.palette} accent={r.accent} height={150}/>
      <div style={{ position: 'absolute', top: 10, left: 10, background: '#fff', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
        {r.offer || `${r.deliveryFee} Delivery Fee`}
      </div>
      <div role="button" tabIndex={0} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name="plus" size={16}/>
      </div>
    </div>
    <div style={{ padding: '10px 2px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{r.name}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: 18, height: 18, background: '#F6F6F6', borderRadius: 999, textAlign: 'center', lineHeight: '18px', fontSize: 11, fontWeight: 700 }}>{r.rating}</span>
          <span style={{ color: '#757575', fontWeight: 500 }}>({r.reviews})</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: '#757575', marginTop: 4, fontFeatureSettings: '"tnum"' }}>
        {r.time} · {r.distance}
      </div>
    </div>
  </div>
);

// =================== Eats Home ===================
const EatsHome = ({ onOpenRestaurant }) => {
  const restaurants = [
    { name: "Tartine Bakery", rating: 4.8, reviews: '2.4K', time: '15–25 min', distance: '0.4 mi', deliveryFee: '$0.49', offer: 'Free delivery', palette: ['#FFD89E', '#FF9F65'], accent: '#FF7E45' },
    { name: "Pizzeria Delfina", rating: 4.7, reviews: '1.8K', time: '20–30 min', distance: '0.9 mi', deliveryFee: '$2.99', palette: ['#FFE0B2', '#FFB85F'], accent: '#E04A2D' },
    { name: "Souvla", rating: 4.9, reviews: '3.1K', time: '20–30 min', distance: '1.2 mi', deliveryFee: '$1.99', offer: '20% off', palette: ['#DCEFC5', '#A6CB7C'], accent: '#3F7A2E' },
    { name: "Mensho Tokyo", rating: 4.8, reviews: '5.2K', time: '25–35 min', distance: '1.5 mi', deliveryFee: '$3.49', palette: ['#E8D6BD', '#9B7A5B'], accent: '#5B3C28' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', overflowY: 'auto' }}>
      <EatsHeader/>
      <EatsSearch onClick={() => {}}/>
      <Categories/>
      <FilterRow/>
      {/* Section heading */}
      <div style={{ padding: '4px 16px 14px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Featured on Uber Eats</h2>
      </div>
      <div style={{ padding: '0 16px 100px' }}>
        {restaurants.map((r, i) => <RestaurantCard key={i} r={r} onClick={() => onOpenRestaurant(r)}/>)}
      </div>
      {/* Bottom nav */}
      <EatsTabBar/>
    </div>
  );
};

// =================== Tab bar ===================
const EatsTabBar = ({ active = 'home' }) => {
  const tabs = [
    { id: 'home',    icon: 'home',   label: 'Home' },
    { id: 'browse',  icon: 'search', label: 'Browse' },
    { id: 'orders',  icon: 'card',   label: 'Orders' },
    { id: 'account', icon: 'user',   label: 'Account' },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff',
      borderTop: '1px solid #EEEEEE', padding: '8px 8px 28px', display: 'flex' }}>
      {tabs.map(t => (
        <button key={t.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          padding: 4, background: 'transparent', border: 0, cursor: 'pointer',
          color: t.id === active ? '#000' : '#757575' }}>
          <Icon name={t.icon} size={22} strokeWidth={t.id === active ? 2.5 : 2}/>
          <span style={{ fontSize: 10, fontWeight: t.id === active ? 700 : 500 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// =================== Restaurant detail ===================
const RestaurantDetail = ({ r, onBack, onAddToCart }) => {
  const menu = [
    { name: 'Morning Bun', desc: 'Buttery croissant dough with orange-cinnamon sugar', price: '$5.50', palette: ['#FFD89E', '#FF9F65'] },
    { name: 'Country Bread', desc: 'Naturally leavened, baked dark — half loaf', price: '$9.00', palette: ['#E8D6BD', '#9B7A5B'] },
    { name: 'Lemon Cream Tart', desc: 'House lemon cream in a sablé shell', price: '$7.25', palette: ['#FFF3C4', '#FFD66B'] },
    { name: 'Eclair au Chocolat', desc: 'Choux, chocolate cream, dark glaze', price: '$6.50', palette: ['#E8C8A8', '#8B5A2B'] },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', overflowY: 'auto' }}>
      <div style={{ position: 'relative', height: 220 }}>
        <FoodArt palette={r.palette} accent={r.accent} height={220} radius={0}/>
        <button onClick={onBack} style={{ position: 'absolute', top: 52, left: 16, width: 40, height: 40, borderRadius: 999,
          background: '#fff', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}>
          <Icon name="arrow-left" size={20}/>
        </button>
      </div>
      <div style={{ padding: '20px 18px 10px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.05 }}>{r.name}</h2>
        <div style={{ marginTop: 6, fontSize: 13, color: '#757575' }}>
          <span style={{ color: '#000', fontWeight: 700 }}>★ {r.rating}</span> ({r.reviews}) · {r.time} · {r.distance}
        </div>
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#F6F6F6', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
          {r.offer || `${r.deliveryFee} delivery · arrives by 4:24 PM`}
        </div>
      </div>
      {/* Menu list */}
      <div style={{ padding: '6px 18px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, padding: '14px 0 10px', letterSpacing: '-0.01em' }}>Most popular</div>
        {menu.map((m, i) => (
          <button key={i} onClick={() => onAddToCart(m)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
            borderTop: '1px solid #EEEEEE', background: 'transparent', border: 0, borderBottom: 0,
            borderLeft: 0, borderRight: 0, cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.005em' }}>{m.name}</div>
              <div style={{ fontSize: 13, color: '#757575', marginTop: 4, lineHeight: 1.4 }}>{m.desc}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, fontFeatureSettings: '"tnum"' }}>{m.price}</div>
            </div>
            <div style={{ width: 84, height: 84, position: 'relative', flexShrink: 0 }}>
              <FoodArt palette={m.palette} accent={m.palette[1]} height={84} radius={10}/>
              <div style={{ position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}>
                <Icon name="plus" size={16}/>
              </div>
            </div>
          </button>
        ))}
        <div style={{ height: 100 }}/>
      </div>
    </div>
  );
};

// =================== Cart sheet ===================
const CartBar = ({ count, total, onCheckout }) => (
  <div style={{ position: 'absolute', left: 16, right: 16, bottom: 28, background: '#000', color: '#fff',
    borderRadius: 999, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
    <div style={{ background: '#fff', color: '#000', borderRadius: 999, width: 26, height: 26, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{count}</div>
    <div style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>View cart</div>
    <button onClick={onCheckout} style={{ background: 'transparent', border: 0, color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFeatureSettings: '"tnum"' }}>${total.toFixed(2)}</button>
  </div>
);

// =================== Order tracking ===================
const OrderTracking = ({ onDone }) => {
  const steps = [
    { label: 'Order placed', done: true },
    { label: 'Preparing your order', done: true, current: false },
    { label: 'Courier on the way', done: false, current: true },
    { label: 'Delivered', done: false },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 280, position: 'relative', background: '#E8EBEE' }}>
        <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
          <rect width="400" height="280" fill="#E4E8EA"/>
          <g stroke="#fff" strokeWidth="14" strokeLinecap="round" fill="none">
            <path d="M-20 140 L 420 100"/>
            <path d="M-20 220 L 420 200"/>
            <path d="M150 -20 L 130 320"/>
          </g>
          <g fill="#D0D5D8">
            <rect x="180" y="50" width="60" height="36" rx="2"/>
            <rect x="260" y="40" width="80" height="50" rx="2"/>
            <rect x="60" y="160" width="60" height="36" rx="2"/>
            <rect x="280" y="240" width="60" height="36" rx="2"/>
          </g>
          <path d="M 100 240 Q 180 160 260 100" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round"/>
          <path d="M 100 240 Q 180 160 260 100" stroke="#06C167" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <circle cx="100" cy="240" r="8" fill="#000" stroke="#fff" strokeWidth="3"/>
          <circle cx="260" cy="100" r="8" fill="#06C167" stroke="#fff" strokeWidth="3"/>
        </svg>
        <button onClick={onDone} style={{ position: 'absolute', top: 52, left: 16, width: 40, height: 40, borderRadius: 999, background: '#fff', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}>
          <Icon name="arrow-left" size={20}/>
        </button>
      </div>
      <div style={{ padding: '20px 18px 28px', flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06C167' }}>On the way</div>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 4 }}>4:18 – 4:24 PM</div>
        <div style={{ fontSize: 14, color: '#757575', marginTop: 6 }}>Tartine Bakery · 3 items</div>

        <div style={{ marginTop: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, background: s.done ? '#06C167' : (s.current ? '#000' : '#EEEEEE'),
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.done && <Icon name="shield-check" size={12} color="#fff"/>}
                {s.current && !s.done && <div style={{ width: 8, height: 8, background: '#fff', borderRadius: 999 }}/>}
              </div>
              <div style={{ fontSize: 14, fontWeight: s.current || s.done ? 700 : 500, color: s.done || s.current ? '#000' : '#757575' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: '14px', borderRadius: 12, background: '#F6F6F6',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: '#000', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>D</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>David is delivering your order</div>
            <div style={{ fontSize: 13, color: '#757575' }}>On bicycle · 6 min away</div>
          </div>
          <button style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="message" size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { EatsHome, RestaurantDetail, CartBar, OrderTracking, EatsTabBar });
