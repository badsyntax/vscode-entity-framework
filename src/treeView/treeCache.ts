import { dbContextsCache } from './DbContextTreeItem';
import { projectsCache } from './ProjectTreeItem';

export function clearTreeCache() {
  dbContextsCache.clearAll();
  projectsCache.clearAll();
}
