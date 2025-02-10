const localtunnel = require('localtunnel');
const axios = require('axios');

const PORT = 80;
const TELEGRAM_TOKEN = '7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw';
const CHAT_ID = '7371969470';

// Hàm gửi tin nhắn Telegram với retry
async function sendTelegramMessage(message, retries = 3) {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    try {
        const response = await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
        });
        console.log('Tin nhắn đã gửi thành công:', response.data);
        return true;
    } catch (error) {
        if (retries > 0) {
            console.log(`Thử lại gửi tin nhắn... (${retries} lần còn lại)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return sendTelegramMessage(message, retries - 1);
        }
        console.error('Lỗi cuối cùng khi gửi tin nhắn:', error.response?.data || error.message);
        return false;
    }
}

// Hàm lấy mật khẩu bằng axios thay vì curl
async function getTunnelPassword() {
    try {
        const response = await axios.get('https://loca.lt/mytunnelpassword', {
            timeout: 10000,
            validateStatus: () => true
        });
        return response.data.trim();
    } catch (error) {
        throw new Error(`Lỗi khi lấy mật khẩu: ${error.message}`);
    }
}

(async () => {
    try {
        // Khởi động LocalTunnel
        const tunnel = await localtunnel({ 
            port: PORT,
            allow_invalid_cert: true // Bỏ qua lỗi SSL nếu có
        });

        console.log('LocalTunnel đã khởi động:', tunnel.url);

        // Chờ 10 giây để đảm bảo tunnel ổn định
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Lấy và gửi mật khẩu
        const password = await getTunnelPassword();
        await sendTelegramMessage(`🚀 API ĐÃ SẴN SÀNG\n🔗 URL: ${tunnel.url}\n🔑 Mật khẩu: ${password}`);

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
