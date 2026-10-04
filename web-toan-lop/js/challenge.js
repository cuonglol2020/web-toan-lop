/* =========================================================
   WEB TOÁN LỚP EM - CHALLENGE 1V1
   PHASE 1 + PHASE 2 - HOÀN THIỆN
   ========================================================= */

/*
  Firebase của dự án hiện tại dùng:

  const db = firebase.database();
  const auth = firebase.auth();

  challenge.js dùng hàm getChallengeDB()
  để tránh lỗi "database chưa sẵn sàng".
*/

const THOI_GIAN_VONG = 15;
const DIEM_THANG = 3;
const THOI_GIAN_BOT = 10;


/*
  KHÔNG khai báo lại các biến sau
  vì đã có trong main.js:

  activeMatchId
  matchListener
  matchTimer
  processedMatches
  roundLocks
*/


let timeLeft = THOI_GIAN_VONG;
let currentRoundKey = "";
let roundEnding = false;
let botTimer = null;
let botAnswerTimer = null;
let matchRoomListener = null;


/* =========================================================
   FIREBASE DATABASE AN TOÀN
   ========================================================= */

function getChallengeDB() {

  try {

    if (
      typeof db !== "undefined" &&
      db
    ) {
      return db;
    }

  } catch (e) {}

  try {

    if (
      typeof database !== "undefined" &&
      database
    ) {
      return database;
    }

  } catch (e) {}

  try {

    if (
      typeof firebase !== "undefined" &&
      firebase.apps &&
      firebase.apps.length > 0
    ) {
      return firebase.database();
    }

  } catch (e) {}

  return null;
}


function challengeFirebaseReady() {

  const database = getChallengeDB();

  if (!database) {

    alert(
      "Firebase Database chưa sẵn sàng.\n\n" +
      "Vui lòng tải lại trang rồi thử lại."
    );

    return false;
  }

  return true;
}


/* =========================================================
   TIỆN ÍCH
   ========================================================= */

