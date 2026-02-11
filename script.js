let currentCode = null;
let drawn = 0;
let remaining = 0;

function showCodeInput() {
    document.getElementById("coverScreen").style.display = "none";
    document.getElementById("codeScreen").style.display = "block";
}

function verifyCode() {
    const code = document.getElementById("codeInput").value;
    fetch("/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentCode = code;
            document.getElementById("codeScreen").style.display = "none";
            document.getElementById("gachaScreen").style.display = "block";
            updateDrawInfo(0, 0);
        } else {
            document.getElementById("codeMsg").innerText = "驗證碼無效或已使用";
        }
    });
}

function drawPrize() {
    if (!currentCode) return;
    fetch("/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            drawn = data.drawn;
            remaining = data.remaining;
            updateDrawInfo(drawn, remaining);

            const prizeImg = document.getElementById("prizeImg");
            prizeImg.src = `images/prize${data.prize}.png`;
            document.getElementById("prizePopup").style.display = "block";
            document.getElementById("prizeSound").play();
        }
    });
}

function closePrize() {
    document.getElementById("prizePopup").style.display = "none";
}

function updateDrawInfo(d, r) {
    document.getElementById("drawInfo").innerText = `已抽：${d} / 剩餘：${r}`;
}
