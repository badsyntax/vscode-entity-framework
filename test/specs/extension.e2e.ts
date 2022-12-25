import type { ViewSection } from 'wdio-vscode-service';

describe('Entity Framework Extension', () => {
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
        ).includes('EF MIGRATIONS');
      });

      treeView = await workbench
        .getSideBar()
        .getContent()
        .getSection('EF MIGRATIONS');

      await treeView.expand();

      await browser.waitUntil(async () => {
        const items = await treeView.getVisibleItems();
        return items.length > 0;
      });
    });

    it('should render projects', async () => {
      const [projectItem] = await treeView.getVisibleItems();
      // @ts-ignore
      const projectItemLabel = await projectItem.getLabel();
      expect(projectItemLabel).toBe('ExampleAPI');
    });

    it('should render db contexts', async () => {
      const [projectItem] = await treeView.getVisibleItems();
      // @ts-ignore
      await projectItem.expand();

      await browser.waitUntil(async () => {
        const [, dbContextItem] = await treeView.getVisibleItems();
        return dbContextItem !== undefined;
      });

      const [, dbContextItem] = await treeView.getVisibleItems();

      // @ts-ignore
      const dbContextLabel = await dbContextItem.getLabel();

      expect(dbContextLabel).toBe('BloggingContext');
    });

    it('should render migrations', async () => {
      const [projectItem] = await treeView.getVisibleItems();
      // @ts-ignore
      await projectItem.expand();

      await browser.waitUntil(async () => {
        const [, dbContextItem] = await treeView.getVisibleItems();
        return dbContextItem !== undefined;
      });

      const [, dbContextItem] = await treeView.getVisibleItems();
      // @ts-ignore
      await dbContextItem.expand();

      await browser.waitUntil(async () => {
        const [, , migrationOneItem] = await treeView.getVisibleItems();
        return migrationOneItem !== undefined;
      });

      const [, , migrationOneItem, migrationTwoItem] =
        await treeView.getVisibleItems();

      // @ts-ignore
      const migrationOneLabel = await migrationOneItem.getLabel();
      // @ts-ignore
      const migrationTwoLabel = await migrationTwoItem.getLabel();

      expect(migrationOneLabel).toBe('InitialSchema');
      expect(migrationTwoLabel).toBe('NewMigration');
    });
  });
});
