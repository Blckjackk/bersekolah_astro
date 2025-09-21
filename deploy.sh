#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                    🚀 BERSEKOLAH DEPLOYMENT 🚀                ║
║                                                              ║
║  Script mudah untuk deploy website Bersekolah ke Hostinger   ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# Configuration
HOSTINGER_HOST="u123456789.hostinger.com"
HOSTINGER_USER="u123456789"
HOSTINGER_PASS="your_password_here"
REMOTE_PATH="/domains/bersekolah.com/public_html"

# Function to test SSH connection
test_ssh() {
    echo -e "${YELLOW}🔐 Testing SSH connection...${NC}"
    sshpass -p "$HOSTINGER_PASS" ssh -o StrictHostKeyChecking=no "$HOSTINGER_USER@$HOSTINGER_HOST" "echo 'SSH connection successful!'" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSH connection berhasil!${NC}"
        return 0
    else
        echo -e "${RED}❌ SSH connection gagal!${NC}"
        return 1
    fi
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${PURPLE}🎨 Deploying Frontend (bersekolah.com)...${NC}"
    
    if ! test_ssh; then
        echo -e "${RED}❌ Deployment dibatalkan karena SSH connection gagal${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}📦 Building project...${NC}"
    yarn install
    yarn build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build gagal!${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}📤 Uploading files...${NC}"
    sshpass -p "$HOSTINGER_PASS" rsync -avz --delete dist/ "$HOSTINGER_USER@$HOSTINGER_HOST:$REMOTE_PATH/"
    
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}🔧 Setting permissions...${NC}"
        sshpass -p "$HOSTINGER_PASS" ssh "$HOSTINGER_USER@$HOSTINGER_HOST" "chmod -R 755 $REMOTE_PATH"
        echo -e "${GREEN}✅ Permissions set successfully${NC}"
        echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
        echo -e "${CYAN}🌐 Website: https://bersekolah.com${NC}"
    else
        echo -e "${RED}❌ Upload gagal!${NC}"
        return 1
    fi
}

# Function to deploy backend
deploy_backend() {
    echo -e "${PURPLE}⚙️ Deploying Backend (api.bersekolah.com)...${NC}"
    
    if ! test_ssh; then
        echo -e "${RED}❌ Deployment dibatalkan karena SSH connection gagal${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}📦 Preparing backend files...${NC}"
    
    # Create temporary directory for backend files
    TEMP_DIR=$(mktemp -d)
    cp -r . "$TEMP_DIR/backend"
    cd "$TEMP_DIR/backend"
    
    # Remove unnecessary files
    rm -rf node_modules vendor storage/logs/*.log .env
    
    echo -e "${YELLOW}📤 Uploading backend files...${NC}"
    sshpass -p "$HOSTINGER_PASS" rsync -avz --delete . "$HOSTINGER_USER@$HOSTINGER_HOST:/domains/api.bersekolah.com/public_html/"
    
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}🔧 Setting permissions...${NC}"
        sshpass -p "$HOSTINGER_PASS" ssh "$HOSTINGER_USER@$HOSTINGER_HOST" "chmod -R 755 /domains/api.bersekolah.com/public_html"
        echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
        echo -e "${CYAN}🔗 API: https://api.bersekolah.com${NC}"
    else
        echo -e "${RED}❌ Backend upload gagal!${NC}"
        return 1
    fi
    
    # Cleanup
    cd /Users/rhea/Downloads/bersekolah/bersekolah_astro-main
    rm -rf "$TEMP_DIR"
}

# Function to deploy both
deploy_both() {
    echo -e "${PURPLE}🚀 Deploying Both Frontend and Backend...${NC}"
    deploy_frontend
    deploy_backend
}

# Function to check website status
check_status() {
    echo -e "${YELLOW}🔍 Checking website status...${NC}"
    
    # Check frontend
    echo -e "${BLUE}Frontend (bersekolah.com):${NC}"
    curl -s -o /dev/null -w "%{http_code}" https://bersekolah.com
    echo ""
    
    # Check backend
    echo -e "${BLUE}Backend (api.bersekolah.com):${NC}"
    curl -s -o /dev/null -w "%{http_code}" https://api.bersekolah.com
    echo ""
}

# Main menu
echo -e "${YELLOW}📋 Pilih opsi deployment:${NC}"
echo -e "${BLUE}1.${NC} Deploy Frontend (bersekolah.com)"
echo -e "${BLUE}2.${NC} Deploy Backend (api.bersekolah.com)"
echo -e "${BLUE}3.${NC} Deploy Keduanya (Frontend + Backend)"
echo -e "${BLUE}4.${NC} Test SSH Connection"
echo -e "${BLUE}5.${NC} Cek Status Website"
echo -e "${BLUE}6.${NC} Keluar"

read -p "Pilih opsi (1-6): " choice

case $choice in
    1)
        deploy_frontend
        ;;
    2)
        deploy_backend
        ;;
    3)
        deploy_both
        ;;
    4)
        test_ssh
        ;;
    5)
        check_status
        ;;
    6)
        echo -e "${GREEN}👋 Sampai jumpa!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Opsi tidak valid!${NC}"
        exit 1
        ;;
esac
