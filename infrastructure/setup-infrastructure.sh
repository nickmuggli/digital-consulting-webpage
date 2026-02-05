#!/bin/bash

# Gabriele Tupini Technical Showcase - Infrastructure Setup Script
# This script sets up the complete AWS infrastructure using CloudFormation

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Configuration
readonly PROJECT_NAME="gabriele-showcase"
readonly STACK_NAME="${PROJECT_NAME}-infrastructure"
readonly AWS_REGION="${AWS_REGION:-us-east-1}"
readonly AWS_PROFILE="${AWS_PROFILE:-default}"
readonly DOMAIN_NAME="gabrieletupini.dev"
readonly STAGING_DOMAIN="staging.gabrieletupini.dev"

# File paths
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TEMPLATE_FILE="${SCRIPT_DIR}/cloudformation-stack.yml"
readonly PARAMETERS_FILE="${SCRIPT_DIR}/parameters.json"

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
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_header() {
    echo -e "\n${BOLD}${BLUE}=================================${NC}"
    echo -e "${BOLD}${BLUE} $1${NC}"
    echo -e "${BOLD}${BLUE}=================================${NC}\n"
}

check_prerequisites() {
    log_header "Checking Prerequisites"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
        log_error "AWS credentials not configured for profile: $AWS_PROFILE"
        exit 1
    fi
    
    # Check jq
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed"
        exit 1
    fi
    
    # Check template file
    if [[ ! -f "$TEMPLATE_FILE" ]]; then
        log_error "CloudFormation template not found: $TEMPLATE_FILE"
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

generate_parameters() {
    log_header "Generating Parameters File"
    
    cat > "$PARAMETERS_FILE" << EOF
[
  {
    "ParameterKey": "ProjectName",
    "ParameterValue": "${PROJECT_NAME}"
  },
  {
    "ParameterKey": "DomainName",
    "ParameterValue": "${DOMAIN_NAME}"
  },
  {
    "ParameterKey": "StagingDomainName",
    "ParameterValue": "${STAGING_DOMAIN}"
  },
  {
    "ParameterKey": "Environment",
    "ParameterValue": "production"
  }
]
EOF
    
    log_success "Parameters file generated: $PARAMETERS_FILE"
}

validate_template() {
    log_header "Validating CloudFormation Template"
    
    aws cloudformation validate-template \
        --template-body "file://$TEMPLATE_FILE" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION"
    
    log_success "Template validation passed"
}

check_stack_exists() {
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" \
        --output text \
        --query 'Stacks[0].StackStatus' 2>/dev/null || echo "NOT_EXISTS"
}

create_stack() {
    log_header "Creating CloudFormation Stack"
    
    log_info "Creating stack: $STACK_NAME"
    
    aws cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body "file://$TEMPLATE_FILE" \
        --parameters "file://$PARAMETERS_FILE" \
        --capabilities CAPABILITY_NAMED_IAM \
        --enable-termination-protection \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" \
        --tags \
            Key=Project,Value="$PROJECT_NAME" \
            Key=Environment,Value=production \
            Key=ManagedBy,Value=CloudFormation \
            Key=CreatedBy,Value="$(whoami)" \
            Key=CreatedDate,Value="$(date -u +%Y-%m-%d)"
    
    log_info "Waiting for stack creation to complete..."
    
    aws cloudformation wait stack-create-complete \
        --stack-name "$STACK_NAME" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION"
    
    log_success "Stack created successfully"
}

update_stack() {
    log_header "Updating CloudFormation Stack"
    
    log_info "Updating stack: $STACK_NAME"
    
    # Try to update the stack
    local update_id
    if update_id=$(aws cloudformation update-stack \
        --stack-name "$STACK_NAME" \
        --template-body "file://$TEMPLATE_FILE" \
        --parameters "file://$PARAMETERS_FILE" \
        --capabilities CAPABILITY_NAMED_IAM \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" \
        --output text \
        --query 'StackId' 2>/dev/null); then
        
        log_info "Stack update initiated: $update_id"
        log_info "Waiting for stack update to complete..."
        
        aws cloudformation wait stack-update-complete \
            --stack-name "$STACK_NAME" \
            --profile "$AWS_PROFILE" \
            --region "$AWS_REGION"
        
        log_success "Stack updated successfully"
    else
        log_warning "No updates to be performed on the stack"
    fi
}

get_stack_outputs() {
    log_header "Retrieving Stack Outputs"
    
    local outputs
    outputs=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs' \
        --output json)
    
    echo "$outputs" | jq -r '.[] | "\(.OutputKey): \(.OutputValue)"'
    
    # Save outputs to file for CI/CD
    echo "$outputs" > "${SCRIPT_DIR}/stack-outputs.json"
    
    log_success "Stack outputs saved to: ${SCRIPT_DIR}/stack-outputs.json"
}

setup_github_secrets() {
    log_header "Setting up GitHub Secrets"
    
    local outputs_file="${SCRIPT_DIR}/stack-outputs.json"
    
    if [[ ! -f "$outputs_file" ]]; then
        log_error "Stack outputs file not found. Run the deployment first."
        return 1
    fi
    
    log_info "GitHub Secrets to configure:"
    echo ""
    echo "Repository secrets:"
    echo "  AWS_ACCESS_KEY_ID: <your-aws-access-key-id>"
    echo "  AWS_SECRET_ACCESS_KEY: <your-aws-secret-access-key>"
    echo ""
    echo "Repository variables:"
    
    # Extract distribution IDs
    local prod_dist_id
    local staging_dist_id
    
    prod_dist_id=$(jq -r '.[] | select(.OutputKey=="ProductionDistributionId") | .OutputValue' "$outputs_file")
    staging_dist_id=$(jq -r '.[] | select(.OutputKey=="StagingDistributionId") | .OutputValue' "$outputs_file")
    
    echo "  PRODUCTION_DISTRIBUTION_ID: $prod_dist_id"
    echo "  STAGING_DISTRIBUTION_ID: $staging_dist_id"
    echo ""
    
    log_warning "Please manually configure these secrets in your GitHub repository settings."
}

check_dns_propagation() {
    log_header "Checking DNS Configuration"
    
    log_info "Checking DNS records for $DOMAIN_NAME..."
    
    # Check if domain resolves
    if dig +short "$DOMAIN_NAME" | grep -q .; then
        log_success "DNS records are configured for $DOMAIN_NAME"
    else
        log_warning "DNS records not yet propagated for $DOMAIN_NAME"
        log_info "It may take up to 48 hours for DNS changes to propagate globally"
    fi
    
    log_info "Checking DNS records for $STAGING_DOMAIN..."
    
    if dig +short "$STAGING_DOMAIN" | grep -q .; then
        log_success "DNS records are configured for $STAGING_DOMAIN"
    else
        log_warning "DNS records not yet propagated for $STAGING_DOMAIN"
    fi
}

verify_ssl_certificate() {
    log_header "Verifying SSL Certificate"
    
    local outputs_file="${SCRIPT_DIR}/stack-outputs.json"
    
    if [[ ! -f "$outputs_file" ]]; then
        log_warning "Stack outputs file not found. Cannot verify SSL certificate."
        return 0
    fi
    
    local cert_arn
    cert_arn=$(jq -r '.[] | select(.OutputKey=="SSLCertificateArn") | .OutputValue' "$outputs_file")
    
    if [[ "$cert_arn" != "null" && -n "$cert_arn" ]]; then
        log_info "SSL Certificate ARN: $cert_arn"
        
        # Check certificate status
        local cert_status
        cert_status=$(aws acm describe-certificate \
            --certificate-arn "$cert_arn" \
            --profile "$AWS_PROFILE" \
            --region "$AWS_REGION" \
            --query 'Certificate.Status' \
            --output text)
        
        if [[ "$cert_status" == "ISSUED" ]]; then
            log_success "SSL certificate is issued and ready"
        else
            log_warning "SSL certificate status: $cert_status"
            log_info "Certificate validation may still be in progress"
        fi
    else
        log_warning "SSL certificate ARN not found in stack outputs"
    fi
}

run_deployment_test() {
    log_header "Running Deployment Test"
    
    # Test S3 bucket access
    local prod_bucket
    local staging_bucket
    
    if [[ -f "${SCRIPT_DIR}/stack-outputs.json" ]]; then
        prod_bucket=$(jq -r '.[] | select(.OutputKey=="ProductionBucketName") | .OutputValue' "${SCRIPT_DIR}/stack-outputs.json")
        staging_bucket=$(jq -r '.[] | select(.OutputKey=="StagingBucketName") | .OutputValue' "${SCRIPT_DIR}/stack-outputs.json")
        
        # Test bucket access
        if aws s3 ls "s3://$prod_bucket" --profile "$AWS_PROFILE" &> /dev/null; then
            log_success "Production bucket is accessible: $prod_bucket"
        else
            log_warning "Cannot access production bucket: $prod_bucket"
        fi
        
        if aws s3 ls "s3://$staging_bucket" --profile "$AWS_PROFILE" &> /dev/null; then
            log_success "Staging bucket is accessible: $staging_bucket"
        else
            log_warning "Cannot access staging bucket: $staging_bucket"
        fi
    fi
}

cleanup_failed_stack() {
    local stack_status
    stack_status=$(check_stack_exists)
    
    if [[ "$stack_status" == *"FAILED"* ]] || [[ "$stack_status" == "ROLLBACK_COMPLETE" ]]; then
        log_warning "Found failed stack. Cleaning up..."
        
        # Disable termination protection first
        aws cloudformation update-termination-protection \
            --stack-name "$STACK_NAME" \
            --no-enable-termination-protection \
            --profile "$AWS_PROFILE" \
            --region "$AWS_REGION" 2>/dev/null || true
        
        # Delete the failed stack
        aws cloudformation delete-stack \
            --stack-name "$STACK_NAME" \
            --profile "$AWS_PROFILE" \
            --region "$AWS_REGION"
        
        log_info "Waiting for stack deletion to complete..."
        
        aws cloudformation wait stack-delete-complete \
            --stack-name "$STACK_NAME" \
            --profile "$AWS_PROFILE" \
            --region "$AWS_REGION"
        
        log_success "Failed stack cleaned up"
    fi
}

estimate_costs() {
    log_header "Infrastructure Cost Estimation"
    
    log_info "Monthly cost estimation for AWS resources:"
    echo ""
    echo "S3 Storage (10GB):"
    echo "  - Standard storage: ~$0.25/month"
    echo "  - Requests (100K GET, 10K PUT): ~$0.05/month"
    echo ""
    echo "CloudFront CDN:"
    echo "  - Data transfer (100GB): ~$8.50/month"
    echo "  - HTTP requests (1M): ~$0.75/month"
    echo ""
    echo "Route 53 DNS:"
    echo "  - Hosted zone: $0.50/month"
    echo "  - DNS queries (1M): ~$0.40/month"
    echo ""
    echo "SSL Certificate:"
    echo "  - AWS Certificate Manager: FREE"
    echo ""
    echo "CloudWatch & WAF:"
    echo "  - Basic monitoring: ~$2.00/month"
    echo "  - WAF (basic rules): ~$5.00/month"
    echo ""
    echo "ESTIMATED TOTAL: ~$17-20/month"
    echo ""
    log_warning "Costs may vary based on actual usage and traffic patterns."
}

show_post_deployment_steps() {
    log_header "Post-Deployment Steps"
    
    echo "1. DNS Configuration:"
    echo "   - Update your domain registrar's nameservers to point to Route 53"
    echo "   - Wait for DNS propagation (up to 48 hours)"
    echo ""
    echo "2. SSL Certificate:"
    echo "   - Certificate validation happens automatically via DNS"
    echo "   - Monitor certificate status in ACM console"
    echo ""
    echo "3. GitHub Actions Setup:"
    echo "   - Configure AWS credentials in GitHub repository secrets"
    echo "   - Set distribution IDs in repository variables"
    echo ""
    echo "4. Monitoring Setup:"
    echo "   - Review CloudWatch dashboards and alarms"
    echo "   - Set up notification endpoints for alerts"
    echo ""
    echo "5. Security Review:"
    echo "   - Review WAF rules and customize as needed"
    echo "   - Set up CloudTrail for audit logging"
    echo ""
}

main() {
    local action="${1:-deploy}"
    
    log_header "Gabriele Tupini Technical Showcase - Infrastructure Setup"
    log_info "Action: $action"
    log_info "AWS Region: $AWS_REGION"
    log_info "AWS Profile: $AWS_PROFILE"
    
    case "$action" in
        "deploy"|"create")
            check_prerequisites
            generate_parameters
            validate_template
            
            local stack_status
            stack_status=$(check_stack_exists)
            
            if [[ "$stack_status" == "NOT_EXISTS" ]]; then
                cleanup_failed_stack
                create_stack
            else
                log_info "Stack already exists with status: $stack_status"
                if [[ "$stack_status" == *"COMPLETE"* ]]; then
                    update_stack
                else
                    log_error "Stack is in an invalid state: $stack_status"
                    exit 1
                fi
            fi
            
            get_stack_outputs
            setup_github_secrets
            check_dns_propagation
            verify_ssl_certificate
            run_deployment_test
            estimate_costs
            show_post_deployment_steps
            ;;
        
        "update")
            check_prerequisites
            generate_parameters
            validate_template
            update_stack
            get_stack_outputs
            ;;
        
        "delete")
            log_warning "This will delete the entire infrastructure!"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                # Disable termination protection
                aws cloudformation update-termination-protection \
                    --stack-name "$STACK_NAME" \
                    --no-enable-termination-protection \
                    --profile "$AWS_PROFILE" \
                    --region "$AWS_REGION"
                
                # Delete stack
                aws cloudformation delete-stack \
                    --stack-name "$STACK_NAME" \
                    --profile "$AWS_PROFILE" \
                    --region "$AWS_REGION"
                
                log_info "Stack deletion initiated"
            else
                log_info "Stack deletion cancelled"
            fi
            ;;
        
        "status")
            local stack_status
            stack_status=$(check_stack_exists)
            echo "Stack Status: $stack_status"
            
            if [[ "$stack_status" != "NOT_EXISTS" ]]; then
                get_stack_outputs
            fi
            ;;
        
        "validate")
            check_prerequisites
            validate_template
            log_success "Template is valid"
            ;;
        
        "costs")
            estimate_costs
            ;;
        
        *)
            echo "Usage: $0 {deploy|update|delete|status|validate|costs}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Create or update the infrastructure stack"
            echo "  update   - Update existing infrastructure stack"
            echo "  delete   - Delete the infrastructure stack"
            echo "  status   - Show current stack status and outputs"
            echo "  validate - Validate CloudFormation template"
            echo "  costs    - Show cost estimation"
            exit 1
            ;;
    esac
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi