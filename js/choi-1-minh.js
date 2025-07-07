// choi-1-minh.js
import { db } from "./firebase-config.js";

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

function batDauGame() {
  diem = 0;
  diemSpan.textContent = diem;
  layTuNgauNhien();
  batDauDemNguoc();
}

function layTuNgauNhien() {
  db.ref("Từ 2 âm tiết")
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      const keys = Object.keys(data).filter((k) => data[k] && data[k] !== ".");
      tuGoc = keys[Math.floor(Math.random() * keys.length)];
      tuGocSpan.textContent = tuGoc;
    });
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

btnTraLoi.onclick = () => {
  const valRaw = input.value.trim();
  if (!valRaw) return;

  // Viết hoa chữ cái đầu của từ nhập
  const val = valRaw.charAt(0).toUpperCase() + valRaw.slice(1).toLowerCase();

  db.ref(`Từ 2 âm tiết/${tuGoc}`)
    .once("value")
    .then((snap) => {
      const danhSach = (snap.val() || "").split(",").map(v => v.trim());
      // So sánh không phân biệt hoa thường
      if (danhSach.some(v => v.toLowerCase() === valRaw.toLowerCase())) {
        diem += val.length >= 5 ? 2 : 1;
        diemSpan.textContent = diem;
        thongBao.textContent = "✅ Chính xác!";
        thongBao.classList.add("success");
        tuGoc = val;             // Gán từ mới viết hoa chữ đầu
        tuGocSpan.textContent = tuGoc;
        input.value = "";
        batDauDemNguoc();       // Reset lại thời gian khi trả lời đúng
      } else {
        thongBao.textContent = "❌ Không đúng, thử lại!";
        thongBao.classList.remove("success");
      }
    });
};

document.addEventListener("DOMContentLoaded", batDauGame);
