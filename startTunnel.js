const localtunnel = require('localtunnel');
const axios = require('axios');
const waitPort = require('wait-port');

const PORT = 80;
const TELEGRAM_TOKEN = '7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw';
const CHAT_ID = '7371969470';

async function sendTelegramMessage(message) {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    try {
        await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
        });
        console.log('Tin nhắn đã gửi thành công');
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error.response?.data || error.message);
    }
}

(async () => {
    try {
        // Chờ cổng 80 sẵn sàng
        console.log('Đang chờ ứng dụng khởi động...');
        await waitPort({ host: 'localhost', port: PORT, timeout: 30000 });

        // Khởi động LocalTunnel
        const tunnel = await localtunnel({ port: PORT });
        console.log('LocalTunnel đã khởi động:', tunnel.url);

        // Gửi thông báo về Telegram
        await sendTelegramMessage(`🚀 API ĐÃ SẴN SÀNG\n🔗 URL: ${tunnel.url}`);

        // Xử lý sự kiện đóng tunnel
        tunnel.on('close', () => {
            console.log('Tunnel đã đóng');
            sendTelegramMessage('⚠️ Tunnel đã bị đóng');
        });

    } catch (error) {
        console.error('Lỗi nghiêm trọng:', error);
        await sendTelegramMessage(`❌ LỖI HỆ THỐNG:\n${error.message}`);
        process.exit(1);
    }
})();
