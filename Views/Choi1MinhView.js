import {
    layDanhSachTu2AmTiet,
    layTu2AmTiet
} from "../Controllers/Tu2AmTietController.js";

let diem = 0;
let thoiGian = 22;
let timer;
let tuGoc = "";

const tuGocSpan = document.getElementById("tu-goc");
const thoiGianSpan = document.getElementById("thoi-gian");
const diemSpan = document.getElementById("diem");
const input = document.getElementById("input-value");
const btnTraLoi = document.getElementById("btn-tra-loi");
const thongBao = document.getElementById("thong-bao");

async function batDauGame() {
    diem = 0;
    diemSpan.textContent = diem;

    await layTuNgauNhien();
    batDauDemNguoc();
}

async function layTuNgauNhien() {
    const keys = await layDanhSachTu2AmTiet();

    tuGoc = keys[Math.floor(Math.random() * keys.length)];

    tuGocSpan.textContent = tuGoc;
}

function batDauDemNguoc() {
    clearInterval(timer);

    thoiGian = 22;
    thoiGianSpan.textContent = thoiGian;

    timer = setInterval(() => {
        thoiGian--;
        thoiGianSpan.textContent = thoiGian;

        if (thoiGian === 0) {
            clearInterval(timer);
            ketThucGame("⏱️ Hết giờ!");
        }
    }, 1000);
}

function ketThucGame(msg) {
    thongBao.textContent = msg;
    btnTraLoi.disabled = true;
    input.disabled = true;
}

btnTraLoi.onclick = async () => {
    const valRaw = input.value.trim();

    if (!valRaw) return;

    const val =
        valRaw.charAt(0).toUpperCase() +
        valRaw.slice(1).toLowerCase();

    const data = await layTu2AmTiet(tuGoc);

    const danhSach = (data?.DanhSachAmTietCuoi || "")
        .split(",")
        .map(v => v.trim());

    if (danhSach.some(v => v.toLowerCase() === valRaw.toLowerCase())) {
        diem += val.length >= 5 ? 2 : 1;

        diemSpan.textContent = diem;

        thongBao.textContent = "✅ Chính xác!";
        thongBao.classList.add("success");

        tuGoc = val;
        tuGocSpan.textContent = tuGoc;

        input.value = "";

        batDauDemNguoc();
    } else {
        thongBao.textContent = "❌ Không đúng, thử lại!";
        thongBao.classList.remove("success");
    }
};

document.addEventListener("DOMContentLoaded", batDauGame);