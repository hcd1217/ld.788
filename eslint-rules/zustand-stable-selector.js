/**
 * ESLint rule to detect unstable references in Zustand selectors
 * Prevents infinite loops caused by creating new objects/arrays in selectors
 */

export const zustandStableSelector = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure Zustand selectors return stable references',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      unstableEmptyObject: 'Avoid creating new empty objects in Zustand selectors. Use a constant outside the component.',
      unstableEmptyArray: 'Avoid creating new empty arrays in Zustand selectors. Use a constant outside the component.',
      unstableArrayMethod: 'Array method "{{method}}" creates a new reference in selector. Consider using useMemo or moving the transformation outside the selector.',
      unstableObjectSpread: 'Object spread creates a new reference in selector. Consider using useMemo or moving the transformation outside the selector.',
      unstableObjectCreate: 'Object.{{method}} creates a new reference in selector. Consider using useMemo or moving the transformation outside the selector.',
    },
  },
  create(context) {
    function checkSelector(node) {
      // Check if this is a Zustand store call
      if (
        node.callee.type === 'Identifier' &&
        node.callee.name.match(/use\w*Store$/)
      ) {
        const selectorArg = node.arguments[0];
        if (selectorArg && selectorArg.type === 'ArrowFunctionExpression') {
          checkSelectorBody(selectorArg.body);
        }
      }
    }

    function checkSelectorBody(body) {
      // Handle both expression and block statement bodies
      const expression = body.type === 'BlockStatement' 
        ? body.body.find(stmt => stmt.type === 'ReturnStatement')?.argument
        : body;

      if (!expression) return;

      checkExpression(expression);
    }

    function checkExpression(node) {
      if (!node) return;

      // Check for || {} or || []
      if (node.type === 'LogicalExpression' && node.operator === '||') {
        if (node.right.type === 'ObjectExpression' && node.right.properties.length === 0) {
          context.report({
            node: node.right,
            messageId: 'unstableEmptyObject',
          });
        }
        if (node.right.type === 'ArrayExpression' && node.right.elements.length === 0) {
          context.report({
            node: node.right,
            messageId: 'unstableEmptyArray',
          });
        }
      }

      // Check for array methods
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        ['map', 'filter', 'reduce', 'concat', 'slice', 'sort', 'reverse'].includes(
          node.callee.property.name
        )
      ) {
        context.report({
          node,
          messageId: 'unstableArrayMethod',
          data: { method: node.callee.property.name },
        });
      }

      // Check for object spread
      if (node.type === 'ObjectExpression') {
        const hasSpread = node.properties.some(
          prop => prop.type === 'SpreadElement'
        );
        if (hasSpread) {
          context.report({
            node,
            messageId: 'unstableObjectSpread',
          });
        }
      }

      // Check for Object.assign or Object.create
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'Object' &&
        ['assign', 'create'].includes(node.callee.property.name)
      ) {
        context.report({
          node,
          messageId: 'unstableObjectCreate',
          data: { method: node.callee.property.name },
        });
      }

      // Recursively check nested expressions
      if (node.type === 'ConditionalExpression') {
        checkExpression(node.consequent);
        checkExpression(node.alternate);
      }
      if (node.type === 'LogicalExpression') {
        checkExpression(node.left);
        // We already checked the right side for || {} above
        if (node.operator !== '||' || 
            (node.right.type !== 'ObjectExpression' && node.right.type !== 'ArrayExpression')) {
          checkExpression(node.right);
        }
      }
    }

    return {
      CallExpression: checkSelector,
    };
  },
};

export default zustandStableSelector;