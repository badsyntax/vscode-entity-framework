declare module 'vs-parse' {
  type Package = {
    name: string;
    targetFramework?: string;
    version: string;
  };
  type Project = {
    codeFiles: string[];
    id?: string;
    name?: string;
    packages?: Package[];
    projectTypeId?: string;
    relativePath?: string;
  };
  type Solution = {
    fileFormatVersion: string;
    visualStudioVersion: string;
    minimumVisualStudioVersion: string;
    projects: Project[];
  };
  export function parseSolution(
    path: string,
    opts?: {
      deepParse: boolean;
    },
  ): Promise<Solution>;
  export function parseProject(
    path: string,
    opts?: {
      deepParse: boolean;
    },
  ): Promise<Project>;
}
