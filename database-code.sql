-- NOTE: This schema is for visualization and referencing purposes only. 
-- NOTE: The actual database is managed via Django ORM and migrations. 
-- NOTE: Direct SQL modifications may be overwritten by migrations.
-- NOTE: This file does not represents the final state of the database schema.
-- NOTE: The implementation is flexible and may evolve over time.
-- ============================================
-- ENUM TYPE DEFINITIONS (PostgreSQL requires these)
-- ============================================

-- Admin roles
CREATE TYPE admin_role AS ENUM ('super_admin', 'operations', 'content', 'finance');

-- Form status types
CREATE TYPE requirement_status AS ENUM ('new', 'contacted', 'quoted', 'converted', 'archived');
CREATE TYPE subscription_status AS ENUM ('active', 'unsubscribed', 'bounced');
CREATE TYPE application_status AS ENUM ('received', 'reviewed', 'interview', 'hired', 'rejected');
CREATE TYPE partnership_status AS ENUM ('pending', 'approved', 'rejected', 'on_hold');
CREATE TYPE referral_status AS ENUM ('submitted', 'contacted', 'converted', 'paid');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'cancelled');

-- Blog post status
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- Comment status
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'spam');

-- Invoice status
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');

-- Payment method
CREATE TYPE payment_method_enum AS ENUM ('stripe', 'bank_transfer', 'cash', 'other');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Report types
CREATE TYPE report_type AS ENUM ('daily', 'weekly', 'monthly', 'custom');

-- Email status
CREATE TYPE email_status AS ENUM ('pending', 'sending', 'sent', 'failed');
CREATE TYPE delivery_status AS ENUM ('delivered', 'bounced', 'complained');

-- Setting types
CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json', 'array');

-- Backup types
CREATE TYPE backup_type AS ENUM ('database', 'files', 'full');
CREATE TYPE backup_status AS ENUM ('success', 'failed', 'partial');

-- Notification types
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'form_submission', 'payment', 'system', 'content');

-- Activity severity levels
CREATE TYPE activity_severity AS ENUM ('info', 'warning', 'error', 'critical');

-- Service types for client requirements
CREATE TYPE service_type AS ENUM ('software', 'design', 'it_support', 'photography', 'videography', 'other');
CREATE TYPE priority_type AS ENUM ('low', 'medium', 'high');

-- ============================================
-- 1. ADMIN MANAGEMENT
-- ============================================

-- Core admin table
CREATE TABLE admins (
    admin_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email_address VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role admin_role DEFAULT 'operations',
    avatar_url VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP,
    last_ip VARCHAR(45),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(admin_id) ON DELETE SET NULL
);

-- Login attempts for security
CREATE TABLE admin_login_attempts (
    admin_login_attempt_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id INT,
    email_address VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);

-- Create index for login attempts
CREATE INDEX idx_admin_login_email ON admin_login_attempts(email_address);
CREATE INDEX idx_admin_login_ip ON admin_login_attempts(ip_address);

-- Rate limiting table for security
CREATE TABLE rate_limits (
    rate_limit_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    user_id INT,
    user_type VARCHAR(20), -- 'admin', 'customer', 'api'
    attempt_count INT DEFAULT 1,
    first_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP,
    reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint);
CREATE INDEX idx_rate_limits_blocked ON rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;
CREATE INDEX idx_rate_limits_user ON rate_limits(user_id, user_type);

-- Enhanced Admin activity logging
CREATE TABLE admin_activities (
    admin_activity_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    severity activity_severity DEFAULT 'info',
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    http_method VARCHAR(10),
    endpoint VARCHAR(255),
    response_code INT,
    request_body JSONB,
    response_body JSONB,
    duration_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
);

-- Indexes for admin activities
CREATE INDEX idx_admin_activities_admin_date ON admin_activities(admin_id, created_at DESC);
CREATE INDEX idx_admin_activities_entity ON admin_activities(entity_type, entity_id);
CREATE INDEX idx_admin_activities_severity ON admin_activities(severity);
CREATE INDEX idx_admin_activities_action ON admin_activities(action);

-- Real-time Notifications
CREATE TABLE notifications (
    notification_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id INT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    entity_type VARCHAR(50),
    entity_id INT,
    action_url VARCHAR(500),
    data JSONB,
    scheduled_for TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
);

