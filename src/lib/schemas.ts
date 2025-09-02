import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required." }),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  workspaceId: z.string().min(1, { message: "Workspace ID is required." }),
  clientId: z.string().optional(),
  opportunityId: z.string().optional(),
  pmoId: z.string().optional(),
  participantIds: z.array(z.string()).optional().default([]),
});

export const partialProjectSchema = projectSchema.partial();

export const workspaceSchema = z.object({
  name: z.string().min(1, { message: "Workspace name is required." }),
  description: z.string().optional(),
  clientId: z.string().optional(),
});

export const partialWorkspaceSchema = workspaceSchema.partial();

export const taskSchema = z.object({
  title: z.string().min(1, { message: "Task title is required." }),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().min(1, { message: "Project ID is required." }),
});

export const partialTaskSchema = taskSchema.partial();

export const clientSchema = z.object({
  name: z.string().min(1, { message: "Client name is required." }),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  suportewebCode: z.string().optional(),
});

export const partialClientSchema = clientSchema.partial();

export const opportunitySchema = z.object({
  name: z.string().min(1, { message: "Opportunity name is required." }),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  status: z.string().min(1, { message: "Status is required." }),
  value: z.number().optional(),
  clientId: z.string().optional(),
  ownerId: z.string().optional(),
});

export const partialOpportunitySchema = opportunitySchema.partial();

export const participantSchema = z.object({
  name: z.string().min(1, { message: "Participant name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  roleId: z.string().min(1, { message: "Role ID is required." }),
  avatar: z.string().optional(),
});

// For updates, password is optional
export const partialParticipantSchema = participantSchema.partial().extend({
    password: z.string().min(6).optional().or(z.literal('')),
});

export const roleSchema = z.object({
  id: z.string().optional(), // Optional for creation, as it can be derived from name
  name: z.string().min(1, { message: "Role name is required." }),
  permissions: z.array(z.string()).optional().default([]),
});

export const partialRoleSchema = roleSchema.partial();
