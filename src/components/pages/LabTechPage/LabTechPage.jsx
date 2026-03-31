import { useState } from "react";

const C = {
  purple: "#7C6EF6",
  purpleLight: "#EEEEFF",
  red: "#F75C5C",
  redLight: "#FFF0F0",
  teal: "#2EC4B6",
  tealLight: "#E6FAF9",
  orange: "#F8A84B",
  orangeLight: "#FFF5E6",
  bg: "#F3F5FB",
  white: "#FFFFFF",
  text: "#1A1D2E",
  muted: "#9EA3B5",
  border: "#ECEEF5",
};

const NAV = [
  { label: "Dashboard", icon: "⊞", active: true },
  { label: "Chat", icon: "💬", badge: 17 },
  { label: "Schedule", icon: "📅", badge: 2 },
  { label: "Reports", icon: "📊" },
];

const DB = [
  { label: "Documents", icon: "🗂", expandable: true, children: ["Dosage guidelines", "Case study", "Treatment protocol"] },
  { label: "Patients", icon: "👤" },
  { label: "Billing & Insurance", icon: "💳", badge: 10 },
];

const PATIENTS = [
  { id: 1, type: "Online consultation", name: "Alison Cooper", time: "9:00", color: C.purple, icon: "💻" },
  { id: 2, type: "Cardiogram", name: "Brad Duncan", time: "9:30", color: C.red, icon: "📈", urgent: true },
  { id: 3, type: "Annual check-up", name: "Linda Huston", time: "12:00", color: C.orange, icon: "🔬" },
  { id: 4, type: "Online consultation", name: "Miracle Culhane", time: "12:40", color: C.purple, icon: "💻" },
  { id: 5, type: "B-type Natriuretic Peptide", name: "Randy Baptista", time: "14:15", color: C.teal, icon: "💊" },
  { id: 6, type: "Resting ECG", name: "Adison Herwitz", time: "15:00", color: "#F06292", icon: "❤️" },
];

const SCHEDULE = [
  { title: "Online consultation", sub: "Alison Cooper", time: "9:00 – 9:30", color: C.teal, icon: "💻", highlight: true },
  { title: "Cardiogram", sub: "Brad Duncan", time: "9:30 – 10:00", color: C.purple, icon: "📈" },
  { title: "Break", sub: "45 min", time: "", color: C.border, icon: "☕", isBreak: true },
  { title: "Production meeting", sub: "", time: "10:45 – 11:45", color: C.orange, icon: "👥" },
  { title: "Annual check-up", sub: "", time: "", color: C.red, icon: "🔬" },
];

const CAL = [
  [29,30,31,1,2,3,4],
  [5,6,7,8,9,10,11],
  [12,13,14,15,16,17,18],
  [19,20,21,22,23,24,25],
  [26,27,28,29,30,1,2],
];

const MARKERS = {
  14: C.teal, 15: C.teal,
  16: C.red, 17: C.red,
  21: "today",
  22: C.purple, 23: C.orange,
  24: C.red, 25: C.orange,
  27: C.teal,
};

function Dot({ color, size = 8 }) {
  return <span style={{ display:"inline-block", width:size, height:size, borderRadius:"50%", background:color, flexShrink:0 }} />;
}

function Av({ initials, color, size = 36 }) {
  return (
      <div style={{ width:size, height:size, borderRadius:"50%", background:color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:size*0.38, flexShrink:0 }}>
        {initials}
      </div>
  );
}

function NavRow({ icon, label, badge, active, expandable, expanded, onClick }) {
  return (
      <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:12, cursor:"pointer", background: active ? C.purpleLight : "transparent", color: active ? C.purple : C.text, fontWeight: active ? 700 : 400, fontSize:13, marginBottom:2, userSelect:"none" }}>
        <span style={{ width:20, textAlign:"center" }}>{icon}</span>
        <span style={{ flex:1 }}>{label}</span>
        {badge && <span style={{ background:C.red, color:"#fff", borderRadius:20, fontSize:10, fontWeight:800, padding:"2px 7px" }}>{badge}</span>}
        {expandable && <span style={{ color:C.muted, fontSize:11 }}>{expanded ? "∨" : "›"}</span>}
      </div>
  );
}

