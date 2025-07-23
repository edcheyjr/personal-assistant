#!/bin/bash

# VPS Docker Container Setup Script
# Path to the Docker container run script (adjust if necessary)
DOCKER_RUN_SCRIPT="/usr/local/bin/start-personal-assistant-container.sh"

# Create a script to run the container
echo "Creating start script for container..."

cat << 'EOF' > $DOCKER_RUN_SCRIPT
#!/bin/bash

# Set the image name from environment
IMAGE_NAME="ghcr.io/personal-assistant/personal-assistant-landing:latest"

# Stop and remove the existing container if running
echo "Stopping existing container..."
docker stop personal-assistant || true
docker rm personal-assistant || true

# Pull the latest image from GitHub Container Registry
echo "Pulling latest image..."
docker pull $IMAGE_NAME

# Run the container with VPS-optimized settings
echo "Starting container..."
docker run -d --name personal-assistant \
  --restart unless-stopped \
  -p 8080:3010 \
  -e AUTH_SECRET=2FF51F714B1E9B31C6B313C9AA9487 \
  -e APP_ENV=production \
  -e NEXT_PUBLIC_DEV_BASE_URL=http://localhost/api/v1 \
  -e NEXT_PUBLIC_PRODUCTION_BASE_URL=http://localhost/api/v1 \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  $IMAGE_NAME

echo "Container started successfully!"
EOF

# Make the script executable
chmod +x $DOCKER_RUN_SCRIPT

# Create a systemd service to ensure the container runs on boot
echo "Creating systemd service..."

cat << EOF > /etc/systemd/system/personal-assistant-container.service
[Unit]
Description=Personal Assistant Docker Container
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=true
ExecStart=$DOCKER_RUN_SCRIPT
ExecStop=/usr/bin/docker stop personal-assistant
ExecStopPost=/usr/bin/docker rm personal-assistant
Restart=on-failure
RestartSec=30
TimeoutStartSec=300
User=root

[Install]
WantedBy=multi-user.target
EOF

# Create log rotation for Docker logs
echo "Setting up log rotation..."
cat << EOF > /etc/logrotate.d/docker-personal-assistant
/var/lib/docker/containers/*/personal-assistant*-json.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF

# Create a simple monitoring script
echo "Creating monitoring script..."
cat << 'EOF' > /usr/local/bin/check-personal-assistant.sh
#!/bin/bash

CONTAINER_NAME="personal-assistant"

# Check if container is running
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "$(date): Container $CONTAINER_NAME is not running. Attempting to restart..." | tee -a /var/log/personal-assistant-monitor.log
    systemctl restart personal-assistant-container.service
    
    # Wait a moment and check again
    sleep 10
    if docker ps | grep -q $CONTAINER_NAME; then
        echo "$(date): Container $CONTAINER_NAME restarted successfully" | tee -a /var/log/personal-assistant-monitor.log
    else
        echo "$(date): Failed to restart container $CONTAINER_NAME" | tee -a /var/log/personal-assistant-monitor.log
    fi
else
    echo "$(date): Container $CONTAINER_NAME is running normally" >> /var/log/personal-assistant-monitor.log
fi
EOF

chmod +x /usr/local/bin/check-personal-assistant.sh

# Add cron job for monitoring (check every 5 minutes)
echo "Setting up monitoring cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/check-personal-assistant.sh") | crontab -

# Reload systemd to recognize the new service
systemctl daemon-reload

# Enable the service to run on boot
systemctl enable personal-assistant-container.service

# Start the service
systemctl start personal-assistant-container.service

echo "Personal Assistant container service has been set up successfully on VPS."
echo ""
echo "Useful commands:"
echo "  Check service status: systemctl status personal-assistant-container.service"
echo "  Check service logs:   journalctl -u personal-assistant-container.service -f"
echo "  Check container logs: docker logs personal-assistant -f"
echo "  Restart service:      systemctl restart personal-assistant-container.service"
echo "  Monitor logs:         tail -f /var/log/personal-assistant-monitor.log"
echo ""
echo "The application should be accessible at: http://your-vps-ip:8080"