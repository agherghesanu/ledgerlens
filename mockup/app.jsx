// Main app with nav + screen routing + tweaks
const { useState: useStateApp, useEffect: useEffectApp } = React;

const NAV = [
  { id:'dashboard', label:'Dashboard', icon: Icons.Dashboard, screen:'dashboard' },
  { id:'cases', label:'Cases', icon: Icons.Cases, screen:'case' },
  { id:'profile', label:'Profile', icon: Icons.Profile, screen:'profile' },
  { id:'history', label:'History', icon: Icons.History, screen:'eval' },
  { id:'settings', label:'Settings', icon: Icons.Settings, screen:'settings' },
];

const SCREEN_NAV = {
  dashboard: 'dashboard',
  case: 'cases',
  eval: 'history',
  profile: 'profile',
  settings: 'settings',
};

const SCREEN_TITLES = {
  dashboard: { title: 'LedgerLens', search: true },
  case: { title: 'LedgerLens', search: false, crumb: 'Case #4092-REV' },
  eval: { title: 'Evaluation Feedback', search: false },
  profile: { title: 'LedgerLens', search: false },
  settings: { title: 'Settings', search: true, searchPh: 'Search settings...' },
};

const TopBar = ({ screen, toast }) => {
  const cfg = SCREEN_TITLES[screen] || SCREEN_TITLES.dashboard;
  return (
    <div className="topbar">
      <div className="left">
        {screen === 'dashboard' && cfg.search && (
          <div className="search">
            <Icons.Search size={14}/>
            <input placeholder="Search cases..."/>
            <span className="cap" style={{fontSize:10, padding:'2px 6px', background:'var(--card-3)', borderRadius:4}}>⌘K</span>
          </div>
        )}
        {screen !== 'dashboard' && (
          <>
            <div className="title">{cfg.title}</div>
            {cfg.crumb && <>
              <span className="crumb-sep">|</span>
              <span className="crumb">{cfg.crumb}</span>
            </>}
          </>
        )}
      </div>
      <div className="right">
        {screen === 'settings' && (
          <div className="search">
            <Icons.Search size={14}/>
            <input placeholder={cfg.searchPh || "Search..."}/>
          </div>
        )}
        <button className="icon-btn">
          <Icons.Bell size={18}/>
          <span className="dot"/>
        </button>
        <Avatar initials="JD"/>
      </div>
    </div>
  );
};

const SideNav = ({ active, onChange }) => (
  <nav className="sidenav">
    <div className="logo">
      <div className="mark">LL</div>
      <div className="label">FINANCE</div>
    </div>
    {NAV.map(item => {
      const I = item.icon;
      return (
        <button key={item.id}
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.screen)}
          title={item.label}>
          <I/>
        </button>
      );
    })}
    <div style={{marginTop:'auto'}}>
      <button className="nav-item" title="Help">
        <Icons.Sparkles/>
      </button>
    </div>
  </nav>
);

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#C0C1FF",
  "density": "Comfortable",
  "showAiBadge": true
}/*EDITMODE-END*/;

const App = () => {
  const [screen, setScreen] = useStateApp('dashboard');
  const [toast, setToast] = useStateApp(null);
  const [t, setTweak] = useTweaks(TWEAKS_DEFAULTS);

  // Apply tweaks live
  useEffectApp(() => {
    document.documentElement.style.setProperty('--indigo', t.accent);
    document.body.style.setProperty('--card-pad', t.density === 'Compact' ? '14px' : '20px');
  }, [t.accent, t.density]);

  const goto = (s) => {
    setScreen(s);
    window.scrollTo(0,0);
    // Show contextual toast for flow steps
    if (s === 'eval') {
      setToast({msg: 'Review submitted · Scoring complete', tone:'indigo'});
      setTimeout(() => setToast(null), 2400);
    } else if (s === 'case') {
      setToast({msg: 'New case loaded · Case #4092-REV', tone:'green'});
      setTimeout(() => setToast(null), 2400);
    }
  };

  const navId = SCREEN_NAV[screen] || 'dashboard';

  return (
    <div className="app">
      <SideNav active={navId} onChange={setScreen}/>
      <main style={{display:'flex', flexDirection:'column'}}>
        <TopBar screen={screen}/>
        <div style={{flex:1}}>
          {screen === 'dashboard' && <Dashboard goto={goto}/>}
          {screen === 'case' && <CaseReview goto={goto}/>}
          {screen === 'eval' && <Evaluation goto={goto}/>}
          {screen === 'profile' && <Profile goto={goto}/>}
          {screen === 'settings' && <Settings goto={goto}/>}
        </div>
      </main>

      {toast && (
        <div className="toast">
          <span style={{
            width:8, height:8, borderRadius:9999,
            background: toast.tone === 'green' ? 'var(--green)' : 'var(--indigo)',
            boxShadow: `0 0 0 4px ${toast.tone === 'green' ? 'rgba(78,222,163,0.2)' : 'rgba(192,193,255,0.2)'}`,
          }}/>
          <span style={{fontSize:13}}>{toast.msg}</span>
        </div>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Look & feel">
          <TweakColor label="Accent" value={t.accent} options={['#C0C1FF','#4EDEA3','#FFB783','#FF9DC4','#7DC4FF']} onChange={v => setTweak('accent', v)}/>
          <TweakRadio label="Density" value={t.density} options={['Comfortable','Compact']} onChange={v => setTweak('density', v)}/>
          <TweakToggle label="AI badges visible" value={t.showAiBadge} onChange={v => setTweak('showAiBadge', v)}/>
        </TweakSection>
        <TweakSection title="Jump to screen">
          {Object.keys(SCREEN_TITLES).map(s => (
            <TweakButton key={s} label={'→ ' + (s === 'case' ? 'Case Review' : s === 'eval' ? 'Evaluation' : s[0].toUpperCase()+s.slice(1))} onClick={() => setScreen(s)}/>
          ))}
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
