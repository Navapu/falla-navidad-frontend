import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { CalendarDays, Check, ChevronRight, Clock3, Gift, Languages, LogOut, Moon, Shield, Sparkles, Sun, Trash2, Users, UtensilsCrossed } from "lucide-react";
import { api, getToken, setToken, type AuthResponse } from "./api";
import { t, type TranslationKey } from "./i18n";
import type { Choice, Language, PublicConfig, ResultItem, Theme, User } from "./types";

function usePreferences() {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem("falla_language") as Language) || "es");
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem("falla_theme") as Theme) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  const setLanguage = (value: Language) => { localStorage.setItem("falla_language", value); setLanguageState(value); };
  const setTheme = (value: Theme) => { localStorage.setItem("falla_theme", value); setThemeState(value); };
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.lang = language === "es" ? "es" : "ca-ES-valencia"; }, [theme, language]);
  return { language, setLanguage, theme, setTheme };
}

function dateLabel(date: string, language: Language) {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "ca-ES-valencia", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(new Date(`${date}T12:00:00+01:00`));
}

function useCountdown(deadline?: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const distance = Math.max(0, (deadline ? new Date(deadline).getTime() : now) - now);
  return { closed: distance <= 0, days: Math.floor(distance / 86400000), hours: Math.floor(distance / 3600000) % 24, minutes: Math.floor(distance / 60000) % 60, seconds: Math.floor(distance / 1000) % 60 };
}

function Brand() {
  return <NavLink to="/" className="brand"><img src="/escudo-falla.jpg" alt="Escudo de la Falla Maestro Bellver – Mariano Ribera"/><span><strong>Trifàsics</strong><small>Nadal 2026</small></span></NavLink>;
}

function Header({ user, language, setLanguage, theme, setTheme, logout }: { user: User | null; language: Language; setLanguage: (v: Language) => void; theme: Theme; setTheme: (v: Theme) => void; logout: () => void }) {
  const tr = (key: TranslationKey) => t(language, key);
  return <header className="site-header"><div className="header-inner"><Brand/><nav className="nav-links">
    {user && <NavLink to="/votar"><CalendarDays size={18}/><span>{tr("dashboard")}</span></NavLink>}
    {user && <NavLink to="/resultados"><Sparkles size={18}/><span>{tr("results")}</span></NavLink>}
    {user?.role === "admin" && <NavLink to="/admin"><Shield size={18}/><span>{tr("admin")}</span></NavLink>}
  </nav><div className="header-actions">
    <button className="icon-button language-button" onClick={() => setLanguage(language === "es" ? "va" : "es")} aria-label="Cambiar idioma"><Languages size={19}/><span>{language === "es" ? "VA" : "ES"}</span></button>
    <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Cambiar tema">{theme === "light" ? <Moon size={19}/> : <Sun size={19}/>}</button>
    {user && <button className="icon-button" onClick={logout} aria-label={tr("logout")}><LogOut size={19}/></button>}
  </div></div></header>;
}

function Layout({ children, user, language, setLanguage, theme, setTheme, logout }: any) {
  return <div className="app-shell"><Header {...{ user, language, setLanguage, theme, setTheme, logout }}/><main>{children}</main><footer>{t(language, "footer")}</footer></div>;
}

