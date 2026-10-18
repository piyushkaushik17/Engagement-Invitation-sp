'use strict';

const EVENT = Object.freeze({
  title: 'Samridhi & Piyush — Engagement Ceremony',
  startDate: '20261128',
  startsAt: '2026-11-28T10:00:00+05:30',
  calendarStart: '20261128T043000Z',
  timing: '10:00 AM onwards, India Standard Time',
  dayEnd: '2026-11-29T00:00:00+05:30',
  venue: 'The Cove, Sector 5, Panchkula, Haryana, India',
  map: 'https://maps.app.goo.gl/BYGhpzSYVJ5wRxBEA'
});

const root = document.documentElement;
const envelopeScreen = document.getElementById('envelope-screen');
const invitation = document.getElementById('invitation');
const openButton = document.getElementById('open-envelope');
const story = document.getElementById('story');
const scroller = document.getElementById('story-scroll');
const stage = document.getElementById('story-stage');
const scenes = [...document.querySelectorAll('[data-scene]')];
const dots = [...document.querySelectorAll('.chapter-dots [data-chapter]')];
const chapterNames = ['The beginning', 'A glimpse of us', 'Our families', 'The celebration', 'With love'];
const music = document.getElementById('background-music');
const film = document.getElementById('film-dialog');
const video = document.getElementById('invitation-video');
const calendarDialog = document.getElementById('calendar-dialog');
const nativeTimeline = CSS.supports('animation-timeline: scroll()');
root.classList.toggle('has-scroll-timeline', nativeTimeline);
const motionEnabled = true;
let isOpen = false;
let opening = false;
let activeChapter = -1;
let renderedPosition = 0;
let chapterStep = 0;
let readerMode = false;
let frame = 0;
let focusChapter = null;
let openingTimer;
let departureTimer;
let entranceTimer;
let toastTimer;
let musicWanted = false;
let musicPending = false;
let musicAttempt = null;
let musicNoticeShown = false;
let volumeFrame = 0;
let showerTimer;
let reunionTimer;

document.body.classList.add('locked');
invitation.inert = true;
const guest = new URLSearchParams(location.search).get('to')?.trim().slice(0, 80);
if (guest) document.getElementById('guest-line').textContent = `Especially for ${guest}`;

function notify(message) {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 5500);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function activateChapter(index) {
  if (index === activeChapter) return;
  const focusedScene = scenes.find(scene => scene.contains(document.activeElement));
  activeChapter = index;
  scenes.forEach((scene, sceneIndex) => {
    const active = sceneIndex === index;
    scene.classList.toggle('is-active', active);
    scene.inert = !active && !readerMode;
    scene.setAttribute('aria-hidden', String(!active && !readerMode));
  });
  dots.forEach((dot, dotIndex) => {
    if (dotIndex === index) dot.setAttribute('aria-current', 'step');
    else dot.removeAttribute('aria-current');
  });
  if (focusedScene && focusedScene !== scenes[index] && isOpen) {
    scenes[index].querySelector('h1,h2').focus({ preventScroll: true });
  }
  document.getElementById('chapter-number').textContent = String(index + 1).padStart(2, '0');
  document.getElementById('chapter-label').textContent = chapterNames[index];
  const last = index === scenes.length - 1;
  document.getElementById('next-label').textContent = last ? 'Back to the beginning' : 'Swipe up to unfold';
  document.getElementById('next-chapter').setAttribute('aria-label', last ? 'Back to chapter 1' : `Next: ${chapterNames[index + 1]}`);
  document.querySelector('.scroll-arrow').textContent = last ? '↑' : '↓';
  stage.dataset.chapterIndex = String(index);
}

function paintStory(position) {
  const index = clamp(Math.round(position), 0, scenes.length - 1);
  activateChapter(index);
  scenes.forEach((scene, sceneIndex) => {
    const distance = sceneIndex - position;
    const progress = clamp(Math.abs(distance), 0, 1);
    const fade = 1 - progress * progress * (3 - 2 * progress);
    scene.style.setProperty('--scene-distance', String(clamp(distance, -1, 1)));
    scene.style.setProperty('--scene-away', String(progress));
    if (!nativeTimeline || readerMode) {
      scene.style.setProperty('--scene-opacity', readerMode ? '1' : fade.toFixed(4));
      scene.style.setProperty('--scene-y', readerMode ? '0px' : `${(distance * chapterStep * 0.18).toFixed(2)}px`);
      scene.style.setProperty('--scene-scale', readerMode ? '1' : String(1 - Math.min(Math.abs(distance), 1) * 0.02));
    }
  });
  stage.style.setProperty('--story-progress', String(position / (scenes.length - 1)));
  stage.style.setProperty('--world-shift', motionEnabled ? `${position * -29}px` : '0px');
  stage.style.setProperty('--world-turn', motionEnabled ? `${position * 65}deg` : '0deg');
  stage.style.setProperty('--garden-scale', motionEnabled ? String(1 + position * 0.055) : '1');
  stage.style.setProperty('--reunion', String(clamp(position, 0, 1)));
  if (focusChapter !== null && Math.abs(position - focusChapter) < 0.015) {
    scenes[focusChapter].querySelector('h1,h2').focus({ preventScroll: true });
    focusChapter = null;
  }
}

