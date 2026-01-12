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

// --- 2. 移動・リサイズ可能な小窓を作成する ---
function initCopyWindow() {
  const existing = document.getElementById('copy-caption-window');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'copy-caption-window';
  
  // HTML構造の定義
  container.innerHTML = `
    <div id="copy-caption-header" style="padding: 8px; background: #202124; color: white; font-size: 12px; cursor: move; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; flex-shrink: 0;">
      <span style="font-weight: bold;">✥ ドラッグ移動 / ↘ リサイズ</span>
      <button id="clear-caption" style="background: #ea4335; color: white; border: none; cursor: pointer; border-radius: 3px; padding: 2px 8px;">消去</button>
    </div>
    <div id="copy-caption-body" style="flex-grow: 1; overflow-y: auto; padding: 10px; background: #ffffff; color: #202124; font-family: sans-serif; font-size: 14px; line-height: 1.5; user-select: text !important;">
      <div style="color: #777;">字幕を待機中...</div>
    </div>
  `;

  // コンテナのスタイル（resizeを有効化）
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    width: '320px',
    height: '300px', // 初期高さ
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
    resize: 'both' // これで右下からのリサイズを有効化
  });

  document.body.appendChild(container);

  // --- ドラッグ移動の実装 ---
  const header = document.getElementById('copy-caption-header');
  let isDragging = false;
  let offsetX, offsetY;

  header.onmousedown = (e) => {
    // リサイズ中（右下付近のクリック）はドラッグを無効化
    const rect = container.getBoundingClientRect();
    if (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20) return;

    isDragging = true;
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    header.style.background = '#3c4043';
  };

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    container.style.left = (e.clientX - offsetX) + 'px';
    container.style.top = (e.clientY - offsetY) + 'px';
    container.style.bottom = 'auto';
    container.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    header.style.background = '#202124';
  });

  // --- 字幕監視ロジック ---
  const body = document.getElementById('copy-caption-body');
  document.getElementById('clear-caption').onclick = () => {
      body.innerHTML = '<div style="color: #777;">消去しました。</div>';
  };

  let lastText = "";
  const observer = new MutationObserver(() => {
    const captions = document.querySelectorAll('.ygicle.VbkSUe');
    captions.forEach(cap => {
      const text = cap.innerText.trim();
      if (text && text !== lastText && !lastText.includes(text)) {
        if (body.innerText.includes('待機中') || body.innerText.includes('消去しました')) {
            body.innerHTML = '';
        }
        const p = document.createElement('div');
        p.style.marginBottom = '10px';
        p.style.paddingBottom = '5px';
        p.style.borderBottom = '1px dotted #f1f3f4';
        p.innerText = text;
        
        body.appendChild(p);
        body.scrollTop = body.scrollHeight; 
        lastText = text;
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
