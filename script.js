'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const openBookButton = document.getElementById('openBook');
const replayButton = document.getElementById('replay');
const friendVideo = document.getElementById('friendVideo');
const videoPlay = document.getElementById('videoPlay');
const videoFrame = document.getElementById('videoFrame');
const doodleEffects = document.getElementById('doodleEffects');
const envelope = document.getElementById('envelope');
const confettiLayer = document.getElementById('confetti-layer');
const cursor = document.querySelector('.cursor-pencil');
const soundToggle = document.getElementById('soundToggle');

let soundEnabled = false;
let audioContext = null;

// Smooth section navigation.
function scrollToSection(selector) {
  document.querySelector(selector)?.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start'
  });
}

openBookButton?.addEventListener('click', () => {
  playSoftSound(280, 0.08);
  scrollToSection('#intro');
});

replayButton?.addEventListener('click', () => scrollToSection('#top'));

// Scroll-triggered page placements.
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.13, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

// Custom handmade video play overlay.
videoPlay?.addEventListener('click', async () => {
  videoPlay.classList.add('playing');
  playSoftSound(360, 0.08);

  try {
    friendVideo.muted = true; // Never begin autoplay with sound.
    await friendVideo.play();
    videoPlay.classList.add('hidden');
    videoFrame.querySelector('.floating-video-doodles')?.classList.add('active');
  } catch (error) {
    // Missing/blocked video stays usable through the native controls.
    console.info('Add your video in assets/video/ or update the source in index.html.', error);
  }
});

friendVideo?.addEventListener('pause', () => {
  if (!friendVideo.ended) videoPlay?.classList.remove('hidden');
});

friendVideo?.addEventListener('ended', () => {
  videoPlay?.classList.remove('hidden');
  videoFrame.querySelector('.floating-video-doodles')?.classList.remove('active');
});

// Lightweight CSS-generated doodle interactions.
document.querySelectorAll('.tap-doodle').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const rect = button.getBoundingClientRect();
    const playground = document.getElementById('doodlePlayground').getBoundingClientRect();
    const x = rect.left - playground.left + rect.width / 2;
    const y = rect.top - playground.top + rect.height / 2;

    playSoftSound(420 + Math.random() * 120, 0.05);
    runDoodleAction(action, x, y);
  });
});

function makeEffect(className, content, x, y) {
  const element = document.createElement('span');
  element.className = `effect ${className}`;
  element.textContent = content;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  doodleEffects.appendChild(element);
  element.addEventListener('animationend', () => element.remove());
  setTimeout(() => element.remove(), 3200);
  return element;
}

function runDoodleAction(action, x, y) {
  switch (action) {
    case 'butterfly':
      makeEffect('flying-butterfly', 'ƸӜƷ', 0, y);
      break;
    case 'airplane':
      makeEffect('flying-plane', '➤', 0, y);
      break;
    case 'cloud':
      for (let i = 0; i < 8; i += 1) {
        const drop = makeEffect('rain-drop', '•', x - 50 + i * 14, y + 25);
        drop.style.animationDelay = `${i * 60}ms`;
      }
      break;
    case 'star':
      for (let i = 0; i < 6; i += 1) {
        const sparkle = makeEffect('sparkle-effect', i % 2 ? '✦' : '☆', x + (Math.random() - .5) * 130, y + (Math.random() - .5) * 100);
        sparkle.style.animationDelay = `${i * 60}ms`;
      }
      break;
    case 'pencil':
      makeEffect('draw-line', '', x - 100, y - 20);
      break;
    case 'flower':
      makeEffect('petal-effect', '✿', x - 25, y - 25);
      break;
    case 'music':
      makeEffect('note-effect', '♫', x - 25, y - 25);
      break;
    case 'crayon':
      makeEffect('crayon-effect', '', x - 105, y - 10);
      break;
    default:
      break;
  }
}

// Envelope interaction and paper confetti.
envelope?.addEventListener('click', () => {
  const isOpen = envelope.classList.toggle('open');
  envelope.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    createConfetti(42);
    playSoftSound(520, 0.12);
  }
});

function createConfetti(amount = 35) {
  if (reduceMotion) return;
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty('--fall', `${2 + Math.random() * 2}s`);
    piece.style.setProperty('--drift', `${-80 + Math.random() * 160}px`);
    piece.style.setProperty('--rot', `${Math.random() * 180}deg`);
    piece.style.opacity = `${.45 + Math.random() * .5}`;
    if (i % 3 === 0) piece.style.background = '#9acbff';
    if (i % 4 === 0) piece.style.borderRadius = '50%';
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 4300);
  }
}

// Desktop pencil-following cursor.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('mousemove', (event) => {
    cursor.style.opacity = '1';
    cursor.style.left = `${event.clientX + 13}px`;
    cursor.style.top = `${event.clientY + 13}px`;
  });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
}

// Optional subtle generated tones. No audio files required.
soundToggle?.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  soundToggle.querySelector('.sound-label').textContent = soundEnabled ? 'Sound on' : 'Sound off';
  if (soundEnabled) playSoftSound(440, 0.07);
});

function playSoftSound(frequency = 380, duration = 0.06) {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.info('Sound is unavailable in this browser.', error);
  }
}

// Gentle parallax for larger screens only.
if (!reduceMotion && window.matchMedia('(min-width: 800px)').matches) {
  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.025;
    document.querySelectorAll('.cover-doodles .doodle').forEach((doodle, index) => {
      doodle.style.translate = `0 ${offset * ((index % 3) + 1)}px`;
    });
  }, { passive: true });
}