function challengeEsc(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function getCurrentUserName() {

  try {

    if (
      typeof profile !== "undefined" &&
      profile &&
      profile.ten
    ) {
      return profile.ten;
    }

  } catch (e) {}


  try {

    if (
      typeof hoSoCuaToi !== "undefined" &&
      hoSoCuaToi &&
      hoSoCuaToi.ten
    ) {
      return hoSoCuaToi.ten;
    }

  } catch (e) {}


  try {

    if (
      typeof auth !== "undefined" &&
      auth.currentUser &&
      auth.currentUser.displayName
    ) {
      return auth.currentUser.displayName;
    }

  } catch (e) {}


  return "Học sinh";
}


function getDifficultyName(difficulty) {

  difficulty = Number(difficulty);

  if (difficulty === 5) {
    return "🔴 Khó";
  }

  if (difficulty === 2) {
    return "🟡 Vừa";
  }

  return "🟢 Dễ";
}


function getDifficultyClass(difficulty) {

  difficulty = Number(difficulty);

  if (difficulty === 5) {
    return "hard";
  }

  if (difficulty === 2) {
    return "medium";
  }

  return "easy";
}


/* =========================================================
   TẠO CÂU HỎI
   ========================================================= */

function taoCauHoi(doKho) {

  doKho = Number(doKho);

  let a;
  let b;
  let op;
  let answer;


  /* ================= KHÓ ================= */

  if (doKho === 5) {

    const ops = ["+", "-", "×"];

    op =
      ops[
        Math.floor(
          Math.random() * ops.length
        )
      ];


    if (op === "+") {

      a =
        Math.floor(
          Math.random() * 90
        ) + 10;

      b =
        Math.floor(
          Math.random() * 90
        ) + 10;

      answer = a + b;

    }


    else if (op === "-") {

      a =
        Math.floor(
          Math.random() * 90
        ) + 10;

      b =
        Math.floor(
          Math.random() * a
        ) + 1;

      answer = a - b;

    }


    else {

      a =
        Math.floor(
          Math.random() * 16
        ) + 5;

      b =
        Math.floor(
          Math.random() * 16
        ) + 5;

      answer = a * b;

    }

  }


  /* ================= VỪA ================= */

  else if (doKho === 2) {

    const ops = ["+", "-", "×"];

    op =
      ops[
        Math.floor(
          Math.random() * ops.length
        )
      ];


    if (op === "+") {

      a =
        Math.floor(
          Math.random() * 50
        ) + 10;

      b =
        Math.floor(
          Math.random() * 50
        ) + 10;

      answer = a + b;

    }


    else if (op === "-") {

      a =
        Math.floor(
          Math.random() * 60
        ) + 20;

      b =
        Math.floor(
          Math.random() * 30
        ) + 1;


      if (b > a) {

        const temp = a;

        a = b;
        b = temp;
      }

      answer = a - b;

    }


    else {

      a =
        Math.floor(
          Math.random() * 10
        ) + 2;

      b =
        Math.floor(
          Math.random() * 10
        ) + 2;

      answer = a * b;
    }

  }


  /* ================= DỄ ================= */

  else {

    const ops = ["+", "-"];

    op =
      ops[
        Math.floor(
          Math.random() * ops.length
        )
      ];


    if (op === "+") {

      a =
        Math.floor(
          Math.random() * 20
        ) + 1;

      b =
        Math.floor(
          Math.random() * 20
        ) + 1;

      answer = a + b;

    }


    else {

      a =
        Math.floor(
          Math.random() * 30
        ) + 5;

      b =
        Math.floor(
          Math.random() * a
        ) + 1;

      answer = a - b;
    }
  }


  return {

    cauHoi:
      `${a} ${op} ${b} = ?`,

    dapAn:
      answer
  };
}


/* =========================================================
   TIMER
   ========================================================= */

function clearMatchTimer() {

  try {

    if (
      typeof matchTimer !== "undefined" &&
      matchTimer
    ) {

      clearInterval(matchTimer);

      matchTimer = null;
    }

  } catch (e) {}
}


function clearBotTimer() {

  if (botTimer) {

    clearTimeout(botTimer);

    botTimer = null;
  }

  if (botAnswerTimer) {

    clearTimeout(botAnswerTimer);

    botAnswerTimer = null;
  }
}


function clearChallengeTimers() {

  clearMatchTimer();

  clearBotTimer();
}


function clearCurrentMatchUI() {

  const el =
    document.getElementById(
      "currentMatch"
    );

  if (el) {

    el.innerHTML = "";
  }
}


/* =========================================================
   TẠO PHÒNG
   ========================================================= */

function createMatch() {

  if (
    typeof auth === "undefined" ||
    !auth ||
    !auth.currentUser
  ) {

    alert(
      "Vui lòng đăng nhập trước."
    );

    return;
  }


  const database =
    getChallengeDB();


  if (!database) {

    alert(
      "Firebase Database chưa sẵn sàng.\n\n" +
      "Vui lòng tải lại trang rồi thử lại."
    );

    return;
  }


  const difficultyEl =
    document.getElementById(
      "difficulty"
    );


  const difficulty =
    difficultyEl
      ? Number(difficultyEl.value)
      : 0;


  const question =
    taoCauHoi(difficulty);


  const roomRef =
    database
      .ref("thachDau")
      .push();


  const uid =
    auth.currentUser.uid;


  const name =
    getCurrentUserName();


  const room = {

    host: {

      uid: uid,

      ten: name
    },


    guest: null,


    diemHost: 0,

    diemGuest: 0,


    doKho: difficulty,


    deBai:
      question.cauHoi,

    dapAn:
      question.dapAn,


    trangThai:
      "cho",


    vong: 0,


    /* ================= THỐNG KÊ ================= */

    tongCau: 0,

    cauDungHost: 0,

    cauSaiHost: 0,

    cauDungGuest: 0,

    cauSaiGuest: 0,


    taoLuc:
      firebase.database.ServerValue.TIMESTAMP,

    capNhatLuc:
      firebase.database.ServerValue.TIMESTAMP
  };


  roomRef
    .set(room)

    .then(() => {

      activeMatchId =
        roomRef.key;


      currentRoundKey =
        "";


      roundEnding =
        false;


      renderMatches();


      hienThiMatch(room);


      langNgheMatch(
        activeMatchId
      );


      /* =================
         TỰ CHUYỂN BOT SAU 10S
         ================= */

      clearBotTimer();


      botTimer =
        setTimeout(() => {

          choBot();

        }, THOI_GIAN_BOT * 1000);

    })


    .catch(error => {

      console.error(
        "Lỗi tạo phòng:",
        error
      );


      alert(
        "Không thể tạo phòng.\n\n" +
        "Vui lòng kiểm tra Firebase Database Rules."
      );
    });
}


/* =========================================================
   DANH SÁCH PHÒNG
   ========================================================= */

function listenMatches() {

  const database =
    getChallengeDB();


  if (!database) {
    return;
  }


  if (matchListener) {

    try {
      matchListener.off();
    } catch (e) {}
  }


  matchListener =
    database.ref("thachDau");


  matchListener.on(
    "value",
    snapshot => {

      renderMatches(
        snapshot.val() || {}
      );

    }
  );
}


function renderMatches(data) {

  const container =
    document.getElementById(
      "matches"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const rooms =
    Object.entries(
      data || {}
    );


  const waitingRooms =
    rooms.filter(
      ([id, room]) => {

        return (
          room &&
          room.trangThai === "cho" &&
          room.host &&
          !room.guest
        );

      }
    );


  if (
    waitingRooms.length === 0
  ) {

    container.innerHTML = `

      <div class="match empty">

        <div style="font-size:30px">
          ⚔️
        </div>

        <b>
          Chưa có phòng chờ
        </b>

        <div class="small">
          Hãy tạo một phòng để bắt đầu!
        </div>

      </div>
    `;

    return;
  }


  waitingRooms.forEach(
    ([id, room]) => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        `match match-item waiting difficulty-${getDifficultyClass(room.doKho)}`;


      const hostName =
        challengeEsc(
          room.host.ten ||
          "Học sinh"
        );


      const disabled =
        auth &&
        auth.currentUser &&
        room.host.uid ===
          auth.currentUser.uid;


      div.innerHTML = `

        <div class="matchTop">

          <div>

            <strong>
              ⚔️ ${hostName}
            </strong>

            <div class="small">
              ${getDifficultyName(room.doKho)}
            </div>

          </div>

          <span class="match-status waiting-badge">
            🟠 Đang chờ
          </span>

        </div>


        <div class="small">
          🏆 Ai đạt ${DIEM_THANG} điểm trước sẽ thắng
        </div>


        <button
          ${disabled ? "disabled" : ""}
          onclick="joinMatch('${id}')"
        >
          ${
            disabled
              ? "Phòng của bạn"
              : "⚔️ Tham gia"
          }
        </button>

      `;


      container.appendChild(
        div
      );

    }
  );
}


/* =========================================================
   THAM GIA PHÒNG
   ========================================================= */

function joinMatch(matchId) {

  if (
    typeof auth === "undefined" ||
    !auth ||
    !auth.currentUser
  ) {

    alert(
      "Vui lòng đăng nhập."
    );

    return;
  }


  const database =
    getChallengeDB();


  if (!database) {

    alert(
      "Firebase Database chưa sẵn sàng."
    );

    return;
  }


  if (!matchId) {
    return;
  }


  const uid =
    auth.currentUser.uid;


  const name =
    getCurrentUserName();


  const ref =
    database.ref(
      `thachDau/${matchId}`
    );


  ref.transaction(
    room => {

      if (!room) {
        return;
      }


      if (
        room.trangThai !== "cho"
      ) {
        return;
      }


      if (
        room.guest &&
        room.guest.uid
      ) {
        return;
      }


      if (
        room.host &&
        room.host.uid === uid
      ) {
        return;
      }


      room.guest = {

        uid: uid,

        ten: name
      };


      room.trangThai =
        "sanSang";


      room.capNhatLuc =
        firebase.database.ServerValue.TIMESTAMP;


      return room;

    },


    (
      error,
      committed,
      snapshot
    ) => {

      if (error) {

        console.error(
          error
        );

        alert(
          "Không thể tham gia phòng."
        );

        return;
      }


      if (
        !committed ||
        !snapshot.exists()
      ) {

        alert(
          "Phòng này vừa có người khác tham gia."
        );

        return;
      }


      clearBotTimer();


      activeMatchId =
        matchId;


      currentRoundKey =
        "";


      renderMatches();


      hienThiMatch(
        snapshot.val()
      );


      langNgheMatch(
        matchId
      );
    }
  );
}


/* =========================================================
   BẮT ĐẦU TRẬN
   ========================================================= */

function batDauMatch() {

  if (!activeMatchId) {
    return;
  }


  if (
    !auth ||
    !auth.currentUser
  ) {
    return;
  }


  const database =
    getChallengeDB();


  if (!database) {
    return;
  }


  const uid =
    auth.currentUser.uid;


  const ref =
    database.ref(
      `thachDau/${activeMatchId}`
    );


  ref.transaction(
    room => {

      if (!room) {
        return;
      }


      if (
        !room.host ||
        room.host.uid !== uid
      ) {
        return;
      }


      if (
        !room.guest ||
        !room.guest.uid
      ) {
        return;
      }


      if (
        room.trangThai !== "sanSang" &&
        room.trangThai !== "cho"
      ) {
        return;
      }


      const question =
        taoCauHoi(
          room.doKho
        );


      room.diemHost = 0;

      room.diemGuest = 0;


      room.vong = 1;


      room.deBai =
        question.cauHoi;


      room.dapAn =
        question.dapAn;


      room.tongCau = 0;


      room.cauDungHost = 0;

      room.cauSaiHost = 0;

      room.cauDungGuest = 0;

      room.cauSaiGuest = 0;


      room.trangThai =
        "dangDau";


      room.batDauLuc =
        firebase.database.ServerValue.TIMESTAMP;


      room.capNhatLuc =
        firebase.database.ServerValue.TIMESTAMP;


      return room;

    },

    (
      error,
      committed
    ) => {

      if (error) {

        console.error(
          error
        );

        alert(
          "Không thể bắt đầu trận."
        );

        return;
      }


      if (!committed) {
        return;
      }
    }
  );
}


/* =========================================================
   LẮNG NGHE PHÒNG
   ========================================================= */

function langNgheMatch(matchId) {

  const database =
    getChallengeDB();


  if (
    !matchId ||
    !database
  ) {
    return;
  }


  if (matchRoomListener) {

    try {
      matchRoomListener.off();
    } catch (e) {}
  }


  matchRoomListener =
    database.ref(
      `thachDau/${matchId}`
    );


  matchRoomListener.on(
    "value",
    snapshot => {

      if (!snapshot.exists()) {

        clearChallengeTimers();

        clearCurrentMatchUI();

        return;
      }


      const match =
        snapshot.val();


      if (
        match.trangThai ===
        "dangDau"
      ) {

        xuLyMatchDangDau(
          match
        );

      }


      else if (
        match.trangThai ===
        "ketThuc"
      ) {

        clearChallengeTimers();

        hienThiKetThuc(
          match
        );

      }


      else {

        clearChallengeTimers();

        hienThiMatch(
          match
        );
      }

    }
  );
}


/* =========================================================
   XỬ LÝ TRẬN ĐANG ĐẤU
   ========================================================= */

function xuLyMatchDangDau(
  match
) {

  if (!match) {
    return;
  }


  const roundKey =
    `${match.vong}_${match.deBai}`;


  if (
    currentRoundKey !==
    roundKey
  ) {

    currentRoundKey =
      roundKey;


    roundEnding =
      false;


    timeLeft =
      THOI_GIAN_VONG;


    hienThiMatch(
      match
    );


    batDauDemGio(
      match
    );


    if (
      match.guest &&
      match.guest.uid ===
        "BOT"
    ) {

      batDauTheoDoiBot();
    }

  }

  else {

    capNhatGiaoDienTran(
      match
    );
  }
}


/* =========================================================
   TIMER VÒNG
   ========================================================= */

function batDauDemGio(
  match
) {

  clearMatchTimer();


  timeLeft =
    THOI_GIAN_VONG;


  capNhatTimerUI();


  matchTimer =
    setInterval(() => {

      timeLeft--;


      capNhatTimerUI();


      if (
        timeLeft <= 0
      ) {

        clearMatchTimer();


        xuLyHetVong(
          match
        );
      }

    }, 1000);
}


/* =========================================================
   TIMER UI
   ========================================================= */

function capNhatTimerUI() {

  const timer =
    document.getElementById(
      "matchTimer"
    );


  if (!timer) {
    return;
  }


  timer.textContent =
    `${timeLeft}s`;


  timer.classList.remove(
    "timer-warning",
    "timer-danger"
  );


  if (
    timeLeft <= 5
  ) {

    timer.classList.add(
      "timer-danger"
    );

  }

  else if (
    timeLeft <= 10
  ) {

    timer.classList.add(
      "timer-warning"
    );
  }


  const progress =
    document.getElementById(
      "timerProgress"
    );


  if (progress) {

    const percent =
      Math.max(
        0,
        Math.min(
          100,
          (
            timeLeft /
            THOI_GIAN_VONG
          ) * 100
        )
      );


    progress.style.width =
      `${percent}%`;
  }
}


/* =========================================================
   HẾT VÒNG
   ========================================================= */

function xuLyHetVong(
  match
) {

  if (roundEnding) {
    return;
  }


  roundEnding =
    true;


  if (!activeMatchId) {

    roundEnding =
      false;

    return;
  }


  const database =
    getChallengeDB();


  if (!database) {

    roundEnding =
      false;

    return;
  }


  const ref =
    database.ref(
      `thachDau/${activeMatchId}`
    );


  ref.transaction(
    room => {

      if (!room) {
        return;
      }


      if (
        room.trangThai !==
        "dangDau"
      ) {
        return;
      }


      if (
        Number(room.vong) !==
        Number(match.vong)
      ) {
        return;
      }


      if (
        room.deBai !==
        match.deBai
      ) {
        return;
      }


      /*
        Câu đã hết thời gian.
      */

      room.tongCau =
        Number(room.tongCau || 0) + 1;


      /*
        Tạo câu mới.
      */

      const nextQuestion =
        taoCauHoi(
          room.doKho
        );


      room.vong =
        Number(
          room.vong || 0
        ) + 1;


      room.deBai =
        nextQuestion.cauHoi;


      room.dapAn =
        nextQuestion.dapAn;


      room.capNhatLuc =
        firebase.database.ServerValue.TIMESTAMP;


      return room;

    },

    error => {

      if (error) {

        console.error(
          "Lỗi chuyển vòng:",
          error
        );
      }


      roundEnding =
        false;
    }
  );
}


/* =========================================================
   HIỂN THỊ TRẬN
   ========================================================= */

function hienThiMatch(
  match
) {

  const container =
    document.getElementById(
      "currentMatch"
    );


  if (
    !container ||
    !match
  ) {
    return;
  }


  const currentUid =
    auth &&
    auth.currentUser
      ? auth.currentUser.uid
      : null;


  const isHost =
    match.host &&
    match.host.uid ===
      currentUid;


  const isGuest =
    match.guest &&
    match.guest.uid ===
      currentUid;


  const hostName =
    challengeEsc(
      match.host?.ten ||
      "Người chơi 1"
    );


  const guestName =
    challengeEsc(
      match.guest?.ten ||
      "Đang chờ..."
    );


  const guestIsBot =
    match.guest &&
    match.guest.uid ===
      "BOT";


  const hostScore =
    Number(
      match.diemHost || 0
    );


  const guestScore =
    Number(
      match.diemGuest || 0
    );


  /* ================= CHỜ ================= */

  if (
    match.trangThai ===
    "cho"
  ) {

    container.innerHTML = `

      <div class="match-waiting">

        <div class="match-icon">
          ⚔️
        </div>

        <h3>
          Phòng đấu của bạn
        </h3>


        <div class="players-versus">

          <div class="player-box">

            <span class="player-avatar">
              👤
            </span>

            <b>
              ${hostName}
            </b>

            <span class="small">
              Chủ phòng
            </span>

          </div>


          <div class="vs">
            VS
          </div>


          <div class="player-box waiting-player">

            <span class="player-avatar">
              ❔
            </span>

            <b>
              Đang chờ...
            </b>

            <span class="small">
              Bot sẽ tham gia sau ${THOI_GIAN_BOT}s
            </span>

          </div>

        </div>


        <div class="small">
          ${getDifficultyName(match.doKho)}
        </div>


        <button
          class="btn2"
          onclick="dongMatch('${activeMatchId}')"
        >
          Đóng phòng
        </button>

      </div>

    `;

    return;
  }


  /* ================= SẴN SÀNG ================= */

  if (
    match.trangThai ===
    "sanSang"
  ) {

    container.innerHTML = `

      <div class="match-waiting ready-match">

        <div class="match-icon">
          🔥
        </div>


        <h3>
          Đủ người chơi!
        </h3>


        <div class="players-versus">

          <div class="player-box">

            <span class="player-avatar">
              👤
            </span>

            <b>
              ${hostName}
            </b>

            <span class="small">
              Chủ phòng
            </span>

          </div>


          <div class="vs">
            VS
          </div>


          <div class="player-box">

            <span class="player-avatar">
              👤
            </span>

            <b>
              ${guestName}
            </b>

            <span class="small">
              Đối thủ
            </span>

          </div>

        </div>


        <p class="small">
          ${getDifficultyName(match.doKho)}
        </p>


        ${
          isHost
            ? `
              <button
                class="green"
                onclick="batDauMatch()"
              >
                🚀 Bắt đầu trận
              </button>
            `
            : `
              <div class="ready-text">
                ⏳ Chờ chủ phòng bắt đầu...
              </div>
            `
        }


        <button
          class="btn2"
          onclick="dongMatch('${activeMatchId}')"
        >
          Rời phòng
        </button>

      </div>

    `;

    return;
  }


  /* ================= ĐANG ĐẤU ================= */

  if (
    match.trangThai ===
    "dangDau"
  ) {

    hienThiGiaoDienDangDau(
      match,
      currentUid,
      hostName,
      guestName,
      hostScore,
      guestScore,
      guestIsBot,
      isHost,
      isGuest
    );

    return;
  }


  /* ================= KẾT THÚC ================= */

  if (
    match.trangThai ===
    "ketThuc"
  ) {

    hienThiKetThuc(
      match
    );
  }
}


/* =========================================================
   GIAO DIỆN ĐANG ĐẤU
   ========================================================= */

function hienThiGiaoDienDangDau(
  match,
  currentUid,
  hostName,
  guestName,
  hostScore,
  guestScore,
  guestIsBot,
  isHost,
  isGuest
) {

  const container =
    document.getElementById(
      "currentMatch"
    );


  if (!container) {
    return;
  }


  const myScore =
    isHost
      ? hostScore
      : guestScore;


  const opponentScore =
    isHost
      ? guestScore
      : hostScore;


  const myName =
    isHost
      ? hostName
      : guestName;


  const opponentName =
    isHost
      ? guestName
      : hostName;


  const myCorrect =
    isHost
      ? Number(match.cauDungHost || 0)
      : Number(match.cauDungGuest || 0);


  const myWrong =
    isHost
      ? Number(match.cauSaiHost || 0)
      : Number(match.cauSaiGuest || 0);


  const answered =
    myCorrect + myWrong;


  const accuracy =
    answered > 0
      ? Math.round(
          (myCorrect / answered) * 100
        )
      : 0;


  container.innerHTML = `

    <div class="match-playing">


      <div class="match-header">

        <div>

          <span class="live-dot"></span>

          <b>
            🔴 ĐANG ĐẤU
          </b>

        </div>


        <span class="difficulty-badge difficulty-${getDifficultyClass(match.doKho)}">

          ${getDifficultyName(match.doKho)}

        </span>

      </div>


      <div class="players-versus playing-players">


        <div class="player-box me">

          <span class="player-label">
            BẠN
          </span>


          <b>
            ${myName}
          </b>


          <div class="big-score">
            ${myScore}
          </div>

        </div>


        <div class="vs">
          VS
        </div>


        <div class="player-box opponent">

          <span class="player-label">
            ĐỐI THỦ
          </span>


          <b>
            ${opponentName}
          </b>


          <div class="big-score">
            ${opponentScore}
          </div>

        </div>

      </div>


      <div class="round-info">

        Vòng ${Number(match.vong || 1)}

        • Ai đạt ${DIEM_THANG} điểm trước sẽ thắng

      </div>


      <div class="timer-wrap">

        <div
          id="matchTimer"
          class="timer"
        >
          ${timeLeft}s
        </div>


        <div class="timer-track">

          <div
            id="timerProgress"
            class="timer-progress"
          ></div>

        </div>

      </div>


      <div class="question">

        ${challengeEsc(
          match.deBai || "..."
        )}

      </div>


      <form
        onsubmit="event.preventDefault();submitAnswer();"
      >

        <input
          id="answerInput"
          type="number"
          inputmode="numeric"
          autocomplete="off"
          placeholder="Nhập đáp án..."
        >


        <div class="btnrow answer-row">

          <button
            type="submit"
            class="green answer-button"
          >
            ✅ Trả lời
          </button>

        </div>

      </form>


      <div
        id="answerFeedback"
        class="small"
        style="
          min-height:24px;
          margin-top:8px;
          font-weight:bold;
        "
      ></div>


      <div class="small">

        ${
          guestIsBot
            ? "🤖 Bạn đang đấu với Bot"
            : "⚡ Trả lời nhanh để giành điểm!"
        }

      </div>


      <div
        class="small"
        style="margin-top:8px;"
      >

        🎯 Đúng: ${myCorrect}

        &nbsp; • &nbsp;

        ❌ Sai: ${myWrong}

        &nbsp; • &nbsp;

        📈 Accuracy: ${accuracy}%

      </div>


    </div>

  `;


  const input =
    document.getElementById(
      "answerInput"
    );


  if (input) {

    input.focus();


    input.onkeydown =
      function(event) {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          submitAnswer();
        }
      };
  }


  capNhatTimerUI();
}


