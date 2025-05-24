#!/bin/bash

# Image to SVG Converter Power Apps - Deployment Script
# This script automates the deployment process for the application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Image to SVG Converter Power Apps"
NODE_VERSION="18"
FRONTEND_PORT=5173
BACKEND_PORT=3001

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge "$NODE_VERSION" ]; then
            print_success "Node.js version $(node -v) is compatible"
            return 0
        else
            print_error "Node.js version $(node -v) is too old. Required: v${NODE_VERSION}+"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if command_exists npm; then
        npm install
        print_success "Dependencies installed successfully"
    elif command_exists yarn; then
        yarn install
        print_success "Dependencies installed successfully with Yarn"
    else
        print_error "Neither npm nor yarn is available"
        exit 1
    fi
}

# Function to build the application
build_application() {
    print_status "Building application for production..."
    
    if command_exists npm; then
        npm run build
    elif command_exists yarn; then
        yarn build
    fi
    
    if [ -d "dist" ]; then
        print_success "Application built successfully"
    else
        print_error "Build failed - dist directory not found"
        exit 1
    fi
}

# Function to start development server
start_development() {
    print_status "Starting development servers..."
    
    # Check if ports are available
    if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $FRONTEND_PORT is already in use"
    fi
    
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $BACKEND_PORT is already in use"
    fi
    
    # Start backend in background
    print_status "Starting backend server on port $BACKEND_PORT..."
    if command_exists npm; then
        npm run server &
    elif command_exists yarn; then
        yarn server &
    fi
    
    sleep 3  # Wait for backend to start
    
    # Start frontend
    print_status "Starting frontend development server on port $FRONTEND_PORT..."
    if command_exists npm; then
        npm run dev
    elif command_exists yarn; then
        yarn dev
    fi
}

# Function to start production server
start_production() {
    print_status "Starting production servers..."
    
    # Build first if dist doesn't exist
    if [ ! -d "dist" ]; then
        build_application
    fi
    
    # Start backend
    print_status "Starting backend server..."
    if command_exists npm; then
        npm run server &
    elif command_exists yarn; then
        yarn server &
    fi
    
    # Start frontend with preview
    print_status "Starting frontend preview server..."
    if command_exists npm; then
        npm run preview
    elif command_exists yarn; then
        yarn preview
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    if command_exists npm; then
        npm test 2>/dev/null || print_warning "No tests configured"
    elif command_exists yarn; then
        yarn test 2>/dev/null || print_warning "No tests configured"
    fi
}

# Function to lint code
lint_code() {
    print_status "Linting code..."
    
    if command_exists npm; then
        npm run lint 2>/dev/null || print_warning "No linting configured"
    elif command_exists yarn; then
        yarn lint 2>/dev/null || print_warning "No linting configured"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  install     Install dependencies"
    echo "  dev         Start development servers"
    echo "  build       Build for production"
    echo "  start       Start production servers"
    echo "  test        Run tests"
    echo "  lint        Lint code"
    echo "  setup       Full setup (install + build)"
    echo "  deploy      Full deployment (setup + start production)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup       # Install dependencies and build"
    echo "  $0 dev         # Start development environment"
    echo "  $0 deploy      # Full production deployment"
}

# Function to perform full setup
full_setup() {
    print_status "Starting full setup for $APP_NAME..."
    
    # Check prerequisites
    if ! check_node_version; then
        print_error "Please install Node.js v${NODE_VERSION}+ and try again"
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Build application
    build_application
    
    print_success "Setup completed successfully!"
    print_status "You can now run:"
    print_status "  $0 dev     # For development"
    print_status "  $0 start   # For production"
}

# Function to perform full deployment
full_deployment() {
    print_status "Starting full deployment for $APP_NAME..."
    
    # Run full setup first
    full_setup
    
    # Start production servers
    start_production
}

# Main script logic
main() {
    echo "======================================="
    echo "  $APP_NAME"
    echo "  Deployment Script v1.0.0"
    echo "======================================="
    echo ""
    
    case "${1:-help}" in
        install)
            check_node_version && install_dependencies
            ;;
        dev|development)
            check_node_version && install_dependencies && start_development
            ;;
        build)
            check_node_version && build_application
            ;;
        start|production)
            check_node_version && start_production
            ;;
        test)
            check_node_version && run_tests
            ;;
        lint)
            check_node_version && lint_code
            ;;
        setup)
            full_setup
            ;;
        deploy)
            full_deployment
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