-- Indexes for notifications
CREATE INDEX idx_notifications_admin_unread ON notifications(admin_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- ============================================
-- 2. FORM MANAGEMENT SYSTEM
-- ============================================

-- Main form types
CREATE TABLE form_types (
    form_type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    form_name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    auto_responder_template TEXT,
    notification_emails TEXT,
    rate_limit_per_hour INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert your form types
INSERT INTO form_types (form_name, slug) VALUES 
('Client Requirements', 'client-requirements'),
('Subscription', 'subscription'),
('Job Application', 'job-application'),
('Partnership Proposal', 'partnership'),
('Referral', 'referral');

-- Client Requirements (Most important)
CREATE TABLE client_requirements (
    client_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    form_type_id INT DEFAULT 1,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email_address VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    service_needed service_type,
    budget_range VARCHAR(50),
    project_description TEXT NOT NULL,
    timeline VARCHAR(50),
    source VARCHAR(50),
    status requirement_status DEFAULT 'new',
    priority priority_type DEFAULT 'medium',
    assigned_to INT,
    internal_notes TEXT,
    admin_response TEXT,
    response_sent_at TIMESTAMP,
    converted_to_project_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_type_id) REFERENCES form_types(form_type_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES admins(admin_id) ON DELETE SET NULL
);

-- Create indexes for client requirements
CREATE INDEX idx_client_status ON client_requirements(status);
CREATE INDEX idx_client_service ON client_requirements(service_needed);
CREATE INDEX idx_client_email ON client_requirements(email_address);
CREATE INDEX idx_client_assigned ON client_requirements(assigned_to) WHERE assigned_to IS NOT NULL;

-- Subscriptions
CREATE TABLE subscriptions (
    subscription_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    form_type_id INT DEFAULT 2,
    email_address VARCHAR(100) UNIQUE NOT NULL,
    subscriber_name VARCHAR(100),
    interests JSONB,
    source VARCHAR(100),
    status subscription_status DEFAULT 'active',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    ip_address VARCHAR(45),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_type_id) REFERENCES form_types(form_type_id) ON DELETE RESTRICT
);

-- Create index for subscriptions
CREATE INDEX idx_subscription_email_status ON subscriptions(email_address, status);

-- Job Applications
CREATE TABLE job_applications (
    job_application_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    form_type_id INT DEFAULT 3,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email_address VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    resume_path VARCHAR(255),
    cover_letter TEXT,
    experience_years INT,
    skills TEXT,
    current_salary VARCHAR(50),
    expected_salary VARCHAR(50),
    notice_period VARCHAR(50),
    status application_status DEFAULT 'received',
    assigned_to INT,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    notes TEXT,
    interview_date TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES admins(admin_id) ON DELETE SET NULL,
    FOREIGN KEY (form_type_id) REFERENCES form_types(form_type_id) ON DELETE RESTRICT
);

-- Partnership Proposals (Freelancers)
CREATE TABLE partnership_proposals (
    partnership_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    form_type_id INT DEFAULT 4,
    full_name VARCHAR(100),
    email_address VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    portfolio_url VARCHAR(255),
    skills JSONB NOT NULL,
    experience_years INT,
    hourly_rate DECIMAL(10,2),
    availability VARCHAR(50),
    previous_work_samples TEXT,
    status partnership_status DEFAULT 'pending',
    admin_rating SMALLINT CHECK (admin_rating BETWEEN 1 AND 5),
    admin_notes TEXT,
    assigned_projects_count INT DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0,
    last_assigned_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_type_id) REFERENCES form_types(form_type_id) ON DELETE RESTRICT
);

-- Create index for partnership skills (using GIN index for JSONB)
CREATE INDEX idx_partnership_skills ON partnership_proposals USING GIN (skills);
CREATE INDEX idx_partnership_status ON partnership_proposals(status);

-- Referrals
CREATE TABLE referrals (
    referral_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    form_type_id INT DEFAULT 5,
    referrer_name VARCHAR(100) NOT NULL,
    referrer_email_address VARCHAR(100) NOT NULL,
    referrer_phone VARCHAR(20),
    referrer_company VARCHAR(100),
    referred_name VARCHAR(100) NOT NULL,
    referred_email_address VARCHAR(100) NOT NULL,
    referred_phone VARCHAR(20),
    referred_company VARCHAR(100),
    referred_website VARCHAR(255),
    referred_industry VARCHAR(100),
    relationship VARCHAR(100),
    notes TEXT,
    status referral_status DEFAULT 'submitted',
    conversion_value DECIMAL(10,2),
    commission_percentage DECIMAL(5,2) DEFAULT 10.00,
    commission_amount DECIMAL(10,2),
    payment_status payment_status_enum DEFAULT 'pending',
    payment_date TIMESTAMP,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_type_id) REFERENCES form_types(form_type_id) ON DELETE RESTRICT
);