/* =========================================================
   CẬP NHẬT GIAO DIỆN KHÔNG RESET INPUT
   ========================================================= */

function capNhatGiaoDienTran(
  match
) {

  const hostScore =
    Number(
      match.diemHost || 0
    );


  const guestScore =
    Number(
      match.diemGuest || 0
    );


  const boxes =
    document.querySelectorAll(
      "#currentMatch .big-score"
    );


  if (
    boxes.length >= 2
  ) {

    const currentUid =
      auth &&
      auth.currentUser
        ? auth.currentUser.uid
        : null;


    const isHost =
      match.host &&
      match.host.uid ===
        currentUid;


    boxes[0].textContent =
      isHost
        ? hostScore
        : guestScore;


    boxes[1].textContent =
      isHost
        ? guestScore
        : hostScore;
  }


  const round =
    document.querySelector(
      "#currentMatch .round-info"
    );


  if (round) {

    round.textContent =
      `Vòng ${Number(match.vong || 1)} • Ai đạt ${DIEM_THANG} điểm trước sẽ thắng`;
  }


  const currentUid =
    auth &&
    auth.currentUser
      ? auth.currentUser.uid
      : null;


  const isHost =
    match.host &&
    match.host.uid ===
      currentUid;


  const myCorrect =
    isHost
      ? Number(match.cauDungHost || 0)
      : Number(match.cauDungGuest || 0);


  const myWrong =
    isHost
      ? Number(match.cauSaiHost || 0)
      : Number(match.cauSaiGuest || 0);


  const answered =
    myCorrect + myWrong;


  const accuracy =
    answered > 0
      ? Math.round(
          (myCorrect / answered) * 100
        )
      : 0;


  const statsText =
    document.querySelector(
      "#currentMatch .small:last-child"
    );


  if (
    statsText &&
    statsText.textContent.includes("Đúng:")
  ) {

    statsText.textContent =
      `🎯 Đúng: ${myCorrect} • ❌ Sai: ${myWrong} • 📈 Accuracy: ${accuracy}%`;
  }


  capNhatTimerUI();
}


