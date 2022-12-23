export type TerminalCommand = keyof typeof defaultTerminalCommands;

export const defaultTerminalCommands = {
  addMigration: [
    'dotnet',
    'ef',
    'migrations',
    'add',
    '"$migrationName"',
    '--project',
    '"$project"',
    '--startup-project',
    '"$project"',
    '--context',
    '"$dbcontext"',
  ],
  removeMigration: [
    'dotnet',
    'ef',
    'migrations',
    'remove',
    '--project',
    '"$project"',
    '--startup-project',
    '"$project"',
    '--context',
    '"$dbcontext"',
  ],
  generateScript: [
    'dotnet',
    'ef',
    'dbcontext',
    'script',
    '--project',
    '"$project"',
    '--context',
    '"$dbcontext"',
  ],
};
