const localtunnel = require('localtunnel');
const axios = require('axios');

const PORT = 9999;
const TELEGRAM_TOKEN = '7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw';
const CHAT_ID = '7371969470';

(async () => {
    const tunnel = await localtunnel({ port: PORT, subdomain: '' }); // Subdomain ngẫu nhiên

    console.log(`LocalTunnel URL: ${tunnel.url}`);

    // Gửi thông tin về Telegram
    const message = `API URL: ${tunnel.url}\nMật khẩu: YOUR_PASSWORD_HERE`; // Thay YOUR_PASSWORD_HERE bằng mật khẩu thực tế
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    try {
        await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
        });
        console.log('Thông tin đã được gửi về Telegram.');
    } catch (error) {
        console.error('Lỗi khi gửi thông tin về Telegram:', error);
    }

    tunnel.on('close', () => {
        console.log('LocalTunnel đã đóng.');
    });
})();
