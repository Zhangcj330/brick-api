// Rider UI Kit — shared icon set (Lucide-style: 24/2/round)
const Icon = ({ name, size = 24, color = 'currentColor', strokeWidth = 2, style = {} }) => {
  const paths = {
    'menu': <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    'search': <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
    'pin': <><path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13Z"/><circle cx="12" cy="9" r="3"/></>,
    'home': <><path d="m3 12 9-9 9 9"/><path d="M5 10v10h14V10"/></>,
    'work': <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></>,
    'clock': <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    'star': <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/>,
    'user': <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
    'shield': <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z"/>,
    'car': <><path d="M5 17h14M5 13l1.5-5h11L19 13M5 17v3M19 17v3"/><circle cx="8" cy="17" r="1.5" fill={color}/><circle cx="16" cy="17" r="1.5" fill={color}/></>,
    'chevron-right': <polyline points="9 6 15 12 9 18"/>,
    'chevron-down': <polyline points="6 9 12 15 18 9"/>,
    'arrow-left': <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    'plus': <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    'card': <><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20"/></>,
    'phone': <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>,
    'message': <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.2 9.2 0 0 1-4-1L3 21l1-4.5A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/>,
    'shield-check': <><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></>,
    'crosshair': <><circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></>,
    'dots': <><circle cx="5" cy="12" r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fill={color}/><circle cx="19" cy="12" r="1.5" fill={color}/></>,
    'wallet': <><path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h12"/><path d="M17 13h.01"/></>,
    'calendar': <><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></>,
    'x': <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    'circle-dot': <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill={color}/></>,
    'square': <rect x="4" y="4" width="16" height="16" rx="1"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name] || <circle cx="12" cy="12" r="9"/>}
    </svg>
  );
};

window.Icon = Icon;
