import { DeclarationReflection, ProjectReflection } from 'typedoc';
import { findAllNodesOfType, getNodesByCategoryTitle } from '../../scripts/find-ast';
import { ComponentKind, ReflectionKind } from './Class';
import { extractSignatureDescription, formatComment, formatType } from './utils';

export interface IParameter {
  id: number;
  name: string;
  type: string;
  comment?: string;
}

export interface IMethod {
  id: number;
  name: string;
  comment?: string;
  parameters?: IParameter[];
  returnType?: string;
}

export interface IProperty {
  id: number;
  name: string;
  type: string;
  comment?: string;
}

export interface IInterfaceInfo {
  id: number;
  name: string;
  kind: ComponentKind;
  properties?: IProperty[];
  methods?: IMethod[];
  definedIn?: string;
  definedInUrl?: string;
}

export class InterfaceInfo implements IInterfaceInfo {
  id: number;
  name: string;
  kind: ComponentKind;
  properties?: IProperty[];
  methods?: IMethod[];
  definedIn?: string;
  definedInUrl?: string;

  constructor(reflection: DeclarationReflection) {
    this.id = reflection.id;
    this.name = reflection.name;
    this.kind = ComponentKind.Interface;

    const properties = reflection.children?.filter(child => child.kindString === 'Property') || [];
    const methods = reflection.children?.filter(child => child.kindString === 'Method') || [];

    this.properties = properties.map(property => ({
      id: property.id,
      name: property.name,
      comment: formatComment(property.comment),
      type: formatType(property.type),
    }));

    this.methods = methods.map(method => {
      const signature = method.signatures?.[0];

      return {
        id: method.id,
        name: method.name,
        comment: signature ? formatComment(signature.comment) : undefined,
        parameters: signature?.parameters?.map(param => ({
          id: param.id,
          name: param.name,
          type: formatType(param.type),
          comment: formatComment(param.comment),
        })),
        returnType: signature ? formatType(signature.type) : undefined,
      };
    });

    this.definedIn = reflection.sources?.[0]?.fileName;
    this.definedInUrl = reflection.sources?.[0]?.url;
  }
}

export function findInterfaces(project: ProjectReflection, category?: string): InterfaceInfo[] {
  const interfaceNodes = category
    ? getNodesByCategoryTitle(project, category, ReflectionKind.Interface)
    : findAllNodesOfType(project, ReflectionKind.Interface);

  return interfaceNodes.map(node => new InterfaceInfo(node as DeclarationReflection));
}