function SLabel({ children }) {
  return <div style={{ fontSize:10, color:C.muted, fontWeight:800, letterSpacing:1.2, padding:"12px 12px 4px" }}>{children}</div>;
}

function StatCard({ label, value, change, positive, color, pts }) {
  return (
      <div style={{ background:C.white, borderRadius:16, padding:"18px 22px", flex:1, boxShadow:"0 2px 14px #00000009" }}>
        <div style={{ color:C.muted, fontSize:12 }}>Last month</div>
        <div style={{ fontWeight:700, fontSize:13, marginTop:2 }}>{label}</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"8px 0 10px" }}>
          <span style={{ fontSize:28, fontWeight:900 }}>{value}</span>
          <span style={{ fontSize:12, fontWeight:700, color: positive ? C.teal : C.red, background: positive ? C.tealLight : C.redLight, padding:"3px 9px", borderRadius:20 }}>{change}</span>
        </div>
        <svg width="100%" height="38" viewBox="0 0 200 38">
          <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
  );
}

export default function LabTechPage() {
  const [docsOpen, setDocsOpen] = useState(true);
  const [sel, setSel] = useState(PATIENTS[1]);

  return (
      <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"'Nunito','Segoe UI',sans-serif", color:C.text, overflow:"hidden" }}>

        {/* ── Sidebar ── */}
        <nav style={{ width:210, background:C.white, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", padding:"16px 10px", overflowY:"auto", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"4px 8px 18px", fontWeight:900, fontSize:17 }}>
            <span style={{ fontSize:22 }}>❤️</span>
            <span>Cardiology</span>
            <span style={{ marginLeft:"auto", color:C.muted, cursor:"pointer", fontSize:18 }}>⇄</span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, background:C.bg, borderRadius:10, padding:"8px 12px", cursor:"pointer", marginBottom:6, fontSize:13 }}>
            <span style={{ color:C.muted }}>🔍</span>
            <span style={{ flex:1, color:C.muted }}>Search</span>
            <span style={{ fontSize:11, color:C.muted, background:"#e8eaf2", padding:"2px 6px", borderRadius:5 }}>⌘F</span>
          </div>

          <SLabel>GENERAL</SLabel>
          {NAV.map(n => <NavRow key={n.label} {...n} />)}

          <SLabel>DATABASES</SLabel>
          {DB.map(d => (
              <div key={d.label}>
                <NavRow icon={d.icon} label={d.label} badge={d.badge} expandable={d.expandable} expanded={docsOpen} onClick={d.expandable ? () => setDocsOpen(v => !v) : undefined} />
                {d.expandable && docsOpen && (
                    <div style={{ paddingLeft:34 }}>
                      {d.children.map(c => <div key={c} style={{ fontSize:12, color:C.muted, padding:"5px 8px", cursor:"pointer", borderRadius:8 }}>{c}</div>)}
                    </div>
                )}
              </div>
          ))}

          <div style={{ display:"flex", alignItems:"center", fontSize:13, fontWeight:600, padding:"8px 12px", cursor:"pointer", color:C.purple, marginTop:4 }}>
            <span style={{ fontSize:18, marginRight:6 }}>＋</span> New table
          </div>

          <SLabel>GROUPS</SLabel>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, padding:"7px 12px" }}><Dot color={C.purple} /> Operational staff</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, padding:"7px 12px" }}><Dot color={C.orange} /> Cardiac surgeons</div>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:"auto", paddingTop:14, borderTop:`1px solid ${C.border}` }}>
            <Av initials="JB" color={C.purple} size={36} />
            <div>
              <div style={{ fontWeight:700, fontSize:13 }}>Dr. Johanna Briston</div>
              <div style={{ color:C.muted, fontSize:11 }}>Admin</div>
            </div>
          </div>
        </nav>

        {/* ── Main ── */}
        <main style={{ flex:1, padding:"24px 20px", overflowY:"auto", display:"flex", flexDirection:"column", gap:16, minWidth:0 }}>

          {/* Greeting row */}
          <div style={{ display:"flex", alignItems:"center", gap:16, height: "150px", backgroundColor:"#fff", borderRadius:16 }}>
            <div style={{height:"100%", padding:"16px"}}>
              <div style={{ fontSize:23, fontWeight:900 }}>Mừng bạn quay lại, Tuấn Phi!</div>
              <div style={{ color:C.muted, fontSize:13, marginTop:2 }}>Chúc 1 ngày tốt lành!</div>
            </div>


          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:16 }}>
            <StatCard label="Offline patients" value={32} change="-6.43%" positive={false} color={C.red} pts="0,30 40,25 80,35 100,20 140,28 180,15 200,22" />
            <StatCard label="Online patients" value={210} change="+31.3%" positive={true} color={C.teal} pts="0,35 40,28 80,30 120,15 160,20 200,10" />
          </div>

          {/* Patient list + detail */}
          <div style={{ display:"flex", gap:16, flex:1, minHeight:0 }}>

            {/* List */}
            <div style={{ background:C.white, borderRadius:18, padding:20, flex:1, overflowY:"auto", boxShadow:"0 2px 14px #00000009" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontWeight:800, fontSize:16 }}>
                Patient's list{" "}
                <span style={{ background:C.purpleLight, color:C.purple, borderRadius:20, fontSize:11, padding:"2px 9px", fontWeight:700 }}>8</span>
              </span>
                <span style={{ color:C.muted, fontSize:12 }}>📅 14.10.2024</span>
              </div>
              {PATIENTS.map(p => (
                  <div key={p.id} onClick={() => setSel(p)}
                       style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 8px", borderRadius:12, cursor:"pointer", background: sel?.id === p.id ? C.bg : "transparent", marginBottom:4, transition:"background 0.15s" }}>
                    <div style={{ width:38, height:38, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, background:p.color+"18", color:p.color }}>{p.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.type}</div>
                      <div style={{ color:C.muted, fontSize:12 }}>{p.name}</div>
                    </div>
                    <span style={{ background: p.urgent ? C.red : C.bg, color: p.urgent ? "#fff" : C.text, borderRadius:8, fontSize:12, fontWeight:700, padding:"5px 12px", flexShrink:0 }}>{p.time}</span>
                  </div>
              ))}
            </div>

            {/* Detail */}
            <div style={{ background:C.white, borderRadius:18, padding:20, width:275, flexShrink:0, overflowY:"auto", boxShadow:"0 2px 14px #00000009", display:"flex", flexDirection:"column", gap:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <Av initials="BD" color={C.orange} size={46} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900, fontSize:16 }}>Brad Duncan</div>
                  <div style={{ color:C.purple, fontSize:12, marginTop:2 }}>Reservation ID <b>#RSD120764</b></div>
                </div>
                <div style={{ width:32, height:32, border:`1.5px solid ${C.border}`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted, fontSize:14 }}>↗</div>
              </div>

              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
                <div style={{ fontWeight:800, fontSize:13, marginBottom:8 }}>Complain</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {["Heart pain","High pressure","Dizziness"].map(t => (
                      <span key={t} style={{ background:C.bg, color:C.text, borderRadius:20, fontSize:12, padding:"5px 12px" }}>{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div style={{ fontWeight:800, fontSize:13 }}>Blood cells ⚠️</div>
                  <span style={{ color:C.muted, fontSize:11 }}>16.04.2024</span>
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:7, height:64 }}>
                  {[55,75,48,90,42,68,52].map((h, i) => (
                      <div key={i} style={{ width:20, height:h, borderRadius:6, background:`hsl(${i*8},72%,55%)`, flexShrink:0 }} />
                  ))}
                </div>
                <div style={{ color:C.muted, fontSize:11, marginTop:6 }}>1K ul · 4K–11K ul in normal</div>
              </div>

              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:12, display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:C.muted, fontSize:12 }}>Last checked <b style={{ color:C.text }}>05.12.2023</b></span>
                <span style={{ color:C.purple, fontSize:12 }}>Prescription #236-372-09</span>
              </div>

              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:12 }}>
                <div style={{ fontWeight:800, fontSize:13, marginBottom:6 }}>Chronic diseases</div>
                <div style={{ fontSize:13 }}>· Coronary Artery Disease (CAD) <span style={{ color:C.red, fontWeight:700 }}>#834-CAD</span></div>
              </div>

              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button style={{ flex:1, padding:"11px 0", border:`1.5px solid ${C.border}`, borderRadius:11, background:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Edit</button>
                <button style={{ flex:1, padding:"11px 0", border:"none", borderRadius:11, background:C.purple, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 14px ${C.purple}44` }}>Chat</button>
              </div>
            </div>
          </div>
        </main>

        {/* ── Right Panel ── */}
        <aside style={{ width:248, flexShrink:0, padding:"24px 14px", display:"flex", flexDirection:"column", gap:16, overflowY:"auto" }}>

          {/* Calendar */}
          <div style={{ background:C.white, borderRadius:18, padding:16, boxShadow:"0 2px 14px #00000009" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ cursor:"pointer", color:C.muted, fontSize:18, padding:"0 4px" }}>‹</span>
              <span style={{ fontWeight:900, fontSize:14 }}>November 2024</span>
              <span style={{ cursor:"pointer", color:C.muted, fontSize:18, padding:"0 4px" }}>›</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1, textAlign:"center" }}>
              {["S","M","T","W","T","F","S"].map((d,i) => (
                  <div key={i} style={{ fontSize:10, color:C.muted, fontWeight:800, paddingBottom:6 }}>{d}</div>
              ))}
              {CAL.flat().map((day, i) => {
                const marker = MARKERS[day];
                const outside = (i < 3 && day > 20) || (i > 30 && day < 10);
                const isToday = marker === "today";
                const mc = isToday ? null : marker;
                return (
                    <div key={i} style={{ fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", width:24, height:24, margin:"1px auto", borderRadius:"50%", cursor:"pointer", fontWeight: mc ? 700 : 400, background: isToday ? C.purple : "transparent", color: isToday ? "#fff" : outside ? "#ccc" : mc || C.text }}>
                      {day}
                    </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
              {[["Consultation",C.teal],["Surgery",C.red],["Administration",C.orange]].map(([l,color]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <Dot color={color} size={7} />
                    <span style={{ fontSize:10, color:C.muted }}>{l}</span>
                  </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div style={{ background:C.white, borderRadius:18, padding:16, flex:1, boxShadow:"0 2px 14px #00000009" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:28, fontWeight:900, lineHeight:1 }}>14</div>
                <div style={{ fontWeight:700, fontSize:13, marginTop:2 }}>Friday, Oct</div>
                <div style={{ color:C.muted, fontSize:11 }}>18 appointments</div>
              </div>
              <button style={{ width:34, height:34, borderRadius:"50%", background:C.purple, color:"#fff", border:"none", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 12px ${C.purple}44`, fontFamily:"inherit" }}>＋</button>
            </div>
            {SCHEDULE.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 6px", borderBottom:`1px solid ${C.border}`, background: item.highlight ? C.bg : "transparent", borderRadius: item.highlight ? 12 : 0 }}>
                  <div style={{ width:34, height:34, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, background:item.color+"22", color:item.color }}>{item.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.title}</div>
                    {item.sub && <div style={{ color:C.muted, fontSize:11 }}>{item.sub}</div>}
                    {item.time && <div style={{ color:C.muted, fontSize:11 }}>{item.time}</div>}
                  </div>
                  {item.isBreak && <span style={{ color:C.muted, fontSize:11, whiteSpace:"nowrap" }}>45 min</span>}
                </div>
            ))}
          </div>
        </aside>
      </div>
  );
}