-- ============================================
-- 3. CONTENT MANAGEMENT
-- ============================================

-- Blog posts
CREATE TABLE blog_posts (
    blog_post_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(255),
    author_id INT NOT NULL,
    status post_status DEFAULT 'draft',
    published_at TIMESTAMP,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    seo_title VARCHAR(200),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    currently_editing_by INT,
    edit_lock_expires TIMESTAMP,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES admins(admin_id) ON DELETE CASCADE,
    FOREIGN KEY (currently_editing_by) REFERENCES admins(admin_id) ON DELETE SET NULL
);

-- Add full-text search column for blog posts
ALTER TABLE blog_posts ADD COLUMN search_vector tsvector;

-- Blog categories
CREATE TABLE blog_categories (
    blog_category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post-category relationship
CREATE TABLE blog_post_categories (
    blog_post_id INT NOT NULL,
    blog_category_id INT NOT NULL,
    PRIMARY KEY (blog_post_id, blog_category_id),
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(blog_post_id) ON DELETE CASCADE,
    FOREIGN KEY (blog_category_id) REFERENCES blog_categories(blog_category_id) ON DELETE CASCADE
);

-- Blog comments
CREATE TABLE blog_comments (
    blog_comment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    blog_post_id INT NOT NULL,
    author_name VARCHAR(100),
    author_email VARCHAR(100),
    content TEXT NOT NULL,
    status comment_status DEFAULT 'pending',
    parent_id INT,
    admin_reply TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(blog_post_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES blog_comments(blog_comment_id) ON DELETE CASCADE
);

-- Create index for blog comments
CREATE INDEX idx_blog_comment_post_status ON blog_comments(blog_post_id, status);

-- ============================================
-- 4. SERVICES & PORTFOLIO
-- ============================================

-- Services offered
CREATE TABLE services (
    service_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio projects
CREATE TABLE portfolio_projects (
    portfolio_project_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    client_name VARCHAR(100),
    service_id INT NOT NULL,
    project_date DATE,
    completion_time VARCHAR(50),
    budget_range VARCHAR(100),
    challenges TEXT,
    solution TEXT,
    results TEXT,
    featured_image VARCHAR(255),
    gallery_images JSONB,
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE RESTRICT
);

-- Testimonials table
CREATE TABLE testimonials (
    testimonial_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    portfolio_project_id INT,
    client_name VARCHAR(100) NOT NULL,
    client_company VARCHAR(100),
    client_role VARCHAR(100),
    content TEXT NOT NULL,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    featured_image VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_project_id) REFERENCES portfolio_projects(portfolio_project_id) ON DELETE SET NULL
);

-- ============================================
-- 5. PAYMENT & FINANCE SYSTEM
-- ============================================

-- Invoices
CREATE TABLE invoices (
    invoice_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_email_address VARCHAR(100),
    client_phone VARCHAR(20),
    project_description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'draft',
    payment_method payment_method_enum DEFAULT 'bank_transfer',
    stripe_payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    paid_at TIMESTAMP,
    notes TEXT,
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);

-- Create index for invoices
CREATE INDEX idx_invoice_status_due ON invoices(status, due_date);

-- Payment transactions
CREATE TABLE payment_transactions (
    payment_transaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id INT NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    payment_method VARCHAR(50),
    status transaction_status DEFAULT 'pending',
    stripe_response JSONB,
    ip_address VARCHAR(45),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- Expense tracking
CREATE TABLE expenses (
    expense_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    expense_description VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    expense_date DATE NOT NULL,
    receipt_path VARCHAR(255),
    project_id INT,
    admin_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
);

-- ============================================
-- 6. ANALYTICS & REPORTING
-- ============================================

-- Page views
CREATE TABLE page_views (
    page_view_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(200),
    session_id VARCHAR(100),
    user_ip VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    time_spent_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for page views
CREATE INDEX idx_page_url_date ON page_views(page_url, created_at);
CREATE INDEX idx_page_session ON page_views(session_id);
CREATE INDEX idx_page_ip ON page_views(user_ip);

-- Daily aggregated analytics
CREATE TABLE daily_analytics (
    daily_analytic_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_visits INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    page_views INT DEFAULT 0,
    form_submissions INT DEFAULT 0,
    blog_views INT DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled reports
CREATE TABLE scheduled_reports (
    scheduled_report_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_name VARCHAR(100) NOT NULL,
    report_type report_type DEFAULT 'weekly',
    parameters JSONB,
    recipients TEXT,
    last_sent_at TIMESTAMP,
    next_send_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. EMAIL & NOTIFICATION SYSTEM
-- ============================================

-- Email templates
CREATE TABLE email_templates (
    email_template_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB,
    is_system BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email queue
CREATE TABLE email_queue (
    email_queue_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    to_email VARCHAR(100) NOT NULL,
    to_name VARCHAR(100),
    from_email VARCHAR(100),
    from_name VARCHAR(100),
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    template_slug VARCHAR(100),
    status email_status DEFAULT 'pending',
    priority SMALLINT DEFAULT 5,
    retry_count SMALLINT DEFAULT 0,
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email queue
CREATE INDEX idx_email_status_priority ON email_queue(status, priority, created_at);

-- Sent emails log
CREATE TABLE sent_emails (
    sent_email_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    queue_id INT,
    to_email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    template_slug VARCHAR(100),
    status delivery_status DEFAULT 'delivered',
    external_id VARCHAR(100),
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (queue_id) REFERENCES email_queue(email_queue_id) ON DELETE SET NULL
);


-- ============================================
-- SEARCH SYSTEM (Updated to match schema style)
-- ============================================

-- Searchable content for site-wide search
CREATE TABLE searchable_content (
    searchable_content_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(200) NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    section_title VARCHAR(200) NOT NULL,
    section_description TEXT,
    content TEXT NOT NULL,
    search_priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for searchable_content
CREATE INDEX idx_search_content_page_url ON searchable_content(page_url);
CREATE INDEX idx_search_content_priority_active ON searchable_content(search_priority, is_active) WHERE is_active = TRUE;

-- Full-text search indexes
CREATE INDEX idx_search_content_content_trgm ON searchable_content USING GIN (content gin_trgm_ops);
CREATE INDEX idx_search_content_title_trgm ON searchable_content USING GIN (section_title gin_trgm_ops);
CREATE INDEX idx_search_content_page_title_trgm ON searchable_content USING GIN (page_title gin_trgm_ops);

-- Add updated_at trigger
CREATE TRIGGER update_searchable_content_updated_at 
BEFORE UPDATE ON searchable_content 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. SETTINGS & CONFIGURATION
-- ============================================

CREATE TABLE settings (
    setting_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    type setting_type DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for settings
CREATE INDEX idx_settings_category ON settings(category);

-- Insert default settings (ALL KEYS ARE UNIQUE)
INSERT INTO settings (category, setting_key, setting_value, description) VALUES
('company', 'company_name', 'Dycetix Technology Solutions', 'Company Name'),
('company', 'primary_email', 'solutions@dycetix.co.za', 'Primary Email'),
('company', 'contact_phone', '+27 075 195 5229', 'Contact Phone'),
('system', 'maintenance_mode', 'false', 'Whether system is in maintenance mode'),
('system', 'maintenance_message', 'System is undergoing maintenance. Please check back soon.', 'Message shown during maintenance'),
('email', 'email_provider', 'sendgrid', 'Email service provider'),
('email', 'from_email', 'noreply@dycetix.co.za', 'Default from email'),
('email', 'from_name', 'Dycetix Technology Solutions', 'Default from name'),
('payment', 'default_currency', 'ZAR', 'Default currency'),
('payment', 'tax_rate_percentage', '15', 'Tax rate percentage'),
('invoice', 'invoice_prefix', 'INV-', 'Invoice number prefix'),
('invoice', 'next_invoice_number', '1001', 'Next invoice number'),
('security', 'login_attempts_limit', '5', 'Max login attempts before lockout'),
('security', 'login_lockout_minutes', '15', 'Lockout duration in minutes'),
('notifications', 'notifications_enabled', 'true', 'Enable system notifications'),
('rate_limiting', 'rate_limiting_enabled', 'true', 'Enable rate limiting'),
('rate_limiting', 'requests_per_hour', '100', 'Max requests per hour per IP');

-- ============================================
-- 9. BACKUP SYSTEM
-- ============================================

CREATE TABLE backup_logs (
    backup_log_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    backup_type backup_type DEFAULT 'database',
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500),
    filesize BIGINT,
    status backup_status DEFAULT 'success',
    error_message TEXT,
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_requirements_updated_at BEFORE UPDATE ON client_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnership_proposals_updated_at BEFORE UPDATE ON partnership_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_projects_updated_at BEFORE UPDATE ON portfolio_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER FOR BLOG SEARCH VECTOR
-- ============================================

-- Function to update search vector for blog posts
CREATE OR REPLACE FUNCTION update_blog_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.excerpt, '') || ' ' || 
        COALESCE(NEW.content, '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for blog posts search vector
CREATE TRIGGER update_blog_search_vector 
BEFORE INSERT OR UPDATE ON blog_posts 
FOR EACH ROW EXECUTE FUNCTION update_blog_search_vector();

-- Create index for search vector AFTER trigger is created
CREATE INDEX idx_blog_search ON blog_posts USING GIN(search_vector);

-- ============================================
-- FUNCTION FOR AUTO-ARCHIVING OLD NOTIFICATIONS
-- ============================================

CREATE OR REPLACE FUNCTION auto_archive_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Archive notifications older than 90 days
    UPDATE notifications 
    SET is_archived = TRUE 
    WHERE created_at < NOW() - INTERVAL '90 days' 
    AND is_archived = FALSE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for unread notifications count per admin
CREATE VIEW admin_unread_notifications AS
SELECT 
    admin_id,
    COUNT(*) as unread_count,
    MAX(created_at) as latest_notification
FROM notifications 
WHERE NOT is_read AND NOT is_archived
GROUP BY admin_id;

-- View for today's form submissions
CREATE VIEW todays_submissions AS
SELECT 
    'client_requirements' as form_type,
    COUNT(*) as count
FROM client_requirements 
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'job_applications' as form_type,
    COUNT(*) as count
FROM job_applications 
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'partnership_proposals' as form_type,
    COUNT(*) as count
FROM partnership_proposals 
WHERE DATE(created_at) = CURRENT_DATE
UNION ALL
SELECT 
    'referrals' as form_type,
    COUNT(*) as count
FROM referrals 
WHERE DATE(created_at) = CURRENT_DATE;

-- View for admin activity summary
CREATE VIEW admin_activity_summary AS
SELECT 
    admin_id,
    COUNT(*) as total_actions,
    COUNT(CASE WHEN severity = 'error' THEN 1 END) as error_count,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
    MIN(created_at) as first_action,
    MAX(created_at) as last_action
FROM admin_activities 
GROUP BY admin_id;

-- View for rate limit violations
CREATE VIEW rate_limit_violations AS
SELECT 
    ip_address,
    endpoint,
    COUNT(*) as violation_count,
    MAX(blocked_until) as last_blocked_until,
    MAX(created_at) as last_violation
FROM rate_limits 
WHERE blocked_until IS NOT NULL
GROUP BY ip_address, endpoint;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE admins IS 'Administrator users for the management system';
COMMENT ON COLUMN admins.role IS 'Role determines permissions: super_admin (full access), operations, content, finance';
COMMENT ON COLUMN admins.created_by IS 'Admin who created this user (self-referencing foreign key)';

COMMENT ON TABLE rate_limits IS 'Rate limiting for security - prevents brute force attacks and abuse';
COMMENT ON COLUMN rate_limits.blocked_until IS 'Timestamp until which this IP/user is blocked';

COMMENT ON TABLE admin_activities IS 'Comprehensive audit log of all admin actions with severity levels';
COMMENT ON COLUMN admin_activities.severity IS 'Info, warning, error, or critical for monitoring alerts';

COMMENT ON TABLE notifications IS 'Real-time notifications for admins with expiry and archiving';
COMMENT ON COLUMN notifications.expires_at IS 'When notification automatically expires';

COMMENT ON TABLE client_requirements IS 'Primary lead capture form - most important business data';
COMMENT ON COLUMN client_requirements.service_needed IS 'Type of service the client is requesting';
COMMENT ON COLUMN client_requirements.priority IS 'Business priority for follow-up: high = contact within 24 hours';

COMMENT ON TABLE blog_posts IS 'Blog articles with full-text search capabilities';
COMMENT ON COLUMN blog_posts.search_vector IS 'Full-text search vector for PostgreSQL GIN indexing';

COMMENT ON TABLE invoices IS 'Client invoices with payment tracking';
COMMENT ON COLUMN invoices.invoice_number IS 'Unique invoice number following company numbering system';

COMMENT ON TABLE settings IS 'System configuration settings organized by category';
COMMENT ON COLUMN settings.setting_key IS 'Setting key used in code to retrieve value';