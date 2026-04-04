var listEl = document.getElementById('list');
var detailEl = document.getElementById('detail');
var bookmarksEl = document.getElementById('bookmarks');
var search = document.getElementById('search');
var themeToggle = document.getElementById('themeToggle');

var CHAPTERS_URL = 'https://api.quran.com/api/v4/chapters';
var VERSES_URL = 'https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=';
var VERSES_TAJWEED_URL = 'https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=';
var TRANSLATION_URL = 'https://api.quran.com/api/v4/quran/translations/33?chapter_number=';
var RECITATION_URL = 'https://api.quran.com/api/v4/quran/recitations/7?chapter_number=';
var LAST_READ_KEY = 'quran-last-read';
var THEME_KEY = 'quran-theme';
var BOOKMARKS_KEY = 'quran-bookmarks';
var SURAH_MEANINGS_ID = {
  1: 'Pembukaan',
  2: 'Sapi Betina',
  3: 'Keluarga Imran',
  4: 'Perempuan',
  5: 'Hidangan',
  6: 'Binatang Ternak',
  7: 'Tempat Tertinggi',
  8: 'Rampasan Perang',
  9: 'Pengampunan',
  10: 'Yunus',
  11: 'Hud',
  12: 'Yusuf',
  13: 'Guruh',
  14: 'Ibrahim',
  15: 'Hijr',
  16: 'Lebah',
  17: 'Perjalanan Malam',
  18: 'Gua',
  19: 'Maryam',
  20: 'Taha',
  21: 'Para Nabi',
  22: 'Haji',
  23: 'Orang-Orang Mukmin',
  24: 'Cahaya',
  25: 'Pembeda',
  26: 'Para Penyair',
  27: 'Semut',
  28: 'Kisah-Kisah',
  29: 'Laba-Laba',
  30: 'Bangsa Romawi',
  31: 'Luqman',
  32: 'Sujud',
  33: 'Golongan yang Bersekutu',
  34: 'Saba',
  35: 'Pencipta',
  36: 'Yasin',
  37: 'Yang Bershaf',
  38: 'Sad',
  39: 'Rombongan',
  40: 'Yang Mengampuni',
  41: 'Dijelaskan',
  42: 'Musyawarah',
  43: 'Perhiasan',
  44: 'Kabut',
  45: 'Berlutut',
  46: 'Bukit Pasir',
  47: 'Muhammad',
  48: 'Kemenangan',
  49: 'Kamar-Kamar',
  50: 'Qaf',
  51: 'Angin yang Menerbangkan',
  52: 'Bukit',
  53: 'Bintang',
  54: 'Bulan',
  55: 'Yang Maha Pengasih',
  56: 'Hari Kiamat',
  57: 'Besi',
  58: 'Perempuan yang Menggugat',
  59: 'Pengusiran',
  60: 'Perempuan yang Diuji',
  61: 'Barisan',
  62: 'Hari Jumat',
  63: 'Orang-Orang Munafik',
  64: 'Hari Ditampakkan Kesalahan',
  65: 'Talak',
  66: 'Pengharaman',
  67: 'Kerajaan',
  68: 'Pena',
  69: 'Hari Kiamat',
  70: 'Tempat-Tempat Naik',
  71: 'Nuh',
  72: 'Jin',
  73: 'Orang yang Berselimut',
  74: 'Orang yang Berkemul',
  75: 'Kebangkitan',
  76: 'Manusia',
  77: 'Malaikat yang Diutus',
  78: 'Berita Besar',
  79: 'Malaikat yang Mencabut',
  80: 'Ia Bermuka Masam',
  81: 'Penggulungan',
  82: 'Terbelah',
  83: 'Orang-Orang Curang',
  84: 'Terbelah',
  85: 'Gugusan Bintang',
  86: 'Yang Datang di Malam Hari',
  87: 'Yang Paling Tinggi',
  88: 'Hari Pembalasan',
  89: 'Fajar',
  90: 'Negeri',
  91: 'Matahari',
  92: 'Malam',
  93: 'Waktu Dhuha',
  94: 'Lapang',
  95: 'Buah Tin',
  96: 'Segumpal Darah',
  97: 'Kemuliaan',
  98: 'Bukti Nyata',
  99: 'Guncangan',
  100: 'Kuda Perang',
  101: 'Hari Kiamat',
  102: 'Bermegah-Megahan',
  103: 'Masa',
  104: 'Pengumpat',
  105: 'Gajah',
  106: 'Quraisy',
  107: 'Barang-Barang yang Berguna',
  108: 'Nikmat yang Banyak',
  109: 'Orang-Orang Kafir',
  110: 'Pertolongan',
  111: 'Gejolak Api',
  112: 'Ikhlas',
  113: 'Waktu Subuh',
  114: 'Manusia'
};

var all = [];
var filteredSurahs = [];
var audioList = [];
var currentAudio = null;
var currentPlayIndex = -1;
var currentSurahName = '';
var selectedSurahId = null;
var isPlayingAll = false;
var indexPlay = 0;
var raf = null;
var currentShareData = null;
var currentSurahVerseCount = 0;
var currentAyahObserver = null;
var TAJWEED_LEGEND = [
  { label: 'Merah', className: 'iqlb', title: 'Iqlab', arabic: 'إقلاب', reading: 'Nun sukun atau tanwin dibaca berubah menjadi bunyi mim samar sambil dengung.' },
  { label: 'Kuning', className: 'madda_necessary', title: 'Mad', arabic: 'مد', reading: 'Dibaca panjang sesuai jenis mad, biasanya dua sampai enam harakat.' },
  { label: 'Oranye', className: 'ghn', title: 'Ghunnah', arabic: 'غنة', reading: 'Dibaca dengung jelas sekitar dua harakat.' },
  { label: 'Biru', className: 'ikhf', title: 'Ikhfa', arabic: 'إخفاء', reading: 'Nun sukun atau tanwin dibaca samar sambil dengung.' },
  { label: 'Hijau', className: 'idgh_ghn', title: 'Idgham Bighunnah', arabic: 'إدغام بغنة', reading: 'Bacaan dilebur ke huruf berikutnya sambil dengung.' },
  { label: 'Ungu', className: 'idgh_w_ghn', title: 'Idgham Bila Ghunnah', arabic: 'إدغام بلا غنة', reading: 'Bacaan dilebur ke huruf berikutnya tanpa dengung.' },
  { label: 'Cokelat', className: 'qlq', title: 'Qalqalah', arabic: 'قلقلة', reading: 'Huruf dipantulkan ringan dan terdengar memantul.' },
  { label: 'Abu-abu', className: 'ham_wasl', title: 'Hamzatul Washl', arabic: 'همزة الوصل', reading: 'Dibaca halus saat memulai dan biasanya gugur saat disambung.' }
];

