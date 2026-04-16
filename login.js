// 탭 전환
function switchTab(tab) {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.remove('active');

    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('loginTab').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('registerTab').classList.add('active');
    }
}

// 회원가입
function register() {
    const id = document.getElementById('regId').value.trim();
    const pw = document.getElementById('regPw').value;
    const pwConfirm = document.getElementById('regPwConfirm').value;
    const msg = document.getElementById('registerMsg');

    if (!id || !pw || !pwConfirm) {
        msg.className = 'message error';
        msg.innerText = '모든 항목을 입력해주세요.';
        return;
    }
    if (id.length < 4) {
        msg.className = 'message error';
        msg.innerText = '아이디는 4자 이상이어야 합니다.';
        return;
    }
    if (pw.length < 6) {
        msg.className = 'message error';
        msg.innerText = '비밀번호는 6자 이상이어야 합니다.';
        return;
    }
    if (pw !== pwConfirm) {
        msg.className = 'message error';
        msg.innerText = '비밀번호가 일치하지 않습니다.';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[id]) {
        msg.className = 'message error';
        msg.innerText = '이미 존재하는 아이디입니다.';
        return;
    }

    users[id] = { password: pw };
    localStorage.setItem('users', JSON.stringify(users));

    msg.className = 'message success';
    msg.innerText = '회원가입 완료! 로그인해주세요.';

    setTimeout(() => {
        document.getElementById('regId').value = '';
        document.getElementById('regPw').value = '';
        document.getElementById('regPwConfirm').value = '';
        msg.innerText = '';
        switchTab('login');
    }, 1500);
}

// 로그인
function login() {
    const id = document.getElementById('loginId').value.trim();
    const pw = document.getElementById('loginPw').value;
    const msg = document.getElementById('loginMsg');

    if (!id || !pw) {
        msg.className = 'message error';
        msg.innerText = '아이디와 비밀번호를 입력해주세요.';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (!users[id]) {
        msg.className = 'message error';
        msg.innerText = '존재하지 않는 아이디입니다.';
        return;
    }

    if (users[id].password !== pw) {
        msg.className = 'message error';
        msg.innerText = '비밀번호가 틀렸습니다.';
        return;
    }

    localStorage.setItem('loggedInUser', id);
    msg.className = 'message success';
    msg.innerText = '로그인 성공! 이동 중...';

    setTimeout(() => {
        window.location.href = 'dashboard.html'; // ✅ 여기만 변경
    }, 1000);
}

// 페이지 로드 시 이미 로그인 되어있으면 바로 이동
window.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('loggedInUser')) {
        window.location.href = 'dashboard.html'; // ✅ 여기도 변경
    }
});
