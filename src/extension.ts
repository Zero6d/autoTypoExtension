import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

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
          const currentFilePath = document.fileName;
          const currentDirectoryPath = path.dirname(currentFilePath);

          const currentFileName = path.basename(
            document.fileName,
            path.extname(document.fileName)
          );
          const regex = /(<Typography[^>]*>)([^<]+)(<\/Typography>)/gi;
          let match;
          let count = 1;

          // Create an object to store the original text and the new text
          const textMap: { [key: string]: string } = {};

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
              const originalText = content.trim();

              // Store the original text and the new text in the object
              textMap[`${currentFileName}_${count - 1}`] = originalText;

              editBuilder.replace(range, newText);
            }
          }

          // Create a JSON file with the text map
          const jsonFilePath = path.join(currentDirectoryPath, "textMap.json");
          fs.writeFileSync(jsonFilePath, JSON.stringify(textMap));
        })
        .then(() => {
          vscode.window.showInformationMessage(
            "Typography tags updated and text map created!"
          );
        });
    }
  );

  context.subscriptions.push(disposable);
}
