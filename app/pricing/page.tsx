import Link from 'next/link'

export default function Pricing() {
  const plans = [
    { name:'Starter', price:49, features:['Zillow residential search','Up to 5 ZIP codes','50 email drafts/month','Gmail integration','Manual scan only'], missing:['Commercial listings','Daily auto-scan'], featured:false },
    { name:'Pro', price:149, features:['Everything in Starter','Unlimited ZIP codes','500 email drafts/month','Crexi + LoopNet commercial','Daily auto-scan','Auto-send offers'], missing:[], featured:true },
    { name:'Agency', price:399, features:['Everything in Pro','10 user seats','Unlimited email drafts','Hourly auto-scan','Priority support'], missing:[], featured:false },
  ]
  return (
    <div style={{minHeight:'100vh',background:'#f9f9f8'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.25rem 2rem',borderBottom:'1px solid #e8e8e6',background:'#fff'}}>
        <Link href="/" style={{fontSize:'1.2rem',fontWeight:700}}>Deal<span style={{color:'#1D9E75'}}>Hunter</span></Link>
        <Link href="/signup" style={{fontSize:'0.9rem',background:'#1D9E75',color:'#fff',padding:'0.5rem 1.25rem',borderRadius:'8px',fontWeight:500}}>Get started</Link>
      </nav>
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'4rem 2rem'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <h1 style={{fontSize:'2.5rem',fontWeight:700,marginBottom:'1rem'}}>Simple, transparent pricing</h1>
          <p style={{color:'#666',fontSize:'1.05rem'}}>Start with a 7-day free trial. No credit card required.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem'}}>
          {plans.map(p=>(
            <div key={p.name} style={{background:'#fff',borderRadius:'16px',padding:'2rem',border:p.featured?'2px solid #1D9E75':'1px solid #eee',position:'relative'}}>
              {p.featured && <div style={{position:'absolute',top:'-13px',left:'50%',transform:'translateX(-50%)',background:'#1D9E75',color:'#fff',fontSize:'0.75rem',fontWeight:600,padding:'0.25rem 1rem',borderRadius:'20px',whiteSpace:'nowrap'}}>Most popular</div>}
              <div style={{fontSize:'0.8rem',fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.5rem'}}>{p.name}</div>
              <div style={{fontSize:'2.5rem',fontWeight:700,lineHeight:1,marginBottom:'0.5rem'}}>${p.price}<span style={{fontSize:'1rem',fontWeight:400,color:'#888'}}>/mo</span></div>
              <div style={{borderTop:'1px solid #f0f0f0',paddingTop:'1.25rem',marginBottom:'1.5rem',marginTop:'1rem'}}>
                {p.features.map((f,i)=><div key={i} style={{display:'flex',gap:'0.6rem',marginBottom:'0.7rem',fontSize:'0.9rem'}}><span style={{color:'#1D9E75',fontWeight:700}}>✓</span>{f}</div>)}
                {p.missing.map((f,i)=><div key={i} style={{display:'flex',gap:'0.6rem',marginBottom:'0.7rem',fontSize:'0.9rem',color:'#bbb'}}><span>✕</span>{f}</div>)}
              </div>
              <Link href="/signup" style={{display:'block',textAlign:'center',padding:'0.875rem',borderRadius:'10px',fontWeight:600,fontSize:'0.95rem',background:p.featured?'#1D9E75':'transparent',color:p.featured?'#fff':'#333',border:p.featured?'none':'1px solid #ddd'}}>Get started</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
