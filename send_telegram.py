import requests
import time

# Thông tin bot Telegram
TELEGRAM_TOKEN = "7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw"
CHAT_ID = "7371969470"

# Đọc URL từ file lt.log
with open("lt.log", "r") as file:
    logs = file.readlines()
    url = None
    for line in logs:
        if "your url is:" in line:
            url = line.split("your url is:")[1].strip()
            break

if url:
    # Gửi thông báo về bot Telegram
    message = f"🔗 URL truy cập: {url}\n🔐 Mật khẩu: (nếu có)"
    send_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    params = {
        "chat_id": CHAT_ID,
        "text": message
    }
    response = requests.post(send_url, params=params)
    print("Thông báo đã được gửi đến bot Telegram!")
else:
    print("Không tìm thấy URL trong file log.")
