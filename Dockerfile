# Sử dụng image Node.js phiên bản 22
FROM node:22

# Tạo thư mục làm việc
WORKDIR /api

# Cập nhật hệ thống và cài đặt các package cần thiết
RUN apt update -y && apt install -y --no-install-recommends \
    bash curl git htop speedtest-cli python3-pip \
    && pip3 install requests python-telegram-bot pytz --break-system-packages \
    && npm install -g npm@latest \ 
    && npm install hpack https commander colors socks axios \
    && npm install express localtunnel \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

# Copy toàn bộ nội dung từ repository vào container
COPY . .

# Expose port 8080
EXPOSE 8080

# Khởi chạy ứng dụng và localtunnel, sau đó gửi thông báo về bot Telegram
CMD ["sh", "-c", "node api.js & lt --port 8080 --subdomain your-subdomain > lt.log 2>&1 && sleep 5 && python3 send_telegram.py"]
