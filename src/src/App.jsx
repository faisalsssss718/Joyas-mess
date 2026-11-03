import { useState } from 'react';
import htm from 'htm';
import React from 'react';
const h = htm.bind(React.createElement);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const TODAY=iso(new Date()), CM=TODAY.slice(0,7);
const addM=(m,k)=>{const [y,mo]=m.split('-').map(Number);return iso(new Date(y,mo-1+k,1)).slice(0,7)};
const PM=addM(CM,-1), MONTHS=[PM,CM];
const dim=m=>{const [y,mo]=m.split('-').map(Number);return new Date(y,mo,0).getDate()};
const MN=m=>new Date(m+'-01T00:00').toLocaleString('en-IN',{month:'long',year:'numeric'});
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const K=(s,d,m)=>`${s}|${d}|${m}`;

const bill=(s,meals,m)=>{let mc=0,ec=0;for(let d=1;d<=dim(m);d++){const dt=`${m}-${pad(d)}`;if(meals[K(s.id,dt,'M')]==='taken')mc++;if(meals[K(s.id,dt,'E')]==='taken')ec++}
  const total=s.type==='monthly'?s.fee:s.type==='hybrid'?s.fee+Math.max(0,mc+ec-s.incl)*s.mr:mc*s.mr+ec*s.er;return{mc,ec,total}};
const stat=(t,p)=>p>=t?['Paid','text-[#4F7F4F]']:p>0?['Partially paid','text-[#E8731A]']:['Pending','text-red-700'];

function seed(){
  const base=[['Rahul Patil','9822001101','A-101','per_tiffin',40,40,0,0,PM+'-01','active'],['Sneha Kulkarni','9822001102','B-204','monthly',40,40,2500,0,PM+'-01','active'],
    ['Amit Deshmukh','9822001103','A-110','hybrid',40,40,1800,40,PM+'-01','active'],['Priya Joshi','9822001104','C-012','per_tiffin',45,40,0,0,PM+'-01','active'],
    ['Vikram More','9822001105','B-301','per_tiffin',40,40,0,0,PM+'-01','inactive'],['Neha Shinde','9822001106','C-105','per_tiffin',40,40,0,0,PM+'-15','active']];
  const students=base.map((b,i)=>({id:'JM'+(1001+i),name:b[0],mobile:b[1],room:b[2],type:b[3],mr:b[4],er:b[5],fee:b[6],incl:b[7],joined:b[8],status:b[9]}));
  const meals={};
  students.forEach((s,i)=>{for(const m of MONTHS)for(let d=1;d<=dim(m);d++){const dt=`${m}-${pad(d)}`;if(dt>=TODAY||dt<s.joined)continue;if(s.status==='inactive'&&dt>PM+'-25')continue;
    ['M','E'].forEach((x,j)=>{const r=(i*31+d*7+j*13+d*d)%10;meals[K(s.id,dt,x)]=r<8?'taken':r===8?'leave':'not_taken'})}});
  const pay=(i,amt,ref)=>({id:'p'+i+ref,sid:students[i].id,m:PM,amt,date:PM+'-28',ref});
  const full=i=>bill(students[i],meals,PM).total;
  const pays=[pay(0,1000,'UPI-4412'),pay(1,2500,'CASH'),pay(2,full(2),'UPI-5120'),pay(3,500,'CASH'),pay(5,1000,'UPI-6001'),{id:'p9',sid:students[1].id,m:CM,amt:2500,date:CM+'-01',ref:'UPI-7788'}];
  return{students,meals,pays};
}
const SEED=seed();

