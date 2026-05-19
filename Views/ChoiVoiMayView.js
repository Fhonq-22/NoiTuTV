import {
    layDanhSachTu2AmTiet,
    layTu2AmTiet
} from "../Controllers/Tu2AmTietController.js";

let tuHienTai = "";
let diem = 0;
let thoiGian = 22;
let timer;
let dangLuotNguoi = true;

const tuHienTaiSpan = document.getElementById("tu-hien-tai");
const thoiGianSpan = document.getElementById("thoi-gian");
const diemSpan = document.getElementById("diem");
const input = document.getElementById("input-value");
const btnTraLoi = document.getElementById("btn-tra-loi");
const thongBao = document.getElementById("thong-bao");

async function batDauGame() {
    diem = 0;
    diemSpan.textContent = diem;

    await layTuNgauNhien();

    dangLuotNguoi = true;

    batDauDemNguoc();

    resetUI();
}

async function layTuNgauNhien() {
    const keys = await layDanhSachTu2AmTiet();

    tuHienTai = keys[Math.floor(Math.random() * keys.length)];

    tuHienTaiSpan.textContent = tuHienTai;
}

function batDauDemNguoc() {
    clearInterval(timer);

    thoiGian = 22;
    thoiGianSpan.textContent = thoiGian;

    timer = setInterval(() => {
        thoiGian--;
        thoiGianSpan.textContent = thoiGian;

        if (thoiGian <= 0) {
            clearInterval(timer);
            ketThucGame("⏱️ Hết giờ, bạn thua!");
        }
    }, 1000);
}

function ketThucGame(msg) {
    thongBao.textContent = msg;

    btnTraLoi.disabled = true;
    input.disabled = true;

    clearInterval(timer);
}

function resetUI() {
    thongBao.textContent = "";

    input.value = "";

    input.disabled = false;
    btnTraLoi.disabled = false;

    input.focus();
}

btnTraLoi.onclick = async () => {
    if (!dangLuotNguoi) return;

    const valRaw = input.value.trim();

    if (!valRaw) return;

    const val =
        valRaw.charAt(0).toUpperCase() +
        valRaw.slice(1).toLowerCase();

    const data = await layTu2AmTiet(tuHienTai);

    const list = (data?.DanhSachAmTietCuoi || "")
        .split(",")
        .map(v => v.trim());

    const hopLe = list.some(
        v => v.toLowerCase() === valRaw.toLowerCase()
    );

    if (hopLe) {
        diem++;
        diemSpan.textContent = diem;

        thongBao.textContent = "✅ Chính xác! Đến lượt máy...";

        input.value = "";
        input.disabled = true;

        btnTraLoi.disabled = true;

        clearInterval(timer);

        dangLuotNguoi = false;

        tuHienTai = val;
        tuHienTaiSpan.textContent = tuHienTai;

        setTimeout(() => {
            luotMay();
        }, 2000);
    } else {
        thongBao.textContent = "❌ Không đúng, thử lại!";
    }
};

async function luotMay() {
    const data = await layTu2AmTiet(tuHienTai);

    const danhSach = data?.DanhSachAmTietCuoi || "";

    if (!danhSach || danhSach === ".") {
        ketThucGame("🤖 Máy không tìm được từ nối tiếp. Bạn thắng!");
        return;
    }

    const list = danhSach
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);

    const amTietMay =
        list[Math.floor(Math.random() * list.length)];

    diem++;
    diemSpan.textContent = diem;

    thongBao.textContent = `🤖 Máy chọn: ${amTietMay}`;

    tuHienTai =
        amTietMay.charAt(0).toUpperCase() +
        amTietMay.slice(1);

    tuHienTaiSpan.textContent = tuHienTai;

    dangLuotNguoi = true;

    resetUI();

    batDauDemNguoc();
}

document.addEventListener("DOMContentLoaded", batDauGame);