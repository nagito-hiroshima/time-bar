
const countdownDisplay = document.querySelector('.remaining_time');
const audio = new Audio('./se1.mp3');
const audio2 = new Audio('./se2.mp3');
audio.loop = true;
audio2.loop = true;

//音量
audio.volume =  1; // 音量を30%に設定
audio2.volume = 0.12; // 音量を30%に設定

//音がでる確認ポップアップ表示
/*
if (confirm('音が出ます。音量に注意してください。')){
  // ユーザーが音を許可した場合の処理
  audio.play(); // 音を再生
  //1秒後に音を止める
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0; // 音を最初に戻す
  }, 1000);

} else {
  // ユーザーが音を拒否した場合の処理
  alert('音は出ません。');
} */

//音が出る確認ポップアップ表示SweetAlert2

Swal.fire({
  title: '音が出ます。音量に注意してください。',
  text: '音を許可しますか？',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'はい',
  cancelButtonText: 'いいえ'
}).then((result) => {
  if (result.isConfirmed) {
    // ユーザーが音を許可した場合の処理
    audio.play(); // 音を再生
    //1秒後に音を止める
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0; // 音を最初に戻す
    }, 1000);
  } else {
    // ユーザーが音を拒否した場合の処理
    alert('音は出ません。');
  }
});

//フルスクリーンボタンの処理
const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    fullscreenBtn.textContent = '全画面にする';
  } else {
    document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = '全画面を終了';
  }
});

// フルスクリーン状態の変更を監視
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fullscreenBtn.textContent = '全画面を終了';
  } else {
    fullscreenBtn.textContent = '全画面にする';
  }
});

// サーバー時間に基づく終了予定時刻
let endTimestamp = Date.now() + 30 * 60 * 1000; // 初期値：30分後

// 表示を更新する関数
function updateCountdown() {
console.log('updateCountdown called');
  const now = Date.now();
  const remaining = Math.floor((endTimestamp - now) / 1000);

  if (remaining >= 0) {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    countdownDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    countdownDisplay.textContent = 'チャージしてね！';
    //clearInterval(countdownInterval);
    //背景色を元に戻す
    document.querySelector('.display').style.background =
      'linear-gradient(to bottom right, #0099ff, #66ccff)';
  }

  // 色や音の処理
  if (remaining === 59) {
    audio.play();
    document.querySelector('.display').style.background =
      'linear-gradient(to bottom right, #ff3333, #ff9999)';
  }

  if (remaining < 50) {
    audio.pause();
    audio.currentTime = 0;
  }

  if (remaining > 60) {
    audio.pause();
    audio.currentTime = 0;
    document.querySelector('.display').style.background =
      'linear-gradient(to bottom right, #0099ff, #66ccff)';
  }
}

// 毎秒更新
const countdownInterval = setInterval(updateCountdown, 1000);

// APIで10秒ごとに同期
const url = 'https://square-tapo-api-20250409.syutarou.xyz/remaining-time';
setInterval(() => {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      const serverTime = parseInt(data.data.time, 10); // APIから取得した残り秒数
      const now = Date.now();
      const currentRemaining = Math.floor((endTimestamp - now) / 1000); // 現在の残り秒数
      const diff = Math.abs(currentRemaining - serverTime);

    
        endTimestamp = now + serverTime * 1000;
        console.log(`サーバー時間と同期: ${serverTime} 秒（前: ${currentRemaining} 秒）`);
    })
    .catch(error => {
      console.error('API取得エラー:', error);
      Swal.fire({
        icon: 'error',
        title: 'エラー',
        text: 'データの取得に失敗しました。ページをリロードしてください。',
        //3秒後に自動で閉じる
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          Swal.fire.close();
        }      });
      //alert('データの取得に失敗しました。ページをリロードしてください。');
    });
  
    //21:50~22:00の間にse2を流す（閉店BGM）
    //再生していなければ再生する
    const currentTime = new Date().getHours() * 60 + new Date().getMinutes();

    if (currentTime >= 21 * 60 + 50 && currentTime <= 22 * 60) {
      if (audio2.paused) {
        audio2.play();
      }
    } else {
      audio2.pause();
      audio2.currentTime = 0;
    }
}, 10000);

function playAudio() {
  if (audio2.paused) {
    audio2.play(); // 修正: audio2を再生
  } else {
    audio2.pause(); // 修正: audio2を一時停止
    audio2.currentTime = 0;
  }
}