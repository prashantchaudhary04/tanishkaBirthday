const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");
const surpriseBtn = document.getElementById("surpriseBtn");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeLightbox = document.getElementById("closeLightbox");
const wishOutput = document.getElementById("wishOutput");
const celebrationBtn = document.getElementById("celebrationBtn");
const cakeStage = document.getElementById("cakeStage");
const cakeBtn = document.getElementById("cakeBtn");
const cakeMessage = document.getElementById("cakeMessage");

let confetti = [];
let animationFrame;
let birthdayAudio = {
  context: null,
  interval: null,
  playing: false
};

function resizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function makeConfetti(count = 180) {
  const colors = ["#f07186", "#ff9f7d", "#1e9b9a", "#7b5bd6", "#f4bd4f", "#bce9d8"];
  confetti = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight,
    size: 6 + Math.random() * 9,
    speed: 2.2 + Math.random() * 4.8,
    drift: -1.8 + Math.random() * 3.6,
    spin: Math.random() * Math.PI,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
}

function drawConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confetti.forEach((piece) => {
    piece.y += piece.speed;
    piece.x += piece.drift;
    piece.spin += 0.08;
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.spin);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size / 1.7);
    ctx.restore();
  });
  confetti = confetti.filter((piece) => piece.y < window.innerHeight + 40);
  if (confetti.length) {
    animationFrame = requestAnimationFrame(drawConfetti);
  } else {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function burstConfetti(count) {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  makeConfetti(count);
  drawConfetti();
}

function playTone(context, destination, frequency, startTime, duration) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.08, startTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
}

function scheduleBirthdayTune() {
  if (!birthdayAudio.context) return;

  const context = birthdayAudio.context;
  const master = context.createGain();
  master.gain.value = 0.42;
  master.connect(context.destination);
  const melody = [
    [392, 0.22], [392, 0.22], [440, 0.42], [392, 0.42], [523.25, 0.42], [493.88, 0.78],
    [392, 0.22], [392, 0.22], [440, 0.42], [392, 0.42], [587.33, 0.42], [523.25, 0.78],
    [392, 0.22], [392, 0.22], [784, 0.42], [659.25, 0.42], [523.25, 0.42], [493.88, 0.42], [440, 0.78],
    [698.46, 0.22], [698.46, 0.22], [659.25, 0.42], [523.25, 0.42], [587.33, 0.42], [523.25, 0.95]
  ];

  let time = context.currentTime + 0.04;
  melody.forEach(([frequency, duration]) => {
    playTone(context, master, frequency, time, duration);
    time += duration + 0.055;
  });
}

function startBirthdaySong() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext || birthdayAudio.playing) return;

  birthdayAudio.context = new AudioContext();
  birthdayAudio.playing = true;
  scheduleBirthdayTune();
  birthdayAudio.interval = window.setInterval(scheduleBirthdayTune, 9800);
}

surpriseBtn.addEventListener("click", () => {
  burstConfetti(220);
  document.getElementById("letter").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".photo-card").forEach((card) => {
  card.addEventListener("click", () => {
    const image = card.querySelector("img");
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = card.dataset.caption;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

function hideLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

closeLightbox.addEventListener("click", hideLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) hideLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideLightbox();
});

document.querySelectorAll(".gift").forEach((gift) => {
  gift.addEventListener("click", () => {
    document.querySelectorAll(".gift").forEach((item) => item.classList.remove("open"));
    gift.classList.add("open");
    wishOutput.textContent = gift.dataset.wish;
    burstConfetti(90);
  });
});

celebrationBtn.addEventListener("click", () => {
  startBirthdaySong();
  cakeStage.classList.add("is-ready");
  cakeStage.classList.remove("is-cut");
  celebrationBtn.textContent = "Cake and music playing 🎂";
  cakeMessage.textContent = "The cake is here 🎂 Tap it to cut the first slice for Tanishka 💖";
  burstConfetti(130);
});

cakeBtn.addEventListener("click", () => {
  if (!cakeStage.classList.contains("is-ready")) {
    cakeStage.classList.add("is-ready");
  }
  cakeStage.classList.add("is-cut");
  cakeMessage.textContent = "Cake cut 🎂 Candles blown, balloons flying, and celebration begins. Happy Birthday, Tanishka ❤️";
  burstConfetti(240);
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
