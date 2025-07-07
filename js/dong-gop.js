import { db } from "./firebase-config.js";

const userName = "user02";

const inputTu = document.getElementById("input-tu");
const btnDongGop = document.getElementById("btn-dong-gop");
const thongBao = document.getElementById("thong-bao");

// Viết hoa âm tiết đầu, giữ nguyên âm tiết sau
function chuanHoaTuNhap(value) {
  const parts = value.trim().split(" ").filter(Boolean);
  if (parts.length !== 2) return "";
  const tuGoc = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const amTiet2 = parts[1].toLowerCase();
  return `${tuGoc} ${amTiet2}`;
}

// Viết hoa âm tiết đầu ngay trong khi nhập
inputTu.addEventListener("input", () => {
  const value = inputTu.value;
  const chuanHoa = chuanHoaTuNhap(value);
  if (chuanHoa) {
    inputTu.value = chuanHoa;
  }
});

function kiemTraDaDongGop(user, tuMoi) {
  return db.ref(`Đóng góp/${user}/${tuMoi}`).once("value").then(snap => snap.exists());
}

function layGiaTriTuDien(tuGoc) {
  return db.ref("Từ 2 âm tiết/" + tuGoc).once("value").then(snap => snap.val());
}

function themDongGop(user, tuMoi) {
  db.ref(`Đóng góp/${user}/${tuMoi}`).set(false)
    .then(() => {
      thongBao.textContent = `✅ Cảm ơn bạn đã đóng góp từ "${tuMoi}". Từ đang chờ duyệt.`;
      thongBao.classList.remove("error");
      inputTu.value = "";
    })
    .catch(() => {
      thongBao.textContent = "❌ Lỗi khi gửi đóng góp, vui lòng thử lại.";
      thongBao.classList.add("error");
    });
}

btnDongGop.onclick = async () => {
  const tuRaw = inputTu.value.trim();
  if (!tuRaw) {
    thongBao.textContent = "Vui lòng nhập từ cần đóng góp.";
    thongBao.classList.add("error");
    return;
  }

  const parts = tuRaw.split(" ").filter(Boolean);
  if (parts.length !== 2) {
    thongBao.textContent = "Vui lòng nhập đúng 2 âm tiết, cách nhau bởi dấu cách.";
    thongBao.classList.add("error");
    return;
  }

  const tuGoc = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const amTiet2 = parts[1].toLowerCase();
  const tuMoi = `${tuGoc} ${amTiet2}`;

  try {
    const giaTriTuDien = await layGiaTriTuDien(tuGoc);

    // ✅ Ghi chú logic cho sau dễ đọc:
    if (!giaTriTuDien) {
      // Key chưa có trong từ điển → vẫn cho đóng góp
    } else if (giaTriTuDien === "" || giaTriTuDien === ".") {
      // Key đã có nhưng chưa có âm tiết thứ 2 → vẫn cho đóng góp
    } else {
      // Key đã có danh sách → kiểm tra tránh trùng
      const list = giaTriTuDien.split(",").map(v => v.trim().toLowerCase());
      if (list.includes(amTiet2)) {
        thongBao.textContent = `Từ "${tuMoi}" đã có trong từ điển rồi.`;
        thongBao.classList.add("error");
        return;
      }
    }

    const daDongGop = await kiemTraDaDongGop(userName, tuMoi);
    if (daDongGop) {
      thongBao.textContent = `Bạn đã đóng góp từ "${tuMoi}" trước đó.`;
      thongBao.classList.add("error");
      return;
    }

    // Ghi đóng góp
    themDongGop(userName, tuMoi);

  } catch (err) {
    thongBao.textContent = "Lỗi hệ thống, vui lòng thử lại.";
    thongBao.classList.add("error");
  }
};
