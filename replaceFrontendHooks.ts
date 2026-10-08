import { Project, SyntaxKind } from "ts-morph";
import * as path from "path";

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});

const sourceFiles = [
  ...project.getSourceFiles("src/components/admin/**/*.{ts,tsx}"),
  ...project.getSourceFiles("src/components/designer/**/*.{ts,tsx}"),
  ...project.getSourceFiles("src/components/sales/**/*.{ts,tsx}")
];

for (const sourceFile of sourceFiles) {
  let fileModified = false;

  const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  for (const callExpr of callExpressions) {
    const expr = callExpr.getExpression();
    if (expr.getKind() === SyntaxKind.Identifier) {
      const name = expr.getText();
      if (name === "useQuery" || name === "useMutation" || name === "useAction") {
        
        // Ensure it has `api.` argument to avoid replacing generic hooks by accident, though it's safe.
        const args = callExpr.getArguments();
        if (args.length > 0 && args[0].getText().startsWith("api.")) {
            
          const newName = name.replace("use", "useStaff");
          expr.replaceWithText(newName);
          fileModified = true;
          
          // If useQuery had `staffToken` already, strip it because useStaffQuery injects it
          // Or wait, it doesn't have it because we reset the frontend!
        }
      }
    }
  }

  if (fileModified) {
    // Add import
    const relPath = path.relative(path.dirname(sourceFile.getFilePath()), project.getSourceFile("src/hooks/useStaffAuth.tsx")!.getFilePath());
    let importPath = relPath.replace(/\.tsx?$/, "");
    if (!importPath.startsWith(".")) importPath = "./" + importPath;
    
    sourceFile.addImportDeclaration({
      namedImports: ["useStaffQuery", "useStaffMutation", "useStaffAction"],
      moduleSpecifier: importPath
    });

    // Remove old imports if unused? Optional, tsc handles it ok if unused, or we can just leave it.

    sourceFile.saveSync();
    console.log(`Modified ${sourceFile.getBaseName()}`);
  }
}
