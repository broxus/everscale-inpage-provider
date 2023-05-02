import { ContainerReflection, DeclarationReflection, ProjectReflection } from 'typedoc-web';
import { findAllNodesOfType, getNodesByCategoryTitle } from '../../scripts/find-ast';

import { ComponentKind, ReflectionKind } from './Class';
import { extractSignatureDescription, formatComment, formatType } from './utils';

export interface IFunctionInfo {
  id: number;
  name: string;
  kind: ComponentKind;
  comment?: string;
  type?: string;
  returnType?: string;
  returnComment?: string;
  definedIn?: string;
  definedInUrl?: string;
  parameters?: {
    id: number;
    name: string;
    type: string;
    comment?: string;
  }[];
}

export class FunctionInfo implements IFunctionInfo {
  id: number;
  name: string;
  kind: ComponentKind;
  comment?: string;
  type?: string;
  returnType?: string;
  returnComment?: string;
  definedIn?: string;
  definedInUrl?: string;
  parameters?: {
    id: number;
    name: string;
    type: string;
    comment?: string;
  }[];

  constructor(reflection: DeclarationReflection) {
    this.id = reflection.id;
    this.name = reflection.name;
    this.kind = ComponentKind.Function;

    const signature = reflection.signatures?.[0];
    if (signature) {
      this.comment = formatComment(signature.comment);
      this.type = formatType(signature.type);
      this.returnType = formatType(signature.type);
      this.returnComment = extractSignatureDescription([signature])?.returns?.[0]?.description;
      this.parameters = signature.parameters?.map(param => ({
        id: param.id,
        name: param.name,
        type: formatType(param.type),
        comment: formatComment(param.comment),
      }));
    }

    this.definedIn = reflection.sources?.[0]?.fileName;
    this.definedInUrl = reflection.sources?.[0]?.url;
  }
}

export function findFunctions(project: ProjectReflection, category?: string): FunctionInfo[] {
  const functionNodes = (
    category
      ? getNodesByCategoryTitle(project, category, ReflectionKind.Function)
      : findAllNodesOfType(project, ReflectionKind.Function)
  ) as DeclarationReflection[];

  const functions: FunctionInfo[] = [];

  functionNodes.forEach(child => {
    const method = new FunctionInfo(child);

    functions.push(method);
  });

  return functions;
}
