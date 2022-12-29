import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import { Disposable } from './Disposable';

export class DbContextWebViewProvider extends Disposable {
  private panel: vscode.WebviewPanel | undefined;
  constructor(private readonly extensionUri: vscode.Uri) {
    super();
    // this.render(
    //   'foo',
    //   `erDiagram
    // CountriesTracking {
    // }
    // Country {
    // }
    // DefectStatusCode {
    // }
    // DefectStatusCodesTracking {
    // }
    // EventType {
    // }
    // EventTypesTracking {
    // }
    // FuelType {
    // }
    // FuelTypesTracking {
    // }
    // FuelUnit {
    // }
    // FuelUnitsTracking {
    // }
    // JobCategoriesTracking {
    // }
    // JobCategory {
    // }
    // JobPartUnit {
    // }
    // JobPartUnitsTracking {
    // }
    // JobReason {
    // }
    // JobReasonsTracking {
    // }
    // JobServiceType {
    // }
    // JobServiceTypesTracking {
    // }
    // JobStatusCode {
    // }
    // JobStatusCodesTracking {
    // }
    // Locale {
    // }
    // LocalesTracking {
    // }
    // RecurrencePattern {
    // }
    // RecurrencePatternsTracking {
    // }
    // RecurrenceType {
    // }
    // RecurrenceTypesTracking {
    // }
    // ScopeInfo {
    // }
    // ScopeInfoClient {
    // }
    // ServiceContractStatus {
    // }
    // ServiceContractStatusesTracking {
    // }
    // SeveritiesTracking {
    // }
    // Severity {
    // }
    // SupplierType {
    // }
    // SupplierTypesTracking {
    // }
    // Theme {
    // }
    // ThemesTracking {
    // }
    // UserStatus {
    // }
    // UserStatusesTracking {
    // }
    // VehicleBodyType {
    // }
    // VehicleBodyTypesTracking {
    // }
    // VehicleDerivative {
    // }
    // VehicleDerivative }o--|| VehicleBodyType : FK_VehicleDerivatives_VehicleBodyTypes_BodyTypeId
    // VehicleDerivative }o--o| FuelType : FK_VehicleDerivatives_FuelTypes_FuelType2Id
    // VehicleDerivative }o--|| FuelType : FK_VehicleDerivatives_FuelTypes_FuelTypeId
    // VehicleDerivative }o--|| VehicleTransmissionType : FK_VehicleDerivatives_VehicleTransmissionTypes_TransmissionTypeId
    // VehicleDerivative }o--|| VehicleModel : FK_VehicleDerivatives_VehicleModels_VehicleModelId
    // VehicleDerivative }o--|| VehicleType : FK_VehicleDerivatives_VehicleTypes_VehicleTypeId
    // VehicleDerivativesTracking {
    // }
    // VehicleDiaryEventType {
    // }
    // VehicleDiaryEventTypesTracking {
    // }
    // VehicleDisposalMethod {
    // }
    // VehicleDisposalMethodsTracking {
    // }
    // VehicleDisposalReason {
    // }
    // VehicleDisposalReasonsTracking {
    // }
    // VehicleExpenseType {
    // }
    // VehicleExpenseTypesTracking {
    // }
    // VehicleManufacturer {
    // }
    // VehicleManufacturersTracking {
    // }
    // VehicleModel {
    // }
    // VehicleModel }o--|| VehicleManufacturer : FK_VehicleModels_VehicleManufacturers_ManufacturerId
    // VehicleModelsTracking {
    // }
    // VehicleOdometerType {
    // }
    // VehicleOdometerTypesTracking {
    // }
    // VehicleStatus {
    // }
    // VehicleStatusesTracking {
    // }
    // VehicleSupplyMethod {
    // }
    // VehicleSupplyMethodsTracking {
    // }
    // VehicleTransmissionType {
    // }
    // VehicleTransmissionTypesTracking {
    // }
    // VehicleType {
    // }
    // VehicleTypesTracking {
    // }`.trim(),
    // );
  }

  public render(dbContext: string, mermaidContent: string) {
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        `${EXTENSION_NAMESPACE}-dbcontext`,
        'Entity Relationship Diagram',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        },
      );
      this.subscriptions.push(this.panel);
      this.setWebviewMessageListener(this.panel.webview);
    }

    const activeTheme = vscode.window.activeColorTheme;
    const mermaidTheme =
      activeTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'default';

    this.panel.webview.html = getWebviewContent(
      dbContext,
      this.panel.webview,
      this.extensionUri,
      mermaidContent,
      mermaidTheme,
    );
  }

  private setWebviewMessageListener(webview: vscode.Webview) {
    this.subscriptions.push(
      webview.onDidReceiveMessage(async (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case 'exportSvg':
            const doc = await vscode.workspace.openTextDocument({
              language: 'xml',
              content: text,
            });
            await vscode.window.showTextDocument(doc, { preview: false });
            return;
        }
      }),
    );
  }
}

export function getUri(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  pathList: string[],
) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

function getWebviewContent(
  dbContext: string,
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  mermaidContent: string,
  mermaidTheme: 'dark' | 'default',
) {
  const stylesUri = getUri(webview, extensionUri, [
    'webview-ui',
    'build',
    'assets',
    'index.css',
  ]);
  const scriptUri = getUri(webview, extensionUri, [
    'webview-ui',
    'build',
    'assets',
    'index.js',
  ]);

  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="${stylesUri}">
        <title>ER Diagram</title>
      </head>
      <body>
        <script>
          window['mermaidContent'] = \`${mermaidContent}\`;
          window['mermaidTheme'] = '${mermaidTheme}';
        </script>
        <div id="root"></div>
        <script type="module" src="${scriptUri}"></script>
      </body>
    </html>
   `;
}
