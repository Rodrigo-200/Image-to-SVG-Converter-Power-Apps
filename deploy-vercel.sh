#!/bin/bash

# Vercel Deployment Script for Image to SVG Converter Power Apps
# This script handles both local development and Vercel production deployment

echo "🚀 Image to SVG Converter - Vercel Deployment Script"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
        if [ $? -eq 0 ]; then
            print_success "Vercel CLI installed successfully"
        else
            print_error "Failed to install Vercel CLI"
            exit 1
        fi
    else
        print_success "Vercel CLI is already installed"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Build the project
build_project() {
    print_status "Building project for production..."
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    vercel --prod
    if [ $? -eq 0 ]; then
        print_success "Deployment completed successfully!"
        print_status "Your application is now live on Vercel"
        print_status "The backend API endpoints are available at:"
        print_status "  - /api/health (GET) - Health check"
        print_status "  - /api/convert-to-svg (POST) - Image conversion"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Test local development
test_local() {
    print_status "Testing local development setup..."
    
    # Start local server in background
    print_status "Starting local backend server..."
    npm run server &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 3
    
    # Test health endpoint
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Local backend server is running"
    else
        print_error "Local backend server failed to start"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
    
    # Stop the server
    kill $SERVER_PID 2>/dev/null
    print_success "Local test completed"
}

# Main menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1) Install dependencies and build"
    echo "2) Test local development"
    echo "3) Deploy to Vercel (production)"
    echo "4) Full deployment (all steps)"
    echo "5) Exit"
    echo ""
}

# Main script logic
main() {
    while true; do
        show_menu
        read -p "Enter your choice (1-5): " choice
        
        case $choice in
            1)
                install_dependencies
                build_project
                ;;
            2)
                test_local
                ;;
            3)
                check_vercel_cli
                deploy_to_vercel
                ;;
            4)
                install_dependencies
                build_project
                test_local
                check_vercel_cli
                deploy_to_vercel
                ;;
            5)
                print_status "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-5."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
