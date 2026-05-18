// Evaluation screen
const { useState: useStateEv } = React;

const Evaluation = ({ goto }) => {
  const [playing, setPlaying] = useStateEv(false);

  const scorecards = [
    { tone:'pass', label:'CAUGHT MAIN ISSUE', val:'Pass', valMono:false,
      icon:<Icons.Check size={20}/> },
    { tone:'fail', label:'OVER-TRUSTED AI', val:'Missed', valMono:false,
      icon:<Icons.X size={20}/> },
    { tone:'partial', label:'ESCALATED APPROPRIATELY', val:'4', unit:'/10', valMono:true, sub:'Moderate',
      icon:<Icons.AlertTri size={20}/> },
    { tone:'neutral', label:'EXPLANATION QUALITY', val:'8', unit:'/10', valMono:true,
      icon:<Icons.Lines size={20}/> },
  ];

  return (
    <div className="page">
      <div className="between">
        <button className="btn ghost" onClick={() => goto('case')} style={{padding:0, background:'none', border:'none'}}>
          <Icons.ArrowLeft size={14}/> <span style={{fontSize:13, color:'var(--text-dim)'}}>Back to Case</span>
        </button>
        <div className="row" style={{gap:10}}>
          <span className="chip">SUBMITTED 14:32 UTC</span>
          <span className="chip indigo">CASE 4 · REV. REC.</span>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, alignItems:'start'}}>
        {/* Left: scorecard + expert tip */}
        <div style={{display:'flex', flexDirection:'column', gap:24}}>
          <div>
            <h1 style={{fontFamily:'var(--display)',fontWeight:700,fontSize:28,margin:'0 0 6px'}}>Case Assessment Score</h1>
            <div className="muted" style={{fontSize:15}}>Here is how your analysis compared against our expert baseline.</div>
          </div>

          <div className="score-grid">
            {scorecards.map((c, i) => (
              <div key={i} className={`score-card ${c.tone}`}>
                <div className="bg-blur"/>
                <div className="cap" style={{position:'relative', zIndex:1}}>{c.label}</div>
                <div className="row">
                  <div className={`val ${c.valMono?'mono':''}`}>
                    {c.val}{c.unit && <span className="unit">{c.unit}</span>}
                  </div>
                  <div style={{marginLeft:'auto'}}>
                    <div className="badge">{c.icon}</div>
                  </div>
                </div>
                {c.sub && <div className="cap" style={{position:'absolute', right:80, bottom:24, fontSize:10}}>{c.sub}</div>}
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Feedback Summary</h3>
              <span className="chip indigo">EXPERT REVIEW · COMPARED</span>
            </div>
            <div className="card-body" style={{fontSize:14, lineHeight:1.65, color:'var(--text-dim)'}}>
              <p style={{margin:'0 0 12px'}}>
                You correctly spotted the unsupported assumption regarding the Q3 revenue projections, but missed the immediate cash flow impact on operations.
                Your approval of the AI's hardware variance explanation overweighted the supply-chain narrative without independently verifying the SKU-942 shipment logs.
              </p>
              <p style={{margin:0}}>
                By failing to escalate the secondary flag raised by the AI model, you assumed the liquidity buffer was sufficient. In high-stakes scenarios, always verify the underlying ledger entries before accepting summarized projections.
              </p>
            </div>
          </div>

          <div className="tip">
            <div className="title"><Icons.Sparkles size={14}/> WHAT AN EXPERT WOULD DO</div>
            <div className="body">
              An expert analyst would have immediately cross-referenced the AI's Q3 projection with the raw Accounts Receivable ledger, noticing the 45-day delay pattern that invalidates the AI's optimistic liquidity score. Always request the underlying GL entries before approving a flagged anomaly above ±35%.
            </div>
          </div>
        </div>

        {/* Right: evaluator notes + audio + next */}
        <div style={{display:'flex', flexDirection:'column', gap:16, position:'sticky', top:96}}>
          <div className="card evaluator-notes">
            <h4>EVALUATOR NOTES</h4>
            <div style={{fontSize:13, lineHeight:1.6, color:'var(--text-dim)'}}>
              <p style={{margin:'0 0 10px'}}>
                Strong identification of the headline issue, but reasoning relied on AI confidence rather than primary source verification.
              </p>
              <p style={{margin:'0 0 10px'}}>
                Recommendation: practice <strong style={{color:'var(--text)'}}>"Ask Evidence"</strong> as a default first response before approving any flagged variance over 30%.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-head" style={{padding:'14px 16px'}}>
              <h3 style={{fontSize:15}}>Listen to Expert Feedback</h3>
              <span className="cap" style={{fontSize:10}}>1:42</span>
            </div>
            <div style={{padding:16}}>
              <div className="audio-card">
                <button className="play" onClick={() => setPlaying(p=>!p)}>
                  {playing ? <Icons.Pause size={12}/> : <Icons.Play size={12}/>}
                </button>
                <div className="wave">
                  {Array.from({length:38}).map((_,i)=>{
                    const h = 4 + Math.abs(Math.sin(i*0.6))*16;
                    return <span key={i} style={{height: h, opacity: i < 14 ? 1 : 0.4, background: i < 14 ? 'var(--indigo)' : 'var(--text-dim)'}}/>;
                  })}
                </div>
                <span className="time">0:36 / 1:42</span>
              </div>
              <div style={{marginTop:10, fontSize:12, color:'var(--text-mute)'}}>Narrated by Sarah Chen, CPA · Senior Audit Partner</div>
            </div>
          </div>

          <button className="btn primary lg" style={{width:'100%', justifyContent:'center'}} onClick={() => goto('case')}>
            Next Case <Icons.ArrowRight size={14}/>
          </button>
          <button className="btn" style={{width:'100%', justifyContent:'center'}} onClick={() => goto('case')}>
            Review Case Again
          </button>
        </div>
      </div>
    </div>
  );
};

window.Evaluation = Evaluation;