/* =========================================================
   FEEDBACK TRẢ LỜI
   ========================================================= */

function hienThiFeedback(
  message,
  type
) {

  const el =
    document.getElementById(
      "answerFeedback"
    );


  if (!el) {
    return;
  }


  el.textContent =
    message;


  if (type === "correct") {

    el.style.color =
      "green";

  }

  else if (
    type === "wrong"
  ) {

    el.style.color =
      "crimson";

  }

  else {

    el.style.color =
      "";
  }


  clearTimeout(
    el._feedbackTimer
  );


  el._feedbackTimer =
    setTimeout(() => {

      if (el) {
        el.textContent = "";
      }

    }, 1200);
}


/* =========================================================
   TRẢ LỜI
   ========================================================= */

function submitAnswer() {

  if (!activeMatchId) {
    return;
  }


  if (
    !auth ||
    !auth.currentUser
  ) {
    return;
  }


  const database =
    getChallengeDB();


  if (!database) {
    return;
  }


  const input =
    document.getElementById(
      "answerInput"
    );


  if (!input) {
    return;
  }


  const raw =
    input.value.trim();


  if (raw === "") {
    return;
  }


  const answer =
    Number(raw);


  if (
    !Number.isFinite(answer)
  ) {
    return;
  }


  const uid =
    auth.currentUser.uid;


  /*
    Chống spam click trong cùng
    một transaction.
  */

  if (
    typeof roundLocks !==
      "undefined" &&
    roundLocks
  ) {

    if (
      roundLocks[activeMatchId]
    ) {
      return;
    }


    roundLocks[
      activeMatchId
    ] = true;
  }


  const currentRound =
    currentRoundKey;


  const ref =
    database.ref(
      `thachDau/${activeMatchId}`
    );


  ref.transaction(
    room => {

      if (!room) {
        return;
      }


      if (
        room.trangThai !==
        "dangDau"
      ) {
        return;
      }


      /*
        Xác định người chơi.
      */

      let player =
        null;


      if (
        room.host &&
        room.host.uid === uid
      ) {

        player =
          "host";

      }

      else if (
        room.guest &&
        room.guest.uid === uid
      ) {

        player =
          "guest";
      }


      if (!player) {
        return;
      }


      /*
        Chống trả lời câu cũ
        nếu Firebase đã chuyển vòng.
      */

      const roomRoundKey =
        `${room.vong}_${room.deBai}`;


      if (
        currentRound &&
        currentRound !==
          roomRoundKey
      ) {

        return;
      }


      const correct =
        Number(room.dapAn) ===
        answer;


      /*
        ======================
        CÂU SAI
        ======================
      */

      if (!correct) {

        if (
          player === "host"
        ) {

          room.cauSaiHost =
            Number(
              room.cauSaiHost || 0
            ) + 1;

        }

        else {

          room.cauSaiGuest =
            Number(
              room.cauSaiGuest || 0
            ) + 1;
        }


        room.capNhatLuc =
          firebase.database.ServerValue.TIMESTAMP;


        /*
          QUAN TRỌNG:
          Không đổi câu.
          Không đổi điểm.
          Cho phép trả lời lại.
        */

        return room;
      }


      /*
        ======================
        CÂU ĐÚNG
        ======================
      */

      if (
        player === "host"
      ) {

        room.cauDungHost =
          Number(
            room.cauDungHost || 0
          ) + 1;

      }

      else {

        room.cauDungGuest =
          Number(
            room.cauDungGuest || 0
          ) + 1;
      }


      /*
        Một câu đã được giải
        bằng đáp án đúng.
      */

      room.tongCau =
        Number(
          room.tongCau || 0
        ) + 1;


      /*
        Cộng điểm.
      */

      if (
        player === "host"
      ) {

        room.diemHost =
          Number(
            room.diemHost || 0
          ) + 1;

      }

      else {

        room.diemGuest =
          Number(
            room.diemGuest || 0
          ) + 1;
      }


      const newScore =
        player === "host"
          ? Number(
              room.diemHost
            )
          : Number(
              room.diemGuest
            );


      /*
        ======================
        THẮNG
        ======================
      */

      if (
        newScore >=
        DIEM_THANG
      ) {

        room.trangThai =
          "ketThuc";


        room.nguoiThang =
          player === "host"
            ? room.host.uid
            : room.guest.uid;


        room.capNhatLuc =
          firebase.database.ServerValue.TIMESTAMP;


        return room;
      }


      /*
        ======================
        CÂU MỚI
        ======================
      */

      const question =
        taoCauHoi(
          room.doKho
        );


      room.vong =
        Number(
          room.vong || 0
        ) + 1;


      room.deBai =
        question.cauHoi;


      room.dapAn =
        question.dapAn;


      room.capNhatLuc =
        firebase.database.ServerValue.TIMESTAMP;


      return room;

    },

    (
      error,
      committed,
      snapshot
    ) => {

      if (
        typeof roundLocks !==
          "undefined" &&
        roundLocks
      ) {

        delete roundLocks[
          activeMatchId
        ];
      }


      if (error) {

        console.error(
          "Lỗi trả lời:",
          error
        );

        return;
      }


      if (
        !committed ||
        !snapshot.exists()
      ) {

        hienThiFeedback(
          "⏰ Câu hỏi đã chuyển!",
          "info"
        );

        return;
      }


      const room =
        snapshot.val();


      /*
        Lấy lại câu hỏi cũ
        để xác định feedback.
      */

      /*
        Nếu vong đã đổi:
        có nghĩa là câu trả lời
        đúng và trận đã chuyển.
      */

      if (
        room.trangThai ===
        "ketThuc"
      ) {

        hienThiFeedback(
          "🏆 Chính xác! Bạn ghi điểm!",
          "correct"
        );

        input.value = "";

        return;
      }


      /*
        Nếu currentRoundKey vẫn
        là vòng cũ nhưng transaction
        thành công và đáp án sai,
        Firebase vẫn giữ nguyên vòng.
      */

      const roomRoundKey =
        `${room.vong}_${room.deBai}`;


      if (
        currentRound &&
        roomRoundKey !==
          currentRound
      ) {

        hienThiFeedback(
          "✅ Chính xác! +1 điểm",
          "correct"
        );

        input.value = "";

        return;
      }


      /*
        Nếu vòng không đổi,
        đây là trường hợp trả lời sai.
      */

      hienThiFeedback(
        "❌ Sai rồi! Thử lại nhé.",
        "wrong"
      );


      input.value = "";

      input.focus();
    }
  );
}


