-- PostgreSQL Database Schemas for SimpleBank

-- 1. Users Schema
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 2. Accounts Schema
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    account_type VARCHAR(20) NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Transactions Schema
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- DEPOSIT, WITHDRAWAL, TRANSFER_OUT, TRANSFER_IN
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    CONSTRAINT fk_account FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Seed Initial Sample Data for Instant Testing
INSERT INTO users (id, first_name, last_name, email, password) VALUES
('user-1', 'Sarah', 'Connor', 'sarah@simplebank.com', 'password123'),
('user-2', 'John', 'Connor', 'john@simplebank.com', 'password123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, user_id, account_number, balance, account_type) VALUES
('acc-1', 'user-1', 'SB-100200300', 5420.50, 'CHECKING'),
('acc-2', 'user-2', 'SB-500600700', 1250.00, 'CHECKING')
ON CONFLICT (id) DO NOTHING;

INSERT INTO transactions (id, account_id, type, amount, status, created_date, description) VALUES
('tx-1', 'acc-1', 'DEPOSIT', 5000.00, 'SUCCESS', '2026-07-01 14:30:00', 'Initial Deposit'),
('tx-2', 'acc-1', 'DEPOSIT', 620.50, 'SUCCESS', '2026-07-05 09:15:00', 'Salary Transfer'),
('tx-3', 'acc-1', 'TRANSFER_OUT', 200.00, 'SUCCESS', '2026-07-10 11:45:00', 'Transfer to SB-500600700'),
('tx-4', 'acc-2', 'DEPOSIT', 1050.00, 'SUCCESS', '2026-07-02 10:00:00', 'Cash Deposit'),
('tx-5', 'acc-2', 'TRANSFER_IN', 200.00, 'SUCCESS', '2026-07-10 11:45:00', 'Transfer from SB-100200300')
ON CONFLICT (id) DO NOTHING;
