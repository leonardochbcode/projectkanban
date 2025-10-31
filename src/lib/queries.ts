import pool from './db';
import type {
    Project, Task, Participant, Role, Client, Opportunity, CompanyInfo, Workspace, Workbook, ProjectTemplate, TaskComment, ChecklistItem, EmailSettings
} from './types';

import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { sendEmail } from './email';

// A simple utility to handle single-row results
async function queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const { rows } = await pool.query(sql, params);
    return rows[0] || null;
}

// Email Settings
export async function getEmailSettings(): Promise<EmailSettings | null> {
    return queryOne<EmailSettings>('SELECT id, host, port, secure, "user", password FROM settings_email LIMIT 1');
}

export async function createEmailSettings(settings: Omit<EmailSettings, 'id'>): Promise<EmailSettings> {
    const { host, port, secure, user, password } = settings;
    const result = await queryOne<any>(
        'INSERT INTO settings_email (host, port, secure, "user", password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [host, port, secure, user, password]
    );
    return result;
}

export async function updateEmailSettings(id: number, settings: Partial<Omit<EmailSettings, 'id'>>): Promise<EmailSettings | null> {
    const { host, port, secure, user, password } = settings;
    const result = await queryOne<any>(
        'UPDATE settings_email SET host = COALESCE($1, host), port = COALESCE($2, port), secure = COALESCE($3, secure), "user" = COALESCE($4, "user"), password = COALESCE($5, password) WHERE id = $6 RETURNING *',
        [host, port, secure, user, password, id]
    );
    return result;
}

export async function deleteEmailSettings(id: number): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM settings_email WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
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
    const users = await queryMany<any>('SELECT id, name, email, role_id, avatar, provider, user_type FROM participants');
    return users.map(u => ({ ...u, roleId: u.role_id, userType: u.user_type }));
}

export async function getParticipantByEmail(email: string): Promise<(Participant & { password_hash: string | null, google_id: string | null, provider: string, email_verified: Date | null }) | null> {
    const sql = `
        SELECT id, name, email, password_hash, role_id as "roleId", avatar, google_id, provider, email_verified, user_type
        FROM participants WHERE email = $1
    `;
    const user = await queryOne<any>(sql, [email]);
    if (!user) return null;
    return {
        ...user,
        password_hash: user.password_hash,
        google_id: user.google_id,
        email_verified: user.email_verified,
        user_type: user.user_type,
    };
}

export async function getParticipantById(id: string): Promise<Participant | null> {
    const user = await queryOne<any>('SELECT id, name, email, role_id, avatar, provider, user_type FROM participants WHERE id = $1', [id]);
    if (!user) return null;
    return { ...user, roleId: user.role_id, userType: user.user_type };
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
    const { name, email, password, roleId, avatar, provider = 'local', googleId, userType } = participant;

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
        'INSERT INTO participants (id, name, email, password_hash, role_id, avatar, provider, google_id, email_verified, user_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, name, email, role_id, avatar, provider, user_type',
        [newId, name, email, passwordHash, roleId, avatar, provider, googleId, emailVerified, userType]
    );
    return { ...result, roleId: result.role_id, userType: result.user_type };
}

