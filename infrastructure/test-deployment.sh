#!/bin/bash

# Gabriele Tupini Technical Showcase - Deployment Testing Script
# Comprehensive testing suite for deployed infrastructure and website

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Configuration
readonly PROJECT_NAME="gabriele-showcase"
readonly PRODUCTION_URL="https://gabrieletupini.dev"
readonly STAGING_URL="https://staging.gabrieletupini.dev"
readonly TIMEOUT=30
readonly USER_AGENT="Mozilla/5.0 (compatible; DeploymentTester/1.0)"

# Test results
declare -a PASSED_TESTS=()
declare -a FAILED_TESTS=()
declare -a WARNING_TESTS=()

# Utility functions
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
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "\n${BOLD}${PURPLE}=================================${NC}"
    echo -e "${BOLD}${PURPLE} $1${NC}"
    echo -e "${BOLD}${PURPLE}=================================${NC}\n"
}

# Test tracking functions
test_passed() {
    PASSED_TESTS+=("$1")
    log_success "✓ $1"
}

test_failed() {
    FAILED_TESTS+=("$1")
    log_error "✗ $1"
}

test_warning() {
    WARNING_TESTS+=("$1")
    log_warning "⚠ $1"
}

# HTTP Testing Functions
test_http_status() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    
    local actual_status
    actual_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" \
        -H "User-Agent: $USER_AGENT" "$url" || echo "000")
    
    if [[ "$actual_status" == "$expected_status" ]]; then
        test_passed "$description - Status: $actual_status"
        return 0
    else
        test_failed "$description - Expected: $expected_status, Got: $actual_status"
        return 1
    fi
}

