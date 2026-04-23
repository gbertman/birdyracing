import { useState, useEffect, useRef, useCallback } from 'react';

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const CSS = `
  body { background:#f0f2f5!important; font-family:'DM Mono',monospace!important; }
  .app-topbar { background:#1a1a2e; border-bottom:3px solid #f5c400; position:sticky; top:0; z-index:200; }
  .app-logo { font-family:'Barlow Condensed',sans-serif; font-weight:900; font-size:20px; letter-spacing:3px; color:#f5c400; }
  .app-sub  { font-size:9px; color:#888; letter-spacing:2px; }
  .sync-dot { width:8px; height:8px; border-radius:50%; display:inline-block; margin-left:6px; }
  .sync-ok   { background:#198754; }
  .sync-busy { background:#ffc107; animation:pulse 1s infinite; }
  .sync-err  { background:#dc3545; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .app-tabbar { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:520px; z-index:200; background:#1a1a2e; border-top:3px solid #f5c400; display:flex; }
  .app-tab { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; padding:7px 2px; background:none; border:none; color:#888; font-family:'DM Mono',monospace; font-size:7.5px; letter-spacing:0.5px; cursor:pointer; user-select:none; -webkit-user-select:none; }
  .app-tab.active { color:#f5c400; }
  .app-tab svg { width:17px; height:17px; fill:none; stroke:currentColor; stroke-width:1.8; }
  .tab-dot { width:3px; height:3px; border-radius:50%; background:#f5c400; display:none; margin-top:1px; }
  .app-tab.active .tab-dot { display:block; }
  .content-wrap { padding:14px 14px 88px; max-width:520px; margin:0 auto; }
  .sec-hd { font-family:'Barlow Condensed',sans-serif; font-weight:900; font-size:12px; letter-spacing:4px; color:#1a1a2e; border-bottom:2px solid #f5c400; padding-bottom:4px; margin:20px 0 12px; }
  .rc-card { background:#fff; border:1px solid #dee2e6; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,.06); }
  .feel-pill { display:inline-block; font-size:10px; font-weight:700; padding:3px 10px; border-radius:3px; letter-spacing:1px; }
  .fix-badge { display:inline-block; background:#1a1a2e; color:#f5c400; font-size:11px; font-weight:700; padding:4px 10px; border-radius:3px; margin:2px; letter-spacing:1px; font-family:'Barlow Condensed',sans-serif; }
  .spec-key { font-size:8px; color:#6c757d; letter-spacing:1.5px; margin-bottom:2px; }
  .spec-val { font-size:13px; color:#212529; font-weight:600; line-height:1.3; }
  .spec-val.hi { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:900; }
  .order-num { font-family:'Barlow Condensed',sans-serif; font-weight:900; font-size:24px; color:#f5c400; min-width:28px; line-height:1; }
  .if-tag { font-size:8px; color:#f5c400; background:#1a1a2e; padding:1px 5px; border-radius:2px; letter-spacing:1px; min-width:20px; text-align:center; }
  .theory-rule { background:#fffbea; border-left:3px solid #f5c400; padding:8px 12px; font-size:12px; color:#1a1a2e; margin-top:10px; border-radius:0 4px 4px 0; }
  .vta-insight { background:#f0fff4; border-left:3px solid #198754; padding:8px 12px; font-size:12px; color:#0f5132; margin:6px 0; border-radius:0 4px 4px 0; }
  .vta-warn { background:#fff8e1; border-left:3px solid #ffc107; padding:8px 12px; font-size:12px; color:#664d03; margin:6px 0; border-radius:0 4px 4px 0; }
  .motor-stat-box { background:#f8f9fa; border:1px solid #dee2e6; border-radius:4px; padding:8px 12px; text-align:center; }
  .motor-stat-val { font-family:'Barlow Condensed',sans-serif; font-weight:900; font-size:24px; line-height:1; }
  .motor-stat-lbl { font-size:8px; color:#6c757d; letter-spacing:2px; margin-bottom:2px; }
  .data-table th { font-size:9px; letter-spacing:1.5px; color:#6c757d; background:#f8f9fa!important; }
  .data-table td { font-size:12px; }
  .data-table .row-best td { background:#fffbea!important; color:#856404; font-weight:700; }
  .data-table .row-danger td { background:#fff5f5!important; color:#842029; }
  .data-table .col-deg { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:15px; }
  .inv-cat { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:13px; letter-spacing:2px; color:#1a1a2e; margin-bottom:6px; }
  .inv-item { font-size:12px; padding:6px 12px; background:#fff; border:1px solid #dee2e6; border-left:3px solid #dee2e6; border-radius:0 4px 4px 0; margin-bottom:3px; color:#495057; }
  .inv-item.incoming { color:#adb5bd; border-left-color:#ffc107; }
  .json-ta { font-family:'DM Mono',monospace; font-size:11px; background:#f8f9fa; border:1px solid #ced4da; color:#212529; resize:vertical; }
  .log-inp { font-family:'DM Mono',monospace; font-size:13px; background:#fff; border:1px solid #ced4da; color:#212529; }
  .log-inp:focus { border-color:#f5c400; box-shadow:0 0 0 2px #f5c40030; outline:none; }
  .log-lbl { font-size:8px; color:#6c757d; letter-spacing:2px; margin-bottom:3px; display:block; }
  .run-card { background:#fff; border:1px solid #dee2e6; border-radius:6px; padding:12px 14px; margin-bottom:8px; }
  .run-meta { font-size:10px; color:#6c757d; }
  .bar-track { height:7px; background:#e9ecef; border-radius:2px; overflow:hidden; flex:1; }
  .bar-fill  { height:100%; border-radius:2px; transition:width .4s; }
  .tweak-step { display:flex; gap:10px; padding:6px 0; border-bottom:1px solid #f0f2f5; }
  .tweak-num { font-family:'Barlow Condensed',sans-serif; font-weight:900; font-size:18px; color:#6c757d; min-width:22px; line-height:1.2; }
  .min-badge { display:inline-block; font-size:10px; padding:2px 8px; border-radius:3px; font-family:'DM Mono',monospace; font-weight:700; }
  .chart-legend { display:flex; gap:12px; flex-wrap:wrap; font-size:10px; color:#6c757d; margin-top:6px; }
  .chart-legend-dot { width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:4px; }
`;

// ─── DEFAULT DATA (fallback if server unavailable) ────────────────────────────
const DEFAULT_MOTORS = {
  motors: {
    "R1 V21-S 21.5":    {tier:"primary",classes:["GT12","LMP"],inInventory:true,factoryTuned:false,raceSet:44,raceKV:2580,raceRPM:"20,383",raceAmps:"2.2",note:"PRIMARY GT12 MOTOR. Most efficient — lowest amps at equivalent KV. Everything compared to this baseline.",analyzerData:[{deg:30,kv:2427,rpm:"19,179",amps:1.5,best:false,danger:false},{deg:34,kv:2468,rpm:"19,505",amps:1.5,best:false,danger:false},{deg:36,kv:2487,rpm:"19,648",amps:1.7,best:false,danger:false},{deg:39,kv:2488,rpm:"19,660",amps:1.8,best:false,danger:false},{deg:40,kv:2517,rpm:"19,972",amps:1.9,best:false,danger:false},{deg:41,kv:2531,rpm:"19,745",amps:2.0,best:false,danger:false},{deg:43,kv:2555,rpm:"19,929",amps:2.0,best:false,danger:false},{deg:44,kv:2580,rpm:"20,383",amps:2.2,best:true,danger:false},{deg:49,kv:2798,rpm:"21,825",amps:3.0,best:false,danger:true}]},
    "Fleta ZX V2":      {tier:"test",   classes:["GT12"],inInventory:true,factoryTuned:false,raceSet:34,raceKV:2645,raceRPM:"21,110",raceAmps:"2.3",note:"TEST/BACKUP ONLY — ROAR unconfirmed. Do not race until verified. Highest KV tested.",analyzerData:[{deg:24,kv:2508,rpm:"20,075",amps:1.6,best:false,danger:false},{deg:26,kv:2543,rpm:"20,736",amps:1.7,best:false,danger:false},{deg:29,kv:2595,rpm:"20,777",amps:1.9,best:false,danger:false},{deg:30,kv:2596,rpm:"20,772",amps:1.9,best:false,danger:false},{deg:31,kv:2601,rpm:"20,815",amps:2.0,best:false,danger:false},{deg:32,kv:2610,rpm:"20,890",amps:2.1,best:false,danger:false},{deg:34,kv:2645,rpm:"21,110",amps:2.3,best:true,danger:false},{deg:36,kv:2645,rpm:"21,160",amps:2.5,best:false,danger:false},{deg:38,kv:2682,rpm:"21,461",amps:2.7,best:false,danger:false},{deg:46,kv:3355,rpm:"26,185",amps:5.9,best:false,danger:true}]},
    "R1 V30 21.5":      {tier:"backup", classes:["GT12"],inInventory:true,factoryTuned:false,raceSet:33,raceKV:2464,raceRPM:"19,685",raceAmps:"2.7",note:"LAST RESORT — designed for 2S. On 1S draws 0.5A more than V21-S for 116 less KV. Do NOT run 41-42°.",analyzerData:[{deg:31,kv:2416,rpm:"18,606",amps:2.5,best:false,danger:false},{deg:33,kv:2464,rpm:"19,685",amps:2.7,best:true,danger:false},{deg:35,kv:2482,rpm:"19,862",amps:3.1,best:false,danger:false},{deg:37,kv:2492,rpm:"19,940",amps:3.4,best:false,danger:false},{deg:40,kv:2510,rpm:"20,087",amps:3.9,best:false,danger:false},{deg:41,kv:2551,rpm:"20,155",amps:4.3,best:false,danger:true},{deg:42,kv:2571,rpm:"20,313",amps:4.6,best:false,danger:true},{deg:44,kv:2618,rpm:"20,683",amps:5.0,best:false,danger:true},{deg:45,kv:2657,rpm:"21,263",amps:6.0,best:false,danger:true}]},
    "Hobbywing G4R 21.5":{tier:"nodata",classes:["GT12"],inInventory:true,factoryTuned:false,raceSet:41,raceKV:null,raceRPM:null,raceAmps:null,note:"⚠ No analyzer data. Run SkyRC before racing.",analyzerData:[]},
    "Orca Team 25.5T":  {tier:"vta",    classes:["VTA"], inInventory:true,factoryTuned:true, raceSet:null,raceKV:null,raceRPM:null,raceAmps:null,note:"Factory tuned and sealed — DO NOT adjust timing. ROAR compliant (verified Race Place). Monitor temp only.",analyzerData:[]},
    "R1 V21-S 17.5":    {tier:"primary",classes:["LMP"], inInventory:true,factoryTuned:false,raceSet:44,raceKV:null,raceRPM:null,raceAmps:null,note:"LMP primary with V30 rotor installed. Use 44° as starting point — no data yet. Do not swap rotors.",analyzerData:[]},
    "R1 V30 17.5":      {tier:"backup", classes:["LMP"], inInventory:true,factoryTuned:false,raceSet:33,raceKV:null,raceRPM:null,raceAmps:null,note:"LMP backup only. Start at 33° (NOT 41-42° from original doc). Run analyzer to verify.",analyzerData:[]},
    "Blitreme 21.5":    {tier:"nodata", classes:["GT12"],inInventory:true,incoming:true,factoryTuned:false,raceSet:null,raceKV:null,raceRPM:null,raceAmps:null,note:"Incoming. Full analyzer sweep on arrival — compare vs V21-S in Qik123. Check ROAR first.",analyzerData:[]},
    "Blitreme 17.5":    {tier:"nodata", classes:["LMP"], inInventory:true,incoming:true,factoryTuned:false,raceSet:null,raceKV:null,raceRPM:null,raceAmps:null,note:"Incoming — no data yet.",analyzerData:[]},
    "Actinium":         {tier:"nodata", classes:["Testing"],inInventory:true,factoryTuned:false,raceSet:null,raceKV:null,raceRPM:null,raceAmps:null,note:"Testing motor — no data.",analyzerData:[]},
  }
};

