import {
    layTu2AmTiet,
    layDanhSachTu2AmTiet,
    themAmTietCuoi
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

    const danhSachKey = await layDanhSachTu2AmTiet();

    for (const key of danhSachKey) {
        const data = await layTu2AmTiet(key);

        if (
            !data ||
            !data.DanhSachAmTietCuoi
        ) {
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
    const valueRaw =
        document.getElementById("input-value").value.trim();

    if (!valueRaw || !tuGocHienTai) {
        return;
    }

    const newValues = valueRaw
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);

    const isKho =
        document.getElementById("checkbox-kho").checked;

    const data = await layTu2AmTiet(tuGocHienTai);

    let currentList = [];

    if (
        data &&
        data.DanhSachAmTietCuoi &&
        data.DanhSachAmTietCuoi !== "."
    ) {
        currentList = data.DanhSachAmTietCuoi
            .split(",")
            .map(v => v.trim())
            .filter(Boolean);
    }

    const toAdd = newValues.filter(
        v => !currentList.includes(v)
    );

    if (!toAdd.length) {
        renderThongBao("Từ này đã có đầy đủ âm tiết.");
        return;
    }

    await themAmTietCuoi(
        tuGocHienTai,
        toAdd
    );

    daThem += toAdd.length;

    await themMotTuMoi(
        toAdd.map(v => `${tuGocHienTai} ${v}`)
    );

    for (const val of toAdd) {
        const valKey =
            val.charAt(0).toUpperCase() +
            val.slice(1);

        const daTonTai =
            await layTu2AmTiet(valKey);

        if (!daTonTai) {
            await themAmTietCuoi(valKey, []);
        }

        if (isKho) {
            await themTuKho(
                `${tuGocHienTai} ${val}`,
                true
            );
        }
    }

    renderThongBao(
        `✔️ Đã thêm: ${toAdd.length} từ cho "${tuGocHienTai}". (${daThem}/22)`
    );
}

async function danhDauTuCut() {
    if (!tuGocHienTai) {
        return;
    }

    await themAmTietCuoi(
        tuGocHienTai,
        ["."]
    );

    daThem++;

    renderThongBao(
        `⚠️ Đã đánh dấu "${tuGocHienTai}" là từ cụt. (${daThem}/22)`
    );

    document.getElementById("input-value").value = "";

    setTimeout(layTuTiep, 500);
}

document.getElementById("btn-them").onclick = themTu;

document.getElementById("btn-khong-noi-duoc").onclick =
    danhDauTuCut;

document.getElementById("btn-tiep").onclick =
    layTuTiep;

document.addEventListener(
    "DOMContentLoaded",
    layTuTiep
);