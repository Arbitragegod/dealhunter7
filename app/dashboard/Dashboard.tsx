'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Dashboard({ user, profile, log }: any) {
  const [tab, setTab] = useState('dashboard')
  const [listings, setListings] = useState<any[]>([])
  const [emailLog, setEmailLog] = useState<any[]>(log)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Ready to scan')
  const [detail, setDetail] = useState('Add ZIP codes in Search Criteria then run a scan')
  const [zips, setZips] = useState<string[]>([])
  const [zipInput, setZipInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [subject, setSubject] = useState('Cash offer inquiry — {address}')
  const [body, setBody] = useState('Hi {agent_name},\n\nI came across the listing at {address} and wanted to reach out with a cash offer inquiry.\n\nThe property has been listed for {dom} days and I\'m prepared to move quickly with a straightforward all-cash offer.\n\nWould you be open to a brief conversation?\n\nBest regards,\n[Your name]\n[Your phone]')
  const [apifyKey, setApifyKey] = useState(profile?.apify_api_key || '')
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function logout() { await supabase.auth.signOut(); router.push('/') }

  function addZip(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const v = zipInput.trim()
      if (v.length === 5 && /^\d+$/.test(v) && !zips.includes(v)) setZips(p => [...p, v])
      setZipInput('')
    }
  }

  function fill(s: string, l: any) {
    return s.replace(/\{address\}/g, l.address).replace(/\{price\}/g, '$' + Number(l.price).toLocaleString()).replace(/\{dom\}/g, l.daysOnZillow).replace(/\{agent_name\}/g, l.agentName)
  }

  function runScan() {
    if (!zips.length) { alert('Add at least one ZIP code first'); return }
    setScanning(true); setProgress(5)
    setStatus('Scanning via Apify...'); setDetail('Searching ' + zips.slice(0,5).length + ' ZIP codes')
    if (!apifyKey) { simulateScan(); return }
    realScan()
  }

  function simulateScan() {
    setDetail('No API key — demo mode')
    let p = 5
    const iv = setInterval(() => {
      p += Math.random() * 15
      if (p >= 100) { p = 100; clearInterval(iv); process(demo) }
      setProgress(Math.min(p, 100))
    }, 280)
  }

  async function realScan() {
    try {
      const res = await fetch('https://api.apify.com/v2/acts/afanasenko~zillow-property-agent-data-scraper/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apifyKey },
        body: JSON.stringify({ mode: 'zip', zipCodes: zips.slice(0,5), status_type: 'ForSale', doz: '90', isForSaleByAgent: true, isForSaleByOwner: true })
      })
      const data = await res.json()
      const runId = data.data?.id
      if (!runId) throw new Error('No run ID')
      let p = 10
      const poll = setInterval(async () => {
        p = Math.min(p + 7, 85); setProgress(p)
        const sr = await fetch('https://api.apify.com/v2/actor-runs/' + runId + '?token=' + apifyKey)
        const sd = await sr.json()
        if (sd.data?.status === 'SUCCEEDED') {
          clearInterval(poll)
          const ir = await fetch('https://api.apify.com/v2/datasets/' + sd.data.defaultDatasetId + '/items?token=' + apifyKey)
          const items = await ir.json()
          setProgress(100); process(items)
        } else if (sd.data?.status === 'FAILED') { clearInterval(poll); setStatus('Scan failed'); setScanning(false) }
      }, 4000)
    } catch(e: any) { setStatus('Error: ' + e.message); setScanning(false) }
  }

  function process(items: any[]) {
    const mapped = items.map((item: any, i: number) => ({
      id: item.zpid || i+1, address: item.address || 'Address unavailable',
      price: item.price || 0, daysOnZillow: item.daysOnZillow || 0,
      type: item.homeType || 'Unknown', beds: item.bedrooms || 0, baths: item.bathrooms || 0,
      sqft: item.livingArea || 0, agentName: item.agentName || 'Unknown agent',
      agentEmail: item.agentEmail || null, agentPhone: item.agentPhone || null, emailed: false
    }))
    setListings(mapped); setScanning(false)
    setStatus('Scan complete'); setDetail(mapped.length + ' listings — ' + mapped.filter((l:any) => l.agentEmail).length + ' with agent emails')
    setTab('listings')
  }

  async function draftEmail(l: any) {
    if (!l.agentEmail || l.emailed) return
    const s = fill(subject, l), b = fill(body, l)
    setListings(p => p.map(x => x.id === l.id ? {...x, emailed: true} : x))
    const entry = { to_email: l.agentEmail, to_name: l.agentName, address: l.address, subject: s, time: new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'}) }
    setEmailLog(p => [entry, ...p])
    await supabase.from('outreach_log').insert({ user_id: user.id, to_email: l.agentEmail, to_name: l.agentName, subject: s, body: b, address: l.address, status: 'drafted' })
  }

  async function saveKey() {
    await supabase.from('profiles').update({ apify_api_key: apifyKey }).eq('id', user.id)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const filtered = filter === 'has-email' ? listings.filter(l => l.agentEmail)
    : filter === 'hot' ? listings.filter(l => l.daysOnZillow >= 90)
    : filter === 'warm' ? listings.filter(l => l.daysOnZillow >= 60 && l.daysOnZillow < 90)
    : filter === 'unsent' ? listings.filter(l => !l.emailed) : listings

  const card = {background:'#fff',borderRadius:'12px',border:'1px solid #eee',padding:'1.25rem'} as React.CSSProperties
  const inp = {width:'100%',padding:'0.625rem 0.875rem',border:'1px solid #e0e0de',borderRadius:'8px',fontSize:'0.9rem',background:'#fff',color:'#1a1a1a',fontFamily:'inherit'} as React.CSSProperties

  return (
    <div style={{minHeight:'100vh',background:'#f9f9f8',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #eee',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'56px'}}>
        <div style={{fontWeight:700,fontSize:'1.05rem'}}>Deal<span style={{color:'#1D9E75'}}>Hunter</span></div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <span style={{fontSize:'0.85rem',color:'#666'}}>{user.email}</span>
          <button onClick={logout} style={{fontSize:'0.85rem',color:'#999',background:'none',border:'none',cursor:'pointer'}}>Sign out</button>
        </div>
      </nav>
      <div style={{maxWidth:'960px',margin:'0 auto',padding:'1.5rem'}}>
        <div style={{display:'flex',gap:'4px',borderBottom:'1px solid #eee',marginBottom:'1.5rem',overflowX:'auto'}}>
          {[['dashboard','Dashboard'],['criteria','Search criteria'],['listings','Listings ('+listings.length+')'],['email','Email template'],['log','Outreach log ('+emailLog.length+')'],['api','API setup']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'0.625rem 1rem',fontSize:'0.875rem',border:'none',background:'none',cursor:'pointer',borderBottom:tab===id?'2px solid #1D9E75':'2px solid transparent',color:tab===id?'#1a1a1a':'#888',fontWeight:tab===id?600:400,whiteSpace:'nowrap',marginBottom:'-1px',fontFamily:'inherit'}}>{label}</button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'1rem'}}>
              {[['Listings found',listings.length,'last scan'],['With email',listings.filter(l=>l.agentEmail).length,'actionable'],['Drafts sent',emailLog.length,'all time']].map(([l,v,s])=>(
                <div key={l as string} style={card}><div style={{fontSize:'0.8rem',color:'#888',marginBottom:'4px'}}>{l}</div><div style={{fontSize:'1.75rem',fontWeight:600}}>{v}</div><div style={{fontSize:'0.75rem',color:'#aaa',marginTop:'2px'}}>{s}</div></div>
              ))}
            </div>
            <div style={{...card,marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,marginBottom:'2px'}}>{status}</div>
                  <div style={{fontSize:'0.825rem',color:'#888'}}>{detail}</div>
                  <div style={{height:'3px',background:'#f0f0f0',borderRadius:'2px',marginTop:'10px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:progress+'%',background:'#1D9E75',borderRadius:'2px',transition:'width 0.4s ease'}}/>
                  </div>
                </div>
                <button onClick={runScan} disabled={scanning} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.625rem 1.25rem',borderRadius:'8px',fontWeight:600,fontSize:'0.9rem',whiteSpace:'nowrap',cursor:'pointer'}}>
                  {scanning ? 'Scanning...' : 'Run scan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'criteria' && (
          <div style={card}>
            <div style={{fontSize:'0.75rem',fontWeight:600,color:'#999',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'10px'}}>ZIP codes</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',alignItems:'center',padding:'0.5rem 0.75rem',border:'1px solid #e0e0de',borderRadius:'8px',marginBottom:'0.75rem',minHeight:'42px'}}>
              {zips.map(z=><span key={z} style={{background:'#e1f5ee',color:'#0F6E56',fontSize:'0.8rem',padding:'2px 8px',borderRadius:'20px',display:'flex',alignItems:'center',gap:'4px'}}>{z}<button onClick={()=>setZips(p=>p.filter(x=>x!==z))} style={{background:'none',border:'none',cursor:'pointer',color:'#0F6E56',fontSize:'14px',lineHeight:1}}>×</button></span>)}
              <input value={zipInput} onChange={e=>setZipInput(e.target.value)} onKeyDown={addZip} placeholder="Type ZIP and press Enter" style={{border:'none',outline:'none',fontSize:'0.875rem',minWidth:'160px',flex:1,background:'transparent'}} maxLength={5}/>
            </div>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'1.25rem'}}>
              {[['+ Miami-Dade',['33101','33125','33130','33131','33132','33133','33139','33140','33141','33143','33145','33146','33155','33156','33160','33172','33174','33176','33180']],['+ Broward',['33301','33304','33309','33311','33312','33314','33315','33316','33319','33322','33324','33325','33326','33328','33330']],['+ Palm Beach',['33401','33404','33405','33407','33409','33410','33431','33432','33433','33434','33436','33444','33458','33480','33483']]].map(([label,codes])=>(
                <button key={label as string} onClick={()=>(codes as string[]).forEach(z=>{if(!zips.includes(z))setZips(p=>[...p,z])})} style={{padding:'4px 12px',borderRadius:'20px',fontSize:'0.8rem',border:'1px solid #ddd',background:'none',cursor:'pointer',color:'#555',fontFamily:'inherit'}}>{label}</button>
              ))}
            </div>
            <button onClick={runScan} disabled={scanning} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontWeight:600,fontSize:'0.9rem',cursor:'pointer'}}>
              {scanning ? 'Scanning...' : 'Save & run scan'}
            </button>
          </div>
        )}

        {tab === 'listings' && (
          <div>
            <div style={{display:'flex',gap:'6px',marginBottom:'1rem',flexWrap:'wrap'}}>
              {[['all','All'],['has-email','Has email'],['hot','90+ days'],['warm','60-89 days'],['unsent','Not drafted']].map(([id,label])=>(
                <button key={id} onClick={()=>setFilter(id as string)} style={{padding:'5px 14px',borderRadius:'20px',fontSize:'0.8rem',border:filter===id?'none':'1px solid #ddd',background:filter===id?'#1D9E75':'none',color:filter===id?'#fff':'#666',cursor:'pointer',fontFamily:'inherit'}}>{label}</button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{textAlign:'center',padding:'3rem',color:'#bbb'}}>{listings.length === 0 ? 'Run a scan to find motivated sellers' : 'No listings match this filter'}</div>
            ) : filtered.map((l:any) => {
              const dc = l.daysOnZillow >= 90 ? {bg:'#fef2f2',c:'#dc2626'} : l.daysOnZillow >= 60 ? {bg:'#fefce8',c:'#ca8a04'} : {bg:'#f5f5f5',c:'#666'}
              const initials = l.agentName.split(' ').map((w:string)=>w[0]).slice(0,2).join('').toUpperCase()
              return (
                <div key={l.id} style={{...card,marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px',gap:'12px'}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:'0.95rem'}}>{l.address}</div>
                      <span style={{fontSize:'0.75rem',padding:'2px 8px',borderRadius:'20px',background:dc.bg,color:dc.c,fontWeight:500,display:'inline-block',marginTop:'5px'}}>{l.daysOnZillow} days{l.daysOnZillow>=90?' — very motivated':l.daysOnZillow>=60?' — motivated':''}</span>
                    </div>
                    <div style={{fontSize:'1rem',fontWeight:600,color:'#1D9E75',whiteSpace:'nowrap'}}>${Number(l.price).toLocaleString()}</div>
                  </div>
                  <div style={{display:'flex',gap:'12px',fontSize:'0.8rem',color:'#888',marginBottom:'10px',flexWrap:'wrap'}}>
                    <span>{l.beds} bd</span><span>{l.baths} ba</span>
                    {l.sqft>0&&<span>{l.sqft.toLocaleString()} sqft</span>}
                    <span>{l.type}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',background:'#f9f9f8',borderRadius:'8px',marginBottom:'10px'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:600,color:'#1d4ed8',flexShrink:0}}>{initials}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'0.85rem',fontWeight:500}}>{l.agentName}</div>
                      <div style={{fontSize:'0.78rem',color:l.agentEmail?'#1D9E75':'#bbb',fontStyle:l.agentEmail?'normal':'italic'}}>{l.agentEmail||'No email in listing'}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
                    <button onClick={()=>setListings(p=>p.filter(x=>x.id!==l.id))} style={{padding:'5px 12px',fontSize:'0.8rem',borderRadius:'8px',border:'1px solid #e0e0de',background:'none',cursor:'pointer',color:'#888',fontFamily:'inherit'}}>Skip</button>
                    {l.emailed ? <span style={{fontSize:'0.8rem',color:'#1D9E75',fontWeight:600,padding:'5px 0'}}>✓ Draft created</span>
                      : l.agentEmail ? <button onClick={()=>draftEmail(l)} style={{padding:'5px 14px',fontSize:'0.8rem',borderRadius:'8px',border:'none',background:'#1D9E75',color:'#fff',cursor:'pointer',fontWeight:500,fontFamily:'inherit'}}>Draft offer</button>
                      : <button disabled style={{padding:'5px 14px',fontSize:'0.8rem',borderRadius:'8px',border:'none',background:'#f0f0f0',color:'#bbb',fontFamily:'inherit'}}>No email</button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'email' && (
          <div style={card}>
            <div style={{background:'#e1f5ee',borderRadius:'8px',padding:'10px 14px',marginBottom:'1rem',fontSize:'0.85rem',color:'#0F6E56'}}>✓ Sending from <strong>{user.email}</strong></div>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.8rem',color:'#666',marginBottom:'5px'}}>Subject — use {'{address}'}, {'{price}'}, {'{dom}'}, {'{agent_name}'}</label>
              <input style={inp} value={subject} onChange={e=>setSubject(e.target.value)}/>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.8rem',color:'#666',marginBottom:'5px'}}>Body</label>
              <textarea value={body} onChange={e=>setBody(e.target.value)} style={{...inp,minHeight:'180px',resize:'vertical',lineHeight:1.6}}/>
            </div>
            <button onClick={()=>setPreview(!preview)} style={{padding:'0.625rem 1.25rem',borderRadius:'8px',border:'1px solid #ddd',background:'none',fontSize:'0.875rem',cursor:'pointer',fontFamily:'inherit'}}>{preview?'Hide preview':'Preview'}</button>
            {preview && (
              <div style={{marginTop:'1rem',padding:'1.25rem',background:'#f9f9f8',borderRadius:'10px',border:'1px solid #eee'}}>
                <div style={{fontSize:'0.75rem',color:'#888',marginBottom:'4px'}}>Subject</div>
                <div style={{fontWeight:600,marginBottom:'1rem',fontSize:'0.9rem'}}>{fill(subject,{address:'1234 Ocean Dr, Miami, FL 33139',price:485000,daysOnZillow:91,agentName:'Jane Smith'})}</div>
                <div style={{fontSize:'0.75rem',color:'#888',marginBottom:'4px'}}>Body</div>
                <div style={{fontSize:'0.875rem',whiteSpace:'pre-wrap',lineHeight:1.7}}>{fill(body,{address:'1234 Ocean Dr, Miami, FL 33139',price:485000,daysOnZillow:91,agentName:'Jane Smith'})}</div>
              </div>
            )}
          </div>
        )}

        {tab === 'log' && (
          <div>
            <div style={{fontSize:'0.85rem',color:'#888',marginBottom:'1rem'}}>{emailLog.length} drafts created</div>
            {emailLog.length === 0 ? <div style={{textAlign:'center',padding:'3rem',color:'#bbb'}}>No emails drafted yet</div>
              : emailLog.map((e:any,i:number)=>(
                <div key={i} style={{...card,marginBottom:'8px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontWeight:500,fontSize:'0.9rem'}}><span style={{display:'inline-block',width:'7px',height:'7px',borderRadius:'50%',background:'#1D9E75',marginRight:'6px',verticalAlign:'middle'}}/>{e.to_name||e.agent}</span>
                    <span style={{fontSize:'0.78rem',color:'#bbb'}}>{e.time||new Date(e.sent_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <div style={{fontSize:'0.8rem',color:'#1D9E75'}}>{e.to_email||e.to}</div>
                  <div style={{fontSize:'0.78rem',color:'#aaa',marginTop:'2px'}}>{e.address}</div>
                </div>
              ))}
          </div>
        )}

        {tab === 'api' && (
          <div style={card}>
            <div style={{fontSize:'0.75rem',fontWeight:600,color:'#999',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'10px'}}>Apify API key</div>
            <div style={{display:'flex',gap:'8px',marginBottom:'0.5rem'}}>
              <input type="password" value={apifyKey} onChange={e=>setApifyKey(e.target.value)} placeholder="apify_api_xxxxxxxxxxxx" style={{...inp,flex:1}}/>
              <button onClick={saveKey} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0 1.25rem',borderRadius:'8px',fontWeight:600,fontSize:'0.875rem',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Save</button>
            </div>
            {saved && <div style={{fontSize:'0.8rem',color:'#1D9E75',marginBottom:'0.75rem'}}>✓ Saved</div>}
            <div style={{fontSize:'0.8rem',color:'#aaa'}}>Get your key at console.apify.com → Settings → Integrations</div>
          </div>
        )}
      </div>
    </div>
  )
}

const demo = [
  {id:1,address:'1234 NW 52nd Ave, Miami, FL 33126',price:285000,daysOnZillow:97,homeType:'SingleFamily',bedrooms:3,bathrooms:2,livingArea:1450,agentName:'Carlos Rivera',agentEmail:'crivera@miamirealty.com'},
  {id:2,address:'877 S Ocean Blvd, Boca Raton, FL 33432',price:540000,daysOnZillow:115,homeType:'Condo',bedrooms:2,bathrooms:2,livingArea:1200,agentName:'Sandra Lee',agentEmail:'slee@palmrealty.com'},
  {id:3,address:'3301 NE 183rd St, Aventura, FL 33160',price:189000,daysOnZillow:74,homeType:'Condo',bedrooms:1,bathrooms:1,livingArea:720,agentName:'Mike Torres',agentEmail:null},
  {id:4,address:'611 SW 9th Ave, Fort Lauderdale, FL 33315',price:375000,daysOnZillow:91,homeType:'SingleFamily',bedrooms:3,bathrooms:2,livingArea:1680,agentName:'Lisa Park',agentEmail:'lpark@browardprop.com'},
  {id:5,address:'2200 Palm Beach Lakes Blvd, WPB, FL 33409',price:165000,daysOnZillow:143,homeType:'Condo',bedrooms:2,bathrooms:1,livingArea:950,agentName:'James Webb',agentEmail:'jwebb@pbcrealty.com'},
]
