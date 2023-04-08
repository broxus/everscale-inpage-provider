import {
  Comment,
  CommentDisplayPart,
  CommentTag,
  SignatureReflection,
  ReflectionFlags,
  SomeType,
  Reflection,
  DeclarationReflection,
} from 'typedoc';

export type typeParam = {
  name: string;
  flags?: ReflectionFlags;
  type?: SomeType;
};

export type returnT = {
  name?: string;
  typeParams?: typeParam[];
  description?: string;
};

export interface SignatureDescription {
  comment?: string;
  tags: Record<string, string[]>;
  returns: returnT[];
  typeParameter: typeParam[];
}

export function formatComments(comments: Comment[]) {
  return comments.map(comment => formatComment(comment));
}

function extractReturns(signature: SignatureReflection): returnT[] | [] {
  const returnTags: returnT[] = [];

  const blockTags = signature.comment?.blockTags || [];
  const returnTag = blockTags.find(tag => tag.tag === '@returns');
  let description;
  if (returnTag) {
    description = returnTag.content?.[0]?.text;
  }

  returnTags.push({
    name: signature.name,
    description: description,
  });

  return returnTags;
}

export function extractSignatureDescription(signatures: SignatureReflection[]): SignatureDescription {
  const result: SignatureDescription = {
    comment: '',
    tags: {},
    returns: [],
    typeParameter: [],
  };

  signatures.forEach(sig => {
    const typeParams: typeParam[] = [];

    (sig as any).typeParameter?.forEach((tp: { name: any; flags: any; type: any }) => {
      typeParams.push({
        name: tp.name,
        flags: tp.flags,
        type: tp.type,
      });
    });
    result.typeParameter.push(...typeParams);
    if (sig.comment) {
      result.comment = formatComment(sig.comment);
    }

    sig.comment?.blockTags?.forEach(tag => {
      const tagName = tag.tag;
      const tagContent = tag.content?.[0]?.text;
      if (tagName && tagContent) {
        if (result.tags[tagName]) {
          result.tags[tagName].push(tagContent);
        } else {
          result.tags[tagName] = [tagContent];
        }
      }
    });

    const returns = extractReturns(sig);

    result.returns.push(...returns);
  });

  return result;
}

export function formatComment(comment: Comment | undefined): string | undefined {
  if (!comment || !comment.summary) {
    return undefined;
  }

  const displayParts: CommentDisplayPart[] = [...comment.summary];

  return displayParts
    .map(part => {
      if (part.kind === 'text' || part.kind === 'code') {
        return part.text;
      } else {
        return '';
      }
    })
    .join('');
}

export function formatType(rawType: any | undefined): string {
  if (!rawType) {
    return '';
  }
  if (rawType.type === 'reference') {
    //TODO logic for create link url
    let typeArgumentsString = '';
    if (rawType.typeArguments) {
      const formattedTypeArguments = rawType.typeArguments.map(formatType);
      typeArgumentsString = `<${formattedTypeArguments.join(', ')}>`;
    }
    return `<a href="${rawType.name}.md">${rawType.name}</a>${typeArgumentsString}`;
  } else {
    return rawType.name;
  }
}

export function formatReturnType(rawType: any | undefined, returnTypeComment: string | undefined): string {
  if (!rawType) {
    return '';
  }

  let returnTypeString = '';

  if (rawType.type === 'reference') {
    let typeArgumentsString = '';
    if (rawType.typeArguments) {
      const formattedTypeArguments = rawType.typeArguments.map((typeArg: any) => formatReturnType(typeArg, undefined));
      typeArgumentsString = `<${formattedTypeArguments.join(', ')}>`;
    }
    returnTypeString = `<a href="${rawType.name}.md">${rawType.name}</a>${typeArgumentsString}`;
  } else {
    returnTypeString = rawType.name;
  }

  if (returnTypeComment) {
    returnTypeString += ` ${returnTypeComment}`;
  }

  return returnTypeString;
}

export function hasDeclaration(reflection: Reflection): reflection is DeclarationReflection {
  return 'declaration' in reflection;
}
