// Profile screen
const Profile = ({ goto }) => {
  const skills = [
    { name: 'Variance Analysis', pct: 83 },
    { name: 'Cash Flow Logic', pct: 68 },
    { name: 'Compliance Risk', pct: 91 },
    { name: 'Forecast Assumptions', pct: 75 },
    { name: 'Accrual vs Cash', pct: 72 },
  ];

  const gaugeVal = 45;
  const gaugeRadius = 70;
  const gaugeCirc = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCirc - (gaugeVal / 100) * gaugeCirc;

  const weaknesses = [
    'Trends to close immediate cash flow implications under deadline pressure.',
    'Slow to question AI confidence scores when supporting narrative is well-written.',
    'Occasionally accepts assumption chains without verifying source ledger entries.',
  ];
  const strengths = [
    'Strong at spotting unsupported assumptions in long-term forecasts.',
    'Consistently identifies regulatory compliance risks early.',
    'Excellent variance categorization across functional accounts.',
  ];

  const history = [
    { date: '2023-10-27', title: 'Projected Revenue Discrepancy', score: '94/100', time: '12m' },
    { date: '2023-10-25', title: 'Capital Expenditure Analysis', score: '88/100', time: '1h 10m' },
    { date: '2023-10-23', title: 'Q3 Earnings Restatement', score: '72/100', time: '45m' },
    { date: '2023-10-21', title: 'Inventory Valuation Audit', score: '81/100', time: '1h 30m' },
    { date: '2023-10-18', title: 'Lease Obligation Review', score: '69/100', time: '38m' },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Skill Tracking</h1>
          <div className="sub">Detailed breakdown of analytical competencies and historical performance.</div>
        </div>
        <span className="chip indigo lg"><Icons.Lightning size={14}/> PEER COMPARISON · TOP 23%</span>
      </div>

      {/* Top row */}
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, alignItems:'start'}}>
        <div className="card">
          <div className="card-head">
            <h3>Skill Breakdown</h3>
            <button className="link"><Icons.TrendUp size={12} style={{verticalAlign:'middle', marginRight:4}}/> CHART</button>
          </div>
          <div className="card-body" style={{paddingTop:8, paddingBottom:8}}>
            {skills.map(s => (
              <div key={s.name} className="skill-row">
                <div className="name">{s.name}</div>
                <div className="bar"><div className="fill" style={{width: `${s.pct}%`}}/></div>
                <div className="pct">{s.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Over-Trust Index</h3>
            <span className="cap" style={{fontSize:10}}>CURRENT</span>
          </div>
          <div className="gauge">
            <div className="ring">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={gaugeRadius} fill="none" stroke="var(--card-3)" strokeWidth="14"/>
                <circle cx="90" cy="90" r={gaugeRadius} fill="none"
                  stroke={gaugeVal > 70 ? "var(--rose-2)" : gaugeVal > 50 ? "var(--amber-2)" : "var(--indigo)"}
                  strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={gaugeCirc} strokeDashoffset={gaugeOffset}
                />
              </svg>
              <div className="value">
                <div className="num">{gaugeVal}%</div>
                <div className="lbl">CALIBRATED</div>
              </div>
            </div>
            <div className="desc">
              Maintains healthy skepticism. Risk zone begins at 70%.
            </div>
            <div style={{display:'flex', gap:8, fontSize:11, fontFamily:'var(--mono)', color:'var(--text-dim)', letterSpacing:'0.04em'}}>
              <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:8,height:8,borderRadius:9999,background:'var(--indigo)'}}/>SAFE</span>
              <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:8,height:8,borderRadius:9999,background:'var(--amber-2)'}}/>WATCH</span>
              <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:8,height:8,borderRadius:9999,background:'var(--rose-2)'}}/>RISK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patterns row */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24, alignItems:'start'}}>
        <div className="card">
          <div className="card-head">
            <h3 style={{display:'flex',alignItems:'center',gap:8}}>
              <Icons.TrendUp size={14} style={{color:'var(--green)'}}/> Strength Patterns
            </h3>
            <span className="cap">SIGNAL HIGH</span>
          </div>
          <div className="card-body" style={{padding:'8px 20px 16px'}}>
            <div className="pattern-list">
              {strengths.map((s,i)=>(
                <div key={i} className="pattern-item strength">
                  <div className="marker"/>
                  <div>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 style={{display:'flex',alignItems:'center',gap:8}}>
              <Icons.AlertTri size={14} style={{color:'var(--rose)'}}/> Weakness Patterns
            </h3>
            <span className="cap">FOCUS AREAS</span>
          </div>
          <div className="card-body" style={{padding:'8px 20px 16px'}}>
            <div className="pattern-list">
              {weaknesses.map((s,i)=>(
                <div key={i} className="pattern-item weakness">
                  <div className="marker"/>
                  <div>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{padding:0}}>
          <div className="card-head">
            <h3>Recommended Focus</h3>
            <Icons.Sparkles size={14} style={{color:'var(--indigo)'}}/>
          </div>
          <div style={{padding:16, display:'flex', flexDirection:'column', gap:14}}>
            <div className="rec-card">
              <div className="label"><Icons.Target size={12}/> NEXT 5 SESSIONS</div>
              <div className="body">
                Practice cases with <strong style={{color:'var(--text)'}}>working capital impact</strong> to improve Cash Flow Logic. Try Case Pack <span className="f-mono" style={{color:'var(--indigo)'}}>#CF-202</span>.
              </div>
            </div>
            <button className="btn primary" style={{justifyContent:'center'}}>
              <Icons.Lightning size={12}/> START FOCUS DRILL
            </button>
            <div style={{fontSize:12, color:'var(--text-mute)', textAlign:'center'}}>
              Est. uplift: +6% accuracy in 2 weeks
            </div>
          </div>
        </div>
      </div>

      {/* Recent history */}
      <div className="card">
        <div className="card-head">
          <h3>Recent History</h3>
          <div className="row">
            <button className="link"><Icons.Filter size={12} style={{verticalAlign:'middle', marginRight:4}}/> FILTER</button>
            <button className="link">EXPORT</button>
          </div>
        </div>
        <table className="history-table">
          <thead>
            <tr>
              <th style={{width:120}}>Date</th>
              <th>Case Title</th>
              <th style={{width:120}}>Score</th>
              <th style={{width:100}}>Time Spent</th>
              <th style={{width:60}}></th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const sc = parseInt(h.score);
              const cls = sc >= 85 ? 'green' : sc >= 70 ? 'amber' : 'rose';
              return (
                <tr key={i} onClick={() => goto('eval')} style={{cursor:'pointer'}}>
                  <td className="f-mono muted" style={{fontSize:12}}>{h.date}</td>
                  <td style={{fontWeight:500}}>{h.title}</td>
                  <td><span className={`chip ${cls}`}>{h.score}</span></td>
                  <td className="f-mono muted" style={{fontSize:12}}>{h.time}</td>
                  <td style={{textAlign:'right'}}><Icons.ChevronRight size={14}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.Profile = Profile;
