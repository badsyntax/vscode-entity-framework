import type { TreeItem, ViewSection } from 'wdio-vscode-service';

describe('Entity Framework Extension', function () {
  this.retries(2);

  describe('Tree View', () => {
    let treeView: ViewSection | undefined;
    beforeEach(async () => {
      const workbench = await browser.getWorkbench();

      await browser.waitUntil(async () => {
        const viewControls = await workbench
          .getSideBar()
          .getContent()
          .getSections();
        return (
          await Promise.all(
            viewControls.map(vc => vc.getTitle().then(t => t.toUpperCase())),
          )
        ).includes('ENTITY FRAMEWORK');
      });

      treeView = await workbench
        .getSideBar()
        .getContent()
        .getSection('ENTITY FRAMEWORK');

      await treeView!.expand();

      await browser.waitUntil(async () => {
        const items = await treeView!.getVisibleItems();
        return items.length > 0;
      });
    });

    it('should render projects', async () => {
      const [projectItem] = await treeView!.getVisibleItems();
      const projectItemLabel = await (projectItem as TreeItem).getLabel();
      expect(projectItemLabel).toBe('ExampleAPI');
    });

    it('should render db contexts', async () => {
      const [projectItem] = await treeView!.getVisibleItems();
      await (projectItem as TreeItem).expand();

      await browser.waitUntil(async () => {
        const [, dbContextItem] = await treeView!.getVisibleItems();
        return dbContextItem !== undefined;
      });

      const [, dbContextItem] = await treeView!.getVisibleItems();

      const dbContextLabel = await (dbContextItem as TreeItem).getLabel();

      expect(dbContextLabel).toBe('BloggingContext');
    });

    it('should render migrations', async () => {
      const [projectItem] = await treeView!.getVisibleItems();
      await (projectItem as TreeItem).expand();

      await browser.waitUntil(async () => {
        const [, dbContextItem] = await treeView!.getVisibleItems();
        return dbContextItem !== undefined;
      });

      const [, dbContextItem] = await treeView!.getVisibleItems();
      await (dbContextItem as TreeItem).expand();

      await browser.waitUntil(async () => {
        const [, , migrationOneItem] = await treeView!.getVisibleItems();
        return migrationOneItem !== undefined;
      });

      const [, , migrationOneItem, migrationTwoItem] =
        await treeView!.getVisibleItems();

      const migrationOneLabel = await (migrationOneItem as TreeItem).getLabel();
      const migrationTwoLabel = await (migrationTwoItem as TreeItem).getLabel();

      expect(migrationOneLabel).toBe('InitialSchema');
      expect(migrationTwoLabel).toBe('NewMigration');
    });
  });
});