export async function updateParticipant(id: string, participant: Partial<Omit<Participant, 'id'>> & { password?: string }): Promise<Participant | null> {
    const { password, ...restOfParticipant } = participant;

    const fieldsToUpdate: Record<string, any> = { ...restOfParticipant };

    if (password) {
        const saltRounds = 10;
        fieldsToUpdate.password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Map camelCase keys from the application to snake_case keys in the database
    const keyMappings: Record<string, string> = {
        roleId: 'role_id',
        userType: 'user_type',
        googleId: 'google_id',
        emailVerified: 'email_verified'
    };

    for (const [appKey, dbKey] of Object.entries(keyMappings)) {
        if (Object.prototype.hasOwnProperty.call(fieldsToUpdate, appKey)) {
            fieldsToUpdate[dbKey] = fieldsToUpdate[appKey];
            delete fieldsToUpdate[appKey];
        }
    }

    const fieldEntries = Object.entries(fieldsToUpdate);
    if (fieldEntries.length === 0) {
        return getParticipantById(id); // Nothing to update
    }

    const setClause = fieldEntries
        .map(([key], index) => `"${key}" = $${index + 1}`)
        .join(', ');

    const values = fieldEntries.map(([, value]) => value);

    const sql = `UPDATE participants SET ${setClause} WHERE id = $${values.length + 1} RETURNING id, name, email, role_id, avatar, provider, user_type`;

    const result = await queryOne<any>(sql, [...values, id]);

    if (!result) return null;
    return { ...result, roleId: result.role_id, userType: result.user_type };
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
export async function getWorkspaces(userId: string, page: number = 1, limit: number = 10): Promise<{ workspaces: Workspace[], total: number }> {
    const offset = (page - 1) * limit;

    const totalQuery = `
        SELECT COUNT(DISTINCT w.id)
        FROM workspaces w
        LEFT JOIN workspace_participants wp_filter ON w.id = wp_filter.workspace_id
        WHERE (w.responsible_id = $1 OR wp_filter.participant_id = $1) AND w.status = 'Ativo'
    `;

    const dataQuery = `
        SELECT
            w.id,
            w.name,
            w.description,
            w.status,
            w.client_id as "clientId",
            w.responsible_id as "responsibleId",
            (w.responsible_id = $1) as "isOwner",
            COALESCE(
                (SELECT json_agg(wp.participant_id) FROM workspace_participants wp WHERE wp.workspace_id = w.id),
                '[]'::json
            ) as "participantIds"
        FROM
            workspaces w
        LEFT JOIN
            workspace_participants wp_filter ON w.id = wp_filter.workspace_id
        WHERE
            (w.responsible_id = $1 OR wp_filter.participant_id = $1) AND w.status = 'Ativo'
        GROUP BY
            w.id
        ORDER BY
            w.name
        LIMIT $2 OFFSET $3;
    `;

    const totalResult = await queryOne<{ count: string }>(totalQuery, [userId]);
    const total = parseInt(totalResult?.count || '0', 10);
    const workspaces = await queryMany<Workspace>(dataQuery, [userId, limit, offset]);

    return { workspaces, total };
}

export async function getAllActiveWorkspaces(userId: string): Promise<Workspace[]> {
    const sql = `
        SELECT
            w.id,
            w.name,
            w.description,
            w.status,
            w.client_id as "clientId",
            w.responsible_id as "responsibleId",
            (w.responsible_id = $1) as "isOwner",
            COALESCE(
                (SELECT json_agg(wp.participant_id) FROM workspace_participants wp WHERE wp.workspace_id = w.id),
                '[]'::json
            ) as "participantIds"
        FROM
            workspaces w
        LEFT JOIN
            workspace_participants wp_filter ON w.id = wp_filter.workspace_id
        WHERE
            (w.responsible_id = $1 OR wp_filter.participant_id = $1) AND w.status = 'Ativo'
        GROUP BY
            w.id
        ORDER BY
            w.name;
    `;
    return queryMany<Workspace>(sql, [userId]);
}

export async function getArchivedWorkspaces(userId: string, page: number = 1, limit: number = 10): Promise<{ workspaces: Workspace[], total: number }> {
    const offset = (page - 1) * limit;

    const totalQuery = `
        SELECT COUNT(DISTINCT w.id)
        FROM workspaces w
        LEFT JOIN workspace_participants wp_filter ON w.id = wp_filter.workspace_id
        WHERE (w.responsible_id = $1 OR wp_filter.participant_id = $1) AND w.status = 'Arquivado'
    `;

    const dataQuery = `
        SELECT
            w.id,
            w.name,
            w.description,
            w.status,
            w.client_id as "clientId",
            w.responsible_id as "responsibleId",
            (w.responsible_id = $1) as "isOwner",
            COALESCE(
                (SELECT json_agg(wp.participant_id) FROM workspace_participants wp WHERE wp.workspace_id = w.id),
                '[]'::json
            ) as "participantIds"
        FROM
            workspaces w
        LEFT JOIN
            workspace_participants wp_filter ON w.id = wp_filter.workspace_id
        WHERE
            (w.responsible_id = $1 OR wp_filter.participant_id = $1) AND w.status = 'Arquivado'
        GROUP BY
            w.id
        ORDER BY
            w.name
        LIMIT $2 OFFSET $3;
    `;

    const totalResult = await queryOne<{ count: string }>(totalQuery, [userId]);
    const total = parseInt(totalResult?.count || '0', 10);
    const workspaces = await queryMany<Workspace>(dataQuery, [userId, limit, offset]);

    return { workspaces, total };
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
    const workspace = await queryOne<any>('SELECT id, name, description, status, client_id as "clientId", responsible_id as "responsibleId" FROM workspaces WHERE id = $1', [id]);
    if (!workspace) return null;

    const participants = await queryMany<any>('SELECT participant_id FROM workspace_participants WHERE workspace_id = $1', [id]);
    workspace.participantIds = participants.map(p => p.participant_id);

    return workspace;
}

export async function createWorkspace(workspace: Omit<Workspace, 'id' | 'participantIds' | 'isOwner' | 'status'>): Promise<Workspace> {
    const newId = `ws_${randomBytes(8).toString('hex')}`;
    const { name, description, clientId, responsibleId } = workspace;
    const result = await queryOne<any>(
        'INSERT INTO workspaces (id, name, description, client_id, responsible_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [newId, name, description, clientId, responsibleId]
    );
    return {
        ...result,
        clientId: result.client_id,
        responsibleId: result.responsible_id,
        participantIds: []
    };
}

export async function updateWorkspace(id: string, workspace: Partial<Omit<Workspace, 'id'>>): Promise<Workspace | null> {
    const { name, description, clientId, status } = workspace;
    const result = await pool.query(
        'UPDATE workspaces SET name = COALESCE($1, name), description = COALESCE($2, description), client_id = COALESCE($3, client_id), status = COALESCE($4, status) WHERE id = $5',
        [name, description, clientId, status, id]
    );
    if (result.rowCount === 0) {
        return null;
    }
    return getWorkspaceById(id);
}

export async function deleteWorkspace(id: string): Promise<{ success: boolean }> {
    const projects = await queryMany<Project>('SELECT status FROM projects WHERE workspace_id = $1', [id]);
    const canArchive = projects.every(p => p.status === 'Concluído' || p.status === 'Cancelado');

    if (!canArchive) {
        throw new Error('Não é possível arquivar um espaço de trabalho que ainda contém projetos ativos.');
    }

    // This now performs a soft delete by archiving the workspace
    const result = await pool.query('UPDATE workspaces SET status = \'Arquivado\' WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}

export async function permanentlyDeleteWorkspace(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM workspaces WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}

export async function updateWorkspaceParticipants(workspaceId: string, participantIds: string[]): Promise<{ success: boolean }> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const oldParticipantsResult = await client.query('SELECT participant_id FROM workspace_participants WHERE workspace_id = $1', [workspaceId]);
        const oldParticipantIds = oldParticipantsResult.rows.map(row => row.participant_id);

        // Clear existing participants for the workspace
        await client.query('DELETE FROM workspace_participants WHERE workspace_id = $1', [workspaceId]);

        // Insert the new participants
        if (participantIds.length > 0) {
            for (const participantId of participantIds) {
                await client.query(
                    'INSERT INTO workspace_participants (workspace_id, participant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [workspaceId, participantId]
                );
            }
        }

        await client.query('COMMIT');

        const newParticipantIds = participantIds.filter(id => !oldParticipantIds.includes(id));
        if (newParticipantIds.length > 0) {
            const workspace = await getWorkspaceById(workspaceId);
            if (workspace) {
                const subject = `Você foi adicionado ao Espaço de Trabalho: ${workspace.name}`;
                const workspaceUrl = `${process.env.NEXTAUTH_URL}/workspaces/${workspaceId}`;
                const html = `
                    <h1>Novo Espaço de Trabalho Compartilhado</h1>
                    <p>Você foi adicionado ao espaço de trabalho "${workspace.name}".</p>
                    <p><a href="${workspaceUrl}">Clique aqui para ver o espaço de trabalho</a></p>
                `;
                for (const participantId of newParticipantIds) {
                    const participant = await getParticipantById(participantId);
                    if (participant?.email) {
                        sendEmail(participant.email, subject, html);
                    }
                }
            }
        }

        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to update workspace participants:', error);
        throw error;
    } finally {
        client.release();
    }
}


// Workbooks
export async function getWorkbooksByWorkspace(workspaceId: string): Promise<Workbook[]> {
    const sql = `
        SELECT
            w.id,
            w.name,
            w.description,
            w.workspace_id as "workspaceId",
            COALESCE(
                json_agg(pw.project_id) FILTER (WHERE pw.project_id IS NOT NULL),
                '[]'::json
            ) as "projectIds"
        FROM
            workbooks w
        LEFT JOIN
            project_workbooks pw ON w.id = pw.workbook_id
        WHERE
            w.workspace_id = $1
        GROUP BY
            w.id
        ORDER BY
            w.name;
    `;
    const workbooks = await queryMany<Workbook>(sql, [workspaceId]);
    return workbooks;
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

export async function updateWorkbookProjects(
    workbookId: string,
    projectsToAdd: string[],
    projectsToRemove: string[]
): Promise<{ success: boolean, message?: string }> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Remove projects
        if (projectsToRemove.length > 0) {
            const removeQuery = 'DELETE FROM project_workbooks WHERE workbook_id = $1 AND project_id = ANY($2::text[])';
            await client.query(removeQuery, [workbookId, projectsToRemove]);
        }

        // Add projects
        if (projectsToAdd.length > 0) {
            // Using a loop with ON CONFLICT to avoid inserting duplicates
            for (const projectId of projectsToAdd) {
                const insertQuery = 'INSERT INTO project_workbooks (workbook_id, project_id) VALUES ($1, $2) ON CONFLICT (workbook_id, project_id) DO NOTHING';
                await client.query(insertQuery, [workbookId, projectId]);
            }
        }

        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to update workbook projects:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: errorMessage };
    } finally {
        client.release();
    }
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
    const sql = `
        SELECT
            pt.id,
            pt.name,
            pt.description,
            COALESCE(
                json_agg(
                    json_build_object(
                        'title', tt.title,
                        'description', tt.description,
                        'priority', tt.priority,
                        'dueDayOffset', tt.due_day_offset
                    )
                ) FILTER (WHERE tt.id IS NOT NULL),
                '[]'::json
            ) as tasks
        FROM
            project_templates pt
        LEFT JOIN
            template_tasks tt ON pt.id = tt.template_id
        GROUP BY
            pt.id
        ORDER BY
            pt.name;
    `;
    return queryMany<ProjectTemplate>(sql);
}

