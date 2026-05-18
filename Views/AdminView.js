import {
    themAmTietCuoi,
    layDanhSachTu2AmTiet
} from "../../Controllers/Tu2AmTietController.js";

import {
    themTuKho
} from "../../Controllers/TuKhoController.js";

import {
    themMotTuMoi
} from "../../Controllers/TuMoiController.js";

let tuGocHienTai = "";
let daThem = 0;
const GIOI_HAN = 22;

function renderThongBao(msg) {
    document.getElementById("thong-bao").textContent = msg;
}

async function layTuTiep() {
    if (daThem >= GIOI_HAN) {
        renderThongBao("Đã đạt giới hạn 22 từ đóng góp.");
        return;
    }

    const data = await layDanhSachTu2AmTiet();

    for (const key in data) {
        if (!data[key]) {
            tuGocHienTai = key;
            document.getElementById("tu-goc").textContent = key;
            document.getElementById("input-value").value = "";
            document.getElementById("checkbox-kho").checked = false;
            renderThongBao("");
            return;
        }
    }

    document.getElementById("tu-goc").textContent =
        "✔️ Đã xử lý hết từ cần đóng góp.";
}

async function themTu() {
    const valueRaw = document.getElementById("input-value").value.trim();
    if (!valueRaw || !tuGocHienTai) return;

    const newValues = valueRaw
        .split(",")
        .map(v => v.trim())
        .filter(v => v);

    const isKho = document.getElementById("checkbox-kho").checked;

    const toAdd = await themAmTietCuoi(tuGocHienTai, newValues);

    if (!toAdd.length) {
        renderThongBao("Từ này đã có đầy đủ âm tiết.");
        return;
    }

    daThem += toAdd.length;

    await themMotTuMoi(
        toAdd.map(v => `${tuGocHienTai} ${v}`)
    );

    if (isKho) {
        for (const val of toAdd) {
            await themTuKho(`${tuGocHienTai} ${val}`, true);
        }
    }

    renderThongBao(
        `✔️ Đã thêm: ${toAdd.length} từ cho "${tuGocHienTai}". (${daThem}/22)`
    );
}

async function danhDauTuCut() {
    if (!tuGocHienTai) return;

    await themAmTietCuoi(tuGocHienTai, ["."]);
    daThem++;

    renderThongBao(
        `⚠️ Đã đánh dấu "${tuGocHienTai}" là từ cụt. (${daThem}/22)`
    );

    document.getElementById("input-value").value = "";

    setTimeout(layTuTiep, 500);
}

document.getElementById("btn-them").onclick = themTu;
document.getElementById("btn-khong-noi-duoc").onclick = danhDauTuCut;
document.getElementById("btn-tiep").onclick = layTuTiep;

document.addEventListener("DOMContentLoaded", layTuTiep);