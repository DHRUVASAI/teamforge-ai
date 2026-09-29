sudo apt-get update -y
sudo apt-get install -y python3-pip python3-venv
tar -xzf backend.tar.gz
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install uvicorn

cat << 'EOF' | sudo tee /etc/systemd/system/teamforge.service
[Unit]
Description=TeamForge FastAPI Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/home/ubuntu/backend/venv/bin"
ExecStart=/home/ubuntu/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 80

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable teamforge
sudo systemctl start teamforge
sudo systemctl status teamforge --no-pager
