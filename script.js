const FORMSPREE_URL = 'https://formspree.io/f/xyewdrzq';

async function sendSignal(eventType, detail) {
  showToast('Đang gửi tín hiệu... 📡');

  try {
    const res = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        loai_tin_hieu: eventType,
        noi_dung: detail,
        thoi_gian: new Date().toLocaleString('vi-VN'),
        _subject: `[Góc Của Chị] ${eventType}`
      })
    });

    if (res.ok) {
      showToast(`Đã gửi tín hiệu: ${eventType} ✅`);
    } else {
      showToast('Gửi chưa thành công, kiểm tra lại form nhé!');
    }
  } catch (err) {
    console.error('Lỗi gửi Formspree:', err);
    showToast('Không gửi được — hãy mở qua Live Server hoặc link https://');
  }
}

// --- Floating background ---
const bgEl = document.getElementById('floatingBg');
const icons = ['🌸', '✨', '🌷', '☁️', '🍓', '⭐'];

for (let i = 0; i < 16; i++) {
  const span = document.createElement('span');
  span.className = 'float-item';
  span.textContent = icons[i % icons.length];
  span.style.left = Math.random() * 100 + 'vw';
  span.style.animationDuration = (12 + Math.random() * 14) + 's';
  span.style.animationDelay = (-Math.random() * 15) + 's';
  bgEl.appendChild(span);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'panel-' + tabName);
  });
}

// --- Nhạc chill đa tầng ---
const playlists = [
  {
    title: 'Playlist 1: Nắng Nhẹ Phố Chiều',
    sub: 'Hợp âm Cmaj7 - Am7 - Fmaj7 - G6 • Êm tai',
    tempoMs: 560,
    chords: [
      [261.63, 329.63, 392.00, 493.88],
      [220.00, 261.63, 329.63, 392.00],
      [174.61, 220.00, 261.63, 349.23],
      [196.00, 246.94, 293.66, 392.00]
    ],
    basses: [130.81, 110.00, 87.31, 98.00],
    melody: [523.25, 659.25, 587.33, 493.88, 440.00, 523.25, 493.88, 392.00]
  },
  {
    title: 'Playlist 2: Gió Thổi Qua Hiên',
    sub: 'Hợp âm Fmaj7 - Em7 - Dm7 - Cmaj7 • Thư giãn',
    tempoMs: 620,
    chords: [
      [174.61, 220.00, 261.63, 349.23],
      [164.81, 196.00, 246.94, 329.63],
      [146.83, 174.61, 220.00, 261.63],
      [261.63, 329.63, 392.00, 493.88]
    ],
    basses: [87.31, 82.41, 73.42, 130.81],
    melody: [440.00, 392.00, 329.63, 392.00, 440.00, 523.25, 493.88, 392.00]
  }
];

let audioCtx = null;
let masterGain = null;
let musicTimer = null;
let isPlaying = false;
let trackIdx = 0;
let stepIdx = 0;

function initAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = parseFloat(document.getElementById('volumeSlider').value);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playVoice(freq, duration, peakGain, type) {
  if (!audioCtx || !masterGain) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function playBeat(step) {
  const pl = playlists[trackIdx];
  const barIdx = Math.floor(step / 2) % pl.chords.length;
  const chord = pl.chords[barIdx];
  const bassFreq = pl.basses[barIdx];
  const melodyFreq = pl.melody[step % pl.melody.length];

  if (step % 2 === 0) {
    playVoice(bassFreq, 1.15, 0.24, 'triangle');
    chord.forEach(n => playVoice(n, 1.1, 0.06, 'sine'));
  }
  playVoice(melodyFreq, 0.75, 0.13, 'sine');
}

function updateTrackLabel() {
  document.getElementById('trackTitle').textContent = playlists[trackIdx].title;
  document.getElementById('trackSub').textContent = playlists[trackIdx].sub;
}

function startMusicLoop() {
  clearInterval(musicTimer);
  stepIdx = 0;
  playBeat(stepIdx++);
  musicTimer = setInterval(() => {
    if (!isPlaying) return;
    playBeat(stepIdx++);
  }, playlists[trackIdx].tempoMs);
}

function toggleMusic() {
  initAudio();
  isPlaying = !isPlaying;
  const btn = document.getElementById('playMusicBtn');
  const vinyl = document.getElementById('vinyl');

  if (isPlaying) {
    btn.textContent = '⏸ Tạm dừng';
    vinyl.classList.add('spinning');
    startMusicLoop();
    showToast('Đang phát nhạc chill 🎵');
  } else {
    btn.textContent = '▶ Bật nhạc';
    vinyl.classList.remove('spinning');
    clearInterval(musicTimer);
  }
}

function nextTrack() {
  trackIdx = (trackIdx + 1) % playlists.length;
  updateTrackLabel();
  if (isPlaying) startMusicLoop();
}

function prevTrack() {
  trackIdx = (trackIdx - 1 + playlists.length) % playlists.length;
  updateTrackLabel();
  if (isPlaying) startMusicLoop();
}

function updateVolume(val) {
  if (masterGain) masterGain.gain.value = parseFloat(val);
}

// --- Thẻ khen ---
const compliments = [
  { cat: 'xinh', label: 'Tự khen xinh', text: 'Hôm nay cười một cái thôi là thấy cả ngày sáng bừng liền á.', sub: 'Nhận xét: Nét tươi tắn này không cần chỉnh sửa gì thêm.' },
  { cat: 'xinh', label: 'Tự khen xinh', text: 'Nhìn lại mình hôm nay thấy cũng ra gì phết, dịu dàng mà vẫn cuốn.', sub: 'Điểm cộng: Thần thái tự nhiên, không gồng.' },
  { cat: 'hai', label: 'Hài duyên', text: 'Mình mà đi quảng cáo trà sữa chắc khách xếp hàng dài tới ngã tư.', sub: 'Lý do: Nhìn thôi đã thấy thèm đồ ngon.' },
  { cat: 'hai', label: 'Hài duyên', text: 'Cảnh báo nhẹ: Hôm nay cười nhiều quá dễ làm người đối diện đứng hình.', sub: 'Mức độ: Dễ thương hơi bị quá đà.' },
  { cat: 'chill', label: 'Chill nhẹ', text: 'Hôm nay cứ thong thả từng chút một, không cần vội, vui là chính.', sub: 'Nhắc nhẹ: Nhớ uống nước và nghỉ mắt.' },
  { cat: 'chill', label: 'Chill nhẹ', text: 'Tự thưởng cho bản thân một khoảng lặng dễ chịu giữa ngày dài thôi.', sub: 'Mood: Nhẹ nhàng, êm ái.' }
];

let activeCat = 'all';
let currentComp = compliments[0];
let savedComp = [];

function setCategory(cat, el) {
  activeCat = cat;
  document.querySelectorAll('#categoryFilters .btn-soft').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  drawCompliment();
}

function drawCompliment() {
  const pool = activeCat === 'all' ? compliments : compliments.filter(c => c.cat === activeCat);
  const candidates = pool.filter(c => c.text !== currentComp.text);
  const pickList = candidates.length ? candidates : pool;
  currentComp = pickList[Math.floor(Math.random() * pickList.length)];

  document.getElementById('compTag').textContent = currentComp.label;
  document.getElementById('compText').textContent = currentComp.text;
  document.getElementById('compSub').textContent = currentComp.sub;
}

function saveCurrentCompliment() {
  if (savedComp.some(item => item.text === currentComp.text)) {
    showToast('Câu này đã lưu rồi nè!');
    return;
  }
  savedComp.unshift(currentComp);
  renderSaved();
  showToast('Đã lưu câu này 📌');
}

function removeSaved(idx) {
  savedComp.splice(idx, 1);
  renderSaved();
}

function renderSaved() {
  document.getElementById('savedCount').textContent = savedComp.length;
  const listEl = document.getElementById('savedList');
  if (!savedComp.length) {
    listEl.innerHTML = '<div class="empty-note">Chưa lưu câu nào — bấm "Lưu lại" ở trên nhé.</div>';
    return;
  }
  listEl.innerHTML = savedComp.map((item, idx) => `
    <div class="saved-chip">
      <span>${item.text}</span>
      <button class="delete-btn" onclick="removeSaved(${idx})" title="Xóa">✕</button>
    </div>
  `).join('');
}

// --- Album 8 ảnh ---
const photos = [
  { src: 'images/img1.jpg', cap: 'Khoảnh khắc #1' },
  { src: 'images/img2.jpg', cap: 'Khoảnh khắc #2' },
  { src: 'images/img3.jpg', cap: 'Khoảnh khắc #3' },
  { src: 'images/img4.jpg', cap: 'Khoảnh khắc #4' },
  { src: 'images/img5.jpg', cap: 'Khoảnh khắc #5' },
  { src: 'images/img6.jpg', cap: 'Khoảnh khắc #6' },
  { src: 'images/img7.jpg', cap: 'Khoảnh khắc #7' },
  { src: 'images/img8.jpg', cap: 'Khoảnh khắc #8' }
];

function renderGallery() {
  const grid = document.getElementById('photoGrid');
  grid.innerHTML = photos.map((p, i) => `
    <div class="photo-card">
      <img src="${p.src}" alt="${p.cap}" onclick="openLightbox(${i})" onerror="this.alt='Chưa có ảnh ${p.src}'" />
      <div class="photo-meta">
        <span class="photo-cap">${p.cap}</span>
        <button class="heart-btn" onclick="sendSignal('Thả tim ảnh', '${p.cap} (${p.src})')">💖 Tim</button>
      </div>
    </div>
  `).join('');
}

function openLightbox(idx) {
  const p = photos[idx];
  document.getElementById('lightboxImg').src = p.src;
  document.getElementById('lightboxCaption').textContent = p.cap;
  document.getElementById('lightboxHeartBtn').onclick = () => sendSignal('Thả tim ảnh lớn', p.cap);
  document.getElementById('lightbox').classList.add('open');
}

function hideLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

function closeLightbox(e) {
  if (e.target.id === 'lightbox') hideLightbox();
}

renderGallery();

// --- Mini-game ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameRunning = false;
let score = 0;
let lives = 3;
let bestScore = Number(localStorage.getItem('chi_game_best') || 0);
let basket = { x: 450, y: 315, w: 96, h: 22 };
let items = [];
let spawnCounter = 0;
let animId = null;

document.getElementById('bestVal').textContent = bestScore;

function setBasketPos(clientX) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const x = (clientX - rect.left) * scaleX;
  basket.x = Math.max(basket.w / 2 + 10, Math.min(canvas.width - basket.w / 2 - 10, x));
}