function getActionIconSvg(type) {
  if (type === 'pause') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor"></path></svg>';
  }

  if (type === 'copy') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm2-2v2h3a2 2 0 0 1 2 2v5h2V5zm3 14V9H7v10z" fill="currentColor"></path></svg>';
  }

  if (type === 'bookmark') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a2 2 0 0 1 2 2v14l-7-4-7 4V6a2 2 0 0 1 2-2z" fill="currentColor"></path></svg>';
  }

  if (type === 'bookmark-filled') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2z" fill="currentColor"></path></svg>';
  }

  if (type === 'share') {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l6 6-6 6v-4c-5 0-8 1.5-11 6 1-6 4-10 11-11z" fill="currentColor"></path></svg>';
  }

  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" fill="currentColor"></path></svg>';
}

function getPlayButtonMarkup(state, hasAudio) {
  if (!hasAudio) {
    return '<span class="icon-btn-icon" aria-hidden="true">' + getActionIconSvg('play') + '</span><span class="sr-only">Audio tidak ada</span>';
  }

  if (state === 'pause') {
    return '<span class="icon-btn-icon" aria-hidden="true">' + getActionIconSvg('pause') + '</span><span class="sr-only">Pause ayat</span>';
  }

  if (state === 'resume') {
    return '<span class="icon-btn-icon" aria-hidden="true">' + getActionIconSvg('play') + '</span><span class="sr-only">Lanjutkan ayat</span>';
  }

  return '<span class="icon-btn-icon" aria-hidden="true">' + getActionIconSvg('play') + '</span><span class="sr-only">Play ayat</span>';
}

function updatePlayButtonState(button, state, hasAudio) {
  if (!button) {
    return;
  }

  var label = 'Play ayat';

  if (!hasAudio) {
    label = 'Audio tidak ada';
  } else if (state === 'pause') {
    label = 'Pause ayat';
  } else if (state === 'resume') {
    label = 'Lanjutkan ayat';
  }

  button.innerHTML = getPlayButtonMarkup(state, hasAudio);
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
}

function getBookmarkButtonMarkup(active) {
  var label = active ? 'Bookmark tersimpan' : 'Bookmark ayat';
  var iconType = active ? 'bookmark-filled' : 'bookmark';

  return '<span class="icon-btn-icon" aria-hidden="true">' + getActionIconSvg(iconType) + '</span><span class="sr-only">' + label + '</span>';
}

function updateBookmarkButtonState(button, active) {
  if (!button) {
    return;
  }

  var label = active ? 'Bookmark tersimpan' : 'Bookmark ayat';

  button.classList.toggle('is-bookmarked', active);
  button.innerHTML = getBookmarkButtonMarkup(active);
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
}

applySavedTheme();
bindStaticEvents();
loadChapters();
updateLastReadCard();
renderBookmarks();

function bindStaticEvents() {
  if (search) {
    search.addEventListener('input', function () {
      renderFilteredList();
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeShareModal();
    }
  });
}

function applySavedTheme() {
  var savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'day') {
    document.body.classList.add('day');
  }
  updateThemeButtonLabel();
}

function toggleTheme() {
  document.body.classList.toggle('day');
  localStorage.setItem(THEME_KEY, document.body.classList.contains('day') ? 'day' : 'night');
  updateThemeButtonLabel();
}

function updateThemeButtonLabel() {
  if (!themeToggle) {
    return;
  }
  themeToggle.textContent = document.body.classList.contains('day') ? 'Mode Gelap' : 'Mode Terang';
}

function fetchJson(url) {
  return fetch(url).then(function (response) {
    if (!response.ok) {
      throw new Error('Request gagal');
    }
    return response.json();
  });
}

function loadChapters() {
  setListStatus('Memuat daftar surah...');
  stopAudio();

  fetchJson(CHAPTERS_URL)
    .then(function (data) {
      all = data.chapters || [];
      filteredSurahs = all.slice();
      render(filteredSurahs, { clearDetail: true });
      updateSearchSummary(filteredSurahs.length);
    })
    .catch(function () {
      setListStatus('Gagal memuat daftar surah. Periksa koneksi lalu coba lagi.', true);
      updateSearchSummary(0, true);
    });
}

function setListStatus(message, isError) {
  if (!listEl) {
    return;
  }

  if (isError) {
    listEl.innerHTML =
      '<div class="status-box error">' +
      '<p>' + escapeHtml(message) + '</p>' +
      '<button class="secondary" type="button" onclick="loadChapters()">Coba Lagi</button>' +
      '</div>';
  } else {
    listEl.innerHTML =
      '<div class="loading-spinner">' +
      '<div class="spinner"></div>' +
      '<div class="loading-text">' + escapeHtml(message) + '</div>' +
      '</div>';
  }

  if (detailEl) {
    detailEl.innerHTML = '';
  }

  removeDetailFab();

  selectedSurahId = null;
}

function setDetailStatus(message, isError) {
  if (!detailEl) {
    return;
  }

  if (isError) {
    detailEl.innerHTML =
      '<div class="status-box error">' +
      '<p>' + escapeHtml(message) + '</p>' +
      '<button class="secondary" type="button" onclick="retryCurrentSurah()">Muat Ulang Surah</button>' +
      '</div>';
  } else {
    detailEl.innerHTML =
      '<div class="loading-spinner">' +
      '<div class="spinner"></div>' +
      '<div class="loading-text">' + escapeHtml(message) + '</div>' +
      '</div>';
  }
}

