import { db } from "./firebase-config.js";

let tuHienTai = "";
let diem = 0;
let thoiGian = 22;
let timer;
let dangLuotNguoi = true; // true là người chơi, false là máy

const tuHienTaiSpan = document.getElementById("tu-hien-tai");
const thoiGianSpan = document.getElementById("thoi-gian");
const diemSpan = document.getElementById("diem");
const input = document.getElementById("input-value");
const btnTraLoi = document.getElementById("btn-tra-loi");
const thongBao = document.getElementById("thong-bao");

function batDauGame() {
  diem = 0;
  diemSpan.textContent = diem;
  layTuNgauNhien()
    .then((tu) => {
      tuHienTai = tu;
      tuHienTaiSpan.textContent = tuHienTai;
      dangLuotNguoi = true;
      batDauDemNguoc();
      thongBao.textContent = "";
      input.disabled = false;
      btnTraLoi.disabled = false;
      input.value = "";
      input.focus();
    });
}

function layTuNgauNhien() {
  return db.ref("Từ 2 âm tiết")
    .once("value")
    .then((snap) => {
      const data = snap.val();
      const keys = Object.keys(data).filter((k) => data[k] && data[k] !== ".");
      if (keys.length === 0) throw new Error("Chưa có dữ liệu từ để chơi.");
      return keys[Math.floor(Math.random() * keys.length)];
    });
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

btnTraLoi.onclick = () => {
  if (!dangLuotNguoi) return; // tránh nhấn nhiều lần

  const valRaw = input.value.trim();
  if (!valRaw) return;

  const val = valRaw.charAt(0).toUpperCase() + valRaw.slice(1).toLowerCase();

  db.ref(`Từ 2 âm tiết/${tuHienTai}`)
    .once("value")
    .then((snap) => {
      const danhSach = (snap.val() || "").split(",").map((v) => v.trim());
      if (danhSach.some(v => v.toLowerCase() === valRaw.toLowerCase())) {
        diem++;
        diemSpan.textContent = diem;
        thongBao.textContent = "✅ Chính xác! Đến lượt máy...";
        input.value = "";
        input.disabled = true;
        btnTraLoi.disabled = true;
        clearInterval(timer);

        // Người chơi đúng thì chuyển sang máy sau 2s
        dangLuotNguoi = false;
        tuHienTai = val;
        tuHienTaiSpan.textContent = tuHienTai;

        setTimeout(() => {
          luotMayChon();
        }, 2000);
      } else {
        thongBao.textContent = "❌ Không đúng, thử lại!";
      }
    });
};

function luotMayChon() {
  db.ref(`Từ 2 âm tiết/${tuHienTai}`)
    .once("value")
    .then((snap) => {
      const val = snap.val();
      if (!val || val === ".") {
        ketThucGame("🤖 Máy không tìm được từ nối tiếp. Bạn thắng!");
        return;
      }
      const danhSach = val.split(",").map(v => v.trim()).filter(v => v);

      const amTietMayChon = danhSach[Math.floor(Math.random() * danhSach.length)];
      if (!amTietMayChon) {
        ketThucGame("🤖 Máy không tìm được từ nối tiếp. Bạn thắng!");
        return;
      }

      diem++;
      diemSpan.textContent = diem;
      thongBao.textContent = `🤖 Máy chọn: ${amTietMayChon}`;

      // Viết hoa chữ cái đầu
      tuHienTai = amTietMayChon.charAt(0).toUpperCase() + amTietMayChon.slice(1);
      tuHienTaiSpan.textContent = tuHienTai;

      dangLuotNguoi = true;
      input.disabled = false;
      btnTraLoi.disabled = false;
      input.value = "";
      input.focus();

      batDauDemNguoc();
    });
}

document.addEventListener("DOMContentLoaded", batDauGame);
