// --- 1. 字幕を自動でオンにする ---
const checkTimer = setInterval(() => {
  const allButtons = document.querySelectorAll('button');
  let captionButton = null;
  for (const btn of allButtons) {
    if (btn.innerText.includes('closed_caption_off')) {
      captionButton = btn;
      break;
    }
  }
  if (captionButton) {
    captionButton.click();
    clearInterval(checkTimer);
    initCopyWindow(); 
  }
}, 1000);

// --- 2. 軽量化された小窓を作成する ---
function initCopyWindow() {
  // 既にウィンドウがある場合は削除（イベントリスナーの重複防止のため完全リセット推奨）
  const existing = document.getElementById('copy-caption-window');
  if (existing) existing.remove();

  // --- UI構築 ---
  const container = document.createElement('div');
  container.id = 'copy-caption-window';
  
  container.innerHTML = `
    <div id="copy-caption-header" style="padding: 8px; background: #202124; color: white; font-size: 12px; cursor: move; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; flex-shrink: 0;">
      <span style="font-weight: bold;">✥ 字幕コピー (軽量版)</span>
      <button id="clear-caption" style="background: #ea4335; color: white; border: none; cursor: pointer; border-radius: 3px; padding: 2px 8px;">消去</button>
    </div>
    <div id="copy-caption-body" style="flex-grow: 1; overflow-y: auto; padding: 10px; background: #ffffff; color: #202124; font-family: sans-serif; font-size: 14px; line-height: 1.5; user-select: text !important;">
      <div style="color: #777;">待機中...</div>
    </div>
  `;

  Object.assign(container.style, {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    width: '320px',
    height: '300px',
    minWidth: '200px',
    minHeight: '150px',
    zIndex: '10001',
    border: '1px solid #dadce0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    resize: 'both'
  });

  document.body.appendChild(container);

  // --- ドラッグ処理（軽量化） ---
  const header = document.getElementById('copy-caption-header');
  let isDragging = false;
  let offsetX, offsetY;

  // マウスイベントの関数を定義（削除可能にするため）
  const onMouseMove = (e) => {
    if (!isDragging) return;
    // requestAnimationFrameを使って描画負荷を下げる
    requestAnimationFrame(() => {
        container.style.left = (e.clientX - offsetX) + 'px';
        container.style.top = (e.clientY - offsetY) + 'px';
        container.style.bottom = 'auto';
        container.style.right = 'auto';
    });
  };

  const onMouseUp = () => {
    isDragging = false;
    header.style.background = '#202124';
    document.removeEventListener('mousemove', onMouseMove); // ドラッグ終了時は監視しない
    document.removeEventListener('mouseup', onMouseUp);
  };

  header.onmousedown = (e) => {
    const rect = container.getBoundingClientRect();
    // リサイズ判定
    if (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20) return;

    isDragging = true;
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    header.style.background = '#3c4043';

    // ドラッグ中のみイベントリスナーを貼る（常時監視を防ぐ）
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // --- 字幕監視ロジック（ここが最大の軽量化ポイント） ---
  const body = document.getElementById('copy-caption-body');
  document.getElementById('clear-caption').onclick = () => {
      body.innerHTML = '<div style="color: #777;">消去しました。</div>';
  };

  let lastText = "";
  let isProcessing = false; // 重複処理防止フラグ

  const observer = new MutationObserver((mutations) => {
    // 【重要】処理中なら何もしない（間引き処理）
    if (isProcessing) return;

    isProcessing = true;

    // 500ms後に一度だけ実行する（1秒に2回しか重い処理を走らせない）
    setTimeout(() => {
        updateTranscript();
        isProcessing = false;
    }, 500); 
  });

  // 実際のテキスト取得処理
  function updateTranscript() {
    // ここで初めて重い検索を行う
    const captions = document.querySelectorAll('.ygicle.VbkSUe');
    
    // 変化がなければ描画しない
    if (captions.length === 0) return;

    captions.forEach(cap => {
      const text = cap.innerText.trim();
      // まだ表示していない、かつ意味のあるテキストのみ追加
      if (text && text !== lastText && !lastText.endsWith(text)) {
        
        // "待機中"などの初期メッセージを消す
        if (body.innerText.includes('待機中') || body.innerText.includes('消去しました')) {
            body.innerHTML = '';
        }

        const p = document.createElement('div');
        p.style.marginBottom = '10px';
        p.style.borderBottom = '1px dotted #f1f3f4';
        p.innerText = text;
        
        body.appendChild(p);
        body.scrollTop = body.scrollHeight; 
        lastText = text;
      }
    });
  }

  // 監視開始
  observer.observe(document.body, { childList: true, subtree: true });
}
