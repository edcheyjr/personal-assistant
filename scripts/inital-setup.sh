#!/bin/bash

# EC2 Initial Setup Script for AerialGIS Deployment
# Run this script once on your EC2 instance to prepare it for deployments

set -e

echo "🚀 Setting up EC2 instance for AerialGIS deployment..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    echo "Detected OS: $OS"
else
    echo "Cannot detect OS. Exiting."
    exit 1
fi

# Update system and install basic packages
if [[ "$OS" == "amzn" ]]; then
    echo "📦 Updating Amazon Linux..."
    sudo yum update -y
    sudo yum install -y unzip curl wget git htop
    
    # Install Docker
    echo "🐳 Installing Docker..."
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
elif [[ "$OS" == "ubuntu" ]]; then
    echo "📦 Updating Ubuntu..."
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y unzip curl wget git htop ca-certificates gnupg lsb-release
    
    # Remove conflicting packages first
    echo "🧹 Removing conflicting packages..."
    sudo apt remove -y docker docker-engine docker.io containerd runc containerd.io || true
    
    # Install Docker using official repository
    echo "🐳 Installing Docker from official repository..."
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index
    sudo apt update
    
    # Install Docker Engine
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    sudo systemctl start docker
    sudo systemctl enable docker
    
else
    echo "❌ Unsupported OS: $OS"
    exit 1
fi

# Add current user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -a -G docker $USER

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
if ! command -v aws &> /dev/null; then
    echo "☁️ Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
else
    echo "✅ AWS CLI already installed"
fi

# Configure Docker daemon for better logging
echo "📝 Configuring Docker daemon..."
sudo mkdir -p /etc/docker
cat << 'EOF' | sudo tee /etc/docker/daemon.json
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF

# Restart Docker to apply configuration
sudo systemctl restart docker

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/$USER/aerialgis
cd /home/$USER/aerialgis

# Create environment file template
cat << 'EOF' > .env.example
NEXT_PUBLIC_SITE_URL=https://aerialgis.com
SUPPORT_EMAIL=nancy@aerialgis.com
SUPPORT_TEL=+254 726 103531
AWS_REGION=us-east-1
EOF

# Create a simple deployment script
cat << 'EOF' > deploy.sh
#!/bin/bash

# Simple deployment script for manual deployments
set -e

IMAGE_NAME="ghcr.io/aerialgis/aerialgis-landing:latest"

echo "🔄 Pulling latest image..."
docker pull $IMAGE_NAME

echo "🛑 Stopping existing container..."
docker stop aerialgis || true
docker rm aerialgis || true

echo "🚀 Starting new container..."
docker run -d --name aerialgis \
  -p 8080:3010 \
  --restart unless-stopped \
  --env-file .env \
  $IMAGE_NAME

echo "✅ Deployment complete!"
echo "🔍 Container status:"
docker ps | grep aerialgis

echo "🌐 Testing connection..."
sleep 5
if curl -f http://localhost:8080 >/dev/null 2>&1; then
    echo "✅ Application is responding"
else
    echo "⚠️ Application might still be starting up"
fi
EOF

chmod +x deploy.sh

# Create monitoring script
cat << 'EOF' > monitor.sh
#!/bin/bash

# Monitoring script
echo "=== Container Status ==="
docker ps | grep aerialgis || echo "Container not running"

echo -e "\n=== Container Logs (last 50 lines) ==="
docker logs --tail 50 aerialgis 2>/dev/null || echo "No logs available"

echo -e "\n=== System Resources ==="
echo "Memory usage:"
free -h
echo -e "\nDisk usage:"
df -h /

echo -e "\n=== Port 8080 Status ==="
if netstat -tln | grep :8080 >/dev/null; then
    echo "✅ Port 8080 is listening"
else 
    echo "❌ Port 8080 is not listening"
fi
EOF

chmod +x monitor.sh

# Fix Docker permissions by restarting the session
echo "🔄 Applying Docker group membership..."

# Create a systemd service for the application (optional)
cat << EOF | sudo tee /etc/systemd/system/aerialgis.service
[Unit]
Description=AerialGIS Docker Container
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
ExecStart=/home/$USER/aerialgis/deploy.sh
ExecStop=/usr/bin/docker stop aerialgis
ExecStopPost=/usr/bin/docker rm aerialgis -f
WorkingDirectory=/home/$USER/aerialgis
User=$USER
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Log out and log back in (or run: newgrp docker)"
echo "2. Copy .env.example to .env and configure if needed"
echo "3. Test Docker: docker run hello-world"
echo "4. Deploy manually: ./deploy.sh"
echo "5. Monitor: ./monitor.sh"
echo "6. Enable auto-start: sudo systemctl enable aerialgis.service"
echo ""
echo "Your deployment directory: /home/$USER/aerialgis"