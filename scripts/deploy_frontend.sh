curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

git clone https://github.com/DHRUVASAI/teamforge-ai.git frontend-app
cd frontend-app/frontend
npm install
npm run build
pm2 start npm --name "teamforge-frontend" -- run start -- -p 3000
pm2 save

cat << 'EOF' | sudo tee /etc/caddy/Caddyfile
98-89-3-167.nip.io {
    handle /api/v1* {
        reverse_proxy localhost:8000
    }
    handle * {
        reverse_proxy localhost:3000
    }
}
EOF
sudo systemctl restart caddy
