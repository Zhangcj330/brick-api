// Uber Eats UI Kit — placeholder food artwork rendered as colored SVG cards
// (Uber Eats uses real food photography; these are stand-ins. Drop in real images via FoodCard.image prop.)
const FoodArt = ({ palette, accent, icon, height = 120, radius = 12 }) => (
  <div style={{
    width: '100%', height, borderRadius: radius, position: 'relative', overflow: 'hidden',
    background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 100%)`,
  }}>
    {/* Soft blobs to suggest food */}
    <div style={{ position: 'absolute', width: '70%', height: '70%', left: '8%', top: '14%',
      background: accent, borderRadius: '50%', opacity: 0.85 }}/>
    <div style={{ position: 'absolute', width: '34%', height: '34%', right: '14%', top: '10%',
      background: palette[2] || '#fff', borderRadius: '50%', opacity: 0.45 }}/>
    <div style={{ position: 'absolute', width: '46%', height: '46%', right: '8%', bottom: '8%',
      background: palette[2] || '#fff', borderRadius: '50%', opacity: 0.35 }}/>
    {icon && (
      <div style={{ position: 'absolute', right: 10, top: 10, background: 'rgba(255,255,255,0.92)',
        borderRadius: 999, padding: 6, display: 'flex' }}>
        <Icon name={icon} size={14}/>
      </div>
    )}
  </div>
);
window.FoodArt = FoodArt;
