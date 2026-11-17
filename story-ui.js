(() => {
  'use strict';
  const scenes = [
    {
      id: 'prologue', after: null, chapter: 'ПРОЛОГ · ЛЕС', title: 'Солнце не взошло',
      text: 'Чаща живёт в бесконечной ночи. Под корнями ещё бьётся её сердце — последний источник света.',
      purpose: 'Собирай ману, пробуждай источники и найди Маяк рассвета. Он может вернуть миру утро.',
      art: 'story-prologue.webp'
    },
    {
      id: 'moth', after: 'moth', chapter: 'ГЛАВА I · ЛЕС', title: 'Он тебя помнит',
      text: '«Ты вернулась», — шепчет лунный мотылёк. Он узнаёт тебя, хотя вы встретились впервые.',
      purpose: 'Почему он помнит прошлую встречу? Следуй за обитателями чащи к старой башне.',
      art: 'story-moth.webp'
    },
    {
      id: 'tower', after: 'tower', chapter: 'ГЛАВА II · БАШНЯ', title: 'Часы идут по кругу',
      text: 'Стрелки башни снова и снова возвращаются к полуночи. Поэтому рассвет не наступает: мир застрял в повторяющейся эпохе.',
      purpose: 'Ты можешь начать новый круг и сохранить память. Она поможет добраться дальше.',
      art: 'story-clock.webp'
    },
    {
      id: 'firstEra', after: 'firstEra', chapter: 'ГЛАВА II · НОВАЯ ЭПОХА', title: 'Ты помнишь',
      text: 'Лес вернулся к началу. Мана и источники исчезли, но память о башне и встреченных друзьях осталась с тобой.',
      purpose: 'С каждым новым кругом восстанавливай силу и ищи способ остановить часы навсегда.',
      art: 'story-prologue.webp'
    },
    {
      id: 'archive', after: 'archive', chapter: 'ГЛАВА II · АРХИВ', title: 'Чертёж рассвета',
      text: 'В архиве найден чертёж Маяка. Его свет способен разорвать повторение ночи.',
      purpose: 'Для этого понадобятся живые источники, помощь существ и память пережитых эпох. Путь ведёт в королевство.',
      art: 'story-clock.webp'
    },
    {
      id: 'road', after: 'road', chapter: 'ГЛАВА III · КОРОЛЕВСТВО', title: 'Маяк погас',
      text: 'За туманом открылось королевство. На дальней скале стоит Маяк рассвета, но в его окнах нет света.',
      purpose: 'Верни жизнь источникам королевства и собери луч, который зажжёт Маяк.',
      art: 'story-beacon.webp'
    },
    {
      id: 'dawn', after: 'dawn', chapter: 'ФИНАЛ · РАССВЕТ', title: 'Первое утро',
      text: 'Маяк зажёгся. Впервые за много эпох ночь закончилась, а башенные часы пошли вперёд.',
      purpose: 'Ты вернула миру рассвет. Основная история завершена, но чаща и её обитатели остаются с тобой.',
      art: 'forest-clean.png'
    }
  ];
  const overlay = document.createElement('div');
  overlay.id = 'story-overlay';
  overlay.className = 'story-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'story-scene-title');
  overlay.setAttribute('aria-describedby', 'story-scene-text');
  overlay.hidden = true;
  document.querySelector('.phone').append(overlay);

  function recap(state) {
    const done = id => state.story.completed.includes(id);
    if (done('dawn')) return {
      id: 'recap', chapter: 'ИСТОРИЯ · ГДЕ ТЫ СЕЙЧАС', title: 'Рассвет вернулся',
      text: 'Ты прошла повторяющиеся эпохи, собрала союзников и зажгла Маяк. Башенные часы больше не возвращаются к полуночи.',
      purpose: 'Основная история завершена. Исследовать чащу и её события можно дальше.',
      art: 'forest-clean.png'
    };
    if (done('road')) return {
      id: 'recap', chapter: 'ИСТОРИЯ · ГДЕ ТЫ СЕЙЧАС', title: 'Путь к Маяку',
      text: 'Рассвет исчез, а мир повторяет одни и те же эпохи. Ты сохранила память, нашла союзников и добралась до королевства.',
      purpose: 'Теперь нужно оживить погасший Маяк. Твой следующий шаг показан на экране мира.',
      art: 'story-beacon.webp'
    };
    if (done('archive')) return {
      id: 'recap', chapter: 'ИСТОРИЯ · ГДЕ ТЫ СЕЙЧАС', title: 'Чертёж Маяка',
      text: 'Башенные часы возвращают мир к началу эпохи. В архиве ты нашла чертёж Маяка, который может разорвать этот круг.',
      purpose: 'Восстанови силу башни и найди дорогу в королевство.',
      art: 'story-clock.webp'
    };
    if (done('tower')) return {
      id: 'recap', chapter: 'ИСТОРИЯ · ГДЕ ТЫ СЕЙЧАС', title: 'Тайна башни',
      text: 'Рассвет не приходит, потому что башенные часы возвращают мир к началу эпохи. Память о пройденном остаётся с тобой.',
      purpose: 'Ищи в башне способ разорвать круг и добраться до Маяка рассвета.',
      art: 'story-clock.webp'
    };
    return {
      id: 'recap', chapter: 'ИСТОРИЯ · ГДЕ ТЫ СЕЙЧАС', title: 'Ночь над чащей',
      text: 'Солнце исчезло. Ты собираешь ману и будишь обитателей леса, чтобы найти путь к старой башне.',
      purpose: 'За башней скрыта причина бесконечной ночи. Твой следующий шаг показан на экране мира.',
      art: done('moth') ? 'story-moth.webp' : 'story-prologue.webp'
    };
  }

  function pending(state) {
    if (state.story.recapPending) return recap(state);
    return scenes.find(scene => !state.story.seenScenes.includes(scene.id) && (!scene.after || state.story.completed.includes(scene.after)));
  }

  function display(scene, state, onViewed, replay = false) {
    if (!overlay.hidden) return;
    overlay.innerHTML = `<img class="story-scene-art" src="${scene.art}" alt="" aria-hidden="true"><div class="story-scene-shade"></div><div class="story-scene-copy"><p class="story-scene-chapter">${scene.chapter}</p><h2 id="story-scene-title">${scene.title}</h2><p id="story-scene-text">${scene.text}</p><p class="story-scene-purpose">${scene.purpose}</p><button id="story-continue" type="button">Продолжить <span aria-hidden="true">→</span></button></div>`;
    overlay.hidden = false;
    document.querySelector('#game-shell').inert = true;
    const button = overlay.querySelector('#story-continue');
    button.focus();
    button.addEventListener('click', () => {
      if (!replay) {
        if (!state.story.seenScenes.includes(scene.id)) state.story.seenScenes.push(scene.id);
        if (scene.id === 'recap') state.story.recapPending = false;
        onViewed();
      }
      overlay.hidden = true;
      overlay.replaceChildren();
      document.querySelector('#game-shell').inert = false;
      if (!replay) showPending(state, onViewed);
      if (overlay.hidden) document.querySelector('#screen').focus();
    });
  }

  function showPending(state, onViewed) {
    if (!overlay.hidden || document.querySelector('#sheet-overlay').classList.contains('visible')) return;
    const scene = pending(state);
    if (scene) display(scene, state, onViewed);
  }
  function replay(id, state) {
    const scene = scenes.find(item => item.id === id);
    if (scene && state.story.seenScenes.includes(id)) display(scene, state, () => {}, true);
  }
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault();
      overlay.querySelector('#story-continue')?.focus();
    }
  });
  window.ThicketStoryUI = { showPending, replay, scenes };
})();