export async function getProjectTemplateById(id: string): Promise<ProjectTemplate | null> {
    const sql = `
        SELECT
            pt.id,
            pt.name,
            pt.description,
            COALESCE(
                json_agg(
                    json_build_object(
                        'title', tt.title,
                        'description', tt.description,
                        'priority', tt.priority,
                        'dueDayOffset', tt.due_day_offset
                    )
                ) FILTER (WHERE tt.id IS NOT NULL),
                '[]'::json
            ) as tasks
        FROM
            project_templates pt
        LEFT JOIN
            template_tasks tt ON pt.id = tt.template_id
        WHERE
            pt.id = $1
        GROUP BY
            pt.id;
    `;
    return queryOne<ProjectTemplate>(sql, [id]);
}

export async function createProjectTemplate(template: Omit<ProjectTemplate, 'id'>): Promise<ProjectTemplate> {
    const newId = `tmpl_${randomBytes(8).toString('hex')}`;
    const { name, description, tasks } = template;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const templateResult = await client.query(
            'INSERT INTO project_templates (id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [newId, name, description]
        );
        const newTemplate = templateResult.rows[0];

        if (tasks && tasks.length > 0) {
            for (const task of tasks) {
                await client.query(
                    'INSERT INTO template_tasks (template_id, title, description, priority, due_day_offset) VALUES ($1, $2, $3, $4, $5)',
                    [newId, task.title, task.description, task.priority, task.dueDayOffset]
                );
            }
        }

        await client.query('COMMIT');

        return { ...newTemplate, tasks: tasks || [] };
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to create project template:', e);
        throw e;
    } finally {
        client.release();
    }
}