test_https_redirect() {
    local domain="$1"
    local http_url="http://$domain"
    local https_url="https://$domain"
    
    log_info "Testing HTTPS redirect for $domain..."
    
    local redirect_location
    redirect_location=$(curl -s -I --max-time "$TIMEOUT" "$http_url" | grep -i "location:" | sed 's/location: //i' | tr -d '\r\n')
    
    if [[ "$redirect_location" =~ ^https:// ]]; then
        test_passed "HTTPS redirect working for $domain"
    else
        test_failed "HTTPS redirect not working for $domain"
    fi
}

test_ssl_certificate() {
    local domain="$1"
    
    log_info "Testing SSL certificate for $domain..."
    
    local ssl_info
    if ssl_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null); then
        local not_after
        not_after=$(echo "$ssl_info" | grep "notAfter" | cut -d'=' -f2)
        
        if [[ -n "$not_after" ]]; then
            test_passed "SSL certificate valid for $domain (expires: $not_after)"
        else
            test_warning "SSL certificate details unclear for $domain"
        fi
    else
        test_failed "SSL certificate test failed for $domain"
    fi
}

test_security_headers() {
    local url="$1"
    local description="$2"
    
    log_info "Testing security headers for $description..."
    
    local headers
    headers=$(curl -s -I --max-time "$TIMEOUT" -H "User-Agent: $USER_AGENT" "$url" || echo "")
    
    # Test for important security headers
    local required_headers=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "X-XSS-Protection"
        "Strict-Transport-Security"
    )
    
    local missing_headers=()
    for header in "${required_headers[@]}"; do
        if echo "$headers" | grep -qi "$header"; then
            test_passed "Security header present: $header"
        else
            missing_headers+=("$header")
        fi
    done
    
    if [[ ${#missing_headers[@]} -gt 0 ]]; then
        test_warning "Missing security headers: ${missing_headers[*]}"
    fi
}

test_performance_metrics() {
    local url="$1"
    local description="$2"
    
    log_info "Testing performance metrics for $description..."
    
    local curl_format='{"dns_resolution":%{time_namelookup},"tcp_connection":%{time_connect},"tls_handshake":%{time_appconnect},"time_to_first_byte":%{time_starttransfer},"total_time":%{time_total},"download_size":%{size_download},"upload_size":%{size_upload},"speed_download":%{speed_download},"http_code":%{http_code}}'
    
    local metrics
    if metrics=$(curl -s -o /dev/null -w "$curl_format" --max-time "$TIMEOUT" -H "User-Agent: $USER_AGENT" "$url"); then
        local total_time
        total_time=$(echo "$metrics" | jq -r '.total_time')
        local ttfb
        ttfb=$(echo "$metrics" | jq -r '.time_to_first_byte')
        local download_size
        download_size=$(echo "$metrics" | jq -r '.download_size')
        
        log_info "Performance metrics:"
        log_info "  Total Time: ${total_time}s"
        log_info "  Time to First Byte: ${ttfb}s"
        log_info "  Download Size: ${download_size} bytes"
        
        # Performance thresholds
        if (( $(echo "$total_time < 3.0" | bc -l) )); then
            test_passed "Total load time under 3 seconds: ${total_time}s"
        else
            test_warning "Total load time over 3 seconds: ${total_time}s"
        fi
        
        if (( $(echo "$ttfb < 1.0" | bc -l) )); then
            test_passed "TTFB under 1 second: ${ttfb}s"
        else
            test_warning "TTFB over 1 second: ${ttfb}s"
        fi
    else
        test_failed "Could not measure performance metrics for $description"
    fi
}

test_content_validity() {
    local url="$1"
    local description="$2"
    
    log_info "Testing content validity for $description..."
    
    local content
    content=$(curl -s --max-time "$TIMEOUT" -H "User-Agent: $USER_AGENT" "$url" || echo "")
    
    if [[ -z "$content" ]]; then
        test_failed "No content received from $description"
        return 1
    fi
    
    # Test for expected content
    local required_content=(
        "Gabriele Tupini"
        "Full-Stack Developer"
        "DevOps Architect"
        "<main"
        "</main>"
        "<head>"
        "</head>"
    )
    
    for content_check in "${required_content[@]}"; do
        if echo "$content" | grep -q "$content_check"; then
            test_passed "Required content found: $content_check"
        else
            test_failed "Missing required content: $content_check"
        fi
    done
    
    # Test HTML structure
    if echo "$content" | grep -q "<!DOCTYPE html>"; then
        test_passed "Valid HTML5 doctype"
    else
        test_failed "Missing or invalid HTML5 doctype"
    fi
    
    # Test meta tags
    if echo "$content" | grep -q "<meta.*viewport"; then
        test_passed "Viewport meta tag present"
    else
        test_failed "Missing viewport meta tag"
    fi
    
    if echo "$content" | grep -q "<meta.*description"; then
        test_passed "Meta description present"
    else
        test_warning "Meta description missing"
    fi
}

test_cdn_functionality() {
    local url="$1"
    local description="$2"
    
    log_info "Testing CDN functionality for $description..."
    
    local headers
    headers=$(curl -s -I --max-time "$TIMEOUT" -H "User-Agent: $USER_AGENT" "$url" || echo "")
    
    # Test for CloudFront headers
    if echo "$headers" | grep -qi "x-amz-cf-id\|x-cache.*cloudfront\|via.*cloudfront"; then
        test_passed "CloudFront CDN detected"
    else
        test_warning "CloudFront CDN headers not detected"
    fi
    
    # Test cache headers
    if echo "$headers" | grep -qi "cache-control"; then
        test_passed "Cache-Control header present"
    else
        test_warning "Cache-Control header missing"
    fi
}

test_mobile_responsiveness() {
    local url="$1"
    local description="$2"
    
    log_info "Testing mobile responsiveness for $description..."
    
    # Test with mobile user agent
    local mobile_ua="Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15"
    local mobile_response
    mobile_response=$(curl -s --max-time "$TIMEOUT" -H "User-Agent: $mobile_ua" "$url" || echo "")
    
    if [[ -n "$mobile_response" ]]; then
        test_passed "Mobile user agent response received"
        
        # Check for responsive design indicators
        if echo "$mobile_response" | grep -qi "viewport\|responsive\|mobile"; then
            test_passed "Mobile responsiveness indicators found"
        else
            test_warning "Mobile responsiveness indicators not found"
        fi
    else
        test_failed "No mobile response received"
    fi
}

test_seo_elements() {
    local url="$1"
    local description="$2"
    
    log_info "Testing SEO elements for $description..."
    
    local content
    content=$(curl -s --max-time "$TIMEOUT" -H "User-Agent: $USER_AGENT" "$url" || echo "")
    
    # Test for SEO elements
    local seo_elements=(
        "<title>"
        'meta.*name="description"'
        'meta.*property="og:title"'
        'meta.*property="og:description"'
        'meta.*name="twitter:card"'
        'link.*rel="canonical"'
        'application/ld\+json'
    )
    
    for element in "${seo_elements[@]}"; do
        if echo "$content" | grep -qi "$element"; then
            test_passed "SEO element found: $element"
        else
            test_warning "SEO element missing: $element"
        fi
    done
}

# Main Testing Functions
test_production_environment() {
    log_header "Testing Production Environment"
    
    # Basic connectivity
    test_http_status "$PRODUCTION_URL" "200" "Production site accessibility"
    
    # HTTPS and SSL
    test_https_redirect "gabrieletupini.dev"
    test_ssl_certificate "gabrieletupini.dev"
    
    # Security
    test_security_headers "$PRODUCTION_URL" "Production"
    
    # Performance
    test_performance_metrics "$PRODUCTION_URL" "Production"
    
    # Content
    test_content_validity "$PRODUCTION_URL" "Production"
    
    # CDN
    test_cdn_functionality "$PRODUCTION_URL" "Production"
    
    # Mobile
    test_mobile_responsiveness "$PRODUCTION_URL" "Production"
    
    # SEO
    test_seo_elements "$PRODUCTION_URL" "Production"
    
    # Test specific pages/sections
    local sections=("" "/#about" "/#skills" "/#projects" "/#services" "/#contact")
    for section in "${sections[@]}"; do
        test_http_status "${PRODUCTION_URL}${section}" "200" "Production section: ${section:-'homepage'}"
    done
}

test_staging_environment() {
    log_header "Testing Staging Environment"
    
    # Basic connectivity
    test_http_status "$STAGING_URL" "200" "Staging site accessibility"
    
    # HTTPS and SSL
    test_https_redirect "staging.gabrieletupini.dev"
    test_ssl_certificate "staging.gabrieletupini.dev"
    
    # Content validation
    test_content_validity "$STAGING_URL" "Staging"
    
    # Basic performance
    test_performance_metrics "$STAGING_URL" "Staging"
}

test_dns_configuration() {
    log_header "Testing DNS Configuration"
    
    local domains=("gabrieletupini.dev" "staging.gabrieletupini.dev")
    
    for domain in "${domains[@]}"; do
        log_info "Testing DNS for $domain..."
        
        # Test A record
        if dig +short "$domain" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' > /dev/null; then
            test_passed "DNS A record resolved for $domain"
        else
            # Check for CNAME (CloudFront)
            if dig +short "$domain" | grep -E '\.cloudfront\.net\.$' > /dev/null; then
                test_passed "DNS CNAME record resolved for $domain"
            else
                test_failed "DNS resolution failed for $domain"
            fi
        fi
        
        # Test AAAA record (IPv6)
        if dig +short AAAA "$domain" | grep -E '^[0-9a-fA-F:]+$' > /dev/null; then
            test_passed "IPv6 (AAAA) record found for $domain"
        else
            test_warning "No IPv6 (AAAA) record for $domain"
        fi
    done
}

test_error_pages() {
    log_header "Testing Error Page Handling"
    
    # Test 404 handling (should redirect to index.html for SPA)
    local test_404_url="${PRODUCTION_URL}/nonexistent-page"
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$test_404_url" || echo "000")
    
    if [[ "$response_code" == "200" ]]; then
        test_passed "404 error handling (redirects to index.html)"
    else
        test_warning "404 error handling returns: $response_code"
    fi
}

# Test Infrastructure Health
test_infrastructure_health() {
    log_header "Testing Infrastructure Health"
    
    log_info "Testing AWS services health..."
    
    # Test S3 bucket access (indirect via website)
    if curl -s --max-time 10 "${PRODUCTION_URL}/robots.txt" > /dev/null; then
        test_passed "S3 bucket accessible via robots.txt"
    else
        test_warning "Could not access robots.txt (S3 bucket test)"
    fi
    
    # Test CloudFront distribution
    local cf_headers
    cf_headers=$(curl -s -I --max-time "$TIMEOUT" "$PRODUCTION_URL" | grep -i "x-amz-cf-id\|x-cache\|via" || echo "")
    
    if [[ -n "$cf_headers" ]]; then
        test_passed "CloudFront distribution active"
        log_info "CloudFront headers: $cf_headers"
    else
        test_warning "CloudFront headers not detected"
    fi
}

# Generate test report
generate_report() {
    log_header "Test Results Summary"
    
    local total_tests=$((${#PASSED_TESTS[@]} + ${#FAILED_TESTS[@]} + ${#WARNING_TESTS[@]}))
    local passed_count=${#PASSED_TESTS[@]}
    local failed_count=${#FAILED_TESTS[@]}
    local warning_count=${#WARNING_TESTS[@]}
    
    echo -e "${BOLD}Test Summary:${NC}"
    echo -e "  Total Tests: $total_tests"
    echo -e "  ${GREEN}Passed: $passed_count${NC}"
    echo -e "  ${RED}Failed: $failed_count${NC}"
    echo -e "  ${YELLOW}Warnings: $warning_count${NC}"
    echo ""
    
    if [[ $failed_count -gt 0 ]]; then
        echo -e "${RED}${BOLD}Failed Tests:${NC}"
        for test in "${FAILED_TESTS[@]}"; do
            echo -e "  ${RED}✗${NC} $test"
        done
        echo ""
    fi
    
    if [[ $warning_count -gt 0 ]]; then
        echo -e "${YELLOW}${BOLD}Warnings:${NC}"
        for test in "${WARNING_TESTS[@]}"; do
            echo -e "  ${YELLOW}⚠${NC} $test"
        done
        echo ""
    fi
    
    # Calculate success rate
    local success_rate
    if [[ $total_tests -gt 0 ]]; then
        success_rate=$((passed_count * 100 / total_tests))
        echo -e "${BOLD}Success Rate: ${success_rate}%${NC}"
    fi
    
    # Overall result
    if [[ $failed_count -eq 0 ]]; then
        log_success "🎉 All critical tests passed! Deployment is healthy."
        return 0
    else
        log_error "💥 Some tests failed. Please review and fix issues."
        return 1
    fi
}

# Main execution
main() {
    local environment="${1:-all}"
    
    log_header "Gabriele Tupini Technical Showcase - Deployment Testing"
    log_info "Environment: $environment"
    log_info "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
    
    # Check dependencies
    local missing_deps=()
    for cmd in curl dig openssl jq bc; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_error "Please install missing tools and try again."
        exit 1
    fi
    
    case "$environment" in
        "production"|"prod")
            test_production_environment
            test_dns_configuration
            test_error_pages
            test_infrastructure_health
            ;;
        "staging")
            test_staging_environment
            ;;
        "dns")
            test_dns_configuration
            ;;
        "all"|*)
            test_production_environment
            test_staging_environment
            test_dns_configuration
            test_error_pages
            test_infrastructure_health
            ;;
    esac
    
    generate_report
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi