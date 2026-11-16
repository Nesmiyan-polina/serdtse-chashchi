(function(root){
  'use strict';
  const DURATION=72*3600*1000,OFFLINE=48*3600;
  const THEMES=[
    {id:'moths',name:'Сад лунных мотыльков',icon:'moth',desc:'Собери лунный свет, пробуди цветы и верни в сад ночной рой.',currency:'Лунный свет',sources:['Ночные цветы','Серебряная роса','Лунные коконы'],icons:['leaf','spark','moth'],upgrades:['Светящиеся лепестки','Росные чаши','Тёплые коконы','Запах ночи','Зеркало луны','Песня крыльев'],badges:['Первый кокон','Тихое сияние','Лунный рой']},
    {id:'potions',name:'Забытые зелья',icon:'flask',desc:'Разбуди алхимический сад, наладь перегонку и восстанови великий эликсир.',currency:'Эссенция',sources:['Сад трав','Ряд реторт','Алхимический очаг'],icons:['leaf','flask','spark'],upgrades:['Живые настои','Чистая перегонка','Сердце очага','Новые рецепты','Стекло алхимика','Последняя формула'],badges:['Искра в колбе','Тайный рецепт','Великий эликсир']},
    {id:'giants',name:'Песнь каменных великанов',icon:'mountain',desc:'Собери эхо в ущельях, настрой каменные круги и пробуди хор великанов.',currency:'Эхо гор',sources:['Звенящие камни','Каменные круги','Хор великанов'],icons:['mountain','memory','crown'],upgrades:['Первые голоса','Резонанс круга','Древние певцы','Голос глубин','Отзвук клятвы','Общая песня'],badges:['Голос камня','Память гор','Пробуждение']}
  ];
  const SOURCES=[{base:20,rate:1,gate:0},{base:1000,rate:25,gate:2},{base:100000,rate:1000,gate:4}];
  const UPGRADES=[{cost:500,source:0,gate:1},{cost:10000,source:1,gate:2},{cost:1000000,source:2,gate:4},{cost:10000000,source:0,gate:5},{cost:100000000,source:1,gate:6},{cost:1000000000,source:2,gate:7}];
  const GOALS=[100,2500,40000,700000,10000000,160000000,2500000000,40000000000,600000000000];
  const bonus=e=>e.badges.reduce((sum,n,i)=>sum+n*[5,10,15][i],0);
  const fresh=(prior={},start=0,slot=0)=>({progress:0,badges:[...(prior.badges||[0,0,0])],activeBonus:bonus({badges:prior.badges||[0,0,0]}),finished:false,round:Number.isInteger(prior.slot)?(prior.round||1)+1:(prior.round||1),currency:0,totalEarned:0,producers:[0,0,0],research:[],awarded:[],startsAt:start,endsAt:start+DURATION,lastTick:start,slot});
  const milestone=level=>2**[10,25,50,100,200].filter(n=>level>=n).length;
  function sourceIncome(e,i,level=e.producers[i]){return level*SOURCES[i].rate*milestone(level)*2**e.research.filter(n=>UPGRADES[n]?.source===i).length*(1+e.progress*.1)*(1+e.activeBonus/100);}
  const income=e=>SOURCES.reduce((sum,_,i)=>sum+sourceIncome(e,i),0);
  function rewards(e){while(e.progress<9&&e.totalEarned+1e-6>=GOALS[e.progress]){e.progress++;const badge=[3,6,9].indexOf(e.progress);if(badge>=0&&!e.awarded.includes(badge)){e.badges[badge]++;e.awarded.push(badge);}}}
  function accrue(e,seconds){let left=Math.max(0,Math.min(OFFLINE,seconds)),earned=0;while(left>1e-7){const rate=income(e);if(!rate)break;const gap=e.progress<9?Math.max(0,GOALS[e.progress]-e.totalEarned):Infinity;const dt=Math.min(left,gap/rate);const gain=rate*dt;e.currency+=gain;e.totalEarned+=gain;earned+=gain;left-=dt;rewards(e);if(dt===0&&e.progress>=9)break;}return earned;}
  function normalizeEvent(e){
    e.badges=[0,1,2].map(i=>Math.max(0,Math.floor(Number(e.badges?.[i])||0)));
    e.progress=Math.max(0,Math.min(9,Math.floor(Number(e.progress)||0)));
    e.currency=Math.max(0,Number(e.currency)||0);e.totalEarned=Math.max(0,Number(e.totalEarned)||0);
    e.producers=[0,1,2].map(i=>Math.max(0,Math.min(1000,Math.floor(Number(e.producers?.[i])||0))));
    e.research=[...new Set((e.research||[]).filter(n=>Number.isInteger(n)&&UPGRADES[n]))];
    e.awarded=[...new Set((e.awarded||[]).filter(n=>[0,1,2].includes(n)))];return e;
  }
  function ensure(s,now){
    if(!s.events)s.events={};THEMES.forEach(t=>{if(!s.events[t.id])s.events[t.id]={badges:[0,0,0],round:0};});
    if(!s.eventSchedule||!Number.isFinite(s.eventSchedule.anchor)){s.eventSchedule={anchor:now,slot:0,lastSeen:now};s.events.moths=fresh(s.events.moths,now,0);}
    THEMES.forEach(t=>normalizeEvent(s.events[t.id]));return tick(s,now);
  }
  function tick(s,now){
    if(!s.eventSchedule)return 0;
    const schedule=s.eventSchedule;now=Math.max(Number.isFinite(now)?now:schedule.lastSeen,schedule.lastSeen||schedule.anchor);
    const id=THEMES[schedule.slot%3].id;let e=s.events[id],earned=0;
    if(!e||!Number.isFinite(e.endsAt)){e=s.events[id]=fresh(e,schedule.anchor+schedule.slot*DURATION,schedule.slot);normalizeEvent(e);}
    if(!e.finished){const until=Math.min(now,e.endsAt);earned=accrue(e,Math.max(0,(until-e.lastTick)/1000));e.lastTick=until;if(now>=e.endsAt)e.finished=true;}
    const slot=Math.floor(Math.max(0,now-schedule.anchor)/DURATION);
    if(slot>schedule.slot){schedule.slot=slot;const nextId=THEMES[slot%3].id;s.events[nextId]=fresh(s.events[nextId],schedule.anchor+slot*DURATION,slot);s.events[nextId].lastTick=now;}
    schedule.lastSeen=now;return earned;
  }
  const activeId=s=>s.eventSchedule?THEMES[s.eventSchedule.slot%3].id:null;
  function active(s,id,now){tick(s,now);return activeId(s)===id&&!s.events[id].finished;}
  function tap(s,id,now){if(!active(s,id,now))return false;const e=s.events[id],gain=Math.max(1*(1+e.activeBonus/100),income(e)*.15);e.currency+=gain;e.totalEarned+=gain;rewards(e);return gain;}
  function quote(e,i,mode=1){
    if(!SOURCES[i]||e.progress<SOURCES[i].gate)return{count:0,cost:0,before:0,after:0};
    let count=0,total=0,limit=mode==='max'?1000:mode===10?10:1;const level=e.producers[i];
    while(count<limit&&level+count<1000){const price=Math.floor(SOURCES[i].base*1.17**(level+count));if(!Number.isFinite(price)||total+price>e.currency)break;total+=price;count++;}
    return{count,cost:total,nextCost:Math.floor(SOURCES[i].base*1.17**level),before:sourceIncome(e,i),after:sourceIncome(e,i,level+count)};
  }
  function buy(s,id,i,mode,now){if(!active(s,id,now))return false;const e=s.events[id],q=quote(e,i,mode);if(!q.count)return false;e.currency-=q.cost;e.producers[i]+=q.count;return q;}
  function research(s,id,i,now){if(!active(s,id,now))return false;const e=s.events[id],u=UPGRADES[i];if(!u||e.progress<u.gate||e.research.includes(i)||e.currency<u.cost)return false;e.currency-=u.cost;e.research.push(i);return true;}
  function nextVisit(s,id){if(!s.eventSchedule)return null;const target=THEMES.findIndex(t=>t.id===id);let offset=(target-s.eventSchedule.slot%3+3)%3;if(offset===0)offset=3;return s.eventSchedule.anchor+(s.eventSchedule.slot+offset)*DURATION;}
  const api={THEMES,SOURCES,UPGRADES,GOALS,DURATION,OFFLINE,fresh,ensure,tick,activeId,income,sourceIncome,milestone,bonus,tap,quote,buy,research,nextVisit,accrue};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ThicketEventsCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
