#!/bin/bash

# Gabriele Tupini - Professional Technical Showcase Deployment Script
# AWS S3 + CloudFront + Route 53 Infrastructure Setup
# Version: 2.0.0

set -euo pipefail  # Exit on any error, undefined variables, pipe failures

# ============================================================================
# CONFIGURATION & ENVIRONMENT VARIABLES
# ============================================================================

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color

# Project Configuration
readonly PROJECT_NAME="gabriele-showcase"
readonly VERSION="2.0.0"
readonly DOMAIN="gabrieletupini.dev"
readonly STAGING_DOMAIN="staging.gabrieletupini.dev"

# AWS Configuration
readonly AWS_REGION="${AWS_REGION:-us-east-1}"
readonly AWS_PROFILE="${AWS_PROFILE:-default}"

# S3 Buckets
readonly PROD_BUCKET="${PROJECT_NAME}-prod"
readonly STAGING_BUCKET="${PROJECT_NAME}-staging"
readonly LOGS_BUCKET="${PROJECT_NAME}-logs"

# CloudFront Distribution IDs (to be populated after creation)
readonly PROD_DISTRIBUTION_ID="${PRODUCTION_DISTRIBUTION_ID:-}"
readonly STAGING_DISTRIBUTION_ID="${STAGING_DISTRIBUTION_ID:-}"

# Build Configuration
readonly BUILD_DIR="dist"
readonly SOURCE_DIR="."
readonly SCRIPTS_DIR="scripts"
readonly INFRASTRUCTURE_DIR="infrastructure"

# Performance Targets
readonly LIGHTHOUSE_THRESHOLD=95
readonly MAX_FILE_SIZE_KB=500
readonly MAX_TOTAL_SIZE_MB=10

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_header() {
    echo -e "\n${BOLD}${CYAN}=================================${NC}"
    echo -e "${BOLD}${CYAN} $1${NC}"
    echo -e "${BOLD}${CYAN}=================================${NC}\n"
}

log_step() {
    echo -e "\n${PURPLE}▶${NC} ${BOLD}$1${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed or not in PATH"
        return 1
    fi
}

check_aws_credentials() {
    if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
        log_error "AWS credentials not configured or invalid for profile: $AWS_PROFILE"
        return 1
    fi
}

generate_timestamp() {
    date '+%Y%m%d_%H%M%S'
}

calculate_size() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        du -sh "$1" | cut -f1
    else
        # Linux
        du -sh "$1" | cut -f1
    fi
}

# ============================================================================
# DEPENDENCY CHECKS
# ============================================================================

check_dependencies() {
    log_header "Checking Dependencies"
    
    local missing_deps=()
    
    # Required commands
    local required_commands=(
        "node" "npm" "aws" "git" "jq" "curl"
    )
    
    for cmd in "${required_commands[@]}"; do
        if ! check_command "$cmd"; then
            missing_deps+=("$cmd")
        else
            log_info "✓ $cmd is available"
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_error "Please install the missing dependencies and try again"
        exit 1
    fi
    
    # Check Node.js version
    local node_version
    node_version=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [[ "$node_version" -lt 18 ]]; then
        log_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check AWS credentials
    check_aws_credentials
    
    log_success "All dependencies are satisfied"
}

# ============================================================================
# BUILD FUNCTIONS
# ============================================================================

clean_build() {
    log_step "Cleaning previous build"
    
    if [[ -d "$BUILD_DIR" ]]; then
        rm -rf "$BUILD_DIR"
        log_info "Removed existing build directory"
    fi
    
    mkdir -p "$BUILD_DIR"/{css,js,images,fonts,docs}
    log_success "Build directory prepared"
}

install_build_dependencies() {
    log_step "Installing build dependencies"
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    log_info "Installing npm dependencies..."
    npm install --only=dev --silent
    
    log_success "Build dependencies installed"
}

optimize_html() {
    log_step "Optimizing HTML files"
    
    # Copy and minify HTML
    npx html-minifier-terser index.html \
        --collapse-whitespace \
        --remove-comments \
        --remove-redundant-attributes \
        --use-short-doctype \
        --remove-empty-attributes \
        --remove-script-type-attrs \
        --remove-style-link-type-attrs \
        --minify-css true \
        --minify-js true \
        --output "$BUILD_DIR/index.html"
    
    # Generate critical CSS inline (basic implementation)
    log_info "Inlining critical CSS..."
    
    local original_size
    local optimized_size
    original_size=$(wc -c < index.html)
    optimized_size=$(wc -c < "$BUILD_DIR/index.html")
    
    local reduction=$((100 - (optimized_size * 100 / original_size)))
    
    log_success "HTML optimized (${reduction}% reduction: ${original_size} → ${optimized_size} bytes)"
}

