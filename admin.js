function generateCode() {
    fetch("/generate-code", { method: "POST" })
    .then(res => res.json())
    .then(data => {
        document.getElementById("newCode").innerText = data.code;
        loadHistory(); // 同時刷新歷史
    });
}

function loadHistory() {
    fetch("/admin/history")
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById("historyTable");
        tbody.innerHTML = "";
        data.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${item.code}</td><td>${item.prize}</td><td>${item.time}</td>`;
            tbody.appendChild(tr);
        });
    });
}

// 初始載入歷史
loadHistory();
