import {
    layTu2AmTiet
} from "../Controllers/Tu2AmTietController.js";

import {
    themDongGop,
    layDongGop
} from "../Controllers/DongGopController.js";

const userName = "user02";

const inputTu = document.getElementById("input-tu");
const btnDongGop = document.getElementById("btn-dong-gop");
const thongBao = document.getElementById("thong-bao");

function render(msg, isError = false) {
    thongBao.textContent = msg;
    thongBao.classList.toggle("error", isError);
}

function parseInput(value) {
    const parts = value.trim().split(" ").filter(Boolean);
    if (parts.length !== 2) return null;

    const tuGoc =
        parts[0].charAt(0).toUpperCase() +
        parts[0].slice(1).toLowerCase();

    const amTiet2 = parts[1].toLowerCase();

    return { tuGoc, amTiet2, tuMoi: `${tuGoc} ${amTiet2}` };
}

btnDongGop.onclick = async () => {
    const parsed = parseInput(inputTu.value);

    if (!parsed) {
        return render("Vui lòng nhập đúng 2 âm tiết.", true);
    }

    const { tuGoc, amTiet2, tuMoi } = parsed;

    try {
        const tuData = await layTu2AmTiet(tuGoc);

        if (tuData && tuData.DanhSachAmTietCuoi) {
            const list = tuData.DanhSachAmTietCuoi
                .split(",")
                .map(v => v.trim().toLowerCase());

            if (list.includes(amTiet2)) {
                return render("Từ này đã tồn tại trong từ điển.", true);
            }
        }

        const dongGopCu = await layDongGop(userName);

        if (dongGopCu && dongGopCu.Word === tuMoi) {
            return render("Bạn đã đóng góp từ này rồi.", true);
        }

        await themDongGop(userName, tuMoi, true);

        render(`✅ Cảm ơn bạn đã đóng góp: ${tuMoi}`);

        inputTu.value = "";

    } catch (err) {
        render("Lỗi hệ thống, vui lòng thử lại.", true);
    }
};