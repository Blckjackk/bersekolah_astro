#!/bin/bash

# 🚀 Bersekolah Deployment Script
# Script mudah untuk deploy website Bersekolah

set -e

# Colors untuk output yang lebih menarik
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🚀 BERSEKOLAH DEPLOYMENT 🚀                ║"
echo "║                                                              ║"
echo "║  Script mudah untuk deploy website Bersekolah ke Hostinger   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function untuk menampilkan menu
show_menu() {
    echo -e "${YELLOW}📋 Pilih opsi deployment:${NC}"
    echo -e "${BLUE}1.${NC} Deploy Frontend (bersekolah.com)"
    echo -e "${BLUE}2.${NC} Deploy Backend (api.bersekolah.com)"
    echo -e "${BLUE}3.${NC} Deploy Keduanya (Frontend + Backend)"
    echo -e "${BLUE}4.${NC} Test SSH Connection"
    echo -e "${BLUE}5.${NC} Cek Status Website"
    echo -e "${BLUE}6.${NC} Keluar"
    echo ""
}

# Function untuk test SSH connection
test_ssh() {
    echo -e "${YELLOW}🔐 Testing SSH connection...${NC}"
    
    if sshpass -p "Bersekolah_123456" ssh -p 65002 -o StrictHostKeyChecking=no -o ConnectTimeout=10 u787393221@46.202.138.221 "echo 'SSH connection successful!'"; then
        echo -e "${GREEN}✅ SSH connection berhasil!${NC}"
        return 0
    else
        echo -e "${RED}❌ SSH connection gagal!${NC}"
        echo -e "${YELLOW}💡 Tips:${NC}"
        echo -e "   - Pastikan internet connection stabil"
        echo -e "   - Cek apakah sshpass sudah terinstall"
        echo -e "   - Coba jalankan: brew install hudochenkov/sshpass/sshpass"
        return 1
    fi
}

# Function untuk deploy frontend
deploy_frontend() {
    echo -e "${PURPLE}🎨 Deploying Frontend (bersekolah.com)...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: Tidak ada file package.json${NC}"
        echo -e "${YELLOW}💡 Pastikan Anda berada di folder bersekolah_astro${NC}"
        return 1
    fi
    
    # Test SSH first
    if ! test_ssh; then
        return 1
    fi
    
    echo -e "${YELLOW}📦 Building project...${NC}"
    yarn install
    yarn build
    
    echo -e "${YELLOW}📤 Uploading files...${NC}"
    sshpass -p "Bersekolah_123456" scp -P 65002 -o StrictHostKeyChecking=no -r dist/* u787393221@46.202.138.221:/home/u787393221/domains/bersekolah.com/public_html/
    
    echo -e "${YELLOW}🔧 Setting permissions...${NC}"
    sshpass -p "Bersekolah_123456" ssh -p 65002 -o StrictHostKeyChecking=no u787393221@46.202.138.221 "
        cd /home/u787393221/domains/bersekolah.com/public_html
        chmod -R 755 .
        chmod 644 *.html 2>/dev/null || true
        chmod 644 *.css 2>/dev/null || true
        chmod 644 *.js 2>/dev/null || true
        echo '✅ Permissions set successfully'
    "
    
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    echo -e "${CYAN}🌐 Website: https://bersekolah.com${NC}"
}

# Function untuk deploy backend
deploy_backend() {
    echo -e "${PURPLE}⚙️  Deploying Backend (api.bersekolah.com)...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "composer.json" ]; then
        echo -e "${RED}❌ Error: Tidak ada file composer.json${NC}"
        echo -e "${YELLOW}💡 Pastikan Anda berada di folder bersekolah_rest_api${NC}"
        return 1
    fi
    
    # Test SSH first
    if ! test_ssh; then
        return 1
    fi
    
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    composer install --no-dev --optimize-autoloader --no-interaction
    
    echo -e "${YELLOW}📤 Uploading files...${NC}"
    sshpass -p "Bersekolah_123456" scp -P 65002 -o StrictHostKeyChecking=no -r . u787393221@46.202.138.221:/home/u787393221/domains/api.bersekolah.com/project_files/
    
    echo -e "${YELLOW}🔧 Setting permissions and running migrations...${NC}"
    sshpass -p "Bersekolah_123456" ssh -p 65002 -o StrictHostKeyChecking=no u787393221@46.202.138.221 "
        cd /home/u787393221/domains/api.bersekolah.com/project_files
        chmod -R 755 .
        chmod -R 755 storage bootstrap/cache
        php artisan migrate --force
        php artisan storage:link
        echo '✅ Backend setup completed'
    "
    
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
    echo -e "${CYAN}🔗 API: https://api.bersekolah.com${NC}"
}

# Function untuk cek status website
check_status() {
    echo -e "${YELLOW}🔍 Checking website status...${NC}"
    
    echo -e "${BLUE}Frontend (bersekolah.com):${NC}"
    if curl -s -o /dev/null -w "%{http_code}" https://bersekolah.com | grep -q "200"; then
        echo -e "${GREEN}✅ Frontend: Online${NC}"
    else
        echo -e "${RED}❌ Frontend: Offline${NC}"
    fi
    
    echo -e "${BLUE}Backend (api.bersekolah.com):${NC}"
    if curl -s -o /dev/null -w "%{http_code}" https://api.bersekolah.com | grep -q "200"; then
        echo -e "${GREEN}✅ Backend: Online${NC}"
    else
        echo -e "${RED}❌ Backend: Offline${NC}"
    fi
}

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass tidak ditemukan!${NC}"
    echo -e "${YELLOW}💡 Install sshpass terlebih dahulu:${NC}"
    echo -e "${BLUE}macOS:${NC} brew install hudochenkov/sshpass/sshpass"
    echo -e "${BLUE}Linux:${NC} sudo apt-get install sshpass"
    exit 1
fi

# Main menu loop
while true; do
    echo ""
    show_menu
    read -p "Pilih opsi (1-6): " choice
    
    case $choice in
        1)
            deploy_frontend
            ;;
        2)
            deploy_backend
            ;;
        3)
            echo -e "${PURPLE}🚀 Deploying both Frontend and Backend...${NC}"
            deploy_frontend
            echo ""
            deploy_backend
            ;;
        4)
            test_ssh
            ;;
        5)
            check_status
            ;;
        6)
            echo -e "${GREEN}👋 Terima kasih! Happy coding! 🚀${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Pilihan tidak valid. Pilih 1-6.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Tekan Enter untuk melanjutkan..."
done
