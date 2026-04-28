import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from "recharts";

const M = ["Ay 1","Ay 2","Ay 3","Ay 4","Ay 5","Ay 6","Ay 7","Ay 8","Ay 9","Ay 10","Ay 11","Ay 12"];
const fmt = v => v>=1e9?(v/1e9).toFixed(1)+"B":v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(0)+"K":Math.round(v).toLocaleString("tr-TR");
const sum = a => a.reduce((x,y)=>x+y,0);
const CL = {accent:"#FF3300",green:"#00896B",warm:"#D4850A",blue:"#2563EB",purple:"#7C3AED",muted:"#78716C",dark:"#1A1A1F",bg:"#FFFAF5",card:"#FFFFFF",border:"#E7E0D8",alt:"#FAF5EF"};

// ═══ BAZ VERİ (Excel: Aylık Projeksiyon Baz) ═══
const BAZ = {
  mau:[3000,7084,13135,22534,37484,61535,100426,163469,265774,431872,701605,1139678],
  dau:[600,1417,2627,4507,7497,12307,20085,32694,53155,86374,140321,227936],
  jestSent:[6300,14880,27570,47310,78720,129210,210900,343290,558120,906930,1473360,2393340],
  jestRedeemed:[4095,9672,17921,30752,51168,83987,137085,223139,362778,589505,957684,1555671],
  sponsorPayment:[479115,1131624,2096757,3597984,5986656,9826479,16038945,26107263,42445026,68972085,112049028,182013507],
  sponsorComm:[33538,79214,146773,233869,389133,589589,962337,1435899,2122251,3448604,5042206,7280540],
  partnerList:[75000,75000,100000,100000,125000,150000,150000,175000,200000,225000,250000,300000],
  partnerComm:[53358,126026,242471,470044,807687,1515125,2473013,4528606,7756194,12603617,22634861,38456187],
  partnerExtra:[18000,18000,24000,24000,30000,36000,36000,42000,48000,54000,60000,72000],
  sponsorOpt:[24000,24000,36000,36000,48000,60000,60000,72000,84000,96000,108000,120000],
  premium:[2610,6163,11427,19605,32611,53535,87371,142218,231223,375729,610396,991520],
  kurumsal:[0,0,2500,5000,7500,12500,15000,20000,25000,30000,32500,37500],
  bireysel:[0,0,15585,15585,31170,46755,46755,62340,77925,93510,109095,124680],
  total:[206506,328403,578756,904103,1471101,2463504,3830476,6478063,10544593,16926460,28847058,47382427],
  expenses:[2066500,1936500,2202500,2444500,2603500,2705500,2723500,2937000,2978000,2932000,2915000,3008000],
};
const RATES = {
  sponsor:[.07,.07,.07,.065,.065,.06,.06,.055,.05,.05,.045,.04],
  jestUnit:[2.5,2.5,3,3,3.5,4,4,4.5,5,5,5.5,6],
  tutarPct:[.09,.09,.09,.105,.105,.12,.12,.135,.14,.14,.155,.16]
};
const VAL = {muh:63802374,baz:1017062327,iyi:23337182175,h_muh:6380237,h_baz:101706233,h_iyi:2333718218,u_muh:167901,u_baz:2676480,u_iyi:61413637};
const EXP_BR = [{name:"Personel",value:25639500,color:CL.accent},{name:"Teknoloji",value:1654000,color:CL.green},{name:"Pazarlama",value:2005000,color:CL.warm},{name:"Genel Yonetim",value:2154000,color:CL.muted}];

// 3 senaryo sonuclari (Excel'den)
const SC_DATA = {
  muhafazakar:{total:[151363,191957,306537,386440,547240,769380,958910,1336725,1797805,2384563,3320462,4529907],mau:[2500,5466,9167,13957,20310,28866,40500,56410,78243,108263,149589,206522]},
  baz:{total:BAZ.total,mau:BAZ.mau},
  iyimser:{total:[310190,627457,1306943,2617212,5269418,11118265,22014217,46764885,95216208,190645411,404933126,825643191],mau:[3500,9256,19994,41023,82879,166638,334536,671274,1346763,2701847,5420302,10873866]},
};

const SCENARIOS = {
  muhafazakar:{label:"Muhafazakar",color:CL.muted},
  baz:{label:"Baz",color:CL.green},
  iyimser:{label:"Iyimser",color:CL.accent},
};