const DEFAULT_CARS_DATA = {
  classMinimums: {
    GT12: { minRH: "3mm", minWeight: "730g" },
    LMP: { minRH: "3mm", minWeight: "730g" },
    VTA: { minRH: "5mm", minWeight: "1400g" },
    TT02: { minRH: null, minWeight: null }
  },
  cars: {
    "CRC CK25":     {class:"GT12",chassis:"CRC CK25",    motor:"R1 V21-S 21.5",           esc:"XR10 Pro 1S Stock",     battery:"1S LiPo — max 4.20v",          timing:"38",     pinion:"49",rollout:"97",   spurGear:"110",tireDiameter:"44.5", frontRH:"4.0",rearRH:"3.6",droop:"1.5",  camberF:"",    camberR:"",    toeF:"",      toeR:"",     tires:"Gravity GT12 44.5mm",     tireAdditive:"SXT 3.0",changes:"None",notes:"Start droop at 1.5. Reduce as grip builds."},
    "Xray X12":     {class:"LMP", chassis:"Xray X12",    motor:"R1 V30 17.5",             esc:"Orca Totem 1S",         battery:"1S LiPo — max 4.20v",          timing:"34",     pinion:"47",rollout:"93",   spurGear:"110",tireDiameter:"42", frontRH:"4.0",rearRH:"3.6",droop:"1.5",  camberF:"",    camberR:"",    toeF:"",      toeR:"",     tires:"Ulti Blue F42/R42mm",     tireAdditive:"SXT 3.0",changes:"None",notes:"ADD droop as grip builds. Do not swap rotors."},
    "Team Qik 123": {class:"GT12",chassis:"Team Qik 123",motor:"Fleta ZX v2 21.5",        esc:"XR10 Pro 1S Stock",     battery:"1S LiPo — max 4.20v",          timing:"44",     pinion:"49",rollout:"97",   spurGear:"110",tireDiameter:"44.5", frontRH:"4.0",rearRH:"3.6",droop:"1.4",  camberF:"",    camberR:"",    toeF:"",      toeR:"",     tires:"Gravity GT12 44.5mm",     tireAdditive:"SXT 3.0",changes:"None",notes:"Neutral reference — all motor testing done here."},
    "Team Qik 112": {class:"GT12",chassis:"Team Qik 112",motor:"Hobbywing G4R 21.5",      esc:"XR10 Pro 1S Stock",     battery:"1S LiPo — max 4.20v",          timing:"41",     pinion:"49",rollout:"97",   spurGear:"110",tireDiameter:"44.5", frontRH:"4.0",rearRH:"3.7",droop:"1.5",  camberF:"",    camberR:"",    toeF:"",      toeR:"",     tires:"Gravity GT12 44.5mm",     tireAdditive:"SXT 3.0",changes:"None",notes:"G4R timing pending analyzer data."},
    "Xray X4 (VTA)":{class:"VTA", chassis:"Xray X4",     motor:"Orca Team 25.5T",          esc:"XR10 Pro G3X (blinky)",battery:"2S LiPo — max 8.40v/6000mAh",  timing:"Factory",pinion:"28",rollout:"—",   spurGear:"110T",tireDiameter:"58",frontRH:"5.0",rearRH:"5.0",droop:"TBD",  camberF:"-2.0",camberR:"-2.0",toeF:"1° out",toeR:"2.5° in",tires:"Gravity VTA",             tireAdditive:"SXT 3.0",changes:"None",notes:"Min RH 5mm / Min weight 1400g. Factory tuned motor — DO NOT adjust timing.",springF:"2.6 (XRAY)",springR:"2.7 (XRAY)",shockOilF:"350 cSt",shockOilR:"350 cSt",reboundF:"10%",reboundR:"10%",frontDiff:"Solid axle",rearDiff:"9K cSt",arbF:"1.3mm",arbR:"1.2mm",shockLength:"7mm",totalWeight:"1322g",weightBalance:"50/50",body:"Twister",wing:"Speciale"},
    "Tamiya TT02":  {class:"TT02",chassis:"Tamiya TT-02",motor:"Stock Tamiya 540 Brushed", esc:"Stock Tamiya TBLE-04S",battery:"2S NiMH or LiPo",               timing:"Fixed",  pinion:"24",rollout:"Stock",spurGear:"110",tireDiameter:"40", frontRH:"5.0",rearRH:"5.0",droop:"Stock",camberF:"",    camberR:"",    toeF:"",      toeR:"",     tires:"USGT Rubber",             tireAdditive:"SXT 3.0",changes:"None",notes:"24T or 25T pinion only per Race Place rules."}
  }
};

const DEFAULT_DEFAULTS = DEFAULT_CARS_DATA.classMinimums;
const DEFAULT_CARS = DEFAULT_CARS_DATA.cars;

const DEFAULT_INVENTORY = {
  Cars:{GT12:["CRC CK25 — primary GT12","Team Qik 112 — second GT12","Team Qik 123 — test/backup"],LMP:["Xray X12 — primary LMP","Team Qik 123 — test/backup"],VTA:["Xray X4 — VTA touring (Orca factory tuned)"],TT02:["Tamiya TT-02 — USGT stock"]},
  ESCs:["XR10 Pro 1S Stock ×3","XR10 Pro 1S HD ×1","XR10 Pro 1S 120A ×1","XeRun V3.1 ×1","XR10 Pro G3X (VTA) ×1","Orca Totem 1S ×1"],
  "GT12 Motors (21.5T)":["R1 V21-S 21.5 — PRIMARY","R1 V30 21.5 — last resort","Hobbywing G4R 21.5","Fleta ZX V2 — test/backup (ROAR unconfirmed)","Blitreme 21.5 (incoming)"],
  "LMP Motors (17.5T)": ["R1 V21-S 17.5 — PRIMARY","R1 V30 17.5 — backup","Blitreme 17.5 (incoming)"],
  "VTA Motors (25.5T)": ["Orca Team 25.5T (factory tuned — ROAR confirmed)"],
  "Other":              ["Actinium — testing"],
  Tires:["Gravity GT12 (GT12 — 44.5mm)","Ulti Blue Stripe (LMP — 42mm)","Gravity VTA (VTA)","USGT Rubber (TT02)"],
  Tools:["SkyRC Motor Analyzer","Setup board","Ride height gauges","MyLaps transponder"],
};

// ─── API LAYER ────────────────────────────────────────────────────────────────
const api = {
  getRuns:    ()          => fetch('/api/runs').then(r => r.json()),
  saveRun:    (run)       => fetch('/api/runs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(run) }).then(r => r.json()),
  deleteRun:  (id)        => fetch(`/api/runs/${id}`, { method:'DELETE' }).then(r => r.json()),
  clearRuns:  ()          => fetch('/api/runs', { method:'DELETE' }).then(r => r.json()),
  getConfig:  ()          => fetch('/api/config').then(r => r.json()),
  saveConfig: (payload)   => fetch('/api/config', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) }).then(r => r.json()),
  exportAll:  ()          => fetch('/api/export').then(r => r.json()),
};

const downloadJSON = (name, obj) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type:'application/json' }));
  a.download = name;
  a.click();
};

const parseGearValue = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return NaN;
  const parsed = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : NaN;
};

const calculateRollout = ({ tireDiameter, spurGear, pinion }) => {
  const diameter = parseGearValue(tireDiameter);
  const spur = parseGearValue(spurGear);
  const pin = parseGearValue(pinion);
  if (!diameter || !spur || !pin) return null;
  return Math.round((diameter * Math.PI / spur) * pin);
};

const formatRollout = (value) => value == null ? '—' : `${value}`;

const tempInfo = t => { const n=parseFloat(t); if(!t||isNaN(n))return null; if(n<150)return{cls:"success",lbl:"OK"}; if(n<165)return{cls:"warning",lbl:"WARM"}; return{cls:"danger",lbl:"HOT"}; };
const CC = { GT12:"#f5c400", LMP:"#0d6efd", VTA:"#198754", TT02:"#6f42c1" };

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const SecHd = ({children, mt=true}) => <div className="sec-hd" style={{marginTop:mt?undefined:4}}>{children}</div>;

function CarBtn({name, car, active, onClick}) {
  const c = CC[car?.class]||"#6c757d";
  return (
    <button onClick={onClick} className="me-1 mb-1"
      style={{border:`1.5px solid ${active?c:"#ced4da"}`,background:active?c:"#fff",color:active?(car?.class==="GT12"?"#1a1a2e":"#fff"):"#6c757d",fontSize:10,fontFamily:"DM Mono,monospace",padding:"4px 8px",borderRadius:4,cursor:"pointer"}}>
      {name.replace(" (VTA)","").replace("Team ","").replace("Xray ","").replace("Tamiya ","")}
    </button>
  );
}

function MinBadges({cls, defs}) {
  const mins = defs?.classMinimums?.[cls];
  if (!mins||(!mins.minRH&&!mins.minWeight)) return null;
  const c = CC[cls]||"#6c757d";
  return (
    <div className="d-flex gap-2 flex-wrap mt-1">
      {mins.minRH     && <span className="min-badge" style={{background:c+"18",color:c,border:`1px solid ${c}40`}}>MIN RH {mins.minRH}</span>}
      {mins.minWeight && <span className="min-badge" style={{background:c+"18",color:c,border:`1px solid ${c}40`}}>MIN WEIGHT {mins.minWeight}</span>}
    </div>
  );
}

