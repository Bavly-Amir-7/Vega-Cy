import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Phone, MessageCircle, MapPin, Globe2, Sun, Moon, Plus, Trash2, Upload, Volume2, Car, Settings, LogIn, LogOut, Camera } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faWhatsapp, faTiktok } from '@fortawesome/free-brands-svg-icons';
import './styles.css';
import logo from './assets/vega-logo.jpg';
import ownerImg from './assets/eng-kirollos.png';

const resolveApiBase = () => {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) return import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';
  const normalized = raw.replace(/\/$/, '');
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};
const API = resolveApiBase();
const TOKEN_KEY = 'vegacy_admin_token';
const LANG_KEY = 'vegacy_lang';
const THEME_KEY = 'vegacy_theme';
const VEGA_PHONE = '01277316687';
const DEV_PHONE = '01286648310';
const ig = 'https://www.instagram.com/vegaa_cy/';
const fb = 'https://www.facebook.com/profile.php?id=61553487179755';
const tiktok = 'https://www.tiktok.com/@kirowrizk?_t=ZS-8vYqtIb4LKq&_r=1';
const devFb = 'https://www.facebook.com/bavly.amir.35/';
const map = 'https://maps.app.goo.gl/BFQ8aPR6WXhE3qZA9';
const wa = (p) => `https://wa.me/2${p.replace(/^0/, '')}`;
const tr = {
  en: {
    home: 'Home', work: 'Work', about: 'About', admin: 'Dashboard', hero: 'VEGA-CY Customs',
    sub: 'Professional car sound systems & interior customization in Haram City.',
    services: 'Services', sound: 'Sound Systems', interior: 'Interior Customization', install: 'Clean Installation',
    works: 'Latest Work', images: 'Images', videos: 'Videos', aboutTitle: 'About Us', aboutText: 'Vega-CY Customs is a professional car sound system and interior customization service based in Haram City. Managed by Eng. Kirolos Wagdy.',
    add: 'Add Work', title: 'Title', type: 'Type', url: 'Media URL', image: 'Image', video: 'Video', upload: 'Upload file',
    save: 'Save', delete: 'Delete', dev: 'Development by Bavly Amir', login: 'Admin Login', username: 'Username', password: 'Password',
    signIn: 'Sign in', logout: 'Logout', needLogin: 'Only admin can add or remove media.', loginFailed: 'Wrong password.',
    prev: 'Prev', next: 'Next', page: 'Page',
    socials: 'Social Links', owner: 'Project Owner', ownerName: 'Eng. Kirollos Wagdy'
  },
  ar: {
    home: 'الرئيسية', work: 'الأعمال', about: 'من نحن', admin: 'الداشبورد', hero: 'فيجا سي كاستمز',
    sub: 'ساوند سيستم وتعديل داخلي احترافي للعربيات في هرم سيتي.',
    services: 'الخدمات', sound: 'ساوند سيستم', interior: 'تعديل داخلي', install: 'تركيب نضيف',
    works: 'أحدث الأعمال', images: 'الصور', videos: 'الفيديوهات', aboutTitle: 'من نحن', aboutText: 'فيجا سي كاستمز متخصصين في ساوند سيستم العربيات والتعديل الداخلي، موجودين في هرم سيتي. م. كيرلس وجدي.',
    add: 'إضافة عمل', title: 'العنوان', type: 'النوع', url: 'لينك الميديا', image: 'صورة', video: 'فيديو', upload: 'رفع ملف',
    save: 'حفظ', delete: 'حذف', dev: 'Development by Bavly Amir', login: 'دخول الأدمن', username: 'اسم المستخدم', password: 'كلمة المرور',
    signIn: 'دخول', logout: 'تسجيل خروج', needLogin: 'الإضافة والحذف متاحين للأدمن فقط.', loginFailed: 'بيانات الدخول غير صحيحة.',
    prev: 'السابق', next: 'التالي', page: 'صفحة',
    socials: 'روابط التواصل', owner: 'صاحب المشروع', ownerName: 'م. كيرلس وجدي'
  }
};

