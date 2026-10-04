/* =========================
   XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ
   ========================= */

function getAuthError(e) {
  const errors = {
    "auth/email-already-in-use": "Email này đã được đăng ký.",
    "auth/invalid-email": "Email không hợp lệ.",
    "auth/weak-password": "Mật khẩu phải có ít nhất 6 ký tự.",
    "auth/user-not-found": "Không tìm thấy tài khoản.",
    "auth/wrong-password": "Sai mật khẩu.",
    "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
    "auth/too-many-requests": "Bạn thử quá nhiều lần. Hãy thử lại sau.",
    "auth/network-request-failed": "Lỗi mạng. Hãy kiểm tra kết nối Internet."
  };

  return errors[e.code] || e.message || "Có lỗi xảy ra.";
}


/* =========================
   ĐỔI CHẾ ĐỘ ĐĂNG NHẬP
   ========================= */

function toggleAuthMode() {
  registerMode = !registerMode;

  $("authTitle").textContent =
    registerMode ? "📝 Đăng ký" : "🔐 Đăng nhập";

  $("authBtn").textContent =
    registerMode ? "Đăng ký" : "Đăng nhập";

  $("switchBtn").textContent =
    registerMode
      ? "Đã có tài khoản? Đăng nhập"
      : "Chưa có tài khoản? Đăng ký";

  $("displayName").classList.toggle(
    "hidden",
    !registerMode
  );

  $("authError").textContent = "";
}


/* =========================
   ĐĂNG NHẬP / ĐĂNG KÝ
   ========================= */

async function handleAuth() {
  const email = $("email").value.trim();
  const password = $("password").value;
  const error = $("authError");

  error.textContent = "";

  if (!email || !password) {
    error.textContent =
      "Hãy nhập email và mật khẩu.";
    return;
  }

  if (registerMode) {
    const name =
      $("displayName").value.trim();

    if (name.length < 2 || name.length > 50) {
      error.textContent =
        "Tên phải từ 2 đến 50 ký tự.";
      return;
    }

    if (/[.#$/\[\]]/.test(name)) {
      error.textContent =
        "Tên chứa ký tự không hợp lệ.";
      return;
    }
  }

  const button = $("authBtn");

  button.disabled = true;

  try {

    if (registerMode) {

      const name =
        $("displayName").value.trim();

      const result =
        await auth.createUserWithEmailAndPassword(
          email,
          password
        );

      await db
        .ref("nguoiDung/" + result.user.uid)
        .set({
          ten: name,
          email: email,
          xp: 0,
          level: 1,
          ngayTao:
            firebase.database.ServerValue.TIMESTAMP
        });

    } else {

      await auth.signInWithEmailAndPassword(
        email,
        password
      );
    }

  } catch (e) {

    console.error("Auth error:", e);

    error.textContent =
      getAuthError(e);

  } finally {

    button.disabled = false;
  }
}


/* =========================
   THEO DÕI ĐĂNG NHẬP
   ========================= */

auth.onAuthStateChanged(async user => {

  if (!user) {

    currentUser = null;

    if (matchListener) {
      matchListener();
      matchListener = null;
    }

    if (matchTimer) {
      clearInterval(matchTimer);
      matchTimer = null;
    }

    activeMatchId = null;

    $("authModal").classList.remove(
      "hidden"
    );

    return;
  }


  currentUser = user;

  $("authModal").classList.add(
    "hidden"
  );

  try {

    await loadUser();

  } catch (error) {

    console.error(
      "Không tải được người dùng:",
      error
    );

  }
});


/* =========================
   ĐĂNG XUẤT
   ========================= */

function logout() {

  if (
    confirm(
      "Bạn có chắc muốn đăng xuất?"
    )
  ) {

    auth.signOut()
      .catch(error => {
        console.error(
          "Logout error:",
          error
        );
      });
  }
}


/* =========================
   ĐƯA HÀM RA WINDOW
   ========================= */

window.handleAuth =
  handleAuth;

window.toggleAuthMode =
  toggleAuthMode;

window.logout =
  logout;