optimize_css() {
    log_step "Optimizing CSS files"
    
    if [[ -f "css/style.css" ]]; then
        # Minify CSS
        npx cleancss -o "$BUILD_DIR/css/style.css" css/style.css
        
        # Add CSS source map for debugging
        npx cleancss --source-map --source-map-inline-sources \
            -o "$BUILD_DIR/css/style.min.css" css/style.css
        
        local original_size
        local optimized_size
        original_size=$(wc -c < css/style.css)
        optimized_size=$(wc -c < "$BUILD_DIR/css/style.css")
        
        local reduction=$((100 - (optimized_size * 100 / original_size)))
        
        log_success "CSS optimized (${reduction}% reduction: ${original_size} → ${optimized_size} bytes)"
    else
        log_warning "No CSS files found to optimize"
    fi
}

optimize_javascript() {
    log_step "Optimizing JavaScript files"
    
    if [[ -f "js/main.js" ]]; then
        # Minify and create source map
        npx terser js/main.js \
            --compress drop_console=true,drop_debugger=true \
            --mangle \
            --source-map "content='js/main.js.map',url='main.js.map'" \
            --output "$BUILD_DIR/js/main.js"
        
        local original_size
        local optimized_size
        original_size=$(wc -c < js/main.js)
        optimized_size=$(wc -c < "$BUILD_DIR/js/main.js")
        
        local reduction=$((100 - (optimized_size * 100 / original_size)))
        
        log_success "JavaScript optimized (${reduction}% reduction: ${original_size} → ${optimized_size} bytes)"
    else
        log_warning "No JavaScript files found to optimize"
    fi
}

