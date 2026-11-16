(function(root){
  'use strict';
  const E=root.ThicketEventsCore;
  const number=n=>n>=1e12?(n/1e12).toLocaleString('ru-RU',{maximumFractionDigits:1})+' трлн':n>=1e9?(n/1e9).toLocaleString('ru-RU',{maximumFractionDigits:1})+' млрд':n>=1e6?(n/1e6).toLocaleString('ru-RU',{maximumFractionDigits:1})+' млн':Math.floor(n).toLocaleString('ru-RU');
  const duration=ms=>{const h=Math.max(0,Math.ceil(ms/3600000));return h>=24?`${Math.floor(h/24)} д. ${h%24} ч.`:`${h} ч.`;};
  function mount({container,state,onChange,toast,icon}){
    let selected=null,viewSlot,viewProgress,mode=1;E.ensure(state,Date.now());onChange();
    const $=q=>container.querySelector(q);
    function render(){
      E.tick(state,Date.now());viewSlot=state.eventSchedule.slot;const active=E.activeId(state);
      if(!selected){container.innerHTML=`<div class="page-head"><p class="tiny-label">ВРЕМЕННЫЕ МИРЫ</p><h2>За гранью чащи</h2><p>В каждом мире — своё производство и девять целей. Значки на рубежах 3, 6 и 9 усиливают следующее возвращение той же темы.</p></div><div class="portal-list">${E.THEMES.map((t,i)=>`<button class="portal-card portal-${i}" data-event-open="${t.id}"><span class="portal-ring">${icon(t.icon)}</span><div><small>${active===t.id?'ОТКРЫТО СЕЙЧАС':'ВЕРНЁТСЯ ПОЗЖЕ'}</small><h3>${t.name}</h3><p>${active===t.id?'До закрытия '+duration(state.events[t.id].endsAt-Date.now()):'Через '+duration(E.nextVisit(state,t.id)-Date.now())}</p><p>Следующий заход: +${E.bonus(state.events[t.id])}%</p></div>${icon('arrow')}</button>`).join('')}</div><p class="screen-note">Каждая тема открыта 72 часа и возвращается через цикл из трёх тем. Заработанные значки остаются. События не нужны для завершения основной истории.</p>`;container.querySelectorAll('[data-event-open]').forEach(b=>b.onclick=()=>{selected=b.dataset.eventOpen;render();});return;}
      const t=E.THEMES.find(t=>t.id===selected),e=state.events[selected],isActive=active===selected;viewProgress=e.progress;
      container.innerHTML=`<div class="event-page"><button class="back-button" id="event-back">${icon('back')} Порталы</button><div class="event-symbol">${icon(t.icon)}</div><p class="tiny-label">${isActive?'ЗАХОД '+e.round:'ПОРТАЛ ЗАКРЫТ'}</p><h2>${t.name}</h2><p class="event-desc">${t.desc}</p>${isActive?`<div class="event-resource"><div><small>${t.currency}</small><strong id="event-currency"></strong><small id="event-income"></small></div><button id="event-tap" class="gold-button">Собрать ${icon(t.icon)}</button></div><p class="event-clock" id="event-clock"></p><div class="stage-label"><span>Следующая награда</span><b id="event-progress"></b></div><div class="event-meter"><span id="event-meter-fill"></span></div><p id="event-target" class="event-target"></p><div class="event-stages">${E.GOALS.map((_,i)=>`<span class="${i<e.progress?'done':''} ${[2,5,8].includes(i)?'badge-stage':''}">${i+1}${[2,5,8].includes(i)?'<small>✦</small>':''}</span>`).join('')}</div><div class="event-buy-modes" aria-label="Количество уровней">${[1,10,'max'].map(m=>`<button data-event-mode="${m}" aria-pressed="${mode===m}">${m==='max'?'Макс.':'×'+m}</button>`).join('')}</div><div class="producer-list">${E.SOURCES.map((p,i)=>e.progress>=p.gate?`<article class="producer"><span class="producer-emblem">${icon(t.icons[i])}</span><div class="producer-copy"><h4>${t.sources[i]} <small id="event-level-${i}"></small></h4><p id="event-source-income-${i}"></p><p id="event-source-next-${i}"></p></div><button class="buy-button" data-event-buy="${i}"></button></article>`:'').join('')}</div><div class="event-upgrades"><h3>Открытия этого мира</h3>${E.UPGRADES.map((u,i)=>e.progress>=u.gate?`<button class="event-upgrade ${e.research.includes(i)?'owned':''}" data-event-research="${i}"><span><b>${t.upgrades[i]}</b><small>${t.sources[u.source]} ×2</small></span><span>${e.research.includes(i)?'Открыто':number(u.cost)}</span></button>`:'').join('')||'<p>Первое открытие появится после первого этапа.</p>'}</div>`:`<p class="sheet-note">Портал вернётся через ${duration(E.nextVisit(state,selected)-Date.now())}. В следующий заход начнёшь с бонусом +${E.bonus(e)}%.</p>`}<div class="event-boosts"><div><small>${isActive?'В этом заходе':'В прошлом заходе'}</small><b>+${e.activeBonus||0}%</b></div><span>→</span><div><small>При возвращении темы</small><b>+${E.bonus(e)}%</b></div></div><div class="event-medals">${t.badges.map((name,i)=>`<div class="event-medal ${e.badges[i]?'won':''}"><span>${['Ⅰ','Ⅱ','Ⅲ'][i]}</span><div><b>${name}</b><small>Этап ${[3,6,9][i]} · +${[5,10,15][i]}%</small><small>В коллекции: ${e.badges[i]}</small></div></div>`).join('')}</div><p class="screen-note">Каждый этап даёт ещё +10% к базовому производству этого захода. Значки сохраняются сразу и действуют со следующего появления темы. Доход начисляется и без тебя, до 48 часов. Расписание хранится на устройстве.</p></div>`;
      $('#event-back').onclick=()=>{selected=null;render();};
      $('#event-tap')?.addEventListener('click',()=>{E.tap(state,selected,Date.now());changed();});
      container.querySelectorAll('[data-event-buy]').forEach(b=>b.onclick=()=>{E.buy(state,selected,+b.dataset.eventBuy,mode,Date.now());changed();});
      container.querySelectorAll('[data-event-research]').forEach(b=>b.onclick=()=>{if(E.research(state,selected,+b.dataset.eventResearch,Date.now())){toast('Открытие усилило производство');onChange();render();}});
      container.querySelectorAll('[data-event-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.eventMode==='max'?'max':+b.dataset.eventMode;render();});refresh();
    }
    function changed(){onChange();if(state.events[selected].progress!==viewProgress){toast('Новая награда события');render();}else refresh();}
    function refresh(){
      if(state.eventSchedule.slot!==viewSlot){onChange();render();return;}
      if(!selected){
        container.querySelectorAll('[data-event-open]').forEach(b=>{const id=b.dataset.eventOpen,clock=b.querySelector('p');if(clock)clock.textContent=E.activeId(state)===id?'До закрытия '+duration(state.events[id].endsAt-Date.now()):'Через '+duration(E.nextVisit(state,id)-Date.now());});
        return;
      }
      if(E.activeId(state)!==selected){const note=$('.sheet-note');if(note)note.textContent=`Портал вернётся через ${duration(E.nextVisit(state,selected)-Date.now())}. В следующий заход начнёшь с бонусом +${E.bonus(state.events[selected])}%.`;return;}
      const e=state.events[selected];if(e.progress!==viewProgress){onChange();render();return;}
      if(!$('#event-currency'))return;
      $('#event-currency').textContent=number(e.currency);$('#event-income').textContent=`+${number(E.income(e))} / с`;
      $('#event-clock').textContent='До закрытия: '+duration(e.endsAt-Date.now());$('#event-progress').textContent=`${e.progress} / 9`;
      const from=e.progress?E.GOALS[e.progress-1]:0,to=E.GOALS[e.progress]||from;
      $('#event-meter-fill').style.width=(e.progress===9?100:Math.min(100,(e.totalEarned-from)/(to-from)*100))+'%';
      $('#event-target').textContent=e.progress===9?'Все девять наград получены. Значки помогут при возвращении темы.':`Собрано ${number(e.totalEarned)} из ${number(to)} · этап ${e.progress+1}${[3,6,9].includes(e.progress+1)?' и постоянный значок':''}`;
      container.querySelectorAll('[data-event-buy]').forEach(b=>{const i=+b.dataset.eventBuy,q=E.quote(e,i,mode);b.disabled=!q.count;b.textContent=number(q.count?q.cost:q.nextCost);$(`#event-level-${i}`).textContent='ур. '+e.producers[i];$(`#event-source-income-${i}`).textContent=`${number(E.sourceIncome(e,i))} / с`;$(`#event-source-next-${i}`).textContent=q.count?`+${q.count} ур. → ${number(q.after)} / с`:'Накопи на следующий уровень';});
      container.querySelectorAll('[data-event-research]').forEach(b=>{const i=+b.dataset.eventResearch;b.disabled=e.research.includes(i)||e.currency<E.UPGRADES[i].cost;});
    }
    render();return{refresh,destroy(){container.innerHTML='';}};
  }
  root.ThicketEventsUI={mount};
})(globalThis);
