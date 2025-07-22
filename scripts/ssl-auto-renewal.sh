#!/bin/bash

# Nginx SSL Monitoring and Maintenance Script
# Run this script to check the health of your SSL setup

DOMAIN="example.com"
WWW_DOMAIN="www.example.com"

echo "🔍 Example SSL Health Check"
echo "============================="

# Check Nginx status
echo "📊 Nginx Service Status:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running"
    echo "🔧 Starting Nginx..."
    sudo systemctl start nginx
fi

# Check Nginx configuration
echo ""
echo "⚙️ Nginx Configuration:"
if sudo nginx -t >/dev/null 2>&1; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors:"
    sudo nginx -t

# Check SSL certificates
echo ""
echo "🔐 SSL Certificate Status:"
sudo certbot certificates 2>/dev/null | grep -A 10 "$DOMAIN" || echo "❌ No certificates found"

# Check certificate expiration
echo ""
echo "📅 Certificate Expiration Check:"
for domain in $DOMAIN $WWW_DOMAIN; do
    echo "Checking $domain..."
    expiry=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    if [ ! -z "$expiry" ]; then
        echo "✅ $domain expires: $expiry"
        
        # Check if expiring in 30 days
        expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null || echo 0)
        current_epoch=$(date +%s)
        days_left=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        if [ $days_left -lt 30 ]; then
            echo "⚠️ Certificate expires in $days_left days!"
        else
            echo "✅ Certificate valid for $days_left days"
        fi
    else
        echo "❌ Could not check certificate for $domain"
    fi
done

# Check website accessibility
echo ""
echo "🌐 Website Accessibility:"
for domain in $DOMAIN $WWW_DOMAIN; do
    echo "Testing https://$domain..."
    if curl -Is https://$domain | head -n 1 | grep -q "200"; then
        echo "✅ https://$domain is accessible"
    else
        echo "❌ https://$domain is not accessible"
    fi
done

# Check Docker container
echo ""
echo "🐳 Docker Container Status:"
if docker ps | grep -q example; then
    echo "✅ example container is running"
    docker ps --filter "name=example" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ example container is not running"
    echo "🔧 Available containers:"
    docker ps -a --filter "name=example" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

# Check port connectivity
echo ""
echo "🚪 Port Connectivity:"
if netstat -tln | grep -q ":443"; then
    echo "✅ Port 443 (HTTPS) is listening"
else
    echo "❌ Port 443 (HTTPS) is not listening"
fi

if netstat -tln | grep -q ":80"; then
    echo "✅ Port 80 (HTTP) is listening"
else
    echo "❌ Port 80 (HTTP) is not listening"
fi

if netstat -tln | grep -q ":8080"; then
    echo "✅ Port 8080 (Application) is listening"
else
    echo "❌ Port 8080 (Application) is not listening"
fi

# Check recent Nginx logs for errors
echo ""
echo "📝 Recent Nginx Errors (last 10):"
if [ -f /var/log/nginx/error.log ]; then
    tail -10 /var/log/nginx/error.log | grep -E "(error|crit|alert|emerg)" || echo "✅ No recent errors"
else
    echo "ℹ️ No error log found"
fi

# System resources
echo ""
echo "💾 System Resources:"
echo "Memory usage:"
free -h | grep -E "(Mem|Swap)"
echo "Disk usage:"
df -h / | tail -1

# SSL renewal test (dry run)
echo ""
echo "🔄 SSL Renewal Test:"
if sudo certbot renew --dry-run >/dev/null 2>&1; then
    echo "✅ SSL renewal test passed"
else
    echo "❌ SSL renewal test failed"
    echo "🔧 Run: sudo certbot renew --dry-run"
fi

echo ""
echo "🎯 Quick Commands:"
echo "  Restart Nginx: sudo systemctl restart nginx"
echo "  Check SSL: sudo certbot certificates"
echo "  Renew SSL: sudo certbot renew"
echo "  View logs: sudo tail -f /var/log/nginx/access.log"
echo "  Container logs: docker logs example -f"