function AuthPage({ mode, language, onAuth }: { mode: "login" | "register"; language: Language; onAuth: (result: AuthResponse) => void }) {
  const tr = (key: TranslationKey) => t(language, key);
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", repeatPassword: "", secretSanta: false, consent: false, adminSetupKey: "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (mode === "register" && form.password !== form.repeatPassword) return setError(tr("passwordsMismatch"));
    setLoading(true);
    try {
      const result = await api<AuthResponse>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(mode === "login" ? { email: form.email, password: form.password } : form) });
      onAuth(result); navigate("/votar");
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  };
  return <div className="auth-layout"><section className="auth-story"><div className="eyebrow"><Sparkles size={16}/> Trifàsics · 2026</div><h1>{tr("heroTitle")}</h1><p>{tr("heroText")}</p><div className="story-art"><img src="/escudo-falla.jpg" alt="Escudo de la falla"/></div></section>
    <section className="auth-card"><div><h2>{mode === "login" ? tr("login") : tr("register")}</h2><p className="muted">{tr("tagline")}</p></div><form onSubmit={submit}>
      {mode === "register" && <div className="form-row"><label>{tr("firstName")}<input required value={form.firstName} onChange={e => setForm({...form, firstName:e.target.value})}/></label><label>{tr("lastName")}<input required value={form.lastName} onChange={e => setForm({...form, lastName:e.target.value})}/></label></div>}
      <label>{tr("email")}<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})}/></label>
      {mode === "register" && <aside className="notice"><Gift size={22}/><div><strong>{tr("emailNoticeTitle")}</strong><p>{tr("emailNotice")}</p></div></aside>}
      <label>{tr("password")}<input required minLength={mode === "register" ? 8 : 1} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={e => setForm({...form, password:e.target.value})}/></label>
      {mode === "register" && <><label>{tr("repeatPassword")}<input required minLength={8} type="password" autoComplete="new-password" value={form.repeatPassword} onChange={e => setForm({...form, repeatPassword:e.target.value})}/></label>
      <label className="check-label"><input type="checkbox" checked={form.secretSanta} onChange={e => setForm({...form, secretSanta:e.target.checked})}/><span>{tr("secretSanta")}</span></label>
      <p className="warning-copy">{tr("secretWarning")}</p><label className="check-label"><input required type="checkbox" checked={form.consent} onChange={e => setForm({...form, consent:e.target.checked})}/><span>{tr("registerConsent")}</span></label></>}
      {mode === "register" && form.email.toLowerCase().trim() === "drojannp@gmail.com" && <label>{language === "es" ? "Clave privada del administrador" : "Clau privada de l'administrador"}<input type="password" required value={form.adminSetupKey} onChange={e=>setForm({...form,adminSetupKey:e.target.value})}/></label>}
      {error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={loading}>{loading ? tr("loading") : mode === "login" ? tr("login") : tr("register")}<ChevronRight size={18}/></button>
    </form><p className="auth-switch">{mode === "login" ? tr("noAccount") : tr("haveAccount")} <NavLink to={mode === "login" ? "/registro" : "/login"}>{mode === "login" ? tr("register") : tr("login")}</NavLink></p></section></div>;
}

function Countdown({ deadline, language }: { deadline: string; language: Language }) {
  const value = useCountdown(deadline); const tr = (key: TranslationKey) => t(language, key);
  return <section className={`countdown ${value.closed ? "is-closed" : ""}`}><div className="countdown-title"><Clock3/ ><span>{value.closed ? tr("closed") : tr("votingCloses")}</span></div>{!value.closed && <div className="countdown-grid">{([[value.days,"days"],[value.hours,"hours"],[value.minutes,"minutes"],[value.seconds,"seconds"]] as const).map(([number,key])=><div key={key}><strong>{String(number).padStart(2,"0")}</strong><span>{tr(key)}</span></div>)}</div>}</section>;
}

function VotingPage({ user, setUser, config, refreshConfig, language }: { user: User; setUser: (u: User) => void; config: PublicConfig; refreshConfig: () => void; language: Language }) {
  const tr = (key: TranslationKey) => t(language, key); const countdown = useCountdown(config.deadline);
  const [choices, setChoices] = useState<Record<string, Choice>>(() => Object.fromEntries(config.enabledDates.map(d => [d,"none"])));
  const [loading, setLoading] = useState(true); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  useEffect(() => { api<{vote: {availability:{date:string;choice:Choice}[]} | null}>("/votes/mine").then(({vote}) => { if(vote) setChoices(Object.fromEntries(vote.availability.map(item=>[item.date,item.choice]))); }).catch(err=>setError(err.message)).finally(()=>setLoading(false)); }, []);
  const save = async () => { setError(""); setMessage(""); try { await api("/votes/mine", {method:"PUT", body:JSON.stringify({availability:config.enabledDates.map(date=>({date,choice:choices[date]??"none"}))})}); setMessage(tr("saved")); refreshConfig(); } catch(err){setError((err as Error).message);} };
  const updateSanta = async () => { try { const {user:updated}=await api<{user:User}>("/auth/me",{method:"PATCH",body:JSON.stringify({secretSanta:!user.secretSanta})}); setUser(updated); } catch(err){setError((err as Error).message);} };
  if (loading) return <Loading language={language}/>;
  return <><section className="hero"><div><div className="eyebrow"><UtensilsCrossed size={16}/> Falla Maestro Bellver – Mariano Ribera</div><h1>{tr("greeting")}, {user.firstName}.<br/><span>{tr("heroTitle")}</span></h1><p>{tr("heroText")}</p></div><Countdown deadline={config.deadline} language={language}/></section>
  <section className="dashboard-grid"><div className="panel vote-panel"><div className="panel-heading"><div><p className="kicker">18 — 30 · 12 · 2026</p><h2>{tr("availability")}</h2></div><div className="voter-count"><Users size={20}/><strong>{config.voterCount}</strong><span>{tr("peopleVoted")}</span></div></div>
    <div className="calendar-grid">{config.enabledDates.map((date,index)=><article className="day-card" key={date}><div className="day-number"><span>{String(index+1).padStart(2,"0")}</span><strong>{new Date(`${date}T12:00:00+01:00`).getDate()}</strong></div><div className="day-content"><h3>{dateLabel(date, language)}</h3><div className="choice-grid">{(["lunch","dinner","both","none"] as Choice[]).map(choice=><button key={choice} disabled={countdown.closed} className={choices[date]===choice?"selected":""} onClick={()=>setChoices({...choices,[date]:choice})}>{choices[date]===choice && <Check size={15}/>} {tr(choice)}</button>)}</div></div></article>)}</div>
    {error&&<p className="form-error">{error}</p>}{message&&<p className="success-message"><Check size={18}/>{message}</p>}<button className="primary-button save-vote" disabled={countdown.closed} onClick={save}>{tr("save")}<ChevronRight size={18}/></button></div>
    <aside className="side-stack"><div className="panel santa-card"><div className="gift-icon"><Gift/></div><p className="kicker">{tr("account")}</p><h2>{tr("secretSantaShort")}</h2><p>{tr("secretWarning")}</p><button className={`participation-toggle ${user.secretSanta?"active":""}`} onClick={updateSanta}><span className="toggle-dot"/><span>{user.secretSanta?tr("secretSanta"):tr("updateParticipation")}</span></button></div>
    <div className="panel locked-card"><Sparkles/><h3>{tr("results")}</h3><p>{config.resultsAvailable ? tr("leadingDates") : tr("resultsLocked")}</p><NavLink className="text-link" to="/resultados">{tr("results")} <ChevronRight size={16}/></NavLink></div></aside></section></>;
}

