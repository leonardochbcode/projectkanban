import pool from './db';
import type {
  Project, Task, Participant, Role, Client, Opportunity, CompanyInfo, Workspace, ProjectTemplate, TaskComment, ChecklistItem
} from './types';

// A simple utility to handle single-row results
async function queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const { rows } = await pool.query(sql, params);
    return rows[0] || null;
}

// A simple utility to handle multi-row results
async function queryMany<T>(sql: string, params: any[] = []): Promise<T[]> {
    const { rows } = await pool.query(sql, params);
    return rows;
}

// Company Info
export async function getCompanyInfo(): Promise<CompanyInfo | null> {
    return queryOne<CompanyInfo>('SELECT name, cnpj, address, suporteweb_code as "suportewebCode", logo_url as "logoUrl" FROM company_info LIMIT 1');
}

// Roles
export async function getRoles(): Promise<Role[]> {
    return queryMany<Role>('SELECT * FROM roles');
}

// Participants
export async function getParticipants(): Promise<Participant[]> {
    const users = await queryMany<any>('SELECT id, name, email, role_id, avatar FROM participants');
    return users.map(u => ({ ...u, roleId: u.role_id }));
}

export async function getParticipantByEmail(email: string): Promise<(Participant & { password_hash: string }) | null> {
    return queryOne<(Participant & { password_hash: string })>('SELECT id, name, email, password_hash, role_id as "roleId", avatar FROM participants WHERE email = $1', [email]);
}

// Clients
export async function getClients(): Promise<Client[]> {
    return queryMany<Client>('SELECT id, name, email, phone, company, avatar, cnpj, address, suporteweb_code as "suportewebCode" FROM clients');
}

// Workspaces
export async function getWorkspaces(): Promise<Workspace[]> {
    return queryMany<Workspace>('SELECT id, name, description, client_id as "clientId" FROM workspaces');
}

// Opportunities
export async function getOpportunities(): Promise<Opportunity[]> {
    // This is a simplified query. In a real app, comments and attachments would be fetched separately or aggregated.
    const opportunities = await queryMany<any>('SELECT id, name, contact_name, email, company, phone, description, status, created_at, value, client_id, owner_id FROM opportunities');
    return opportunities.map(o => ({
        ...o,
        contactName: o.contact_name,
        createdAt: o.created_at,
        clientId: o.client_id,
        ownerId: o.owner_id,
        comments: [], // Fetch separately
        attachments: [], // Fetch separately
    }));
}

// Project Templates
export async function getProjectTemplates(): Promise<ProjectTemplate[]> {
    const templates = await queryMany<ProjectTemplate>('SELECT * FROM project_templates');
    for (const template of templates) {
        const tasks = await queryMany<any>('SELECT title, description, priority, due_day_offset FROM template_tasks WHERE template_id = $1', [template.id]);
        template.tasks = tasks.map(t => ({...t, dueDayOffset: t.due_day_offset}));
    }
    return templates;
}

// Projects
export async function getProjects(): Promise<Project[]> {
    const projects = await queryMany<any>('SELECT id, name, description, start_date, end_date, status, workspace_id, client_id, opportunity_id, pmo_id FROM projects');

    for (const project of projects) {
        const participants = await queryMany<any>('SELECT participant_id FROM project_participants WHERE project_id = $1', [project.id]);
        project.participantIds = participants.map(p => p.participant_id);
    }

    return projects.map(p => ({
        ...p,
        startDate: p.start_date,
        endDate: p.end_date,
        workspaceId: p.workspace_id,
        clientId: p.client_id,
        opportunityId: p.opportunity_id,
        pmoId: p.pmo_id
    }));
}

// Tasks
export async function getTasks(): Promise<Task[]> {
    const tasks = await queryMany<any>(`
        SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.project_id
        FROM tasks t
    `);

    for (const task of tasks) {
        task.comments = await queryMany<TaskComment>('SELECT id, content, author_id as "authorId", created_at as "createdAt" FROM task_comments WHERE task_id = $1', [task.id]);
        task.checklist = await queryMany<ChecklistItem>('SELECT id, text, completed FROM checklist_items WHERE task_id = $1', [task.id]);
        task.attachments = []; // Fetch separately
    }

    return tasks.map(t => ({
        ...t,
        dueDate: t.due_date,
        assigneeId: t.assignee_id,
        projectId: t.project_id,
    }));
}