export async function updateProjectTemplate(id: string, template: Partial<Omit<ProjectTemplate, 'id'>>): Promise<ProjectTemplate | null> {
    const { name, description, tasks } = template;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (name !== undefined || description !== undefined) {
            await client.query(
                'UPDATE project_templates SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3',
                [name, description, id]
            );
        }


        if (tasks !== undefined) {
            await client.query('DELETE FROM template_tasks WHERE template_id = $1', [id]);
            if (tasks.length > 0) {
                for (const task of tasks) {
                    await client.query(
                        'INSERT INTO template_tasks (template_id, title, description, priority, due_day_offset) VALUES ($1, $2, $3, $4, $5)',
                        [id, task.title, task.description, task.priority, task.dueDayOffset]
                    );
                }
            }
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to update project template:', e);
        return null;
    } finally {
        client.release();
    }

    return getProjectTemplateById(id);
}

export async function deleteProjectTemplate(id: string): Promise<{ success: boolean }> {
    // ON DELETE CASCADE will handle template_tasks
    const result = await pool.query('DELETE FROM project_templates WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}


export async function getAllProjects(): Promise<Project[]> {
    const sql = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.start_date as "startDate",
            p.end_date as "endDate",
            p.status,
            p.workspace_id as "workspaceId",
            p.client_id as "clientId",
            p.opportunity_id as "opportunityId",
            p.pmo_id as "pmoId",
            COALESCE(
                (SELECT json_agg(pp.participant_id) FROM project_participants pp WHERE pp.project_id = p.id),
                '[]'::json
            ) as "participantIds",
            COALESCE(
                (SELECT json_agg(pw.workbook_id) FROM project_workbooks pw WHERE pw.project_id = p.id),
                '[]'::json
            ) as "workbookIds"
        FROM
            projects p
        WHERE EXISTS (
            SELECT 1
            FROM tasks t
            WHERE t.project_id = p.id
        )
        GROUP BY
            p.id
        ORDER BY
            p.name;
    `;
    const projects = await queryMany<Project>(sql);
    return projects;
}

// Projects
export async function getProjects(userId: string): Promise<Project[]> {
    const sql = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.start_date as "startDate",
            p.end_date as "endDate",
            p.status,
            p.workspace_id as "workspaceId",
            p.client_id as "clientId",
            p.opportunity_id as "opportunityId",
            p.pmo_id as "pmoId",
            COALESCE(
                (SELECT json_agg(pp.participant_id) FROM project_participants pp WHERE pp.project_id = p.id),
                '[]'::json
            ) as "participantIds",
            COALESCE(
                (SELECT json_agg(pw.workbook_id) FROM project_workbooks pw WHERE pw.project_id = p.id),
                '[]'::json
            ) as "workbookIds"
        FROM
            projects p
        WHERE
            p.workspace_id IN (
                SELECT w.id
                FROM workspaces w
                LEFT JOIN workspace_participants wp ON w.id = wp.workspace_id
                WHERE w.responsible_id = $1 OR wp.participant_id = $1
            )
        GROUP BY
            p.id
        ORDER BY
            p.name;
    `;
    const projects = await queryMany<Project>(sql, [userId]);
    return projects;
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
    const { name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId, participantIds, workbookIds } = project;
    const newId = `prj_${randomBytes(8).toString('hex')}`;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const projectResult = await client.query(`
            INSERT INTO projects (id, name, description, start_date, end_date, status, workspace_id, client_id, opportunity_id, pmo_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `, [newId, name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId]);
        const newProject = projectResult.rows[0];

        if (participantIds && participantIds.length > 0) {
            for (const participantId of participantIds) {
                await client.query('INSERT INTO project_participants (project_id, participant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newId, participantId]);
            }
        }

        if (workbookIds && workbookIds.length > 0) {
            for (const workbookId of workbookIds) {
                await client.query('INSERT INTO project_workbooks (project_id, workbook_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newId, workbookId]);
            }
        }

        await client.query('COMMIT');

        const allParticipantIds = [...(participantIds || [])];
        if (pmoId && !allParticipantIds.includes(pmoId)) {
            allParticipantIds.push(pmoId);
        }

        const subject = `Novo Projeto Criado: ${name}`;
        const projectUrl = `${process.env.NEXTAUTH_URL}/projects/${newId}`;
        const html = `
            <h1>Você foi adicionado a um novo projeto</h1>
            <p>O projeto "${name}" foi criado e você foi adicionado como participante.</p>
            <p><a href="${projectUrl}">Clique aqui para ver o projeto</a></p>
        `;

        for (const participantId of allParticipantIds) {
            const participant = await getParticipantById(participantId);
            if (participant?.email) {
                sendEmail(participant.email, subject, html);
            }
        }

        return {
            ...newProject,
            startDate: newProject.start_date,
            endDate: newProject.end_date,
            workspaceId: newProject.workspace_id,
            clientId: newProject.client_id,
            opportunityId: newProject.opportunity_id,
            pmoId: newProject.pmo_id,
            participantIds: participantIds || [],
            workbookIds: workbookIds || [],
        };
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to create project:', e);
        throw e;
    } finally {
        client.release();
    }
}

export async function updateProject(id: string, project: Partial<Omit<Project, 'id' | 'participantIds' | 'workbookIds'>> & { participantIds?: string[], workbookIds?: string[] }): Promise<Project | null> {
    const { name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId, participantIds, workbookIds } = project;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE projects
            SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                start_date = COALESCE($3, start_date),
                end_date = COALESCE($4, end_date),
                status = COALESCE($5, status),
                workspace_id = COALESCE($6, workspace_id),
                client_id = COALESCE($7, client_id),
                opportunity_id = COALESCE($8, opportunity_id),
                pmo_id = COALESCE($9, pmo_id)
            WHERE id = $10;
        `;
        await client.query(updateQuery, [name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId, id]);

        if (status === 'Concluído' || status === 'Cancelado') {
            await client.query(`UPDATE tasks SET status = 'Concluída' WHERE project_id = $1`, [id]);
            await client.query(`UPDATE checklist_items SET completed = true WHERE task_id IN (SELECT id FROM tasks WHERE project_id = $1)`, [id]);
        }

        if (participantIds !== undefined) {
            await client.query('DELETE FROM project_participants WHERE project_id = $1', [id]);
            if (participantIds.length > 0) {
                for (const participantId of participantIds) {
                    await client.query('INSERT INTO project_participants (project_id, participant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, participantId]);
                }
            }
        }

        if (workbookIds !== undefined) {
            await client.query('DELETE FROM project_workbooks WHERE project_id = $1', [id]);
            if (workbookIds.length > 0) {
                for (const workbookId of workbookIds) {
                    await client.query('INSERT INTO project_workbooks (project_id, workbook_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, workbookId]);
                }
            }
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to update project:', e);
        // In case of error, return null to signify that the update failed.
        return null;
    } finally {
        client.release();
    }

    // Return the updated project with all its relations
    return getProjectById(id);
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
    // ON DELETE CASCADE will handle related tables
    const result = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}


// Tasks
export async function getTasks(): Promise<Task[]> {
    const tasks = await queryMany<any>(`
        SELECT t.id, t.title, t.description, t.status, t.priority, t.start_date, t.due_date, t.assignee_id, t.project_id, t.creation_date, t.conclusion_date, t.creator_id
        FROM tasks t
    `);

    for (const task of tasks) {
        task.comments = await queryMany<TaskComment>('SELECT id, content, author_id as "authorId", created_at as "createdAt" FROM task_comments WHERE task_id = $1', [task.id]);
        task.checklist = await queryMany<ChecklistItem>('SELECT id, text, completed FROM checklist_items WHERE task_id = $1', [task.id]);
        task.attachments = []; // Fetch separately
    }

    return tasks.map(t => ({
        ...t,
        startDate: t.start_date,
        dueDate: t.due_date,
        assigneeId: t.assignee_id,
        projectId: t.project_id,
        creationDate: t.creation_date,
        conclusionDate: t.conclusion_date,
        creatorId: t.creator_id,
    }));
}

export async function getTaskById(id: string): Promise<Task | null> {
    const task = await queryOne<any>(`
        SELECT id, title, description, status, priority, start_date, due_date, assignee_id, project_id, creation_date, conclusion_date, creator_id
        FROM tasks WHERE id = $1
    `, [id]);
    if (!task) return null;

    task.comments = await queryMany<TaskComment>('SELECT id, content, author_id as "authorId", created_at as "createdAt" FROM task_comments WHERE task_id = $1', [id]);
    task.checklist = await queryMany<ChecklistItem>('SELECT id, text, completed FROM checklist_items WHERE task_id = $1', [id]);
    task.attachments = await queryMany<any>('SELECT id, name, size, type, url, created_at as "createdAt" FROM task_attachments WHERE task_id = $1', [id]);

    return {
        ...task,
        startDate: task.start_date,
        dueDate: task.due_date,
        assigneeId: task.assignee_id,
        projectId: task.project_id,
        creationDate: task.creation_date,
        conclusionDate: task.conclusion_date,
        creatorId: task.creator_id,
    };
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
    const sql = `
        SELECT
            t.id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.start_date as "startDate",
            t.due_date as "dueDate",
            t.assignee_id as "assigneeId",
            t.project_id as "projectId",
            t.creation_date as "creationDate",
            t.conclusion_date as "conclusionDate",
            t.creator_id as "creatorId"
        FROM tasks t
        WHERE t.project_id = $1
        ORDER BY t.creation_date ASC;
    `;
    const tasks = await queryMany<Task>(sql, [projectId]);
    // The query result already matches the Task type for the most part,
    // but we need to initialize comments, checklist, and attachments as empty arrays.
    return tasks.map(task => ({
        ...task,
        comments: [],
        checklist: [],
        attachments: [],
    }));
}

export async function createTask(task: Omit<Task, 'id' | 'comments' | 'checklist' | 'attachments' | 'creationDate'>): Promise<Task> {
    const newId = `task_${randomBytes(8).toString('hex')}`;
    const { title, description, status, priority, startDate, dueDate, assigneeId, projectId, creatorId } = task;
    const result = await queryOne<any>(
        'INSERT INTO tasks (id, title, description, status, priority, start_date, due_date, assignee_id, project_id, creator_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [newId, title, description, status, priority, startDate, dueDate, assigneeId, projectId, creatorId]
    );

    if (assigneeId) {
        const assignee = await getParticipantById(assigneeId);
        if (assignee?.email) {
            const subject = `Nova Tarefa Atribuída: ${title}`;
            // const taskUrl = `${process.env.NEXTAUTH_URL}/tasks/${projectId}?taskId=${newId}`;
            const taskUrl = `${process.env.NEXTAUTH_URL}/my-tasks`;
            const html = `
                <h1>Nova Tarefa Atribuída a Você</h1>
                <p>Uma nova tarefa foi criada e atribuída a você.</p>
                <h2>Detalhes da Tarefa:</h2>
                <ul>
                    <li><strong>Título:</strong> ${title}</li>
                    <li><strong>Descrição:</strong> ${description}</li>
                    <li><strong>Data de Início:</strong> ${startDate}</li>
                    <li><strong>Data de Prazo:</strong> ${dueDate}</li>
                    <li><strong>Status:</strong> ${status}</li>
                    <li><strong>Prioridade:</strong> ${priority}</li>
                </ul>
                <p><a href="${taskUrl}">Clique aqui para ver a tarefa</a></p>
            `;
            sendEmail(assignee.email, subject, html);
        }
    }

    return {
        ...result,
        startDate: result.start_date,
        dueDate: result.due_date,
        assigneeId: result.assignee_id,
        projectId: result.project_id,
        creationDate: result.creation_date,
        conclusionDate: result.conclusion_date,
        creatorId: result.creator_id,
        comments: [],
        checklist: [],
        attachments: [],
    };
}

export async function updateTask(id: string, task: Partial<Omit<Task, 'id' | 'comments' | 'checklist' | 'attachments'>>): Promise<Task | null> {
    const { title, description, status, priority, startDate, dueDate, assigneeId, projectId, conclusionDate } = task;

    const originalTask = await getTaskById(id);
    if (!originalTask) return null;

    const params: (string | null | undefined)[] = [title, description, status, priority, startDate, dueDate, assigneeId, projectId, id];
    let statusToUpdate = status;
    let conclusionDateClause = '';

    if (conclusionDate !== undefined) {
        conclusionDateClause = `, conclusion_date = $10`;
        params.push(conclusionDate);
        if (conclusionDate) {
            statusToUpdate = 'Concluída';
            params[2] = 'Concluída';
        }
    } else if (status && status !== originalTask.status) {
        if (status === 'Concluída') {
            if (originalTask.conclusionDate === null) {
                conclusionDateClause = ', conclusion_date = NOW()';
            }
        } else {
            conclusionDateClause = ', conclusion_date = NULL';
        }
    }


    const query = `
        UPDATE tasks
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            status = COALESCE($3, status),
            priority = COALESCE($4, priority),
            start_date = COALESCE($5, start_date),
            due_date = COALESCE($6, due_date),
            assignee_id = COALESCE($7, assignee_id),
            project_id = COALESCE($8, project_id)
            ${conclusionDateClause}
        WHERE id = $9
        RETURNING *`;

    const result = await queryOne<any>(query, params);

    if (!result) return null;

    if (statusToUpdate === 'Concluída' && originalTask?.status !== 'Concluída' && originalTask?.creatorId) {
        const creator = await getParticipantById(originalTask.creatorId);
        const project = await getProjectById(originalTask.projectId);

        if (creator?.email && originalTask.assigneeId !== originalTask.creatorId) {
            const subject = `Tarefa Concluída: ${originalTask.title}`;
            const html = `
                <h1>Tarefa Concluída</h1>
                <p>A tarefa "${originalTask.title}" do projeto "${project?.name}" foi concluída.</p>
            `;
            sendEmail(creator.email, subject, html);
        }
    }
    return getTaskById(id);
}

export async function deleteTask(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
}

export async function getMyPendingTasks(
    userId: string,
    filters: { projectId?: string; statuses?: string[]; priorities?: string[] } = {}
): Promise<Task[]> {
    const { projectId, statuses, priorities } = filters;
    const params: any[] = [userId];
    let whereClauses = ['t.assignee_id = $1'];
    let paramIndex = 2;

    if (projectId) {
        whereClauses.push(`t.project_id = $${paramIndex++}`);
        params.push(projectId);
    }

    if (statuses && statuses.length > 0) {
        whereClauses.push(`t.status = ANY($${paramIndex++}::text[])`);
        params.push(statuses);
    } else {
        whereClauses.push(`t.status NOT IN ('Concluída', 'Cancelado')`);
    }

    if (priorities && priorities.length > 0) {
        whereClauses.push(`t.priority = ANY($${paramIndex++}::text[])`);
        params.push(priorities);
    }

    const sql = `
        SELECT
            t.id, t.title, t.description, t.status, t.priority, t.due_date,
            t.assignee_id, t.project_id, t.creation_date, t.conclusion_date, t.creator_id
        FROM tasks t
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY
            CASE WHEN t.due_date < NOW() AND t.status NOT IN ('Concluída', 'Cancelado') THEN 0 ELSE 1 END,
            t.due_date ASC;
    `;
    const tasks = await queryMany<any>(sql, params);
    return tasks.map(t => ({
        ...t,
        dueDate: t.due_date,
        assigneeId: t.assignee_id,
        projectId: t.project_id,
        creationDate: t.creation_date,
        conclusionDate: t.conclusion_date,
        creatorId: t.creator_id,
        comments: [],
        checklist: [],
        attachments: [],
    }));
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

export async function updateChecklistItem(id: string, data: { completed?: boolean; text?: string }): Promise<ChecklistItem | null> {
    const { completed, text } = data;

    if (completed === undefined && text === undefined) {
        // Nothing to update
        const currentItem = await queryOne<any>('SELECT id, text, completed FROM checklist_items WHERE id = $1', [id]);
        return currentItem;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Build the query dynamically
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (completed !== undefined) {
            updates.push(`completed = $${paramIndex++}`);
            values.push(completed);
        }

        if (text !== undefined) {
            updates.push(`text = $${paramIndex++}`);
            values.push(text);
        }

        values.push(id);
        const updateQuery = `UPDATE checklist_items SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

        const updatedItemResult = await client.query(updateQuery, values);

        const updatedItem = updatedItemResult.rows[0];
        if (!updatedItem) {
            await client.query('ROLLBACK');
            return null;
        }

        const taskId = updatedItem.task_id;

        // If the item was marked as complete, check if all other items for the task are also complete
        if (completed) {
            const allItemsResult = await client.query(
                'SELECT COUNT(*) as total, SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_count FROM checklist_items WHERE task_id = $1',
                [taskId]
            );
            const counts = allItemsResult.rows[0];
            const total = parseInt(counts.total, 10);
            const completedCount = parseInt(counts.completed_count, 10);

            if (total > 0 && total === completedCount) {
                // All items are completed, update the task's conclusion date
                await client.query(
                    'UPDATE tasks SET conclusion_date = NOW(), status = \'Concluída\' WHERE id = $1',
                    [taskId]
                );
            }
        } else {
            // If an item is unchecked, the task is no longer concluded.
            await client.query(
                'UPDATE tasks SET conclusion_date = NULL, status = \'Em Andamento\' WHERE id = $1',
                [taskId]
            );
        }

        await client.query('COMMIT');
        return {
            id: updatedItem.id,
            text: updatedItem.text,
            completed: updatedItem.completed,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Failed to update checklist item:", error);
        throw error;
    } finally {
        client.release();
    }
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

export async function updateTaskComment(id: string, content: string): Promise<TaskComment | null> {
    const result = await queryOne<any>(
        'UPDATE task_comments SET content = $1 WHERE id = $2 RETURNING id, content, author_id, created_at',
        [content, id]
    );
    if (!result) return null;
    return {
        id: result.id,
        content: result.content,
        authorId: result.author_id,
        createdAt: result.created_at,
    };
}

export async function deleteTaskComment(id: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM task_comments WHERE id = $1', [id]);
    return { success: result.rowCount > 0 };
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

export async function deleteTaskAttachment(attachmentId: string): Promise<{ success: boolean }> {
    const result = await pool.query('DELETE FROM task_attachments WHERE id = $1', [attachmentId]);
    return { success: result.rowCount > 0 };
}

export async function duplicateProject(projectData: any) {
    const { id, ...newProjectData } = projectData;
    const { name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId, participantIds, workbookIds } = newProjectData;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // console.log(`Starting duplication for project ID: ${id}`);

        // 1. Get original tasks before creating the new project
        const originalTasks = await getTasksByProjectId(id);
        // console.log(`Found ${originalTasks.length} tasks to duplicate.`);

        // 2. Create the new project record
        const newProjectId = `prj_${randomBytes(8).toString('hex')}`;
        const projectInsertQuery = `
            INSERT INTO projects (id, name, description, start_date, end_date, status, workspace_id, client_id, opportunity_id, pmo_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const projectResult = await client.query(projectInsertQuery, [newProjectId, name, description, startDate, endDate, status, workspaceId, clientId, opportunityId, pmoId]);
        const newProject = projectResult.rows[0];
        // console.log(`New project created with ID: ${newProject.id}`);

        // 3. Copy participant associations
        if (participantIds && participantIds.length > 0) {
            for (const participantId of participantIds) {
                await client.query('INSERT INTO project_participants (project_id, participant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newProjectId, participantId]);
            }
            // console.log(`Copied ${participantIds.length} participant associations.`);
        }

        // 4. Copy workbook associations
        if (workbookIds && workbookIds.length > 0) {
            for (const workbookId of workbookIds) {
                await client.query('INSERT INTO project_workbooks (project_id, workbook_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newProjectId, workbookId]);
            }
            // console.log(`Copied ${workbookIds.length} workbook associations.`);
        }

        // 5. Create new tasks for the new project
        const newTasks = [];
        for (const task of originalTasks) {
            const newTaskId = `task_${randomBytes(8).toString('hex')}`;
            const { title, description, status, priority, startDate, dueDate, assigneeId, creatorId } = task;
            const taskInsertQuery = `
                INSERT INTO tasks (id, title, description, status, priority, start_date, due_date, assignee_id, project_id, creator_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *;
            `;
            const taskResult = await client.query(taskInsertQuery, [newTaskId, title, description, status, priority, startDate, dueDate, assigneeId, newProjectId, creatorId]);
            newTasks.push(taskResult.rows[0]);
        }
        // console.log(`Successfully created ${newTasks.length} new tasks.`);

        await client.query('COMMIT');
        // console.log('Transaction committed successfully.');

        // 6. Construct the final objects to return
        const finalProject = {
            ...newProject,
            startDate: newProject.start_date,
            endDate: newProject.end_date,
            workspaceId: newProject.workspace_id,
            clientId: newProject.client_id,
            opportunityId: newProject.opportunity_id,
            pmoId: newProject.pmo_id,
            participantIds: participantIds || [],
            workbookIds: workbookIds || [],
        };

        const finalTasks = newTasks.map(t => ({
            ...t,
            startDate: t.start_date,
            dueDate: t.due_date,
            assigneeId: t.assignee_id,
            projectId: t.project_id,
            creationDate: t.creation_date,
            conclusionDate: t.conclusion_date,
            creatorId: t.creator_id,
            comments: [],
            checklist: [],
            attachments: [],
        }));

        return { newProject: finalProject, newTasks: finalTasks };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to duplicate project inside transaction:', error);
        throw new Error(`Failed to duplicate project: ${error instanceof Error ? error.message : 'Unknown database error'}`);
    } finally {
        client.release();
        // console.log('Database client released.');
    }
}
