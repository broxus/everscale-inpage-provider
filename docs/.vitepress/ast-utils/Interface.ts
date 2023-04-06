import { ContainerReflection, ProjectReflection, Reflection, DeclarationReflection, SomeType } from 'typedoc';
import { findAllNodesOfType } from '../../scripts/find-ast';
import { ReflectionKind } from './Class';
import { formatComment, formatType, hasDeclaration } from './utils';

export interface InterfaceInfo {
  name: string;
  properties?: {
    name: string;
    type: string;
    comment?: string;
  }[];
  methods?: {
    name: string;
    comment?: string;
    parameters?: {
      name: string;
      type: string;
      comment?: string;
    }[];
    returnType?: string;
  }[];
  definedIn?: string;
  definedInUrl?: string;
}

export async function findInterfaces(project: ProjectReflection): Promise<InterfaceInfo[]> {
  const interfaceNodes = findAllNodesOfType(project, 'Interface');

  const result: InterfaceInfo[] = [];

  function processInterface(interfaceNode: DeclarationReflection): InterfaceInfo {
    const properties = interfaceNode.children?.filter(child => child.kindString === 'Property') || [];
    const methods = interfaceNode.children?.filter(child => child.kindString === 'Method') || [];

    return {
      name: interfaceNode.name,
      properties: properties.map(property => ({
        name: property.name,
        comment: formatComment(property.comment),
        type: formatType(property.type),
      })),
      methods: methods.map(method => ({
        name: method.name,
        comment: formatComment(method.comment),
        parameters: method.signatures?.[0]?.parameters?.map(param => ({
          name: param.name,
          type: formatType(param.type),
          сomment: formatComment(param.comment),
        })),
        returnType: formatType(method.signatures?.[0]?.type),
      })),
      definedIn: interfaceNode.sources?.[0]?.fileName,
      definedInUrl: interfaceNode.sources?.[0]?.url,
    };
  }

  for (const node of interfaceNodes) {
    result.push(processInterface(node as DeclarationReflection));
  }

  return result;
}
