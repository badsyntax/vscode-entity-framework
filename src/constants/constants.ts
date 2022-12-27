export const EXTENSION_NAMESPACE = 'entityframework';

export const TERMINAL_NAME = 'ef-migrations';

export const OUTPUT_CHANNEL_ID = 'Entity Framework Migrations';

// https://learn.microsoft.com/en-us/ef/core/providers
export const DEFAULT_EFCORE_PROVIDERS = [
  'Microsoft.EntityFrameworkCore.SqlServer',
  'Microsoft.EntityFrameworkCore.Sqlite',
  'Microsoft.EntityFrameworkCore.InMemory',
  'Microsoft.EntityFrameworkCore.Cosmos',
  'Npgsql.EntityFrameworkCore.PostgreSQL',
  'Pomelo.EntityFrameworkCore.MySql',
  'MySql.EntityFrameworkCore',
  'Oracle.EntityFrameworkCore',
  'Devart.Data.MySql.EFCore',
  'Devart.Data.Oracle.EFCore',
  'Devart.Data.PostgreSql.EFCore',
  'Devart.Data.SQLite.EFCore',
  'FirebirdSql.EntityFrameworkCore.Firebird',
  'IBM.EntityFrameworkCore',
  'IBM.EntityFrameworkCore-lnx',
  'IBM.EntityFrameworkCore-osx',
  'EntityFrameworkCore.Jet',
  'Teradata.EntityFrameworkCore',
  'Google.Cloud.EntityFrameworkCore.Spanner',
  'FileContextCore',
  'EntityFrameworkCore.SqlServerCompact35',
  'EntityFrameworkCore.SqlServerCompact40',
  'EntityFrameworkCore.OpenEdge',
];
