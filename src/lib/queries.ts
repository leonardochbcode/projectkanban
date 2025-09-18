import pool from './db';
import type {
  Project, Task, Participant, Role, Client, Opportunity, CompanyInfo, Workspace, Workbook, ProjectTemplate, TaskComment, ChecklistItem
} from './types';

import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

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

export async function getRoleById(id: string): Promise<Role | null> {
    return queryOne<Role>('SELECT * FROM roles WHERE id = $1', [id]);
}

export async function createRole(role: Omit<Role, 'id'> & { id?: string }): Promise<Role> {
    // If ID is not provided, create it from the name
    const newId = role.id || role.name.toLowerCase().replace(/\s+/g, '_');
    const { name, permissions } = role;
    const result = await queryOne<any>(
        'INSERT INTO roles (id, name, permissions) VALUES ($1, $2, $3) RETURNING *',
        [newId, name, permissions]
    );
    return result;
}

export async function updateRole(id: string, role: Partial<Omit<Role, 'id'>>): Promise<Role | null> {
    const { name, permissions } = role;
    const result = await queryOne<any>(
        'UPDATE roles SET name = COALESCE($1, name), permissions = COALESCE($2, permissions) WHERE id = $3 RETURNING *',
        [name, permissions, id]
    );
    return result;
}

export async function deleteRole(id: string): Promise<{ success: boolean }> {
    // Check if any participant is using this role
    const inUse = await queryOne<any>('SELECT 1 FROM participants WHERE role_id = $1', [id]);
    if (inUse) {
        throw new Error('Cannot delete role that is currently in use by a participant.');
    }
    const result = await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}


// Participants
export async function getParticipants(): Promise<Participant[]> {
    const users = await queryMany<any>('SELECT id, name, email, role_id, avatar, provider FROM participants');
    return users.map(u => ({ ...u, roleId: u.role_id }));
}

export async function getParticipantByEmail(email: string): Promise<(Participant & { password_hash: string | null, google_id: string | null, provider: string, email_verified: Date | null }) | null> {
    const sql = `
        SELECT id, name, email, password_hash, role_id as "roleId", avatar, google_id, provider, email_verified
        FROM participants WHERE email = $1
    `;
    const user = await queryOne<any>(sql, [email]);
    if (!user) return null;
    return {
        ...user,
        password_hash: user.password_hash,
        google_id: user.google_id,
        email_verified: user.email_verified,
    };
}

export async function getParticipantById(id: string): Promise<Participant | null> {
    const user = await queryOne<any>('SELECT id, name, email, role_id, avatar, provider FROM participants WHERE id = $1', [id]);
    if (!user) return null;
    return { ...user, roleId: user.role_id };
}

export async function getParticipantByGoogleId(googleId: string): Promise<Participant | null> {
    const user = await queryOne<any>('SELECT id, name, email, role_id, avatar, provider FROM participants WHERE google_id = $1', [googleId]);
    if (!user) return null;
    return { ...user, roleId: user.role_id };
}

