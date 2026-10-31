-- =============================================================================
-- SunPower Solutions — PostgreSQL Database Initialization Script
-- =============================================================================

-- Create development database if not exists
SELECT 'CREATE DATABASE sunpower_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sunpower_db')\gexec

-- Create testing database if not exists
SELECT 'CREATE DATABASE sunpower_test_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sunpower_test_db')\gexec

-- Connect to sunpower_db and ensure UUID extension is available
\c sunpower_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to sunpower_test_db and ensure UUID extension is available
\c sunpower_test_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