function retryCurrentSurah() {
  if (selectedSurahId) {
    loadSurah(selectedSurahId);
    return;
  }
  loadChapters();
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
  var text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  var textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function getSearchValue() {
  return search ? search.value.trim().toLowerCase() : '';
}

function filterSurahs() {
  var value = getSearchValue();
  if (!value) {
    return all.slice();
  }

  var matches = [];
  for (var i = 0; i < all.length; i++) {
    var surah = all[i];
    var simple = (surah.name_simple || '').toLowerCase();
    var arabic = (surah.name_arabic || '').toLowerCase();
    var translated = surah.translated_name && surah.translated_name.name ? surah.translated_name.name.toLowerCase() : '';

    if (simple.indexOf(value) !== -1 || arabic.indexOf(value) !== -1 || translated.indexOf(value) !== -1) {
      matches.push(surah);
    }
  }

  return matches;
}

function renderFilteredList() {
  filteredSurahs = filterSurahs();
  render(filteredSurahs);
  updateSearchSummary(filteredSurahs.length);
}

function render(data, options) {
  if (!listEl) {
    return;
  }

  var items = data || filteredSurahs || all;
  var config = options || {};
  var html = '';

  if (!items.length) {
    html = '<div class="empty-state">Surah tidak ditemukan. Coba kata kunci lain atau hapus pencarian.</div>';
  } else {
    html +=
      '<div class="section-head">' +
      '<div>' +
      '<h2 class="section-title">Daftar Surah</h2>' +
      '<div class="section-copy">Pilih salah satu surah untuk membuka ayat, terjemahan, audio, dan fitur bagikan ayat.</div>' +
      '</div>' +
      '<div class="section-tag">' + items.length + ' Surah</div>' +
      '</div>';

    html += '<div class="list-grid">';

    for (var i = 0; i < items.length; i++) {
      var surah = items[i];
      var isSelected = selectedSurahId === surah.id;

      html +=
        '<button type="button" class="surah' + (isSelected ? ' is-selected' : '') + '" onclick="loadSurah(' + surah.id + ')" aria-label="Buka surah ' + escapeHtml(surah.name_simple) + '">' +
        '<div class="surah-number">' + surah.id + '</div>' +
        '<h3 class="surah-name">' + escapeHtml(surah.name_simple) + '</h3>' +
        '<div class="surah-arabic">' + escapeHtml(surah.name_arabic || '') + '</div>' +
        '<div class="surah-meta">' + escapeHtml(getSurahMeaning(surah.id, surah.translated_name ? surah.translated_name.name : '')) + '</div>' +
        '<div class="surah-stats">' +
        '<div class="surah-stat">' + escapeHtml(String(surah.verses_count || 0)) + ' Ayat</div>' +
        '<div class="surah-stat">' + escapeHtml(formatRevelation(surah.revelation_place)) + '</div>' +
        '</div>' +
        '<div class="surah-foot">' +
        '<div class="surah-badge">' + (isSelected ? 'Sedang Dibuka' : 'Buka Surah') + '</div>' +
        '<div class="surah-arrow">' + (isSelected ? 'Aktif' : 'Lihat Detail') + '</div>' +
        '</div>' +
        '</button>';
    }

    html += '</div>';
  }

  listEl.innerHTML = html;

  if (config.clearDetail && detailEl) {
    detailEl.innerHTML = '';
    removeDetailFab();
  }

  if (config.resetPlayback) {
    stopAudio();
  }
}

function loadSurah(id) {
  var options = arguments[1] || {};
  stopAudio();
  selectedSurahId = id;
  renderFilteredList();
  setDetailStatus('Memuat detail surah...');

  Promise.all([
    fetchJson(VERSES_URL + id),
    fetchJson(VERSES_TAJWEED_URL + id).catch(function () {
      return { verses: [] };
    }),
    fetchJson(TRANSLATION_URL + id),
    fetchJson(RECITATION_URL + id)
  ])
    .then(function (responses) {
      var arab = responses[0].verses || [];
      var tajweedVerses = responses[1].verses || [];
      var translations = responses[2].translations || [];
      var audioFiles = responses[3].audio_files || [];
      var selected = findSurahById(id);
      var translationMap = {};
      var tajweedMap = {};
      var html = '';

      currentSurahName = selected ? selected.name_simple : 'Surah ' + id;
      currentSurahVerseCount = arab.length;
      for (var j = 0; j < translations.length; j++) {
        if (translations[j] && translations[j].verse_key) {
          translationMap[translations[j].verse_key] = translations[j];
        }
      }

      for (var t = 0; t < tajweedVerses.length; t++) {
        if (tajweedVerses[t] && tajweedVerses[t].verse_key) {
          tajweedMap[tajweedVerses[t].verse_key] = tajweedVerses[t];
        }
      }

      audioList = [];
      for (var k = 0; k < audioFiles.length; k++) {
        audioList.push(audioFiles[k].url ? 'https://verses.quran.com/' + audioFiles[k].url : null);
      }

      html += '<section class="detail-panel">';
      html += '<div class="detail-shell">';
      html += '<div class="detail-head" id="surah-top-anchor">';
      html += '<div>';
      html += '<h2 class="detail-title">' + escapeHtml(selected ? selected.name_simple : 'Detail Surah') + '</h2>';
      html += '<div class="detail-subtitle">' + escapeHtml(getSurahMeaning(id, selected && selected.translated_name ? selected.translated_name.name : '')) + '</div>';
      html += '<div class="detail-meta">';
      html += '<div class="detail-pill">Surah ' + id + '</div>';
      html += '<div class="detail-pill">' + arab.length + ' Ayat</div>';
      html += '<div class="detail-pill">' + escapeHtml(formatRevelation(selected && selected.revelation_place)) + '</div>';
      html += '</div>';
      html += '</div>';
      html += '<div class="top-buttons">';
      html += '<button type="button" class="secondary" onclick="scrollToList()">Kembali ke Daftar</button>';
      html += '<button type="button" class="primary" id="play-all-btn" onclick="togglePlayAll()"' + (audioList.length ? '' : ' disabled') + '>' + (audioList.length ? 'Play Semua Ayat' : 'Audio Tidak Ada') + '</button>';
      html += '</div>';
      html += '</div>';

      html += '<div class="player-banner">';
      html += '<div>';
      html += '<div class="player-status-label">Status Pemutar</div>';
      html += '<div class="player-status-text" id="player-status-text">Pilih ayat atau tekan Play Semua Ayat untuk mulai mendengarkan.</div>';
      html += '</div>';
      html += '</div>';
      html += buildQuickJump();
      html += buildReadingTools(id, arab.length);
      html += buildTajweedGuide();
      if (id !== 1 && id !== 9) {
        html += '<div class="bismillah-card arab" id="bismillah-anchor">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>';
      }

      html += '<div class="ayat-list">';

      for (var i = 0; i < arab.length; i++) {
        var verse = arab[i];
        var translation = translationMap[verse.verse_key] || translations[i] || null;
        var tajweedVerse = tajweedMap[verse.verse_key] || null;
        var ayatText = cleanTranslation(translation ? translation.text : '');
        var bookmarkActive = isBookmarked(id, i + 1);
        var arabicHtml = renderArabicVerse(verse, tajweedVerse);

        html += '<article class="ayat" id="ayat-' + i + '">';
        html += '<div class="ayat-number">Ayat ' + (i + 1) + '</div>';
        html += '<div class="arab arab-tajweed">' + arabicHtml + '</div>';
        html += '<div class="arti">' + escapeHtml(ayatText) + '</div>';
        html += '<div class="progress"><div class="progress-bar" id="bar-' + i + '"></div></div>';
        html += '<div class="ayat-buttons">';
        html += '<button type="button" id="play-btn-' + i + '" class="play-btn secondary icon-btn" aria-label="' + (audioList[i] ? 'Play ayat' : 'Audio tidak ada') + '" title="' + (audioList[i] ? 'Play ayat' : 'Audio tidak ada') + '" onclick="togglePlayOne(' + i + ')"' + (audioList[i] ? '' : ' disabled') + '>' + getPlayButtonMarkup('play', !!audioList[i]) + '</button>';
        html += '<button type="button" class="secondary icon-btn" aria-label="Salin ayat" title="Salin ayat" onclick="copyAyat(' + i + ')"><span class="icon-btn-icon" aria-hidden="true">' + getActionIconSvg('copy') + '</span><span class="sr-only">Salin ayat</span></button>';
        html += '<button type="button" class="secondary bookmark-btn icon-btn' + (bookmarkActive ? ' is-bookmarked' : '') + '" id="bookmark-btn-' + i + '" aria-label="' + (bookmarkActive ? 'Bookmark tersimpan' : 'Bookmark ayat') + '" title="' + (bookmarkActive ? 'Bookmark tersimpan' : 'Bookmark ayat') + '" onclick="toggleBookmark(' + id + ',' + i + ')">' + getBookmarkButtonMarkup(bookmarkActive) + '</button>';
        html += '<button type="button" class="share-ayat-btn icon-btn" aria-label="Bagikan ayat" title="Bagikan ayat" onclick="shareAyat(' + i + ')"><span class="icon-btn-icon" aria-hidden="true">' + getActionIconSvg('share') + '</span><span class="sr-only">Bagikan ayat</span></button>';
        html += '</div>';
        html += '</article>';
      }

      html += '</div>';
      html += '</div>';
      html += '</section>';

      if (detailEl) {
        detailEl.innerHTML = html;
      }

      initializeLastReadForSurah(id, currentSurahName);
      ensureShareModal();
      setupAyahObserver();
      updatePlayerUI();
      scrollToDetail();

      if (options.targetAyahNumber) {
        scrollToAyah(options.targetAyahNumber, {
          focus: options.focusAyah !== false,
          save: true
        });
      }
    })
    .catch(function () {
      selectedSurahId = null;
      currentSurahName = '';
      renderFilteredList();
      setDetailStatus('Detail surah gagal dimuat. Silakan coba lagi dalam beberapa saat.', true);
    });
}

function findSurahById(id) {
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) {
      return all[i];
    }
  }
  return null;
}