export async function createParticipant(
    participant: Omit<Participant, 'id'> & { password?: string, googleId?: string }
): Promise<Participant> {
    const newId = `user_${randomBytes(8).toString('hex')}`;
    // Default provider to 'local' if not specified. This fixes manual user creation from the UI.
    const { name, email, password, roleId, avatar, provider = 'local', googleId } = participant;

    let passwordHash: string | null = null;
    if (provider === 'local' || password) {
        if (!password) {
            throw new Error('Password is required for local participants.');
        }
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // For Google users, we mark email as verified immediately.
    const emailVerified = provider === 'google' ? new Date() : null;

    const result = await queryOne<any>(
        'INSERT INTO participants (id, name, email, password_hash, role_id, avatar, provider, google_id, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, email, role_id, avatar, provider',
        [newId, name, email, passwordHash, roleId, avatar, provider, googleId, emailVerified]
    );
    return { ...result, roleId: result.role_id };
}

export async function updateParticipant(id: string, participant: Partial<Omit<Participant, 'id'>> & { password?: string }): Promise<Participant | null> {
    const { name, email, password, roleId, avatar, googleId, emailVerified } = participant;

    let passwordHash: string | undefined;
    if (password) {
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // This is a simplified update. A more robust solution would use dynamic query building
    // to only update fields that are explicitly provided.
    const result = await queryOne<any>(
        'UPDATE participants SET name = COALESCE($1, name), email = COALESCE($2, email), role_id = COALESCE($3, role_id), avatar = COALESCE($4, avatar), password_hash = COALESCE($5, password_hash), google_id = COALESCE($6, google_id), email_verified = COALESCE($7, email_verified) WHERE id = $8 RETURNING id, name, email, role_id, avatar, provider',
        [name, email, roleId, avatar, passwordHash, googleId, emailVerified, id]
    );

    if (!result) return null;
    return { ...result, roleId: result.role_id };
}

export async function linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await pool.query(
        'UPDATE participants SET google_id = $1, provider = \'google\', email_verified = NOW() WHERE id = $2',
        [googleId, userId]
    );
}


export async function deleteParticipant(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM participants WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}


// Clients
export async function getClients(): Promise<Client[]> {
    return queryMany<Client>('SELECT id, name, email, phone, company, avatar, cnpj, address, suporteweb_code as "suportewebCode" FROM clients');
}

export async function getClientById(id: string): Promise<Client | null> {
    return queryOne<Client>('SELECT id, name, email, phone, company, avatar, cnpj, address, suporteweb_code as "suportewebCode" FROM clients WHERE id = $1', [id]);
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
    const newId = `cli_${randomBytes(8).toString('hex')}`;
    const { name, email, phone, company, avatar, cnpj, address, suportewebCode } = client;
    const result = await queryOne<any>(
        'INSERT INTO clients (id, name, email, phone, company, avatar, cnpj, address, suporteweb_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [newId, name, email, phone, company, avatar, cnpj, address, suportewebCode]
    );
    return { ...result, suportewebCode: result.suporteweb_code };
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id'>>): Promise<Client | null> {
    const { name, email, phone, company, avatar, cnpj, address, suportewebCode } = client;
    const result = await queryOne<any>(
        'UPDATE clients SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), company = COALESCE($4, company), avatar = COALESCE($5, avatar), cnpj = COALESCE($6, cnpj), address = COALESCE($7, address), suporteweb_code = COALESCE($8, suporteweb_code) WHERE id = $9 RETURNING *',
        [name, email, phone, company, avatar, cnpj, address, suportewebCode, id]
    );
    if (!result) return null;
    return { ...result, suportewebCode: result.suporteweb_code };
}

export async function deleteClient(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}


// Workspaces
export async function getWorkspaces(): Promise<Workspace[]> {
    return queryMany<Workspace>('SELECT id, name, description, client_id as "clientId" FROM workspaces');
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
    return queryOne<Workspace>('SELECT id, name, description, client_id as "clientId" FROM workspaces WHERE id = $1', [id]);
}

export async function createWorkspace(workspace: Omit<Workspace, 'id'>): Promise<Workspace> {
    const newId = `ws_${randomBytes(8).toString('hex')}`;
    const { name, description, clientId } = workspace;
    const result = await queryOne<any>(
        'INSERT INTO workspaces (id, name, description, client_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [newId, name, description, clientId]
    );
    return { ...result, clientId: result.client_id };
}

export async function updateWorkspace(id: string, workspace: Partial<Omit<Workspace, 'id'>>): Promise<Workspace | null> {
    const { name, description, clientId } = workspace;
    const result = await queryOne<any>(
        'UPDATE workspaces SET name = COALESCE($1, name), description = COALESCE($2, description), client_id = COALESCE($3, client_id) WHERE id = $4 RETURNING *',
        [name, description, clientId, id]
    );
    if (!result) return null;
    return { ...result, clientId: result.client_id };
}

export async function deleteWorkspace(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM workspaces WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}


// Workbooks
export async function getWorkbooksByWorkspace(workspaceId: string): Promise<Workbook[]> {
    const workbooks = await queryMany<any>('SELECT id, name, description, workspace_id FROM workbooks WHERE workspace_id = $1', [workspaceId]);
    for (const workbook of workbooks) {
        const projects = await queryMany<any>('SELECT project_id FROM project_workbooks WHERE workbook_id = $1', [workbook.id]);
        workbook.projectIds = projects.map(p => p.project_id);
    }
    return workbooks.map(w => ({
        ...w,
        workspaceId: w.workspace_id,
        // Ensure projectIds is always an array
        projectIds: w.projectIds || []
    }));
}

export async function getWorkbookById(id: string): Promise<Workbook | null> {
    const workbook = await queryOne<any>('SELECT id, name, description, workspace_id FROM workbooks WHERE id = $1', [id]);
    if (!workbook) return null;

    const projects = await queryMany<any>('SELECT project_id FROM project_workbooks WHERE workbook_id = $1', [workbook.id]);
    const projectIds = projects.map(p => p.project_id);

    return {
        id: workbook.id,
        name: workbook.name,
        description: workbook.description,
        workspaceId: workbook.workspace_id,
        projectIds: projectIds,
    };
}

export async function createWorkbook(workbook: Omit<Workbook, 'id' | 'projectIds'>): Promise<Workbook> {
    const newId = `wb_${randomBytes(8).toString('hex')}`;
    const { name, description, workspaceId } = workbook;
    const result = await queryOne<any>(
        'INSERT INTO workbooks (id, name, description, workspace_id) VALUES ($1, $2, $3, $4) RETURNING id, name, description, workspace_id',
        [newId, name, description, workspaceId]
    );
    return {
        // id: result.id, // This is already in result
        // name: result.name, // This is already in result
        // description: result.description, // This is already in result
        ...result,
        workspaceId: result.workspace_id,
        projectIds: [],
    };
}

export async function updateWorkbook(id: string, workbook: Partial<Omit<Workbook, 'id' | 'projectIds'>>): Promise<Workbook | null> {
    const { name, description } = workbook;
    const result = await queryOne<any>(
        'UPDATE workbooks SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING id, name, description, workspace_id',
        [name, description, id]
    );
    if (!result) return null;

    // Fetch the project IDs separately
    const projects = await queryMany<any>('SELECT project_id FROM project_workbooks WHERE workbook_id = $1', [id]);
    const projectIds = projects.map(p => p.project_id);

    return {
        // id: result.id,
        // name: result.name,
        // description: result.description,
        ...result,
        workspaceId: result.workspace_id,
        projectIds: projectIds,
    };
}

export async function deleteWorkbook(id: string): Promise<{ success: boolean }> {
    // The ON DELETE CASCADE in project_workbooks will handle removing associations
    const result = await pool.query('DELETE FROM workbooks WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}

export async function addProjectToWorkbook(workbookId: string, projectId: string): Promise<{ success: boolean }> {
    // Optional: Add a check to ensure the project and workbook are in the same workspace
    const result = await pool.query(
        'INSERT INTO project_workbooks (workbook_id, project_id) VALUES ($1, $2) ON CONFLICT (workbook_id, project_id) DO NOTHING',
        [workbookId, projectId]
    );
    return { success: result.rowCount > 0 };
}

export async function removeProjectFromWorkbook(workbookId: string, projectId: string): Promise<{ success: boolean }> {
    const result = await pool.query(
        'DELETE FROM project_workbooks WHERE workbook_id = $1 AND project_id = $2',
        [workbookId, projectId]
    );
    return { success: result.rowCount > 0 };
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

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
    const o = await queryOne<any>('SELECT id, name, contact_name, email, company, phone, description, status, created_at, value, client_id, owner_id FROM opportunities WHERE id = $1', [id]);
    if (!o) return null;
    return {
        ...o,
        contactName: o.contact_name,
        createdAt: o.created_at,
        clientId: o.client_id,
        ownerId: o.owner_id,
        comments: [], // Fetch separately
        attachments: [], // Fetch separately
    };
}

export async function createOpportunity(opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'comments' | 'attachments'>): Promise<Opportunity> {
    const newId = `opp_${randomBytes(8).toString('hex')}`;
    const { name, contactName, email, company, phone, description, status, value, clientId, ownerId } = opportunity;
    const result = await queryOne<any>(
        'INSERT INTO opportunities (id, name, contact_name, email, company, phone, description, status, value, client_id, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [newId, name, contactName, email, company, phone, description, status, value, clientId, ownerId]
    );
    return {
        ...result,
        contactName: result.contact_name,
        createdAt: result.created_at,
        clientId: result.client_id,
        ownerId: result.owner_id,
        comments: [],
        attachments: [],
    };
}

export async function updateOpportunity(id: string, opportunity: Partial<Omit<Opportunity, 'id' | 'createdAt' | 'comments' | 'attachments'>>): Promise<Opportunity | null> {
    const { name, contactName, email, company, phone, description, status, value, clientId, ownerId } = opportunity;
    const result = await queryOne<any>(
        'UPDATE opportunities SET name = COALESCE($1, name), contact_name = COALESCE($2, contact_name), email = COALESCE($3, email), company = COALESCE($4, company), phone = COALESCE($5, phone), description = COALESCE($6, description), status = COALESCE($7, status), value = COALESCE($8, value), client_id = COALESCE($9, client_id), owner_id = COALESCE($10, owner_id) WHERE id = $11 RETURNING *',
        [name, contactName, email, company, phone, description, status, value, clientId, ownerId, id]
    );
    if (!result) return null;
    return {
        ...result,
        contactName: result.contact_name,
        createdAt: result.created_at,
        clientId: result.client_id,
        ownerId: result.owner_id,
        comments: [],
        attachments: [],
    };
}

export async function deleteOpportunity(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM opportunities WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
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

        const workbooks = await queryMany<any>('SELECT workbook_id FROM project_workbooks WHERE project_id = $1', [project.id]);
        project.workbookIds = workbooks.map(w => w.workbook_id);
    }

    return projects.map(p => ({
        ...p,
        startDate: p.start_date,
        endDate: p.end_date,
        workspaceId: p.workspace_id,
        clientId: p.client_id,
        opportunityId: p.opportunity_id,
        pmoId: p.pmo_id,
        workbookIds: p.workbookIds || [],
    }));
}

export async function getProjectById(id: string): Promise<Project | null> {
    const project = await queryOne<any>('SELECT id, name, description, start_date, end_date, status, workspace_id, client_id, opportunity_id, pmo_id FROM projects WHERE id = $1', [id]);
    if (!project) return null;

    const participants = await queryMany<any>('SELECT participant_id FROM project_participants WHERE project_id = $1', [project.id]);
    project.participantIds = participants.map(p => p.participant_id);

    const workbooks = await queryMany<any>('SELECT workbook_id FROM project_workbooks WHERE project_id = $1', [project.id]);
    project.workbookIds = workbooks.map(w => w.workbook_id);

    return {
        ...project,
        startDate: project.start_date,
        endDate: project.end_date,
        workspaceId: project.workspace_id,
        clientId: project.client_id,
        opportunityId: project.opportunity_id,
        pmoId: project.pmo_id,
    };
}

export async function createProject(project: Omit<Project, 'id' | 'participantIds' | 'workbookIds'> & { participantIds: string[], workbookIds: string[] }): Promise<Project> {
    const newId = `prj_${randomBytes(8).toString('hex')}`;
    const { name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId, participantIds, workbookIds } = project;

    const result = await queryOne<any>(`
        INSERT INTO projects (id, name, description, start_date, end_date, status, workspace_id, client_id, opportunity_id, pmo_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `, [newId, name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId]);

    if (participantIds && participantIds.length > 0) {
        for (const participantId of participantIds) {
            await pool.query('INSERT INTO project_participants (project_id, participant_id) VALUES ($1, $2)', [newId, participantId]);
        }
    }

    if (workbookIds && workbookIds.length > 0) {
        for (const workbookId of workbookIds) {
            await pool.query('INSERT INTO project_workbooks (project_id, workbook_id) VALUES ($1, $2)', [newId, workbookId]);
        }
    }

    return {
        ...result,
        startDate: result.start_date,
        endDate: result.end_date,
        workspaceId: result.workspace_id,
        clientId: result.client_id,
        opportunityId: result.opportunity_id,
        pmoId: result.pmo_id,
        participantIds,
        workbookIds,
    };
}

export async function updateProject(id: string, project: Partial<Omit<Project, 'id' | 'participantIds' | 'workbookIds'>> & { participantIds?: string[], workbookIds?: string[] }): Promise<Project | null> {
    const { name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId, participantIds, workbookIds } = project;

    // Build the update query dynamically
    const fields: any[] = [];
    const values: any[] = [];
    let query = 'UPDATE projects SET ';

    if (name !== undefined) { fields.push('name'); values.push(name); }
    if (description !== undefined) { fields.push('description'); values.push(description); }
    if (startDate !== undefined) { fields.push('start_date'); values.push(startDate); }
    if (endDate !== undefined) { fields.push('end_date'); values.push(endDate); }
    if (status !== undefined) { fields.push('status'); values.push(status); }
    if (workspaceId !== undefined) { fields.push('workspace_id'); values.push(workspaceId); }
    if (clientId !== undefined) { fields.push('client_id'); values.push(clientId); }
    if (opportunityId !== undefined) { fields.push('opportunity_id'); values.push(opportunityId); }
    if (pmoId !== undefined) { fields.push('pmo_id'); values.push(pmoId); }

    if (fields.length === 0 && participantIds === undefined && workbookIds === undefined) {
        // Nothing to update, just fetch the project
        return getProjectById(id);
    }

    let result: any;
    if (fields.length > 0) {
        query += fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        values.push(id);
        query += ` WHERE id = $${values.length} RETURNING *;`;
        result = await queryOne<any>(query, values);
    }

    // Handle participants update
    if (participantIds !== undefined) {
        // First, remove existing participants
        await pool.query('DELETE FROM project_participants WHERE project_id = $1', [id]);
        // Then, add the new ones
        for (const participantId of participantIds) {
            await pool.query('INSERT INTO project_participants (project_id, participant_id) VALUES ($1, $2)', [id, participantId]);
        }
    }

    // Handle workbooks update
    if (workbookIds !== undefined) {
        // First, remove existing associations
        await pool.query('DELETE FROM project_workbooks WHERE project_id = $1', [id]);
        // Then, add the new ones
        for (const workbookId of workbookIds) {
            await pool.query('INSERT INTO project_workbooks (project_id, workbook_id) VALUES ($1, $2)', [id, workbookId]);
        }
    }

    // If only participants/workbooks were updated, we need to fetch the project
    if (!result) {
        result = await queryOne<any>('SELECT * FROM projects WHERE id = $1', [id]);
    }
    if (!result) return null;

    // Get the final list of participant and workbook IDs
    const finalParticipantIds = await queryMany<any>('SELECT participant_id FROM project_participants WHERE project_id = $1', [id]);
    const finalWorkbookIds = await queryMany<any>('SELECT workbook_id FROM project_workbooks WHERE project_id = $1', [id]);

    return {
        ...result,
        startDate: result.start_date,
        endDate: result.end_date,
        workspaceId: result.workspace_id,
        clientId: result.client_id,
        opportunityId: result.opportunity_id,
        pmoId: result.pmo_id,
        participantIds: finalParticipantIds.map(p => p.participant_id),
        workbookIds: finalWorkbookIds.map(w => w.workbook_id),
    };
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
    // ON DELETE CASCADE will handle related tables
    const result = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
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

export async function getTaskById(id: string): Promise<Task | null> {
    const task = await queryOne<any>(`
        SELECT id, title, description, status, priority, due_date, assignee_id, project_id
        FROM tasks WHERE id = $1
    `, [id]);
    if (!task) return null;

    task.comments = await queryMany<TaskComment>('SELECT id, content, author_id as "authorId", created_at as "createdAt" FROM task_comments WHERE task_id = $1', [id]);
    task.checklist = await queryMany<ChecklistItem>('SELECT id, text, completed FROM checklist_items WHERE task_id = $1', [id]);
    task.attachments = await queryMany<any>('SELECT id, name, size, type, url, created_at as "createdAt" FROM task_attachments WHERE task_id = $1', [id]);

    return {
        ...task,
        dueDate: task.due_date,
        assigneeId: task.assignee_id,
        projectId: task.project_id,
    };
}

export async function createTask(task: Omit<Task, 'id' | 'comments' | 'checklist' | 'attachments'>): Promise<Task> {
    const newId = `task_${randomBytes(8).toString('hex')}`;
    const { title, description, status, priority, dueDate, assigneeId, projectId } = task;
    const result = await queryOne<any>(
        'INSERT INTO tasks (id, title, description, status, priority, due_date, assignee_id, project_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [newId, title, description, status, priority, dueDate, assigneeId, projectId]
    );
    return {
        ...result,
        dueDate: result.due_date,
        assigneeId: result.assignee_id,
        projectId: result.project_id,
        comments: [],
        checklist: [],
        attachments: [],
    };
}

export async function updateTask(id: string, task: Partial<Omit<Task, 'id' | 'comments' | 'checklist' | 'attachments'>>): Promise<Task | null> {
    const { title, description, status, priority, dueDate, assigneeId, projectId } = task;
    const result = await queryOne<any>(
        'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status), priority = COALESCE($4, priority), due_date = COALESCE($5, due_date), assignee_id = COALESCE($6, assignee_id), project_id = COALESCE($7, project_id) WHERE id = $8 RETURNING *',
        [title, description, status, priority, dueDate, assigneeId, projectId, id]
    );
    if (!result) return null;
    return {
        ...result,
        dueDate: result.due_date,
        assigneeId: result.assignee_id,
        projectId: result.project_id,
        comments: [], // These should be fetched separately if needed
        checklist: [],
        attachments: [],
    };
}

export async function deleteTask(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}

// Checklist Items
export async function createChecklistItem(taskId: string, text: string): Promise<ChecklistItem> {
    const newId = `cl_item_${randomBytes(8).toString('hex')}`;
    const result = await queryOne<ChecklistItem>(
        'INSERT INTO checklist_items (id, text, completed, task_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [newId, text, false, taskId]
    );
    // The queryOne utility already returns the object in the desired shape, but if it returned raw snake_case,
    // you would need to map it like this:
    // return { id: result.id, text: result.text, completed: result.completed, taskId: result.task_id };
    return result!; // We are sure it's not null because of RETURNING *
}

export async function updateChecklistItem(id: string, completed: boolean): Promise<ChecklistItem | null> {
    const result = await queryOne<ChecklistItem>(
        'UPDATE checklist_items SET completed = $1 WHERE id = $2 RETURNING *',
        [completed, id]
    );
    return result;
}

export async function deleteChecklistItem(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM checklist_items WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}

// Task Comments
export async function createTaskComment(taskId: string, authorId: string, content: string): Promise<TaskComment> {
    const newId = `comm_${randomBytes(8).toString('hex')}`;
    const result = await queryOne<any>(
        'INSERT INTO task_comments (id, content, task_id, author_id) VALUES ($1, $2, $3, $4) RETURNING id, content, author_id, created_at',
        [newId, content, taskId, authorId]
    );
    return {
        id: result.id,
        content: result.content,
        authorId: result.author_id,
        createdAt: result.created_at,
    };
}

// Task Attachments
export async function createTaskAttachment(taskId: string, attachment: Omit<TaskAttachment, 'id' | 'createdAt'>): Promise<TaskAttachment> {
    const newId = `attach_${randomBytes(8).toString('hex')}`;
    const { name, size, type, url } = attachment;
    const result = await queryOne<any>(
        'INSERT INTO task_attachments (id, name, size, type, url, task_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [newId, name, size, type, url, taskId]
    );
    return { ...result, createdAt: result.created_at };
}
