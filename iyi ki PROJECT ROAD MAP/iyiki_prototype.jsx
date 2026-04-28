import { useState, useRef, useCallback } from "react";

const BRANDS = [
  { id: 1, name: "Starbucks", emoji: "\u2615", color: "#00704A", products: [
    { id: 101, name: "Caffe Latte", desc: "Espresso ve buharla isitilmis sut", img: "\u2615" },
    { id: 102, name: "Caramel Macchiato", desc: "Vanilya, sut, espresso, karamel sos", img: "\ud83c\udf6f" },
    { id: 103, name: "Turk Kahvesi", desc: "Geleneksel Turk kahvesi", img: "\ud83c\uddf9\ud83c\uddf7" },
  ]},
  { id: 2, name: "D&R", emoji: "\ud83d\udcda", color: "#E31E24", products: [
    { id: 201, name: "Seni Sectigim Gun", desc: "Canan Tan", img: "\ud83d\udcda" },
    { id: 202, name: "Kucuk Prens", desc: "Antoine de Saint-Exupery", img: "\ud83c\udf1f" },
    { id: 203, name: "Moleskine Defter", desc: "Klasik sert kapak, cizgili", img: "\ud83d\udcd3" },
  ]},
  { id: 3, name: "Migros", emoji: "\ud83d\uded2", color: "#FF6B00", products: [
    { id: 301, name: "Ramazan Kolisi", desc: "Temel gida urunleri paketi", img: "\ud83c\udf81" },
    { id: 302, name: "Kahvaltilik Set", desc: "Peynir, zeytin, recel seti", img: "\ud83e\uddc0" },
    { id: 303, name: "Atistirmalik Paket", desc: "Cikolata ve kuruyemis secmesi", img: "\ud83c\udf6a" },
  ]},
  { id: 4, name: "Tadelle", emoji: "\ud83c\udf6b", color: "#8B4513", products: [
    { id: 401, name: "Tadelle Sutlu", desc: "Findikli sutlu cikolata", img: "\ud83c\udf6b" },
    { id: 402, name: "Tadelle Bitter", desc: "%70 kakao bitter cikolata", img: "\ud83e\udeb6" },
    { id: 403, name: "Tadelle Beyaz", desc: "Findikli beyaz cikolata", img: "\ud83e\udd5b" },
  ]},
  { id: 5, name: "Kahve Dunyasi", emoji: "\u2615", color: "#5C3D2E", products: [
    { id: 501, name: "Turk Kahvesi Seti", desc: "Ozel kavrulmus Turk kahvesi", img: "\u2615" },
    { id: 502, name: "Sicak Cikolata", desc: "Belcika cikolatali", img: "\ud83c\udf75" },
    { id: 503, name: "Filtre Kahve", desc: "Gunun filtre kahvesi", img: "\ud83e\udec7" },
  ]},
];

const CONTACTS = [
  { id: 1, name: "Annecim", emoji: "\u2764\ufe0f" },
  { id: 2, name: "Elif", emoji: "\ud83d\udc9a" },
  { id: 3, name: "Ahmet", emoji: "\ud83d\udc99" },
  { id: 4, name: "Zeynep", emoji: "\ud83e\udde1" },
  { id: 5, name: "Emre", emoji: "\ud83d\udc9c" },
];

