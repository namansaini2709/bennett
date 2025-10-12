# Security Checklist for Public Repository

## Before Making This Repository Public - CRITICAL STEPS

### 1. Check Git History for Sensitive Data
Even if you've added files to `.gitignore`, they might still exist in git history. Run:

```bash
# Check if .env files are in history
git log --all --full-history -- "*/.env"
git log --all --full-history -- ".env"

# Check for API keys in history
git log -p | grep -i "api_key\|secret\|password\|token"
```

If sensitive data exists in git history, you MUST clean it:

```bash
# Option 1: Use BFG Repo Cleaner (recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Option 2: Use git filter-branch (slower)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch civic-backend/.env civic-admin/.env civic-mobile/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

### 2. Verify No Secrets in Current Commit

```bash
# Check current status
git status

# Ensure these files are NOT staged or committed:
# - civic-backend/.env
# - civic-admin/.env
# - civic-mobile/.env
# - .claude/settings.local.json
# - civic-backend/uploads/
```

### 3. Remove Sensitive Files from Git Tracking

If `.env` files or other sensitive files are already tracked:

```bash
# Stop tracking but keep local files
git rm --cached civic-backend/.env
git rm --cached civic-admin/.env
git rm --cached civic-mobile/.env
git rm --cached .claude/settings.local.json
git rm -r --cached civic-backend/uploads/

# Commit the changes
git commit -m "Remove sensitive files from tracking"
```

### 4. Rotate All Credentials

Before going public, **CHANGE ALL SECRETS** that were ever committed:

- [ ] MongoDB connection string (create new database user)
- [ ] JWT secret (generate new random string)
- [ ] Cloudinary API keys (regenerate in Cloudinary dashboard)
- [ ] Firebase credentials (create new service account)
- [ ] Any other API keys or tokens

### 5. Review Environment Variables

Ensure `.env.example` files exist and contain **ONLY placeholder values**:

```bash
# These files should be safe to commit:
civic-backend/.env.example
civic-admin/.env.example
civic-mobile/.env.example
```

### 6. Security Audit Checklist

- [ ] No hardcoded credentials in source code
- [ ] No API keys in frontend code (React/React Native)
- [ ] No database credentials in code
- [ ] No sensitive URLs or internal endpoints exposed
- [ ] No real user data in example files
- [ ] No test accounts with real credentials
- [ ] No screenshots containing sensitive information
- [ ] No log files with sensitive data (check `activity.log`)

### 7. Search for Common Secrets Patterns

```bash
# Search for potential secrets in code
grep -r "api_key" --include="*.js" --include="*.jsx" .
grep -r "secret" --include="*.js" --include="*.jsx" .
grep -r "password" --include="*.js" --include="*.jsx" .
grep -r "mongodb://" --include="*.js" --include="*.jsx" .
grep -r "mongodb+srv://" --include="*.js" --include="*.jsx" .

# Use automated tools
# Install truffleHog: pip install truffleHog
trufflehog --regex --entropy=True .
```

### 8. Update Documentation

Before going public, update:

- [ ] README.md with public-appropriate content
- [ ] Remove any internal team communication from docs
- [ ] Remove any internal server URLs or IPs
- [ ] Add contribution guidelines if accepting contributions

### 9. Configure GitHub Repository Settings

After making public:

- [ ] Enable branch protection for `main`/`master`
- [ ] Require pull request reviews
- [ ] Enable secret scanning (GitHub will scan for leaked secrets)
- [ ] Enable Dependabot for security updates
- [ ] Add `.github/dependabot.yml` configuration

### 10. Final Verification

```bash
# Clone the repo fresh to verify
cd /tmp
git clone <your-repo-url> test-clone
cd test-clone

# Check for any .env files
find . -name "*.env" -not -name "*.env.example"

# Check for sensitive patterns
grep -r "mongodb+srv://" .
grep -r "sk_live_" .  # Stripe keys
grep -r "pk_live_" .  # Stripe keys
```

## After Going Public

### Monitoring

1. Enable GitHub secret scanning alerts
2. Monitor for accidentally committed secrets
3. Set up alerts for new issues/PRs

### Response Plan

If a secret is accidentally committed:

1. **Immediately** rotate the compromised credential
2. Remove from git history using BFG or filter-branch
3. Force push to GitHub (only if no one has cloned)
4. Notify team members to re-clone the repository

## Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [TruffleHog for secret scanning](https://github.com/trufflesecurity/trufflehog)
- [Git-secrets tool](https://github.com/awslabs/git-secrets)

---

**Remember**: Once something is pushed to a public repository, assume it has been compromised. Always rotate secrets if they were ever committed, even briefly.