function buildData(key) {
  const sd = SC_DATA[key];
  const ratio = key==="baz"?1:(sum(sd.total)/sum(BAZ.total));
  return M.map((m,i) => {
    const mau = sd.mau[i];
    const gelir = sd.total[i];
    const gider = Math.round(BAZ.expenses[i]*(key==="muhafazakar"?1.1:key==="iyimser"?0.92:1));
    const red = Math.round(BAZ.jestRedeemed[i]*ratio);
    const jRev = Math.round(red*RATES.jestUnit[i]);
    const tRev = Math.round(red*117*RATES.tutarPct[i]);
    return {
      name:m, mau, dau:Math.round(mau*(key==="muhafazakar"?.15:key==="iyimser"?.25:.2)),
      jestSent:Math.round(BAZ.jestSent[i]*ratio), jestRedeemed:red,
      sponsorPayment:Math.round(BAZ.sponsorPayment[i]*ratio),
      gelir, gider, ebitda:gelir-gider,
      sponsorComm:Math.round(BAZ.sponsorComm[i]*ratio),
      partnerComm:Math.round(BAZ.partnerComm[i]*ratio),
      partnerList:BAZ.partnerList[i], partnerExtra:BAZ.partnerExtra[i],
      sponsorOpt:BAZ.sponsorOpt[i], premium:Math.round(BAZ.premium[i]*ratio),
      jestRev:jRev, tutarRev:tRev,
      perUnitJest:RATES.jestUnit[i],
      perUnitTutar:Math.round(117*RATES.tutarPct[i]*10)/10,
      perUnitTotal:Math.round((RATES.jestUnit[i]+117*RATES.tutarPct[i])*10)/10,
      sponsorRate:RATES.sponsor[i], partnerTutarPct:RATES.tutarPct[i],
    };
  });
}

// ═══ UI ═══
const Card = ({children,className=""}) => <div className={"rounded-xl border p-5 shadow-sm "+className} style={{background:CL.card,borderColor:CL.border}}>{children}</div>;
const Stat = ({label,value,sub,color=CL.dark}) => (
  <div className="text-center">
    <div className="text-xs mb-1 tracking-wide uppercase" style={{color:CL.muted}}>{label}</div>
    <div className="text-2xl font-bold tracking-tight" style={{color}}>{value}</div>
    {sub && <div className="text-xs mt-1" style={{color:CL.muted}}>{sub}</div>}
  </div>
);
const Tip = ({active,payload,label}) => {
  if(!active||!payload) return null;
  return <div className="p-3 shadow-xl rounded-lg" style={{background:CL.dark}}>
    <div className="text-sm font-semibold mb-2 text-white">{label}</div>
    {payload.map((p,i) => <div key={i} className="flex items-center gap-2 text-xs mb-1">
      <div className="w-2 h-2 rounded-full" style={{background:p.color}}/>
      <span style={{color:"#aaa"}}>{p.name}:</span>
      <span className="text-white font-medium">{typeof p.value==="number"?(p.value<1?(p.value*100).toFixed(1)+"%":fmt(p.value)+" TL"):p.value}</span>
    </div>)}
  </div>;
};
const GR="#E7E0D8";
const Ti=({children})=><div className="font-semibold mb-4 text-sm" style={{color:CL.dark}}>{children}</div>;

