// =========================
// DOM Elements
// =========================
var listEl = document.getElementById('list');
var detailEl = document.getElementById('detail');
var search = document.getElementById('search');

// =========================
// Global Variables
// =========================
var all = [];
var audioList = [];
var currentAudio = null;
var indexPlay = 0;
var raf;
var currentPlayIndex = -1;
var isPlayingAll = false;
var selectedSurahId = null;
var currentSurahName = '';
let currentShareData = null;

// =========================
// Initial Load
// =========================
setListStatus('Memuat daftar surah...');
fetchJson('https://api.quran.com/api/v4/chapters')
  .then(function(d) {
    all = d.chapters || [];
    render(all, { clearDetail: true });
  })
  .catch(function() {
    setListStatus('Gagal memuat daftar surah. Coba refresh halaman.', true);
  });

// Create share modal once
createShareModal();

function createShareModal() {
  if (!document.getElementById('shareModal')) {
    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.className = 'share-modal';
    modal.innerHTML = `
      <div class="share-panel">
        <h3>Bagikan Ayat</h3>
        <canvas id="shareCanvas" class="share-image-canvas" width="1080" height="1080"></canvas>
        <div id="shareLoading" class="share-loading loading-spinner">
          <div class="spinner"></div>
          <div class="loading-text">Membuat gambar...</div>
        </div>
        <div class="share-buttons">
          <button class="primary" onclick="downloadShareImage()">📥 Download PNG</button>
          <button class="secondary" onclick="shareNative()">📱 Share</button>
          <button class="secondary" onclick="closeShareModal()">Tutup</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

// =========================
// Utility Functions
// =========================
function fetchJson(url) {
  return fetch(url).then(function(r) {
    if (!r.ok) {
      throw new Error('Request gagal');
    }
    return r.json();
  });
}

function setListStatus(message, isError) {
  let html = '';
  if (isError) {
    html = '<div class="status-box error"><button class="secondary" onclick="loadChapters()">Coba Lagi</button>' + message + '</div>';
  } else {
    html = '<div class="loading-spinner"><div class="spinner"></div><div class="loading-text">' + message + '</div></div>';
  }
  listEl.innerHTML = html;
  detailEl.innerHTML = '';
  selectedSurahId = null;
}

function loadChapters() {
  setListStatus('Memuat daftar surah...');
  fetchJson('https://api.quran.com/api/v4/chapters')
    .then(d => {
      all = d.chapters || [];
      render(all, { clearDetail: true });
    })
    .catch(() => setListStatus('Gagal memuat. Periksa internet.', true));
}

function setDetailStatus(message, isError) {
  if (isError) {
    detailEl.innerHTML = '<div class="status-box error"><button class="secondary" onclick="loadSurah(selectedSurahId || 1)">Coba Lagi</button><p>' + message + '</p></div>';
  } else {
    detailEl.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><div class="loading-text">' + message + '</div></div>';
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanTranslation(value) {
  var text = String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  var textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function formatRevelation(value) {
  if (!value) { return 'Surah' }
  if (value === 'makkah') { return 'Makkiyah' }
  if (value === 'madinah') { return 'Madaniyah' }
  return value;
}

// =========================
// Share Functions
// =========================
function shareAyat(ayatIndex) {
  const ayatEl = document.getElementById('ayat-' + ayatIndex);
  if (!ayatEl) return;

  const arab = ayatEl.querySelector('.arab').textContent.trim();
  const arti = ayatEl.querySelector('.arti').textContent.trim();

  currentShareData = {
    arab,
    arti,
    surah: currentSurahName,
    ayat: ayatIndex + 1
  };

  openShareModal();
}

function openShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.classList.add('open');
    generateImage();
  }
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.classList.remove('open');
  currentShareData = null;
}

// =========================
// TEXT UTILS
// =========================
function wrapTextSimple(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (let word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test;
    }
  }

  if (line) lines.push(line.trim());
  return lines;
}

function wrapTextLimited(ctx, text, maxWidth, maxLines, fontSize, fontFamily = 'Georgia') {
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (let word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && lines.length < maxLines - 1 && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) {
    if (lines.length < maxLines) {
      lines.push(line);
    } else {
      lines[lines.length - 1] += '...';
    }
  }

  return lines;
}

function drawWrappedLines(ctx, lines, x, y, color, align, fontSize, lineRatio, fontFamily, weight = '') {
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  
  // Fix: handle empty weight properly
  if (weight) {
    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
  } else {
    ctx.font = `${fontSize}px ${fontFamily}`;
  }

  const lineHeight = fontSize * lineRatio;

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });

  ctx.restore();
}

function fitFontSize(ctx, text, maxWidth, maxLines, maxHeight, minSize, maxSize, fontFamily = 'Georgia') {
  let left = minSize,
    right = maxSize;
  let bestSize = minSize;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    ctx.font = `bold ${mid}px ${fontFamily}`;

    const lines = wrapTextSimple(ctx, text, maxWidth);
    const lineHeight = mid * 1.3;

    if (lines.length <= maxLines && (lines.length * lineHeight <= maxHeight)) {
      bestSize = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return bestSize;
}

// =========================
// IMAGE GENERATION
// =========================
function generateImage() {
  try {
    const canvas = document.getElementById('shareCanvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not supported');
      return;
    }

    const loading = document.getElementById('shareLoading');
    if (loading) loading.classList.add('open');

    const WIDTH = 1080;
    const HEIGHT = 1080;
    const PAD = 80;
    const CONTENT_W = WIDTH - 2 * PAD;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 🎨 Background
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, '#08110f');
    gradient.addColorStop(0.5, '#10201d');
    gradient.addColorStop(1, '#07100f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // ✨ Pattern
    ctx.fillStyle = 'rgba(232, 199, 122, 0.03)';
    for (let x = 0; x < WIDTH; x += 50) {
      for (let y = 0; y < HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // =========================
    // HEADER
    // =========================
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#f4dba5';
    ctx.font = 'bold 52px "Georgia", "Times New Roman", serif';
    ctx.fillText(currentShareData.surah, WIDTH / 2, PAD + 60);

    ctx.fillStyle = '#e8c77a';
    ctx.font = 'bold 40px "Georgia", "Times New Roman", serif';
    ctx.fillText('Ayat ' + currentShareData.ayat, WIDTH / 2, PAD + 120);
    ctx.restore();

    // =========================
    // AUTO FLOW START
    // =========================
    let y = PAD + 200;

    // =========================
    // 🔥 ARAB (AUTO SCALE)
    // =========================
    const arabFont = fitFontSize(
      ctx,
      currentShareData.arab,
      CONTENT_W,
      6,
      380,
      26,
      44,
      'Georgia'
    );

    const arabLines = wrapTextLimited(
      ctx,
      currentShareData.arab,
      CONTENT_W,
      6,
      arabFont,
      'Georgia'
    );

    // Glow biar keren 😎
    ctx.shadowColor = 'rgba(232, 199, 122, 0.25)';
    ctx.shadowBlur = 20;

    const arabHeight = arabLines.length * (arabFont * 1.25);

    drawWrappedLines(
      ctx,
      arabLines,
      WIDTH - PAD,
      y,
      '#f6f2e8',
      'right',
      arabFont,
      1.25,
      'Georgia',
      'bold'
    );

    ctx.shadowBlur = 0;

    y += arabHeight + 50;

    // =========================
    // 🔥 ARTI (AUTO SCALE)
    // =========================
    const artiFont = fitFontSize(
      ctx,
      currentShareData.arti,
      CONTENT_W * 0.9,
      5,
      260,
      16,
      26,
      'Georgia'
    );

    const artiLines = wrapTextLimited(
      ctx,
      currentShareData.arti,
      CONTENT_W * 0.9,
      5,
      artiFont,
      'Georgia'
    );

    drawWrappedLines(
      ctx,
      artiLines,
      PAD,
      y,
      '#d4cec1',
      'left',
      artiFont,
      1.4,
      'Georgia'
    );

    // =========================
    // FOOTER
    // =========================
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(232, 199, 122, 0.4)';
    ctx.font = 'italic 24px "Georgia", "Times New Roman", serif';
    ctx.fillText('Qur\'an App by Hamba Allah', WIDTH - PAD, HEIGHT - PAD);
    ctx.restore();

    if (loading) loading.classList.remove('open');
  } catch (error) {
    console.error('Error generating image:', error);
    const loading = document.getElementById('shareLoading');
    if (loading) loading.classList.remove('open');
  }
}

function downloadShareImage() {
  const canvas = document.getElementById('shareCanvas');
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = `ayat-${currentShareData.surah}-${currentShareData.ayat}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function shareNative() {
  const canvas = document.getElementById('shareCanvas');

  if (navigator.share && canvas) {
    canvas.toBlob(blob => {
      const file = new File([blob], 'ayat.png', { type: 'image/png' });
      navigator.share({
        title: `${currentShareData.surah} Ayat ${currentShareData.ayat}`,
        text: currentShareData.arti.substring(0, 100) + '...',
        files: [file]
      }).catch(console.error);
    });
  } else {
    downloadShareImage();
  }
}

// =========================
// Audio Functions
// =========================
function stopAudio(keepIndex) {
  cancelAnimationFrame(raf);

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.onerror = null;
  }

  currentAudio = null;
  isPlayingAll = false;
  indexPlay = 0;

  if (!keepIndex) {
    currentPlayIndex = -1;
  }

  resetBars();
  updatePlayerUI();
}

function resetBars() {
  var bars = document.getElementsByClassName('progress-bar');
  for (var i = 0; i < bars.length; i++) {
    bars[i].style.width = '0%';
  }
}

function updatePlayerUI() {
  var cards = document.getElementsByClassName('ayat');
  for (var i = 0; i < cards.length; i++) {
    cards[i].classList.remove('is-playing');
    var btn = document.getElementById('play-btn-' + i);
    if (btn) {
      btn.classList.remove('is-active');
      btn.textContent = audioList[i] ? 'Play Ayat' : 'Audio Tidak Ada';
    }
  }

  if (currentPlayIndex > -1) {
    var activeCard = document.getElementById('ayat-' + currentPlayIndex);
    var activeBtn = document.getElementById('play-btn-' + currentPlayIndex);
    if (activeCard) {
      activeCard.classList.add('is-playing');
    }
    if (activeBtn) {
      activeBtn.classList.add('is-active');
      activeBtn.textContent = currentAudio && !currentAudio.paused ? 'Pause Ayat' : 'Lanjutkan Ayat';
    }
  }

  var statusText = document.getElementById('player-status-text');
  if (statusText) {
    if (!audioList.length) {
      statusText.textContent = 'Audio belum tersedia untuk surah ini.';
    } else if (currentPlayIndex > -1 && currentAudio && !currentAudio.paused) {
      statusText.textContent = 'Sedang memutar ' + currentSurahName + ', ayat ' + (currentPlayIndex + 1) + (isPlayingAll ? ' dalam mode Play All.' : '.');
    } else if (currentPlayIndex > -1 && currentAudio && currentAudio.paused) {
      statusText.textContent = 'Audio dijeda di ' + currentSurahName + ', ayat ' + (currentPlayIndex + 1) + '.';
    } else {
      statusText.textContent = 'Pilih ayat atau tekan Play All untuk mulai mendengarkan.';
    }
  }

  var playAllBtn = document.getElementById('play-all-btn');
  if (playAllBtn) {
    playAllBtn.classList.toggle('is-active', isPlayingAll && currentAudio && !currentAudio.paused);
    if (!audioList.length) {
      playAllBtn.textContent = 'Audio Tidak Ada';
    } else if (isPlayingAll && currentAudio && !currentAudio.paused) {
      playAllBtn.textContent = 'Pause All';
    } else {
      playAllBtn.textContent = 'Play All';
    }
  }
}

function bindAudioEvents(audio, i) {
  audio.onended = function() {
    var bar = document.getElementById('bar-' + i);
    if (bar) {
      bar.style.width = '100%';
    }

    if (isPlayingAll) {
      indexPlay = i + 1;
      playSequence();
      return;
    }

    stopAudio(true);
  };

  audio.onerror = function() {
    stopAudio(true);
  };
}

function playAudioAt(i, fromSequence) {
  if (!audioList[i]) {
    if (fromSequence) {
      indexPlay = i + 1;
      playSequence();
    }
    return;
  }

  cancelAnimationFrame(raf);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  resetBars();
  currentPlayIndex = i;
  currentAudio = new Audio(audioList[i]);
  isPlayingAll = !!fromSequence;
  bindAudioEvents(currentAudio, i);

  currentAudio.play()
    .then(function() {
      updatePlayerUI();
      startProgress(currentAudio, i);
    })
    .catch(function() {
      stopAudio(true);
    });
}

function togglePlayOne(i) {
  if (!audioList[i]) return;

  if (currentPlayIndex === i && currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    isPlayingAll = false;
    updatePlayerUI();
    return;
  }

  if (currentPlayIndex === i && currentAudio && currentAudio.paused) {
    isPlayingAll = false;
    currentAudio.play()
      .then(function() {
        updatePlayerUI();
        startProgress(currentAudio, i);
      })
      .catch(function() {
        stopAudio(true);
      });
    return;
  }

  playAudioAt(i, false);
}

function togglePlayAll() {
  if (!audioList.length) return;

  if (isPlayingAll && currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    isPlayingAll = false;
    updatePlayerUI();
    return;
  }

  if (currentAudio && currentAudio.paused && currentPlayIndex > -1) {
    isPlayingAll = true;
    currentAudio.play()
      .then(function() {
        updatePlayerUI();
        startProgress(currentAudio, currentPlayIndex);
      })
      .catch(function() {
        stopAudio(true);
      });
    return;
  }

  indexPlay = 0;
  playSequence();
}

function restartCurrentAyat() {
  if (currentPlayIndex < 0 || !audioList[currentPlayIndex]) {
    return;
  }

  playAudioAt(currentPlayIndex, isPlayingAll);
}

function playSequence() {
  while (indexPlay < audioList.length && !audioList[indexPlay]) {
    indexPlay++;
  }

  if (indexPlay >= audioList.length) {
    stopAudio();
    return;
  }

  playAudioAt(indexPlay, true);
}

function startProgress(audio, i) {
  cancelAnimationFrame(raf);

  var bar = document.getElementById('bar-' + i);
  var el = document.getElementById('ayat-' + i);

  if (!bar) return;

  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function loop() {
    if (audio && audio.duration && bar) {
      bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }

    if (audio && !audio.paused) {
      raf = requestAnimationFrame(loop);
    } else {
      updatePlayerUI();
    }
  }

  loop();
}

// =========================
// Render Functions
// =========================
function render(data, options) {
  if (!data) { data = all }
  if (!options) { options = {} }
  var html = '';

  if (!data.length) {
    html = '<div class="empty-state">Surah tidak ditemukan. Coba kata kunci lain.</div>';
  } else {
    html += '<div class="section-head">' +
      '<div>' +
      '<h2 class="section-title">Daftar Surah</h2>' +
      '<div class="section-copy">Pilih salah satu surah untuk membuka ayat, arti, dan audio per ayat.</div>' +
      '</div>' +
      '<div class="section-tag">' + data.length + ' Surah</div>' +
      '</div>';

    html += '<div class="list-grid">';
    for (var i = 0; i < data.length; i++) {
      var isSelected = selectedSurahId === data[i].id;

      html += '<button type="button" class="surah' + (isSelected ? ' is-selected' : '') + '" onclick="loadSurah(' + data[i].id + ')" aria-label="Buka surah ' + escapeHtml(data[i].name_simple) + '">' +
        '<div class="surah-number">' + data[i].id + '</div>' +
        '<h3 class="surah-name">' + escapeHtml(data[i].name_simple) + '</h3>' +
        '<div class="surah-arabic">' + escapeHtml(data[i].name_arabic || '') + '</div>' +
        '<div class="surah-meta">' + escapeHtml(data[i].translated_name ? data[i].translated_name.name : '') + '</div>' +
        '<div class="surah-stats">' +
        '<div class="surah-stat">' + escapeHtml(String(data[i].verses_count || 0)) + ' Ayat</div>' +
        '<div class="surah-stat">' + escapeHtml(formatRevelation(data[i].revelation_place)) + '</div>' +
        '</div>' +
        '<div class="surah-foot">' +
        '<div class="surah-badge">' + (isSelected ? 'Sedang Dibuka' : 'Lihat Detail') + '</div>' +
        '<div class="surah-arrow">' + (isSelected ? 'Aktif' : 'Buka Surah') + '</div>' +
        '</div>' +
        '</button>';
    }
    html += '</div>';
  }

  listEl.innerHTML = html;

  if (options.clearDetail) {
    detailEl.innerHTML = '';
  }

  if (options.resetPlayback) {
    stopAudio();
  }
}

function renderFilteredList() {
  var val = search.value.toLowerCase();
  var filtered = [];
  for (var i = 0; i < all.length; i++) {
    var simple = (all[i].name_simple || '').toLowerCase();
    var arabic = (all[i].name_arabic || '').toLowerCase();
    var translated = (all[i].translated_name && all[i].translated_name.name ? all[i].translated_name.name : '').toLowerCase();
    if (simple.indexOf(val) !== -1 || arabic.indexOf(val) !== -1 || translated.indexOf(val) !== -1) {
      filtered.push(all[i])
    }
  }
  render(filtered);
}

// =========================
// Load Surah
// =========================
function loadSurah(id) {
  stopAudio();
  selectedSurahId = id;
  renderFilteredList();
  setDetailStatus('Memuat detail surah...');

  Promise.all([
    fetchJson('https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=' + id),
    fetchJson('https://api.quran.com/api/v4/quran/translations/33?chapter_number=' + id),
    fetchJson('https://api.quran.com/api/v4/quran/recitations/7?chapter_number=' + id)
  ])
    .then(function(res) {
      var arab = res[0].verses || [];
      var arti = res[1].translations || [];
      var audio = res[2].audio_files || [];
      var selected = null;
      var artiMap = {};

      for (var j = 0; j < all.length; j++) {
        if (all[j].id === id) {
          selected = all[j];
          break;
        }
      }

      currentSurahName = selected ? selected.name_simple : 'Surah ' + id;

      for (var k = 0; k < arti.length; k++) {
        if (arti[k] && arti[k].verse_key) {
          artiMap[arti[k].verse_key] = arti[k];
        }
      }

      audioList = [];
      for (var i = 0; i < audio.length; i++) {
        audioList.push(audio[i].url ? 'https://verses.quran.com/' + audio[i].url : null);
      }

      var html = '<section class="detail-panel">' +
        '<div class="detail-shell">' +
        '<div class="detail-head">' +
        '<div>' +
        '<h2 class="detail-title">' + escapeHtml(selected ? selected.name_simple : 'Detail Surah') + '</h2>' +
        '<div class="detail-subtitle">' + escapeHtml(selected && selected.translated_name ? selected.translated_name.name : '') + '</div>' +
        '<div class="detail-meta">' +
        '<div class="detail-pill">Surah ' + id + '</div>' +
        '<div class="detail-pill">' + arab.length + ' Ayat</div>' +
        '<div class="detail-pill">' + escapeHtml(formatRevelation(selected && selected.revelation_place ? selected.revelation_place : 'Qur\'an')) + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="top-buttons">' +
        '<button onclick="scrollToList()">Kembali ke Daftar</button>' +
        '<button id="play-all-btn" class="primary" onclick="togglePlayAll()"' + (audioList.length ? '' : ' disabled') + '>' + (audioList.length ? 'Play All' : 'Audio Tidak Ada') + '</button>' +
        '</div>' +
        '</div>' +
        '<div class="player-banner">' +
        '<div>' +
        '<div class="player-status-label">Status Pemutar</div>' +
        '<div class="player-status-text" id="player-status-text">Pilih ayat atau tekan Play All untuk mulai mendengarkan.</div>' +
        '</div>' +
        '<button type="button" class="secondary" onclick="restartCurrentAyat()"' + (audioList.length ? '' : ' disabled') + '>Putar Ulang Ayat Aktif</button>' +
        '</div>' +
        '<div class="ayat-list">';

      for (var i = 0; i < arab.length; i++) {
        var artiAyat = artiMap[arab[i].verse_key] || arti[i] || null;
        html += '<div class="ayat" id="ayat-' + i + '">' +
          '<div class="ayat-number">Ayat ' + (i + 1) + '</div>' +
          '<div class="arab">' + escapeHtml(arab[i].text_uthmani) + '</div>' +
          '<div class="arti">' + escapeHtml(cleanTranslation(artiAyat ? artiAyat.text : '')) + '</div>' +
          '<div class="progress"><div class="progress-bar" id="bar-' + i + '"></div></div>' +
          '<div class="ayat-buttons">' +
          '<button id="play-btn-' + i + '" class="play-btn secondary" onclick="togglePlayOne(' + i + ')"' + (audioList[i] ? '' : ' disabled') + '>' + (audioList[i] ? 'Play Ayat' : 'Audio Tidak Ada') + '</button>' +
          '<button class="share-ayat-btn" onclick="shareAyat(' + i + ')">📤 Bagikan</button>' +
          '</div>' +
          '</div>';
      }

      html += '</div></div></section>';

      detailEl.innerHTML = html;
      updatePlayerUI();
      scrollToDetail();
    })
    .catch(function() {
      selectedSurahId = null;
      currentSurahName = '';
      renderFilteredList();
      setDetailStatus('Detail surah gagal dimuat. Silakan coba lagi.', true);
    });
}

// =========================
// Navigation Functions
// =========================
function scrollToList() {
  listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToDetail() {
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =========================
// Search Event
// =========================
search.oninput = function() {
  var val = search.value.toLowerCase();
  var f = [];
  for (var i = 0; i < all.length; i++) {
    var simple = (all[i].name_simple || '').toLowerCase();
    var arabic = (all[i].name_arabic || '').toLowerCase();
    var translated = (all[i].translated_name && all[i].translated_name.name ? all[i].translated_name.name : '').toLowerCase();
    if (simple.indexOf(val) !== -1 || arabic.indexOf(val) !== -1 || translated.indexOf(val) !== -1) {
      f.push(all[i])
    }
  }
  render(f);
};
