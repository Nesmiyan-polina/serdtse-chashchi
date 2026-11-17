(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ThicketCampaign=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const SAVE_KEY='thicket-campaign-90d-v1',INTRO_KEY='thicket-campaign-intro-v1';
  const BALANCE={version:6,offlineCapSeconds:48*3600,levelGrowth:1.17,memoryPerUnit:.15,knownResearchDiscount:.03,knownSourceDiscount:.03,trainingMultiplier:1.005,trainingCostSeconds:120,maxLevel:10000,maxTraining:100000,maxNumber:1e240,costScale:1};
  const finite=(v,fallback=0)=>Number.isFinite(v)?Math.min(BALANCE.maxNumber,Math.max(0,v)):fallback;
  const PRODUCERS=[
    {id:'moss',name:'Светящийся мох',desc:'Первый свет под корнями',base:15,rate:5,icon:'leaf',unlock:null},
    {id:'roots',name:'Живые корни',desc:'Магия глубин',base:45,rate:20,icon:'tree',unlock:'moss'},
    {id:'mushrooms',name:'Грибной круг',desc:'Память лесной почвы',base:100,rate:50,icon:'mushroom',unlock:'rootsource'},
    {id:'inkwell',name:'Живые чернила',desc:'Знания возвращаются на страницы',base:4e6,rate:500,icon:'book',unlock:'archive'},
    {id:'cauldron',name:'Лунный котёл',desc:'Алхимия спокойного огня',base:4e7,rate:4000,icon:'flask',unlock:'ink10'},
    {id:'crystals',name:'Кристальный сад',desc:'Свет, выращенный в башне',base:6e8,rate:35000,icon:'spark',unlock:'alembic'},
    {id:'well',name:'Колодец звёзд',desc:'Память королевства под водой',base:1e10,rate:350000,icon:'portal',unlock:'road'},
    {id:'orchards',name:'Сумеречные сады',desc:'Семена ещё не наступившего утра',base:1e11,rate:2500000,icon:'leaf',unlock:'otter'},
    {id:'forges',name:'Кузницы рассвета',desc:'Мастера собирают свет для маяка',base:2e12,rate:25000000,icon:'tower',unlock:'springs'}
  ];
  const CREATURES=[
    {id:'moth',name:'Лунный мотылёк',type:'Дух света',icon:'moth',producer:'moss',multiplier:2,desc:'Помнит свет, которого ты ещё не видела.'},
    {id:'mossling',name:'Моховик',type:'Хранитель троп',icon:'mushroom',producer:'mushrooms',multiplier:2,desc:'В его маленьком саду хранятся дороги леса.'},
    {id:'snail',name:'Янтарная улитка',type:'Хранительница росы',icon:'leaf',producer:'mushrooms',multiplier:2,desc:'Оставляет на грибах росу из прошлого утра.'},
    {id:'fox',name:'Рыжая лисица',type:'Проводница к башне',icon:'fox',producer:'roots',multiplier:2,desc:'Находит безопасную тропу к башне в самой густой темноте.'},
    {id:'owl',name:'Чернильная сова',type:'Ночная разведчица',icon:'book',producer:'roots',multiplier:2,desc:'С высоты видит путь, который скрыт между деревьями.'},
    {id:'salamander',name:'Угольная саламандра',type:'Хранительница огня',icon:'flask',producer:'mushrooms',multiplier:2,desc:'Согревает грибной круг и никого не обжигает.'},
    {id:'bat',name:'Сумеречная крылатка',type:'Слушательница леса',icon:'moth',producer:'moss',multiplier:2,desc:'Слышит, где под землёй ещё живёт свет.'},
    {id:'mirrorcat',name:'Теневой кот',type:'Страж страниц',icon:'fox',producer:'inkwell',multiplier:3,desc:'Находит потерянные страницы в тенях башни.'},
    {id:'phoenix',name:'Пепельный феникс',type:'Сердце башни',icon:'spark',producer:'cauldron',multiplier:3,desc:'Собирает рассеянное тепло в новое пламя.'},
    {id:'deer',name:'Лесной олень',type:'Проводник чащи',icon:'deer',producer:'roots',multiplier:3,desc:'Уверенно ведёт спутников сквозь ночной лес.'},
    {id:'otter',name:'Звёздная выдра',type:'Хранительница колодца',icon:'portal',producer:'well',multiplier:2,desc:'Вытаскивает из воды отражения исчезнувших созвездий.'},
    {id:'raven',name:'Серебряный ворон',type:'Садовник сумерек',icon:'moth',producer:'orchards',multiplier:2,desc:'Прячет семена там, где однажды появится свет.'},
    {id:'dragon',name:'Медный дракон',type:'Мастер кузниц',icon:'flask',producer:'forges',multiplier:2,desc:'Выдувает из пламени линзы для маяка.'},
    {id:'crane',name:'Хрустальный журавль',type:'Проводник лучей',icon:'moth',producer:'crystals',multiplier:3,desc:'Направляет свет между далёкими башнями.'},
    {id:'unicorn',name:'Туманный единорог',type:'Страж источника',icon:'deer',producer:'well',multiplier:3,desc:'Его клятва связывает воду со светом рассвета.'}
  ];
  const node=(id,name,cost,requires,unlock,creature,extra={})=>({id,name,cost,requires,unlock,creature,icon:CREATURES.find(c=>c.id===creature)?.icon||'spark',desc:creature?`${CREATURES.find(c=>c.id===creature).name} помогает источнику «${PRODUCERS.find(p=>p.id===CREATURES.find(c=>c.id===creature).producer).name}»: ×${CREATURES.find(c=>c.id===creature).multiplier}.`:'Новые знания усиливают чащу.',...extra});
  const NODES=[
    node('light','Тихое сияние',150,null,'mushrooms','moth'),
    node('roots','Зов корней',700,'light','moss10',null,{desc:'Каждое касание приносит дополнительную ману.'}),
    node('spores','Грибные сны',50000,'roots','rootcall','mossling'),
    node('breath','Дыхание леса',250000,'spores','root10',null,{desc:'Все источники производят на 25% больше маны.'}),
    node('dew','Янтарная роса',1000000,'breath','breath','snail'),
    node('owl','Взгляд совы',3000000,'dew','firstspring','owl'),
    node('salamander','Тихий огонь',8000000,'owl','owl','salamander'),
    node('bat','Песня сумерек',20000000,'salamander','salamander','bat'),
    node('guardian','Доверие оленя',30000000,'bat','bat','deer'),
    node('tower','Окно башни',20000000,'guardian','guardian','fox'),
    node('mirrorcat','Теневые страницы',1e10,'tower','crystals','mirrorcat'),
    node('towerheart','Сердце башни',4e10,'mirrorcat','mirrorcat','phoenix'),
    node('otter','Отражения звёзд',8e11,'guardian','well','otter'),
    node('raven','Серебряные семена',3e12,'otter','orchards','raven'),
    node('dragon','Дыхание меди',3e13,'raven','forges','dragon'),
    node('crane','Крылья света',1e14,'dragon','dragon','crane'),
    node('unicorn','Клятва источника',3e14,'crane','crane','unicorn')
  ];
  const step=(id,chapter,title,type,extra={})=>({id,chapter,area:chapter==='Лес'?'forest':chapter==='Башня'?'tower':'kingdom',title,type,text:title+'.',after:title+' — новый шаг к рассвету.',...extra});
  const STORY_STEPS=[
    step('moss','Лес','Разбудить светящийся мох','producer',{target:'moss',text:'Рассвет исчез. Коснись сердца чащи 15 раз: мох начнёт сам собирать ману.',after:'Под корнями загорается первый свет. Теперь мана приходит сама.'}),
    step('rootsource','Лес','Оживить корни','producer',{target:'roots',after:'Под землёй проступает старая тропа.'}),
    step('mushrooms','Лес','Пробудить грибной круг','producer',{target:'mushrooms',after:'Три источника связаны. Открылось Древо открытий.'}),
    step('moth','Лес','Позвать лунного мотылька','research',{target:'light',after:'«Ты вернулась», — шепчет мотылёк. Он помнит тебя, хотя ты видишь его впервые.'}),
    step('moss10','Лес','Расширить светящуюся поляну','story',{cost:250,text:'Купи усиление за ману: светящийся мох будет собирать вдвое больше.',after:'Мох разрастается, и под землёй открывается новый путь.'}),
    step('rootcall','Лес','Услышать зов корней','research',{target:'roots',after:'Сердце отвечает на каждое прикосновение сильнее.'}),
    step('spores','Лес','Найти моховика','research',{target:'spores',after:'Моховик показывает тропу, спрятанную под грибными шляпками.'}),
    step('root10','Лес','Укрепить подземную тропу','story',{cost:50000,text:'Купи усиление за ману: живые корни будут собирать вдвое больше.',after:'Корни удерживают путь даже в густом тумане.'}),
    step('breath','Лес','Вернуть лесу дыхание','research',{target:'breath',after:'Все источники начинают работать в одном ритме.'}),
    step('firstspring','Лес','Собрать янтарную росу','research',{target:'dew',after:'Улитка хранит каплю рассвета. Значит, когда-то утро существовало.'}),
    step('owl','Лес','Встретить чернильную сову','research',{target:'owl',after:'Сова показывает тропу сквозь ночной лес.'}),
    step('salamander','Лес','Подружиться с саламандрой','research',{target:'salamander',after:'Саламандра согревает грибной круг.'}),
    step('bat','Лес','Услышать сумеречную крылатку','research',{target:'bat',after:'Крылатка находит слабые огоньки под землёй.'}),
    step('guardian','Лес','Встретить лесного оленя','research',{target:'guardian',after:'Олень выводит тебя к старой башне.'}),
    step('tower','Башня','Зажечь окно башни','research',{target:'tower',after:'Рыжая лисица находит разбитые часы. Мир возвращается к началу каждой эпохи.'}),
    step('firstEra','Башня','Пройти сквозь смену эпохи','rebirth',{after:'Ты снова в лесу. Встреченные существа узнают тебя. Открылись порталы.'}),
    step('archive','Башня','Восстановить архив','story',{cost:1e7,research:['tower'],after:'В архиве найден чертёж Маяка рассвета и первые живые чернила.'}),
    step('inkwell','Башня','Пробудить живые чернила','producer',{target:'inkwell',after:'На пустых страницах появляются имена жителей королевства.'}),
    step('ink10','Башня','Собрать первую книгу','story',{cost:1e12,text:'Купи книгу за ману: живые чернила будут собирать вдвое больше.',after:'Книга завершена. В ней найден рецепт безопасного огня.'}),
    step('cauldron','Башня','Зажечь лунный котёл','producer',{target:'cauldron',after:'Тихий огонь даёт башне новый источник маны.'}),
    step('alembic','Башня','Собрать световой перегонник','story',{cost:1e9,research:['salamander'],after:'В перегоннике появляется семя кристального сада.'}),
    step('crystals','Башня','Вырастить кристальный сад','producer',{target:'crystals',after:'Кристаллы хранят свет без огня.'}),
    step('mirrorcat','Башня','Вернуть зеркальные страницы','research',{target:'mirrorcat',after:'Кот приносит чертёж маяка из отражения разрушенной башни.'}),
    step('towerheart','Башня','Разбудить сердце башни','research',{target:'towerheart',after:'Пепельный феникс возвращает тепло в часы.'}),
    step('observatory','Башня','Открыть обсерваторию','story',{cost:1e11,research:['towerheart'],after:'Среди неподвижных звёзд обнаружен путь к королевству.'}),
    step('road','Королевство','Зажечь путевые огни','story',{cost:4e11,research:['guardian'],after:'За туманом проступают стены королевства и погасший маяк.'}),
    step('well','Королевство','Открыть колодец звёзд','producer',{target:'well',after:'В воде отражается небо до заклятия.'}),
    step('otter','Королевство','Вернуть отражения звёзд','research',{target:'otter',after:'Звёздная выдра собирает потерянные созвездия.'}),
    step('orchards','Королевство','Пробудить сумеречные сады','producer',{target:'orchards',after:'В садах впервые раскрываются бутоны.'}),
    step('raven','Королевство','Собрать серебряные семена','research',{target:'raven',after:'Ворон разносит семена по пустым дворам.'}),
    step('orchard25','Королевство','Вырастить сад королевства','story',{cost:1e27,text:'Купи восстановление сада за ману: сумеречные сады будут собирать вдвое больше.',after:'Сад возвращает жизнь в опустевшие дворы.'}),
    step('springs','Королевство','Восстановить водные пути','story',{cost:1e13,research:['raven'],after:'Вода приводит в движение колёса кузниц рассвета.'}),
    step('forges','Королевство','Разжечь кузницы рассвета','producer',{target:'forges',after:'Мастера начинают собирать каркас маяка.'}),
    step('dragon','Королевство','Позвать медного дракона','research',{target:'dragon',after:'Дракон выдувает первую линзу из чистого огня.'}),
    step('crane','Королевство','Соединить лучи света','research',{target:'crane',after:'Журавль связывает кристальный сад с маяком.'}),
    step('unicorn','Королевство','Принять клятву источника','research',{target:'unicorn',after:'Единорог обещает удержать поток света на границе эпох.'}),
    step('council','Маяк','Собрать хранителей','story',{cost:6e14,research:['unicorn'],collection:CREATURES.map(c=>c.id),after:'Пятнадцать спутников готовы помочь. Каждый принёс часть будущего утра.'}),
    step('foundation','Маяк','Поднять основание маяка','story',{cost:1e15,research:['tower','guardian'],after:'Лисица показывает место, моховик укрепляет землю. Основание выдерживает течение магии.'}),
    step('lanterns','Маяк','Зажечь кольцо фонарей','story',{cost:2e15,text:'Купи фонари за ману: кузницы будут собирать вдвое больше.',after:'Фонари удерживают свет вокруг башни маяка.'}),
    step('prism','Маяк','Собрать рассветную призму','story',{cost:4e15,research:['crane','dragon'],after:'Призма собирает девять потоков маны в один луч.'}),
    step('oath','Маяк','Связать свет с памятью','story',{cost:7e15,memory:1,research:['unicorn'],after:'Память сохраняет луч на границе эпох. Остался последний шаг.'}),
    step('dawn','Маяк','Зажечь Маяк рассвета','story',{cost:1e16,research:['guardian','unicorn'],after:'Впервые ночь заканчивается. Мотылёк садится тебе на ладонь: «Теперь мы можем идти дальше». Ты вернула миру рассвет.'})
  ];
  const THEMES=[{id:'moths',name:'Сад лунных мотыльков',short:'Мотыльки',icon:'moth',description:'Пробуди ночные цветы и собери лунный рой.',badges:['Первый кокон','Тихое сияние','Лунный рой']},{id:'potions',name:'Забытые зелья',short:'Зелья',icon:'flask',description:'Расшифруй рецепты башни и верни силу древним эликсирам.',badges:['Искра в колбе','Тайный рецепт','Великий эликсир']},{id:'giants',name:'Песнь каменных великанов',short:'Великаны',icon:'mountain',description:'Найди уснувших хранителей и разбуди их общей песней.',badges:['Голос камня','Память гор','Пробуждение']}];
  // Fixed economy data calibrated by shared-core simulations; no elapsed-time unlock conditions.
  const TUNING={
    producers:{inkwell:{base:560011150651,rate:1175234},cauldron:{base:119301193108581,rate:298051815},crystals:{base:2285661633784636200,rate:5040747819253},well:{base:6.313773175689833e24,rate:13560308340684780000},orchards:{base:5.334067189676753e26,rate:1.548001434000294e21},forges:{base:1.3247935720262987e30,rate:2.1201283541225154e24}},
    nodes:{mirrorcat:432270613691963150000,towerheart:8.326289748880975e21,otter:9.430203625657333e25,raven:1.1395063014916779e28,dragon:8.282230181535514e30,crane:1.3065931878266145e32,unicorn:4.74891911917858e32},
    story:{archive:163618342976,alembic:93692122698603780,observatory:6.069402259937787e22,road:2.0155176785107594e24,springs:7.698611677189128e28,council:6.302722740605403e33,foundation:4.93026644161494e34,lanterns:5.8401972499347186e35,prism:3.6812705148841573e36,oath:1.0211291723185451e37,dawn:1.0601051097340625e38}
  };
  // Later chapters are priced for repeated eras; the first forest cycle keeps its own curve.
  const LATE_COST_SCALE=.12,FOREST_STORY=new Set(['moss10','root10']),EARLY_NODES=new Set(['light','roots','spores','breath','dew','owl','salamander','bat','guardian','tower']),EARLY_PACE_NODES=new Set(['spores','breath','dew','owl','salamander','bat','guardian','tower']);
  for(const p of PRODUCERS){if(TUNING.producers[p.id])Object.assign(p,TUNING.producers[p.id]);if(['inkwell','cauldron','crystals','well','orchards','forges'].includes(p.id))p.base*=LATE_COST_SCALE;}
  for(const n of NODES){if(TUNING.nodes[n.id])n.cost=TUNING.nodes[n.id];if(EARLY_PACE_NODES.has(n.id))n.cost*=8;if(!EARLY_NODES.has(n.id))n.cost*=LATE_COST_SCALE;n.chapter=STORY_STEPS.find(st=>st.target===n.id&&st.type==='research')?.chapter||'Лес';}
  for(const st of STORY_STEPS){if(TUNING.story[st.id])st.cost=TUNING.story[st.id];if(st.type==='story'&&!FOREST_STORY.has(st.id))st.cost*=LATE_COST_SCALE;}
  const eventState=()=>({progress:0,badges:[0,0,0],activeBonus:0,finished:false,round:1});
  const fresh=(now=0)=>({version:3,balanceVersion:BALANCE.version,mana:0,totalEarned:0,lifetimeEarned:0,memory:0,memoryClaimed:0,era:1,producers:Object.fromEntries(PRODUCERS.map(p=>[p.id,0])),training:Object.fromEntries(PRODUCERS.map(p=>[p.id,0])),research:[],collection:[],story:{completed:[],history:[],seenScenes:[],recapPending:false,legacy:false},events:Object.fromEntries(THEMES.map(t=>[t.id,eventState()])),lastSaved:finite(now)});
  const hasStep=(s,id)=>s.story.completed.includes(id),producerById=id=>typeof id==='string'?PRODUCERS.find(p=>p.id===id):id;
  const prerequisites=n=>[n?.requires].filter(Boolean),missingResearch=(s,n)=>prerequisites(n).filter(id=>!s.research.includes(id));
  function syncStory(s){
    s.story.history=[...new Set([...s.story.history,...s.research])];
    for(const n of NODES)if(s.research.includes(n.id)&&n.creature&&!s.collection.includes(n.creature))s.collection.push(n.creature);
    for(const st of STORY_STEPS){if(hasStep(s,st.id))continue;let done=false;
      if(st.type==='producer')done=s.producers[st.target]>=(st.level||1);
      if(st.type==='research')done=(st.targets||[st.target]).every(id=>s.research.includes(id));
      if(st.type==='rebirth')done=s.era>1;
      if(!done)break;s.story.completed.push(st.id);
    }return s;
  }
  function normalize(raw,now=0){
    if(!raw||raw.version!==3)return fresh(now);const base=fresh(now),s={...base};
    for(const k of ['mana','totalEarned','lifetimeEarned','memory','memoryClaimed','lastSaved'])s[k]=finite(raw[k]);
    s.era=Math.max(1,Math.floor(finite(raw.era,1)));s.producers=Object.fromEntries(PRODUCERS.map(p=>[p.id,Math.min(BALANCE.maxLevel,Math.floor(finite(raw.producers?.[p.id])))]));
    s.training=Object.fromEntries(PRODUCERS.map(p=>[p.id,Math.min(BALANCE.maxTraining,Math.floor(finite(raw.training?.[p.id])))]));
    s.research=[...new Set((raw.research||[]).filter(id=>NODES.some(n=>n.id===id)))];s.collection=[...new Set((raw.collection||[]).filter(id=>CREATURES.some(c=>c.id===id)))];
    const hasSceneHistory=Array.isArray(raw.story?.seenScenes);
    s.story={completed:[...new Set((raw.story?.completed||[]).filter(id=>STORY_STEPS.some(st=>st.id===id)))],history:[...new Set((raw.story?.history||[]).filter(id=>NODES.some(n=>n.id===id)))],seenScenes:hasSceneHistory?[...new Set(raw.story.seenScenes.filter(id=>typeof id==='string'))]:[],recapPending:hasSceneHistory&&!!raw.story.recapPending,legacy:false};
    s.events=Object.fromEntries(THEMES.map(t=>{const e=raw.events?.[t.id]||{};return[t.id,{...e,progress:Math.min(9,Math.floor(finite(e.progress))),badges:[0,1,2].map(i=>Math.floor(finite(e.badges?.[i]))),activeBonus:finite(e.activeBonus),finished:!!e.finished,round:Math.max(1,Math.floor(finite(e.round,1)))}];}));
    if(raw.eventSchedule&&typeof raw.eventSchedule==='object')s.eventSchedule={...raw.eventSchedule};
    if((raw.balanceVersion||1)<2&&s.story.completed.includes('firstEra')){
      for(const id of ['owl','salamander','bat','guardian'])if(!s.story.completed.includes(id))s.story.completed.push(id);
      for(const id of ['owl','salamander','bat','deer'])if(!s.collection.includes(id))s.collection.push(id);
    }
    if((raw.balanceVersion||1)<3){
      for(const [id,producer,level] of [['moss10','moss',10],['root10','roots',10],['ink10','inkwell',3],['orchard25','orchards',3]])
        if(s.producers[producer]>=level&&!s.story.completed.includes(id))s.story.completed.push(id);
    }
    s.balanceVersion=BALANCE.version;syncStory(s);
    if(!hasSceneHistory&&s.story.completed.length){s.story.seenScenes=['prologue',...s.story.completed];s.story.recapPending=true;}
    return s;
  }
  function unlocks(s){return{producers:PRODUCERS.filter(p=>!p.unlock||hasStep(s,p.unlock)).map(p=>p.id),tree:hasStep(s,'mushrooms'),creatures:hasStep(s,'moth'),bulkBuy:hasStep(s,'moth'),training:hasStep(s,'moth'),portals:hasStep(s,'firstEra'),rebirth:hasStep(s,'tower')};}
  const visibleProducers=s=>PRODUCERS.filter(p=>unlocks(s).producers.includes(p.id));
  const visibleResearch=s=>unlocks(s).tree?NODES.filter(n=>s.research.includes(n.id)||((!n.unlock||hasStep(s,n.unlock))&&!missingResearch(s,n).length)||s.story.history.includes(n.id)):[];
  const creatureActive=(s,c)=>s.research.includes(NODES.find(n=>n.creature===c.id)?.id),producerHelpers=(s,id)=>CREATURES.filter(c=>c.producer===producerById(id)?.id&&creatureActive(s,c));
  const producerMultiplier=(s,id)=>producerHelpers(s,id).reduce((v,c)=>v*c.multiplier,1);
  const STORY_BOOSTS={moss:'moss10',roots:'root10',inkwell:'ink10',orchards:'orchard25',forges:'lanterns'};
  const storyBoost=(s,id)=>hasStep(s,STORY_BOOSTS[id])?2:1;
  const levelMultiplier=level=>level<10?1:level<25?2:2**(1+Math.floor(level/25));
  const factor=s=>1+s.memory*BALANCE.memoryPerUnit;
  const producerUnitIncome=(s,id)=>{const p=producerById(id);return p?finite(p.rate*factor(s)*(s.research.includes('breath')?1.25:1)*producerMultiplier(s,p)*storyBoost(s,p.id)*levelMultiplier(s.producers[p.id])*BALANCE.trainingMultiplier**(s.training?.[p.id]||0),BALANCE.maxNumber):0;};
  const producerIncome=(s,id)=>{const p=producerById(id);return p?finite((s.producers[p.id]||0)*producerUnitIncome(s,p)):0;};
  const income=s=>finite(PRODUCERS.reduce((v,p)=>v+producerIncome(s,p),0));
  const tapValue=s=>finite((1+Number(s.research.includes('roots')))*factor(s));
  const sourceCost=(s,p,level)=>{const known=s.era>1&&level===0&&STORY_STEPS.some(st=>st.type==='producer'&&st.target===p.id&&hasStep(s,st.id));return finite(Math.ceil(p.base*BALANCE.levelGrowth**level*BALANCE.costScale*(known?BALANCE.knownSourceDiscount:1)),BALANCE.maxNumber);};
  const cost=(s,id)=>{const p=producerById(id);return p?sourceCost(s,p,s.producers[p.id]):BALANCE.maxNumber;};
  function quotePurchase(s,id,mode=1){const p=producerById(id);if(!p||!unlocks(s).producers.includes(p.id))return{quantity:0,cost:0,affordable:false,beforeIncome:0,afterIncome:0,nextLevel:0};
    const level=s.producers[p.id],limit=mode==='max'?BALANCE.maxLevel-level:Math.min(mode===10?10:1,BALANCE.maxLevel-level);let sum=0,quantity=0;
    for(let i=0;i<limit;i++){const item=sourceCost(s,p,level+i);if(mode==='max'&&sum+item>s.mana)break;sum=finite(sum+item);quantity++;}
    const copy={...s,producers:{...s.producers,[p.id]:level+quantity}};return{quantity,cost:sum,affordable:quantity>0&&s.mana>=sum,beforeIncome:producerIncome(s,p),afterIncome:producerIncome(copy,p),nextLevel:level+quantity};
  }
  function buy(s,id,mode=1){const q=quotePurchase(s,id,mode);if(!q.affordable)return false;s.mana-=q.cost;s.producers[id]=q.nextLevel;syncStory(s);return true;}
  function trainingQuote(s,id){const p=producerById(id),level=s.training?.[p?.id]||0,beforeIncome=p?producerIncome(s,p):0,afterIncome=finite(beforeIncome*BALANCE.trainingMultiplier,BALANCE.maxNumber),price=finite(Math.ceil(beforeIncome*BALANCE.trainingCostSeconds),BALANCE.maxNumber),available=!!p&&unlocks(s).training&&s.producers[p.id]>0&&level<BALANCE.maxTraining&&afterIncome>beforeIncome;
    return{level,cost:price,affordable:available&&s.mana>=price,available,beforeIncome,afterIncome,multiplier:BALANCE.trainingMultiplier};}
  function train(s,id){const q=trainingQuote(s,id);if(!q.affordable)return false;s.mana-=q.cost;s.training[id]++;return true;}
  function nextMilestone(s,id){const p=producerById(id),level=p?s.producers[p.id]:0;if(!p||level>=BALANCE.maxLevel)return null;const next=level<10?10:level<25?25:Math.min(BALANCE.maxLevel,(Math.floor(level/25)+1)*25),prior=level<10?0:level<25?10:Math.floor(level/25)*25;return{level:next,currentLevel:level,remaining:next-level,multiplier:2,progress:(level-prior)/(next-prior)};}
  const researchCost=(s,n)=>finite(Math.ceil(n.cost*BALANCE.costScale*(s.story.history.includes(n.id)?BALANCE.knownResearchDiscount:1)));
  function researchStatus(s,id){const n=NODES.find(v=>v.id===id);if(!n)return{allowed:false,reason:'unknown',cost:0};const price=researchCost(s,n);
    if(s.research.includes(id))return{allowed:false,reason:'complete',cost:price};if(!unlocks(s).tree||(!s.story.history.includes(id)&&n.unlock&&!hasStep(s,n.unlock)))return{allowed:false,reason:'story',id:n.unlock,cost:price};
    const missing=missingResearch(s,n)[0];if(missing)return{allowed:false,reason:'research',id:missing,cost:price};return{allowed:s.mana>=price,reason:s.mana>=price?'ready':'mana',cost:price};
  }
  function research(s,id){const status=researchStatus(s,id);if(!status.allowed)return false;s.mana-=status.cost;s.research.push(id);syncStory(s);return true;}
  const memoryPotential=s=>Math.floor(Math.log2(1+finite(s.lifetimeEarned)/10000));
  const rebirthReward=s=>Math.max(0,memoryPotential(s)-s.memoryClaimed);
  const canRebirth=s=>unlocks(s).rebirth&&s.research.includes('tower')&&rebirthReward(s)>0;
  function rebirth(s){if(!canRebirth(s))return false;const gain=rebirthReward(s);s.memory+=gain;s.memoryClaimed+=gain;s.era++;s.mana=0;s.totalEarned=0;s.producers=Object.fromEntries(PRODUCERS.map(p=>[p.id,0]));s.training=Object.fromEntries(PRODUCERS.map(p=>[p.id,0]));s.research=[];syncStory(s);return gain;}
  function researchGoal(s,id){const n=NODES.find(v=>v.id===id),missing=missingResearch(s,n);return missing.length?researchGoal(s,missing[0]):{type:'research',id};}
  function storyActionStatus(s,id){const st=STORY_STEPS.find(v=>v.id===id),index=STORY_STEPS.indexOf(st);if(!st||st.type!=='story')return{allowed:false,reason:'unknown',cost:0};const price=finite(st.cost*BALANCE.costScale);
    if(hasStep(s,id))return{allowed:false,reason:'complete',cost:price};const earlier=STORY_STEPS.slice(0,index).find(v=>!hasStep(s,v.id));if(earlier)return{allowed:false,reason:'story',id:earlier.id,cost:price};
    return{allowed:s.mana>=price,reason:s.mana>=price?'ready':'mana',cost:price};
  }
  function storyAction(s,id){const st=storyActionStatus(s,id);if(!st.allowed)return false;s.mana-=st.cost;s.story.completed.push(id);syncStory(s);return true;}
  function nextGoal(s){const st=STORY_STEPS.find(v=>!hasStep(s,v.id));if(!st)return{type:'complete',id:'dawn',step:'dawn'};let goal;
    if(st.type==='producer')goal={type:'producer',id:st.target,level:st.level||1};
    if(st.type==='research')goal=researchGoal(s,(st.targets||[st.target]).find(id=>!s.research.includes(id))||st.target);
    if(st.type==='rebirth')goal=canRebirth(s)?{type:'rebirth'}:researchGoal(s,'tower');
    if(st.type==='story')goal={type:'story',id:st.id};
    if(!income(s)&&(goal.type!=='producer'||goal.id!=='moss'))goal={type:'producer',id:'moss',level:1,rebuilding:true};return{...goal,step:st.id};
  }
  function nextReward(s){const st=STORY_STEPS.find(v=>!hasStep(s,v.id))||STORY_STEPS.at(-1),n=NODES.find(n=>n.id===st.target&&st.type==='research'),c=CREATURES.find(c=>c.id===n?.creature),newSource=PRODUCERS.find(p=>p.unlock===st.id);let description=st.text;
    if(c)description=`Новый спутник: ${c.name}. ${producerById(c.producer).name} ×${c.multiplier}.`;
    else if(st.type==='producer')description=`${producerById(st.target).name}: ${st.level?`уровень ${st.level}, больше собственной маны`:'новый источник постоянной маны'}.`;
    else if(st.type==='rebirth')description='Память усилит новый заход. Откроются отдельные события в порталах.';
    else if(newSource)description=`Откроется новый источник: ${newSource.name}.`;
    else if(st.id==='dawn')description='Финал основной истории: рассвет вернётся в королевство.';
    else if(n)description=n.desc;
    return{kind:st.type,id:st.id,title:st.title,description};}
  function earn(s,amount){const gain=finite(amount);s.mana=finite(s.mana+gain);s.totalEarned=finite(s.totalEarned+gain);s.lifetimeEarned=finite(s.lifetimeEarned+gain);return gain;}
  const offlineReward=(s,seconds)=>{const actual=Math.min(BALANCE.offlineCapSeconds,finite(seconds));return{seconds:actual,gain:finite(income(s)*actual),capReached:finite(seconds)>BALANCE.offlineCapSeconds};};
  function tick(s,seconds,options={}){const amount=options.offline?offlineReward(s,seconds).gain:finite(income(s)*finite(seconds));return earn(s,amount);}
  const tap=(s,count=1)=>earn(s,tapValue(s)*Math.min(1000000,Math.floor(finite(count))));
  const badgeBonus=e=>finite(e.badges.reduce((v,n,i)=>v+n*[5,10,15][i],0));
  function advance(e){if(e.finished||e.progress>=9)return false;e.progress++;return true;}
  function finish(e){if(e.finished)return false;[3,6,9].forEach((v,i)=>{if(e.progress>=v)e.badges[i]++});e.finished=true;return true;}
  function next(e){if(!e.finished)return false;e.progress=0;e.finished=false;e.activeBonus=badgeBonus(e);e.round++;return true;}
  function auditState(s){const errors=[];function visit(value,path){if(typeof value==='number'&&(!Number.isFinite(value)||value<0))errors.push(path);else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>visit(v,`${path}.${k}`));}visit(s,'state');return{ok:errors.length===0,errors};}
  return{SAVE_KEY,INTRO_KEY,BALANCE,PRODUCERS,NODES,CREATURES,STORY_STEPS,THEMES,fresh,normalize,syncStory,hasStep,unlocks,visibleProducers,visibleResearch,producerById,prerequisites,missingResearch,creatureActive,producerHelpers,producerMultiplier,producerUnitIncome,producerIncome,income,factor,tapValue,cost,quotePurchase,buy,trainingQuote,train,nextMilestone,levelMultiplier,researchCost,researchStatus,research,rebirthReward,canRebirth,rebirth,storyActionStatus,storyAction,nextGoal,nextReward,offlineReward,tick,tap,badgeBonus,advance,finish,next,auditState};
});
