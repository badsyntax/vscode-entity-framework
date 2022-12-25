import path from 'path';

type IconPath = { light: string; dark: string };

function getFileIconPath(filename: string): string {
  return path.join(__dirname, '..', 'icons', filename);
}

export function getIconPath(
  lightFilename: string,
  darkFilename?: string,
): IconPath {
  return {
    light: getFileIconPath(lightFilename),
    dark: getFileIconPath(darkFilename ? darkFilename : lightFilename),
  };
}
