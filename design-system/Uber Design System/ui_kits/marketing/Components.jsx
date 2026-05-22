// =================== Marketing site components ===================

const MarketingNav = () => {
  const items = ['Ride', 'Drive', 'Business', 'Uber Eats', 'About'];
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50, background: '#fff',
      padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 32,
      borderBottom: '1px solid #EEEEEE',
    }}>
      <div style={{ fontFamily: 'inherit', fontWeight: 900, fontSize: 26, letterSpacing: '-0.05em', lineHeight: 1 }}>Uber</div>
      <ul style={{ display: 'flex', gap: 26, listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(i => (
          <li key={i} style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>{i}</li>
        ))}
      </ul>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>EN</span>
        <span style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Help</span>
        <span style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Log in</span>
        <button style={{ background: '#000', color: '#fff', border: 0, padding: '10px 20px', borderRadius: 999, fontFamily: 'inherit', fontWeight: 500, fontSize: 14, cursor: 'pointer', lineHeight: 1, whiteSpace: 'nowrap' }}>Sign up</button>
      </div>
    </nav>
  );
};

// ====== Hero — split: copy left, ride request widget right ======
const Hero = () => {
  const [mode, setMode] = React.useState('ride'); // ride | drive
  return (
    <section style={{ padding: '64px 40px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.98, margin: 0, textWrap: 'balance' }}>
            Go anywhere<br/>with Uber
          </h1>
          <div style={{ display: 'flex', gap: 6, marginTop: 32, borderBottom: '1px solid #EEEEEE' }}>
            <button onClick={() => setMode('ride')} style={{
              padding: '12px 0', marginRight: 32, background: 'transparent', border: 0, fontFamily: 'inherit',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', color: mode === 'ride' ? '#000' : '#757575',
              borderBottom: mode === 'ride' ? '2px solid #000' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap',
            }}>Request a ride</button>
            <button onClick={() => setMode('drive')} style={{
              padding: '12px 0', background: 'transparent', border: 0, fontFamily: 'inherit',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', color: mode === 'drive' ? '#000' : '#757575',
              borderBottom: mode === 'drive' ? '2px solid #000' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap',
            }}>Drive & deliver</button>
          </div>

          {mode === 'ride' ? (
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#F6F6F6', borderRadius: 8 }}>
                <div style={{ width: 10, height: 10, background: '#000', borderRadius: 999 }}/>
                <input defaultValue="Pickup location" style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 15, fontWeight: 500 }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#F6F6F6', borderRadius: 8 }}>
                <div style={{ width: 10, height: 10, background: '#06C167', borderRadius: 2 }}/>
                <input placeholder="Dropoff location" style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 15, fontWeight: 500 }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#F6F6F6', borderRadius: 8 }}>
                <Icon name="calendar" size={16}/>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>Today</span>
                <Icon name="chevron-down" size={14}/>
                <span style={{ width: 1, height: 18, background: '#CBCBCB' }}/>
                <Icon name="clock" size={16}/>
                <span style={{ fontSize: 15, fontWeight: 500 }}>Now</span>
                <Icon name="chevron-down" size={14}/>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <button style={{ background: '#000', color: '#fff', border: 0, padding: '14px 26px', borderRadius: 999, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>See prices</button>
                <button style={{ background: 'transparent', color: '#000', border: 0, padding: '14px 16px', borderRadius: 999, fontFamily: 'inherit', fontSize: 15, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap' }}>
                  Log in to see your recent activity
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 17, color: '#545454', lineHeight: 1.55, margin: '0 0 24px', maxWidth: 480 }}>
                Drive when you want, make what you need. Set your own schedule with no boss or minimum hours.
              </p>
              <button style={{ background: '#000', color: '#fff', border: 0, padding: '14px 26px', borderRadius: 999, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Get started</button>
            </div>
          )}
        </div>

        {/* Right — illustrative panel showing a phone with the map mockup */}
        <div style={{ position: 'relative', height: 480, borderRadius: 16, background: '#F6F6F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {/* Pseudo-map */}
          <svg viewBox="0 0 600 480" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <rect width="600" height="480" fill="#E4E8EA"/>
            <g stroke="#fff" strokeLinecap="round" fill="none">
              <path d="M-20 240 L 640 200" strokeWidth="22"/>
              <path d="M-20 380 L 640 400" strokeWidth="14"/>
              <path d="M180 -20 L 200 520" strokeWidth="18"/>
              <path d="M420 -20 L 440 520" strokeWidth="10"/>
            </g>
            <rect x="260" y="100" width="140" height="80" rx="4" fill="#D9E5D8"/>
            <g fill="#D0D5D8">
              <rect x="80" y="280" width="80" height="50" rx="2"/>
              <rect x="180" y="290" width="60" height="40" rx="2"/>
              <rect x="490" y="280" width="80" height="60" rx="2"/>
            </g>
            <path d="M 100 420 Q 200 320 280 250 T 480 140" stroke="#fff" strokeWidth="11" fill="none" strokeLinecap="round"/>
            <path d="M 100 420 Q 200 320 280 250 T 480 140" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <circle cx="100" cy="420" r="10" fill="#000" stroke="#fff" strokeWidth="4"/>
            <circle cx="480" cy="140" r="10" fill="#06C167" stroke="#fff" strokeWidth="4"/>
          </svg>
          {/* Floating estimate card */}
          <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 12px 32px rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Icon name="car" size={20} color="#fff"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.005em' }}>UberX · 3 min away</div>
              <div style={{ fontSize: 13, color: '#757575' }}>Affordable rides, all to yourself</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFeatureSettings: '"tnum"', letterSpacing: '-0.01em' }}>$12.40</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ====== "Suggestions" — three product tiles ======
const Suggestions = () => {
  const tiles = [
    { title: 'Ride',     desc: 'Go anywhere with Uber. Request a ride, hop in, and go.', cta: 'Details',  bg: '#F6F6F6' },
    { title: 'Reserve',  desc: 'Reserve your ride in advance so you can relax on the day of your trip.', cta: 'Reserve a ride',  bg: '#F6F6F6' },
    { title: 'Intercity',desc: 'Get convenient, affordable outstation travel at the press of a button.', cta: 'Details',  bg: '#F6F6F6' },
  ];
  return (
    <section style={{ padding: '40px 40px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 28px' }}>Suggestions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {tiles.map((t, i) => (
            <div key={i} style={{ background: t.bg, borderRadius: 8, padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>{t.title}</div>
                <p style={{ fontSize: 14, color: '#545454', lineHeight: 1.5, margin: '8px 0 16px' }}>{t.desc}</p>
                <button style={{ background: '#fff', border: 0, padding: '10px 16px', borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t.cta}</button>
              </div>
              {/* Tile illustration */}
              <div style={{ width: 80, height: 80, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={i === 0 ? 'car' : i === 1 ? 'calendar' : 'pin'} size={32}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ====== Drive-with-Uber strip (dark) ======
const DriveStrip = () => (
  <section style={{ padding: '80px 40px', background: '#000', color: '#fff' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AFAFAF', marginBottom: 12 }}>Drive with Uber</div>
        <h2 style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, margin: 0, textWrap: 'balance' }}>Make money on your own terms</h2>
        <p style={{ fontSize: 17, color: '#CBCBCB', lineHeight: 1.55, margin: '20px 0 28px', maxWidth: 520 }}>
          Sign up to drive with Uber. Earn weekly, drive when you want, and get paid the same week.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ background: '#fff', color: '#000', border: 0, padding: '14px 24px', borderRadius: 999, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Get started</button>
          <button style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '14px 24px', borderRadius: 999, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Already have an account? Sign in</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {[
          { stat: '$1,200', label: 'Avg weekly earnings, top markets' },
          { stat: '10,000+', label: 'Cities supported worldwide' },
          { stat: '24/7', label: 'Support whenever you need it' },
          { stat: 'Weekly', label: 'Pay, with same-day options' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1F1F1F', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"' }}>{s.stat}</div>
            <div style={{ fontSize: 13, color: '#AFAFAF', marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ====== Editorial: business / press ======
const Editorial = () => (
  <section style={{ padding: '80px 40px', background: '#fff' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 28px' }}>Built to move you</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
          { tag: 'Business', title: 'Manage rides and meals in one place', desc: 'Uber for Business gives your team the tools to ride, dine, and ship — without expense reports.' },
          { tag: 'Safety',   title: 'Designed around your peace of mind', desc: 'Real-time ride sharing, RideCheck, an in-app safety toolkit, and a 24/7 incident team.' },
          { tag: 'Sustainability', title: 'Toward a zero-emission platform by 2040', desc: 'EV trips, low-emission vehicle tiers, and credits to help drivers go electric.' },
        ].map((c, i) => (
          <article key={i} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 200, borderRadius: 12, background: i === 0 ? '#1F1F1F' : i === 1 ? '#E4E8EA' : '#D9E5D8', marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
              {/* simple thematic blob */}
              <div style={{ position: 'absolute', inset: '20% 25% 30%', background: i === 0 ? '#06C167' : i === 1 ? '#000' : '#1F8A5B', borderRadius: i === 1 ? 12 : '50%', opacity: 0.85 }}/>
              <div style={{ position: 'absolute', right: 16, top: 16, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: i === 0 ? '#fff' : '#000', background: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 999 }}>{c.tag}</div>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.15, margin: 0, textWrap: 'balance' }}>{c.title}</h3>
            <p style={{ fontSize: 14, color: '#545454', lineHeight: 1.55, margin: '10px 0 14px' }}>{c.desc}</p>
            <a style={{ fontSize: 14, fontWeight: 600, color: '#000', textDecoration: 'underline', textUnderlineOffset: 4 }}>Learn more</a>
          </article>
        ))}
      </div>
    </div>
  </section>
);

// ====== Footer ======
const Footer = () => {
  const cols = [
    { head: 'Company',  links: ['About us', 'Our offerings', 'Newsroom', 'Investors', 'Blog', 'Careers'] },
    { head: 'Products', links: ['Ride', 'Drive', 'Deliver', 'Eat', 'Uber for Business', 'Uber Freight'] },
    { head: 'Global citizenship', links: ['Safety', 'Diversity', 'Sustainability'] },
    { head: 'Travel',   links: ['Reserve', 'Airports', 'Cities'] },
  ];
  return (
    <footer style={{ padding: '64px 40px 40px', background: '#000', color: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ fontFamily: 'inherit', fontWeight: 900, fontSize: 40, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 32 }}>Uber</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {cols.map(c => (
            <div key={c.head}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{c.head}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.links.map(l => <li key={l} style={{ fontSize: 13, color: '#CBCBCB' }}>{l}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #2E2E2E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#757575' }}>
          <div>© 2025 Uber Technologies Inc.</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <span>Privacy</span>
            <span>Accessibility</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

Object.assign(window, { MarketingNav, Hero, Suggestions, DriveStrip, Editorial, Footer });
