import { ManageProjectDialog } from '@/components/projects/manage-project-dialog';
import type { ReactNode } from 'react';

// This component is now a simple wrapper around ManageProjectDialog
export function AddProjectDialog({ children }: { children: ReactNode }) {
  return <ManageProjectDialog>{children}</ManageProjectDialog>;
}
