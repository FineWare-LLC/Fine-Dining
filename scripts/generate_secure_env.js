#!/usr/bin/env node

/**
 * Secure Environment Configuration Generator
 * Generates cryptographically secure secrets for the Fine-Dining application
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecureEnvGenerator {
    constructor() {
        this.envPath = path.join(__dirname, '.env.local');
        this.backupPath = path.join(__dirname, '.env.local.backup');
    }

    generateSecureSecret(length = 64) {
        return crypto.randomBytes(length).toString('hex');
    }

    generateJWTSecret() {
        // Generate a strong JWT secret (256 bits)
        return crypto.randomBytes(32).toString('base64');
    }

    generateEncryptionKey() {
        // Generate 32-byte encryption key
        return crypto.randomBytes(32).toString('hex');
    }

    generateSigningKey() {
        // Generate 64-byte signing key
        return crypto.randomBytes(64).toString('hex');
    }

    async backupExistingEnv() {
        try {
            if (fs.existsSync(this.envPath)) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupPath = `${this.envPath}.backup.${timestamp}`;
                fs.copyFileSync(this.envPath, backupPath);
                console.log(`✓ Backed up existing .env.local to: ${backupPath}`);
                return true;
            }
        } catch (error) {
            console.error('Error backing up existing .env.local:', error.message);
            return false;
        }
        return true;
    }

    generateSecureEnvFile() {
        const secureEnv = `# Fine-Dining Application Environment Configuration
# Generated on: ${new Date().toISOString()}
# WARNING: Keep these secrets secure and never commit to version control

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fine-dining

# JWT Configuration - Cryptographically secure secret
JWT_SECRET=${this.generateJWTSecret()}
JWT_ISSUER=fine-dining-app
JWT_AUDIENCE=fine-dining-users
JWT_EXPIRES_IN=24h

# MongoDB Encryption Keys - Generated with crypto.randomBytes()
MONGO_ENCRYPTION_KEY=${this.generateEncryptionKey()}
MONGO_ENCRYPTION_SIGNING_KEY=${this.generateSigningKey()}

# API Keys
GOOGLE_PLACES_API_KEY=
# Leave blank to use Overpass API as fallback

# Overpass API Configuration
OVERPASS_URL=https://overpass-api.de/api/interpreter

# Security Configuration
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
AVATAR_RATE_LIMIT_MAX_REQUESTS=3

# Session Configuration
SESSION_SECRET=${this.generateSecureSecret(32)}
CSRF_SECRET=${this.generateSecureSecret(32)}

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif

# Development/Production Flags
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security Headers
HSTS_MAX_AGE=31536000
CSP_REPORT_URI=/api/csp-report

# Rate Limiting Redis (for production)
# REDIS_URL=redis://localhost:6379

# Email Configuration (for notifications)
# SMTP_HOST=
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASS=
# FROM_EMAIL=noreply@fine-dining.app
`;

        return secureEnv;
    }

    async updateEnvFile() {
        try {
            // Backup existing file
            await this.backupExistingEnv();

            // Generate new secure environment file
            const secureEnv = this.generateSecureEnvFile();

            // Write new file
            fs.writeFileSync(this.envPath, secureEnv, { mode: 0o600 }); // Restrict permissions
            console.log('✓ Generated new secure .env.local file');

            // Verify file permissions
            const stats = fs.statSync(this.envPath);
            const permissions = (stats.mode & parseInt('777', 8)).toString(8);
            console.log(`✓ File permissions set to: ${permissions}`);

            return true;
        } catch (error) {
            console.error('Error updating .env.local:', error.message);
            return false;
        }
    }

    validateCurrentEnv() {
        console.log('🔍 Analyzing current environment configuration...\n');

        const issues = [];
        const warnings = [];

        try {
            if (!fs.existsSync(this.envPath)) {
                issues.push('❌ .env.local file does not exist');
                return { issues, warnings };
            }

            const envContent = fs.readFileSync(this.envPath, 'utf8');
            const lines = envContent.split('\n');

            // Check for hardcoded secrets
            const hardcodedSecrets = [
                'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
                '7da6546f187c173b59d20c3ee95900805b5f4de498a1ad1f005b0d53fbe07e3c',
                'daf65cbe79e529c48fb5b7e5fcb1ef574d4893ee4cea5cd12122c40d718f7db6e06487d4c45d26669a11c87570f7eb385ef6315b868f028e1940cf856bf56789'
            ];

            for (const secret of hardcodedSecrets) {
                if (envContent.includes(secret)) {
                    issues.push('❌ Hardcoded secrets detected in environment file');
                    break;
                }
            }

            // Check file permissions
            const stats = fs.statSync(this.envPath);
            const permissions = stats.mode & parseInt('777', 8);
            if (permissions > parseInt('600', 8)) {
                warnings.push('⚠️  Environment file has overly permissive permissions');
            }

            // Check for required variables
            const requiredVars = ['JWT_SECRET', 'MONGO_ENCRYPTION_KEY', 'MONGO_ENCRYPTION_SIGNING_KEY'];
            for (const varName of requiredVars) {
                if (!envContent.includes(`${varName}=`)) {
                    issues.push(`❌ Missing required environment variable: ${varName}`);
                }
            }

            // Check JWT secret strength
            const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
            if (jwtMatch && jwtMatch[1].length < 32) {
                warnings.push('⚠️  JWT secret appears to be weak (less than 32 characters)');
            }

        } catch (error) {
            issues.push(`❌ Error reading environment file: ${error.message}`);
        }

        return { issues, warnings };
    }

    async run() {
        console.log('🔐 Fine-Dining Security Environment Generator');
        console.log('=' .repeat(50));

        // Validate current environment
        const { issues, warnings } = this.validateCurrentEnv();

        if (issues.length > 0) {
            console.log('Security Issues Found:');
            issues.forEach(issue => console.log(issue));
            console.log();
        }

        if (warnings.length > 0) {
            console.log('Security Warnings:');
            warnings.forEach(warning => console.log(warning));
            console.log();
        }

        if (issues.length === 0 && warnings.length === 0) {
            console.log('✅ Current environment configuration appears secure');
            console.log('No action needed.');
            return;
        }

        console.log('🔧 Generating secure environment configuration...\n');

        const success = await this.updateEnvFile();

        if (success) {
            console.log('\n✅ Security hardening complete!');
            console.log('\nNext steps:');
            console.log('1. Restart your application to use the new configuration');
            console.log('2. Verify all functionality works with the new secrets');
            console.log('3. Update any external services with new API keys if needed');
            console.log('4. Consider using a secrets management service for production');
            console.log('\n⚠️  IMPORTANT: Never commit the .env.local file to version control!');
        } else {
            console.log('\n❌ Failed to generate secure environment configuration');
            console.log('Please check the error messages above and try again.');
        }
    }
}

// Run the generator if this script is executed directly
if (require.main === module) {
    const generator = new SecureEnvGenerator();
    generator.run().catch(error => {
        console.error('Error running secure environment generator:', error);
        process.exit(1);
    });
}

module.exports = SecureEnvGenerator;