/* =========================================================
   KẾT THÚC TRẬN
   ========================================================= */

function hienThiKetThuc(
  match
) {

  clearChallengeTimers();


  const container =
    document.getElementById(
      "currentMatch"
    );


  if (!container) {
    return;
  }


  const currentUid =
    auth &&
    auth.currentUser
      ? auth.currentUser.uid
      : null;


  const hostUid =
    match.host?.uid;


  const guestUid =
    match.guest?.uid;


  const hostScore =
    Number(
      match.diemHost || 0
    );


  const guestScore =
    Number(
      match.diemGuest || 0
    );


  let resultTitle =
    "🤝 Hòa!";


  let resultClass =
    "draw";


  if (
    hostScore !==
    guestScore
  ) {

    const winnerUid =
      hostScore >
      guestScore
        ? hostUid
        : guestUid;


    if (
      winnerUid ===
      currentUid
    ) {

      resultTitle =
        "🏆 Bạn thắng!";

      resultClass =
        "win";

    }

    else {

      resultTitle =
        "😢 Bạn thua!";

      resultClass =
        "lose";
    }
  }


  const opponent =
    hostUid === currentUid
      ? match.guest?.ten
      : match.host?.ten;


  const isHost =
    hostUid === currentUid;


  const myCorrect =
    isHost
      ? Number(
          match.cauDungHost || 0
        )
      : Number(
          match.cauDungGuest || 0
        );


  const myWrong =
    isHost
      ? Number(
          match.cauSaiHost || 0
        )
      : Number(
          match.cauSaiGuest || 0
        );


  const answered =
    myCorrect +
    myWrong;


  const accuracy =
    answered > 0
      ? Math.round(
          (
            myCorrect /
            answered
          ) * 100
        )
      : 0;


  container.innerHTML = `

    <div class="match-finished ${resultClass}">


      <div class="result-icon">

        ${
          resultClass === "win"
            ? "🏆"
            : resultClass === "lose"
              ? "😢"
              : "🤝"
        }

      </div>


      <h3>
        ${resultTitle}
      </h3>


      <div class="final-score">

        ${hostScore}
        -
        ${guestScore}

      </div>


      <div class="small">

        Đối thủ:
        <b>
          ${challengeEsc(
            opponent ||
            "Không rõ"
          )}
        </b>

      </div>


      <div
        class="small"
        style="margin-top:8px;"
      >

        🎯 Câu đúng:
        <b>${myCorrect}</b>

        &nbsp; • &nbsp;

        ❌ Câu sai:
        <b>${myWrong}</b>

        &nbsp; • &nbsp;

        📈 Accuracy:
        <b>${accuracy}%</b>

      </div>


      <div
        class="small match-ended-text"
      >
        Trận đấu đã kết thúc
      </div>


      <button
        onclick="dongMatch('${activeMatchId}')"
      >
        Đóng kết quả
      </button>

    </div>

  `;


  xuLyKetQuaMotLan(
    match
  );
}


