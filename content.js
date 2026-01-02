const checkTimer = setInterval(() => {
  // 画面上のすべてのボタンを取得
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
  }

}, 1000);