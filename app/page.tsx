import Link from 'next/link'

export default function Home() {
  return (
    <main style={{minHeight:'100vh',background:'#f9f9f8'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.25rem 2rem',borderBottom:'1px solid #e8e8e6',background:'#fff'}}>
        <div style={{fontSize:'1.2rem',fontWeight:700}}>Deal<span style={{color:'#1D9E75'}}>Hunter</span></div>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <Link href="/pricing" style={{fontSize:'0.9rem',color:'#666'}}>Pricing</Link>
          <Link href="/login" style={{fontSize:'0.9rem',color:'#666'}}>Log in</Link>
          <Link href="/signup" style={{fontSize:'0.9rem',background:'#1D9E75',color:'#fff',padding:'0.5rem 1.25rem',borderRadius:'8px',fontWeight:500}}>Get started</Link>
        </div>
      </nav>
      <section style={{maxWidth:'800px',margin:'0 auto',padding:'5rem 2rem 4rem',textAlign:'center'}}>
        <div style={{display:'inline-block',background:'#e1f5ee',color:'#0F6E56',fontSize:'0.8rem',fontWeight:500,padding:'0.3rem 1rem',borderRadius:'20px',marginBottom:'1.5rem'}}>South Florida Real Estate Automation</div>
        <h1 style={{fontSize:'3rem',fontWeight:700,lineHeight:1.15,marginBottom:'1.25rem'}}>Find motivated sellers.<br/><span style={{color:'#1D9E75'}}>Send offers automatically.</span></h1>
        <p style={{fontSize:'1.1rem',color:'#555',marginBottom:'2.5rem',maxWidth:'560px',margin:'0 auto 2.5rem'}}>DealHunter scans Zillow, Crexi, and LoopNet daily to find properties with motivated sellers — then automatically emails listing agents with your cash offer.</p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/signup" style={{background:'#1D9E75',color:'#fff',padding:'0.875rem 2rem',borderRadius:'10px',fontWeight:600,fontSize:'1rem'}}>Start free trial</Link>
          <Link href="/pricing" style={{background:'#fff',color:'#333',padding:'0.875rem 2rem',borderRadius:'10px',fontWeight:500,fontSize:'1rem',border:'1px solid #ddd'}}>View pricing</Link>
        </div>
      </section>
      <section style={{maxWidth:'1000px',margin:'0 auto',padding:'3rem 2rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem'}}>
          {[
            {icon:'🔍',title:'Smart listing search',desc:'Search Zillow by ZIP code, days on market, price, and property type.'},
            {icon:'📧',title:'Automated offer emails',desc:'The moment a matching listing is found, DealHunter drafts a personalized offer email via your Gmail.'},
            {icon:'🏢',title:'Residential + commercial',desc:'Pro and Agency plans include Crexi and LoopNet for commercial deals.'},
            {icon:'⚡',title:'Daily auto-scanning',desc:'Set your criteria once. DealHunter runs scans every morning automatically.'},
            {icon:'📊',title:'Outreach tracking',desc:'See every email sent, who responded, and which listings you have already contacted.'},
            {icon:'🔒',title:'Your data stays yours',desc:'Every account is fully isolated. Your data is never shared with other users.'},
          ].map((f,i)=>(
            <div key={i} style={{background:'#fff',borderRadius:'12px',padding:'1.5rem',border:'1px solid #eee'}}>
              <div style={{fontSize:'1.75rem',marginBottom:'0.75rem'}}>{f.icon}</div>
              <div style={{fontWeight:600,marginBottom:'0.5rem'}}>{f.title}</div>
              <div style={{fontSize:'0.9rem',color:'#666',lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{background:'#1D9E75',padding:'4rem 2rem',textAlign:'center'}}>
        <h2 style={{fontSize:'2rem',fontWeight:700,color:'#fff',marginBottom:'1rem'}}>Ready to find your next deal?</h2>
        <p style={{color:'rgba(255,255,255,0.85)',marginBottom:'2rem'}}>Join investors automating their offer pipeline in South Florida.</p>
        <Link href="/signup" style={{background:'#fff',color:'#1D9E75',padding:'0.875rem 2rem',borderRadius:'10px',fontWeight:600,display:'inline-block'}}>Get started free</Link>
      </section>
      <footer style={{background:'#111',color:'#999',padding:'2rem',textAlign:'center',fontSize:'0.85rem'}}>© 2026 DealHunter. All rights reserved.</footer>
    </main>
  )
}