// ─── POWER ZONE CHART ─────────────────────────────────────────────────────────
function PowerZoneChart({data, raceSet}) {
  if (!data||data.length<2) return null;
  const W=340,H=170,P={top:22,right:16,bottom:32,left:42};
  const cW=W-P.left-P.right, cH=H-P.top-P.bottom;
  const degs=data.map(d=>d.deg), kvs=data.map(d=>d.kv), amps=data.map(d=>parseFloat(d.amps));
  const minDeg=degs[0], maxDeg=degs[degs.length-1], minKV=Math.min(...kvs)-30, maxKV=Math.max(...kvs)+30, maxAmp=Math.max(...amps);
  const xS=deg=>((deg-minDeg)/(maxDeg-minDeg))*cW;
  const yKV=kv=>cH-((kv-minKV)/(maxKV-minKV))*cH;
  const yA=a=>cH-(a/(maxAmp*1.1))*cH;
  const rX=raceSet?xS(raceSet):cW, dPt=data.find(d=>d.danger), dX=dPt?xS(dPt.deg):cW;
  const kvPts=data.map(d=>`${xS(d.deg)},${yKV(d.kv)}`).join(' ');
  const aPts=data.map(d=>`${xS(d.deg)},${yA(parseFloat(d.amps))}`).join(' ');
  const area=`M${xS(degs[0])},${cH} `+data.map(d=>`L${xS(d.deg)},${yKV(d.kv)}`).join(' ')+` L${xS(degs[degs.length-1])},${cH} Z`;
  const kTicks=[minKV,minKV+(maxKV-minKV)/2,maxKV].map(v=>Math.round(v/50)*50);
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{fontFamily:"DM Mono,monospace",display:"block"}}>
        <g transform={`translate(${P.left},${P.top})`}>
          <rect x={0} y={0} width={rX} height={cH} fill="#d1e7dd" opacity={0.55} rx={2}/>
          {dX>rX&&<rect x={rX} y={0} width={dX-rX} height={cH} fill="#fff8e1" opacity={0.7} rx={2}/>}
          {dX<cW&&<rect x={dX} y={0} width={cW-dX} height={cH} fill="#f8d7da" opacity={0.7} rx={2}/>}
          {rX>40&&<text x={rX/2} y={cH-4} textAnchor="middle" fontSize={8} fill="#198754" fontWeight="600">RACE ZONE</text>}
          {dX-rX>30&&<text x={(rX+dX)/2} y={cH-4} textAnchor="middle" fontSize={8} fill="#856404">MARGINAL</text>}
          {cW-dX>20&&<text x={(dX+cW)/2} y={cH-4} textAnchor="middle" fontSize={8} fill="#842029">DANGER</text>}
          {kTicks.map((kv,i)=><line key={i} x1={0} y1={yKV(kv)} x2={cW} y2={yKV(kv)} stroke="#dee2e6" strokeWidth={0.5} strokeDasharray="3,3"/>)}
          <path d={area} fill="#0d6efd" opacity={0.1}/>
          <polyline points={aPts} fill="none" stroke="#dc3545" strokeWidth={1.5} strokeDasharray="4,2" opacity={0.7}/>
          <polyline points={kvPts} fill="none" stroke="#0d6efd" strokeWidth={2}/>
          {raceSet&&<><line x1={rX} y1={-8} x2={rX} y2={cH} stroke="#1a1a2e" strokeWidth={1.5} strokeDasharray="4,2"/><rect x={rX-14} y={-20} width={28} height={13} fill="#1a1a2e" rx={2}/><text x={rX} y={-10} textAnchor="middle" fontSize={9} fill="#f5c400" fontWeight="700">{raceSet}°</text></>}
          {data.map((d,i)=><g key={i}><circle cx={xS(d.deg)} cy={yKV(d.kv)} r={d.best?5:3} fill={d.best?"#198754":d.danger?"#dc3545":"#0d6efd"} stroke="#fff" strokeWidth={1.5}/>{d.best&&<circle cx={xS(d.deg)} cy={yKV(d.kv)} r={8} fill="none" stroke="#198754" strokeWidth={1} opacity={0.4}/>}</g>)}
          {data.map((d,i)=><circle key={i} cx={xS(d.deg)} cy={yA(parseFloat(d.amps))} r={2.5} fill="#dc3545" opacity={0.7}/>)}
          <line x1={0} y1={cH} x2={cW} y2={cH} stroke="#adb5bd" strokeWidth={1}/>
          {data.map((d,i)=><g key={i}><line x1={xS(d.deg)} y1={cH} x2={xS(d.deg)} y2={cH+4} stroke="#adb5bd" strokeWidth={1}/><text x={xS(d.deg)} y={cH+14} textAnchor="middle" fontSize={8} fill={d.best?"#198754":d.danger?"#842029":"#6c757d"} fontWeight={d.best?"700":"400"}>{d.deg}°</text></g>)}
          <line x1={0} y1={0} x2={0} y2={cH} stroke="#adb5bd" strokeWidth={1}/>
          {kTicks.map((kv,i)=><text key={i} x={-5} y={yKV(kv)+4} textAnchor="end" fontSize={8} fill="#6c757d">{kv}</text>)}
          <text x={-30} y={cH/2} textAnchor="middle" fontSize={8} fill="#6c757d" transform={`rotate(-90,-30,${cH/2})`}>KV</text>
        </g>
      </svg>
      <div className="chart-legend">
        <span><span className="chart-legend-dot" style={{background:"#0d6efd"}}/>KV</span>
        <span><span className="chart-legend-dot" style={{background:"#dc3545"}}/>Amps</span>
        <span style={{color:"#198754"}}>■ Efficient</span>
        <span style={{color:"#856404"}}>■ Marginal</span>
        <span style={{color:"#842029"}}>■ Danger</span>
      </div>
    </div>
  );
}

// ─── QUICK PAGE ───────────────────────────────────────────────────────────────
function QuickPage() {
  const [open,setOpen]=useState(null);
  const [tweakOpen,setTweakOpen]=useState(false);
  const feels=[
    {id:"push",  color:"#856404",bg:"#fffbea",border:"#f5c400",tagBg:"#fffbea",tagColor:"#856404",title:"PUSH",        tag:"FREE THE CAR",  summary:"Won't turn — drifts wide",   sections:[{t:"WHAT YOU FEEL",items:["Turn wheel → car goes straight","Miss apex","Delay throttle"]},{t:"CAUSE",items:["Rear grip > front grip"]},{t:"WHERE",items:["Entry · Mid-corner · Tight turns"]}],fixes:["↓ REAR DROOP","↓ REAR RH"]},
    {id:"loose", color:"#084298",bg:"#e8f0fe",border:"#0d6efd",tagBg:"#cfe2ff",tagColor:"#084298",title:"LOOSE / EDGY",tag:"CALM THE CAR",  summary:"Rear steps out — twitchy",   sections:[{t:"WHAT YOU FEEL",items:["Rear steps out","Twitchy","Hesitate on throttle"]},{t:"CAUSE",items:["Rear grip < stability needed"]},{t:"WHERE",items:["Exit · Sweepers · Transitions"]}],fixes:["↑ REAR DROOP","↑ REAR RH"]},
    {id:"lazy",  color:"#974900",bg:"#fff3e0",border:"#fd7e14",tagBg:"#ffe5d0",tagColor:"#974900",title:"LAZY",        tag:"GEAR DOWN",     summary:"Slow accel — weak straight", sections:[{t:"WHAT YOU FEEL",items:["Slow acceleration","Weak straight"]},{t:"CAUSE",items:["Overgeared motor"]}],fixes:["−1 TOOTH"]},
    {id:"fade",  color:"#842029",bg:"#fff5f5",border:"#dc3545",tagBg:"#f8d7da",tagColor:"#842029",title:"FADE",        tag:"HEAT",          summary:"Fast early — slow later",    sections:[{t:"WHAT YOU FEEL",items:["Fast first 1-2 laps","Slows progressively"]},{t:"CAUSE",items:["Heat / inefficiency","Check temp within 30 sec"]}],fixes:["−1 TIMING","GEAR DOWN"]},
  ];
  return (
    <div>
      <SecHd mt={false}>FEEL → FIX</SecHd>
      {feels.map(f=>{
        const isOpen=open===f.id;
        return (
          <div key={f.id} className="mb-2 rc-card" style={{borderLeft:`4px solid ${f.border}`,cursor:"pointer"}} onClick={()=>setOpen(isOpen?null:f.id)}>
            <div className="d-flex justify-content-between align-items-center px-3 py-2">
              <div><span style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,fontSize:18,color:f.color}}>{f.title}</span><span className="ms-2" style={{fontSize:11,color:"#6c757d"}}>{f.summary}</span></div>
              <div className="d-flex align-items-center gap-2"><span className="feel-pill" style={{background:f.tagBg,color:f.tagColor}}>{f.tag}</span><span style={{color:"#adb5bd"}}>{isOpen?"▲":"▼"}</span></div>
            </div>
            {isOpen&&<div className="px-3 pb-3" style={{borderTop:`1px solid ${f.border}30`}} onClick={e=>e.stopPropagation()}>
              {f.sections.map((s,i)=><div key={i} className="mt-2"><div style={{fontSize:8,color:"#adb5bd",letterSpacing:2}}>{s.t}</div>{s.items.map((item,j)=><div key={j} style={{fontSize:12,color:"#495057"}}>{item}</div>)}</div>)}
              <div style={{fontSize:8,color:"#adb5bd",letterSpacing:2,marginTop:10,marginBottom:4}}>FIX</div>
              {f.fixes.map((fx,i)=><span key={i} className="fix-badge">{fx}</span>)}
            </div>}
          </div>
        );
      })}
      <div className="mb-2 rc-card" style={{borderLeft:"4px solid #6f42c1",cursor:"pointer"}} onClick={()=>setTweakOpen(!tweakOpen)}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2">
          <div><span style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,fontSize:18,color:"#432874"}}>TWEAK</span><span className="ms-2" style={{fontSize:11,color:"#6c757d"}}>Uneven L/R — inconsistent corners</span></div>
          <div className="d-flex align-items-center gap-2"><span className="feel-pill" style={{background:"#f3e8ff",color:"#432874"}}>FIX FIRST</span><span style={{color:"#adb5bd"}}>{tweakOpen?"▲":"▼"}</span></div>
        </div>
        {tweakOpen&&<div className="px-3 pb-3" style={{borderTop:"1px solid #d8b4fe"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:12,color:"#495057",margin:"8px 0"}}>Tweak creates false tuning signals. Fix it before touching anything else.</div>
          <div style={{fontSize:9,color:"#6c757d",letterSpacing:2,marginBottom:6}}>HOW TO DETECT</div>
          {["Place car on known flat surface","Press LF+RR diagonal — note if it rocks","Press RF+LR diagonal — compare","One diagonal rocks = tweak","The corner that lifts is the light corner"].map((t,i)=><div key={i} className="tweak-step"><span className="tweak-num">{i+1}</span><span style={{fontSize:12,color:"#495057"}}>{t}</span></div>)}
          <div style={{fontSize:9,color:"#432874",letterSpacing:2,marginTop:12,marginBottom:6}}>FIX — PAN CAR</div>
          {["Loosen all pod screws","Set car flat on setup board","Re-tighten: front → sides → rear","Check T-bar tension — equal L/R","Pod spring height — both sides equal","Bent plate: replace it","Re-check all four corners."].map((t,i)=><div key={i} className="tweak-step"><span className="tweak-num">{i+1}</span><span style={{fontSize:12,color:"#495057"}}>{t}</span></div>)}
          <div style={{fontSize:9,color:"#432874",letterSpacing:2,marginTop:12,marginBottom:6}}>FIX — TOURING CAR</div>
          {["Check lower arm pivot screws equal","All pivot balls — no binding","Loosen upper deck — re-torque outward","Spin each wheel — drag = diff binding","RH equal L/R front then rear","Re-check after each change"].map((t,i)=><div key={i} className="tweak-step"><span className="tweak-num">{i+1}</span><span style={{fontSize:12,color:"#495057"}}>{t}</span></div>)}
          <div style={{background:"#f3e8ff",borderLeft:"3px solid #6f42c1",padding:"8px 12px",marginTop:10,borderRadius:"0 4px 4px 0",fontSize:12,color:"#432874"}}>Fix tweak BEFORE any tuning changes.</div>
        </div>}
      </div>
      <SecHd>TUNING ORDER</SecHd>
      {["Tires","Tweak","Droop","Ride Height","Gear","Timing"].map((t,i)=><div key={i} className="d-flex align-items-center mb-1 px-3 py-2 rc-card"><span className="order-num me-3">{i+1}</span><span style={{fontSize:14}}>{t}</span></div>)}
      <SecHd>IF / THEN</SecHd>
      {[{c:"Push",t:["Reduce rear droop"]},{c:"Still push",t:["Lower rear RH"]},{c:"Loose",t:["Add droop"]},{c:"Still loose",t:["Raise rear RH"]},{c:"Lazy",t:["−1 pinion tooth"]},{c:"Fade",t:["Reduce timing","Gear down"]},{c:"Changes mid-run",t:["Suspect heat / motor load"]},{c:"Car is good",t:["DO NOTHING"]}].map((r,i)=>(
        <div key={i} className="mb-1 rc-card" style={{overflow:"hidden"}}>
          <div className="d-flex align-items-center px-3 py-2" style={{borderBottom:"1px solid #f0f2f5"}}><span className="if-tag me-2">IF</span><span style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:16}}>{r.c}</span></div>
          <div className="px-3 py-2">{r.t.map((t,j)=><div key={j} style={{fontSize:12,color:"#495057"}}><span style={{color:"#0d6efd",marginRight:6}}>→</span>{t}</div>)}</div>
        </div>
      ))}
      <div className="text-center mt-4 p-4" style={{border:"2px solid #1a1a2e",background:"#fff",borderRadius:6}}>
        <div style={{fontSize:8,color:"#6c757d",letterSpacing:3}}>THE FINAL RULE</div>
        <div style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,fontSize:26,color:"#1a1a2e",lineHeight:1.3}}>THE BEST SETUP<br/>IS THE ONE THAT REPEATS</div>
        <div style={{fontSize:9,color:"#6c757d",marginTop:6,letterSpacing:2}}>IF GOOD → DO NOTHING</div>
      </div>
    </div>
  );
}

