// Rider UI Kit — stylized map background (no real map data)
// Pure SVG; depicts neutral grey streets with a colored route overlay.
const MapBackground = ({ withRoute = false, withPickup = false, withDestination = false, animateCar = false }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#E8EBEE', overflow: 'hidden' }}>
    <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      {/* Land patches */}
      <rect x="0" y="0" width="400" height="700" fill="#E4E8EA"/>
      <path d="M-20 380 L 180 220 L 280 320 L 440 240 L 440 720 L -20 720 Z" fill="#DDE2E5"/>
      <path d="M-20 540 L 200 500 L 380 600 L 440 580 L 440 720 L -20 720 Z" fill="#D6DCE0"/>

      {/* Park / green block */}
      <rect x="220" y="100" width="120" height="90" rx="4" fill="#D9E5D8"/>

      {/* Water sliver */}
      <path d="M-20 60 Q 100 80 220 50 T 440 70 L 440 0 L -20 0 Z" fill="#D2E0E8"/>

      {/* Roads — white strokes, varied weights */}
      <g stroke="#fff" strokeLinecap="round" fill="none">
        <path d="M-20 360 L 440 320" strokeWidth="22"/>
        <path d="M-20 530 L 440 510" strokeWidth="14"/>
        <path d="M-20 200 L 440 220" strokeWidth="10"/>
        <path d="M120 -20 L 80 740" strokeWidth="14"/>
        <path d="M270 -20 L 290 740" strokeWidth="18"/>
        <path d="M340 -20 L 360 740" strokeWidth="10"/>
        <path d="M40 -20 Q 60 200 30 380 T 50 740" strokeWidth="8"/>
      </g>

      {/* Road centerlines (subtle) */}
      <g stroke="#ECEFF1" strokeWidth="1.5" strokeDasharray="4 6" fill="none">
        <path d="M-20 360 L 440 320"/>
        <path d="M270 -20 L 290 740"/>
      </g>

      {/* Building footprints */}
      <g fill="#D0D5D8">
        <rect x="140" y="240" width="60" height="40" rx="2"/>
        <rect x="200" y="270" width="40" height="30" rx="2"/>
        <rect x="140" y="290" width="80" height="50" rx="2"/>
        <rect x="320" y="240" width="60" height="50" rx="2"/>
        <rect x="160" y="380" width="50" height="60" rx="2"/>
        <rect x="230" y="380" width="40" height="40" rx="2"/>
        <rect x="100" y="560" width="70" height="50" rx="2"/>
        <rect x="200" y="560" width="60" height="60" rx="2"/>
        <rect x="300" y="580" width="60" height="50" rx="2"/>
      </g>

      {/* Route line */}
      {withRoute && (
        <g>
          <path d="M 80 580 Q 100 480 140 400 T 280 280" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round"/>
          <path d="M 80 580 Q 100 480 140 400 T 280 280" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
        </g>
      )}
    </svg>

    {/* Pickup pin */}
    {withPickup && (
      <div style={{ position: 'absolute', left: 'calc(20% - 7px)', top: 'calc(83% - 14px)' }}>
        <div style={{ width: 14, height: 14, borderRadius: 999, background: '#000', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}/>
      </div>
    )}

    {/* Destination pin */}
    {withDestination && (
      <div style={{ position: 'absolute', left: 'calc(70% - 10px)', top: 'calc(40% - 20px)' }}>
        <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
          <path d="M10 0a10 10 0 0 0-10 10c0 7 10 16 10 16s10-9 10-16A10 10 0 0 0 10 0Z" fill="#000"/>
          <circle cx="10" cy="10" r="3.5" fill="#fff"/>
        </svg>
      </div>
    )}

    {/* Car marker on route */}
    {animateCar && (
      <div style={{ position: 'absolute', left: 'calc(45% - 16px)', top: 'calc(56% - 16px)' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999, background: '#000', display: 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          border: '2px solid #fff'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17h14M5 13l1.5-5h11L19 13M5 17v3M19 17v3"/>
            <circle cx="8" cy="17" r="1.5" fill="#fff"/><circle cx="16" cy="17" r="1.5" fill="#fff"/>
          </svg>
        </div>
      </div>
    )}
  </div>
);

window.MapBackground = MapBackground;