// ═══ BOARD ═══
const BoardView = ({D,scenario}) => {
  const tG=sum(D.map(d=>d.gelir)),tE=sum(D.map(d=>d.ebitda));
  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card><Stat label="Yil 1 Gelir" value={fmt(tG)+" TL"} color={CL.green}/></Card>
      <Card><Stat label="EBITDA" value={fmt(tE)+" TL"} sub={"Marj %"+(tE/tG*100).toFixed(1)} color={tE>0?CL.green:CL.accent}/></Card>
      <Card><Stat label="Yil Sonu MAU" value={fmt(D[11].mau)} color={CL.blue}/></Card>
      <Card><Stat label="Toplam Jest" value={fmt(sum(D.map(d=>d.jestSent)))} sub={"Redeem: "+fmt(sum(D.map(d=>d.jestRedeemed)))} color={CL.warm}/></Card>
      <Card><Stat label="Degerleme" value={fmt({"muhafazakar":VAL.muh,"baz":VAL.baz,"iyimser":VAL.iyi}[scenario])+" TL"} sub={"$"+fmt({"muhafazakar":VAL.u_muh,"baz":VAL.u_baz,"iyimser":VAL.u_iyi}[scenario])+" (%10)"} color={CL.accent}/></Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><Ti>Gelir vs Gider vs EBITDA</Ti><ResponsiveContainer width="100%" height={260}><ComposedChart data={D}><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}}/><YAxis tick={{fill:CL.muted,fontSize:10}} tickFormatter={fmt}/><Tooltip content={<Tip/>}/><Area type="monotone" dataKey="gelir" name="Gelir" fill={CL.green+"30"} stroke={CL.green} strokeWidth={2}/><Line type="monotone" dataKey="gider" name="Gider" stroke={CL.accent} strokeWidth={2} dot={false}/><Bar dataKey="ebitda" name="EBITDA" fill={CL.warm+"90"} radius={[2,2,0,0]}/></ComposedChart></ResponsiveContainer></Card>
      <Card><Ti>Gelir Kaynak Dagilimi</Ti><ResponsiveContainer width="100%" height={260}><AreaChart data={D}><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}}/><YAxis tick={{fill:CL.muted,fontSize:10}} tickFormatter={fmt}/><Tooltip content={<Tip/>}/><Area type="monotone" dataKey="sponsorComm" name="Sponsor Komisyon" stackId="1" fill={CL.accent} stroke={CL.accent} fillOpacity={.7}/><Area type="monotone" dataKey="partnerComm" name="Partner Komisyon" stackId="1" fill={CL.green} stroke={CL.green} fillOpacity={.7}/><Area type="monotone" dataKey="partnerList" name="Partner Listeleme" stackId="1" fill={CL.blue} stroke={CL.blue} fillOpacity={.5}/><Area type="monotone" dataKey="premium" name="Diger" stackId="1" fill={CL.warm} stroke={CL.warm} fillOpacity={.5}/></AreaChart></ResponsiveContainer></Card>
      <Card><Ti>Kullanici Buyumesi (3 Senaryo)</Ti><ResponsiveContainer width="100%" height={260}><LineChart><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}} allowDuplicatedCategory={false}/><YAxis tick={{fill:CL.muted,fontSize:10}} tickFormatter={fmt}/><Tooltip content={<Tip/>}/>
        <Line data={M.map((m,i)=>({name:m,MAU:SC_DATA.muhafazakar.mau[i]}))} type="monotone" dataKey="MAU" name="Muhafazakar" stroke={CL.muted} strokeWidth={1.5} dot={false} strokeDasharray="6 3"/>
        <Line data={M.map((m,i)=>({name:m,MAU:SC_DATA.baz.mau[i]}))} type="monotone" dataKey="MAU" name="Baz" stroke={CL.green} strokeWidth={2.5} dot={false}/>
        <Line data={M.map((m,i)=>({name:m,MAU:SC_DATA.iyimser.mau[i]}))} type="monotone" dataKey="MAU" name="Iyimser" stroke={CL.accent} strokeWidth={1.5} dot={false} strokeDasharray="6 3"/>
      </LineChart></ResponsiveContainer></Card>
      <Card><Ti>Gider Dagilimi (Yillik)</Ti><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={EXP_BR} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({name,percent})=>name+" "+(percent*100).toFixed(0)+"%"} labelLine={false}>{EXP_BR.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)+" TL"}/></PieChart></ResponsiveContainer></Card>
    </div>
    <Card><Ti>Degerleme - 4 Yontem Triangulasyonu</Ti><div className="grid grid-cols-3 gap-6">
      {[{l:"Muhafazakar",v:VAL.muh,u:VAL.u_muh,c:CL.muted,k:"muhafazakar"},{l:"Baz",v:VAL.baz,u:VAL.u_baz,c:CL.green,k:"baz"},{l:"Iyimser",v:VAL.iyi,u:VAL.u_iyi,c:CL.accent,k:"iyimser"}].map(s=>
        <div key={s.l} className="text-center p-4 rounded-lg transition-all" style={{background:scenario===s.k?"#fff":CL.alt,border:"2px solid "+(scenario===s.k?s.c:CL.border),transform:scenario===s.k?"scale(1.03)":"scale(1)"}}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{color:s.c}}>{s.l}</div>
          <div className="text-xl font-bold" style={{color:CL.dark}}>{fmt(s.v)} TL</div>
          <div className="text-xs mt-2" style={{color:CL.muted}}>%10 hisse</div>
          <div className="text-sm font-semibold mt-1" style={{color:s.c}}>${fmt(s.u)}</div>
        </div>
      )}
    </div></Card>
  </div>;
};