/* =========================================================
   LƯU LỊCH SỬ
   ========================================================= */

function xuLyKetQuaMotLan(
  match
) {

  if (
    !match ||
    !match.host ||
    !match.guest
  ) {
    return;
  }


  if (
    typeof processedMatches !==
      "undefined" &&
    processedMatches &&
    processedMatches[
      activeMatchId
    ]
  ) {

    return;
  }


  if (
    typeof processedMatches !==
      "undefined" &&
    processedMatches
  ) {

    processedMatches[
      activeMatchId
    ] = true;
  }


  luuLichSu(
    match
  );
}


function luuLichSu(
  match
) {

  if (
    !auth ||
    !auth.currentUser
  ) {
    return;
  }


  const database =
    getChallengeDB();


  if (!database) {
    return;
  }


  const uid =
    auth.currentUser.uid;


  const isHost =
    match.host &&
    match.host.uid ===
      uid;


  const opponent =
    isHost
      ? match.guest
      : match.host;


  const myScore =
    isHost
      ? Number(
          match.diemHost || 0
        )
      : Number(
          match.diemGuest || 0
        );


  const opponentScore =
    isHost
      ? Number(
          match.diemGuest || 0
        )
      : Number(
          match.diemHost || 0
        );


  const cauDung =
    isHost
      ? Number(
          match.cauDungHost || 0
        )
      : Number(
          match.cauDungGuest || 0
        );


  const cauSai =
    isHost
      ? Number(
          match.cauSaiHost || 0
        )
      : Number(
          match.cauSaiGuest || 0
        );


  const soCauTraLoi =
    cauDung +
    cauSai;


  const doChinhXac =
    soCauTraLoi > 0
      ? Math.round(
          (
            cauDung /
            soCauTraLoi
          ) * 100
        )
      : 0;


  let thang =
    false;


  let hoa =
    false;


  if (
    myScore >
    opponentScore
  ) {

    thang =
      true;

  }

  else if (
    myScore ===
    opponentScore
  ) {

    hoa =
      true;
  }


  const rounds =
    Number(
      match.vong || 1
    );


  const history = {

    doiThu:
      opponent?.ten ||
      "Học sinh",


    doiThuUid:
      opponent?.uid ||
      "",


    diemToi:
      myScore,


    diemDoiThu:
      opponentScore,


    thang:
      thang,


    hoa:
      hoa,


    thua:
      !thang &&
      !hoa,


    tongVong:
      rounds,


    tongCau:
      Number(
        match.tongCau || 0
      ),


    cauDung:
      cauDung,


    cauSai:
      cauSai,


    doChinhXac:
      doChinhXac,


    doKho:
      Number(
        match.doKho || 0
      ),


    thoiGian:
      firebase.database.ServerValue.TIMESTAMP
  };


  database
    .ref(
      `lichSu/${uid}/${activeMatchId}`
    )
    .set(history)


    .then(() => {

      loadHistory();

    })


    .catch(error => {

      console.error(
        "Không thể lưu lịch sử:",
        error
      );

    });
}


/* =========================================================
   THỐNG KÊ 1V1
   ========================================================= */

function tinhThongKe1v1(
  data
) {

  const stats = {

    tongTran: 0,

    thang: 0,

    thua: 0,

    hoa: 0,


    tongCau: 0,

    cauDung: 0,

    cauSai: 0,


    chuoiThang: 0,

    chuoiThangCaoNhat: 0
  };


  const matches =
    Object.values(
      data || {}
    )
      .filter(Boolean)
      .sort(
        (a, b) =>
          Number(
            a.thoiGian || 0
          ) -
          Number(
            b.thoiGian || 0
          )
      );


  matches.forEach(
    match => {

      stats.tongTran++;


      if (
        match.thang
      ) {

        stats.thang++;

      }

      else if (
        match.hoa
      ) {

        stats.hoa++;

      }

      else {

        stats.thua++;
      }


      /*
        Tổng số câu được
        hệ thống hoàn thành.
      */

      stats.tongCau +=
        Number(
          match.tongCau ||
          match.tongVong ||
          0
        );


      /*
        Accuracy thật:
        lấy dữ liệu mới nếu có.
      */

      stats.cauDung +=
        Number(
          match.cauDung ||
          0
        );


      stats.cauSai +=
        Number(
          match.cauSai ||
          0
        );


      if (
        match.thang
      ) {

        stats.chuoiThang++;


        stats.chuoiThangCaoNhat =
          Math.max(
            stats.chuoiThangCaoNhat,
            stats.chuoiThang
          );

      }

      else {

        stats.chuoiThang =
          0;
      }

    }
  );


  stats.tyLeThang =
    stats.tongTran > 0

      ? Math.round(
          (
            stats.thang /
            stats.tongTran
          ) * 100
        )

      : 0;


  const answered =
    stats.cauDung +
    stats.cauSai;


  stats.doChinhXac =
    answered > 0

      ? Math.round(
          (
            stats.cauDung /
            answered
          ) * 100
        )

      : 0;


  return stats;
}