function scrollPosition() {
  if (!readerMode) return clamp(scroller.scrollTop / chapterStep, 0, scenes.length - 1);
  let index = 0;
  while (index < scenes.length - 1 && scroller.scrollTop >= scenes[index + 1].offsetTop) index++;
  if (index === scenes.length - 1) return index;
  const span = scenes[index + 1].offsetTop - scenes[index].offsetTop;
  return clamp(index + (scroller.scrollTop - scenes[index].offsetTop) / span, 0, scenes.length - 1);
}

function renderStory() {
  frame = 0;
  if (!isOpen || document.hidden) return;
  renderedPosition = scrollPosition();
  paintStory(renderedPosition);
}

function requestStoryFrame() {
  if (!frame && isOpen && !document.hidden) frame = requestAnimationFrame(renderStory);
}

function pauseRendering() {
  cancelAnimationFrame(frame);
  frame = 0;
}

function measureStory() {
  const height = scroller.clientHeight;
  if (!height) return;
  const oldHeight = chapterStep;
  const previousChapter = Math.max(0, activeChapter);
  chapterStep = height;
  story.style.setProperty('--page-height', `${height}px`);
  story.style.setProperty('--chapter-count', String(scenes.length));
  const needsReader = height < 500 || scenes.some(scene => {
    const style = getComputedStyle(scene);
    const available = height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    return scene.querySelector('.scene-content').offsetHeight > available + 2;
  });
  const modeChanged = readerMode !== needsReader;
  readerMode = needsReader;
  root.classList.toggle('reader-mode', readerMode);
  if (modeChanged) activeChapter = -1;
  if (modeChanged || oldHeight && oldHeight !== height) {
    scroller.scrollTo({ top: readerMode ? scenes[previousChapter].offsetTop : previousChapter * height, behavior: 'instant' });
  }
  requestStoryFrame();
}

function goToChapter(index, focus = false, instant = false) {
  const target = clamp(index, 0, scenes.length - 1);
  if (focus) focusChapter = target;
  scroller.scrollTo({
    top: readerMode ? scenes[target].offsetTop : chapterStep * target,
    behavior: motionEnabled && !instant ? 'smooth' : 'instant'
  });
  requestStoryFrame();
}

document.querySelectorAll('[data-chapter]').forEach(button => button.addEventListener('click', event => {
  event.preventDefault();
  goToChapter(Number(button.dataset.chapter), button.classList.contains('skip-link'));
}));
document.getElementById('next-chapter').addEventListener('click', () => {
  goToChapter(activeChapter === scenes.length - 1 ? 0 : activeChapter + 1);
});
scroller.addEventListener('scroll', requestStoryFrame, { passive: true });
scroller.addEventListener('scrollend', requestStoryFrame, { passive: true });
window.addEventListener('resize', measureStory, { passive: true });
if ('ResizeObserver' in window) {
  const layoutObserver = new ResizeObserver(measureStory);
  layoutObserver.observe(scroller);
  scenes.forEach(scene => layoutObserver.observe(scene.querySelector('.scene-content')));
}
document.fonts?.ready.then(measureStory);
measureStory();
paintStory(0);

function finishOpening() {
  if (!envelopeScreen.classList.contains('departing')) return;
  clearTimeout(departureTimer);
  envelopeScreen.hidden = true;
}

function revealInvitation() {
  if (isOpen) return;
  isOpen = true;
  root.classList.add('is-open', 'is-entering');
  invitation.inert = false;
  document.body.classList.remove('locked');
  scroller.scrollTo({ top: 0, behavior: 'instant' });
  renderedPosition = 0;
  measureStory();
  paintStory(0);
  envelopeScreen.classList.add('departing');
  document.getElementById('couple-names').focus({ preventScroll: true });
  entranceTimer = setTimeout(() => root.classList.remove('is-entering'), 2600);
  if (motionEnabled) departureTimer = setTimeout(finishOpening, 1400);
  else finishOpening();
}