// ═══ SPONSOR ═══
const SponsorView = ({D}) => <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card><Stat label="Sponsor Odemesi" value={fmt(sum(D.map(d=>d.sponsorPayment)))+" TL"} sub="Ureticilere" color={CL.accent}/></Card>
    <Card><Stat label="Jest Fonlanan" value={fmt(sum(D.map(d=>d.jestRedeemed)))} sub="Redeem edilen" color={CL.warm}/></Card>
    <Card><Stat label="Efektif Komisyon" value="%4-7" sub="Kademeli azalan" color={CL.green}/></Card>
    <Card><Stat label="Jest Basina" value={Math.round((sum(D.map(d=>d.sponsorPayment))+sum(D.map(d=>d.sponsorComm)))/sum(D.map(d=>d.jestRedeemed)))+" TL"} sub="Sponsor toplam / jest" color={CL.blue}/></Card>
  </div>
  <Card><Ti>Kademeli Sponsor Komisyon Yapisi</Ti><table className="w-full text-sm"><thead><tr style={{borderBottom:"2px solid "+CL.accent}}>{["Kademe","Aylik Toplam","Komisyon","Jest","Mantik"].map(h=><th key={h} className="text-left py-2 px-3 font-semibold" style={{color:CL.dark}}>{h}</th>)}</tr></thead><tbody>
    {[["Baslangic","0-250K TL","%7","~2K","Giris"],["Buyume","250K-1M TL","%6","~5K","Indirim"],["Olcek","1M-3M TL","%5","~15K","Ciddi"],["Stratejik","3M+ TL","%4","~30K+","En dusuk"]].map(([k,t,o,j,m],i)=>
      <tr key={i} style={{borderBottom:"1px solid "+CL.border,background:i%2===0?CL.alt:"transparent"}}><td className="py-2 px-3 font-medium" style={{color:CL.dark}}>{k}</td><td className="py-2 px-3" style={{color:CL.warm}}>{t}</td><td className="py-2 px-3 font-bold" style={{color:CL.accent}}>{o}</td><td className="py-2 px-3" style={{color:CL.muted}}>{j}</td><td className="py-2 px-3" style={{color:CL.muted}}>{m}</td></tr>
    )}
  </tbody></table></Card>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card><Ti>Efektif Komisyon Orani</Ti><ResponsiveContainer width="100%" height={240}><BarChart data={D}><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}}/><YAxis tick={{fill:CL.muted,fontSize:10}} tickFormatter={v=>(v*100).toFixed(0)+"%"} domain={[0,.08]}/><Tooltip content={<Tip/>}/><Bar dataKey="sponsorRate" name="Efektif Oran" fill={CL.accent} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></Card>
    <Card><Ti>Sponsor Odeme vs Komisyon</Ti><ResponsiveContainer width="100%" height={240}><AreaChart data={D}><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}}/><YAxis tick={{fill:CL.muted,fontSize:10}} tickFormatter={fmt}/><Tooltip content={<Tip/>}/><Area type="monotone" dataKey="sponsorPayment" name="Ureticiye" fill={CL.muted+"40"} stroke={CL.muted}/><Area type="monotone" dataKey="sponsorComm" name="Platform" fill={CL.accent+"60"} stroke={CL.accent}/></AreaChart></ResponsiveContainer></Card>
  </div>
</div>;

