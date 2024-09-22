import { dbContextsCache } from './DbContextTreeItem';
import { projectsCache } from './ProjectTreeItem';
import { treeDataProviderCache } from './TreeDataProvider';

export function clearTreeCache() {
  dbContextsCache.clearAll();
  projectsCache.clearAll();
  treeDataProviderCache.clearAll();
}
