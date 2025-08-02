export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing React when only used for JSX with new JSX transform',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      noReactImport: "React import is not needed when only used for JSX with the new JSX transform. Remove this import.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();
    let reactImportNode = null;
    let reactIsUsedOutsideJSX = false;
    
    return {
      ImportDeclaration(node) {
        // Check if this is importing 'react' as default
        if (node.source.value === 'react') {
          const hasDefaultReactImport = node.specifiers.some(
            (spec) =>
              spec.type === 'ImportDefaultSpecifier' &&
              spec.local.name === 'React'
          );

          if (hasDefaultReactImport) {
            reactImportNode = node;
          }
        }
      },
      
      // Check for React usage outside of JSX
      MemberExpression(node) {
        if (node.object.name === 'React') {
          reactIsUsedOutsideJSX = true;
        }
      },
      
      TSTypeReference(node) {
        // Check for React.FC, React.ReactNode, etc. in TypeScript
        if (node.typeName.type === 'TSQualifiedName' && 
            node.typeName.left.name === 'React') {
          reactIsUsedOutsideJSX = true;
        }
      },
      
      'Program:exit'() {
        // At the end of the file, check if React was imported but not used outside JSX
        if (reactImportNode && !reactIsUsedOutsideJSX) {
          context.report({
            node: reactImportNode,
            messageId: 'noReactImport',
            fix(fixer) {
              // Get the full line including newline
              const startLine = reactImportNode.loc.start.line;
              const endLine = reactImportNode.loc.end.line;
              const startIndex = sourceCode.getIndexFromLoc({ line: startLine, column: 0 });
              const endIndex = sourceCode.getIndexFromLoc({ line: endLine + 1, column: 0 });
              
              return fixer.removeRange([startIndex, endIndex]);
            },
          });
        }
      }
    };
  },
};