sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y

sudo sed -i 's/port 80/port 8000/g' /etc/systemd/system/teamforge.service
sudo systemctl daemon-reload
sudo systemctl restart teamforge

cat << 'EOF' | sudo tee /etc/caddy/Caddyfile
98-89-3-167.nip.io {
    reverse_proxy localhost:8000
}
EOF
sudo systemctl restart caddy
