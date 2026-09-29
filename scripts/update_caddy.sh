cat << 'EOF' | sudo tee /etc/caddy/Caddyfile
3-80-24-197.nip.io {
    handle /api/v1* {
        reverse_proxy localhost:8000
    }
    handle * {
        reverse_proxy localhost:3000
    }
}
EOF
sudo systemctl restart caddy
