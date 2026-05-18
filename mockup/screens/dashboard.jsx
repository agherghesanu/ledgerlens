// Dashboard screen
const { useState } = React;

const ProgressChart = () => {
  const points = [45, 60, 50, 75, 65, 80, 85, 70, 73];
  const labels = ['Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20', 'Today'];
  const w = 100, h = 100;
  const stepX = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - p}`).join(' ');
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <div className="card">
      <div className="card-head">
        <h3>Accuracy Progress</h3>
        <button className="link">LAST 30 DAYS</button>
      </div>
      <div className="card-body">
        <div className="chart">
          <div className="grid">
            {[0,1,2,3,4].map(i => <div key={i} />)}
          </div>
          <svg className="line" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C0C1FF" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#C0C1FF" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={area} fill="url(#area-grad)" />
            <path d={path} fill="none" stroke="#C0C1FF" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            {points.map((p, i) => (
              <circle key={i} cx={i * stepX} cy={h - p} r="0.9" fill="#C0C1FF" stroke="#13131B" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          <div className="x-labels">
            {labels.map((l, i) => <span key={i}>{l}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ goto }) => {
  const recent = [
    { title: "Case 3: Expense Audit", meta: "Completed 2 hrs ago", score: "85%", tone: "green" },
    { title: "Case 2: Accrual Check", meta: "Completed yesterday", score: "60%", tone: "amber" },
    { title: "Case 1: Payroll Recon", meta: "Completed 2 days ago", score: "92%", tone: "green" },
  ];
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Overview of your recent financial review activity.</div>
        </div>
        <button className="btn primary"><Icons.Plus size={14}/> NEW CASE</button>
      </div>

      <div className="stats-row">
        <div className="stat">
          <div>
            <div className="cap">CASES REVIEWED</div>
            <div className="num">12</div>
          </div>
          <div className="icon-bubble indigo"><Icons.Folder size={20}/></div>
        </div>
        <div className="stat">
          <div style={{flex:1}}>
            <div className="between">
              <div className="cap">ACCURACY</div>
              <span style={{color:'var(--green)', display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontFamily:'var(--mono)'}}>
                <Icons.TrendUp size={12}/> +5%
              </span>
            </div>
            <div className="num-row">
              <div className="num">73%</div>
              <div className="sparkline" style={{marginLeft:'auto'}}>
                {[10,16,12,22,18,28].map((h,i)=>(<span key={i} style={{height:h}}/>))}
              </div>
            </div>
          </div>
        </div>
        <div className="stat">
          <div>
            <div className="cap">CURRENT STREAK</div>
            <div className="num-row">
              <div className="num">3</div>
              <div className="unit">days</div>
            </div>
          </div>
          <div className="icon-bubble amber"><Icons.Flame size={22}/></div>
        </div>
      </div>

      <div className="bento">
        <div className="col">
          <div className="card active-case elevated">
            <div className="body">
              <div className="head">
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  <div className="badge-row">
                    <span className="chip indigo">COMPLIANCE</span>
                    <span className="chip">ASC 606</span>
                    <span className="chip rose" style={{height:24,padding:'0 10px',fontSize:11}}>HIGH PRIORITY</span>
                  </div>
                  <h2>Case 4: Revenue Recognition Review</h2>
                  <p className="desc">Review Q3 revenue recognition practices against updated ASC 606 guidelines. High priority due to impending audit on November 8th.</p>
                </div>
                <Stars count={4} total={5}/>
              </div>
              <div className="actions">
                <div className="meta">
                  <span>EST. <b>15m</b></span>
                  <span>FOR <b>J. Doe</b></span>
                  <span>CASE <b>#4092-REV</b></span>
                </div>
                <button className="btn primary lg" onClick={() => goto('case')}>
                  Start Review <Icons.ArrowRight size={16}/>
                </button>
              </div>
            </div>
          </div>

          <ProgressChart/>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Recent Cases</h3>
            <button className="link">View All</button>
          </div>
          <div className="recent-list">
            {recent.map((r,i) => (
              <div key={i} className="recent-item" onClick={() => goto('eval')}>
                <div>
                  <div className="title">{r.title}</div>
                  <div className="meta">{r.meta}</div>
                </div>
                <span className={`chip ${r.tone}`}>{r.score}</span>
              </div>
            ))}
          </div>
          <div style={{padding:'16px 20px', borderTop:'1px solid var(--border)'}}>
            <div className="cap" style={{marginBottom:8}}>NEXT UP</div>
            <div className="recent-item" style={{padding:0, borderBottom:'none', cursor:'default'}}>
              <div>
                <div className="title">Case 5: Inventory Variance</div>
                <div className="meta">Scheduled for tomorrow</div>
              </div>
              <Icons.Clock size={16}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
