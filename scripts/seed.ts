import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {
  initialRoles,
  initialParticipants,
  initialCompanyInfo,
  initialClients,
  initialWorkspaces,
  initialOpportunities,
  initialProjectTemplates,
  initialProjects,
  initialTasks
} from '../src/lib/data';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const saltRounds = 10;

async function main() {
  const client = await pool.connect();

  try {
    console.log('Start seeding...');
    await client.query('BEGIN');

    // Seed Company Info
    await client.query(
      `INSERT INTO company_info (name, cnpj, address, suporteweb_code, logo_url) VALUES ($1, $2, $3, $4, $5)`,
      [initialCompanyInfo.name, initialCompanyInfo.cnpj, initialCompanyInfo.address, initialCompanyInfo.suportewebCode, initialCompanyInfo.logoUrl]
    );
    console.log('Seeded company_info');

    // Seed Roles
    for (const role of initialRoles) {
      await client.query(
        `INSERT INTO roles (id, name, permissions) VALUES ($1, $2, $3)`,
        [role.id, role.name, role.permissions]
      );
    }
    console.log('Seeded roles');

    // Seed Participants (Users)
    for (const p of initialParticipants) {
      const hashedPassword = await bcrypt.hash(p.password!, saltRounds);
      await client.query(
        `INSERT INTO participants (id, name, email, password_hash, role_id, avatar) VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.id, p.name, p.email, hashedPassword, p.roleId, p.avatar]
      );
    }
    console.log('Seeded participants');

    // Seed Clients
    for (const clientData of initialClients) {
        await client.query(
            `INSERT INTO clients (id, name, email, company, avatar, cnpj, address, suporteweb_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [clientData.id, clientData.name, clientData.email, clientData.company, clientData.avatar, clientData.cnpj, clientData.address, clientData.suportewebCode]
        );
    }
    console.log('Seeded clients');

    // Seed Workspaces
    for (const ws of initialWorkspaces) {
        await client.query(
            `INSERT INTO workspaces (id, name, description, client_id) VALUES ($1, $2, $3, $4)`,
            [ws.id, ws.name, ws.description, ws.clientId]
        );
    }
    console.log('Seeded workspaces');

    // Seed Opportunities
    for (const opp of initialOpportunities) {
        await client.query(
            `INSERT INTO opportunities (id, name, contact_name, email, company, description, status, created_at, phone, value, owner_id, client_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [opp.id, opp.name, opp.contactName, opp.email, opp.company, opp.description, opp.status, opp.createdAt, opp.phone, opp.value, opp.ownerId, opp.clientId]
        );
    }
    console.log('Seeded opportunities');

    // Seed Project Templates
    for (const template of initialProjectTemplates) {
        await client.query(
            `INSERT INTO project_templates (id, name, description) VALUES ($1, $2, $3)`,
            [template.id, template.name, template.description]
        );
        for (const task of template.tasks) {
            await client.query(
                `INSERT INTO template_tasks (template_id, title, description, priority, due_day_offset) VALUES ($1, $2, $3, $4, $5)`,
                [template.id, task.title, task.description, task.priority, task.dueDayOffset]
            );
        }
    }
    console.log('Seeded project_templates and template_tasks');

    // Seed Projects and Project Participants
    for (const project of initialProjects) {
        await client.query(
            `INSERT INTO projects (id, name, description, start_date, end_date, status, workspace_id, client_id, pmo_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [project.id, project.name, project.description, project.startDate, project.endDate, project.status, project.workspaceId, project.clientId, project.pmoId]
        );
        for (const participantId of project.participantIds) {
            await client.query(
                `INSERT INTO project_participants (project_id, participant_id) VALUES ($1, $2)`,
                [project.id, participantId]
            );
        }
    }
    console.log('Seeded projects and project_participants');

    // Seed Tasks
    for (const task of initialTasks) {
        await client.query(
            `INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, assignee_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [task.id, task.projectId, task.title, task.description, task.status, task.priority, task.dueDate, task.assigneeId]
        );
        // Note: Seeding task comments, attachments, and checklist is skipped for brevity, but would be done here.
    }
    console.log('Seeded tasks');


    await client.query('COMMIT');
    console.log('Seeding completed successfully.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('An unexpected error occurred:', err);
  process.exit(1);
});