// ═══ PARTNER ═══
const PartnerView = ({D}) => {
  const pT=sum(D.map(d=>d.partnerComm+d.partnerList+d.partnerExtra));
  const cpc=((D[11].partnerComm+D[11].partnerList+D[11].partnerExtra)/(D[11].jestRedeemed||1)).toFixed(1);
  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card><Stat label="Partner Gelir" value={fmt(pT)+" TL"} sub="Platformun partner'dan aldigi" color={CL.green}/></Card>
      <Card><Stat label="Musteri Gonderilen" value={fmt(sum(D.map(d=>d.jestRedeemed)))} sub="Magazaya giren kisi" color={CL.blue}/></Card>
      <Card><Stat label="Musteri Basina" value={cpc+" TL"} sub="Ay 12 birim maliyet" color={CL.warm}/></Card>
      <Card><Stat label="Sektor CAC" value="50-100 TL" sub="Reklam ortalamasi" color={CL.muted}/></Card>
    </div>
    <Card><Ti>Partner Gelir Yapisi</Ti><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div><div className="text-xs font-bold uppercase mb-2" style={{color:CL.green}}>Jest Adedi (artan)</div><table className="w-full text-sm"><thead><tr style={{borderBottom:"1px solid "+CL.border}}>{["Kademe","Jest","TL/Jest"].map(h=><th key={h} className="text-left py-1 px-2 text-xs font-semibold" style={{color:CL.dark}}>{h}</th>)}</tr></thead><tbody>{[["Baslangic","0-2K","2.5"],["Buyume","2K-5K","3.5"],["Olcek","5K-15K","5.0"],["Stratejik","15K+","6.0"]].map(([k,j,u],i)=><tr key={i} style={{borderBottom:"1px solid "+CL.border}}><td className="py-1 px-2" style={{color:CL.dark}}>{k}</td><td className="py-1 px-2" style={{color:CL.muted}}>{j}</td><td className="py-1 px-2 font-bold" style={{color:CL.green}}>{u} TL</td></tr>)}</tbody></table></div>
      <div><div className="text-xs font-bold uppercase mb-2" style={{color:CL.blue}}>Tutar Komisyonu (artan)</div><table className="w-full text-sm"><thead><tr style={{borderBottom:"1px solid "+CL.border}}>{["Kademe","Tutar","Oran"].map(h=><th key={h} className="text-left py-1 px-2 text-xs font-semibold" style={{color:CL.dark}}>{h}</th>)}</tr></thead><tbody>{[["Baslangic","0-250K","%9"],["Buyume","250K-1M","%12"],["Olcek","1M-3M","%14"],["Stratejik","3M+","%16"]].map(([k,t,o],i)=><tr key={i} style={{borderBottom:"1px solid "+CL.border}}><td className="py-1 px-2" style={{color:CL.dark}}>{k}</td><td className="py-1 px-2" style={{color:CL.muted}}>{t}</td><td className="py-1 px-2 font-bold" style={{color:CL.blue}}>{o}</td></tr>)}</tbody></table></div>
    </div></Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><Ti>Komisyon Ayristirmasi</Ti><ResponsiveContainer width="100%" height={240}><AreaChart data={D}><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}}/><YAxis tick={{fill:CL.muted,fontSize:10}} tickFormatter={fmt}/><Tooltip content={<Tip/>}/><Area type="monotone" dataKey="tutarRev" name="Tutar (%9-16)" stackId="1" fill={CL.green+"70"} stroke={CL.green} strokeWidth={2}/><Area type="monotone" dataKey="jestRev" name="Jest (2.5-6 TL)" stackId="1" fill={CL.warm+"70"} stroke={CL.warm} strokeWidth={2}/><Area type="monotone" dataKey="partnerList" name="Listeleme" stackId="1" fill={CL.blue+"40"} stroke={CL.blue}/></AreaChart></ResponsiveContainer></Card>
      <Card><Ti>Birim Gelir Katkisi (TL/jest)</Ti><ResponsiveContainer width="100%" height={240}><ComposedChart data={D}><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}}/><YAxis tick={{fill:CL.muted,fontSize:10}} tickFormatter={v=>v+" TL"} domain={[0,28]}/><Tooltip content={<Tip/>}/><Bar dataKey="perUnitTutar" name="Tutar (TL/jest)" stackId="1" fill={CL.green+"80"}/><Bar dataKey="perUnitJest" name="Jest Birimi" stackId="1" fill={CL.warm+"80"} radius={[3,3,0,0]}/><Line type="monotone" dataKey="perUnitTotal" name="Toplam" stroke={CL.accent} strokeWidth={2.5} dot={{r:3,fill:CL.accent}}/></ComposedChart></ResponsiveContainer><div className="mt-2 text-center text-xs" style={{color:CL.muted}}>Ay 1: 13,0 TL/jest - Ay 12: 24,7 TL/jest (sektor CAC: 50-100 TL)</div></Card>
    </div>
  </div>;
};

