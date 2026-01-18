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

// --- 2. 超軽量・右下固定の小窓 ---
function initCopyWindow() {
  const existing = document.getElementById('copy-caption-window');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'copy-caption-window';
  
  container.innerHTML = `
    <div style="padding: 5px 10px; background: #202124; color: white; font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
      <span>字幕ログ (右下固定)</span>
      <button id="clear-caption" style="background: #444; color: white; border: none; cursor: pointer; font-size: 10px; border-radius: 2px;">クリア</button>
    </div>
    <div id="copy-caption-body" style="height: 200px; overflow-y: auto; padding: 10px; background: white; color: #202124; font-size: 13px; user-select: text !important; line-height: 1.4;">
      <div style="color: #999;">待機中...</div>
    </div>
  `;

  // スタイルの適用（右下配置）
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '100px', // 下端からの距離（メニューバーを避けるため）
    right: '20px',   // 右端からの距離
    width: '280px',
    zIndex: '10001',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'white'
  });

  document.body.appendChild(container);

  const body = document.getElementById('copy-caption-body');
  document.getElementById('clear-caption').onclick = () => body.innerHTML = "";

  // --- 字幕取得ロジック（2秒おきの定期確認） ---
  let lastText = "";

  setInterval(() => {
    const captions = document.querySelectorAll('.ygicle.VbkSUe');
    if (captions.length === 0) return;

    captions.forEach(cap => {
      const text = cap.innerText.trim();
      if (text && text !== lastText && !lastText.endsWith(text)) {
        if (body.innerText.includes('待機中')) body.innerHTML = '';

        const p = document.createElement('div');
        p.style.borderBottom = '1px solid #f1f3f4';
        p.style.marginBottom = '5px';
        p.style.paddingBottom = '3px';
        p.innerText = text;
        
        body.appendChild(p);
        body.scrollTop = body.scrollHeight; 
        lastText = text;
      }
    });
  }, 2000); // 2秒ごとに見に行く（PCへの負荷が最小限になります）
}