// ─── THEORY PAGE ──────────────────────────────────────────────────────────────
function TheoryPage() {
  const [which,setWhich]=useState("pancar");
  const TC=({title,color,bg,rows,rule})=>(<div className="rc-card p-3 mb-2" style={{borderLeft:`4px solid ${color}`,background:bg}}><div style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,fontSize:16,color,marginBottom:8}}>{title}</div>{rows.map((r,i)=><div key={i} className="d-flex gap-2 mb-1"><span style={{color:"#0d6efd",minWidth:14}}>{r.d}</span><span style={{fontSize:12,color:"#495057"}}>{r.t}</span></div>)}{rule&&<div className="theory-rule">{rule}</div>}</div>);
  return (
    <div>
      <div className="d-flex gap-1 mb-3">
        <button className={`btn btn-sm flex-grow-1 ${which==="pancar"?"btn-warning":"btn-outline-secondary"}`} style={{fontFamily:"DM Mono,monospace"}} onClick={()=>setWhich("pancar")}>PAN CAR — GT12 / LMP</button>
        <button className={`btn btn-sm flex-grow-1 ${which==="vta"?"btn-success":"btn-outline-secondary"}`} style={{fontFamily:"DM Mono,monospace",color:which==="vta"?"#fff":undefined}} onClick={()=>setWhich("vta")}>VTA — XRAY X4</button>
      </div>
      {which==="pancar"&&<div>
        <SecHd mt={false}>DROOP — PRIMARY</SecHd>
        <TC title="Less Droop → Frees the Car" color="#856404" bg="#fffbea" rows={[{d:"↓",t:"Limits rear suspension extension"},{d:"↓",t:"Reduces rear grip"},{d:"↓",t:"Increases rotation"},{d:"↓",t:"More aggressive"}]} rule="Use when: Push / won't rotate / high grip"/>
        <TC title="More Droop → Calms the Car" color="#084298" bg="#e8f0fe" rows={[{d:"↑",t:"More rear suspension travel"},{d:"↑",t:"Increases rear grip"},{d:"↑",t:"Adds stability"},{d:"↑",t:"More forgiving"}]} rule="Use when: Loose / edgy / exit instability"/>
        <div className="rc-card p-3 mb-3" style={{fontSize:12,color:"#495057"}}><strong>Where you feel droop:</strong><br/><span style={{color:"#0d6efd"}}>Entry</span> — rotation &nbsp;|&nbsp; <span style={{color:"#0d6efd"}}>Mid</span> — balance &nbsp;|&nbsp; <span style={{color:"#0d6efd"}}>Exit</span> — stability<div className="theory-rule mt-2">Droop is PRIMARY. Adjust before ride height.</div></div>
        <SecHd>RIDE HEIGHT — SECONDARY</SecHd>
        <TC title="Lower Rear RH → Frees" color="#856404" bg="#fffbea" rows={[{d:"↓",t:"Lowers rear CG"},{d:"↓",t:"Forward weight transfer"},{d:"↓",t:"Reduces rear grip"}]} rule={null}/>
        <TC title="Higher Rear RH → Calms" color="#084298" bg="#e8f0fe" rows={[{d:"↑",t:"Raises rear CG"},{d:"↑",t:"Weight on rear tires"},{d:"↑",t:"Increases rear grip"}]} rule={null}/>
        <div className="alert alert-warning" style={{fontSize:12}}>Set droop first — use ride height to fine-tune.</div>
        <SecHd>CK25 vs X12</SecHd>
        <div className="rc-card p-3" style={{fontSize:12,color:"#495057"}}><div className="mb-2"><strong style={{color:"#856404"}}>CK25:</strong> Reduce droop as grip builds.</div><div><strong style={{color:"#084298"}}>X12:</strong> Add droop as grip builds.</div><div className="theory-rule mt-2">Opposite reactions. Know which car you're on.</div></div>
      </div>}
      {which==="vta"&&<div>
        <div className="alert alert-success" style={{fontSize:12}}><strong>Xray X4 — Chris Adams US Black Carpet baseline.</strong> One change at a time.</div>
        <SecHd mt={false}>DROOP</SecHd>
        <div className="rc-card p-3 mb-2" style={{fontSize:12,color:"#495057",lineHeight:1.9}}>Same concept as pan car — more droop = more rear grip — but numbers are 2–4mm (more travel).<div className="vta-insight">Droop TBD — measure with Xray gauge #107730 (front) and #107712 (rear).</div><div className="vta-warn">Race Place min RH 5mm. Re-check after every droop change.</div></div>
        <SecHd>CAMBER — F -2° / R -2°</SecHd>
        <div className="rc-card p-3 mb-2" style={{fontSize:12,color:"#495057",lineHeight:1.9}}>Setup sheet baseline: -2° both ends.<div className="vta-warn">If loose at exit, reduce rear camber 0.25° before anything else.</div></div>
        <SecHd>TOE — F 1° OUT / R 2.5° IN</SecHd>
        <div className="rc-card p-3 mb-2" style={{fontSize:12,color:"#495057",lineHeight:1.9}}><div className="mb-1"><strong>Front:</strong> 1° out = agile entry. Do not go beyond 1.5° out.</div><div><strong>Rear:</strong> 2.5° in = essential stability. Min 1.5° on carpet.</div><div className="vta-insight">If twitchy, add rear toe-in 0.5° first.</div></div>
        <SecHd>SPRINGS 2.6F / 2.7R · SHOCK 350cSt · REBOUND 10%</SecHd>
        <div className="rc-card p-3 mb-2" style={{fontSize:12,color:"#495057",lineHeight:1.9}}>ARB: 1.3mm front / 1.2mm rear.<div className="vta-insight">10% rebound is conservative — controlled body roll on carpet.</div></div>
        <SecHd>DIFF — SOLID FRONT / 9K REAR</SecHd>
        <div className="rc-card p-3 mb-2" style={{fontSize:12,color:"#495057",lineHeight:1.9}}><div className="mb-1"><strong>Solid front:</strong> Consistent, predictable on throttle.</div><div><strong>9K rear:</strong> Stability on exit. Drop to 7K if too much push.</div></div>
        <SecHd>ORCA 25.5T — FACTORY TUNED</SecHd>
        <div className="rc-card p-3 mb-2" style={{background:"#f0fff4",borderLeft:"4px solid #198754",fontSize:12,color:"#0f5132",lineHeight:1.9}}><strong>DO NOT adjust timing.</strong> Factory tuned, ROAR confirmed. Monitor temp (under 155°F). If hot, gear down first.</div>
        <SecHd>RACE PLACE TUNING</SecHd>
        <div className="rc-card p-3" style={{fontSize:12,color:"#495057"}}>
          {[{c:"Push at entry",f:"Reduce front droop. Add front camber 0.25°."},{c:"Push mid-corner",f:"Reduce rear droop. Lower rear RH. Confirm toe-in ≥1.5°."},{c:"Loose at exit",f:"Add rear droop 0.25mm. Raise rear RH if still loose."},{c:"Twitchy",f:"Add rear toe-in 0.5°. Check tweak first."},{c:"Lazy",f:"−1 pinion tooth. Do not touch motor timing."},{c:"Fade",f:"Check temp. Gear down. Verify blinky mode."},{c:"Grip builds",f:"Reduce rear droop slightly. Add rear toe-in if nervous."}].map((r,i)=>(
            <div key={i} className="mb-2 pb-2" style={{borderBottom:"1px solid #f0f2f5"}}><div style={{color:"#198754",fontWeight:700}}>▸ {r.c}</div><div style={{paddingLeft:12}}>→ {r.f}</div></div>
          ))}
        </div>
      </div>}
    </div>
  );
}

