import { db } from "./firebase-config.js";

let tuGocHienTai = "";
let daThem = 0;
const GIOI_HAN = 22;

function layTuTiep() {
  if (daThem >= GIOI_HAN) {
    document.getElementById("thong-bao").textContent =
      "Đã đạt giới hạn 222 từ đóng góp.";
    return;
  }

  db.ref("Từ 2 âm tiết")
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      for (const key in data) {
        if (!data[key]) {
          tuGocHienTai = key;
          document.getElementById("tu-goc").textContent = key;
          document.getElementById("input-value").value = "";
          document.getElementById("checkbox-kho").checked = false;
          document.getElementById("thong-bao").textContent = "";
          return;
        }
      }
      document.getElementById("tu-goc").textContent =
        "✔️ Đã xử lý hết từ cần đóng góp.";
    });
}

function themTu() {
  const valueRaw = document.getElementById("input-value").value.trim();
  if (!valueRaw) return;

  const newValues = valueRaw
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v);
  const isKho = document.getElementById("checkbox-kho").checked;

  if (!tuGocHienTai || newValues.length === 0) return;

  db.ref(`Từ 2 âm tiết/${tuGocHienTai}`)
    .once("value")
    .then((snap) => {
      let currentVal = snap.val() || "";
      let currentList = currentVal
        ? currentVal.split(",").map((v) => v.trim()).filter((v) => v)
        : [];

      let toAdd = newValues.filter((v) => !currentList.includes(v));
      if (toAdd.length === 0) {
        document.getElementById("thong-bao").textContent = "Từ này đã có đầy đủ âm tiết.";
        return;
      }

      let updatedList = currentList.concat(toAdd);
      let updatedStr = updatedList.join(", ");
      db.ref(`Từ 2 âm tiết/${tuGocHienTai}`).set(updatedStr);

      daThem += toAdd.length;

      // Lấy mảng từ mới hiện tại
      db.ref("Từ mới")
        .once("value")
        .then((tuMoiSnap) => {
          let danhSach = tuMoiSnap.val() || [];
          if (!Array.isArray(danhSach)) danhSach = [];

          // Tạo danh sách từ mới
          const tuMoiMoi = toAdd.map((v) => `${tuGocHienTai} ${v}`);

          // Cập nhật danh sách mới (FIFO)
          let fullList = danhSach.concat(tuMoiMoi);
          if (fullList.length > GIOI_HAN) {
            fullList = fullList.slice(fullList.length - GIOI_HAN);
          }

          // Ghi lại danh sách từ mới
          db.ref("Từ mới").set(fullList);

          // Ghi từ khó + tạo key mới nếu cần
          toAdd.forEach((val) => {
            const full = `${tuGocHienTai} ${val}`;

            if (isKho) {
              db.ref(`Từ khó/${full}`).set(true);
            }

            const valKey = val.charAt(0).toUpperCase() + val.slice(1);
            db.ref(`Từ 2 âm tiết/${valKey}`)
              .once("value")
              .then((snap2) => {
                if (!snap2.exists()) {
                  db.ref(`Từ 2 âm tiết/${valKey}`).set("");
                }
              });
          });

          document.getElementById("thong-bao").textContent =
            `✔️ Đã thêm: ${toAdd.length} từ cho "${tuGocHienTai}". (${daThem}/22)`;
        });
    });
}


document.getElementById("btn-them").onclick = themTu;
document.getElementById("btn-tiep").onclick = layTuTiep;

document.addEventListener("DOMContentLoaded", layTuTiep);
