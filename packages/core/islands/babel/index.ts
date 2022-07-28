import * as babel from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

type ImportHook = Map<string, t.Identifier>;

function getHookIdentifier(
  hooks: ImportHook,
  path: NodePath,
  name: string,
  source = 'solid-js',
): t.Identifier {
  const current = hooks.get(name);
  if (current) {
    return current;
  }
  const newID = addNamed(path, name, source);
  hooks.set(name, newID);
  return newID;
}

function createStrategy(type: string, attr?: t.JSXAttribute) {
  if (!attr) {
    return t.objectExpression([
      t.objectProperty(t.identifier('type'), t.stringLiteral(type)),
    ]);
  }
  let expression: t.Expression;
  if (t.isExpression(attr.value)) {
    expression = attr.value;
  } else if (
    t.isJSXExpressionContainer(attr.value)
    && t.isExpression(attr.value.expression)
  ) {
    expression = attr.value.expression;
  } else {
    expression = t.booleanLiteral(true);
  }
  return t.objectExpression([
    t.objectProperty(t.identifier('type'), t.stringLiteral(type)),
    t.objectProperty(t.identifier('value'), expression),
  ]);
}

function transformServerComponent(programPath: NodePath<t.Program>): void {
  const validIdentifiers = new Set();
  const hooks: ImportHook = new Map();
  programPath.traverse({
    ImportDeclaration(path) {
      if (/client(\.[tj]sx?)?$/.test(path.node.source.value)) {
        for (let i = 0, len = path.node.specifiers.length; i < len; i += 1) {
          const specifier = path.node.specifiers[i];
          if (t.isImportDefaultSpecifier(specifier)) {
            validIdentifiers.add(specifier.local);
          }
        }
      }
    },
    JSXElement(path) {
      const opening = path.node.openingElement;
      if (t.isJSXIdentifier(opening.name)) {
        const binding = path.scope.getBinding(opening.name.name);
        if (
          binding
          && validIdentifiers.has(binding.identifier)
        ) {
          const properties: (t.ObjectProperty | t.SpreadElement)[] = [];

          let strategy: t.Expression = t.identifier('undefined');
          let hydratable = true;
          for (let i = 0, len = opening.attributes.length; i < len; i += 1) {
            const attr = opening.attributes[i];
            if (t.isJSXAttribute(attr)) {
              let property: t.Expression;
              let computed = false;
              if (t.isJSXNamespacedName(attr.name)) {
                if (attr.name.namespace.name === 'client') {
                  switch (attr.name.name.name) {
                    case 'load':
                    case 'visible':
                    case 'idle':
                    case 'animation-frame':
                      strategy = createStrategy(attr.name.name.name);
                      break;
                    case 'media':
                    case 'delay':
                    case 'hover':
                    case 'ready-state':
                      strategy = createStrategy(attr.name.name.name, attr);
                      break;
                    case 'only':
                      hydratable = false;
                      break;
                    default:
                      break;
                  }
                  // eslint-disable-next-line no-continue
                  continue;
                } else {
                  property = t.stringLiteral(`${attr.name.namespace.name}:${attr.name.name.name}`);
                  computed = true;
                }
              } else {
                property = t.stringLiteral(attr.name.name);
              }
              let value: t.Expression;
              if (attr.value) {
                if (t.isJSXExpressionContainer(attr.value)) {
                  if (t.isExpression(attr.value.expression)) {
                    value = attr.value.expression;
                  } else {
                    value = t.booleanLiteral(true);
                  }
                } else {
                  value = attr.value;
                }
              } else {
                value = t.booleanLiteral(true);
              }
              properties.push(t.objectProperty(
                property,
                value,
                computed,
              ));
            } else {
              properties.push(t.spreadElement(
                attr.argument,
              ));
            }
          }

          const ClientID = getHookIdentifier(hooks, path, 'Client', 'rigidity/islands-server');
          path.replaceWith(
            t.jsxElement(
              t.jsxOpeningElement(
                t.jsxIdentifier(ClientID.name),
                [
                  t.jsxAttribute(
                    t.jsxIdentifier('Comp'),
                    t.jsxExpressionContainer(binding.identifier),
                  ),
                  t.jsxAttribute(
                    t.jsxIdentifier('props'),
                    t.jsxExpressionContainer(t.objectExpression(properties)),
                  ),
                  t.jsxAttribute(
                    t.jsxIdentifier('hydratable'),
                    t.jsxExpressionContainer(t.booleanLiteral(hydratable)),
                  ),
                  t.jsxAttribute(
                    t.jsxIdentifier('strategy'),
                    t.jsxExpressionContainer(strategy),
                  ),
                ],
              ),
              path.node.closingElement = t.jsxClosingElement(
                t.jsxIdentifier(ClientID.name),
              ),
              path.node.children,
            ),
          );
        }
      }
    },
  });
}

function transformClientComponent(
  programPath: NodePath<t.Program>,
  source: string,
) {
  programPath.traverse({
    ExportDefaultDeclaration(path) {
      const { node } = path;
      const { declaration } = node;
      if (t.isFunctionDeclaration(declaration)) {
        declaration.type = 'FunctionExpression';
      }
      node.declaration = t.callExpression(
        t.memberExpression(
          t.identifier('Object'),
          t.identifier('assign'),
        ),
        [
          declaration as t.Expression,
          t.objectExpression([
            t.objectProperty(
              t.identifier('src'),
              t.stringLiteral(source),
            ),
          ]),
        ],
      );
    },
  });
}

interface State extends babel.PluginPass {
  opts: {
    source?: string;
  };
}

export default function islandsPlugin(): babel.PluginObj<State> {
  return {
    name: 'rigidity:islands',
    visitor: {
      Program(programPath, state) {
        if (state.opts.source) {
          transformClientComponent(programPath, state.opts.source);
        } else {
          transformServerComponent(programPath);
        }
      },
    },
  };
}
