// Settings screen
const { useState: useStateS } = React;

const Toggle = ({ on, onChange }) => (
  <button className={`toggle ${on?'on':''}`} onClick={() => onChange(!on)}>
    <span className="knob"/>
  </button>
);

const Seg = ({ value, options, onChange }) => (
  <div className="seg">
    {options.map(o => (
      <button key={o} className={value===o?'active':''} onClick={() => onChange(o)}>{o}</button>
    ))}
  </div>
);

const Settings = () => {
  const [demo, setDemo] = useStateS(true);
  const [voice, setVoice] = useStateS(true);
  const [diff, setDiff] = useStateS('Medium');
  const [notifs, setNotifs] = useStateS({ anomaly: true, rebalance: false, updates: true, ingest: true });
  const [section, setSection] = useStateS('general');
  const [showKey, setShowKey] = useStateS(false);

  const sections = [
    { id:'general', label:'General Settings', icon:<Icons.Sliders/> },
    { id:'api', label:'API Keys', icon:<Icons.Key/> },
    { id:'notifs', label:'Notifications', icon:<Icons.Bell/> },
    { id:'security', label:'Security', icon:<Icons.Eye/> },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <div className="sub">Configure system behaviors and interfaces.</div>
        </div>
      </div>

      <div className="settings-grid">
        <div>
          <div className="cap" style={{padding:'0 14px 8px'}}>CONFIGURATION</div>
          <div className="settings-nav">
            {sections.map(s => (
              <button key={s.id} className={`item ${section===s.id?'active':''}`} onClick={() => setSection(s.id)}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-card">
            <div className="head">
              <div style={{flex:1}}>
                <h3>Application Preferences</h3>
                <div className="sub">Manage core system behaviors and interfaces.</div>
              </div>
              <Icons.Sliders size={16} style={{color:'var(--text-dim)'}}/>
            </div>
            <div className="settings-row">
              <div className="label-block">
                <div className="label">Demo Mode</div>
                <div className="desc">Enable synthetic data for presentations. Disables case submission to production audit log.</div>
              </div>
              <Toggle on={demo} onChange={setDemo}/>
            </div>
            <div className="settings-row">
              <div className="label-block">
                <div className="label">Voice Feedback <span className="cap" style={{fontSize:9, marginLeft:6, color:'var(--indigo)'}}>ELEVENLABS</span></div>
                <div className="desc">Synthesize audible alerts for critical thresholds and expert post-mortems.</div>
              </div>
              <Toggle on={voice} onChange={setVoice}/>
            </div>
            <div className="settings-row">
              <div className="label-block">
                <div className="label">Analysis Difficulty Preference</div>
                <div className="desc">Adaptive selects difficulty based on rolling accuracy. Default for new analysts is Medium.</div>
              </div>
              <Seg value={diff} options={['Easy','Medium','Hard','Adaptive']} onChange={setDiff}/>
            </div>
            <div className="settings-row">
              <div className="label-block">
                <div className="label">Default workspace currency</div>
                <div className="desc">Used for variance summaries and tabular formatting.</div>
              </div>
              <Seg value="USD" options={['USD','EUR','GBP','JPY']} onChange={()=>{}}/>
            </div>
          </div>

          <div className="settings-card">
            <div className="head">
              <div style={{flex:1}}>
                <h3>API Management</h3>
                <div className="sub">Configure external integrations and access tokens.</div>
              </div>
              <Icons.Key size={16} style={{color:'var(--text-dim)'}}/>
            </div>
            <div className="settings-row" style={{flexDirection:'column', alignItems:'stretch', gap:8}}>
              <div className="between">
                <div className="cap">OPENAI API KEY</div>
                <span className="chip green"><Icons.Check size={10}/> CONNECTED</span>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:8}}>
                <div className="input">
                  <Icons.Key size={12} style={{color:'var(--text-dim)'}}/>
                  <input type={showKey?'text':'password'} value="sk-proj-RZx3a92Dn7Lqj4PvKmYg" readOnly/>
                </div>
                <button className="btn ghost" onClick={()=>setShowKey(v=>!v)} title={showKey?'Hide':'Show'}>
                  {showKey ? <Icons.EyeOff size={14}/> : <Icons.Eye size={14}/>}
                </button>
                <button className="btn">Update</button>
              </div>
            </div>
            <div className="settings-row" style={{flexDirection:'column', alignItems:'stretch', gap:8}}>
              <div className="between">
                <div className="cap">ELEVENLABS API KEY</div>
                <span className="chip amber">REQUIRED FOR VOICE</span>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8}}>
                <div className="input">
                  <Icons.Key size={12} style={{color:'var(--text-dim)'}}/>
                  <input placeholder="Enter API key" />
                </div>
                <button className="btn primary">Save</button>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="head">
              <div style={{flex:1}}>
                <h3>Notification Routing</h3>
                <div className="sub">Select which alerts require immediate attention.</div>
              </div>
              <Icons.Bell size={16} style={{color:'var(--text-dim)'}}/>
            </div>
            <div style={{padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {[
                { key:'anomaly', title:'Market Anomalies', desc:'Sudden volume or price spikes.' },
                { key:'rebalance', title:'Portfolio Rebalancing', desc:'Automated target deviations.' },
                { key:'updates', title:'System Updates', desc:'LedgerLens version releases.' },
                { key:'ingest', title:'Data Ingestion Errors', desc:'Failures in syncing external feeds.' },
              ].map(n => (
                <button key={n.key}
                  onClick={() => setNotifs(p => ({...p, [n.key]: !p[n.key]}))}
                  style={{
                    textAlign:'left',
                    background: notifs[n.key] ? 'var(--card-2)' : 'transparent',
                    border: `1px solid ${notifs[n.key]?'var(--border)':'var(--border-dim)'}`,
                    borderRadius: 8,
                    padding: '12px 14px',
                    display:'flex', alignItems:'flex-start', gap:10,
                    transition:'all .15s',
                  }}>
                  <span style={{
                    marginTop:2,
                    width:16, height:16, borderRadius:4,
                    border:`1.5px solid ${notifs[n.key]?'var(--indigo)':'var(--border)'}`,
                    background: notifs[n.key]?'var(--indigo)':'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'var(--indigo-dark)',
                  }}>
                    {notifs[n.key] && <Icons.Check size={11} sw={3}/>}
                  </span>
                  <div>
                    <div style={{fontSize:14, color:'var(--text)', fontWeight:500}}>{n.title}</div>
                    <div style={{fontSize:12, color:'var(--text-dim)', marginTop:3}}>{n.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-card danger-zone">
            <div className="head">
              <div style={{flex:1}}>
                <h3>Danger Zone</h3>
                <div className="sub">Irreversible actions and data management.</div>
              </div>
              <Icons.AlertTri size={16}/>
            </div>
            <div className="settings-row">
              <div className="label-block">
                <div className="label">Export Profile Data</div>
                <div className="desc">Download a complete JSON archive of your settings, histories, and custom configurations. This action is logged for compliance.</div>
              </div>
              <button className="btn"><Icons.Download size={14}/> Export Data</button>
            </div>
            <div className="settings-row">
              <div className="label-block">
                <div className="label">Reset Skill Profile</div>
                <div className="desc">Clears all accuracy history. Your peer comparison and Over-Trust Index will be recalibrated from zero.</div>
              </div>
              <button className="btn danger">Reset Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Settings = Settings;
