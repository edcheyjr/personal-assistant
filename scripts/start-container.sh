#!/bin/bash

# AWS EC2 Docker Container Setup Script
# Path to the Docker container run script (adjust if necessary)
DOCKER_RUN_SCRIPT="/usr/local/bin/start-personal-assistant-container.sh"

# Create a script to run the container
echo "Creating start script for container..."

cat << 'EOF' > $DOCKER_RUN_SCRIPT
#!/bin/bash

# Set the image name from environment
IMAGE_NAME="ghcr.io/personal-assistant/personal-assistant-landing:latest"

# Stop and remove the existing container if running
docker stop personal-assistant || true
docker rm personal-assistant || true

# Pull the latest image from GitHub Container Registry
docker pull $IMAGE_NAME

# Run the container with AWS-optimized settings
docker run -d --name personal-assistant \
  -p 8080:3010
EOF

# Make the script executable
chmod +x $DOCKER_RUN_SCRIPT

# Create a systemd service to ensure the container runs on boot
echo "Creating systemd service..."

cat << EOF > /etc/systemd/system/personal-assistant-container.service
[Unit]
Description=personal-assistant Docker Container
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

[Install]
WantedBy=multi-user.target
EOF

# Create CloudWatch log group (requires AWS CLI to be configured)
if command -v aws &> /dev/null; then
    echo "Creating CloudWatch log group..."
    aws logs create-log-group --log-group-name "/aws/ec2/docker/personal-assistant" --region "${AWS_REGION:-us-east-1}" || true
fi

# Reload systemd to recognize the new service
systemctl daemon-reload

# Enable the service to run on boot
systemctl enable personal-assistant-container.service

# Start the service
systemctl start personal-assistant-container.service

echo "personal-assistant container service has been set up successfully on AWS EC2."
echo "Check service status with: systemctl status personal-assistant-container.service"
echo "Check logs with: journalctl -u personal-assistant-container.service -f"