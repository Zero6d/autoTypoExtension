import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.autoFillTypography",
    () => {
      vscode.window.activeTextEditor
        ?.edit((editBuilder) => {
          const document = vscode.window.activeTextEditor?.document;

          if (!document) {
            return;
          }

          const currentFileName = path.basename(
            document.fileName,
            path.extname(document.fileName)
          );
          const regex = /(<Typography[^>]*>)([^<]+)(<\/Typography>)/gi;
          let match;
          let count = 1;

          while ((match = regex.exec(document.getText()))) {
            const [, openingTag, content, closingTag] = match;

            if (content && content.trim()) {
              const newText =
                openingTag +
                `{i18n.t('${currentFileName}_${count++}')}` +
                closingTag;
              const startIndex = match.index;
              const endIndex = startIndex + match[0].length;
              const range = new vscode.Range(
                document.positionAt(startIndex),
                document.positionAt(endIndex)
              );
              editBuilder.replace(range, newText);
            }
          }
        })
        .then(() => {
          vscode.window.showInformationMessage("Typography tags updated!");
        });
    }
  );

  context.subscriptions.push(disposable);
}