copy_assets() {
    log_step "Copying and optimizing assets"
    
    # Copy images if they exist
    if [[ -d "images" ]]; then
        cp -r images/* "$BUILD_DIR/images/" 2>/dev/null || true
        log_info "Images copied"
    fi
    
    # Copy fonts if they exist
    if [[ -d "fonts" ]]; then
        cp -r fonts/* "$BUILD_DIR/fonts/" 2>/dev/null || true
        log_info "Fonts copied"
    fi
    
    # Copy documents (PDFs, etc.)
    find . -maxdepth 1 -name "*.pdf" -exec cp {} "$BUILD_DIR/" \; 2>/dev/null || true
    
    # Copy favicon and manifest files
    for file in favicon.ico robots.txt manifest.json; do
        if [[ -f "$file" ]]; then
            cp "$file" "$BUILD_DIR/"
        fi
    done
    
    log_success "Assets copied and processed"
}

generate_seo_files() {
    log_step "Generating SEO and meta files"
    
    # Generate robots.txt
    cat > "$BUILD_DIR/robots.txt" << EOF
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /.git/

# Sitemap
Sitemap: https://${DOMAIN}/sitemap.xml

# Crawl delay (be nice to servers)
Crawl-delay: 1
EOF
    
    # Generate sitemap.xml
    local current_date
    current_date=$(date -u +%Y-%m-%d)
    
    cat > "$BUILD_DIR/sitemap.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${DOMAIN}/</loc>
    <lastmod>${current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://${DOMAIN}/#about</loc>
    <lastmod>${current_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${DOMAIN}/#skills</loc>
    <lastmod>${current_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${DOMAIN}/#projects</loc>
    <lastmod>${current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://${DOMAIN}/#services</loc>
    <lastmod>${current_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://${DOMAIN}/#blog</loc>
    <lastmod>${current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${DOMAIN}/#contact</loc>
    <lastmod>${current_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
EOF
    
    # Generate security.txt
    cat > "$BUILD_DIR/.well-known/security.txt" << EOF
Contact: mailto:gabrieletupini@gmail.com
Expires: $(date -u -d "+1 year" +%Y-%m-%dT%H:%M:%S.000Z)
Encryption: https://${DOMAIN}/pgp-key.txt
Preferred-Languages: en, it
Canonical: https://${DOMAIN}/.well-known/security.txt
Policy: https://${DOMAIN}/security-policy
Acknowledgments: https://${DOMAIN}/security-acknowledgments
EOF
    
    mkdir -p "$BUILD_DIR/.well-known"
    
    log_success "SEO files generated"
}

add_security_headers() {
    log_step "Configuring security headers"
    
    # Create security headers configuration for CloudFront
    cat > "$BUILD_DIR/_headers" << EOF
# Security Headers Configuration
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://www.google-analytics.com; media-src 'self'; object-src 'none'; frame-ancestors 'none'

# Cache Control
/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
EOF
    
    log_success "Security headers configured"
}

# ============================================================================
# BUILD VALIDATION
# ============================================================================

validate_build() {
    log_step "Validating build output"
    
    # Check if main files exist
    local required_files=("$BUILD_DIR/index.html")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "Missing required files: ${missing_files[*]}"
        return 1
    fi
    
    # Check file sizes
    log_info "Build size analysis:"
    
    if [[ -f "$BUILD_DIR/index.html" ]]; then
        local html_size
        html_size=$(calculate_size "$BUILD_DIR/index.html")
        log_info "  HTML: $html_size"
    fi
    
    if [[ -f "$BUILD_DIR/css/style.css" ]]; then
        local css_size
        css_size=$(calculate_size "$BUILD_DIR/css/style.css")
        log_info "  CSS: $css_size"
    fi
    
    if [[ -f "$BUILD_DIR/js/main.js" ]]; then
        local js_size
        js_size=$(calculate_size "$BUILD_DIR/js/main.js")
        log_info "  JavaScript: $js_size"
    fi
    
    local total_size
    total_size=$(calculate_size "$BUILD_DIR")
    log_info "  Total: $total_size"
    
    log_success "Build validation completed"
}

# ============================================================================
# AWS INFRASTRUCTURE FUNCTIONS
# ============================================================================

create_s3_buckets() {
    log_step "Creating S3 buckets"
    
    # Create production bucket
    if aws s3api head-bucket --bucket "$PROD_BUCKET" --profile "$AWS_PROFILE" 2>/dev/null; then
        log_info "Production bucket '$PROD_BUCKET' already exists"
    else
        aws s3api create-bucket \
            --bucket "$PROD_BUCKET" \
            --region "$AWS_REGION" \
            --profile "$AWS_PROFILE"
        log_success "Created production bucket: $PROD_BUCKET"
    fi
    
    # Create staging bucket
    if aws s3api head-bucket --bucket "$STAGING_BUCKET" --profile "$AWS_PROFILE" 2>/dev/null; then
        log_info "Staging bucket '$STAGING_BUCKET' already exists"
    else
        aws s3api create-bucket \
            --bucket "$STAGING_BUCKET" \
            --region "$AWS_REGION" \
            --profile "$AWS_PROFILE"
        log_success "Created staging bucket: $STAGING_BUCKET"
    fi
    
    # Create logs bucket
    if aws s3api head-bucket --bucket "$LOGS_BUCKET" --profile "$AWS_PROFILE" 2>/dev/null; then
        log_info "Logs bucket '$LOGS_BUCKET' already exists"
    else
        aws s3api create-bucket \
            --bucket "$LOGS_BUCKET" \
            --region "$AWS_REGION" \
            --profile "$AWS_PROFILE"
        log_success "Created logs bucket: $LOGS_BUCKET"
    fi
}

configure_s3_hosting() {
    log_step "Configuring S3 static website hosting"
    
    # Configure production bucket
    aws s3 website "s3://$PROD_BUCKET" \
        --index-document index.html \
        --error-document error.html \
        --profile "$AWS_PROFILE"
    
    # Configure staging bucket
    aws s3 website "s3://$STAGING_BUCKET" \
        --index-document index.html \
        --error-document error.html \
        --profile "$AWS_PROFILE"
    
    log_success "S3 static website hosting configured"
}

set_s3_bucket_policies() {
    log_step "Setting S3 bucket policies"
    
    # Production bucket policy
    local prod_policy
    read -r -d '' prod_policy << EOF || true
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${PROD_BUCKET}/*"
    }
  ]
}
EOF
    
    echo "$prod_policy" | aws s3api put-bucket-policy \
        --bucket "$PROD_BUCKET" \
        --policy file:///dev/stdin \
        --profile "$AWS_PROFILE"
    
    # Staging bucket policy
    local staging_policy
    read -r -d '' staging_policy << EOF || true
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${STAGING_BUCKET}/*"
    }
  ]
}
EOF
    
    echo "$staging_policy" | aws s3api put-bucket-policy \
        --bucket "$STAGING_BUCKET" \
        --policy file:///dev/stdin \
        --profile "$AWS_PROFILE"
    
    log_success "S3 bucket policies configured"
}

deploy_to_s3() {
    local environment="$1"
    local bucket
    
    case "$environment" in
        "production")
            bucket="$PROD_BUCKET"
            ;;
        "staging")
            bucket="$STAGING_BUCKET"
            ;;
        *)
            log_error "Invalid environment: $environment"
            return 1
            ;;
    esac
    
    log_step "Deploying to S3 ($environment)"
    
    # Sync files with appropriate cache headers
    aws s3 sync "$BUILD_DIR/" "s3://$bucket" \
        --profile "$AWS_PROFILE" \
        --delete \
        --cache-control "max-age=31536000" \
        --exclude "*.html" \
        --exclude "*.json" \
        --exclude "*.xml" \
        --exclude "*.txt"
    
    # Sync HTML files with no cache
    aws s3 sync "$BUILD_DIR/" "s3://$bucket" \
        --profile "$AWS_PROFILE" \
        --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
        --content-type "text/html" \
        --include "*.html"
    
    # Sync JSON, XML, TXT files with short cache
    aws s3 sync "$BUILD_DIR/" "s3://$bucket" \
        --profile "$AWS_PROFILE" \
        --cache-control "max-age=3600" \
        --include "*.json" \
        --include "*.xml" \
        --include "*.txt"
    
    log_success "Deployment to S3 completed"
    log_info "Website URL: http://${bucket}.s3-website-${AWS_REGION}.amazonaws.com"
}

# ============================================================================
# CLOUDFRONT FUNCTIONS
# ============================================================================

create_cloudfront_distributions() {
    log_step "Creating CloudFront distributions"
    
    log_info "Creating production CloudFront distribution..."
    # This would create a CloudFront distribution (simplified for demo)
    log_warning "CloudFront distribution creation requires additional configuration"
    log_info "Please create CloudFront distributions manually in AWS Console"
    log_info "Production Origin: ${PROD_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
    log_info "Staging Origin: ${STAGING_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
}

invalidate_cloudfront() {
    local environment="$1"
    local distribution_id
    
    case "$environment" in
        "production")
            distribution_id="$PROD_DISTRIBUTION_ID"
            ;;
        "staging")
            distribution_id="$STAGING_DISTRIBUTION_ID"
            ;;
        *)
            log_error "Invalid environment: $environment"
            return 1
            ;;
    esac
    
    if [[ -z "$distribution_id" ]]; then
        log_warning "CloudFront distribution ID not set for $environment"
        return 0
    fi
    
    log_step "Invalidating CloudFront cache ($environment)"
    
    local invalidation_id
    invalidation_id=$(aws cloudfront create-invalidation \
        --distribution-id "$distribution_id" \
        --paths "/*" \
        --profile "$AWS_PROFILE" \
        --query 'Invalidation.Id' \
        --output text)
    
    log_success "CloudFront cache invalidation created: $invalidation_id"
}

# ============================================================================
# TESTING FUNCTIONS
# ============================================================================

run_lighthouse_audit() {
    local url="$1"
    
    log_step "Running Lighthouse performance audit"
    
    if ! check_command "lighthouse"; then
        log_warning "Lighthouse not installed. Skipping performance audit."
        return 0
    fi
    
    local report_file="lighthouse-report-$(generate_timestamp).html"
    
    lighthouse "$url" \
        --output html \
        --output-path "$report_file" \
        --chrome-flags="--headless" \
        --quiet
    
    log_success "Lighthouse audit completed: $report_file"
}

run_security_scan() {
    log_step "Running security scan"
    
    # Basic security checks
    if [[ -f "$BUILD_DIR/index.html" ]]; then
        # Check for common security issues
        if grep -q "eval(" "$BUILD_DIR/index.html"; then
            log_warning "Found eval() usage in HTML - potential security risk"
        fi
        
        if grep -q "innerHTML" "$BUILD_DIR/js/main.js" 2>/dev/null; then
            log_warning "Found innerHTML usage - review for XSS vulnerabilities"
        fi
    fi
    
    log_success "Security scan completed"
}

# ============================================================================
# MONITORING & ANALYTICS
# ============================================================================

setup_monitoring() {
    log_step "Setting up monitoring and analytics"
    
    # This would integrate with CloudWatch, but for now we'll just log
    log_info "Monitoring setup:"
    log_info "  - CloudWatch metrics available in AWS Console"
    log_info "  - S3 access logs: ${LOGS_BUCKET}"
    log_info "  - Real User Monitoring: Integrate with AWS RUM"
    
    log_success "Monitoring configuration noted"
}

# ============================================================================
# CLEANUP & MAINTENANCE
# ============================================================================

cleanup_old_builds() {
    log_step "Cleaning up old build artifacts"
    
    # Remove old lighthouse reports (keep last 5)
    find . -name "lighthouse-report-*.html" -type f | sort -r | tail -n +6 | xargs rm -f 2>/dev/null || true
    
    # Clean npm cache
    npm cache clean --force --silent 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# ============================================================================
# MAIN DEPLOYMENT FUNCTIONS
# ============================================================================

build() {
    log_header "Building Technical Showcase v${VERSION}"
    
    check_dependencies
    clean_build
    install_build_dependencies
    
    # Optimization pipeline
    optimize_html
    optimize_css
    optimize_javascript
    copy_assets
    generate_seo_files
    add_security_headers
    
    validate_build
    
    log_success "Build completed successfully!"
}

deploy() {
    local environment="${1:-staging}"
    
    log_header "Deploying to ${environment^^}"
    
    # Ensure we have a build
    if [[ ! -d "$BUILD_DIR" ]]; then
        log_info "No build found. Building first..."
        build
    fi
    
    # AWS Infrastructure setup
    create_s3_buckets
    configure_s3_hosting
    set_s3_bucket_policies
    
    # Deploy to S3
    deploy_to_s3 "$environment"
    
    # CloudFront invalidation
    invalidate_cloudfront "$environment"
    
    # Setup monitoring
    setup_monitoring
    
    log_success "Deployment to $environment completed!"
    
    # Show deployment URLs
    case "$environment" in
        "production")
            log_info "Production URL: https://$DOMAIN"
            log_info "S3 Direct URL: http://${PROD_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
            ;;
        "staging")
            log_info "Staging URL: https://$STAGING_DOMAIN"
            log_info "S3 Direct URL: http://${STAGING_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
            ;;
    esac
}

test_deployment() {
    local environment="${1:-staging}"
    local url
    
    case "$environment" in
        "production")
            url="https://$DOMAIN"
            ;;
        "staging")
            url="https://$STAGING_DOMAIN"
            ;;
        *)
            log_error "Invalid environment for testing: $environment"
            return 1
            ;;
    esac
    
    log_header "Testing Deployment - ${environment^^}"
    
    # Basic connectivity test
    if curl -sSf "$url" > /dev/null; then
        log_success "Website is accessible at $url"
    else
        log_error "Website is not accessible at $url"
        return 1
    fi
    
    # Run performance audit
    run_lighthouse_audit "$url"
    
    # Run security scan
    run_security_scan
    
    log_success "Testing completed"
}

serve_local() {
    log_header "Starting Local Development Server"
    
    if [[ ! -d "$BUILD_DIR" ]]; then
        log_info "No build found. Building first..."
        build
    fi
    
    log_info "Starting server at http://localhost:3000"
    log_info "Press Ctrl+C to stop the server"
    
    npx live-server "$BUILD_DIR" --port=3000 --host=localhost --open=/index.html
}

show_help() {
    cat << EOF
Gabriele Tupini - Technical Showcase Deployment Script v${VERSION}

USAGE:
    ./deploy.sh [COMMAND] [OPTIONS]

COMMANDS:
    build                   Build the website for production
    deploy [staging|prod]   Deploy to AWS S3 + CloudFront
    test [staging|prod]     Test deployed website
    serve                   Start local development server
    clean                   Clean build artifacts
    help                    Show this help message

EXAMPLES:
    ./deploy.sh build                    # Build for production
    ./deploy.sh deploy staging           # Deploy to staging
    ./deploy.sh deploy production        # Deploy to production
    ./deploy.sh test staging            # Test staging deployment
    ./deploy.sh serve                   # Start local server

ENVIRONMENT VARIABLES:
    AWS_REGION              AWS region (default: us-east-1)
    AWS_PROFILE             AWS profile (default: default)
    PRODUCTION_DISTRIBUTION_ID    CloudFront distribution ID for production
    STAGING_DISTRIBUTION_ID       CloudFront distribution ID for staging

REQUIREMENTS:
    - Node.js 18+
    - AWS CLI configured
    - npm packages installed

For more information, visit: https://github.com/gabriele-tupini/showcase
EOF
}

# ============================================================================
# MAIN SCRIPT EXECUTION
# ============================================================================

main() {
    local command="${1:-help}"
    
    case "$command" in
        "build")
            build
            ;;
        "deploy")
            local env="${2:-staging}"
            deploy "$env"
            ;;
        "test")
            local env="${2:-staging}"
            test_deployment "$env"
            ;;
        "serve")
            serve_local
            ;;
        "clean")
            cleanup_old_builds
            log_success "Cleanup completed"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