// ═══ KULLANICI ═══
const UserView = ({D}) => {
  const uD=D.map(d=>({...d,hediyePerUser:+(d.jestSent/(d.mau||1)).toFixed(1),redeemPerUser:+(d.jestRedeemed/(d.mau||1)).toFixed(1),valueReceived:Math.round(d.jestRedeemed*117/(d.mau||1))}));
  return <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card><Stat label="Yil Sonu MAU" value={fmt(D[11].mau)} color={CL.blue}/></Card>
      <Card><Stat label="Platform ARPU" value={Math.round(sum(D.map(d=>d.gelir))/(D[11].mau||1))+" TL"} sub="Yillik" color={CL.green}/></Card>
      <Card><Stat label="Jest/MAU" value={(sum(D.map(d=>d.jestSent))/(D[11].mau||1)).toFixed(1)} sub="Kullanici basina" color={CL.warm}/></Card>
      <Card><Stat label="Kullanici Maliyeti" value="0 TL" sub="Kullanici hic odeme yapmaz" color={CL.accent}/></Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card><Ti>Kullanici Basina Deger</Ti><ResponsiveContainer width="100%" height={240}><LineChart data={uD}><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}}/><YAxis tick={{fill:CL.muted,fontSize:10}} tickFormatter={v=>v+" TL"}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="valueReceived" name="Kullaniciya Ulasan Deger" stroke={CL.blue} strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></Card>
      <Card><Ti>Jest Aktivitesi (MAU Basina)</Ti><ResponsiveContainer width="100%" height={240}><BarChart data={uD}><CartesianGrid strokeDasharray="3 3" stroke={GR}/><XAxis dataKey="name" tick={{fill:CL.muted,fontSize:10}}/><YAxis tick={{fill:CL.muted,fontSize:10}}/><Tooltip content={<Tip/>}/><Bar dataKey="hediyePerUser" name="Gonderilen/MAU" fill={CL.warm+"80"} radius={[2,2,0,0]}/><Bar dataKey="redeemPerUser" name="Kullanilan/MAU" fill={CL.green+"80"} radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></Card>
    </div>
  </div>;
};

// ═══ ANA UYGULAMA ═══
export default function Dashboard() {
  const [tab, setTab] = useState("board");
  const [scenario, setScenario] = useState("baz");
  const D = buildData(scenario);
  const sc = SCENARIOS[scenario];

  return <div style={{background:CL.bg,minHeight:"100vh"}}>
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-bold italic" style={{fontFamily:"Georgia",color:CL.accent}}>iyi ki</div>
          <div className="text-xs mt-1 tracking-wider uppercase" style={{color:CL.muted}}>Finansal Dashboard - {sc.label} Senaryo - Nisan 2026</div>
        </div>
        <div className="text-right text-xs" style={{color:CL.muted}}>
          <div>12 Aylik Projeksiyon</div>
          <div style={{color:CL.green}}>4 Yontem Triangulasyon</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[{id:"board",label:"Board",icon:"📊"},{id:"sponsor",label:"Sponsor",icon:"🤝"},{id:"partner",label:"Partner",icon:"🏪"},{id:"user",label:"Kullanici",icon:"👤"}].map(t =>
          <button key={t.id} onClick={()=>setTab(t.id)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all" style={{background:tab===t.id?CL.accent:CL.card,color:tab===t.id?"#fff":CL.dark,border:"1px solid "+(tab===t.id?CL.accent:CL.border)}}>
            <span>{t.icon}</span> {t.label}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-medium mr-1" style={{color:CL.muted}}>Senaryo:</span>
        {Object.entries(SCENARIOS).map(([key,s]) =>
          <button key={key} onClick={()=>setScenario(key)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all" style={{background:scenario===key?s.color:"transparent",color:scenario===key?"#fff":CL.muted,border:"1.5px solid "+(scenario===key?s.color:CL.border)}}>
            {s.label}
          </button>
        )}
      </div>

      {tab==="board" && <BoardView D={D} scenario={scenario}/>}
      {tab==="sponsor" && <SponsorView D={D}/>}
      {tab==="partner" && <PartnerView D={D}/>}
      {tab==="user" && <UserView D={D}/>}

      <div className="mt-8 text-center text-xs" style={{color:CL.muted}}>
        Soylemene gerek yok. Dusunmen yeter. <span style={{color:CL.accent}}>Iyi ki sen.</span>
      </div>
    </div>
  </div>;
}
