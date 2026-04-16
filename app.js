let emailSet = new Set();
window.logout = function() {
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js").then(({ signOut }) => {
        import('./firebase-config.js').then(({ auth }) => {
            signOut(auth).then(() => {
                window.location.href = 'login.html';
            });
        });
    });
}

const commonDomains = [
    'gmail.com', 'naver.com', 'kakao.com', 'daum.net',
    'hanmail.net', 'nate.com', 'yahoo.com', 'hotmail.com',
    'outlook.com', 'icloud.com', 'me.com', 'live.com'
];

window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('imageInput').addEventListener('change', updateFileName);
    loadFromLocal();
});

function updateFileName() {
    const imageInput = document.getElementById('imageInput');
    const fileNameDiv = document.getElementById('fileName');
    if (imageInput.files.length > 0) {
        const fileNames = Array.from(imageInput.files).map(f => f.name).join(', ');
        fileNameDiv.innerText = `선택된 파일: ${fileNames}`;
    } else {
        fileNameDiv.innerText = '선택된 파일 없음';
    }
}

function saveToLocal() {
    localStorage.setItem('savedEmails', JSON.stringify(Array.from(emailSet)));
    alert('저장되었습니다!');
}

function loadFromLocal() {
    const saved = localStorage.getItem('savedEmails');
    if (saved) {
        const emails = JSON.parse(saved);
        emails.forEach(email => emailSet.add(email));
        renderEmailList();
        document.getElementById('downloadBtn').style.display = 'block';
    }
}

function clearLocal() {
    if (confirm('저장된 이메일을 모두 삭제할까요?')) {
        localStorage.removeItem('savedEmails');
        emailSet.clear();
        renderEmailList();
        document.getElementById('downloadBtn').style.display = 'none';
    }
}

function preprocessImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            const scale = 2;
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const threshold = 140;

            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                const binary = gray > threshold ? 255 : 0;
                data[i] = binary;
                data[i + 1] = binary;
                data[i + 2] = binary;
                data[i + 3] = 255;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function correctDomain(domain) {
    const candidates = generateCandidates(domain);
    for (const candidate of candidates) {
        if (commonDomains.includes(candidate)) {
            return candidate;
        }
    }
    return domain.replace(/I/g, 'l');
}

function generateCandidates(str) {
    const candidates = new Set();
    candidates.add(str.toLowerCase());
    candidates.add(str.replace(/1/g, 'l').toLowerCase());
    candidates.add(str.replace(/l/g, '1').toLowerCase());
    candidates.add(str.replace(/I/g, 'l').toLowerCase());
    candidates.add(str.replace(/I/g, '1').toLowerCase());
    candidates.add(str.replace(/1/g, 'l').replace(/I/g, 'l').toLowerCase());
    candidates.add(str.replace(/l/g, '1').replace(/I/g, '1').toLowerCase());
    candidates.add(str.replace(/0/g, 'o').toLowerCase());
    candidates.add(str.replace(/o/g, '0').toLowerCase());
    return candidates;
}

function correctLocalPart(local) {
    let result = '';
    for (let i = 0; i < local.length; i++) {
        const char = local[i];
        const prev = local[i - 1];
        const next = local[i + 1];

        if (char === 'l' || char === 'I') {
            const prevIsNum = prev && /[0-9]/.test(prev);
            const nextIsNum = next && /[0-9]/.test(next);
            if (prevIsNum || nextIsNum) {
                result += '1';
            } else {
                result += char === 'I' ? 'l' : char;
            }
        } else {
            result += char;
        }
    }
    return result;
}

function correctEmailMistakes(email) {
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;
    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);
    const correctedLocal = correctLocalPart(localPart);
    const correctedDomain = correctDomain(domainPart);
    return correctedLocal + '@' + correctedDomain;
}

function renderEmailList() {
    const emailList = document.getElementById('emailList');
    const emailCount = document.getElementById('emailCount');
    emailList.innerHTML = '';

    if (emailSet.size === 0) {
        emailList.innerHTML = '<div id="noResult">아직 추출된 이메일이 없습니다.</div>';
        emailCount.innerText = '';
        return;
    }

    emailCount.innerText = `(총 ${emailSet.size}개)`;

    Array.from(emailSet).forEach((email) => {
        const row = document.createElement('div');
        row.className = 'email-edit-row';
        row.dataset.original = email;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = email;
        input.addEventListener('change', function () {
            emailSet.delete(row.dataset.original);
            emailSet.add(this.value.trim().toLowerCase());
            row.dataset.original = this.value.trim().toLowerCase();
            emailCount.innerText = `(총 ${emailSet.size}개)`;
            saveToLocal();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerText = '삭제';
        deleteBtn.addEventListener('click', function () {
            emailSet.delete(row.dataset.original);
            row.remove();
            emailCount.innerText = emailSet.size > 0 ? `(총 ${emailSet.size}개)` : '';
            if (emailSet.size === 0) {
                emailList.innerHTML = '<div id="noResult">아직 추출된 이메일이 없습니다.</div>';
                document.getElementById('downloadBtn').style.display = 'none';
            }
            saveToLocal();
        });

        row.appendChild(input);
        row.appendChild(deleteBtn);
        emailList.appendChild(row);
    });
}

function extractEmails() {
    const imageInput = document.getElementById('imageInput');
    if (imageInput.files.length === 0) {
        alert("이미지 파일을 선택해주세요.");
        return;
    }

    const files = Array.from(imageInput.files);
    const progressBarFill = document.getElementById('progress-bar-fill');
    const extractBtn = document.getElementById('extractBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    let completed = 0;

    extractBtn.disabled = true;
    downloadBtn.style.display = 'none';
    progressBarFill.style.width = '0%';
    progressBarFill.innerText = '0%';

    const updateProgress = () => {
        const progress = ((completed / files.length) * 100).toFixed(1);
        progressBarFill.style.width = progress + '%';
        progressBarFill.innerText = progress + '%';
    };

    const promises = files.map((file) =>
        preprocessImage(file)
            .then((processedDataURL) =>
                Tesseract.recognize(
                    processedDataURL,
                    'eng',
                    {
                        logger: info => console.log(info),
                        tessedit_pageseg_mode: '6',
                        tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@._-'
                    }
                )
            )
            .then(function (result) {
                const text = result.data.text;
                console.log('인식된 텍스트:', text);
                const extractedEmails = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/g);
                if (extractedEmails) {
                    extractedEmails
                        .map(email => correctEmailMistakes(email))
                        .forEach(email => emailSet.add(email.toLowerCase()));
                }
            })
            .finally(() => {
                completed++;
                updateProgress();
            })
    );

    Promise.all(promises).then(() => {
        extractBtn.disabled = false;
        renderEmailList();
        if (emailSet.size > 0) {
            downloadBtn.style.display = 'block';
            saveToLocal();
        }
    }).catch(err => {
        console.error('오류 발생:', err);
        alert('이미지 처리 중 오류가 발생했습니다.');
        extractBtn.disabled = false;
    });
}

function downloadEmails() {
    const emails = Array.from(emailSet).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emails.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
