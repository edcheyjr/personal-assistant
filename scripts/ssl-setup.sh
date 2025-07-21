#!/bin/bash

# SSL Certificate Setup with Certbot for AerialGIS
# This script sets up Nginx reverse proxy and SSL certificates

set -e

# Configuration
DOMAIN="aerialgis.com"
WWW_DOMAIN="www.aerialgis.com"
EMAIL="nancy@aerialgis.com"
APP_PORT="8080"

echo "🔐 Setting up SSL certificates for $DOMAIN and $WWW_DOMAIN"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    echo "Detected OS: $OS"
else
    echo "Cannot detect OS. Exiting."
    exit 1
fi

# Install Nginx and Certbot
if [[ "$OS" == "amzn" ]]; then
    echo "📦 Installing Nginx and Certbot on Amazon Linux..."
    sudo yum update -y
    sudo yum install -y nginx
    
    # Install EPEL repository for Certbot
    sudo yum install -y epel-release
    sudo yum install -y certbot python3-certbot-nginx
    
elif [[ "$OS" == "ubuntu" ]]; then
    echo "📦 Installing Nginx and Certbot on Ubuntu..."
    sudo apt update
    sudo apt install -y nginx certbot python3-certbot-nginx
    
else
    echo "❌ Unsupported OS: $OS"
    exit 1
fi

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create Nginx configuration for the domain
echo "⚙️ Creating Nginx configuration..."

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/default.conf

# Create sites-available directory if it doesn't exist (for Amazon Linux)
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Create the site configuration
cat << EOF | sudo tee /etc/nginx/sites-available/aerialgis
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;
    
    # Proxy to the Docker container
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:$APP_PORT/health;
        access_log off;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        proxy_pass http://127.0.0.1:$APP_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Custom error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/aerialgis /etc/nginx/sites-enabled/

# Update main Nginx configuration to include sites-enabled
if [[ "$OS" == "amzn" ]]; then
    # For Amazon Linux, add include directive if not present
    if ! grep -q "include /etc/nginx/sites-enabled/" /etc/nginx/nginx.conf; then
        sudo sed -i '/http {/a\    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
    fi
fi

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Reload Nginx
sudo systemctl reload nginx

# Configure firewall (if using UFW on Ubuntu)
if [[ "$OS" == "ubuntu" ]] && command -v ufw &> /dev/null; then
    echo "🔥 Configuring UFW firewall..."
    sudo ufw allow 'Nginx Full'
    sudo ufw allow ssh
    sudo ufw --force enable
fi

# Wait for DNS propagation check
echo "🌐 Checking DNS resolution for $DOMAIN..."
if ! nslookup $DOMAIN >/dev/null 2>&1; then
    echo "⚠️ Warning: DNS for $DOMAIN may not be properly configured"
    echo "Please ensure your domain points to this server's IP address"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Test if the application is running
echo "🔍 Checking if application is running on port $APP_PORT..."
if ! curl -f http://localhost:$APP_PORT >/dev/null 2>&1; then
    echo "⚠️ Warning: Application is not responding on port $APP_PORT"
    echo "Please ensure your Docker container is running:"
    echo "  docker ps | grep aerialgis"
    echo "  docker logs aerialgis"
    read -p "Continue with SSL setup anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --redirect \
    --non-interactive

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
else
    echo "❌ Failed to obtain SSL certificate"
    echo "Please check:"
    echo "1. Domain DNS is pointing to this server"
    echo "2. Ports 80 and 443 are open in security groups"
    echo "3. No other service is using port 80/443"
    exit 1
fi

# Set up automatic renewal
echo "🔄 Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Create renewal hook to reload Nginx
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat << 'EOF' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
#!/bin/bash
systemctl reload nginx
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Test automatic renewal
echo "🧪 Testing automatic renewal..."
sudo certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo "✅ Automatic renewal test passed!"
else
    echo "⚠️ Automatic renewal test failed, but certificate is still valid"
fi

# Final status check
echo "🎉 SSL setup complete!"
echo ""
echo "✅ SSL Certificate Status:"
sudo certbot certificates

echo ""
echo "🌐 Your site should now be available at:"
echo "  https://$DOMAIN"
echo "  https://$WWW_DOMAIN"
echo ""
echo "📊 Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "🔧 Useful commands:"
echo "  Check Nginx config: sudo nginx -t"
echo "  Reload Nginx: sudo systemctl reload nginx"
echo "  Check SSL certs: sudo certbot certificates"
echo "  Renew SSL certs: sudo certbot renew"
echo "  Check application: curl -I https://$DOMAIN"