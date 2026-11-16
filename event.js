(() => {
  'use strict';
  const thresholds = [3, 6, 9];
  const weights = [5, 10, 15];
  const createState = () => ({ progress: 0, earned: [0, 0, 0], currentBonus: 0, completed: false, round: 1 });
  const pending = state => thresholds.map(value => Number(state.progress >= value));
  const weighted = counts => counts.reduce((total, count, index) => total + count * weights[index], 0);
  const nextBonus = state => weighted(state.earned) + (state.completed ? 0 : weighted(pending(state)));
  function finishRun(state) {
    if (state.completed) return false;
    pending(state).forEach((count, index) => { state.earned[index] += count; });
    state.completed = true;
    return true;
  }
  function startNext(state) {
    if (!state.completed) return false;
    state.currentBonus = weighted(state.earned);
    state.progress = 0;
    state.completed = false;
    state.round += 1;
    return true;
  }
  // The model can be checked with Node without a browser or third-party libraries.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createState, pending, nextBonus, finishRun, startNext };
  }
  if (typeof document === 'undefined') return;
  const root = document.getElementById('event-lab');
  if (!root) return;

  const themes = [
    { id: 'moths', title: 'Мотыльки', name: 'Сад лунных мотыльков', detail: 'Пробуди коконы, вырасти ночные цветы и собери лунный рой.', badges: ['Первый кокон', 'Тихое сияние', 'Лунный рой'], mark: '✧' },
    { id: 'potions', title: 'Зелья', name: 'Забытые зелья', detail: 'Расшифруй рецепты башни и верни силу древним эликсирам.', badges: ['Искра в колбе', 'Тайный рецепт', 'Великий эликсир'], mark: '◈' },
    { id: 'giants', title: 'Великаны', name: 'Песнь каменных великанов', detail: 'Найди уснувших хранителей и разбуди их общей песней.', badges: ['Голос камня', 'Память гор', 'Пробуждение'], mark: '△' }
  ];
  let states = Object.fromEntries(themes.map(theme => [theme.id, createState()]));
  let selected = themes[0].id;
  root.classList.add('evlab');
  root.innerHTML = `
    <div class="evlab-tabs" role="group" aria-label="Тема примера события">
      ${themes.map(theme => `<button class="evlab-tab" type="button" data-event-theme="${theme.id}" aria-pressed="false">${theme.title}</button>`).join('')}
    </div>
    <div class="evlab-heading"><div><p class="evlab-eyebrow" id="evlab-round"></p><h3 id="evlab-title"></h3></div><span class="evlab-theme-mark" aria-hidden="true"></span></div>
    <p class="evlab-description" id="evlab-description"></p>
    <div class="evlab-slider-label"><label for="evlab-progress">Пройдено этапов</label><output id="evlab-progress-output" for="evlab-progress">0 / 9</output></div>
    <input id="evlab-progress" class="evlab-range" type="range" min="0" max="9" step="1" value="0" aria-describedby="evlab-slider-help">
    <div class="evlab-track" aria-label="Девять этапов; значки на третьем, шестом и девятом">
      ${Array.from({ length: 9 }, (_, i) => `<span class="evlab-step${thresholds.includes(i + 1) ? ' is-badge' : ''}" data-event-step="${i + 1}"><span>${i + 1}</span>${thresholds.includes(i + 1) ? '<small aria-hidden="true">✦</small>' : '<small aria-hidden="true">·</small>'}</span>`).join('')}
    </div>
    <p class="evlab-help" id="evlab-slider-help">Передвигай ползунок в обе стороны: это позволяет примерить разный результат захода.</p>
    <div class="evlab-stats">
      <div><span>Бонус сейчас</span><strong id="evlab-current">+0%</strong><small>От прошлых заходов</small></div>
      <div><span>Значки этого захода</span><strong id="evlab-gained">0 / 3</strong><small id="evlab-gained-detail">Пока не получены</small></div>
      <div class="evlab-next-stat"><span>В следующий заход</span><strong id="evlab-next">+0%</strong><small>В этой же теме</small></div>
    </div>
    <div class="evlab-badges" aria-label="Значки и накопленные экземпляры"></div>
    <div class="evlab-actions"><button class="evlab-primary" id="evlab-action" type="button">Завершить заход</button><button class="evlab-reset" id="evlab-reset" type="button">Сбросить пример</button></div>
    <p class="evlab-status" id="evlab-status" role="status" aria-live="polite" aria-atomic="true"></p>
    <p class="evlab-disclaimer">Интерактивная модель. Этапы и проценты — проектный пример, баланс ещё подберём. Здесь нет работающего расписания и реального игрового прогресса. Обновление страницы сбрасывает пример.</p>`;

  const find = selector => root.querySelector(selector);
  const range = find('#evlab-progress');
  const action = find('#evlab-action');
  const status = find('#evlab-status');
  function render(message) {
    const theme = themes.find(item => item.id === selected);
    const state = states[selected];
    const gains = pending(state);
    root.querySelectorAll('[data-event-theme]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.eventTheme === selected));
    });
    find('#evlab-round').textContent = `Заход ${state.round}${state.completed ? ' · завершён' : ' · пробуем результат'}`;
    find('#evlab-title').textContent = theme.name;
    find('#evlab-description').textContent = theme.detail;
    find('.evlab-theme-mark').textContent = theme.mark;
    range.value = state.progress;
    range.disabled = state.completed;
    range.setAttribute('aria-valuetext', `${state.progress} из 9 этапов; значков: ${gains.reduce((a, b) => a + b, 0)} из 3`);
    find('#evlab-progress-output').textContent = `${state.progress} / 9`;
    root.querySelectorAll('[data-event-step]').forEach(step => {
      step.classList.toggle('is-reached', Number(step.dataset.eventStep) <= state.progress);
    });
    find('#evlab-current').textContent = `+${state.currentBonus}%`;
    find('#evlab-gained').textContent = `${gains.reduce((a, b) => a + b, 0)} / 3`;
    find('#evlab-gained-detail').textContent = state.completed ? 'Уже добавлены в коллекцию' : 'Будут получены при завершении';
    find('#evlab-next').textContent = `+${nextBonus(state)}%`;
    find('.evlab-badges').innerHTML = theme.badges.map((name, i) => `
      <div class="evlab-badge${gains[i] ? ' is-unlocked' : ''}">
        <span class="evlab-medal" aria-hidden="true">${['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}</span>
        <div><b>${name}</b><span>Этап ${thresholds[i]} · +${weights[i]}% за экземпляр</span><small>В коллекции: ${state.earned[i]}${!state.completed && gains[i] ? ' · ещё 1 в этом заходе' : ''}</small></div>
      </div>`).join('');
    action.textContent = state.completed ? 'Начать следующий заход' : 'Завершить заход';
    find('#evlab-slider-help').textContent = state.completed
      ? 'Награды этого захода уже начислены. Следующий начнётся с нуля и с накопленным бонусом.'
      : 'Передвигай ползунок в обе стороны: это позволяет примерить разный результат захода.';
    status.textContent = message || (state.completed
      ? 'Коллекция сохранена. Новые значки ускорят следующий заход этой темы.'
      : `В текущем заходе действует +${state.currentBonus}%. При таком результате в следующем будет +${nextBonus(state)}%.`);
  }
  root.querySelectorAll('[data-event-theme]').forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.eventTheme;
    render(`Выбрана тема «${themes.find(theme => theme.id === selected).title}». У каждой темы своя коллекция значков.`);
  }));
  range.addEventListener('input', () => {
    const state = states[selected];
    if (state.completed) return;
    state.progress = Math.min(9, Math.max(0, Math.round(Number(range.value) || 0)));
    render();
  });
  action.addEventListener('click', () => {
    const state = states[selected];
    if (state.completed) {
      startNext(state);
      render(`Начат заход ${state.round}. Этапы сброшены. Накопленный бонус +${state.currentBonus}% уже действует.`);
    } else {
      const count = pending(state).reduce((a, b) => a + b, 0);
      finishRun(state);
      render(`Заход завершён. Добавлено значков: ${count}. В следующий заход этой темы бонус составит +${nextBonus(state)}%.`);
    }
  });
  find('#evlab-reset').addEventListener('click', () => {
    states = Object.fromEntries(themes.map(theme => [theme.id, createState()]));
    render('Пример сброшен во всех трёх темах. Можно начать заново.');
  });
  render();
})();
