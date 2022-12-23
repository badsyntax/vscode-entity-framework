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

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `entityframework.env`: Custom environment vars
