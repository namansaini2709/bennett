# 🚨 URGENT: Credential Rotation Required

## ⚠️ EXPOSED CREDENTIALS - ROTATE IMMEDIATELY!

The following credentials were found in git history and **MUST BE ROTATED** before making this repository public:

---

## 1. MongoDB Atlas Database

**Status:** 🔴 CRITICAL - Contains username/password in connection string

**Exposed Credential:**
```
mongodb+srv://User1:Password123@cluster0.8s5istq.mongodb.net/civic_setu
```

**Action Required:**
1. Log into MongoDB Atlas: https://cloud.mongodb.com/
2. Navigate to Database Access
3. **DELETE** the user `User1` (or change password)
4. Create a new database user with a strong password
5. Update your local `.env` files with new credentials
6. **DO NOT** commit the new credentials

**New Connection String Format:**
```bash
# In civic-backend/.env (NEVER commit this!)
MONGODB_URI=mongodb+srv://NEW_USER:NEW_STRONG_PASSWORD@cluster0.8s5istq.mongodb.net/civic_setu?retryWrites=true&w=majority&appName=Cluster0
```

**Generate Strong Password:**
```bash
# Use this command to generate a 32-character password
openssl rand -base64 32
```

---

## 2. JWT Secret

**Status:** 🔴 CRITICAL - Used for authentication token signing

**Exposed Credential:**
```
JWT_SECRET=9971185480
```

**Action Required:**
1. Generate a new strong JWT secret (minimum 256 bits)
2. Update `civic-backend/.env`
3. Restart backend server
4. **NOTE:** All existing user sessions will be invalidated

**Generate New JWT Secret:**
```bash
# Generate a secure 64-character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Update `.env`:**
```bash
# In civic-backend/.env
JWT_SECRET=<paste-generated-secret-here>
JWT_EXPIRE=10d
```

---

## 3. Cloudinary API Credentials

**Status:** 🔴 CRITICAL - Full access to media storage

**Exposed Credentials:**
```
CLOUDINARY_CLOUD_NAME=dmjwpjyxm
CLOUDINARY_API_KEY=839684756611891
CLOUDINARY_API_SECRET=QTAMe9ERYRN4xZK0ZDXnYY4apfg
```

**Action Required:**
1. Log into Cloudinary: https://cloudinary.com/console
2. Navigate to Settings → Security
3. **Regenerate** API credentials (or create new API key)
4. Update your local `.env` files

**Steps:**
1. Go to: https://cloudinary.com/console/settings/security
2. Click "Regenerate" on API Secret
3. Or create a new API Key under "Access Keys"
4. Copy new credentials to `.env`

**Update `.env`:**
```bash
# In civic-backend/.env
CLOUDINARY_CLOUD_NAME=dmjwpjyxm  # Can keep same or create new cloud
CLOUDINARY_API_KEY=<new-api-key>
CLOUDINARY_API_SECRET=<new-api-secret>
```

---

## 4. Firebase Private Key (RSA)

**Status:** 🔴 CRITICAL - Full Firebase project access

**Exposed:** Complete RSA private key for Firebase service account

**Action Required:**
1. Log into Firebase Console: https://console.firebase.google.com/
2. Navigate to Project Settings → Service Accounts
3. **DELETE** the compromised service account
4. Create a new service account
5. Download new JSON key file
6. Store securely (NEVER commit to git!)

**Steps:**
1. Go to: https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk
2. Find the service account that was exposed
3. Click "..." → Delete
4. Click "Generate New Private Key"
5. Download the JSON file
6. Store it outside git repository or use environment variable

**Secure Storage:**
```bash
# Option 1: Store JSON file outside repo
# civic-backend/firebase-key.json (add to .gitignore!)

# Option 2: Use environment variable (recommended)
# In civic-backend/.env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your-project-id
```

---

## 5. Additional Checks

### Check for API Keys in Other Services

If you have any of these services configured, rotate their credentials too:

- [ ] AWS/S3 credentials
- [ ] Email service (SendGrid, Mailgun, etc.)
- [ ] Payment gateways (Stripe, Razorpay)
- [ ] SMS services (Twilio, etc.)
- [ ] Analytics services
- [ ] Any other third-party APIs

---

## 6. After Rotation - Verification

Once you've rotated all credentials:

```bash
# Test backend connectivity
cd civic-backend
npm run dev

# Check logs for successful connections:
# ✅ Connected to MongoDB
# ✅ Cloudinary configured
# ✅ Firebase initialized (if applicable)
```

---

## 7. Update Team Members

**After force-pushing cleaned history:**

1. Notify all team members to:
   - Delete their local repository
   - Re-clone from GitHub: `git clone <repo-url>`
   - Set up their local `.env` files with NEW credentials
   - **NEVER** copy old `.env` files

2. Send this message to team:

```
🚨 SECURITY UPDATE - ACTION REQUIRED

Our repository underwent a security cleanup. Please:

1. Delete your local CIVIC_SETU folder
2. Re-clone: git clone <repo-url>
3. Contact me for the new .env credentials
4. Set up your .env files with NEW credentials
5. DO NOT use old .env files

The old credentials have been rotated and no longer work.
```

---

## 8. Prevention Checklist

To prevent future credential leaks:

- [ ] Add `.env` to `.gitignore` (✅ Already done)
- [ ] Use `.env.example` for templates (✅ Already done)
- [ ] Set up pre-commit hooks to scan for secrets
- [ ] Enable GitHub secret scanning
- [ ] Use a secrets manager for production (AWS Secrets Manager, HashiCorp Vault)
- [ ] Regular security audits
- [ ] Team training on security best practices

---

## 9. Tools for Secret Scanning

Install these to prevent future leaks:

```bash
# Git-secrets (prevents committing secrets)
npm install -g git-secrets
git secrets --install
git secrets --register-aws

# TruffleHog (scans for secrets)
pip install trufflehog
trufflehog git file://. --json

# Gitleaks (another secret scanner)
# Download from: https://github.com/gitleaks/gitleaks
gitleaks detect --source . --verbose
```

---

## 10. Status Checklist

Mark each as completed:

- [ ] MongoDB credentials rotated
- [ ] JWT secret regenerated
- [ ] Cloudinary API keys regenerated
- [ ] Firebase service account deleted and recreated
- [ ] Backend tested with new credentials
- [ ] Team members notified
- [ ] Local `.env` files updated
- [ ] Force push completed: `git push origin --force --all`
- [ ] Force push tags: `git push origin --force --tags`
- [ ] Repository ready for public release

---

## ⚠️ IMPORTANT REMINDERS

1. **NEVER** commit the new credentials
2. **ALWAYS** use `.env.example` for templates
3. **DELETE** old credentials from services (don't just change)
4. **VERIFY** all services work with new credentials before going public
5. **FORCE PUSH** is required - this will rewrite remote history

---

## Need Help?

If you encounter any issues during rotation:

1. MongoDB Issues: https://docs.atlas.mongodb.com/
2. Cloudinary Help: https://support.cloudinary.com/
3. Firebase Support: https://firebase.google.com/support
4. JWT Best Practices: https://jwt.io/

**Security Contact:** Keep this file for reference, then DELETE before making repo public!

---

**Generated:** $(date)
**Git History Cleaned:** ✅ Yes
**Ready for Public:** ❌ No - Rotate credentials first!