// ─── MOTORS PAGE ─────────────────────────────────────────────────────────────
function MotorsPage({motors}) {
  const motorData = motors?.motors || DEFAULT_MOTORS.motors;
  const names = Object.keys(motorData);
  const withData = names.filter(n=>motorData[n].analyzerData?.length>0);
  const [active,setActive]=useState(withData[0]||names[0]);
  const [showChart,setShowChart]=useState(true);
  const m = motorData[active]||{};
  const tc = {race:"#856404",primary:"#084298",backup:"#842029",test:"#974900",vta:"#198754",nodata:"#6c757d"}[m.tier]||"#6c757d";
  const tcBg = {race:"#fffbea",primary:"#e8f0fe",backup:"#fff5f5",test:"#fff3e0",vta:"#d1e7dd",nodata:"#f8f9fa"}[m.tier]||"#f8f9fa";
  const hasData = m.analyzerData?.length>0;
  const tierLabel = {primary:"PRIMARY",backup:"LAST RESORT",test:"TEST/BACKUP",vta:"VTA",nodata:"NO DATA"}[m.tier]||m.tier?.toUpperCase();
  return (
    <div>
      <div className="alert alert-light border mb-3" style={{fontSize:11}}>
        <strong>GT12 Hierarchy:</strong>&nbsp;
        <span style={{color:"#084298"}}>① V21-S 21.5 — Primary (44°)</span>&nbsp;→&nbsp;
        <span style={{color:"#974900"}}>② Fleta — Test/Backup (34°, ROAR TBD)</span>&nbsp;→&nbsp;
        <span style={{color:"#842029"}}>③ V30 — Last resort (33°)</span>
      </div>
      {withData.length>0&&<><div style={{fontSize:9,color:"#6c757d",letterSpacing:2,marginBottom:6}}>ANALYZER DATA AVAILABLE</div><div className="d-flex gap-1 mb-2 flex-wrap">{withData.map(n=><button key={n} onClick={()=>setActive(n)} className={`btn btn-sm ${active===n?"btn-warning":"btn-outline-secondary"}`} style={{fontSize:10,fontFamily:"DM Mono,monospace"}}>{n.replace("R1 ","").replace(" 21.5","").replace(" ZX V2","")}</button>)}</div></>}
      {names.filter(n=>!motorData[n].analyzerData?.length).length>0&&<><div style={{fontSize:9,color:"#6c757d",letterSpacing:2,marginBottom:6,marginTop:8}}>NO DATA YET</div><div className="d-flex gap-1 mb-3 flex-wrap">{names.filter(n=>!motorData[n].analyzerData?.length).map(n=><button key={n} onClick={()=>setActive(n)} className={`btn btn-sm ${active===n?"btn-secondary":"btn-outline-secondary"}`} style={{fontSize:10,fontFamily:"DM Mono,monospace",opacity:0.7}}>{n.replace("R1 ","").replace("Hobbywing ","").replace("Orca ","")}{motorData[n].incoming?" ⏳":""}</button>)}</div></>}
      <div className="rc-card mb-3" style={{borderTop:`4px solid ${tc}`,overflow:"hidden"}}>
        <div className="d-flex justify-content-between align-items-start p-3 pb-2">
          <div><div style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,fontSize:18,color:tc}}>{active}</div><div style={{fontSize:9,color:"#6c757d",letterSpacing:1}}>{m.classes?.join(" / ")}</div></div>
          <div className="d-flex flex-column align-items-end gap-1"><span className="badge" style={{background:tcBg,color:tc,border:`1px solid ${tc}50`,fontSize:9}}>{tierLabel}</span>{m.factoryTuned&&<span className="badge bg-success" style={{fontSize:9}}>FACTORY TUNED</span>}</div>
        </div>
        {hasData&&<div className="row g-0 mx-0 mb-2 px-3">{[["TIMING",`${m.raceSet}°`,tc],["KV",m.raceKV,tc],["AMPS",`${m.raceAmps}A`,"#212529"]].map(([l,v,c])=><div key={l} className="col-4 pe-2"><div className="motor-stat-box"><div className="motor-stat-lbl">{l}</div><div className="motor-stat-val" style={{color:c}}>{v}</div></div></div>)}</div>}
        {!hasData&&m.raceSet&&!m.factoryTuned&&<div className="px-3 pb-2"><div className="alert alert-secondary py-2 mb-0" style={{fontSize:12}}>Starting timing: <strong>{m.raceSet}°</strong> — run analyzer to confirm.</div></div>}
        {m.factoryTuned&&<div className="px-3 pb-2"><div className="alert alert-success py-2 mb-0" style={{fontSize:12}}><strong>Factory tuned — do not adjust timing.</strong></div></div>}
        <div className="px-3 pb-3" style={{fontSize:11,color:["backup","test"].includes(m.tier)?"#842029":"#6c757d",background:m.tier==="backup"?"#fff5f5":m.tier==="test"?"#fff3e0":"transparent",padding:"8px 16px"}}>{m.note}</div>
      </div>
      {hasData&&<div className="rc-card mb-3 p-3"><div className="d-flex justify-content-between align-items-center mb-2"><div style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:14,letterSpacing:1,color:"#1a1a2e"}}>POWER ZONE — TIMING EFFICIENCY</div><button className="btn btn-sm btn-outline-secondary" style={{fontSize:10}} onClick={()=>setShowChart(!showChart)}>{showChart?"HIDE":"SHOW"}</button></div>{showChart&&<PowerZoneChart data={m.analyzerData} raceSet={m.raceSet}/>}</div>}
      {hasData&&<div className="rc-card mb-3" style={{overflow:"hidden"}}><table className="table data-table mb-0"><thead><tr>{["DEG","KV","RPM","AMPS"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{m.analyzerData.map((r,i)=><tr key={i} className={r.best?"row-best":r.danger?"row-danger":""}><td className="col-deg" style={{color:r.best?tc:r.danger?"#842029":"#0d6efd"}}>{r.deg}°</td><td>{r.kv}</td><td>{r.rpm}</td><td>{r.amps}A</td></tr>)}</tbody></table></div>}
      <SecHd>KV COMPARISON</SecHd>
      {[{l:"Fleta*",kv:2645,c:"#974900"},{l:"V21-S",kv:2580,c:"#084298"},{l:"V30",kv:2464,c:"#842029"}].map((x,i)=><div key={i} className="d-flex align-items-center gap-2 mb-2"><span style={{fontSize:11,color:x.c,minWidth:60,fontFamily:"DM Mono,monospace"}}>{x.l}</span><div className="bar-track"><div className="bar-fill" style={{width:`${(x.kv/2700)*100}%`,background:x.c}}/></div><span style={{fontSize:11,color:x.c,minWidth:54,textAlign:"right"}}>{x.kv} KV</span></div>)}
      <div style={{fontSize:9,color:"#6c757d",marginBottom:12}}>* Test/backup — ROAR unconfirmed</div>
      <SecHd>ALL MOTORS</SecHd>
      <div className="rc-card" style={{overflow:"hidden"}}><table className="table table-sm mb-0" style={{fontSize:12}}><thead><tr style={{background:"#f8f9fa"}}><th style={{fontSize:9,color:"#6c757d"}}>MOTOR</th><th style={{fontSize:9,color:"#6c757d"}}>CLASS</th><th style={{fontSize:9,color:"#6c757d"}}>SETTING</th></tr></thead><tbody>{names.map(n=>{const mot=motorData[n];const hasD=mot.analyzerData?.length>0;const tC={primary:"#084298",test:"#974900",backup:"#842029",vta:"#198754",nodata:"#6c757d"}[mot.tier]||"#6c757d";return(<tr key={n} style={{background:n===active?"#fffbea":"#fff",cursor:"pointer"}} onClick={()=>setActive(n)}><td style={{fontWeight:n===active?700:400,fontSize:11,color:tC}}>{n.replace("R1 ","").replace("Hobbywing ","")}{mot.incoming?" ⏳":""}{mot.factoryTuned&&<span className="badge bg-success ms-1" style={{fontSize:8}}>FACTORY</span>}</td><td><span style={{fontSize:10,color:CC[mot.classes?.[0]]||"#6c757d"}}>{mot.classes?.join("/")}</span></td><td>{mot.factoryTuned?<span className="badge bg-success" style={{fontSize:9}}>Factory</span>:hasD?<span style={{color:"#198754",fontWeight:700}}>{mot.raceSet}°</span>:mot.raceSet?<span style={{color:"#856404"}}>{mot.raceSet}° est.</span>:<span style={{color:"#adb5bd"}}>No data</span>}</td></tr>);})}</tbody></table></div>
    </div>
  );
}

// ─── CARS PAGE ────────────────────────────────────────────────────────────────
function CarsPage({defaults,cars}) {
  const [active,setActive]=useState("CRC CK25");
  const defs = defaults || DEFAULT_DEFAULTS;
  const carData = cars || DEFAULT_CARS;
  const car = carData[active]||{};
  const clsColor = CC[car.class]||"#6c757d";
  const isPan = !["VTA","TT02"].includes(car.class);
  const isVTA = car.class==="VTA";
  const carRollout = calculateRollout(car);
  const specRows=[["TIMING",car.timing,true],["PINION",car.pinion,true],...(car.spurGear?[["SPUR",car.spurGear,false]]:[]),...(isPan?[["ROLLOUT",formatRollout(carRollout),true]]:[]),["BATTERY",car.battery,false],["FRONT RH",car.frontRH,true],["REAR RH",car.rearRH,true],["DROOP",car.droop,true],["TIRES",car.tires,false],["MOTOR",car.motor,false],["ESC",car.esc,false],...(car.camberF?[["CAMBER F/R",`${car.camberF} / ${car.camberR}`,true]]:[]),...(car.toeF?[["TOE F/R",`${car.toeF} / ${car.toeR}`,true]]:[])];
  const vtaRows=isVTA?[["SPRING F",car.springF,true],["SPRING R",car.springR,true],["SHOCK OIL F",car.shockOilF,false],["SHOCK OIL R",car.shockOilR,false],["REBOUND F",car.reboundF,false],["REBOUND R",car.reboundR,false],["ARB FRONT",car.arbF,true],["ARB REAR",car.arbR,true],["SHOCK LEN",car.shockLength,false],["FRONT DIFF",car.frontDiff,false],["REAR DIFF",car.rearDiff,true],["WEIGHT",car.totalWeight,false],["BALANCE",car.weightBalance,false],["BODY",car.body,false],["WING",car.wing,false]].filter(([,v])=>v):[];
  const defaultDiameters = { gt12: 44.5, lmp: 42 };
  const pinionOptions = [45,46,47,48,49,50,51,52,53];
  const [rollMode,setRollMode]=useState("gt12");
  useEffect(() => { setRollMode(car.class === 'LMP' ? 'lmp' : 'gt12'); }, [car.class]);
  const rollTire = car.tireDiameter || defaultDiameters[rollMode];
  const rollSpur = car.spurGear || '110';
  const rollBaseline = parseGearValue(car.pinion) || (rollMode === 'lmp' ? 47 : 49);
  const rolloutData = pinionOptions.map((pinion) => [pinion, calculateRollout({ tireDiameter: rollTire, spurGear: rollSpur, pinion })]);
  const rd = { label: `${rollMode === 'lmp' ? 'LMP' : 'GT12'} — ${rollTire}mm`, baseline: rollBaseline, data: rolloutData };

  return (
    <div>
      <div className="d-flex gap-1 mb-3 flex-wrap">{Object.keys(carData).map(n=><CarBtn key={n} name={n} car={carData[n]} active={active===n} onClick={()=>setActive(n)}/>)}</div>
      {car.notes&&<div className="alert alert-warning py-2 mb-2" style={{fontSize:12}}>{car.notes}</div>}
      <MinBadges cls={car.class} defs={defs}/>
      <div className="rc-card mt-2 mb-3" style={{borderTop:`4px solid ${clsColor}`,overflow:"hidden"}}>
        <div className="p-3 pb-2" style={{borderBottom:"1px solid #f0f2f5"}}><div style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,fontSize:20,color:clsColor}}>{active.replace(" (VTA)"," — VTA")}</div><div style={{fontSize:9,color:"#6c757d",letterSpacing:2}}>{car.class} — {car.chassis}</div></div>
        <div className="row g-0">{specRows.map(([k,v,hi],i)=><div key={i} className="col-6 p-2" style={{borderBottom:"1px solid #f8f9fa",borderRight:i%2===0?"1px solid #f8f9fa":"none"}}><div className="spec-key">{k}</div><div className={`spec-val ${hi?"hi":""}`} style={{color:hi?clsColor:"#495057"}}>{v||"—"}</div></div>)}</div>
      </div>
      {vtaRows.length>0&&<><SecHd>SUSPENSION DETAIL — CHRIS ADAMS BASELINE</SecHd><div className="rc-card mb-3" style={{borderTop:"4px solid #198754",overflow:"hidden"}}><div className="row g-0">{vtaRows.map(([k,v,hi],i)=><div key={i} className="col-6 p-2" style={{borderBottom:"1px solid #f8f9fa",borderRight:i%2===0?"1px solid #f8f9fa":"none"}}><div className="spec-key">{k}</div><div className={`spec-val ${hi?"hi":""}`} style={{color:hi?"#198754":"#495057"}}>{v||"—"}</div></div>)}</div><div className="px-3 py-2" style={{borderTop:"1px solid #f0f2f5",fontSize:10,color:"#6c757d"}}>Source: Chris Adams X4'26 Basic US Black Carpet (RCCA)</div></div></>}
      {isPan&&<><SecHd>ROLLOUT CHART</SecHd><div className="d-flex gap-1 mb-2"><button className={`btn btn-sm ${rollMode==="gt12"?"btn-warning":"btn-outline-secondary"}`} onClick={()=>setRollMode("gt12")} style={{flex:1,fontSize:11}}>GT12</button><button className={`btn btn-sm ${rollMode==="lmp"?"btn-primary":"btn-outline-secondary"}`} onClick={()=>setRollMode("lmp")} style={{flex:1,fontSize:11,color:rollMode==="lmp"?"#fff":undefined}}>LMP</button></div><div className="rc-card" style={{overflow:"hidden"}}><table className="table data-table mb-0"><thead><tr><th>PINION</th><th>ROLLOUT</th></tr></thead><tbody>{rd.data.map(([p,r])=><tr key={p} style={{background:p===rd.baseline?"#fffbea":"#fff"}}><td className="col-deg" style={{color:p===rd.baseline?"#856404":"#0d6efd"}}>{p}T{p===rd.baseline?" ★":""}</td><td style={{color:p===rd.baseline?"#856404":"#212529",fontWeight:p===rd.baseline?700:400}}>{r}</td></tr>)}</tbody></table></div><div style={{fontSize:9,color:"#6c757d",marginTop:4}}>★ = baseline</div></>}
    </div>
  );
}

// ─── GEAR PAGE ────────────────────────────────────────────────────────────────
function GearPage({inventory, motors}) {
  const inv = inventory || DEFAULT_INVENTORY;
  const mots = motors?.motors || DEFAULT_MOTORS.motors;
  return (
    <div>
      <SecHd mt={false}>FULL INVENTORY</SecHd>
      {Object.entries(inv).filter(([k])=>!k.startsWith("_")).map(([cat,items])=>(
        <div key={cat} className="mb-3">
          <div className="inv-cat">{cat.toUpperCase()}</div>
          {typeof items==="object"&&!Array.isArray(items)
            ? Object.entries(items).map(([sub,si])=><div key={sub} className="mb-2"><div style={{fontSize:9,color:"#6c757d",letterSpacing:1,marginBottom:3,marginLeft:8}}>{sub}</div>{si.map((item,i)=><div key={i} className="inv-item">{item}</div>)}</div>)
            : items.map((item,i)=><div key={i} className={`inv-item ${item.includes("incoming")?"incoming":""}`}>{item}</div>)
          }
        </div>
      ))}
      <SecHd>MOTOR DATA STATUS</SecHd>
      <div className="rc-card" style={{overflow:"hidden"}}><table className="table table-sm mb-0" style={{fontSize:12}}><thead><tr style={{background:"#f8f9fa"}}><th style={{fontSize:9,color:"#6c757d"}}>MOTOR</th><th style={{fontSize:9,color:"#6c757d"}}>CLASS</th><th style={{fontSize:9,color:"#6c757d"}}>SETTING</th></tr></thead><tbody>{Object.entries(mots).map(([name,m])=>{const hasD=m.analyzerData?.length>0;return(<tr key={name} style={{background:hasD?"#f0fff4":"#fff"}}><td style={{fontWeight:hasD?600:400,fontSize:11}}>{name.replace("R1 ","").replace("Hobbywing ","")}{m.incoming?" ⏳":""}{m.factoryTuned&&<span className="badge bg-success ms-1" style={{fontSize:8}}>FACTORY</span>}</td><td><span style={{fontSize:10,color:CC[m.classes?.[0]]||"#6c757d"}}>{m.classes?.join("/")}</span></td><td>{m.factoryTuned?<span className="badge bg-success" style={{fontSize:9}}>Factory</span>:hasD?<span style={{color:"#198754",fontWeight:700}}>{m.raceSet}°</span>:m.raceSet?<span style={{color:"#856404"}}>{m.raceSet}° est.</span>:<span style={{color:"#adb5bd"}}>No data</span>}</td></tr>);})}</tbody></table></div>
      <SecHd>MOTOR TEST PROTOCOL</SecHd>
      {["Run all tests in Team Qik 123 (neutral reference)","Compare every motor to V21-S baseline","Promote only if: faster, easier, no fade","Log analyzer data before and after each session"].map((t,i)=><div key={i} className="d-flex gap-2 mb-1 rc-card px-3 py-2"><span style={{color:"#f5c400",background:"#1a1a2e",borderRadius:3,padding:"1px 6px",fontSize:12,fontWeight:700,minWidth:22,textAlign:"center"}}>{i+1}</span><span style={{fontSize:12,color:"#495057"}}>{t}</span></div>)}
    </div>
  );
}

// ─── DATA PAGE ────────────────────────────────────────────────────────────────
function DataPage({defaults, cars, motors, inventory, onSaveConfig, syncState}) {
  const [which,setWhich]=useState("defs");
  const [defsJson,setDefsJson]=useState(()=>JSON.stringify(defaults||DEFAULT_DEFAULTS,null,2));
  const [carsJson,setCarsJson]=useState(()=>JSON.stringify(cars||DEFAULT_CARS,null,2));
  const [invJson,setInvJson]=useState(()=>JSON.stringify(inventory||DEFAULT_INVENTORY,null,2));
  const [motorsJson,setMotorsJson]=useState(()=>JSON.stringify(motors||DEFAULT_MOTORS,null,2));
  const [msg,setMsg]=useState(null);
  const flash=(text,type="success")=>{setMsg({text,type});setTimeout(()=>setMsg(null),3500);};

  const save = async (key, json, label) => {
    try {
      const parsed = JSON.parse(json);
      await onSaveConfig({[key]: parsed});
      flash(`${label} saved to server.`);
    } catch(e) {
      flash("Error: " + e.message, "danger");
    }
  };

  const exportAll = async () => {
    try {
      const data = await api.exportAll();
      downloadJSON(`birdyracing_export_${new Date().toISOString().split("T")[0]}.json`, data);
    } catch(e) {
      flash("Export failed: " + e.message, "danger");
    }
  };

  return (
    <div>
      {msg&&<div className={`alert alert-${msg.type} py-2 mb-3`} style={{fontSize:12}}>{msg.text}</div>}
      <div className="d-flex gap-1 mb-2">
        {[{id:"defs",label:"DEFAULTS"},{id:"cars",label:"CARS"},{id:"inv",label:"INVENTORY"},{id:"motors",label:"MOTORS"}].map(t=>(
          <button key={t.id} className={`btn btn-sm flex-grow-1 ${which===t.id?"btn-warning":"btn-outline-secondary"}`} style={{fontFamily:"DM Mono,monospace"}} onClick={()=>setWhich(t.id)}>{t.label}</button>
        ))}
      </div>
      <button className="btn btn-outline-primary btn-sm w-100 mb-3" onClick={exportAll}>↓ EXPORT FULL BACKUP</button>

      {which==="defs"&&<>
        <div className="alert alert-info py-2 mb-2" style={{fontSize:11}}>Class minimums — used by Cars and Run Log pages. Saved to server.</div>
        <textarea className="form-control json-ta mb-2" rows={22} value={defsJson} onChange={e=>setDefsJson(e.target.value)}/>
        <div className="d-flex gap-2">
          <button className="btn btn-warning btn-sm flex-grow-1" onClick={()=>save("defaults",defsJson,"Defaults")}>SAVE TO SERVER</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>{try{downloadJSON("defaults.json",JSON.parse(defsJson))}catch{flash("Fix JSON","danger")}}}>↓</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>{setDefsJson(JSON.stringify(DEFAULT_DEFAULTS,null,2));flash("Reset (save to apply)","warning");}}>RESET</button>
        </div>
      </>}
      {which==="cars"&&<>
        <div className="alert alert-info py-2 mb-2" style={{fontSize:11}}>Car definitions — drives the Cars page and Run Log auto-fill. Saved to server.</div>
        <textarea className="form-control json-ta mb-2" rows={22} value={carsJson} onChange={e=>setCarsJson(e.target.value)}/>
        <div className="d-flex gap-2">
          <button className="btn btn-warning btn-sm flex-grow-1" onClick={()=>save("cars",carsJson,"Cars")}>SAVE TO SERVER</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>{try{downloadJSON("cars.json",JSON.parse(carsJson))}catch{flash("Fix JSON","danger")}}}>↓</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>{setCarsJson(JSON.stringify(DEFAULT_CARS,null,2));flash("Reset (save to apply)","warning");}}>RESET</button>
        </div>
      </>}
      {which==="inv"&&<>
        <div className="alert alert-info py-2 mb-2" style={{fontSize:11}}>Gear inventory — shown on Gear tab. Saved to server.</div>
        <textarea className="form-control json-ta mb-2" rows={22} value={invJson} onChange={e=>setInvJson(e.target.value)}/>
        <div className="d-flex gap-2">
          <button className="btn btn-warning btn-sm flex-grow-1" onClick={()=>save("inventory",invJson,"Inventory")}>SAVE TO SERVER</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>{try{downloadJSON("inventory.json",JSON.parse(invJson))}catch{flash("Fix JSON","danger")}}}>↓</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>{setInvJson(JSON.stringify(DEFAULT_INVENTORY,null,2));flash("Reset (save to apply)","warning");}}>RESET</button>
        </div>
      </>}
      {which==="motors"&&<>
        <div className="alert alert-info py-2 mb-2" style={{fontSize:11}}>Motor analyzer data — drives Motors tab and power zone charts. Saved to server.</div>
        <textarea className="form-control json-ta mb-2" rows={22} value={motorsJson} onChange={e=>setMotorsJson(e.target.value)}/>
        <div className="d-flex gap-2">
          <button className="btn btn-warning btn-sm flex-grow-1" onClick={()=>save("motors",motorsJson,"Motors")}>SAVE TO SERVER</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>{try{downloadJSON("motors.json",JSON.parse(motorsJson))}catch{flash("Fix JSON","danger")}}}>↓</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={()=>{setMotorsJson(JSON.stringify(DEFAULT_MOTORS,null,2));flash("Reset (save to apply)","warning");}}>RESET</button>
        </div>
      </>}
    </div>
  );
}

// ─── RUN LOG PAGE ─────────────────────────────────────────────────────────────
const BLANK_FORM = {date:new Date().toISOString().split("T")[0],track:"Race Place RC",car:"",classType:"",motor:"",esc:"",battery:"",timing:"",pinion:"",rollout:"",temp:"",frontRH:"",rearRH:"",droop:"",camberF:"",camberR:"",toeF:"",toeR:"",bestLap:"",avgLap:"",feel:"",grip:"",result:"",tireAdditive:"SXT 3.0",changes:"None",notes:""};

function RunLogPage({runs, defaults, cars, onSaveRun, onDeleteRun, onClearRuns}) {
  const [form,setForm]=useState({...BLANK_FORM});
  const [view,setView]=useState("new");
  const [saving,setSaving]=useState(false);
  const fileRef=useRef();
  const defs = defaults || DEFAULT_DEFAULTS;
  const carData = cars || DEFAULT_CARS;
  const up=(k,v)=>setForm(f=>({...f,[k]:v}));
  const isTouring=["VTA","TT02"].includes(form.classType);
  const isVTA=form.classType==="VTA";
  const ti=tempInfo(form.temp);
  const mins=defs?.classMinimums?.[form.classType];

  const pickCar=name=>{
    const d=carData[name];
    if(!d){up("car",name);return;}
    const rolloutValue = calculateRollout(d);
    setForm(f=>({...f,car:name,classType:d.class||f.classType,motor:d.motor||"",esc:d.esc||"",battery:d.battery||"",timing:d.timing||"",pinion:d.pinion||"",rollout:rolloutValue!=null?`${rolloutValue}`:(d.rollout||""),frontRH:d.frontRH||"",rearRH:d.rearRH||"",droop:d.droop||"",camberF:d.camberF||"",camberR:d.camberR||"",toeF:d.toeF||"",toeR:d.toeR||"",tireAdditive:d.tireAdditive||"SXT 3.0",changes:d.changes||"None"}));
  };

  const handleSave = async () => {
    if(!form.car){alert("Select a car first.");return;}
    setSaving(true);
    try {
      await onSaveRun({...form, id:Date.now()});
      setForm({...BLANK_FORM, date:form.date, track:form.track});
      setView("saved");
    } finally {
      setSaving(false);
    }
  };

  const Inp=({label,id,type="text",placeholder=""})=>(<div><label className="log-lbl">{label}</label><input type={type} className="form-control form-control-sm log-inp" placeholder={placeholder} value={form[id]||""} onChange={e=>up(id,e.target.value)}/></div>);
  const TP=({field,val,label})=>{const isOn=form[field]===val;const c=CC[val]||{Good:"#198754",Push:"#856404",Loose:"#084298",Lazy:"#6f42c1",Fade:"#842029",Tweak:"#432874",Low:"#6c757d",Med:"#0d6efd",High:"#198754",Better:"#198754",Same:"#6c757d",Worse:"#842029"}[val]||"#1a1a2e";return(<button onClick={()=>up(field,isOn?"":val)} className="me-1 mb-1" style={{border:`1.5px solid ${isOn?c:"#ced4da"}`,background:isOn?c:"#fff",color:isOn?(val==="GT12"?"#1a1a2e":"#fff"):"#6c757d",fontSize:11,fontFamily:"DM Mono,monospace",padding:"4px 10px",borderRadius:4,cursor:"pointer"}}>{label||val}</button>);};

  const importRuns = (e) => {
    const f=e.target.files[0]; if(!f)return;
    const r=new FileReader();
    r.onload=async(ev)=>{
      try {
        const d=JSON.parse(ev.target.result);
        const imp=d.runs||d;
        if(!Array.isArray(imp))throw new Error("Invalid format");
        for(const run of imp) await onSaveRun(run);
        alert(`Imported ${imp.length} runs.`);
      } catch(err) { alert("Invalid file: "+err.message); }
    };
    r.readAsText(f);
    e.target.value="";
  };

  return (
    <div>
      <div className="d-flex gap-1 mb-3">
        <button className={`btn btn-sm flex-grow-1 ${view==="new"?"btn-warning":"btn-outline-secondary"}`} onClick={()=>setView("new")}>NEW RUN</button>
        <button className={`btn btn-sm flex-grow-1 ${view==="saved"?"btn-warning":"btn-outline-secondary"}`} onClick={()=>setView("saved")}>SAVED ({runs.length})</button>
      </div>

      {view==="new"&&<div className="d-flex flex-column gap-3">
        <div className="row g-2"><div className="col-5"><Inp label="DATE" id="date" type="date"/></div><div className="col-7"><Inp label="TRACK" id="track"/></div></div>
        <div><label className="log-lbl">CAR — auto-fills defaults</label><div className="d-flex flex-wrap">{Object.keys(cars).map(n=><CarBtn key={n} name={n} car={cars[n]} active={form.car===n} onClick={()=>pickCar(n)}/>)}</div>{form.car&&cars[form.car]?.notes&&<div style={{fontSize:10,color:"#856404",marginTop:3}}>{cars[form.car].notes}</div>}{mins&&<MinBadges cls={form.classType} defs={defs}/>}</div>
        <div><label className="log-lbl">GRIP</label>{["Low","Med","High"].map(g=><TP key={g} field="grip" val={g}/>)}</div>
        <div className="row g-2"><div className="col-4"><Inp label="MOTOR" id="motor"/></div><div className="col-4"><Inp label="ESC" id="esc"/></div><div className="col-4"><Inp label="BATTERY" id="battery"/></div></div>
        <div className="row g-2"><div className="col-3"><Inp label="TIMING°" id="timing"/></div><div className="col-3"><Inp label="PINION" id="pinion" type="number"/></div>{!isVTA&&<div className="col-3"><Inp label="ROLLOUT" id="rollout"/></div>}<div className={isVTA?"col-6":"col-3"}><Inp label="TEMP °F" id="temp" type="number" placeholder="145"/></div></div>
        {ti&&<div className={`alert alert-${ti.cls} py-2`} style={{fontSize:12}}>Motor temp: <strong>{form.temp}°F — {ti.lbl}</strong>{ti.cls==="danger"?" — check gearing immediately":""}</div>}
        <div className="row g-2"><div className="col-4"><Inp label="FRONT RH" id="frontRH" type="number"/></div><div className="col-4"><Inp label="REAR RH" id="rearRH" type="number"/></div><div className="col-4"><Inp label="DROOP" id="droop"/></div></div>
        {isTouring&&<div className="row g-2"><div className="col-3"><Inp label="CAM F°" id="camberF"/></div><div className="col-3"><Inp label="CAM R°" id="camberR"/></div><div className="col-3"><Inp label="TOE F°" id="toeF"/></div><div className="col-3"><Inp label="TOE R°" id="toeR"/></div></div>}
        <Inp label="TIRE ADDITIVE" id="tireAdditive" placeholder="SXT 3.0"/>
        <div className="row g-2"><div className="col-6"><Inp label="BEST LAP" id="bestLap" placeholder="00.000"/></div><div className="col-6"><Inp label="AVG LAP" id="avgLap" placeholder="00.000"/></div></div>
        <div><label className="log-lbl">FEEL</label>{["Good","Push","Loose","Lazy","Fade","Tweak"].map(f=><TP key={f} field="feel" val={f}/>)}</div>
        <div><label className="log-lbl">CHANGES MADE</label><textarea className="form-control form-control-sm log-inp" rows={3} style={{resize:"none"}} placeholder="None" value={form.changes} onChange={e=>up("changes",e.target.value)}/></div>
        <div><label className="log-lbl">RESULT</label>{["Better","Same","Worse"].map(r=><TP key={r} field="result" val={r}/>)}</div>
        <div><label className="log-lbl">NOTES</label><textarea className="form-control form-control-sm log-inp" rows={2} style={{resize:"none"}} placeholder="Observations..." value={form.notes} onChange={e=>up("notes",e.target.value)}/></div>
        <button className="btn btn-warning fw-bold w-100" style={{fontFamily:"DM Mono,monospace",letterSpacing:2}} onClick={handleSave} disabled={saving}>{saving?"SAVING...":"SAVE RUN"}</button>
      </div>}

      {view==="saved"&&<div>
        <div className="d-flex gap-1 mb-3">
          <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={async()=>{const data=await api.exportAll();downloadJSON(`runs_${new Date().toISOString().split("T")[0]}.json`,data);}}>↓ EXPORT</button>
          <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={()=>fileRef.current?.click()}>↑ IMPORT</button>
          <input type="file" ref={fileRef} accept=".json" style={{display:"none"}} onChange={importRuns}/>
        </div>
        {!runs.length?<div className="text-center text-muted p-5" style={{border:"1px dashed #ced4da",borderRadius:6,fontSize:13}}>No runs saved yet.</div>:runs.map(r=>{
          const ti2=tempInfo(r.temp);
          const feelBg={Good:"#d1e7dd",Push:"#fffbea",Loose:"#cfe2ff",Lazy:"#f3e8ff",Fade:"#f8d7da",Tweak:"#e9d5ff"};
          const feelC={Good:"#0f5132",Push:"#856404",Loose:"#084298",Lazy:"#432874",Fade:"#842029",Tweak:"#432874"};
          const cc2=CC[r.classType||r.class]||"#6c757d";
          return(
            <div key={r.id} className="run-card" style={{borderLeft:`4px solid ${cc2}`}}>
              <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-1">
                <div className="run-meta">{r.date} · {r.track} · <strong style={{color:cc2}}>{r.classType||""}</strong></div>
                <div className="d-flex gap-1 flex-wrap">
                  {r.car&&<span className="badge bg-light text-dark border" style={{fontSize:9}}>{r.car}</span>}
                  {r.feel&&<span className="badge" style={{background:feelBg[r.feel]||"#f8f9fa",color:feelC[r.feel]||"#6c757d",fontSize:9}}>{r.feel}</span>}
                  {ti2&&<span className={`badge bg-${ti2.cls}`} style={{fontSize:9}}>{r.temp}°F {ti2.lbl}</span>}
                  {r.result&&<span className="badge bg-secondary" style={{fontSize:9}}>{r.result}</span>}
                  <button className="btn btn-link p-0" style={{fontSize:11,color:"#dc3545",lineHeight:1}} onClick={()=>onDeleteRun(r.id)}>✕</button>
                </div>
              </div>
              <div style={{fontSize:12,color:"#495057",lineHeight:1.9}}>
                {r.motor&&<span style={{color:"#212529",fontWeight:600}}>{r.motor}</span>}
                {r.timing&&<> · <strong>{r.timing}</strong></>}
                {r.pinion&&<> · {r.pinion}T</>}
                {r.rollout&&!["VTA","TT02"].includes(r.classType)&&<> · Rollout {r.rollout}</>}
                {(r.frontRH||r.rearRH)&&<><br/>RH F{r.frontRH}/R{r.rearRH}{r.droop&&` · Droop ${r.droop}`}</>}
                {r.camberF&&<><br/>Cam F{r.camberF}/R{r.camberR} · Toe F{r.toeF}/R{r.toeR}</>}
                {r.bestLap&&<><br/>Best <strong style={{color:"#198754"}}>{r.bestLap}</strong>{r.avgLap&&` · Avg ${r.avgLap}`}</>}
                {r.tireAdditive&&r.tireAdditive!=="None"&&<><br/>Tire: {r.tireAdditive}</>}
                {r.changes&&r.changes!=="None"&&<><br/><span style={{color:"#6c757d"}}>{r.changes}</span></>}
                {r.notes&&<><br/><span style={{color:"#adb5bd"}}>{r.notes}</span></>}
              </div>
            </div>
          );
        })}
        {runs.length>0&&<button className="btn btn-outline-danger btn-sm w-100 mt-2" onClick={()=>{if(window.confirm("Delete ALL saved runs?")){onClearRuns();}}}>CLEAR ALL RUNS</button>}
      </div>}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const TABS = [
  {id:"quick",  label:"QUICK",  icon:<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/></svg>},
  {id:"theory", label:"THEORY", icon:<svg viewBox="0 0 24 24"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>},
  {id:"motors", label:"MOTORS", icon:<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/></svg>},
  {id:"cars",   label:"CARS",   icon:<svg viewBox="0 0 24 24"><rect x="2" y="9" width="20" height="9" rx="2"/><path d="M6 9l2-4h8l2 4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>},
  {id:"gear",   label:"GEAR",   icon:<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>},
  {id:"data",   label:"DATA",   icon:<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>},
  {id:"log",    label:"LOG",    icon:<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>},
];

export default function App() {
  const [tab, setTab]           = useState("quick");
  const [loading, setLoading]   = useState(true);
  const [syncState, setSyncState] = useState("ok"); // ok | busy | err
  const [runs, setRuns]         = useState([]);
  const [defaults, setDefaults] = useState(null);
  const [cars, setCars]         = useState(null);
  const [motors, setMotors]     = useState(null);
  const [inventory, setInventory] = useState(null);

  // Inject styles once
  useEffect(() => {
    if (!document.getElementById("rc-css")) {
      const s = document.createElement("style");
      s.id = "rc-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const hasData = (obj) => obj && typeof obj === 'object' && Object.keys(obj).length > 0;

  // Load everything from server on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [configData, runsData] = await Promise.all([api.getConfig(), api.getRuns()]);
        setDefaults(hasData(configData.defaults) ? configData.defaults : DEFAULT_DEFAULTS);
        setCars(hasData(configData.cars) ? configData.cars : DEFAULT_CARS);
        setMotors(hasData(configData.motors) ? configData.motors : DEFAULT_MOTORS);
        setInventory(hasData(configData.inventory) ? configData.inventory : DEFAULT_INVENTORY);
        setRuns(Array.isArray(runsData) ? runsData : []);
      } catch(e) {
        console.warn("Server unavailable, using defaults:", e.message);
        setDefaults(DEFAULT_DEFAULTS);
        setCars(DEFAULT_CARS);
        setMotors(DEFAULT_MOTORS);
        setInventory(DEFAULT_INVENTORY);
        setSyncState("err");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveRun = useCallback(async (run) => {
    setSyncState("busy");
    try {
      await api.saveRun(run);
      const updated = await api.getRuns();
      setRuns(updated);
      setSyncState("ok");
    } catch(e) {
      setSyncState("err");
      throw e;
    }
  }, []);

  const handleDeleteRun = useCallback(async (id) => {
    setSyncState("busy");
    try {
      await api.deleteRun(id);
      setRuns(prev => prev.filter(r => r.id !== id));
      setSyncState("ok");
    } catch(e) { setSyncState("err"); }
  }, []);

  const handleClearRuns = useCallback(async () => {
    setSyncState("busy");
    try {
      await api.clearRuns();
      setRuns([]);
      setSyncState("ok");
    } catch(e) { setSyncState("err"); }
  }, []);

  const handleSaveConfig = useCallback(async (payload) => {
    setSyncState("busy");
    try {
      await api.saveConfig(payload);
      // Refresh config from server
      const updated = await api.getConfig();
      if (updated.defaults)  setDefaults(updated.defaults);
      if (updated.cars)      setCars(updated.cars);
      if (updated.motors)    setMotors(updated.motors);
      if (updated.inventory) setInventory(updated.inventory);
      setSyncState("ok");
    } catch(e) {
      setSyncState("err");
      throw e;
    }
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{minHeight:"100vh",background:"#f0f2f5"}}>
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status"/>
          <div style={{fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,fontSize:20,letterSpacing:2,color:"#1a1a2e"}}>BIRDY RACING</div>
          <div style={{fontSize:11,color:"#6c757d"}}>Loading from server...</div>
        </div>
      </div>
    );
  }

  const syncColor = {ok:"#198754",busy:"#ffc107",err:"#dc3545"}[syncState];

  return (
    <div style={{minHeight:"100vh"}}>
      <nav className="app-topbar d-flex justify-content-between align-items-center px-3" style={{height:52}}>
        <div>
          <div className="app-logo" style={{display:"flex",alignItems:"center",gap:4}}>
            GT12 · LMP · VTA · TT02
            <span className="sync-dot" style={{background:syncColor}} title={syncState==="ok"?"Synced":syncState==="busy"?"Saving...":"Server error"}/>
          </div>
          <div className="app-sub">BIRDY RACING — RACE PLACE RC</div>
        </div>
        <span style={{fontSize:8,color:"#888",border:"1px solid #333",padding:"2px 6px",fontFamily:"DM Mono,monospace"}}>NRM OK</span>
      </nav>

      <div className="content-wrap">
        {tab==="quick"  && <QuickPage/>}
        {tab==="theory" && <TheoryPage/>}
        {tab==="motors" && <MotorsPage motors={motors}/>}
        {tab==="cars"   && <CarsPage defaults={defaults} cars={cars}/>}
        {tab==="gear"   && <GearPage inventory={inventory} motors={motors}/>}
        {tab==="data"   && <DataPage defaults={defaults} cars={cars} motors={motors} inventory={inventory} onSaveConfig={handleSaveConfig} syncState={syncState}/>}
        {tab==="log"    && <RunLogPage runs={runs} defaults={defaults} cars={cars} onSaveRun={handleSaveRun} onDeleteRun={handleDeleteRun} onClearRuns={handleClearRuns}/>}
      </div>

      <nav className="app-tabbar">
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={`app-tab ${tab===t.id?"active":""}`}>
            {t.icon}{t.label}<div className="tab-dot"/>
          </button>
        ))}
      </nav>
    </div>
  );
}
