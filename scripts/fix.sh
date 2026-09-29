sudo sed -i '/User=ubuntu/a AmbientCapabilities=CAP_NET_BIND_SERVICE' /etc/systemd/system/teamforge.service
sudo systemctl daemon-reload
sudo systemctl restart teamforge
sudo systemctl status teamforge --no-pager
