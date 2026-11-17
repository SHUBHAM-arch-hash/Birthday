const particleLayer = document.getElementById('particle-layer');
const scene = document.querySelector('.opening-scene');
const bookStage = document.querySelector('.storybook-stage');
const book = document.querySelector('.storybook');
const bookArtwork = document.querySelector('.book-artwork');
const bookTransformation = document.querySelector('.book-transformation');
const openingCover = document.querySelector('.opening-cover');
const openPageSpread = document.querySelector('.open-page-spread');
const pageLight = document.querySelector('.page-light');
const pageFlutters = document.querySelectorAll('.page-flutter');
const cinematicFrame = document.getElementById('cinematic-frame');
const storyVideo = document.getElementById('story-video');
const enableSoundButton = document.getElementById('enable-sound');
const surpriseReveal = document.getElementById('surprise-reveal');
const openSurpriseButton = document.getElementById('open-surprise');
const birthdayLetter = document.getElementById('birthday-letter');
const parchmentScroll = document.querySelector('.parchment-scroll');
const closeLetterButton = document.getElementById('close-letter');
const birthdaySong = document.getElementById('birthday-song');
const startButton = document.getElementById('start-journey');
const chapterMessage = document.getElementById('chapter-message');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let audioContext;
let journeyStarted = false;
let bookFloatTween;
let journeyTimeline;
let blockedMedia;
let surpriseOpened = false;

for (let index = 0; index < 43; index += 1) {
  const particle = document.createElement('span');
  particle.className = 'particle';
  particle.style.setProperty('--size', `${1 + Math.random() * 3}px`);
  particle.style.setProperty('--left', `${4 + Math.random() * 92}%`);
  particle.style.setProperty('--top', `${18 + Math.random() * 67}%`);
  particle.style.setProperty('--opacity', `${0.23 + Math.random() * 0.65}`);
  particle.style.setProperty('--duration', `${4.5 + Math.random() * 5}s`);
  particle.style.setProperty('--delay', `${-Math.random() * 8}s`);
  particle.style.setProperty('--drift', `${-22 + Math.random() * 44}px`);
  particleLayer.appendChild(particle);
}

function finishTransformation() {
  window.dispatchEvent(new CustomEvent('birthday:story-start'));
}

function showEnableSound(media) {
  blockedMedia = media;
  enableSoundButton.hidden = false;
}

function playStoryVideo() {
  storyVideo.currentTime = 0;
  storyVideo.muted = false;
  storyVideo.volume = 1;
  storyVideo.play().catch(() => showEnableSound(storyVideo));
}

function getAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function bell(context, frequency, start, duration, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .04);
}

function softNoise(context, start, duration, volume) {
  const frames = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < frames; index += 1) samples[index] = (Math.random() * 2 - 1) * (1 - index / frames);
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1700, start);
  filter.frequency.exponentialRampToValueAtTime(310, start + duration);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .035);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
}

