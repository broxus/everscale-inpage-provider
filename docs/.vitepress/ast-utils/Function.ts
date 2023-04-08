import { ContainerReflection, DeclarationReflection, ProjectReflection } from 'typedoc';
import { findAllNodesOfType, getNodesByCategoryTitle } from '../../scripts/find-ast';

import { ReflectionKind } from './Class';
import { extractSignatureDescription, formatComment, formatType } from './utils';

export interface Function {
  name: string;
  comment?: string;
  type?: string;
  returnType?: string;
  returnComment?: string;
  definedIn?: string;
  definedInUrl?: string;
  parameters?: {
    name: string;
    type: string;
    comment?: string;
  }[];
}

export function findFunctions(project: ProjectReflection, category?: string): Function[] {
  const functionNodes = (
    category
      ? getNodesByCategoryTitle(project, category, ReflectionKind.Function)
      : findAllNodesOfType(project, ReflectionKind.Function)
  ) as DeclarationReflection[];

  const functions: Function[] = [];

  functionNodes.forEach(child => {
    const signature = child.signatures?.[0];
    const comment = signature ? formatComment(signature.comment) : undefined;
    const description = extractSignatureDescription([signature!]);
    const parameters = signature?.parameters?.map(param => ({
      name: param.name,
      type: formatType(param.type),
      comment: param.comment ? formatComment(param.comment) : undefined,
    }));

    const method: Function = {
      name: child.name,
      comment: comment,
      type: signature ? formatType(signature.type) : undefined,
      returnType: signature ? formatType(signature.type) : undefined,
      returnComment: description?.returns.length > 0 ? description?.returns[0]?.description : undefined,
      definedIn: child.sources?.[0]?.fileName,
      definedInUrl: child.sources?.[0]?.url,
      parameters: parameters,
    };

    functions.push(method);
  });

  return functions;
}
