# vscode-entity-framework

A VS Code extension to manage Entity Framework migrations.

## Features

- List dbcontexts for all projects within a solution
- Add/remove migrations

## Requirements

- [dotnet sdk](https://dotnet.microsoft.com/download)
- A solution (`.sln`) file with projects is required

## Performance

The EF tools have to execute application code at design time to get information about the project, thus performance can be slow on large projects.

## Extension Settings

This extension contributes the following settings:

- `entityframework.env`: Custom environment vars
- `entityframework.commands`: Custom commands, for example:
  ```json
  {
    "entityframework.commands": {
      "addMigration": [
        "dotnet",
        "ef",
        "migrations",
        "add",
        "\"$migrationName\"",
        "--project",
        "\"$project\"",
        "--startup-project",
        "\"$project\"",
        "--context",
        "\"$dbcontext\""
      ],
      "removeMigration": [
        "dotnet",
        "ef",
        "migrations",
        "remove",
        "--project",
        "\"$project\"",
        "--startup-project",
        "\"$project\"",
        "--context",
        "\"$dbcontext\""
      ],
      "runMigration": [
        "dotnet",
        "ef",
        "database",
        "update",
        "--project",
        "\"$project\"",
        "--startup-project",
        "\"$project\"",
        "--context",
        "\"$dbcontext\"",
        "\"$migrationId\""
      ],
      "generateScript": [
        "dotnet",
        "ef",
        "dbcontext",
        "script",
        "--project",
        "\"$project\"",
        "--context",
        "\"$dbcontext\""
      ]
    }
  }
  ```