export default function IyiKiPrototype() {
  const [mode, setMode] = useState("sender"); // "sender" or "receiver"
  const [rcvStep, setRcvStep] = useState(0);
  const [view, setView] = useState("brands");
  const [brandIdx, setBrandIdx] = useState(0);
  const [productIdx, setProductIdx] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sent, setSent] = useState(null);
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [exitAnim, setExitAnim] = useState(null);
  const startPos = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  const handleStart = useCallback((x, y) => {
    startPos.current = { x, y };
    dragging.current = true;
    setIsDragging(true);
    setDragY(0);
    setDragX(0);
    setSwipeDirection(null);
  }, []);

  const handleMove = useCallback((x, y) => {
    if (!dragging.current) return;
    const dx = x - startPos.current.x;
    const dy = y - startPos.current.y;
    if (!swipeDirection) {
      if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
        setSwipeDirection(Math.abs(dx) > Math.abs(dy) ? "h" : "v");
      }
    }
    if (swipeDirection === "v" || (!swipeDirection && Math.abs(dy) > Math.abs(dx))) {
      setDragY(dy);
    } else {
      setDragX(dx);
    }
  }, [swipeDirection]);

  const handleEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    const threshold = 80;
    const thresholdX = 100;

    if (swipeDirection === "v" || Math.abs(dragY) > Math.abs(dragX)) {
      if (dragY < -threshold) {
        if (view === "brands") {
          setExitAnim("up");
          setTimeout(() => { setBrandIdx(i => (i + 1) % BRANDS.length); setExitAnim(null); }, 250);
        } else if (view === "products" && selectedBrand) {
          setExitAnim("up");
          setTimeout(() => { setProductIdx(i => (i + 1) % selectedBrand.products.length); setExitAnim(null); }, 250);
        }
      } else if (dragY > threshold) {
        if (view === "brands") {
          setExitAnim("down");
          setTimeout(() => { setBrandIdx(i => (i - 1 + BRANDS.length) % BRANDS.length); setExitAnim(null); }, 250);
        } else if (view === "products" && selectedBrand) {
          setExitAnim("down");
          setTimeout(() => { setProductIdx(i => (i - 1 + selectedBrand.products.length) % selectedBrand.products.length); setExitAnim(null); }, 250);
        }
      }
    } else {
      if (dragX > thresholdX && view === "products") {
        const prod = selectedBrand.products[productIdx];
        setSelectedProduct(prod);
        setShowContacts(true);
      } else if (dragX < -thresholdX && view === "products") {
        setExitAnim("left");
        setTimeout(() => { setView("brands"); setSelectedBrand(null); setProductIdx(0); setExitAnim(null); }, 250);
      }
    }
    setDragY(0);
    setDragX(0);
    setSwipeDirection(null);
  }, [dragY, dragX, view, brandIdx, selectedBrand, productIdx, swipeDirection]);

  const onTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();
  const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e) => { if (dragging.current) handleMove(e.clientX, e.clientY); };
  const onMouseUp = () => handleEnd();

  const handleBrandTap = () => {
    if (Math.abs(dragY) < 5 && Math.abs(dragX) < 5) {
      const brand = BRANDS[brandIdx];
      setSelectedBrand(brand);
      setProductIdx(0);
      setView("products");
    }
  };

  const sendGift = (contact) => {
    setSent({ product: selectedProduct, contact, brand: selectedBrand });
    setShowContacts(false);
    setTimeout(() => { setSent(null); setView("brands"); setSelectedBrand(null); setProductIdx(0); }, 3000);
  };

  const brand = BRANDS[brandIdx];
  const product = selectedBrand ? selectedBrand.products[productIdx] : null;

  const getCardTransform = () => {
    if (exitAnim === "up") return "translateY(-120%) scale(0.9)";
    if (exitAnim === "down") return "translateY(120%) scale(0.9)";
    if (exitAnim === "left") return "translateX(-120%) rotate(-8deg)";
    if (isDragging && swipeDirection === "h") return `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`;
    if (isDragging) return `translateY(${dragY * 0.5}px) scale(${1 - Math.abs(dragY) * 0.0005})`;
    return "translateY(0) scale(1)";
  };

  const getCardOpacity = () => {
    if (exitAnim) return 0;
    if (isDragging && swipeDirection === "h") return 1 - Math.abs(dragX) * 0.002;
    return 1;
  };

  const getRightIndicator = () => isDragging && dragX > 40 ? Math.min((dragX - 40) / 60, 1) : 0;
  const getLeftIndicator = () => isDragging && dragX < -40 ? Math.min((-dragX - 40) / 60, 1) : 0;

  const currentItems = view === "brands" ? BRANDS : (selectedBrand?.products || []);
  const currentIdx = view === "brands" ? brandIdx : productIdx;

  // ─── RECEIVER FLOW DATA ───
  const rcvGift = { product: "Caffè Latte", brand: "Starbucks", from: "Elif", note: "Aklıma geldin. İyi ki sen.", expire: "72 saat" };
  const rcvScreens = [
    { id: "notif", bg: "#1A1A2E" },
    { id: "reveal", bg: "#FFFAF5" },
    { id: "redeem", bg: "#FFFAF5" },
    { id: "done", bg: "#FFFAF5" },
    { id: "forward", bg: "#0D0D0F" },
  ];

  // ─── MODE TOGGLE (shown outside phone) ───
  const ModeToggle = () => (
    <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:12 }}>
      {[{id:"sender",label:"Gönderen"},{id:"receiver",label:"Alan Kişi"}].map(m=>(
        <button key={m.id} onClick={()=>{setMode(m.id);setRcvStep(0);setSent(null);setView("brands");setSelectedBrand(null);}} style={{
          padding:"8px 20px",borderRadius:14,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
          fontFamily:"'DM Sans',sans-serif",
          background:mode===m.id?"linear-gradient(135deg,#FF3300,#FF3300CC)":"rgba(255,255,255,0.06)",
          color:mode===m.id?"#fff":"#666",transition:"all 0.3s",
        }}>{m.label}</button>
      ))}
    </div>
  );

  // ─── RECEIVER FLOW ───
  if (mode === "receiver") {
    const rs = rcvScreens[rcvStep];
    const nextR = () => rcvStep < rcvScreens.length - 1 && setRcvStep(rcvStep + 1);
    return (
      <div>
        <style>{CSS}</style>
        <ModeToggle />
        <div style={S.phone}><div style={{...S.screen, background: rs.bg === "#FFFAF5" ? "linear-gradient(180deg,#FFFAF5,#FFF5EE)" : rs.bg === "#0D0D0F" ? "linear-gradient(180deg,#0D0D0F,#1A1A2E)" : "linear-gradient(180deg,#1A1A2E,#0D0D0F)"}}>

          {/* Status bar */}
          <div style={{padding:"48px 24px 0",textAlign:"center"}}>
            <div style={{fontFamily:PF,fontSize:18,fontStyle:"italic",color:rs.bg==="#FFFAF5"?"#FF3300":"#FF3300"}}>iyi ki</div>
          </div>

          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 28px",textAlign:"center"}}>

            {/* STEP 0: Notification */}
            {rcvStep === 0 && (<>
              <div style={{background:"rgba(255,255,255,0.95)",borderRadius:18,padding:"16px 18px",display:"flex",gap:12,alignItems:"center",width:"100%",boxShadow:"0 12px 40px rgba(0,0,0,0.3)",marginBottom:32,animation:"slideUp 0.5s ease"}}>
                <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:"linear-gradient(135deg,#FF3300,#E62E00)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:12,fontFamily:PF,color:"#fff",fontStyle:"italic"}}>ik</span>
                </div>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#0D0D0F",fontFamily:"sans-serif"}}>iyi ki</div>
                  <div style={{fontSize:13,color:"#374151"}}>Biri seni düşündü.</div>
                </div>
              </div>
              <div style={{fontSize:22,fontFamily:PF,fontStyle:"italic",color:"#fff",marginBottom:8}}>Biri seni düşündü.</div>
              <div style={{fontSize:14,color:"#9CA3AF",marginBottom:24}}>Sana bir kahve ısmarladı.</div>
              <button onClick={nextR} style={{...S.rcvBtn,background:"linear-gradient(135deg,#FF3300,#FF6D00)"}}>Göster bana</button>
            </>)}

            {/* STEP 1: Gift Reveal */}
            {rcvStep === 1 && (<>
              <div style={{background:"#fff",borderRadius:24,padding:"28px 22px",width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.08)",border:"1px solid rgba(0,0,0,0.06)",marginBottom:20,animation:"slideUp 0.5s ease"}}>
                <svg width="56" height="56" viewBox="0 0 48 48" fill="none" style={{marginBottom:14}}>
                  <path d="M14 18C14 16 16 14 18 14H30C32 14 34 16 34 18V30C34 34 30 38 24 38C18 38 14 34 14 30V18Z" stroke="#FF3300" strokeWidth="2" fill="rgba(255,51,0,0.06)" strokeLinecap="round"/>
                  <path d="M34 20C36 20 38 22 38 24C38 26 36 28 34 28" stroke="#FF3300" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 12C20 10 21 8 22 7" stroke="#FF3300" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                  <path d="M24 12C24 9 25 7 26 5" stroke="#FF3300" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
                </svg>
                <div style={{fontSize:22,fontFamily:PF,fontWeight:700,color:"#0D0D0F"}}>{rcvGift.product}</div>
                <div style={{fontSize:13,color:"#6B7280",marginTop:4}}>{rcvGift.brand}</div>
                <div style={{width:40,height:2,background:"#FF3300",margin:"16px auto",borderRadius:1,opacity:0.3}}/>
                <div style={{fontSize:14,color:"#374151"}}>{rcvGift.from}'den</div>
                <div style={{fontSize:16,fontFamily:PF,fontStyle:"italic",color:"#FF3300",marginTop:10}}>"{rcvGift.note}"</div>
                <div style={{fontSize:11,color:"#9CA3AF",marginTop:14}}>{rcvGift.expire} içinde alabilirsin</div>
              </div>
              <button onClick={nextR} style={{...S.rcvBtn,background:"linear-gradient(135deg,#FF3300,#FF6D00)"}}>Nasıl Alırım?</button>
            </>)}

            {/* STEP 2: Redeem */}
            {rcvStep === 2 && (<>
              <div style={{fontSize:20,fontFamily:PF,fontStyle:"italic",color:"#0D0D0F",marginBottom:20}}>Kahveni al.</div>
              {/* QR placeholder */}
              <div style={{width:160,height:160,borderRadius:16,background:"#fff",border:"2px solid #E5E7EB",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <rect x="10" y="10" width="30" height="30" rx="4" fill="#0D0D0F"/>
                  <rect x="15" y="15" width="20" height="20" rx="2" fill="#fff"/>
                  <rect x="20" y="20" width="10" height="10" fill="#0D0D0F"/>
                  <rect x="80" y="10" width="30" height="30" rx="4" fill="#0D0D0F"/>
                  <rect x="85" y="15" width="20" height="20" rx="2" fill="#fff"/>
                  <rect x="90" y="20" width="10" height="10" fill="#0D0D0F"/>
                  <rect x="10" y="80" width="30" height="30" rx="4" fill="#0D0D0F"/>
                  <rect x="15" y="85" width="20" height="20" rx="2" fill="#fff"/>
                  <rect x="20" y="90" width="10" height="10" fill="#0D0D0F"/>
                  <rect x="50" y="50" width="20" height="20" rx="2" fill="#FF3300" opacity="0.8"/>
                  <rect x="45" y="10" width="8" height="8" fill="#0D0D0F" opacity="0.6"/>
                  <rect x="57" y="10" width="8" height="8" fill="#0D0D0F" opacity="0.4"/>
                  <rect x="45" y="22" width="8" height="8" fill="#0D0D0F" opacity="0.3"/>
                  <rect x="80" y="50" width="8" height="8" fill="#0D0D0F" opacity="0.5"/>
                  <rect x="92" y="50" width="8" height="8" fill="#0D0D0F" opacity="0.3"/>
                  <rect x="80" y="62" width="8" height="8" fill="#0D0D0F" opacity="0.4"/>
                  <rect x="50" y="80" width="8" height="8" fill="#0D0D0F" opacity="0.5"/>
                  <rect x="62" y="80" width="8" height="8" fill="#0D0D0F" opacity="0.3"/>
                  <rect x="80" y="80" width="12" height="12" rx="2" fill="#0D0D0F" opacity="0.6"/>
                  <rect x="100" y="80" width="10" height="10" fill="#0D0D0F" opacity="0.4"/>
                  <rect x="80" y="96" width="8" height="8" fill="#0D0D0F" opacity="0.3"/>
                </svg>
              </div>
              <div style={{fontSize:14,color:"#374151",lineHeight:1.8,marginBottom:20}}>
                En yakın <span style={{fontWeight:600}}>{rcvGift.brand}</span>'a git.<br/>
                Kasada bu ekranı göster.<br/>
                Kahven hazır.
              </div>
              <button onClick={nextR} style={{...S.rcvBtn,background:"linear-gradient(135deg,#FF3300,#FF6D00)"}}>En Yakın Mağaza</button>
              <div style={{fontSize:11,color:"#9CA3AF",marginTop:8}}>{rcvGift.expire} içinde alabilirsin</div>
            </>)}

            {/* STEP 3: Done */}
            {rcvStep === 3 && (<>
              <svg width="64" height="64" viewBox="0 0 48 48" fill="none" style={{marginBottom:16}}>
                <circle cx="24" cy="24" r="20" stroke="#00BFA5" strokeWidth="2" fill="rgba(0,191,165,0.08)"/>
                <path d="M15 24L21 30L33 18" stroke="#00BFA5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{fontSize:22,fontFamily:PF,fontStyle:"italic",color:"#0D0D0F",marginBottom:8}}>Kahveni aldın.</div>
              <div style={{fontSize:16,fontFamily:PF,fontStyle:"italic",color:"#FF3300",marginBottom:28}}>İyi ki sen.</div>
              <button onClick={()=>{}} style={{...S.rcvBtn,background:"#fff",color:"#374151",border:"1px solid #E5E7EB",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:8}}>
                {rcvGift.from}'e Teşekkür Et
              </button>
              <button onClick={nextR} style={{...S.rcvBtn,background:"linear-gradient(135deg,#FF3300,#FF6D00)"}}>Ben de Birine Göndereyim</button>
            </>)}

            {/* STEP 4: Pay it forward */}
            {rcvStep === 4 && (<>
              <div style={{fontSize:40,fontFamily:PF,fontStyle:"italic",color:"#FF3300",opacity:0.15,marginBottom:16}}>iyi ki</div>
              <div style={{fontSize:22,fontFamily:PF,fontStyle:"italic",color:"#fff",lineHeight:1.5,marginBottom:12}}>Sen de birine{"\n"}bir jest yapabilirsin.</div>
              <div style={{fontSize:14,color:"#9CA3AF",marginBottom:28,lineHeight:1.7}}>Parasız. Hesapsız.{"\n"}Sadece düşünmek yeterli.</div>
              <button onClick={()=>{setMode("sender");setView("brands");}} style={{...S.rcvBtn,background:"linear-gradient(135deg,#FF3300,#FF6D00)"}}>İlk Jestimi Yapayım</button>
              <button onClick={()=>setRcvStep(0)} style={{...S.rcvBtn,background:"transparent",color:"#6B7280",boxShadow:"none",marginTop:4}}>Şimdi değil</button>
            </>)}

          </div>

          {/* Dots */}
          <div style={{display:"flex",gap:6,justifyContent:"center",padding:"0 0 40px"}}>
            {rcvScreens.map((_,i)=>(
              <div key={i} onClick={()=>setRcvStep(i)} style={{width:rcvStep===i?20:6,height:6,borderRadius:3,background:rcvStep===i?"#FF3300":"rgba(255,255,255,0.2)",cursor:"pointer",transition:"all 0.3s"}}/>
            ))}
          </div>

        </div></div>
      </div>
    );
  }

  // ─── SENT ───
  if (sent) {
    return (
      <div><style>{CSS}</style><ModeToggle />
      <div style={S.phone}><div style={S.screen}>
        <div style={S.sentScreen}>
          <div style={{ fontSize: 64, marginBottom: 20, animation: "pulse 1s infinite" }}>{sent.product.img}</div>
          <div style={{ fontSize: 22, fontFamily: "PF, Georgia, serif", color: "#2B2D42", fontWeight: 700, marginBottom: 8 }}>Gonderildi!</div>
          <div style={{ fontSize: 15, color: "#8D99AE", marginBottom: 24 }}>{sent.contact.name} icin {sent.brand.name}'tan</div>
          <div style={{ fontSize: 18, color: "#E07A5F", fontFamily: "PF, Georgia, serif", fontStyle: "italic" }}>{sent.product.name}</div>
          <div style={{ marginTop: 32, fontSize: 13, color: "#B0B8C4" }}>Iyi ki sen.</div>
        </div>
      </div></div></div>
    );
  }

  // ─── CONTACTS ───
  if (showContacts) {
    return (
      <div><style>{CSS}</style><ModeToggle />
      <div style={S.phone}><div style={S.screen}>
        <div style={S.contactsScreen}>
          <div style={S.contactsHeader}>
            <button onClick={() => setShowContacts(false)} style={S.backBtn}>{"\u2190"}</button>
            <span style={{ fontFamily: "PF, Georgia, serif", fontSize: 18, color: "#2B2D42", fontWeight: 700 }}>Kime gondereceksin?</span>
          </div>
          <div style={{ padding: "8px 20px", fontSize: 13, color: "#8D99AE", fontStyle: "italic" }}>
            {selectedBrand?.name} {"\u2022"} {selectedProduct?.name}
          </div>
          <div style={S.contactsList}>
            {CONTACTS.map((c, i) => (
              <button key={c.id} onClick={() => sendGift(c)} style={{ ...S.contactItem, animationDelay: `${i * 0.06}s` }}>
                <div style={S.contactEmoji}>{c.emoji}</div>
                <div style={S.contactName}>{c.name}</div>
                <div style={{ fontSize: 18, color: "#E07A5F", fontWeight: 700 }}>{"\u2192"}</div>
              </button>
            ))}
          </div>
        </div>
      </div></div></div>
    );
  }

  // ─── MAIN ───
  return (
    <div><style>{CSS}</style><ModeToggle />
    <div style={S.phone}><div style={S.screen}>

      <div style={S.header}>
        <div style={S.logoText}>IYI KI</div>
        <div style={S.logoSub}>{view === "brands" ? "Marka sec" : selectedBrand?.name}</div>
      </div>

      <div style={S.navHint}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
          {view === "brands"
            ? "\u2191\u2193 markalar arasi gez \u2022 dokun = urunler"
            : "\u2191\u2193 urunler \u2022 \u2192 hediye et \u2022 \u2190 geri"}
        </span>
      </div>

      <div
        style={S.cardArea}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      >
        <div style={{ ...S.bgCard, transform: "translateY(-16px) scale(0.90)", opacity: 0.25 }} />
        <div style={{ ...S.bgCard, transform: "translateY(-8px) scale(0.95)", opacity: 0.45 }} />

        {getRightIndicator() > 0 && (
          <div style={{ ...S.overlay, opacity: getRightIndicator(), background: "rgba(45,106,79,0.85)" }}>
            <span style={{ fontSize: 28 }}>{"\u2192"}</span>
            <span style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>Hediye Et</span>
          </div>
        )}
        {getLeftIndicator() > 0 && view === "products" && (
          <div style={{ ...S.overlay, opacity: getLeftIndicator(), background: "rgba(141,153,174,0.85)" }}>
            <span style={{ fontSize: 28 }}>{"\u2190"}</span>
            <span style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>Geri</span>
          </div>
        )}

        {/* Card + Right-side vertical dots */}
        <div style={S.cardRow}>
          <div
            style={{
              ...S.mainCard,
              transform: getCardTransform(),
              opacity: getCardOpacity(),
              transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.23,1,0.32,1)",
              cursor: view === "brands" ? "pointer" : "grab",
            }}
            onClick={view === "brands" ? handleBrandTap : undefined}
          >
            {view === "brands" ? (
              <div style={{ ...S.innerCard, background: `linear-gradient(135deg, ${brand.color}15, ${brand.color}08)` }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${brand.color}, ${brand.color}CC)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, marginBottom: 16, boxShadow: `0 8px 24px ${brand.color}40`,
                }}>{brand.emoji}</div>
                <div style={S.brandName}>{brand.name}</div>
                <div style={{ fontSize: 13, color: "#8D99AE" }}>{brand.products.length} hediye edilebilir urun</div>
                <div style={{
                  marginTop: 20, padding: "8px 20px", borderRadius: 20,
                  background: `${brand.color}15`, color: brand.color, fontSize: 12, fontWeight: 600,
                }}>Dokunarak kesfet {"\u2192"}</div>
              </div>
            ) : (
              <div style={S.innerCard}>
                <div style={{ fontSize: 56, marginBottom: 12, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>{product.img}</div>
                <div style={S.prodName}>{product.name}</div>
                <div style={{ fontSize: 13, color: "#8D99AE", textAlign: "center", lineHeight: 1.5 }}>{product.desc}</div>
                <div style={{
                  marginTop: 16, padding: "6px 14px", borderRadius: 12,
                  background: `${selectedBrand.color}12`, fontSize: 11, color: selectedBrand.color, fontWeight: 600,
                }}>{selectedBrand.name}</div>
              </div>
            )}
          </div>

          {/* VERTICAL DOTS — right side */}
          <div style={S.vDots}>
            {currentItems.map((_, i) => (
              <div key={i} style={{
                width: 6,
                height: i === currentIdx ? 22 : 6,
                borderRadius: 3,
                background: i === currentIdx ? "#E07A5F" : "rgba(255,255,255,0.2)",
                transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
              }} />
            ))}
          </div>
        </div>
      </div>

      <div style={S.bottomBar}>
        <div style={S.slogan}>Soylemene gerek yok. Dusunmen yeter.</div>
      </div>

    </div></div></div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  * { user-select:none; -webkit-user-select:none; }
`;

const PF = "'Playfair Display', Georgia, serif";
const S = {
  phone: { width:375, height:720, margin:"20px auto", borderRadius:40, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,.3),0 0 0 2px rgba(255,255,255,.1)", background:"#000" },
  screen: { width:"100%", height:"100%", background:"linear-gradient(180deg,#1A1A2E 0%,#16213E 50%,#1A1A2E 100%)", display:"flex", flexDirection:"column", overflow:"hidden" },
  header: { padding:"48px 24px 8px", textAlign:"center" },
  logoText: { fontFamily:PF, fontSize:28, fontWeight:700, color:"#FFF", letterSpacing:4 },
  logoSub: { fontSize:12, color:"#8D99AE", marginTop:4 },
  navHint: { textAlign:"center", padding:"4px 0 8px" },
  cardArea: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", padding:"0 20px" },
  bgCard: { position:"absolute", width:"calc(100% - 80px)", height:340, background:"rgba(255,255,255,.06)", borderRadius:24, border:"1px solid rgba(255,255,255,.05)" },
  cardRow: { display:"flex", alignItems:"center", gap:10, position:"relative", zIndex:2 },
  mainCard: { width:280, background:"#FFF", borderRadius:24, boxShadow:"0 16px 48px rgba(0,0,0,.25)", overflow:"hidden" },
  innerCard: { padding:"40px 24px", display:"flex", flexDirection:"column", alignItems:"center", minHeight:300, justifyContent:"center" },
  brandName: { fontFamily:PF, fontSize:24, fontWeight:700, color:"#2B2D42", marginBottom:6 },
  prodName: { fontFamily:PF, fontSize:22, fontWeight:700, color:"#2B2D42", marginBottom:6, textAlign:"center" },
  vDots: { display:"flex", flexDirection:"column", gap:6, alignItems:"center", width:10 },
  overlay: { position:"absolute", inset:0, zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", borderRadius:24, margin:"0 20px", fontFamily:PF },
  bottomBar: { padding:"12px 24px 40px", textAlign:"center" },
  slogan: { fontFamily:PF, fontSize:12, color:"#E07A5F", fontStyle:"italic", opacity:.7 },
  contactsScreen: { flex:1, display:"flex", flexDirection:"column", background:"linear-gradient(180deg,#F4F1DE 0%,#FFF 100%)" },
  contactsHeader: { padding:"52px 20px 16px", display:"flex", alignItems:"center", gap:12 },
  backBtn: { width:36, height:36, borderRadius:18, background:"rgba(43,45,66,.08)", border:"none", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#2B2D42" },
  contactsList: { flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 },
  contactItem: { display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:"#FFF", borderRadius:16, border:"1px solid rgba(0,0,0,.06)", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,.04)", animation:"slideUp .3s ease forwards", opacity:0 },
  contactEmoji: { width:44, height:44, borderRadius:22, background:"#F4F1DE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 },
  contactName: { flex:1, fontFamily:PF, fontSize:16, fontWeight:600, color:"#2B2D42", textAlign:"left" },
  sentScreen: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(180deg,#F4F1DE 0%,#FFF 100%)", padding:32 },
  rcvBtn: { padding:"14px 28px",borderRadius:14,border:"none",color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",width:"100%",boxShadow:"0 4px 16px rgba(255,51,0,0.3)",textAlign:"center" },
};