function ResultsPage({ config, language }: { config: PublicConfig; language: Language }) {
  const tr=(key:TranslationKey)=>t(language,key); const [data,setData]=useState<{results:ResultItem[];totalVoters:number;secretSantaCount:number}|null>(null); const [error,setError]=useState("");
  useEffect(()=>{api<any>("/results").then(setData).catch(err=>setError(err.message));},[config.resultsAvailable]);
  if(error) return <section className="center-state"><div className="locked-orb"><Clock3/></div><h1>{tr("resultsLocked")}</h1><Countdown deadline={config.deadline} language={language}/><p>{error}</p></section>;
  if(!data) return <Loading language={language}/>;
  const max=Math.max(1,...data.results.flatMap(item=>[item.lunch,item.dinner])); const sorted=[...data.results].sort((a,b)=>b.total-a.total); const best=sorted[0];
  return <><section className="results-hero"><p className="eyebrow"><Sparkles size={16}/>{tr("results")}</p><h1>{tr("leadingDates")}</h1>{best&&<p>{tr("bestOption")}: <strong>{dateLabel(best.date,language)}</strong></p>}<div className="stats-row"><div><Users/><strong>{data.totalVoters}</strong><span>{tr("totalVoters")}</span></div><div><Gift/><strong>{data.secretSantaCount}</strong><span>{tr("participants")}</span></div></div></section>
  <section className="panel results-panel">{sorted.map((item,index)=><article className="result-row" key={item.date}><div className="rank">{String(index+1).padStart(2,"0")}</div><div className="result-main"><h3>{dateLabel(item.date,language)}</h3><div className="bar-set"><div><span>{tr("lunch")} · {item.lunch}</span><i><b style={{width:`${item.lunch/max*100}%`}}/></i></div><div><span>{tr("dinner")} · {item.dinner}</span><i><b className="dinner-bar" style={{width:`${item.dinner/max*100}%`}}/></i></div></div></div></article>)}</section></>;
}

