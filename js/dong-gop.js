import { db } from "./firebase-config.js";

let tuGocHienTai = "";
let daThem = 0;
const GIOI_HAN = 222;

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

  // Lấy giá trị hiện tại rồi nối thêm
  db.ref(`Từ 2 âm tiết/${tuGocHienTai}`)
    .once("value")
    .then((snap) => {
      let currentVal = snap.val() || "";
      let currentList = currentVal
        ? currentVal.split(",").map((v) => v.trim()).filter((v) => v)
        : [];

      // Lọc ra các âm tiết mới không trùng với hiện có
      let toAdd = newValues.filter((v) => !currentList.includes(v));

      if (toAdd.length === 0) {
        document.getElementById("thong-bao").textContent = "Từ này đã có đầy đủ âm tiết.";
        return;
      }

      // Nối chuỗi mới
      let updatedList = currentList.concat(toAdd);
      let updatedStr = updatedList.join(",");

      // Ghi lại vào csdl
      db.ref(`Từ 2 âm tiết/${tuGocHienTai}`).set(updatedStr);

      // Lưu vào TuMoi, TuKho nếu cần
      toAdd.forEach((val) => {
        const full = `${tuGocHienTai} ${val}`;
        db.ref(`Từ mới/${full}`).set(true);

        if (isKho) {
          db.ref(`Từ khó/${full}`).set(true);
        }

        db.ref(`Từ 2 âm tiết/${val}`)
          .once("value")
          .then((snap2) => {
            if (!snap2.exists()) {
              db.ref(`Từ 2 âm tiết/${val}`).set(null);
            }
          });
      });

      daThem++;
      document.getElementById("thong-bao").textContent = `✔️ Đã thêm: ${toAdd.length} từ cho "${tuGocHienTai}". (${daThem}/222)`;
    });
}


document.getElementById("btn-them").onclick = themTu;
document.getElementById("btn-tiep").onclick = layTuTiep;

document.addEventListener("DOMContentLoaded", layTuTiep);