function formatRevelation(value) {
  if (!value) {
    return 'Informasi Surah';
  }
  if (value === 'makkah') {
    return 'Makkiyah';
  }
  if (value === 'madinah') {
    return 'Madaniyah';
  }
  return value;
}

function getSurahMeaning(id, fallback) {
  return SURAH_MEANINGS_ID[id] || fallback || '';
}

function scrollToList() {
  if (listEl) {
    listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function scrollToDetail() {
  if (detailEl) {
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

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
      updatePlayButtonState(btn, 'play', !!audioList[i]);
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
      updatePlayButtonState(activeBtn, currentAudio && !currentAudio.paused ? 'pause' : 'resume', !!audioList[currentPlayIndex]);
    }
  }

  var statusText = document.getElementById('player-status-text');
  if (statusText) {
    if (!audioList.length) {
      statusText.textContent = 'Audio belum tersedia untuk surah ini.';
    } else if (currentPlayIndex > -1 && currentAudio && !currentAudio.paused) {
      statusText.textContent = 'Sedang memutar ' + currentSurahName + ', ayat ' + (currentPlayIndex + 1) + (isPlayingAll ? ' dalam mode putar semua ayat.' : '.');
    } else if (currentPlayIndex > -1 && currentAudio && currentAudio.paused) {
      statusText.textContent = 'Audio dijeda di ' + currentSurahName + ', ayat ' + (currentPlayIndex + 1) + '.';
    } else {
      statusText.textContent = 'Pilih ayat atau tekan Play Semua Ayat untuk mulai mendengarkan.';
    }
  }

  var playAllBtn = document.getElementById('play-all-btn');
  if (playAllBtn) {
    playAllBtn.classList.toggle('is-active', isPlayingAll && currentAudio && !currentAudio.paused);

    if (!audioList.length) {
      playAllBtn.textContent = 'Audio Tidak Ada';
    } else if (isPlayingAll && currentAudio && !currentAudio.paused) {
      playAllBtn.textContent = 'Pause Semua Ayat';
    } else if (currentPlayIndex > -1 && currentAudio && currentAudio.paused) {
      playAllBtn.textContent = 'Lanjutkan Semua Ayat';
    } else {
      playAllBtn.textContent = 'Play Semua Ayat';
    }
  }
}

function bindAudioEvents(audio, index) {
  audio.onended = function () {
    var bar = document.getElementById('bar-' + index);
    if (bar) {
      bar.style.width = '100%';
    }

    if (isPlayingAll) {
      indexPlay = index + 1;
      playSequence();
      return;
    }

    stopAudio(true);
  };

  audio.onerror = function () {
    stopAudio(true);
  };
}

function playAudioAt(index, fromSequence) {
  if (!audioList[index]) {
    if (fromSequence) {
      indexPlay = index + 1;
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
  currentPlayIndex = index;
  currentAudio = new Audio(audioList[index]);
  isPlayingAll = !!fromSequence;
  bindAudioEvents(currentAudio, index);

  currentAudio.play()
    .then(function () {
      updatePlayerUI();
      startProgress(currentAudio, index);
    })
    .catch(function () {
      stopAudio(true);
    });
}

function togglePlayOne(index) {
  if (!audioList[index]) {
    return;
  }

  if (currentPlayIndex === index && currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    updatePlayerUI();
    return;
  }

  if (currentPlayIndex === index && currentAudio && currentAudio.paused) {
    currentAudio.play()
      .then(function () {
        updatePlayerUI();
        startProgress(currentAudio, index);
      })
      .catch(function () {
        stopAudio(true);
      });
    return;
  }

  playAudioAt(index, false);
}

function togglePlayAll() {
  if (!audioList.length) {
    return;
  }

  if (isPlayingAll && currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    isPlayingAll = false;
    updatePlayerUI();
    return;
  }

  if (currentAudio && currentAudio.paused && currentPlayIndex > -1) {
    isPlayingAll = true;
    currentAudio.play()
      .then(function () {
        updatePlayerUI();
        startProgress(currentAudio, currentPlayIndex);
      })
      .catch(function () {
        stopAudio(true);
      });
    return;
  }

  indexPlay = currentPlayIndex > -1 ? currentPlayIndex : 0;
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

function startProgress(audio, index) {
  cancelAnimationFrame(raf);

  var bar = document.getElementById('bar-' + index);
  var ayatEl = document.getElementById('ayat-' + index);

  if (!bar) {
    return;
  }

  if (ayatEl) {
    ayatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

function ensureShareModal() {
  if (document.getElementById('shareModal')) {
    return;
  }

  var modal = document.createElement('div');
  modal.id = 'shareModal';
  modal.className = 'share-modal';
  modal.innerHTML =
    '<div class="share-backdrop" onclick="closeShareModal()"></div>' +
    '<div class="share-panel" role="dialog" aria-modal="true" aria-label="Bagikan ayat">' +
    '<h3>Bagikan Ayat</h3>' +
    '<canvas id="shareCanvas" class="share-image-canvas" width="1080" height="1080"></canvas>' +
    '<div id="shareLoading" class="share-loading loading-spinner">' +
    '<div class="spinner"></div>' +
    '<div class="loading-text">Membuat gambar...</div>' +
    '</div>' +
    '<div class="share-buttons">' +
    '<button type="button" class="primary" onclick="downloadShareImage()">Download PNG</button>' +
    '<button type="button" class="secondary" onclick="shareNative()">Share</button>' +
    '<button type="button" class="secondary" onclick="closeShareModal()">Tutup</button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function removeDetailFab() {
  var fab = document.getElementById('detail-fab');
  if (fab) {
    fab.remove();
  }
  disconnectAyahObserver();
}

function shareAyat(ayatIndex) {
  var ayatEl = document.getElementById('ayat-' + ayatIndex);
  if (!ayatEl) {
    return;
  }

  var arabEl = ayatEl.querySelector('.arab');
  var artiEl = ayatEl.querySelector('.arti');
  if (!arabEl || !artiEl) {
    return;
  }

  currentShareData = {
    arab: arabEl.textContent.replace(/\s+/g, ' ').trim(),
    arti: artiEl.textContent.trim(),
    surah: currentSurahName,
    ayat: ayatIndex + 1
  };

  openShareModal();
}

function openShareModal() {
  ensureShareModal();

  var modal = document.getElementById('shareModal');
  if (!modal || !currentShareData) {
    return;
  }

  modal.classList.add('open');
  document.body.classList.add('modal-open');
  generateImage();
}

function closeShareModal() {
  var modal = document.getElementById('shareModal');
  if (modal) {
    modal.classList.remove('open');
  }
  document.body.classList.remove('modal-open');
}

function generateImage() {
  var canvas = document.getElementById('shareCanvas');
  var loading = document.getElementById('shareLoading');
  if (!canvas || !currentShareData) {
    return;
  }

  var ctx = canvas.getContext('2d');
  var WIDTH = 1080;
  var HEIGHT = 1080;
  var PAD = 80;
  var CONTENT_W = WIDTH - (2 * PAD);
  var arabFont;
  var arabLines;
  var arabHeight;
  var artiFont;
  var artiLines;
  var y;
  var x;

  if (loading) {
    loading.classList.add('open');
  }

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  var gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#08110f');
  gradient.addColorStop(0.5, '#10201d');
  gradient.addColorStop(1, '#07100f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = 'rgba(232, 199, 122, 0.03)';
  for (x = 0; x < WIDTH; x += 50) {
    for (var yDot = 0; yDot < HEIGHT; yDot += 50) {
      ctx.beginPath();
      ctx.arc(x, yDot, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f4dba5';
  ctx.font = 'bold 52px Georgia';
  ctx.fillText(currentShareData.surah, WIDTH / 2, PAD + 60);
  ctx.fillStyle = '#e8c77a';
  ctx.font = 'bold 40px Georgia';
  ctx.fillText('Ayat ' + currentShareData.ayat, WIDTH / 2, PAD + 120);
  ctx.restore();

  y = PAD + 200;

  arabFont = fitFontSize(ctx, currentShareData.arab, CONTENT_W, 6, 380, 26, 44, true);
  arabLines = wrapTextLimited(ctx, currentShareData.arab, CONTENT_W, 6, arabFont, true);
  ctx.shadowColor = 'rgba(232, 199, 122, 0.25)';
  ctx.shadowBlur = 20;
  arabHeight = arabLines.length * (arabFont * 1.25);
  drawWrappedLines(ctx, arabLines, WIDTH - PAD, y, '#f6f2e8', 'right', arabFont, 1.25, 'Georgia', 'bold');
  ctx.shadowBlur = 0;

  y += arabHeight + 50;

  artiFont = fitFontSize(ctx, currentShareData.arti, CONTENT_W * 0.9, 5, 260, 16, 26, false);
  artiLines = wrapTextLimited(ctx, currentShareData.arti, CONTENT_W * 0.9, 5, artiFont, false);
  drawWrappedLines(ctx, artiLines, PAD, y, '#d4cec1', 'left', artiFont, 1.4, 'Georgia', '');

  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(232, 199, 122, 0.4)';
  ctx.font = 'italic 24px Georgia';
  ctx.fillText('Quran App', WIDTH - PAD, HEIGHT - PAD);
  ctx.restore();

  if (loading) {
    loading.classList.remove('open');
  }
}

function wrapTextLimited(ctx, text, maxWidth, maxLines, fontSize, isArabic) {
  ctx.font = (isArabic ? 'bold ' : '') + fontSize + 'px Georgia';
  return wrapTextSimple(ctx, text, maxWidth).slice(0, maxLines);
}

function wrapTextSimple(ctx, text, maxWidth) {
  var source = String(text || '').trim();
  var words = source.split(/\s+/);
  var lines = [];
  var line = '';

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var test = line ? line + ' ' + word : word;

    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function drawWrappedLines(ctx, lines, x, y, color, align, fontSize, lineRatio, fontFamily, weight) {
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.font = (weight ? weight + ' ' : '') + fontSize + 'px ' + fontFamily;

  var lineHeight = fontSize * lineRatio;
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + (i * lineHeight));
  }
  ctx.restore();
}

function fitFontSize(ctx, text, maxWidth, maxLines, maxHeight, minSize, maxSize, isArabic) {
  var left = minSize;
  var right = maxSize;
  var bestSize = minSize;

  while (left <= right) {
    var mid = Math.floor((left + right) / 2);
    ctx.font = (isArabic ? 'bold ' : '') + mid + 'px Georgia';

    var lines = wrapTextSimple(ctx, text, maxWidth);
    var lineHeight = mid * 1.3;

    if (lines.length <= maxLines && (lines.length * lineHeight <= maxHeight)) {
      bestSize = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return bestSize;
}

function sanitizeFileName(value) {
  return String(value || 'ayat')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function downloadShareImage() {
  var canvas = document.getElementById('shareCanvas');
  if (!canvas || !currentShareData) {
    return;
  }

  var link = document.createElement('a');
  link.download = 'ayat-' + sanitizeFileName(currentShareData.surah) + '-' + currentShareData.ayat + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function shareNative() {
  var canvas = document.getElementById('shareCanvas');
  if (!canvas || !currentShareData) {
    return;
  }

  if (navigator.share && canvas.toBlob) {
    canvas.toBlob(function (blob) {
      if (!blob) {
        downloadShareImage();
        return;
      }

      var file = new File([blob], 'ayat.png', { type: 'image/png' });
      navigator.share({
        title: currentShareData.surah + ' Ayat ' + currentShareData.ayat,
        text: currentShareData.arti,
        files: [file]
      }).catch(function () {
        downloadShareImage();
      });
    });
  } else {
    downloadShareImage();
  }
}

function copyAyat(index) {
  var ayatEl = document.getElementById('ayat-' + index);
  if (!ayatEl) {
    return;
  }

  var arabEl = ayatEl.querySelector('.arab');
  var artiEl = ayatEl.querySelector('.arti');
  var text = currentSurahName + ' ayat ' + (index + 1) + '\n\n' + (arabEl ? arabEl.textContent.trim() : '') + '\n\n' + (artiEl ? artiEl.textContent.trim() : '');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(function () {
        showToast('Ayat berhasil disalin.');
      })
      .catch(function () {
        fallbackCopyText(text);
      });
    return;
  }

  fallbackCopyText(text);
}

function renderArabicVerse(verse, tajweedVerse) {
  if (tajweedVerse && tajweedVerse.text_uthmani_tajweed) {
    return tajweedVerse.text_uthmani_tajweed;
  }
  return escapeHtml(verse && verse.text_uthmani ? verse.text_uthmani : '');
}

function saveLastRead(payload) {
  localStorage.setItem(LAST_READ_KEY, JSON.stringify(payload));
}

function rememberLastRead(id, name, ayatNumber) {
  saveLastRead({
    id: id,
    name: name,
    ayatNumber: ayatNumber || 1,
    updatedAt: Date.now()
  });
  updateLastReadCard();
}

function initializeLastReadForSurah(id, name) {
  var lastRead = readLastRead();
  if (!lastRead || lastRead.id !== id) {
    rememberLastRead(id, name, 1);
    return;
  }

  localStorage.setItem(LAST_READ_KEY, JSON.stringify({
    id: id,
    name: name,
    ayatNumber: lastRead.ayatNumber || 1,
    updatedAt: Date.now()
  }));
  updateLastReadCard();
}

function readLastRead() {
  try {
    return JSON.parse(localStorage.getItem(LAST_READ_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

function updateLastReadCard() {
  var lastRead = readLastRead();
  var nameEl = document.getElementById('last-read-name');
  var copyEl = document.getElementById('last-read-copy');

  if (!nameEl || !copyEl) {
    return;
  }

  if (!lastRead || !lastRead.id) {
    nameEl.textContent = 'Belum ada';
    copyEl.textContent = 'Surah yang terakhir dibuka akan muncul di sini.';
    refreshReadingTools();
    return;
  }

  nameEl.textContent = lastRead.name || ('Surah ' + lastRead.id);
  copyEl.textContent = 'Lanjutkan dari ' + (lastRead.name || ('Surah ' + lastRead.id)) + ', ayat ' + (lastRead.ayatNumber || 1) + '.';
  refreshReadingTools();
}

function openLastRead() {
  var lastRead = readLastRead();
  if (lastRead && lastRead.id) {
    loadSurah(lastRead.id, {
      targetAyahNumber: lastRead.ayatNumber || 1,
      focusAyah: true
    });
    return;
  }
  scrollToList();
}

function buildReadingTools(surahId, totalAyat) {
  var html = '';
  var lastRead = readLastRead();
  var canContinue = lastRead && lastRead.id === surahId && lastRead.ayatNumber && lastRead.ayatNumber <= totalAyat;

  html += '<section class="reading-tools">';
  html += '<div class="reading-tools-copy">';
  html += '<div class="reading-tools-title">Lanjutkan Bacaan</div>';
  html += '<div class="reading-tools-text">Lompat ke ayat tertentu atau lanjutkan dari ayat terakhir yang tersimpan.</div>';
  html += '</div>';
  html += '<div class="reading-tools-actions">';
  html += '<button type="button" id="continue-reading-btn" class="secondary reading-tools-btn" onclick="continueCurrentSurah()"' + (canContinue ? '' : ' disabled') + '>' + (canContinue ? 'Ayat Terakhir: ' + lastRead.ayatNumber : 'Belum Ada Riwayat') + '</button>';
  html += '<div class="jump-ayah-box">';
  html += '<input id="jump-ayah-input" class="jump-ayah-input" type="number" min="1" max="' + totalAyat + '" placeholder="Nomor ayat">';
  html += '<button type="button" class="primary jump-ayah-btn" onclick="jumpToAyah()">Lompat</button>';
  html += '</div>';
  html += '</div>';
  html += '</section>';
  return html;
}

function refreshReadingTools() {
  var button = document.getElementById('continue-reading-btn');
  var lastRead = readLastRead();

  if (!button) {
    return;
  }

  if (lastRead && lastRead.id === selectedSurahId && lastRead.ayatNumber) {
    button.disabled = false;
    button.textContent = 'Ayat Terakhir: ' + lastRead.ayatNumber;
  } else {
    button.disabled = true;
    button.textContent = 'Belum Ada Riwayat';
  }
}

function buildTajweedGuide() {
  var html = '';
  html += '<section class="tajweed-guide">';
  html += '<div class="tajweed-guide-head">';
  html += '<div>';
  html += '<h3 class="tajweed-legend-title">Belajar Tajwid</h3>';
  html += '<p class="tajweed-legend-copy">Tekan tombol panduan untuk melihat nama hukum, tulisan Arab, dan keterangan singkatnya.</p>';
  html += '</div>';
  html += '<button type="button" class="secondary tajweed-toggle-btn" onclick="toggleTajweedGuide()">Panduan Tajwid</button>';
  html += '</div>';
  html += '<div class="tajweed-guide-panel" id="tajweed-guide-panel" hidden>';
  html += '<div class="tajweed-legend-list">';

  for (var i = 0; i < TAJWEED_LEGEND.length; i++) {
    html += '<div class="tajweed-item">';
    html += '<span class="tajweed-chip ' + TAJWEED_LEGEND[i].className + '">' + TAJWEED_LEGEND[i].label + '</span>';
    html += '<div class="tajweed-item-copy">';
    html += '<div class="tajweed-item-name">' + TAJWEED_LEGEND[i].title + '</div>';
    html += '<div class="tajweed-item-arabic">' + TAJWEED_LEGEND[i].arabic + '</div>';
    html += '<div class="tajweed-item-reading">' + TAJWEED_LEGEND[i].reading + '</div>';
    html += '</div>';
    html += '</div>';
  }

  html += '</div>';
  html += '</div>';
  html += '</section>';
  return html;
}

function toggleTajweedGuide() {
  var panel = document.getElementById('tajweed-guide-panel');
  if (!panel) {
    return;
  }

  panel.hidden = !panel.hidden;
}

function buildQuickJump() {
  var html = '';
  html += '<div class="detail-fab" id="detail-fab">';
  html += '<button type="button" class="detail-fab-btn detail-fab-icon" onclick="scrollToSurahTop()" aria-label="Ke judul surah" title="Ke judul surah">&#8593;</button>';
  html += '</div>';
  return html;
}

function scrollToSurahTop() {
  var anchor = document.getElementById('surah-top-anchor');
  if (anchor) {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  scrollToDetail();
}

function scrollToBismillah() {
  var bismillah = document.getElementById('bismillah-anchor');
  if (bismillah) {
    bismillah.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  scrollToSurahTop();
}

function jumpToAyah() {
  var input = document.getElementById('jump-ayah-input');
  if (!input) {
    return;
  }

  var ayatNumber = parseInt(input.value, 10);
  if (!ayatNumber || ayatNumber < 1 || ayatNumber > currentSurahVerseCount) {
    showToast('Masukkan nomor ayat yang valid.');
    return;
  }

  scrollToAyah(ayatNumber, {
    focus: true,
    save: true
  });
}

function continueCurrentSurah() {
  var lastRead = readLastRead();
  if (!lastRead || lastRead.id !== selectedSurahId || !lastRead.ayatNumber) {
    showToast('Belum ada ayat terakhir untuk surah ini.');
    return;
  }

  scrollToAyah(lastRead.ayatNumber, {
    focus: true,
    save: true
  });
}

function scrollToAyah(ayatNumber, options) {
  var config = options || {};
  var index = ayatNumber - 1;
  var target = document.getElementById('ayat-' + index);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlightAyah(index);

  if (config.save !== false && selectedSurahId) {
    rememberLastRead(selectedSurahId, currentSurahName, ayatNumber);
  }
}

function highlightAyah(index) {
  var target = document.getElementById('ayat-' + index);
  if (!target) {
    return;
  }

  target.classList.add('is-focused');
  setTimeout(function () {
    target.classList.remove('is-focused');
  }, 2200);
}

function setupAyahObserver() {
  disconnectAyahObserver();

  if (!('IntersectionObserver' in window)) {
    return;
  }

  currentAyahObserver = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting && entries[i].intersectionRatio > 0.55 && selectedSurahId) {
        var ayatIndex = parseInt(entries[i].target.getAttribute('data-ayat-index'), 10);
        if (!isNaN(ayatIndex)) {
          rememberLastRead(selectedSurahId, currentSurahName, ayatIndex + 1);
        }
      }
    }
  }, {
    threshold: [0.55],
    rootMargin: '-10% 0px -45% 0px'
  });

  var ayatItems = document.querySelectorAll('.ayat');
  for (var j = 0; j < ayatItems.length; j++) {
    ayatItems[j].setAttribute('data-ayat-index', j);
    currentAyahObserver.observe(ayatItems[j]);
  }
}

function disconnectAyahObserver() {
  if (currentAyahObserver) {
    currentAyahObserver.disconnect();
    currentAyahObserver = null;
  }
}

function fallbackCopyText(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'readonly');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand('copy');
    showToast('Ayat berhasil disalin.');
  } catch (error) {
    showToast('Gagal menyalin ayat di perangkat ini.');
  }

  document.body.removeChild(textarea);
}

function ensureToast() {
  var existing = document.getElementById('appToast');
  if (existing) {
    return existing;
  }

  var toast = document.createElement('div');
  toast.id = 'appToast';
  toast.className = 'app-toast';
  document.body.appendChild(toast);
  return toast;
}

function showToast(message) {
  var toast = ensureToast();
  toast.textContent = message;
  toast.classList.add('open');

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    toast.classList.remove('open');
  }, 2200);
}

function readBookmarks() {
  try {
    var items = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
    return Array.isArray(items) ? items : [];
  } catch (error) {
    return [];
  }
}

function saveBookmarks(items) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(items));
}

function isBookmarked(surahId, ayatNumber) {
  var items = readBookmarks();
  for (var i = 0; i < items.length; i++) {
    if (items[i].surahId === surahId && items[i].ayatNumber === ayatNumber) {
      return true;
    }
  }
  return false;
}

function toggleBookmark(surahId, ayatIndex) {
  var ayatNumber = ayatIndex + 1;
  var items = readBookmarks();
  var next = [];
  var removed = false;
  var ayatEl = document.getElementById('ayat-' + ayatIndex);
  var arabEl = ayatEl ? ayatEl.querySelector('.arab') : null;
  var artiEl = ayatEl ? ayatEl.querySelector('.arti') : null;

  for (var i = 0; i < items.length; i++) {
    if (items[i].surahId === surahId && items[i].ayatNumber === ayatNumber) {
      removed = true;
      continue;
    }
    next.push(items[i]);
  }

  if (!removed) {
    next.unshift({
      surahId: surahId,
      surahName: currentSurahName || ('Surah ' + surahId),
      ayatNumber: ayatNumber,
      arab: arabEl ? arabEl.textContent.replace(/\s+/g, ' ').trim() : '',
      arti: artiEl ? artiEl.textContent.trim() : '',
      savedAt: Date.now()
    });
  }

  saveBookmarks(next.slice(0, 50));
  renderBookmarks();
  updateBookmarkButton(ayatIndex, !removed);
}

function updateBookmarkButton(ayatIndex, active) {
  var btn = document.getElementById('bookmark-btn-' + ayatIndex);
  if (!btn) {
    return;
  }

  updateBookmarkButtonState(btn, active);
}

function renderBookmarks() {
  if (!bookmarksEl) {
    return;
  }

  var items = readBookmarks();
  var html = '';

  html += '<section class="bookmark-panel">';
  html += '<div class="section-head">';
  html += '<div><h2 class="section-title">Bookmark Ayat</h2><div class="section-copy">Simpan ayat yang ingin dibaca lagi nanti.</div></div>';
  html += '<div class="section-tag">' + items.length + ' Tersimpan</div>';
  html += '</div>';

  if (!items.length) {
    html += '<div class="empty-state">Belum ada bookmark. Simpan ayat favorit langsung dari detail surah.</div>';
  } else {
    html += '<div class="bookmark-list">';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      html += '<article class="bookmark-card">';
      html += '<div class="bookmark-top">';
      html += '<div>';
      html += '<div class="bookmark-title">' + escapeHtml(item.surahName) + '</div>';
      html += '<div class="bookmark-meta">Ayat ' + item.ayatNumber + '</div>';
      html += '</div>';
      html += '<button type="button" class="secondary" onclick="removeBookmark(' + item.surahId + ',' + item.ayatNumber + ')">Hapus</button>';
      html += '</div>';
      html += '<div class="bookmark-arab">' + escapeHtml(item.arab) + '</div>';
      html += '<div class="bookmark-arti">' + escapeHtml(item.arti) + '</div>';
      html += '<div class="bookmark-actions">';
      html += '<button type="button" class="primary" onclick="openBookmark(' + item.surahId + ',' + item.ayatNumber + ')">Buka Ayat</button>';
      html += '</div>';
      html += '</article>';
    }
    html += '</div>';
  }

  html += '</section>';
  bookmarksEl.innerHTML = html;
}

function removeBookmark(surahId, ayatNumber) {
  var items = readBookmarks();
  var next = [];

  for (var i = 0; i < items.length; i++) {
    if (items[i].surahId === surahId && items[i].ayatNumber === ayatNumber) {
      continue;
    }
    next.push(items[i]);
  }

  saveBookmarks(next);
  renderBookmarks();

  if (selectedSurahId === surahId) {
    updateBookmarkButton(ayatNumber - 1, false);
  }
}

function openBookmark(surahId, ayatNumber) {
  loadSurah(surahId, {
    targetAyahNumber: ayatNumber,
    focusAyah: true
  });
}

function updateSearchSummary(count, failed) {
  var countEl = document.getElementById('surah-count');
  var copyEl = document.getElementById('surah-count-copy');
  var query = getSearchValue();

  if (!countEl || !copyEl) {
    return;
  }

  if (failed) {
    countEl.textContent = '0';
    copyEl.textContent = 'Daftar surah belum berhasil dimuat.';
    return;
  }

  countEl.textContent = String(count);
  if (!query) {
    copyEl.textContent = 'Daftar surah siap dibuka. Pilih surah untuk mulai membaca dan mendengarkan.';
  } else if (count) {
    copyEl.textContent = 'Menampilkan hasil pencarian untuk "' + query + '".';
  } else {
    copyEl.textContent = 'Tidak ada surah yang cocok dengan pencarian "' + query + '".';
  }
}

