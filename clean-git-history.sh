#!/bin/bash

# ========================================
# GIT HISTORY CLEANER - REMOVE SENSITIVE FILES
# ========================================
# WARNING: This script rewrites git history
# Run this BEFORE making repository public!

echo "========================================="
echo "GIT HISTORY CLEANUP - SENSITIVE FILES"
echo "========================================="
echo ""
echo "This will remove the following files from ALL git history:"
echo "  - civic-backend/.env"
echo "  - civic-admin/.env"
echo "  - civic-mobile/.env"
echo "  - .claude/settings.local.json"
echo ""
echo "⚠️  WARNING: This rewrites git history!"
echo "⚠️  All team members will need to re-clone after this!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Step 1: Creating backup..."
git branch backup-before-cleanup-$(date +%Y%m%d-%H%M%S)

echo ""
echo "Step 2: Removing files from git history..."

# Method 1: Using git filter-branch (works without additional tools)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch \
    civic-backend/.env \
    civic-admin/.env \
    civic-mobile/.env \
    .claude/settings.local.json" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "Step 3: Cleaning up refs..."
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Git history cleaned successfully!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Verify the cleanup with: git log --all --full-history -- '*/.env'"
echo "2. Force push to remote: git push origin --force --all"
echo "3. Force push tags: git push origin --force --tags"
echo "4. ALL team members must re-clone the repository"
echo "5. ROTATE ALL CREDENTIALS that were in the old .env files!"
echo ""
echo "Backup branch created: backup-before-cleanup-*"
echo "You can delete it later with: git branch -D backup-before-cleanup-*"
echo ""
