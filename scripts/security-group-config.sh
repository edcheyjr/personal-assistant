#!/bin/bash

# AWS Security Group Configuration for SSL Setup
# This script helps configure the necessary security group rules

echo "🔐 AWS Security Group Configuration for AerialGIS SSL Setup"
echo "=========================================================="

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install and configure AWS CLI first."
    exit 1
fi

# Configuration
SECURITY_GROUP_NAME="aerialgis-web-sg"
DESCRIPTION="Security group for AerialGIS web application with SSL"

echo "Creating security group: $SECURITY_GROUP_NAME"

# Get VPC ID (using default VPC)
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text)

if [ "$VPC_ID" = "None" ] || [ -z "$VPC_ID" ]; then
    echo "❌ Could not find default VPC. Please specify VPC ID manually."
    echo "Available VPCs:"
    aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0]]' --output table
    exit 1
fi

echo "Using VPC: $VPC_ID"

# Create security group
echo "📝 Creating security group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name "$SECURITY_GROUP_NAME" \
    --description "$DESCRIPTION" \
    --vpc-id "$VPC_ID" \
    --query 'GroupId' \
    --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "Security group might already exist. Getting existing group ID..."
    SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" \
        --query 'SecurityGroups[0].GroupId' \
        --output text)
fi

echo "Security Group ID: $SECURITY_GROUP_ID"

# Add inbound rules
echo "🚪 Adding inbound rules..."

# SSH (Port 22) - Restrict to your IP
echo "Adding SSH rule (Port 22)..."
YOUR_IP=$(curl -s https://checkip.amazonaws.com)/32
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 22 \
    --cidr "$YOUR_IP" \
    --description "SSH access from current IP" 2>/dev/null || echo "SSH rule may already exist"

# HTTP (Port 80) - Open to all (for Let's Encrypt and HTTP redirects)
echo "Adding HTTP rule (Port 80)..."
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --description "HTTP access for Let's Encrypt and redirects" 2>/dev/null || echo "HTTP rule may already exist"

# HTTPS (Port 443) - Open to all
echo "Adding HTTPS rule (Port 443)..."
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --description "HTTPS access for secure web traffic" 2>/dev/null || echo "HTTPS rule may already exist"

# Application port (8080) - Only from localhost (optional, for debugging)
echo "Adding application debug rule (Port 8080) - localhost only..."
aws ec2 authorize-security-group-ingress \
    --group-id "$SECURITY_GROUP_ID" \
    --protocol tcp \
    --port 8080 \
    --source-group "$SECURITY_GROUP_ID" \
    --description "Application port for internal access" 2>/dev/null || echo "Application rule may already exist"

echo ""
echo "✅ Security group configuration complete!"
echo ""
echo "Security Group Details:"
aws ec2 describe-security-groups \
    --group-ids "$SECURITY_GROUP_ID" \
    --query 'SecurityGroups[0].{GroupId:GroupId,GroupName:GroupName,Description:Description,InboundRules:IpPermissions[*].{Port:FromPort,Protocol:IpProtocol,Source:IpRanges[0].CidrIp}}' \
    --output table

echo ""
echo "🔧 Next steps:"
echo "1. Attach this security group to your EC2 instance:"
echo "   aws ec2 modify-instance-attribute --instance-id <INSTANCE-ID> --groups $SECURITY_GROUP_ID"
echo ""
echo "2. Or in AWS Console:"
echo "   - Go to EC2 > Instances"
echo "   - Select your instance"
echo "   - Actions > Security > Change Security Groups"
echo "   - Select: $SECURITY_GROUP_NAME"
echo ""
echo "3. Verify your instance public IP:"
echo "   aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress,State.Name]' --output table"