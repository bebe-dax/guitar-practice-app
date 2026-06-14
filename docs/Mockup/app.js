/* ════════════════════════════════════════════
   Guitar Practice — UIモックアップ logic
   ════════════════════════════════════════════ */

/* ───── 音楽理論データ（モック用ミニロジック） ───── */
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 開放弦のピッチ（Cからの半音数）: E2 A2 D3 G3 B3 E4
const TUNING = [4, 9, 14, 19, 23, 28];

const SCALES = {
  major:     { name: 'major',            intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor:     { name: 'natural minor',    intervals: [0, 2, 3, 5, 7, 8, 10] },
  majorPent: { name: 'major pentatonic', intervals: [0, 2, 4, 7, 9] },
  minorPent: { name: 'minor pentatonic', intervals: [0, 3, 5, 7, 10] },
  blues:     { name: 'blues',            intervals: [0, 3, 5, 6, 7, 10] },
};

// 詳細画面デモ用のコード構成音（ピッチクラス）
const CHORD_NOTES = {
  C:  [0, 4, 7],
  G:  [7, 11, 2],
  Am: [9, 0, 4],
  F:  [5, 9, 0],
};

// ダイアトニックコード定義（メジャー系 / マイナー系）
const DIATONIC = {
  major: {
    degrees: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    offsets: [0, 2, 4, 5, 7, 9, 11],
    quality: ['', 'm', 'm', '', '', 'm', 'dim'],
  },
  minor: {
    degrees: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    offsets: [0, 2, 3, 5, 7, 8, 10],
    quality: ['m', 'dim', '', 'm', 'm', '', ''],
  },
};

const MINOR_SCALES = ['minor', 'minorPent', 'blues'];

/* ───── 状態 ───── */
const state = { key: 'A', scale: 'minorPent', fretStart: 0 };

/* ───── ヘルパー ───── */
const $ = (id) => document.getElementById(id);

function scalePitchClasses(keyIndex, scaleKey) {
  return SCALES[scaleKey].intervals.map((i) => (keyIndex + i) % 12);
}

/* ───── 指板SVG描画 ───── */
const FB = {
  width: 1280,
  height: 320,
  padL: 52,
  padR: 16,
  padT: 26,
  padB: 38,
  fretCount: 12,
  stringNames: ['e', 'B', 'G', 'D', 'A', 'E'],
  singleInlays: [3, 5, 7, 9, 15, 17, 19, 21],
  doubleInlays: [12, 24],
};

function renderFretboard(svgId, pitchClasses, rootPc, fretStart) {
  const svg = $(svgId);
  const { width: W, height: H, padL, padR, padT, padB, fretCount } = FB;
  const fbW = W - padL - padR;
  const fbH = H - padT - padB;
  const fretW = fbW / fretCount;
  const stringH = fbH / 5;
  const parts = [];

  // 指板面
  parts.push(`<rect x="${padL}" y="${padT - 8}" width="${fbW}" height="${fbH + 16}" rx="6" fill="var(--surface2)" opacity=".45"/>`);

  // フレット縦線（開始位置が0のときは左端をナットとして太線に）
  for (let f = 0; f <= fretCount; f++) {
    const x = padL + f * fretW;
    const isNut = fretStart === 0 && f === 0;
    parts.push(`<line x1="${x}" y1="${padT - 8}" x2="${x}" y2="${padT + fbH + 8}" stroke="${isNut ? 'var(--text-sec)' : 'var(--fret-wire)'}" stroke-width="${isNut ? 7 : 2.5}"/>`);
  }

  // ポジションマーク・フレット番号
  for (let f = 0; f < fretCount; f++) {
    const fretNum = fretStart + f + 1;
    const cx = padL + f * fretW + fretW / 2;
    if (FB.singleInlays.includes(fretNum)) {
      parts.push(`<circle cx="${cx}" cy="${padT + fbH / 2}" r="6.5" fill="var(--surface3)"/>`);
    }
    if (FB.doubleInlays.includes(fretNum)) {
      parts.push(`<circle cx="${cx}" cy="${padT + fbH * 0.28}" r="6.5" fill="var(--surface3)"/>`);
      parts.push(`<circle cx="${cx}" cy="${padT + fbH * 0.72}" r="6.5" fill="var(--surface3)"/>`);
    }
    parts.push(`<text x="${cx}" y="${H - 10}" fill="var(--text-mut)" font-size="13" font-family="JetBrains Mono" text-anchor="middle">${fretNum}</text>`);
  }

  // 弦（上=1弦 細 → 下=6弦 太）と弦名ラベル
  for (let s = 0; s < 6; s++) {
    const y = padT + s * stringH;
    parts.push(`<line x1="${padL}" y1="${y}" x2="${padL + fbW}" y2="${y}" stroke="var(--string)" stroke-width="${1 + s * 0.5}" opacity=".75"/>`);
    parts.push(`<text x="${padL - 20}" y="${y + 4.5}" fill="var(--text-mut)" font-size="12.5" font-family="JetBrains Mono" text-anchor="middle">${FB.stringNames[s]}</text>`);
  }

  // 音符ドット
  for (let s = 0; s < 6; s++) {
    const openPitch = TUNING[5 - s];
    for (let f = 0; f < fretCount; f++) {
      const pc = (openPitch + fretStart + f + 1) % 12;
      if (!pitchClasses.includes(pc)) continue;
      const cx = padL + f * fretW + fretW / 2;
      const cy = padT + s * stringH;
      const isRoot = pc === rootPc;
      const stroke = isRoot ? 'var(--root)' : 'var(--note)';
      const fill = isRoot ? 'var(--root-bg)' : 'var(--note-bg)';
      parts.push(`<circle cx="${cx}" cy="${cy}" r="17" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>`);
      parts.push(`<text x="${cx}" y="${cy + 4.5}" fill="${stroke}" font-size="13" font-weight="600" font-family="JetBrains Mono" text-anchor="middle">${NOTES[pc]}</text>`);
    }
  }

  // 開放弦インジケーター
  if (fretStart === 0) {
    for (let s = 0; s < 6; s++) {
      const pc = TUNING[5 - s] % 12;
      if (!pitchClasses.includes(pc)) continue;
      const stroke = pc === rootPc ? 'var(--root)' : 'var(--note)';
      parts.push(`<circle cx="${padL - 36}" cy="${padT + s * stringH}" r="9" fill="none" stroke="${stroke}" stroke-width="1.8" opacity=".8"/>`);
    }
  }

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = parts.join('');
}

/* ───── ホーム画面 ───── */
function updateHome() {
  const keyIndex = NOTES.indexOf(state.key);
  const pcs = scalePitchClasses(keyIndex, state.scale);
  renderFretboard('fbSvg', pcs, keyIndex, state.fretStart);

  $('fretRangeHint').textContent = `フレット ${state.fretStart + 1}–${state.fretStart + FB.fretCount}`;
  $('fretVal').textContent = state.fretStart;
  $('scaleNameHint').textContent = `${state.key} ${SCALES[state.scale].name}`;

  $('noteBadges').innerHTML = pcs
    .map((pc) => `<div class="note-badge ${pc === keyIndex ? 'root' : ''}">${NOTES[pc]}</div>`)
    .join('');

  const isMinor = MINOR_SCALES.includes(state.scale);
  const dia = DIATONIC[isMinor ? 'minor' : 'major'];
  $('diaHint').textContent = `${state.key}${isMinor ? 'm' : ''} キー`;
  $('diaRow').innerHTML = dia.degrees
    .map((deg, i) => {
      const root = NOTES[(keyIndex + dia.offsets[i]) % 12];
      const quality = dia.quality[i];
      return `<div class="dia-card ${i === 0 ? 'hi' : ''}">
        <div class="deg ${quality === 'dim' ? 'dim' : ''}">${deg}</div>
        <div class="name">${root}${quality}</div>
      </div>`;
    })
    .join('');
}

function initHomeControls() {
  const pillWrap = $('keyPills');
  NOTES.filter((n) => !n.includes('#')).forEach((key) => {
    const btn = document.createElement('button');
    btn.className = 'pill' + (key === state.key ? ' sel' : '');
    btn.textContent = key;
    btn.onclick = () => {
      state.key = key;
      pillWrap.querySelectorAll('.pill').forEach((p) => p.classList.toggle('sel', p.textContent === key));
      updateHome();
    };
    pillWrap.appendChild(btn);
  });

  $('scaleSelect').onchange = (e) => { state.scale = e.target.value; updateHome(); };
  $('fretSlider').oninput = (e) => { state.fretStart = Number(e.target.value); updateHome(); };
}

/* ───── 詳細画面 ───── */
function renderDetailChord(chordName) {
  const pcs = CHORD_NOTES[chordName] ?? CHORD_NOTES.C;
  renderFretboard('fbSvgDetail', pcs, pcs[0], 0);
  $('detailFbHint').textContent = `${chordName} の構成音 (${pcs.map((p) => NOTES[p]).join(', ')})`;
}

function initDetailStepper() {
  document.querySelectorAll('#detailStepper .step-chord').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('#detailStepper .step-chord').forEach((b) => b.classList.remove('now'));
      btn.classList.add('now');
      renderDetailChord(btn.dataset.chord);
    };
  });
}

/* ───── サイドバー開閉 ───── */
function initSidebar() {
  const toggle = $('sbToggle');
  toggle.onclick = () => {
    document.body.classList.toggle('sb-closed');
    toggle.textContent = document.body.classList.contains('sb-closed') ? '▶' : '◀';
  };
}

/* ───── 画面ナビゲーション ───── */
const SCREENS = { home: 'scr-home', list: 'scr-list', new: 'scr-new', detail: 'scr-detail' };

function nav(target) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('visible'));
  $(SCREENS[target]).classList.add('visible');
  document.querySelectorAll('.nav-item').forEach((n) => {
    const active = n.dataset.nav === target || (target === 'detail' && n.dataset.nav === 'list');
    n.classList.toggle('active', active);
  });
  document.querySelector('.main').scrollTo(0, 0);
}

function initNav() {
  document.querySelectorAll('.nav-item').forEach((n) => {
    n.onclick = () => nav(n.dataset.nav);
  });
}

/* ───── 初期化 ───── */
initSidebar();
initNav();
initHomeControls();
initDetailStepper();
updateHome();
renderFretboard('fbSvgPreview', CHORD_NOTES.C, 0, 0);
renderDetailChord('C');
