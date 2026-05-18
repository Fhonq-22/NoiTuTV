import {
    addData,
    getData,
    deleteData
} from "../Models/firebase-CRUD.js";

import { DongGop } from "../Models/MODEL.js";

export async function themDongGop(userName, word, status = true) {
    const data = new DongGop(userName, word, status);
    await addData("Đóng góp", userName, data.toJSON());
}

export async function layDongGop(userName) {
    const data = await getData("Đóng góp", userName);
    if (!data) return null;
    return new DongGop(userName, data.word || data, data.status ?? true);
}

export async function layDanhSachDongGop() {
    const data = await getData("Đóng góp", "");
    return data ? Object.keys(data) : [];
}

export async function capNhatDongGop(userName, word, status = true) {
    const data = new DongGop(userName, word, status);
    await addData("Đóng góp", userName, data.toJSON());
}

export async function xoaDongGop(userName) {
    await deleteData("Đóng góp", userName);
}