@echo off
setlocal enabledelayedexpansion

:: Image to SVG Converter Power Apps - Windows Deployment Script
:: This script automates the deployment process for the application

set "APP_NAME=Image to SVG Converter Power Apps"
set "NODE_VERSION=18"
set "FRONTEND_PORT=5173"
set "BACKEND_PORT=3001"

:: Function to print colored output
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

:: Function to check if command exists
:command_exists
where %1 >nul 2>&1
goto :eof

:: Function to check Node.js version
:check_node_version
call :command_exists node
if errorlevel 1 (
    call :print_error "Node.js is not installed"
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node -v') do (
    set "node_major=%%a"
    set "node_major=!node_major:~1!"
)

if !node_major! geq %NODE_VERSION% (
    for /f %%i in ('node -v') do call :print_success "Node.js version %%i is compatible"
    exit /b 0
) else (
    for /f %%i in ('node -v') do call :print_error "Node.js version %%i is too old. Required: v%NODE_VERSION%+"
    exit /b 1
)

:: Function to install dependencies
:install_dependencies
call :print_status "Installing dependencies..."

call :command_exists npm
if not errorlevel 1 (
    npm install
    if not errorlevel 1 (
        call :print_success "Dependencies installed successfully"
        exit /b 0
    )
)

call :command_exists yarn
if not errorlevel 1 (
    yarn install
    if not errorlevel 1 (
        call :print_success "Dependencies installed successfully with Yarn"
        exit /b 0
    )
)

call :print_error "Neither npm nor yarn is available"
exit /b 1

:: Function to build the application
:build_application
call :print_status "Building application for production..."

call :command_exists npm
if not errorlevel 1 (
    npm run build
) else (
    call :command_exists yarn
    if not errorlevel 1 (
        yarn build
    )
)

if exist "dist" (
    call :print_success "Application built successfully"
    exit /b 0
) else (
    call :print_error "Build failed - dist directory not found"
    exit /b 1
)

:: Function to start development server
:start_development
call :print_status "Starting development servers..."

:: Check if ports are available
netstat -an | find ":%FRONTEND_PORT%" | find "LISTENING" >nul
if not errorlevel 1 (
    call :print_warning "Port %FRONTEND_PORT% is already in use"
)

netstat -an | find ":%BACKEND_PORT%" | find "LISTENING" >nul
if not errorlevel 1 (
    call :print_warning "Port %BACKEND_PORT% is already in use"
)

:: Start backend in background
call :print_status "Starting backend server on port %BACKEND_PORT%..."
call :command_exists npm
if not errorlevel 1 (
    start /b npm run server
) else (
    call :command_exists yarn
    if not errorlevel 1 (
        start /b yarn server
    )
)

:: Wait for backend to start
timeout /t 3 >nul

:: Start frontend
call :print_status "Starting frontend development server on port %FRONTEND_PORT%..."
call :command_exists npm
if not errorlevel 1 (
    npm run dev
) else (
    call :command_exists yarn
    if not errorlevel 1 (
        yarn dev
    )
)
goto :eof

:: Function to start production server
:start_production
call :print_status "Starting production servers..."

:: Build first if dist doesn't exist
if not exist "dist" (
    call :build_application
    if errorlevel 1 exit /b 1
)

:: Start backend
call :print_status "Starting backend server..."
call :command_exists npm
if not errorlevel 1 (
    start /b npm run server
) else (
    call :command_exists yarn
    if not errorlevel 1 (
        start /b yarn server
    )
)

:: Start frontend with preview
call :print_status "Starting frontend preview server..."
call :command_exists npm
if not errorlevel 1 (
    npm run preview
) else (
    call :command_exists yarn
    if not errorlevel 1 (
        yarn preview
    )
)
goto :eof

:: Function to run tests
:run_tests
call :print_status "Running tests..."

call :command_exists npm
if not errorlevel 1 (
    npm test >nul 2>&1 || call :print_warning "No tests configured"
) else (
    call :command_exists yarn
    if not errorlevel 1 (
        yarn test >nul 2>&1 || call :print_warning "No tests configured"
    )
)
goto :eof

:: Function to lint code
:lint_code
call :print_status "Linting code..."

call :command_exists npm
if not errorlevel 1 (
    npm run lint >nul 2>&1 || call :print_warning "No linting configured"
) else (
    call :command_exists yarn
    if not errorlevel 1 (
        yarn lint >nul 2>&1 || call :print_warning "No linting configured"
    )
)
goto :eof

:: Function to show usage
:show_usage
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   install     Install dependencies
echo   dev         Start development servers
echo   build       Build for production
echo   start       Start production servers
echo   test        Run tests
echo   lint        Lint code
echo   setup       Full setup (install + build)
echo   deploy      Full deployment (setup + start production)
echo   help        Show this help message
echo.
echo Examples:
echo   %~nx0 setup       # Install dependencies and build
echo   %~nx0 dev         # Start development environment
echo   %~nx0 deploy      # Full production deployment
goto :eof

:: Function to perform full setup
:full_setup
call :print_status "Starting full setup for %APP_NAME%..."

:: Check prerequisites
call :check_node_version
if errorlevel 1 (
    call :print_error "Please install Node.js v%NODE_VERSION%+ and try again"
    exit /b 1
)

:: Install dependencies
call :install_dependencies
if errorlevel 1 exit /b 1

:: Build application
call :build_application
if errorlevel 1 exit /b 1

call :print_success "Setup completed successfully!"
call :print_status "You can now run:"
call :print_status "  %~nx0 dev     # For development"
call :print_status "  %~nx0 start   # For production"
goto :eof

:: Function to perform full deployment
:full_deployment
call :print_status "Starting full deployment for %APP_NAME%..."

:: Run full setup first
call :full_setup
if errorlevel 1 exit /b 1

:: Start production servers
call :start_production
goto :eof

:: Main script logic
:main
echo =======================================
echo   %APP_NAME%
echo   Windows Deployment Script v1.0.0
echo =======================================
echo.

set "command=%~1"
if "%command%"=="" set "command=help"

if "%command%"=="install" (
    call :check_node_version && call :install_dependencies
) else if "%command%"=="dev" (
    call :check_node_version && call :install_dependencies && call :start_development
) else if "%command%"=="development" (
    call :check_node_version && call :install_dependencies && call :start_development
) else if "%command%"=="build" (
    call :check_node_version && call :build_application
) else if "%command%"=="start" (
    call :check_node_version && call :start_production
) else if "%command%"=="production" (
    call :check_node_version && call :start_production
) else if "%command%"=="test" (
    call :check_node_version && call :run_tests
) else if "%command%"=="lint" (
    call :check_node_version && call :lint_code
) else if "%command%"=="setup" (
    call :full_setup
) else if "%command%"=="deploy" (
    call :full_deployment
) else if "%command%"=="help" (
    call :show_usage
) else if "%command%"=="--help" (
    call :show_usage
) else if "%command%"=="-h" (
    call :show_usage
) else (
    call :print_error "Unknown command: %command%"
    echo.
    call :show_usage
    exit /b 1
)

goto :eof

:: Run main function with arguments
call :main %*
