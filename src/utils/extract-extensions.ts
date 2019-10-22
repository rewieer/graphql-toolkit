import { DocumentNode, Source, GraphQLSchema, parse, visit, Kind, isSchema } from 'graphql';

function isSource(input: any): input is Source {
  return input instanceof Source;
}

function isDocumentNode(input: any): input is DocumentNode {
  return input.kind === 'Document';
}

export function extractExtensions(input: GraphQLSchema | DocumentNode | Source | string): DocumentNode | never {
  let doc: DocumentNode;

  if (isDocumentNode(input)) {
    doc = input;
  } else if (isSource(input)) {
    doc = parse(input);
  } else if (typeof input === 'string') {
    doc = parse(input);
  } else if (isSchema(input)) {
    if (!input.astNode) {
      throw new Error('GraphQLSchema has no astNode');
    }

    doc = {
      kind: 'Document',
      definitions: input.extensionASTNodes ? [input.astNode, ...input.extensionASTNodes] : [input.astNode],
    };
  } else {
    throw new Error('Only GraphQLSchema, DocumentNode, Source and string are accepted');
  }

  const exclude = [Kind.SCALAR_TYPE_DEFINITION, Kind.OBJECT_TYPE_DEFINITION, Kind.INTERFACE_TYPE_DEFINITION, Kind.UNION_TYPE_DEFINITION, Kind.ENUM_TYPE_DEFINITION, Kind.DIRECTIVE_DEFINITION];

  return visit(
    doc,
    exclude.reduce((visitor, kind) => {
      visitor[kind] = (): null => null;
      return visitor;
    }, {})
  );
}