function AdminPage({ config, refreshConfig, language, currentUser }: { config: PublicConfig; refreshConfig:()=>void; language:Language; currentUser:User }) {
  const tr=(key:TranslationKey)=>t(language,key); const [users,setUsers]=useState<User[]>([]); const [deadline,setDeadline]=useState(""); const [dates,setDates]=useState<string[]>(config.enabledDates); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  const load=useCallback(()=>api<{users:User[]}>("/admin/users").then(r=>setUsers(r.users)).catch(e=>setError(e.message)),[]);
  useEffect(()=>{load(); api<{config:{deadline:string;enabledDates:string[]}}>("/admin/config").then(r=>{setDeadline(new Date(r.config.deadline).toLocaleString("sv-SE",{timeZone:"Europe/Madrid"}).slice(0,16));setDates(r.config.enabledDates);});},[load]);
  const saveConfig=async()=>{try{await api("/admin/config",{method:"PUT",body:JSON.stringify({deadline:new Date(`${deadline}:00+01:00`).toISOString(),enabledDates:dates})});setMessage(tr("saved"));refreshConfig();}catch(e){setError((e as Error).message);}};
  const remove=async(user:User)=>{if(!confirm(tr("confirmDelete")))return;try{await api(`/admin/users/${user.id}`,{method:"DELETE"});load();}catch(e){setError((e as Error).message);}};
  const allDates=Array.from({length:13},(_,i)=>`2026-12-${String(i+18).padStart(2,"0")}`);
  return <><section className="admin-hero"><p className="eyebrow"><Shield size={16}/>{tr("adminBadge")}</p><h1>{tr("adminTitle")}</h1><p>{currentUser.email}</p></section><section className="admin-grid"><div className="panel config-card"><h2>{tr("deadline")}</h2><label>{tr("deadline")}<input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)}/></label><h3>{tr("enabledDates")}</h3><div className="date-checks">{allDates.map(date=><label key={date}><input type="checkbox" checked={dates.includes(date)} onChange={e=>setDates(e.target.checked?[...dates,date].sort():dates.filter(d=>d!==date))}/><span>{new Date(`${date}T12:00:00+01:00`).getDate()}</span></label>)}</div>{error&&<p className="form-error">{error}</p>}{message&&<p className="success-message">{message}</p>}<button className="primary-button" onClick={saveConfig}>{tr("updateConfig")}</button></div>
  <div className="panel users-card"><div className="panel-heading"><h2>{tr("users")}</h2><span className="count-pill">{users.length}</span></div><div className="user-list">{users.map(user=><article key={user.id}><div className="avatar">{user.firstName[0]}{user.lastName[0]}</div><div><strong>{user.firstName} {user.lastName}</strong><span>{user.email}</span><small className={user.hasVoted?"status-ok":""}>{user.hasVoted?tr("voted"):tr("notVoted")} · {user.secretSanta?tr("secretSantaShort"):"—"}</small></div><div className="user-actions">{user.role==="admin"&&<span className="admin-pill">{tr("adminBadge")}</span>}{user.id!==currentUser.id&&<button onClick={()=>remove(user)} aria-label={tr("delete")}><Trash2 size={17}/></button>}</div></article>)}</div></div></section></>;
}

function Loading({language}:{language:Language}){return <div className="loading"><span/><p>{t(language,"loading")}</p></div>}

export default function App() {
  const prefs=usePreferences(); const [user,setUser]=useState<User|null>(null); const [config,setConfig]=useState<PublicConfig|null>(null); const [ready,setReady]=useState(false);
  const refreshConfig=useCallback(()=>api<PublicConfig>("/config").then(setConfig).catch(console.error),[]);
  useEffect(()=>{Promise.all([refreshConfig(),getToken()?api<{user:User}>("/auth/me").then(r=>setUser(r.user)).catch(()=>setToken(null)):Promise.resolve()]).finally(()=>setReady(true));},[refreshConfig]);
  useEffect(()=>{const id=window.setInterval(refreshConfig,15000);return ()=>clearInterval(id);},[refreshConfig]);
  const onAuth=(result:AuthResponse)=>{setToken(result.token);setUser(result.user);}; const logout=()=>{setToken(null);setUser(null);};
  const props={user,language:prefs.language,setLanguage:prefs.setLanguage,theme:prefs.theme,setTheme:prefs.setTheme,logout};
  if(!ready)return <Loading language={prefs.language}/>;
  if(!config)return <div className="center-state"><h1>{prefs.language==="es"?"No se puede conectar con la aplicación":"No es pot connectar amb l'aplicació"}</h1><p>{prefs.language==="es"?"Comprueba la conexión e inténtalo de nuevo.":"Comprova la connexió i torna a intentar-ho."}</p><button className="primary-button" onClick={refreshConfig}>{prefs.language==="es"?"Reintentar":"Tornar a intentar"}</button></div>;
  return <Layout {...props}><Routes>
    <Route path="/" element={<Navigate to={user?"/votar":"/login"} replace/>}/><Route path="/login" element={user?<Navigate to="/votar"/>:<AuthPage mode="login" language={prefs.language} onAuth={onAuth}/>}/><Route path="/registro" element={user?<Navigate to="/votar"/>:<AuthPage mode="register" language={prefs.language} onAuth={onAuth}/>}/>
    <Route path="/votar" element={user?<VotingPage user={user} setUser={setUser} config={config} refreshConfig={refreshConfig} language={prefs.language}/>:<Navigate to="/login"/>}/><Route path="/resultados" element={user?<ResultsPage config={config} language={prefs.language}/>:<Navigate to="/login"/>}/><Route path="/admin" element={user?.role==="admin"?<AdminPage config={config} refreshConfig={refreshConfig} language={prefs.language} currentUser={user}/>:<Navigate to="/votar"/>}/><Route path="*" element={<Navigate to="/"/>}/>
  </Routes></Layout>;
}