/* =========================================================
   LỊCH SỬ
   ========================================================= */

function loadHistory() {

  if (
    !auth ||
    !auth.currentUser
  ) {
    return;
  }


  const database =
    getChallengeDB();


  if (!database) {
    return;
  }


  const uid =
    auth.currentUser.uid;


  database
    .ref(
      `lichSu/${uid}`
    )
    .once("value")


    .then(
      snapshot => {

        const data =
          snapshot.val() ||
          {};


        const history =
          Object.entries(
            data
          )
            .map(
              ([id, value]) => ({
                id,
                ...value
              })
            )
            .sort(
              (a, b) =>
                Number(
                  b.thoiGian || 0
                ) -
                Number(
                  a.thoiGian || 0
                )
            );


        hienThiThongKe1v1(
          data
        );


        hienThiLichSu(
          history
        );

      }
    )


    .catch(error => {

      console.error(
        "Lỗi tải lịch sử:",
        error
      );

    });
}


/* =========================================================
   HIỂN THỊ THỐNG KÊ
   ========================================================= */

function hienThiThongKe1v1(
  data
) {

  const container =
    document.getElementById(
      "history"
    );


  if (!container) {
    return;
  }


  const stats =
    tinhThongKe1v1(
      data
    );


  let statsBox =
    document.getElementById(
      "challengeStats"
    );


  if (!statsBox) {

    statsBox =
      document.createElement(
        "div"
      );


    statsBox.id =
      "challengeStats";


    container.prepend(
      statsBox
    );
  }


  statsBox.innerHTML = `

    <div class="stats-title">
      📊 Thống kê 1v1
    </div>


    <div class="stats-grid">


      <div class="stat-card">

        <span>⚔️</span>

        <b>
          ${stats.tongTran}
        </b>

        <small>
          Tổng trận
        </small>

      </div>


      <div class="stat-card win-stat">

        <span>🏆</span>

        <b>
          ${stats.thang}
        </b>

        <small>
          Thắng
        </small>

      </div>


      <div class="stat-card lose-stat">

        <span>💀</span>

        <b>
          ${stats.thua}
        </b>

        <small>
          Thua
        </small>

      </div>


      <div class="stat-card">

        <span>🤝</span>

        <b>
          ${stats.hoa}
        </b>

        <small>
          Hòa
        </small>

      </div>


      <div class="stat-card">

        <span>📈</span>

        <b>
          ${stats.tyLeThang}%
        </b>

        <small>
          Tỉ lệ thắng
        </small>

      </div>


      <div class="stat-card">

        <span>🔥</span>

        <b>
          ${stats.chuoiThangCaoNhat}
        </b>

        <small>
          Chuỗi thắng cao nhất
        </small>

      </div>


      <div class="stat-card">

        <span>🧮</span>

        <b>
          ${stats.tongCau}
        </b>

        <small>
          Tổng câu
        </small>

      </div>


      <div class="stat-card">

        <span>🎯</span>

        <b>
          ${stats.doChinhXac}%
        </b>

        <small>
          Độ chính xác
        </small>

      </div>


      <div class="stat-card">

        <span>✅</span>

        <b>
          ${stats.cauDung}
        </b>

        <small>
          Câu đúng
        </small>

      </div>


      <div class="stat-card">

        <span>❌</span>

        <b>
          ${stats.cauSai}
        </b>

        <small>
          Câu sai
        </small>

      </div>


    </div>

  `;
}


/* =========================================================
   HIỂN THỊ LỊCH SỬ
   ========================================================= */

function hienThiLichSu(
  history
) {

  const container =
    document.getElementById(
      "history"
    );


  if (!container) {
    return;
  }


  const stats =
    document.getElementById(
      "challengeStats"
    );


  const historyRows =
    history.slice(
      0,
      20
    );


  let html =
    "";


  if (
    historyRows.length === 0
  ) {

    html = `

      <div class="history-empty">
        📭 Chưa có trận đấu nào.
      </div>

    `;

  }

  else {

    html = `

      <div class="history-title">
        📜 Trận đấu gần đây
      </div>

    `;


    historyRows.forEach(
      match => {

        let icon =
          "🤝";


        let result =
          "Hòa";


        let resultClass =
          "draw";


        if (
          match.thang
        ) {

          icon =
            "🏆";

          result =
            "Thắng";

          resultClass =
            "win";

        }

        else if (
          match.thua
        ) {

          icon =
            "💀";

          result =
            "Thua";

          resultClass =
            "lose";
        }


        html += `

          <div
            class="histrow challenge-history-row"
          >


            <div
              class="history-opponent"
            >

              <span
                class="history-result ${resultClass}"
              >
                ${icon}
              </span>


              <div>

                <b>
                  ${challengeEsc(
                    match.doiThu ||
                    "Học sinh"
                  )}
                </b>


                <div class="small">

                  ${getDifficultyName(
                    match.doKho
                  )}

                </div>

              </div>

            </div>


            <div
              class="history-score"
            >

              <b>

                ${Number(
                  match.diemToi ||
                  0
                )}

                -

                ${Number(
                  match.diemDoiThu ||
                  0
                )}

              </b>


              <span
                class="${resultClass}"
              >
                ${result}
              </span>


              <span
                class="small"
              >

                🎯 ${Number(
                  match.cauDung ||
                  match.diemToi ||
                  0
                )}
                đúng

                /
                ${Number(
                  match.cauSai ||
                  0
                )}
                sai

              </span>


            </div>


          </div>

        `;

      }
    );
  }


  if (stats) {

    Array.from(
      container.children
    )
      .forEach(
        child => {

          if (
            child.id !==
            "challengeStats"
          ) {

            child.remove();
          }

        }
      );


    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.innerHTML =
      html;


    container.appendChild(
      wrapper
    );

  }

  else {

    container.innerHTML =
      html;
  }
}


/* =========================================================
   TOGGLE LỊCH SỬ
   ========================================================= */

function toggleHistory() {

  const history =
    document.getElementById(
      "history"
    );


  const button =
    document.getElementById(
      "historyBtn"
    );


  if (!history) {
    return;
  }


  const hidden =
    getComputedStyle(
      history
    ).display ===
    "none";


  if (hidden) {

    history.style.display =
      "block";


    if (button) {

      button.textContent =
        "Ẩn lịch sử";
    }


    loadHistory();

  }

  else {

    history.style.display =
      "none";


    if (button) {

      button.textContent =
        "Hiện lịch sử";
    }
  }
}