envelopeScreen.addEventListener('transitionend', event => {
  if (event.target === envelopeScreen && event.propertyName === 'opacity') finishOpening();
});
openButton.addEventListener('click', () => {
  if (opening) return;
  opening = true;
  musicWanted = true;
  startMusic();
  const envelopeBounds = openButton.getBoundingClientRect();
  const letterHeight = Math.min(335, Math.max(190, Math.round(window.innerHeight * 0.4)));
  envelopeScreen.style.setProperty('--letter-height', `${letterHeight}px`);
  envelopeScreen.style.setProperty('--letter-art-height', `${clamp(letterHeight - 143, 50, 160)}px`);
  envelopeScreen.style.setProperty('--letter-lift', `${openButton.offsetHeight + 12}px`);
  envelopeScreen.style.setProperty('--opening-drop', `${Math.max(0, letterHeight + 28 - envelopeBounds.top)}px`);
  envelopeScreen.classList.toggle('compact-letter', letterHeight < 215);
  openButton.disabled = true;
  envelopeScreen.classList.add('opening');
  openingTimer = setTimeout(revealInvitation, motionEnabled ? 2300 : 0);
});
document.getElementById('replay-envelope').addEventListener('click', () => {
  music.pause();
  musicWanted = false;
  musicPending = false;
  cancelAnimationFrame(volumeFrame);
  clearTimeout(showerTimer);
  clearTimeout(reunionTimer);
  document.getElementById('replay-reunion').classList.remove('reuniting');
  document.getElementById('petal-shower').replaceChildren();
  clearTimeout(openingTimer);
  clearTimeout(departureTimer);
  clearTimeout(entranceTimer);
  pauseRendering();
  isOpen = false;
  opening = false;
  focusChapter = null;
  invitation.inert = true;
  root.classList.remove('is-open', 'is-entering');
  envelopeScreen.hidden = false;
  envelopeScreen.classList.remove('opening', 'departing');
  document.body.classList.add('locked');
  scroller.scrollTo({ top: 0, behavior: 'instant' });
  renderedPosition = 0;
  paintStory(0);
  openButton.disabled = false;
  openButton.focus({ preventScroll: true });
});

function updateCountdown(now = Date.now()) {
  const start = new Date(EVENT.startsAt).getTime();
  const end = new Date(EVENT.dayEnd).getTime();
  const remaining = Math.max(0, Math.floor((start - now) / 1000));
  const values = {
    days: Math.floor(remaining / 86400),
    hours: Math.floor(remaining % 86400 / 3600),
    minutes: Math.floor(remaining % 3600 / 60),
    seconds: remaining % 60
  };
  Object.entries(values).forEach(([key, value]) => {
    document.getElementById(key).textContent = String(value).padStart(2, '0');
  });
  document.getElementById('countdown-caption').textContent = now < start ? 'Until our celebration begins'
    : now < end ? "Today's the day. Join us from 10:00 AM!" : 'Our forever has begun. Thank you for your love.';
}
updateCountdown();
setInterval(updateCountdown, 1000);
document.addEventListener('visibilitychange', () => {
  root.classList.toggle('motion-paused', document.hidden);
  if (document.hidden) {
    musicPending = musicWanted && !film.open;
    music.pause();
    cancelAnimationFrame(volumeFrame);
    pauseRendering();
  } else {
    updateCountdown();
    measureStory();
    if (musicWanted && !film.open) startMusic();
  }
});

function escapeCalendar(value) {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function calendarFile() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Samridhi and Piyush//Engagement Invitation//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    'UID:piyush-samridhi-engagement-20261128@invitation.local',
    `DTSTAMP:${stamp}`, `DTSTART:${EVENT.calendarStart}`,
    `SUMMARY:${escapeCalendar(EVENT.title)}`, `LOCATION:${escapeCalendar(EVENT.venue)}`,
    `DESCRIPTION:${escapeCalendar(`Together with the Sharma & Kaushik families, join us to celebrate our engagement. ${EVENT.timing}. End time is not specified.\nDirections: ${EVENT.map}`)}`,
    `URL:${EVENT.map}`, 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR'
  ];
  // Calendar content lines are folded at 75 UTF-8 octets, including continuation spaces.
  const encoder = new TextEncoder();
  return lines.map(line => {
    let folded = '';
    let width = 0;
    for (const character of line) {
      const bytes = encoder.encode(character).length;
      if (width + bytes > 75) { folded += '\r\n '; width = 1; }
      folded += character;
      width += bytes;
    }
    return folded;
  }).join('\r\n') + '\r\n';
}
const calendarDescription = `Together with the Sharma & Kaushik families, join us to celebrate our engagement. ${EVENT.timing}. End time is not specified; adjust the duration if needed.\nDirections: ${EVENT.map}`;
const googleCalendar = new URL('https://calendar.google.com/calendar/render');
googleCalendar.search = new URLSearchParams({
  action: 'TEMPLATE', text: EVENT.title, dates: `${EVENT.calendarStart}/${EVENT.calendarStart}`,
  ctz: 'Asia/Kolkata', location: EVENT.venue, details: calendarDescription
}).toString();
document.getElementById('google-calendar').href = googleCalendar.href;
const outlookCalendar = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
outlookCalendar.search = new URLSearchParams({
  path: '/calendar/action/compose', rru: 'addevent', subject: EVENT.title,
  startdt: EVENT.startsAt, allday: 'false',
  location: EVENT.venue, body: calendarDescription
}).toString();
document.getElementById('outlook-calendar').href = outlookCalendar.href;