function App() {
  const isAdminPage = window.location.pathname.toLowerCase().startsWith('/admin');
  const [lang, setLang] = useState(localStorage.getItem(LANG_KEY) || 'en');
  const [dark, setDark] = useState((localStorage.getItem(THEME_KEY) || 'dark') === 'dark');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'image', url: '' });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  const [imagePage, setImagePage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [error, setError] = useState('');
  const t = tr[lang];
  const isAdmin = Boolean(adminToken);
  const perPage = 6;

  const authHeaders = () => (isAdmin ? { Authorization: `Bearer ${adminToken}` } : {});
  const load = () => fetch(`${API}/works`).then((r) => r.json()).then(setItems).catch(() => setItems([]));
  const imageItems = items.filter((x) => x.type === 'image');
  const videoItems = items.filter((x) => x.type === 'video');
  const imagePages = Math.max(1, Math.ceil(imageItems.length / perPage));
  const videoPages = Math.max(1, Math.ceil(videoItems.length / perPage));
  const imageSlice = imageItems.slice((imagePage - 1) * perPage, imagePage * perPage);
  const videoSlice = videoItems.slice((videoPage - 1) * perPage, videoPage * perPage);

  useEffect(() => { load(); }, []);
  useEffect(() => { setImagePage(1); setVideoPage(1); }, [items.length]);
  useEffect(() => { localStorage.setItem(LANG_KEY, lang); }, [lang]);
  useEffect(() => { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); }, [dark]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });

      if (!response.ok) {
        setError(t.loginFailed);
        return;
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setAdminToken(data.token);
      setAdminUsername('');
      setAdminPassword('');
    } catch {
      setError(t.loginFailed);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdminToken('');
    setError('');
  };

  const add = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url) return;
    await fetch(`${API}/works`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(form)
    });
    setForm({ title: '', type: 'image', url: '' });
    load();
  };

  const del = async (id) => {
    await fetch(`${API}/works/${id}`, { method: 'DELETE', headers: authHeaders() });
    load();
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const response = await fetch(`${API}/uploads`, { method: 'POST', headers: authHeaders(), body: fd });
    if (!response.ok) return;
    const data = await response.json();
    setForm((prev) => ({ ...prev, url: data.url, type: file.type.startsWith('video') ? 'video' : 'image' }));
  };

  return (
    <main className={dark ? 'app dark' : 'app light'} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg" />
      <nav>
        <a className="brand" href="#home"><img src={logo} />VEGA-CY</a>
        {!isAdminPage ? (
          <div><a href="#home">{t.home}</a><a href="#work">{t.work}</a><a href="#about">{t.about}</a><a href="/admin">{t.admin}</a></div>
        ) : (
          <div><a href="/">{t.home}</a></div>
        )}
        <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}><Globe2 /> {lang === 'en' ? 'AR' : 'EN'}</button>
        <button onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</button>
      </nav>

      {!isAdminPage ? (
        <>
          <section id="home" className="hero">
            <div>
              <span className="badge">Haram City - Car Audio</span>
              <h1>{t.hero}</h1>
              <p>{t.sub}</p>
              <div className="btns">
                <a className="primary" href={wa(VEGA_PHONE)} target="_blank"><MessageCircle /> WhatsApp</a>
                <a className="secondary" href={`tel:${VEGA_PHONE}`}><Phone /> Call</a>
              </div>
            </div>
            <img className="heroLogo" src={logo} />
          </section>
          <section><h2>{t.services}</h2><div className="grid"><Card icon={<Volume2 />} title={t.sound} /><Card icon={<Car />} title={t.interior} /><Card icon={<Settings />} title={t.install} /></div></section>
          <section id="work">
            <h2>{t.works}</h2>

            <h3 className="mediaSectionTitle">{t.images}</h3>
            <div className="workGrid">
              {imageSlice.map((x) => <article className="work" key={x.id}><img src={x.url} /><h3>{x.title}</h3></article>)}
            </div>
            <Pagination
              current={imagePage}
              total={imagePages}
              onPrev={() => setImagePage((p) => Math.max(1, p - 1))}
              onNext={() => setImagePage((p) => Math.min(imagePages, p + 1))}
              t={t}
            />

            <h3 className="mediaSectionTitle">{t.videos}</h3>
            <div className="workGrid">
              {videoSlice.map((x) => <article className="work" key={x.id}><video src={x.url} controls /><h3>{x.title}</h3></article>)}
            </div>
            <Pagination
              current={videoPage}
              total={videoPages}
              onPrev={() => setVideoPage((p) => Math.max(1, p - 1))}
              onNext={() => setVideoPage((p) => Math.min(videoPages, p + 1))}
              t={t}
            />
          </section>
          <section id="about">
            <h2>{t.aboutTitle}</h2>
            <p className="wide">{t.aboutText}</p>
            <div className="ownerShowcase">
              <img src={ownerImg} alt={t.ownerName} />
              <strong>{t.owner}</strong>
              <p>{t.ownerName}</p>
            </div>
            <h3 className="socialTitle">{t.socials}</h3>
            <div className="socialPanel">
              <div className="socialGrid socialDock">
                <a className="socialOrb instagram" href={ig} target="_blank" aria-label="Instagram" title="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
                <a className="socialOrb facebook" href={fb} target="_blank" aria-label="Facebook" title="Facebook"><FontAwesomeIcon icon={faFacebook} /></a>
                <a className="socialOrb tiktok" href={tiktok} target="_blank" aria-label="TikTok" title="TikTok"><FontAwesomeIcon icon={faTiktok} /></a>
                <a className="socialOrb map" href={map} target="_blank" aria-label="Google Maps" title="Google Maps"><MapPin /></a>
                <a className="socialOrb phone" href={`tel:${VEGA_PHONE}`} aria-label="Phone" title={VEGA_PHONE}><Phone /></a>
                <a className="socialOrb whatsapp" href={wa(VEGA_PHONE)} target="_blank" aria-label="WhatsApp" title="WhatsApp"><FontAwesomeIcon icon={faWhatsapp} /></a>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section id="admin" className="admin">
        {!isAdmin ? (
          <>
            <h2>{t.login}</h2>
            <p className="wide">{t.needLogin}</p>
            <form className="loginForm" onSubmit={login}>
              <input type="text" placeholder={t.username} value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} />
              <input type="password" placeholder={t.password} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
              <button className="primary"><LogIn /> {t.signIn}</button>
            </form>
            {error ? <p className="error">{error}</p> : null}
          </>
        ) : (
          <>
            <div className="adminHeader">
              <h2>{t.add}</h2>
              <button className="secondary" onClick={logout}><LogOut /> {t.logout}</button>
            </div>
            <form onSubmit={add}>
              <input placeholder={t.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="image">{t.image}</option><option value="video">{t.video}</option></select>
              <input placeholder={t.url} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              <label className="upload"><Upload /> {t.upload}<input type="file" hidden accept="image/*,video/*" onChange={upload} /></label>
              <button className="primary"><Plus /> {t.save}</button>
            </form>
            <div className="list">{items.map((x) => <div key={x.id}><span>{x.title}</span><button onClick={() => del(x.id)}><Trash2 /> {t.delete}</button></div>)}</div>
          </>
        )}
        </section>
      )}

      <footer>
        <div className="footerInner">
          <a href={devFb} target="_blank">{t.dev}</a>
          <a className="footerWa" href={wa(DEV_PHONE)} target="_blank" aria-label="Bavly WhatsApp" title="Bavly WhatsApp">
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>
        </div>
      </footer>
    </main>
  );
}

function Card({ icon, title }) {
  return <div className="card">{icon}<h3>{title}</h3></div>;
}

function Pagination({ current, total, onPrev, onNext, t }) {
  if (total <= 1) return null;
  return (
    <div className="pager">
      <button className="secondary" onClick={onPrev} disabled={current === 1}>{t.prev}</button>
      <span>{t.page} {current} / {total}</span>
      <button className="secondary" onClick={onNext} disabled={current === total}>{t.next}</button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