canvas.addEventListener('mousemove', e => setBasketPos(e.clientX));
canvas.addEventListener('touchmove', e => {
  if (e.touches[0]) setBasketPos(e.touches[0].clientX);
}, { passive: true });

function startGame() {
  score = 0;
  lives = 3;
  items = [];
  spawnCounter = 0;
  gameRunning = true;
  document.getElementById('scoreVal').textContent = score;
  document.getElementById('livesVal').textContent = '❤️❤️❤️';
  document.getElementById('gameRank').textContent = 'Đang chơi — cố lên nào!';
  cancelAnimationFrame(animId);
  gameLoop();
}

function spawnItem() {
  const goodList = ['🧋', '🌸', '⭐', '🍓'];
  const badList = ['😵‍💫', '🌧️'];
  const isBad = Math.random() < 0.28;
  items.push({
    x: 40 + Math.random() * (canvas.width - 80),
    y: -24,
    speed: 2.5 + Math.random() * 2.2 + Math.min(2.5, score / 60),
    emoji: isBad ? badList[Math.floor(Math.random() * badList.length)] : goodList[Math.floor(Math.random() * goodList.length)],
    bad: isBad
  });
}

function updateRankLabel() {
  const rankEl = document.getElementById('gameRank');
  if (score >= 150) rankEl.textContent = '🏆 Danh hiệu: Cao Thủ Hứng Năng Lượng!';
  else if (score >= 100) rankEl.textContent = '✨ Danh hiệu: Hứng Trọn Niềm Vui!';
  else if (score >= 50) rankEl.textContent = '🧋 Danh hiệu: Tín Đồ Trà Sữa Nhanh Tay!';
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f46b8a';
  ctx.beginPath();
  ctx.roundRect(basket.x - basket.w / 2, basket.y, basket.w, basket.h, 11);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🧺 GIỎ CỦA MÌNH', basket.x, basket.y + 15);

  if (gameRunning) {
    spawnCounter++;
    if (spawnCounter % 34 === 0) spawnItem();

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += it.speed;

      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(it.emoji, it.x, it.y);

      const hitX = Math.abs(it.x - basket.x) < basket.w / 2 + 12;
      const hitY = it.y >= basket.y - 6 && it.y <= basket.y + basket.h + 8;

      if (hitX && hitY) {
        if (it.bad) {
          lives--;
          document.getElementById('livesVal').textContent = '❤️'.repeat(Math.max(0, lives)) || '💔';
          showToast('Trúng chướng ngại vật rồi!');
          if (lives <= 0) {
            gameRunning = false;
            document.getElementById('gameRank').textContent = `Hết lượt rồi! Được ${score} điểm nè.`;
            sendSignal('Kết thúc mini-game', `Điểm: ${score}`);
          }
        } else {
          score += 10;
          document.getElementById('scoreVal').textContent = score;
          if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('chi_game_best', String(bestScore));
            document.getElementById('bestVal').textContent = bestScore;
          }
          updateRankLabel();
        }
        items.splice(i, 1);
        continue;
      }

      if (it.y > canvas.height + 30) {
        items.splice(i, 1);
      }
    }
  } else if (score === 0 && lives === 3) {
    ctx.fillStyle = '#6e5f70';
    ctx.font = '600 18px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bấm "Chơi / Chơi lại" ở phía trên để bắt đầu nhé!', canvas.width / 2, canvas.height / 2);
  }

  animId = requestAnimationFrame(gameLoop);
}

