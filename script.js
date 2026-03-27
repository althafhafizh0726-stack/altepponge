// =========================
// INIT
// =========================
var listEl = document.getElementById('list');
var detailEl = document.getElementById('detail');
var search = document.getElementById('search');

var all = [];
var audioList = [];
var currentAudio = null;
var indexPlay = 0;
var raf;
var currentPlayIndex = -1;
var isPlayingAll = false;
var selectedSurahId = null;
var currentSurahName = '';

// =========================
// FETCH
// =========================
setListStatus('Memuat daftar surah...');

fetchJson('https://api.quran.com/api/v4/chapters')
.then(d => {
  all = d.chapters || [];
  render(all, { clearDetail: true });
})
.catch(() => {
  setListStatus('Gagal memuat daftar surah.', true);
});

function fetchJson(url){
  return fetch(url).then(r => {
    if(!r.ok) throw new Error();
    return r.json();
  });
}

// =========================
// STATUS
// =========================
function setListStatus(msg, err){
  listEl.innerHTML = err
    ? `<div>${msg} <button onclick="loadChapters()">Retry</button></div>`
    : `<div>${msg}</div>`;
  detailEl.innerHTML = '';
}

function setDetailStatus(msg){
  detailEl.innerHTML = `<div>${msg}</div>`;
}

function loadChapters(){
  setListStatus('Memuat ulang...');
  fetchJson('https://api.quran.com/api/v4/chapters')
    .then(d => {
      all = d.chapters || [];
      render(all, { clearDetail: true });
    });
}

// =========================
// UTIL
// =========================
function escapeHtml(v){
  return String(v||'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;');
}

function cleanTranslation(v){
  return String(v||'').replace(/<[^>]*>/g,' ');
}

// =========================
// RENDER LIST
// =========================
function render(data, opt={}){
  if(!data.length){
    listEl.innerHTML = 'Tidak ada';
    return;
  }

  let html = '<div class="list-grid">';

  data.forEach(s => {
    html += `
      <button class="surah" onclick="loadSurah(${s.id})">
        ${s.id}. ${s.name_simple}
      </button>
    `;
  });

  html += '</div>';
  listEl.innerHTML = html;

  if(opt.clearDetail) detailEl.innerHTML = '';
}

// =========================
// SEARCH
// =========================
search.oninput = function(){
  const val = search.value.toLowerCase();
  const f = all.filter(s =>
    s.name_simple.toLowerCase().includes(val)
  );
  render(f);
};

// =========================
// LOAD SURAH
// =========================
function loadSurah(id){
  stopAudio();
  setDetailStatus('Loading...');

  Promise.all([
    fetchJson(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`),
    fetchJson(`https://api.quran.com/api/v4/quran/translations/33?chapter_number=${id}`),
    fetchJson(`https://api.quran.com/api/v4/quran/recitations/7?chapter_number=${id}`)
  ])
  .then(res => {
    const arab = res[0].verses || [];
    const arti = res[1].translations || [];
    const audio = res[2].audio_files || [];

    audioList = audio.map(a =>
      a.url ? 'https://verses.quran.com/' + a.url : null
    );

    currentSurahName = all.find(s => s.id === id)?.name_simple || '';

    let html = '<div>';

    arab.forEach((a, i) => {
      html += `
        <div class="ayat" id="ayat-${i}">
          <div class="arab">${a.text_uthmani}</div>
          <div class="arti">${cleanTranslation(arti[i]?.text)}</div>

          <button onclick="togglePlayOne(${i})">▶</button>
          <button onclick="shareAyat(${i})">📤</button>
        </div>
      `;
    });

    html += '</div>';
    detailEl.innerHTML = html;

    createModal();
  });
}

// =========================
// AUDIO
// =========================
function stopAudio(){
  if(currentAudio){
    currentAudio.pause();
    currentAudio = null;
  }
}

function togglePlayOne(i){
  if(!audioList[i]) return;

  if(currentAudio){
    currentAudio.pause();
  }

  currentAudio = new Audio(audioList[i]);
  currentAudio.play();
}

// =========================
// SHARE (FAST)
// =========================
let currentShareData = null;

function shareAyat(i){
  const el = document.getElementById('ayat-' + i);

  currentShareData = {
    arab: el.querySelector('.arab').textContent,
    arti: el.querySelector('.arti').textContent,
    surah: currentSurahName,
    ayat: i + 1
  };

  document.getElementById('shareModal').classList.add('open');
  requestAnimationFrame(generateImage);
}

// =========================
// CANVAS FAST
// =========================
function generateImage(){
  const canvas = document.getElementById('shareCanvas');
  const ctx = canvas.getContext('2d');

  const W = canvas.width;
  const H = canvas.height;
  const PAD = 60;

  ctx.fillStyle = '#0b1412';
  ctx.fillRect(0,0,W,H);

  ctx.fillStyle = '#e8c77a';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(currentShareData.surah, W/2, 100);

  let y = 200;

  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = '28px serif';
  wrap(ctx, currentShareData.arab, W-PAD, y, W-PAD*2);

  y += 200;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ccc';
  ctx.font = '18px sans-serif';
  wrap(ctx, currentShareData.arti, PAD, y, W-PAD*2);
}

// wrap text
function wrap(ctx, text, x, y, maxW){
  let words = text.split(' ');
  let line = '';
  let h = 30;

  words.forEach(w => {
    let test = line + w + ' ';
    if(ctx.measureText(test).width > maxW){
      ctx.fillText(line, x, y);
      line = w + ' ';
      y += h;
    }else{
      line = test;
    }
  });

  ctx.fillText(line, x, y);
}

// =========================
// DOWNLOAD
// =========================
function downloadShareImage(){
  const c = document.getElementById('shareCanvas');
  const a = document.createElement('a');
  a.href = c.toDataURL();
  a.download = 'ayat.png';
  a.click();
}

// =========================
// MODAL
// =========================
function createModal(){
  if(document.getElementById('shareModal')) return;

  const div = document.createElement('div');
  div.id = 'shareModal';
  div.innerHTML = `
    <div style="position:fixed;inset:0;background:#000c;">
      <div style="background:#111;padding:20px;margin:40px auto;width:300px">
        <canvas id="shareCanvas" width="1080" height="1080"></canvas>
        <button onclick="downloadShareImage()">Download</button>
        <button onclick="this.closest('#shareModal').classList.remove('open')">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}
