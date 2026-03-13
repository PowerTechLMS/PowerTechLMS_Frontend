# Chạy dự án Frontend

Mở một terminal mới, thiết lập đường dẫn và chạy Frontend:

```zsh
# Thiết lập PATH cho Node.js/NPM (nếu chưa có)
export PATH="$HOME/.local/node/bin:$PATH"

# Di chuyển vào thư mục frontend và chạy
cd frontend
npm run dev -- --port 3000
```

_Frontend sẽ chạy tại: http://localhost:3000_

Để không phải chạy lệnh `export` mỗi lần mở terminal, bạn có thể thêm dòng sau vào file `~/.zshrc` của mình:

```zsh
export PATH="$HOME/.dotnet:$HOME/.local/node/bin:$PATH"
```

lsof -ti:5100 | xargs kill -9
