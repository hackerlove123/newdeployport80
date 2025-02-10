const localtunnel = require('localtunnel');
const axios = require('axios');
const { exec } = require('child_process');

const PORT = 80;
const TELEGRAM_TOKEN = '7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw';
const CHAT_ID = '7371969470';

(async () => {
    // Khởi động LocalTunnel với subdomain ngẫu nhiên
    const tunnel = await localtunnel({ port: PORT, subdomain: '' });

    console.log(`LocalTunnel URL: ${tunnel.url}`);

    // Lấy mật khẩu từ LocalTunnel
    exec(`curl https://loca.lt/mytunnelpassword`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Lỗi khi lấy mật khẩu: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Lỗi stderr: ${stderr}`);
            return;
        }

        const password = stdout.trim(); // Lấy mật khẩu từ kết quả của curl
        console.log(`Mật khẩu: ${password}`);

        // Gửi thông tin về Telegram
        const message = `API URL: ${tunnel.url}\nMật khẩu: ${password}`;
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

        axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
        })
        .then(response => {
            console.log('Thông tin đã được gửi về Telegram.');
        })
        .catch(error => {
            console.error('Lỗi khi gửi thông tin về Telegram:', error);
        });
    });

    tunnel.on('close', () => {
        console.log('LocalTunnel đã đóng.');
    });
})();