gameLoop();

// --- Quẻ & nút chạy trốn ---
const fortunes = [
  { icon: '🧋', title: 'Quẻ Đại Cát: Có Đồ Ngon Mời', body: 'Hôm nay dễ có ly trà sữa hoặc món ăn vặt ngon bất ngờ.' },
  { icon: '☀️', title: 'Quẻ Thuận Lợi: Mọi Việc Êm Xuôi', body: 'Công việc hay bài vở hôm nay đều nhẹ nhàng hơn dự kiến.' },
  { icon: '🌸', title: 'Quẻ Dễ Thương: Được Khen Bất Ngờ', body: 'Hôm nay thần sắc tươi tắn, đi đâu cũng dễ nghe lời khen vui.' },
  { icon: '💤', title: 'Quẻ Thư Giãn: Ngủ Ngon Hết Nấc', body: 'Tối nay đặt lưng xuống là ngủ ngon, đầu óc nhẹ tênh.' }
];

function pullFortune() {
  const f = fortunes[Math.floor(Math.random() * fortunes.length)];
  document.getElementById('fortuneIcon').textContent = f.icon;
  document.getElementById('fortuneTitle').textContent = f.title;
  document.getElementById('fortuneBody').textContent = f.body;
  sendSignal('Bốc quẻ', f.title);
}

function dodgeButton() {
  const arena = document.getElementById('arena');
  const btn = document.getElementById('runawayBtn');
  const maxX = arena.clientWidth - btn.offsetWidth - 16;
  const maxY = arena.clientHeight - btn.offsetHeight - 16;
  btn.style.left = Math.max(12, Math.random() * maxX) + 'px';
  btn.style.top = Math.max(12, Math.random() * maxY) + 'px';
  btn.style.transform = 'none';
  document.getElementById('arenaMsg').textContent = 'Nút đó hơi ngại nên chạy mất rồi, bấm nút hồng bên trái đi 😄';
}

function celebratePretty() {
  document.getElementById('arenaMsg').textContent = 'Chuẩn không cần chỉnh! Hôm nay xinh xắn hết phần rồi ✨';
  sendSignal('Xác nhận độ xinh', 'Có, xinh lắm!');
}

// --- Tín hiệu mood & lời nhắn ---
const moodData = {
  vui: {
    msg: 'Hôm nay mình đang vui vẻ nè, giữ năng lượng tốt như vậy tới cuối ngày nha!',
    reply: 'Hôm nay chị đang vui vẻ nè 😄'
  },
  buonngu: {
    msg: 'Hơi buồn ngủ thì thử duỗi người, uống ngụm nước mát hoặc nghe thêm nhạc cho tỉnh táo nhẹ.',
    reply: 'Hôm nay chị hơi buồn ngủ xíu 🥱'
  },
  ban: {
    msg: 'Đang bận rộn thì làm từng việc một thôi, xong nhớ nghỉ ngơi chút kẻo quá sức.',
    reply: 'Hôm nay chị đang bận rộn nè 💻'
  },
  themngon: {
    msg: 'Thèm đồ ngon rồi thì đi kiếm ngay một món hợp khẩu vị tự thưởng thôi.',
    reply: 'Tự dưng thèm đồ ngon/trà sữa quá 🧋'
  }
};

let selectedMoodKey = 'vui';

function selectMood(moodKey, el) {
  selectedMoodKey = moodKey;
  document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('moodMessage').textContent = moodData[moodKey].msg;
}

function updateCharCount() {
  const input = document.getElementById('customNoteInput');
  document.getElementById('charCount').textContent = input.value.length;
}

function sendCurrentMoodSignal() {
  const info = moodData[selectedMoodKey];
  const noteInput = document.getElementById('customNoteInput');
  const extraNote = noteInput.value.trim();

  const payloadDetail = extraNote
    ? `${info.reply} | Lời nhắn thêm: "${extraNote}"`
    : info.reply;

  sendSignal('Cập nhật tâm trạng', payloadDetail);

  if (extraNote) {
    noteInput.value = '';
    updateCharCount();
  }
}

function copyQuickReply() {
  const info = moodData[selectedMoodKey];
  const extraNote = document.getElementById('customNoteInput').value.trim();
  const fullText = extraNote ? `${info.reply} (${extraNote})` : info.reply;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Đã copy tin nhắn 📋');
  });
}