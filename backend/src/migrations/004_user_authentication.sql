-- DailyFlow Migration 004: User Authentication & Credentials
-- Enables username/password registration, secure password hashing, and user data isolation

DO $$
BEGIN
    -- Add username column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'username'
    ) THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(100);
    END IF;

    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;

    -- Make email optional (user can register with username + password)
    ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
END $$;

-- Create unique case-insensitive index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));
