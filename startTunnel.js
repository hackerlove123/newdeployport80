const localtunnel = require('localtunnel');
const axios = require('axios');
const { exec } = require('child_process');

const PORT = 80; // Cổng mà api.js đang chạy
const TELEGRAM_TOKEN = '7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw';
const CHAT_ID = '7371969470';

(async () => {
    try {
        // Khởi động LocalTunnel với subdomain ngẫu nhiên
        const tunnel = await localtunnel({ port: PORT, subdomain: '' });
        console.log(`LocalTunnel URL: ${tunnel.url}`);

        // Lấy mật khẩu từ LocalTunnel
        exec(`curl https://loca.lt/mytunnelpassword`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Lỗi khi lấy mật khẩu: ${error.message}`);
                sendTelegramMessage(`Lỗi khi lấy mật khẩu: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Lỗi stderr: ${stderr}`);
                sendTelegramMessage(`Lỗi stderr: ${stderr}`);
                return;
            }

            const password = stdout.trim(); // Lấy mật khẩu từ kết quả của curl
            console.log(`Mật khẩu: ${password}`);

            // Gửi thông tin về Telegram
            const message = `API URL: ${tunnel.url}\nMật khẩu: ${password}`;
            sendTelegramMessage(message);
        });

        tunnel.on('close', () => {
            console.log('LocalTunnel đã đóng.');
            sendTelegramMessage('LocalTunnel đã đóng.');
        });
    } catch (error) {
        console.error('Lỗi khi khởi động LocalTunnel:', error);
        sendTelegramMessage(`Lỗi khi khởi động LocalTunnel: ${error.message}`);
    }
})();

// Hàm gửi tin nhắn về Telegram
function sendTelegramMessage(message) {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    axios.post(telegramUrl, {
        chat_id: CHAT_ID,
        text: message,
    })
    .then(response => {
        console.log('Thông tin đã được gửi về Telegram:', response.data);
    })
    .catch(error => {
        console.error('Lỗi khi gửi thông tin về Telegram:', error.response?.data || error.message);
    });
}