async function playLocalOrFallback(path, fallback) {
  try {
    const response = await fetch(path, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Audio asset unavailable');
    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.volume = .46;
    await audio.play();
    audio.addEventListener('ended', () => URL.revokeObjectURL(audio.src), { once: true });
  } catch (_) {
    fallback();
  }
}

function playMagicalClick() {
  const context = getAudioContext();
  const now = context.currentTime;
  bell(context, 783.99, now, .9, .1);
  bell(context, 1046.5, now + .08, 1.05, .075);
  bell(context, 1318.51, now + .17, 1.2, .05);
  softNoise(context, now, .42, .018);
}

function playPageTurn() {
  const context = getAudioContext();
  const now = context.currentTime;
  softNoise(context, now, .5, .032);
  bell(context, 523.25, now + .12, .58, .028);
}

function burstParticles() {
  const bounds = bookStage.getBoundingClientRect();
  for (let index = 0; index < 28; index += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'burst-particle';
    sparkle.style.left = `${bounds.left + bounds.width * (.2 + Math.random() * .6)}px`;
    sparkle.style.top = `${bounds.top + bounds.height * (.25 + Math.random() * .5)}px`;
    sparkle.style.setProperty('--x', `${-160 + Math.random() * 320}px`);
    sparkle.style.setProperty('--y', `${-135 + Math.random() * 175}px`);
    sparkle.style.setProperty('--delay', `${Math.random() * .1}s`);
    document.body.appendChild(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove());
  }
}

function startJourney() {
  if (journeyStarted) return;
  journeyStarted = true;
  startButton.disabled = true;
  startButton.setAttribute('aria-disabled', 'true');
  startButton.classList.add('is-activated');
  burstParticles();
  playStoryVideo();
  bookFloatTween?.kill();

  if (!window.gsap || reduceMotion) {
    document.querySelector('.opening-copy').style.opacity = '0';
    startButton.style.opacity = '0';
    bookStage.style.opacity = '0';
    cinematicFrame.style.visibility = 'visible';
    cinematicFrame.style.opacity = '1';
    cinematicFrame.style.transform = 'translate(-50%, -50%) scale(1)';
    playStoryVideo();
    window.setTimeout(finishTransformation, 150);
    return;
  }

  try {
    journeyTimeline = gsap.timeline({ defaults: { overwrite: 'auto' } });
    journeyTimeline
      .to(startButton, { scale: .96, duration: .14, yoyo: true, repeat: 1, ease: 'power1.inOut' })
      .to(bookStage, { scale: 1.07, yPercent: -7, duration: .66, ease: 'power2.out' }, 0)
      .to(book, { rotationX: 3, rotationY: -11, rotationZ: -1, duration: .74, ease: 'sine.inOut' }, .1)
      .to('.opening-copy', { autoAlpha: 0, y: -14, duration: .46, ease: 'power2.in' }, .26)
      .to(startButton, { autoAlpha: 0, y: 12, duration: .42, ease: 'power2.in' }, .33)
      .to(bookArtwork, { autoAlpha: 0, duration: .18, ease: 'none' }, .58)
      .set(bookTransformation, { autoAlpha: 1 }, .59)
      .to(pageLight, { opacity: 1, duration: .78, ease: 'sine.out' }, .62)
      .to(openPageSpread, { autoAlpha: 1, scale: 1, duration: .62, ease: 'power2.out' }, .67)
      .to(openingCover, { rotationY: -142, duration: 1.28, ease: 'power2.inOut' }, .72)
      .to(pageFlutters[0], { rotationY: -168, duration: .54, ease: 'power1.inOut' }, 1.2)
      .to(pageFlutters[1], { rotationY: -166, duration: .5, ease: 'power1.inOut' }, 1.43)
      .call(burstParticles, [], 1.12)
      .to(bookTransformation, { scale: 1.18, yPercent: -5, duration: .64, ease: 'power2.in' }, 1.58)
      .set(cinematicFrame, { autoAlpha: 1 }, 1.83)
      .to(cinematicFrame, { scale: 1, duration: .82, ease: 'power3.out' }, 1.83)
      .to([bookStage, bookTransformation], { autoAlpha: 0, duration: .45, ease: 'power2.in' }, 2.23)
      .call(finishTransformation, [], 2.67);
  } catch (_) {
    bookStage.style.opacity = '0';
    cinematicFrame.style.visibility = 'visible';
    cinematicFrame.style.opacity = '1';
    cinematicFrame.style.transform = 'translate(-50%, -50%) scale(1)';
    playStoryVideo();
    finishTransformation();
  }
}

function showSurpriseReveal() {
  if (surpriseOpened) return;
  surpriseReveal.hidden = false;
  burstParticles();
  if (!window.gsap || reduceMotion) {
    cinematicFrame.style.opacity = '0';
    surpriseReveal.style.opacity = '1';
    return;
  }
  gsap.timeline()
    .to(cinematicFrame, { autoAlpha: 0, scale: .94, duration: .65, ease: 'power2.in' })
    .fromTo(surpriseReveal, { autoAlpha: 0, scale: .82 }, { autoAlpha: 1, scale: 1, duration: .78, ease: 'back.out(1.25)' }, '<.2');
}

function openBirthdaySurprise() {
  if (surpriseOpened) return;
  surpriseOpened = true;
  birthdaySong.pause();
  birthdaySong.currentTime = 0;
  birthdaySong.muted = false;
  birthdaySong.volume = 1;
  birthdaySong.play().catch(() => showEnableSound(birthdaySong));
  birthdayLetter.hidden = false;
  if (!window.gsap || reduceMotion) {
    surpriseReveal.style.opacity = '0';
    birthdayLetter.style.opacity = '1';
    return;
  }
  gsap.timeline()
    .to(surpriseReveal, { autoAlpha: 0, scale: .92, duration: .3, ease: 'power2.in' })
    .fromTo(birthdayLetter, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 }, '<.1')
    .fromTo(parchmentScroll, { scaleX: .08, scaleY: .18, rotationX: 16, autoAlpha: 0 }, { scaleX: 1, scaleY: 1, rotationX: 0, autoAlpha: 1, duration: 1.15, ease: 'power3.out' }, '<')
    .fromTo('.letter-copy', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power2.out' }, '-=.22');
}

function resetLandingState() {
  birthdaySong.pause();
  birthdaySong.currentTime = 0;
  storyVideo.pause();
  storyVideo.currentTime = 0;
  journeyTimeline?.kill();
  bookFloatTween?.kill();
  enableSoundButton.hidden = true;
  blockedMedia = undefined;
  journeyStarted = false;
  surpriseOpened = false;
  startButton.disabled = false;
  startButton.removeAttribute('aria-disabled');
  startButton.classList.remove('is-activated');
  birthdayLetter.hidden = true;
  surpriseReveal.hidden = true;
  chapterMessage.hidden = true;
  if (window.gsap) {
    gsap.set([bookStage, book, bookArtwork, bookTransformation, openPageSpread, pageLight, openingCover, cinematicFrame, surpriseReveal, birthdayLetter, ...pageFlutters, '.opening-copy', startButton], { clearProps: 'all' });
    gsap.set([bookStage, bookArtwork, '.opening-copy', startButton], { autoAlpha: 1 });
    gsap.set([bookTransformation, cinematicFrame, surpriseReveal, birthdayLetter], { autoAlpha: 0 });
  } else {
    bookStage.style.opacity = '1';
    bookArtwork.style.opacity = '1';
    document.querySelector('.opening-copy').style.opacity = '1';
    startButton.style.opacity = '1';
    cinematicFrame.style.opacity = '0';
  }
  bookFloatTween = window.gsap ? gsap.to(bookStage, { yPercent: 1.5, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }) : undefined;
}

function restoreLanding() {
  birthdaySong.pause();
  birthdaySong.currentTime = 0;
  if (!window.gsap || reduceMotion) {
    resetLandingState();
    return;
  }
  gsap.timeline()
    .to('.letter-copy', { autoAlpha: 0, y: -12, duration: .2, ease: 'power1.in' })
    .to(parchmentScroll, { scaleX: .08, scaleY: .18, rotationX: 16, autoAlpha: 0, duration: .68, ease: 'power3.in' }, '<.08')
    .to(birthdayLetter, { autoAlpha: 0, duration: .16, ease: 'none' })
    .call(resetLandingState);
}

function setupPremiumButtonMotion() {
  if (!window.gsap || reduceMotion) return;
  startButton.addEventListener('pointerenter', () => {
    if (journeyStarted) return;
    gsap.to(startButton, { y: -5, scale: 1.025, duration: .28, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(startButton.querySelector('b'), { x: 3, duration: .28, ease: 'power2.out', overwrite: 'auto' });
  });
  startButton.addEventListener('pointerleave', () => {
    if (journeyStarted) return;
    gsap.to(startButton, { y: 0, scale: 1, duration: .32, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(startButton.querySelector('b'), { x: 0, duration: .32, ease: 'power2.out', overwrite: 'auto' });
  });
  startButton.addEventListener('pointerdown', () => {
    if (!journeyStarted) gsap.to(startButton, { y: 2, scale: .985, duration: .1, ease: 'power1.out', overwrite: 'auto' });
  });
}

function runOpeningTimeline() {
  if (!window.gsap || reduceMotion) {
    scene.classList.add('scene-ready');
    return;
  }
  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
  timeline
    .set(['.scene-mark', '.storybook-stage', '.opening-copy', '.journey-button'], { autoAlpha: 0 })
    .set('.particle', { autoAlpha: 0 })
    .fromTo('.opening-scene', { backgroundColor: '#030105' }, { backgroundColor: '#10091a', duration: 1.65 })
    .to('.scene-background', { scale: 1, duration: 3.7, ease: 'power1.out' }, '<')
    .to('.moon-haze', { opacity: 1, duration: 2.2 }, '<.5')
    .to('.particle', { autoAlpha: (index) => .28 + (index % 4) * .13, duration: 1.5, stagger: .025 }, '<.65')
    .to('.storybook-stage', { autoAlpha: 1, yPercent: 4, duration: 1.45 }, '<.4')
    .fromTo(book, { scale: .91, rotateZ: -7 }, { scale: 1, rotateZ: -3, duration: 1.7, ease: 'power3.out' }, '<.2')
    .to('.scene-mark', { autoAlpha: 1, duration: .8 }, '<.8')
    .to('.opening-copy', { autoAlpha: 1, y: 0, duration: .95 }, '<.4')
    .to('.journey-button', { autoAlpha: 1, y: 0, duration: .6 }, '<.25');

  bookFloatTween = gsap.to(bookStage, { yPercent: 1.5, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
}

startButton.addEventListener('click', startJourney);
storyVideo.addEventListener('ended', showSurpriseReveal);
openSurpriseButton.addEventListener('click', openBirthdaySurprise);
closeLetterButton.addEventListener('click', restoreLanding);
enableSoundButton.addEventListener('click', () => {
  if (!blockedMedia) return;
  blockedMedia.muted = false;
  blockedMedia.volume = 1;
  blockedMedia.play().then(() => { enableSoundButton.hidden = true; }).catch(() => {});
});
setupPremiumButtonMotion();

window.addEventListener('load', runOpeningTimeline);