/* =========================================================
   BOT
   ========================================================= */

function choBot() {

  if (!activeMatchId) {
    return;
  }


  const database =
    getChallengeDB();


  if (!database) {
    return;
  }


  database
    .ref(
      `thachDau/${activeMatchId}`
    )
    .once("value")


    .then(
      snapshot => {

        if (
          !snapshot.exists()
        ) {
          return;
        }


        const match =
          snapshot.val();


        /*
          Nếu đã có người thật
          thì không gọi Bot.
        */

        if (
          match.trangThai !==
            "cho" ||
          (
            match.guest &&
            match.guest.uid
          )
        ) {

          return;
        }


        /*
          Bot tham gia phòng.
        */

        database
          .ref(
            `thachDau/${activeMatchId}`
          )
          .transaction(
            room => {

              if (!room) {
                return;
              }


              if (
                room.trangThai !==
                "cho"
              ) {
                return;
              }


              if (
                room.guest
              ) {
                return;
              }


              room.guest = {

                uid:
                  "BOT",

                ten:
                  "🤖 Bot"
              };


              room.trangThai =
                "sanSang";


              room.capNhatLuc =
                firebase.database.ServerValue.TIMESTAMP;


              return room;

            },

            (
              error,
              committed
            ) => {

              if (error) {

                console.error(
                  "Bot join error:",
                  error
                );

                return;
              }


              if (!committed) {
                return;
              }


              /*
                Sau khi Bot vào,
                tự bắt đầu trận.
              */

              setTimeout(
                () => {

                  batDauMatch();

                },
                800
              );

            }
          );

      }
    )


    .catch(error => {

      console.error(
        "Bot error:",
        error
      );

    });
}


/* =========================================================
   BOT TRẢ LỜI
   ========================================================= */

function submitBotAnswer(
  round,
  question,
  answer
) {

  if (!activeMatchId) {
    return;
  }


  const database =
    getChallengeDB();


  if (!database) {
    return;
  }


  const ref =
    database.ref(
      `thachDau/${activeMatchId}`
    );


  ref.transaction(
    room => {

      if (!room) {
        return;
      }


      if (
        room.trangThai !==
        "dangDau"
      ) {
        return;
      }


      if (
        !room.guest ||
        room.guest.uid !==
          "BOT"
      ) {
        return;
      }


      if (
        Number(room.vong) !==
        Number(round)
      ) {
        return;
      }


      if (
        room.deBai !==
        question
      ) {
        return;
      }


      /*
        Bot trả lời đúng.
      */

      room.diemGuest =
        Number(
          room.diemGuest || 0
        ) + 1;


      room.cauDungGuest =
        Number(
          room.cauDungGuest || 0
        ) + 1;


      room.tongCau =
        Number(
          room.tongCau || 0
        ) + 1;


      /*
        Bot đạt 3 điểm.
      */

      if (
        room.diemGuest >=
        DIEM_THANG
      ) {

        room.trangThai =
          "ketThuc";


        room.nguoiThang =
          "BOT";


        room.capNhatLuc =
          firebase.database.ServerValue.TIMESTAMP;


        return room;
      }


      /*
        Sang câu mới.
      */

      const next =
        taoCauHoi(
          room.doKho
        );


      room.vong =
        Number(
          room.vong || 0
        ) + 1;


      room.deBai =
        next.cauHoi;


      room.dapAn =
        next.dapAn;


      room.capNhatLuc =
        firebase.database.ServerValue.TIMESTAMP;


      return room;

    }
  );
}


/* =========================================================
   THEO DÕI BOT
   ========================================================= */

function batDauTheoDoiBot() {

  clearBotTimer();


  /*
    Bot suy nghĩ khoảng
    0.7 - 2.9 giây.
  */

  const delay =
    700 +
    Math.floor(
      Math.random() * 2200
    );


  botAnswerTimer =
    setTimeout(
      () => {

        const database =
          getChallengeDB();


        if (!database) {
          return;
        }


        database
          .ref(
            `thachDau/${activeMatchId}`
          )
          .once("value")


          .then(
            snapshot => {

              if (
                !snapshot.exists()
              ) {
                return;
              }


              const match =
                snapshot.val();


              if (
                match.trangThai !==
                "dangDau"
              ) {
                return;
              }


              if (
                !match.guest ||
                match.guest.uid !==
                  "BOT"
              ) {
                return;
              }


              /*
                Bot có khoảng 75%
                xác suất trả lời.
              */

              if (
                Math.random() >
                0.75
              ) {

                /*
                  Bot không trả lời
                  vòng này.
                */

                return;
              }


              submitBotAnswer(
                match.vong,
                match.deBai,
                match.dapAn
              );

            }
          )

          .catch(
            () => {}
          );

      },
      delay
    );
}


/* =========================================================
   ĐÓNG / RỜI PHÒNG
   ========================================================= */

function dongMatch(
  matchId
) {

  matchId =
    matchId ||
    activeMatchId;


  clearChallengeTimers();


  if (matchRoomListener) {

    try {
      matchRoomListener.off();
    } catch (e) {}


    matchRoomListener =
      null;
  }


  const database =
    getChallengeDB();


  if (
    database &&
    typeof matchId ===
      "string" &&
    matchId
  ) {

    database
      .ref(
        `thachDau/${matchId}`
      )
      .remove()

      .catch(
        error => {

          console.error(
            error
          );

        }
      );
  }


  activeMatchId =
    null;


  currentRoundKey =
    "";


  roundEnding =
    false;


  clearCurrentMatchUI();
}


/* =========================================================
   KHỞI ĐỘNG CHALLENGE
   ========================================================= */

function khoiDongChallenge() {

  const database =
    getChallengeDB();


  if (!database) {

    /*
      Firebase có thể chưa xong
      ở thời điểm script chạy.
      Thử lại sau.
    */

    setTimeout(
      khoiDongChallenge,
      500
    );

    return;
  }


  listenMatches();


  if (activeMatchId) {

    langNgheMatch(
      activeMatchId
    );
  }


  if (
    auth &&
    auth.currentUser
  ) {

    loadHistory();
  }
}


/* =========================================================
   GLOBAL
   ========================================================= */

window.createMatch =
  createMatch;


window.joinMatch =
  joinMatch;


window.batDauMatch =
  batDauMatch;


window.submitAnswer =
  submitAnswer;


window.choBot =
  choBot;


window.dongMatch =
  dongMatch;


window.toggleHistory =
  toggleHistory;


window.loadHistory =
  loadHistory;


window.batDauTheoDoiBot =
  batDauTheoDoiBot;


/* =========================================================
   KHỞI ĐỘNG SAU KHI FIREBASE + MAIN SẴN SÀNG
   ========================================================= */

setTimeout(
  khoiDongChallenge,
  500
);