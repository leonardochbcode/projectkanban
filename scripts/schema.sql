-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS workspace_participants, project_workbooks, workbooks, template_tasks, project_templates, checklist_items, task_attachments, task_comments, tasks, project_participants, projects, opportunity_attachments, opportunity_comments, opportunities, workspaces, clients, participants, roles, company_info, settings_email CASCADE;

-- Company Information
CREATE TABLE company_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL,
    address TEXT,
    suporteweb_code VARCHAR(50),
    logo_url TEXT
);

-- Roles and Permissions
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    permissions TEXT[]
);

-- Participants (Users)
CREATE TABLE participants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Can be null for OAuth users
    role_id VARCHAR(50) REFERENCES roles(id),
    avatar VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    provider VARCHAR(50) NOT NULL DEFAULT 'local',
    email_verified TIMESTAMPTZ,
    user_type VARCHAR(50) NOT NULL DEFAULT 'Colaborador' CHECK (user_type IN ('Colaborador', 'Convidado'))
);

-- Clients
CREATE TABLE clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(255),
    avatar VARCHAR(255),
    cnpj VARCHAR(20),
    address TEXT,
    suporteweb_code VARCHAR(50)
);

-- Workspaces
CREATE TABLE workspaces (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id VARCHAR(50) REFERENCES clients(id) ON DELETE SET NULL,
    responsible_id VARCHAR(50) REFERENCES participants(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Arquivado'))
);

-- Workspace Participants (Many-to-Many)
CREATE TABLE workspace_participants (
    workspace_id VARCHAR(50) REFERENCES workspaces(id) ON DELETE CASCADE,
    participant_id VARCHAR(50) REFERENCES participants(id) ON DELETE CASCADE,
    PRIMARY KEY (workspace_id, participant_id)
);

-- Workbooks
CREATE TABLE workbooks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workspace_id VARCHAR(50) REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL
);

-- Join table for Projects and Workbooks (Many-to-Many)
-- Opportunities
CREATE TABLE opportunities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(20),
    description TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    value NUMERIC(12, 2),
    client_id VARCHAR(50) REFERENCES clients(id) ON DELETE SET NULL,
    owner_id VARCHAR(50) REFERENCES participants(id)
);

-- Opportunity Comments
CREATE TABLE opportunity_comments (
    id VARCHAR(50) PRIMARY KEY,
    content TEXT NOT NULL,
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    author_id VARCHAR(50) REFERENCES participants(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity Attachments
CREATE TABLE opportunity_attachments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    size INTEGER,
    type VARCHAR(100),
    url TEXT,
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Projects
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) CHECK (status IN ('Planejamento', 'Em Andamento', 'Pausado', 'Concluído', 'Cancelado')),
    workspace_id VARCHAR(50) REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id VARCHAR(50) REFERENCES clients(id) ON DELETE SET NULL,
    opportunity_id VARCHAR(50) REFERENCES opportunities(id) ON DELETE SET NULL,
    pmo_id VARCHAR(50) REFERENCES participants(id)
);

-- Project Participants (Many-to-Many)
CREATE TABLE project_participants (
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    participant_id VARCHAR(50) REFERENCES participants(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, participant_id)
);

-- Join table for Projects and Workbooks (Many-to-Many)
CREATE TABLE project_workbooks (
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    workbook_id VARCHAR(50) REFERENCES workbooks(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, workbook_id)
);

-- Tasks
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    priority VARCHAR(50),
    start_date DATE,
    due_date DATE,
    assignee_id VARCHAR(50) REFERENCES participants(id) ON DELETE SET NULL,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    creation_date TIMESTAMPTZ DEFAULT NOW(),
    conclusion_date TIMESTAMPTZ,
    creator_id VARCHAR(50) REFERENCES participants(id) ON DELETE SET NULL
);

-- Task Comments
CREATE TABLE task_comments (
    id VARCHAR(50) PRIMARY KEY,
    content TEXT NOT NULL,
    task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
    author_id VARCHAR(50) REFERENCES participants(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Attachments
CREATE TABLE task_attachments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    size INTEGER,
    type VARCHAR(100),
    url TEXT,
    task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist Items
CREATE TABLE checklist_items (
    id VARCHAR(50) PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Project Templates
CREATE TABLE project_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Template Tasks
CREATE TABLE template_tasks (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) REFERENCES project_templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50),
    due_day_offset INTEGER
);

-- Email Settings
CREATE TABLE settings_email (
    id SERIAL PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    secure BOOLEAN NOT NULL,
    "user" VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);