document.querySelectorAll('[data-calendar]').forEach(button => button.addEventListener('click', () => {
  calendarDialog.showModal();
  root.classList.add('dialog-open');
}));
document.getElementById('close-calendar').addEventListener('click', () => calendarDialog.close());
calendarDialog.addEventListener('close', () => root.classList.remove('dialog-open'));
calendarDialog.addEventListener('click', event => {
  if (event.target !== calendarDialog) return;
  const bounds = calendarDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) calendarDialog.close();
});
document.getElementById('download-calendar').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([calendarFile()], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Samridhi-and-Piyush-28-November-2026.ics';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  notify('Calendar file ready: 28 November, 10:00 AM IST. Confirm the event in your calendar.');
});

function fadeMusicIn() {
  cancelAnimationFrame(volumeFrame);
  const started = performance.now();
  music.volume = 0;
  function fade(timestamp) {
    if (music.paused || document.hidden || !musicWanted || film.open) return;
    const progress = clamp((timestamp - started) / 1800, 0, 1);
    music.volume = 0.3 * progress * (2 - progress);
    if (progress < 1) volumeFrame = requestAnimationFrame(fade);
  }
  volumeFrame = requestAnimationFrame(fade);
}

function startMusic() {
  if (!musicWanted || film.open || document.hidden || musicAttempt || !music.paused) return;
  music.volume = 0;
  // Start inside the envelope's click handler so mobile browsers retain the user gesture.
  musicAttempt = music.play().then(() => {
    if (!musicWanted || film.open || document.hidden) { music.pause(); return; }
    musicPending = false;
    musicNoticeShown = false;
    fadeMusicIn();
  }).catch(error => {
    musicPending = true;
    console.warn('Background music needs another guest interaction:', error);
    if (!musicNoticeShown) {
      notify('Your browser paused the music. Tap anywhere in the invitation to let it play.');
      musicNoticeShown = true;
    }
  }).finally(() => { musicAttempt = null; });
}
document.addEventListener('pointerdown', () => {
  if (musicPending && isOpen) startMusic();
}, { passive: true });
document.addEventListener('keydown', event => {
  if (musicPending && isOpen && ['Enter', ' '].includes(event.key)) startMusic();
});
music.addEventListener('error', () => notify('The music could not load. You can still enjoy the invitation.'));

document.getElementById('watch-film').addEventListener('click', () => {
  cancelAnimationFrame(volumeFrame);
  music.pause();
  film.showModal();
  root.classList.add('dialog-open');
  video.play().catch(error => {
    console.warn('Invitation video needs manual playback:', error);
    notify('Tap the video play control to start the invitation.');
  });
});
document.getElementById('close-film').addEventListener('click', () => film.close());
film.addEventListener('click', event => {
  if (event.target !== film) return;
  const bounds = film.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) film.close();
});
film.addEventListener('close', () => {
  root.classList.remove('dialog-open');
  video.pause();
  if (musicWanted && !document.hidden) startMusic();
});
video.addEventListener('error', () => notify('The video could not load. Please check your connection and try again.'));

document.getElementById('shower-petals').addEventListener('click', () => {
  const container = document.getElementById('petal-shower');
  clearTimeout(showerTimer);
  container.replaceChildren();
  for (let index = 0; index < 32; index++) {
    const petal = document.createElement('span');
    petal.style.setProperty('--left', `${Math.random() * 100}%`);
    petal.style.setProperty('--delay', `${Math.random() * 0.8}s`);
    petal.style.setProperty('--drift', `${Math.random() * 150 - 75}px`);
    container.append(petal);
  }
  showerTimer = setTimeout(() => container.replaceChildren(), 5000);
  notify('A little shower of love, just for you.');
});

document.getElementById('replay-reunion').addEventListener('click', event => {
  const portrait = event.currentTarget;
  clearTimeout(reunionTimer);
  portrait.classList.remove('reuniting');
  // Restart only the replay layer, leaving the scroll-linked pose untouched.
  void portrait.offsetWidth;
  portrait.classList.add('reuniting');
  reunionTimer = setTimeout(() => portrait.classList.remove('reuniting'), 1700);
});
