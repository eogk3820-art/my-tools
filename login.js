import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 이미 로그인 상태면 dashboard로
onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = 'dashboard.html';
});

// 탭 전환
window.switchTab = function(tab) {
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
window.register = async function() {
    const email = document.getElementById('regId').value.trim();
    const pw = document.getElementById('regPw').value;
    const pwConfirm = document.getElementById('regPwConfirm').value;
    const msg = document.getElementById('registerMsg');

    if (!email || !pw || !pwConfirm) {
        msg.className = 'message error';
        msg.innerText = '모든 항목을 입력해주세요.';
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

    try {
        await createUserWithEmailAndPassword(auth, email, pw);
        msg.className = 'message success';
        msg.innerText = '회원가입 완료! 로그인해주세요.';
        setTimeout(() => {
            document.getElementById('regId').value = '';
            document.getElementById('regPw').value = '';
            document.getElementById('regPwConfirm').value = '';
            msg.innerText = '';
            switchTab('login');
        }, 1500);
    } catch (e) {
        msg.className = 'message error';
        if (e.code === 'auth/email-already-in-use') {
            msg.innerText = '이미 사용 중인 이메일입니다.';
        } else if (e.code === 'auth/invalid-email') {
            msg.innerText = '이메일 형식이 올바르지 않습니다.';
        } else {
            msg.innerText = '오류: ' + e.message;
        }
    }
}

// 로그인
window.login = async function() {
    const email = document.getElementById('loginId').value.trim();
    const pw = document.getElementById('loginPw').value;
    const msg = document.getElementById('loginMsg');

    if (!email || !pw) {
        msg.className = 'message error';
        msg.innerText = '이메일과 비밀번호를 입력해주세요.';
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, pw);
        msg.className = 'message success';
        msg.innerText = '로그인 성공! 이동 중...';
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (e) {
        msg.className = 'message error';
        if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
            msg.innerText = '이메일 또는 비밀번호가 틀렸습니다.';
        } else if (e.code === 'auth/invalid-email') {
            msg.innerText = '이메일 형식이 올바르지 않습니다.';
        } else {
            msg.innerText = '오류: ' + e.message;
        }
    }
}