const Card=p=>h`<div class=${'bg-white rounded-xl border border-[#EADFCB] p-4 '+(p.c||'')}>${p.children}</div>`;
const Btn=p=>h`<button onClick=${p.onClick} disabled=${p.disabled} class=${(p.ghost?'border border-[#D9C9AE] text-[#4A2C17] bg-white':'bg-[#E8731A] text-white')+' px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 '+(p.c||'')}>${p.children}</button>`;
const inp='border border-[#D9C9AE] rounded-lg px-3 py-2 text-sm bg-white w-full';
const SC={taken:'bg-[#6B9B6B] text-white',not_taken:'bg-[#4A2C17] text-white',leave:'bg-[#E8731A] text-white'};
const DOT={taken:'bg-[#6B9B6B]',not_taken:'bg-[#4A2C17]',leave:'bg-[#E8731A]'};
const Th=p=>h`<th class="text-left font-medium text-xs text-[#7A5C45] py-2 pr-3">${p.children}</th>`;

function Form({init,onSave,onCancel}){
  const [f,setF]=useState(init),[err,setErr]=useState('');
  const set=k=>e=>setF({...f,[k]:e.target.value});
  const save=()=>{
    if(!f.name.trim())return setErr('Enter the student name.');
    if(!/^\d{10}$/.test(f.mobile))return setErr('Mobile number must be 10 digits.');
    if(!f.room.trim())return setErr('Enter the room or hostel number.');
    onSave({...f,name:f.name.trim(),mr:+f.mr,er:+f.er,fee:+f.fee,incl:+f.incl});
  };
  const L=(t,k,type='text')=>h`<label class="text-xs text-[#7A5C45] block">${t}<input class=${inp+' mt-1'} type=${type} value=${f[k]} onInput=${set(k)} /></label>`;
  return h`<div class="fixed inset-0 bg-black/30 z-20 grid place-items-center p-3"><div class="bg-white rounded-xl p-5 w-full max-w-lg max-h-full overflow-auto space-y-3">
    <h3 class="font-semibold text-lg">${init.id?'Edit student':'Add student'}</h3>
    <div class="grid sm:grid-cols-2 gap-3">${L('Full name','name')}${L('Mobile number','mobile')}${L('Room / hostel','room')}${L('Joining date','joined','date')}
    <label class="text-xs text-[#7A5C45] block">Billing plan<select class=${inp+' mt-1'} value=${f.type} onChange=${set('type')}><option value="per_tiffin">Per tiffin</option><option value="monthly">Fixed monthly</option><option value="hybrid">Monthly + extra tiffins</option></select></label>
    <label class="text-xs text-[#7A5C45] block">Status<select class=${inp+' mt-1'} value=${f.status} onChange=${set('status')}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
    ${L('Morning rate (₹)','mr','number')}${L('Evening rate (₹)','er','number')}
    ${f.type!=='per_tiffin'&&L('Monthly fee (₹)','fee','number')}${f.type==='hybrid'&&L('Meals included','incl','number')}</div>
    ${err&&h`<p class="text-sm text-red-700">${err}</p>`}
    <div class="flex gap-2 justify-end"><${Btn} ghost onClick=${onCancel}>Cancel<//><${Btn} onClick=${save}>Save student<//></div></div></div>`;
}

function App(){
  const [students,setStudents]=useState(SEED.students),[meals,setMeals]=useState(SEED.meals),[pays,setPays]=useState(SEED.pays);
  const [view,setView]=useState('dash'),[pid,setPid]=useState(null),[edit,setEdit]=useState(null),[ask,setAsk]=useState(null),[toast,setToast]=useState('');
  const [month,setMonth]=useState(CM),[date,setDate]=useState(TODAY),[q,setQ]=useState(''),[tab,setTab]=useState('daily'),[pf,setPf]=useState({sid:null,amt:'',ref:''}),[err,setErr]=useState('');
  const note=t=>{setToast(t);setTimeout(()=>setToast(''),2200)};
  const go=v=>{setView(v);setPid(null)};
  const cnt=(d,x)=>students.filter(s=>meals[K(s.id,d,x)]==='taken').length;
  const paid=(sid,m)=>pays.filter(p=>p.sid===sid&&p.m===m).reduce((a,p)=>a+p.amt,0);
  const rem=(s,m)=>bill(s,meals,m).total-paid(s.id,m);
  const mark=(sid,x,v)=>setMeals(m=>({...m,[K(sid,date,x)]:v}));
  const pending=students.reduce((a,s)=>a+MONTHS.reduce((b,m)=>b+Math.max(0,rem(s,m)),0),0);
  const addPay=(s,m)=>{const amt=+pf.amt,r=rem(s,m);
    if(!(amt>0))return setErr('Enter an amount above 0.');
    if(amt>r)return setErr('Amount is more than the remaining '+inr(r)+'.');
    setPays([...pays,{id:'p'+Date.now(),sid:s.id,m,amt,date:TODAY,ref:pf.ref||'CASH'}]);setPf({sid:null,amt:'',ref:''});setErr('');note('Payment recorded');};
  const saveStudent=f=>{
    if(f.id){setStudents(students.map(s=>s.id===f.id?f:s));note('Student updated')}
    else{setStudents([...students,{...f,id:'JM'+(1001+students.length)}]);note('Student added')}
    setEdit(null)};
  const toggle=s=>setAsk({msg:`${s.status==='active'?'Deactivate':'Reactivate'} ${s.name}? Past records stay saved.`,fn:()=>{setStudents(students.map(x=>x.id===s.id?{...x,status:x.status==='active'?'inactive':'active'}:x));note('Status changed')}});
  const mSel=h`<select class=${inp+' !w-auto'} value=${month} onChange=${e=>setMonth(e.target.value)}>${MONTHS.map(m=>h`<option value=${m}>${MN(m)}</option>`)}</select>`;
  const blank={name:'',mobile:'',room:'',joined:TODAY,type:'per_tiffin',status:'active',mr:40,er:40,fee:0,incl:0};
  const active=students.filter(s=>s.status==='active');
  const todayRev=pays.filter(p=>p.date===TODAY).reduce((a,p)=>a+p.amt,0), monthRev=pays.filter(p=>p.date.startsWith(CM)).reduce((a,p)=>a+p.amt,0);

  const Dash=()=>{
    const ds=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return iso(d)});
    const vals=ds.map(d=>cnt(d,'M')+cnt(d,'E')),mx=Math.max(1,...vals);
    const items=[['Registered students',students.length],['Active students',active.length],['Morning tiffins today',cnt(TODAY,'M')],['Evening tiffins today',cnt(TODAY,'E')],['Total tiffins today',cnt(TODAY,'M')+cnt(TODAY,'E')],['Collected today',inr(todayRev)],['Collected this month',inr(monthRev)],['Pending payments',inr(pending)]];
    return h`<div class="space-y-4"><div class="flex flex-wrap gap-2"><${Btn} onClick=${()=>{setDate(TODAY);go('daily')}}>Mark today’s tiffins<//><${Btn} ghost onClick=${()=>setEdit(blank)}>Add student<//><${Btn} ghost onClick=${()=>go('bill')}>Record payment<//></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${items.map(([k,v])=>h`<${Card}><p class="text-xs text-[#7A5C45]">${k}</p><p class="text-2xl font-semibold mt-1">${v}</p><//>`)}</div>
    <div class="grid lg:grid-cols-2 gap-3"><${Card}><p class="font-medium mb-2">Tiffins served, last 14 days</p>
      <svg viewBox="0 0 420 130" class="w-full"><g>${vals.map((v,i)=>h`<rect x=${i*30+4} y=${110-v/mx*100} width="22" height=${v/mx*100} rx="3" fill=${i===13?'#E8731A':'#6B9B6B'}/><text x=${i*30+15} y="125" font-size="9" text-anchor="middle" fill="#7A5C45">${ds[i].slice(8)}</text>`)}</g></svg><//>
    <${Card}><p class="font-medium mb-2">Recent payments</p>${[...pays].reverse().slice(0,5).map(p=>h`<div class="flex justify-between text-sm py-1 border-b border-[#F3EAD9]"><span>${students.find(s=>s.id===p.sid).name}</span><span>${inr(p.amt)} · ${p.date.slice(5)}</span></div>`)}<//></div></div>`};

  const Daily=()=>h`<div class="space-y-3"><div class="flex flex-wrap items-center gap-3"><input type="date" class=${inp+' !w-auto'} max=${TODAY} value=${date} onChange=${e=>e.target.value&&setDate(e.target.value)} />
    <${Card} c="!py-2"><span class="text-sm">Kitchen: <b>${cnt(date,'M')}</b> morning · <b>${cnt(date,'E')}</b> evening</span><//></div>
    ${active.filter(s=>s.joined<=date).map(s=>h`<${Card} c="space-y-2"><p class="font-medium">${s.name} <span class="text-xs text-[#7A5C45]">${s.id} · Room ${s.room}</span></p>
      <div class="grid sm:grid-cols-2 gap-2">${[['M','Morning'],['E','Evening']].map(([x,l])=>h`<div><p class="text-xs mb-1">${l}</p><div class="flex gap-1">${[['taken','Taken'],['not_taken','Not taken'],['leave','Leave']].map(([v,t])=>h`<button onClick=${()=>mark(s.id,x,v)} class=${'flex-1 text-xs py-2 rounded-md border border-[#EADFCB] '+(meals[K(s.id,date,x)]===v?SC[v]:'bg-white')}>${t}</button>`)}</div></div>`)}</div><//>`)}</div>`;

  const Students=()=>h`<div class="space-y-3"><div class="flex gap-2"><input class=${inp} placeholder="Search by name or ID" value=${q} onInput=${e=>setQ(e.target.value)} /><${Btn} onClick=${()=>setEdit(blank)} c="whitespace-nowrap">Add student<//></div>
    ${students.filter(s=>(s.name+s.id).toLowerCase().includes(q.toLowerCase())).map(s=>h`<${Card} c="flex flex-wrap items-center justify-between gap-2"><div><p class="font-medium">${s.name} <span class="text-xs text-[#7A5C45]">${s.id}</span></p><p class="text-xs text-[#7A5C45]">${s.mobile} · Room ${s.room} · ${s.type==='per_tiffin'?'Per tiffin':s.type==='monthly'?'Monthly '+inr(s.fee):'Hybrid '+inr(s.fee)} · ${s.status}</p></div>
      <div class="flex gap-3 text-sm underline text-[#E8731A]"><button onClick=${()=>setPid(s.id)}>Profile</button><button onClick=${()=>setEdit(s)}>Edit</button><button onClick=${()=>toggle(s)}>${s.status==='active'?'Deactivate':'Reactivate'}</button></div><//>`)}
    ${!students.some(s=>(s.name+s.id).toLowerCase().includes(q.toLowerCase()))&&h`<p class="text-center text-sm py-6 text-[#7A5C45]">No students match “${q}”.</p>`}</div>`;

  const Profile=()=>{
    const s=students.find(x=>x.id===pid),b=bill(s,meals,month),pd=paid(s.id,month),st=stat(b.total,pd),first=new Date(month+'-01T00:00').getDay();
    return h`<div class="space-y-3"><button class="text-sm underline" onClick=${()=>setPid(null)}>Back to students</button>
    <${Card}><p class="text-xl font-semibold">${s.name}</p><p class="text-sm text-[#7A5C45]">${s.id} · ${s.mobile} · Room ${s.room} · Joined ${s.joined} · ${s.status}</p><p class="text-sm mt-1">Rates: morning ${inr(s.mr)}, evening ${inr(s.er)}</p><//>
    <div class="flex items-center gap-3">${mSel}<span class=${'text-sm font-medium '+st[1]}>${st[0]}</span></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${[['Morning tiffins',b.mc],['Evening tiffins',b.ec],['Bill',inr(b.total)],['Remaining',inr(b.total-pd)]].map(([k,v])=>h`<${Card}><p class="text-xs text-[#7A5C45]">${k}</p><p class="text-xl font-semibold">${v}</p><//>`)}</div>
    <${Card}><div class="grid grid-cols-7 gap-1 text-center text-xs">${'SMTWTFS'.split('').map(d=>h`<span class="text-[#7A5C45]">${d}</span>`)}${Array.from({length:first},()=>h`<span/>`)}
      ${Array.from({length:dim(month)},(_,i)=>{const dt=`${month}-${pad(i+1)}`;return h`<div class="border border-[#F3EAD9] rounded-md py-1"><p>${i+1}</p><div class="flex justify-center gap-1 mt-1">${['M','E'].map(x=>h`<span class=${'w-2.5 h-2.5 rounded-full '+(DOT[meals[K(s.id,dt,x)]]||'border border-[#D9C9AE]')}></span>`)}</div></div>`})}</div>
      <p class="text-xs text-[#7A5C45] mt-3">Left dot morning, right dot evening. Green taken, brown not taken, orange leave, empty not marked.</p><//>
    <${Card}><p class="font-medium mb-1">Payment history</p>${pays.filter(p=>p.sid===s.id).length===0?h`<p class="text-sm text-[#7A5C45]">No payments yet.</p>`:pays.filter(p=>p.sid===s.id).map(p=>h`<p class="text-sm py-1">${p.date}: ${inr(p.amt)} for ${MN(p.m)} (${p.ref})</p>`)}<//></div>`};

  const Billing=()=>h`<div class="space-y-3">${mSel}${err&&h`<p class="text-sm text-red-700">${err}</p>`}
    ${students.filter(s=>s.status==='active'||bill(s,meals,month).total>0).map(s=>{const b=bill(s,meals,month),pd=paid(s.id,month),r=b.total-pd,st=stat(b.total,pd);
      const wa=`https://wa.me/91${s.mobile}?text=${encodeURIComponent(`JOYA’S MESS bill for ${MN(month)}\nMorning: ${b.mc} × ${inr(s.mr)}\nEvening: ${b.ec} × ${inr(s.er)}\nTotal: ${inr(b.total)}\nRemaining: ${inr(r)}`)}`;
      return h`<${Card} c="space-y-2"><div class="flex justify-between"><p class="font-medium">${s.name}</p><span class=${'text-sm font-medium '+st[1]}>${st[0]}</span></div>
      <p class="text-sm text-[#7A5C45]">Morning ${b.mc} × ${inr(s.mr)} · Evening ${b.ec} × ${inr(s.er)}${s.type!=='per_tiffin'?' · Fixed '+inr(s.fee):''}</p>
      <p class="text-sm">Total <b>${inr(b.total)}</b> · Paid <b>${inr(pd)}</b> · Remaining <b>${inr(r)}</b></p>
      ${pays.filter(p=>p.sid===s.id&&p.m===month).map(p=>h`<p class="text-xs text-[#7A5C45]">${p.date}: ${inr(p.amt)} (${p.ref})</p>`)}
      ${r>0&&(pf.sid===s.id?h`<div class="flex gap-2"><input class=${inp} type="number" min="1" placeholder="Amount" value=${pf.amt} onInput=${e=>setPf({...pf,amt:e.target.value})} /><input class=${inp} placeholder="Reference" value=${pf.ref} onInput=${e=>setPf({...pf,ref:e.target.value})} /><${Btn} onClick=${()=>addPay(s,month)}>Save<//></div>`:h`<${Btn} ghost onClick=${()=>{setPf({sid:s.id,amt:'',ref:''});setErr('')}}>Record payment<//>`)}
      <a class="text-xs underline text-[#4F7F4F] block" href=${wa} target="_blank" rel="noreferrer">Share on WhatsApp</a><//>`})}</div>`;

  const Reports=()=>{
    const ds=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return iso(d)});
    const tabs=[['daily','Daily'],['monthly','Monthly'],['pending','Pending']];
    return h`<div class="space-y-3"><div class="flex flex-wrap gap-2 items-center">${tabs.map(([k,l])=>h`<${Btn} ghost=${tab!==k} onClick=${()=>setTab(k)}>${l}<//>`)}${tab==='monthly'&&mSel}</div>
    <${Card} c="overflow-x-auto">${tab==='daily'?h`<table class="w-full text-sm"><thead><tr><${Th}>Date<//><${Th}>Morning<//><${Th}>Evening<//><${Th}>Total<//></tr></thead><tbody>${ds.map(d=>h`<tr class="border-t border-[#F3EAD9]"><td class="py-2">${d}</td><td>${cnt(d,'M')}</td><td>${cnt(d,'E')}</td><td>${cnt(d,'M')+cnt(d,'E')}</td></tr>`)}</tbody></table>`
    :tab==='monthly'?h`<table class="w-full text-sm"><thead><tr><${Th}>Student<//><${Th}>Morning<//><${Th}>Evening<//><${Th}>Bill<//><${Th}>Paid<//></tr></thead><tbody>${students.map(s=>{const b=bill(s,meals,month);return h`<tr class="border-t border-[#F3EAD9]"><td class="py-2">${s.name}</td><td>${b.mc}</td><td>${b.ec}</td><td>${inr(b.total)}</td><td>${inr(paid(s.id,month))}</td></tr>`})}
      <tr class="border-t border-[#EADFCB] font-medium"><td class="py-2">Total billed</td><td></td><td></td><td>${inr(students.reduce((a,s)=>a+bill(s,meals,month).total,0))}</td><td>${inr(students.reduce((a,s)=>a+paid(s.id,month),0))}</td></tr></tbody></table>`
    :h`<table class="w-full text-sm"><thead><tr><${Th}>Student<//><${Th}>Month<//><${Th}>Remaining<//></tr></thead><tbody>${students.flatMap(s=>MONTHS.map(m=>[s,m,rem(s,m)])).filter(x=>x[2]>0).map(([s,m,r])=>h`<tr class="border-t border-[#F3EAD9]"><td class="py-2">${s.name}</td><td>${MN(m)}</td><td>${inr(r)}</td></tr>`)}</tbody></table><p class="text-sm font-medium mt-2">Total pending ${inr(pending)}</p>`}<//></div>`};

  const NAV=[['dash','Dashboard',Dash],['daily','Daily tiffins',Daily],['students','Students',Students],['bill','Billing',Billing],['rep','Reports',Reports]];
  const Page=pid?Profile:NAV.find(n=>n[0]===view)[2];
  return h`<div class="min-h-screen md:flex">
    <nav class="md:w-56 bg-white border-b md:border-b-0 md:border-r border-[#EADFCB] p-3 flex md:flex-col gap-1 overflow-x-auto">
      <div class="hidden md:block px-2 pb-4"><p class="font-bold text-lg">JOYA’S MESS</p><p class="text-xs text-[#6B9B6B]">Good Food • Good Mood</p></div>
      ${NAV.map(([k,l])=>h`<button onClick=${()=>go(k)} class=${'px-3 py-2 rounded-lg text-sm text-left whitespace-nowrap '+(view===k&&!pid?'bg-[#E8731A] text-white':'hover:bg-[#FFF1DD]')}>${l}</button>`)}
      <span class="hidden md:block mt-auto text-xs text-[#7A5C45] px-2">Prototype with sample data</span></nav>
    <main class="flex-1 p-4 md:p-6 max-w-5xl"><h2 class="text-xl font-semibold mb-4">${pid?'Student profile':NAV.find(n=>n[0]===view)[1]}</h2>${Page()}</main>
    ${edit&&h`<${Form} init=${edit} onSave=${saveStudent} onCancel=${()=>setEdit(null)} />`}
    ${ask&&h`<div class="fixed inset-0 bg-black/30 z-20 grid place-items-center p-3"><div class="bg-white rounded-xl p-5 max-w-sm space-y-3"><p class="text-sm">${ask.msg}</p><div class="flex gap-2 justify-end"><${Btn} ghost onClick=${()=>setAsk(null)}>Cancel<//><${Btn} onClick=${()=>{ask.fn();setAsk(null)}}>Confirm<//></div></div></div>`}
    ${toast&&h`<div class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#4A2C17] text-white text-sm px-4 py-2 rounded-lg z-30">${toast}</div>`}</div>`;
}

export default App;
