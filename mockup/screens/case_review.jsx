// Case Review screen
const { useState: useStateCR } = React;

const CaseReview = ({ goto }) => {
  const [action, setAction] = useStateCR(null);
  const [reasoning, setReasoning] = useStateCR("");

  const handleSubmit = () => {
    if (!action) return;
    goto('eval');
  };

  return (
    <div className="page">
      <div className="between" style={{marginBottom:-8}}>
        <button className="btn ghost" onClick={() => goto('dashboard')} style={{padding:0, background:'none', border:'none'}}>
          <Icons.ArrowLeft size={14}/> <span style={{fontSize:13, color:'var(--text-dim)'}}>Back to Case Queue</span>
        </button>
        <div className="row" style={{gap:12}}>
          <span className="cap">CASE</span>
          <span className="f-mono" style={{fontSize:13}}>#4092-REV</span>
          <span style={{color:'var(--border)'}}>|</span>
          <span className="chip rose"><span style={{width:6,height:6,borderRadius:9999,background:'var(--rose-2)',boxShadow:'0 0 0 3px rgba(244,63,94,0.15)'}}/> LIVE</span>
        </div>
      </div>

      <div className="case-grid">
        {/* Sidebar */}
        <div style={{display:'flex', flexDirection:'column', gap:16, position:'sticky', top:96}}>
          <div className="card aside-card">
            <div className="section-title">Case Details</div>
            <div className="field">
              <div className="term">Category</div>
              <div><span className="chip lg">Revenue Recognition</span></div>
            </div>
            <div className="field">
              <div className="term">Difficulty</div>
              <div><span className="chip rose lg">Hard</span></div>
            </div>
            <div className="field">
              <div className="term">Est. Time</div>
              <div className="row val"><Icons.Clock size={14}/> 15 min</div>
            </div>
            <div className="field">
              <div className="term">Assigned Analyst</div>
              <div className="row val"><Avatar initials="JD" size={22}/> J. Doe</div>
            </div>
            <div className="field">
              <div className="term">Filed by</div>
              <div className="val">Controller (Auto-routed)</div>
            </div>
            <div className="field">
              <div className="term">Standard</div>
              <div className="val">ASC 606 · Rev. 2024</div>
            </div>
          </div>

          <div className="card aside-card">
            <div className="section-title">Source Documents</div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {['Q3-GL-Export.csv', 'Subscription-Schedule.xlsx', 'Hardware-Sales-Recon.pdf'].map(f => (
                <div key={f} className="row" style={{padding:'8px 10px', background:'var(--bg-2)', borderRadius:6, fontSize:12, fontFamily:'var(--mono)'}}>
                  <Icons.Lines size={12}/> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{display:'flex', flexDirection:'column', gap:24}}>
          <div className="card">
            <div className="card-head">
              <div className="row" style={{gap:12}}>
                <h3>Q3 Revenue Reconciliation</h3>
                <span className="chip">USD · 3 months</span>
              </div>
              <button className="icon-btn"><Icons.Download size={16}/></button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Budget</th>
                  <th>Actual</th>
                  <th>Variance</th>
                  <th style={{textAlign:'left'}}>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Subscription Revenue</td>
                  <td>$1,200,000</td>
                  <td>$1,450,000</td>
                  <td className="delta-up">+$250,000</td>
                  <td className="notes">Unexpected Q3 surge</td>
                </tr>
                <tr>
                  <td>Professional Services</td>
                  <td>$300,000</td>
                  <td>$280,000</td>
                  <td className="delta-down">−$20,000</td>
                  <td className="notes">Project delays</td>
                </tr>
                <tr>
                  <td>Hardware Sales</td>
                  <td>$150,000</td>
                  <td>$90,000</td>
                  <td className="delta-down">−$60,000</td>
                  <td className="notes">
                    <span className="flag">
                      <span style={{width:6,height:6,background:'var(--amber)',borderRadius:9999}}/> Flagged Anomaly
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Deferred Revenue (Δ)</td>
                  <td>$420,000</td>
                  <td>$610,000</td>
                  <td className="delta-up">+$190,000</td>
                  <td className="notes">Multi-year prepay influx</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="ai-card">
            <div className="head">
              <h3>Analysis Overview</h3>
              <span className="ai-badge"><Icons.Bot size={12}/> AI-Generated</span>
            </div>
            <div className="body">
              <p>
                The variance in Hardware Sales represents a <mark>−40% deviation</mark> from the forecasted budget.
                Analyzing the ledger entries from July to September indicates a significant drop in <mark>SKU-942</mark> shipments.
              </p>
              <p>
                Furthermore, cross-referencing with supply chain data suggests a potential correlation with <strong>Vendor Delay Incident #832</strong>.
                It is recommended to request evidence regarding the Q3 hardware fulfillment logs to verify if revenue recognition was appropriately deferred.
              </p>
              <p style={{color:'var(--text-mute)', fontSize:13}}>
                <em>Confidence: 87% · Reviewed 4 contracts · 3 GL accounts</em>
              </p>
            </div>
          </div>

          <div className="action-bar">
            {[
              {key:'approve', label:'Approve', icon:<Icons.Check size={14}/>, cls:'success'},
              {key:'reject', label:'Reject', icon:<Icons.X size={14}/>, cls:'danger'},
              {key:'escalate', label:'Escalate', icon:<Icons.AlertTri size={14}/>, cls:'warn'},
              {key:'evidence', label:'Ask Evidence', icon:<Icons.Search size={14}/>, cls:''},
              {key:'flag', label:'Flag Assumption', icon:<Icons.Target size={14}/>, cls:''},
            ].map(a => (
              <button
                key={a.key}
                className={`btn ${a.cls}`}
                onClick={() => setAction(a.key)}
                style={action === a.key ? {boxShadow:'inset 0 0 0 2px currentColor'} : null}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          <div className="textarea-card">
            <div className="label">Review Notes / Reasoning {action && <span style={{color:'var(--indigo)', marginLeft:8}}>Selected: {action}</span>}</div>
            <textarea
              value={reasoning}
              onChange={e => setReasoning(e.target.value)}
              placeholder="Explain your reasoning. What specific evidence supports your decision? Which assumptions in the AI analysis should be re-examined?"
            />
            <div className="between" style={{marginTop:14}}>
              <span style={{fontSize:12, color:'var(--text-mute)', fontFamily:'var(--mono)'}}>
                {reasoning.length} chars · Min 80 recommended
              </span>
              <button className="btn primary lg" onClick={handleSubmit} disabled={!action}>
                Submit Review <Icons.ArrowRight size={14}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.CaseReview = CaseReview;
