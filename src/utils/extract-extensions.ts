import { DocumentNode, Source, parse, visit, Kind } from 'graphql';

function isSource(input: any): input is Source {
  return input instanceof Source;
}

function isDocumentNode(input: any): input is DocumentNode {
  return input.kind === 'Document';
}

export function extractExtensions(input: DocumentNode | Source | string): DocumentNode | never {
  let doc: DocumentNode;

  if (isDocumentNode(input)) {
    doc = input;
  } else if (isSource(input)) {
    doc = parse(input);
  } else if (typeof input === 'string') {
    doc = parse(input);
  } else {
    throw new Error('Only DocumentNode, Source and string are accepted');
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
