import { ContainerReflection, ProjectReflection, Reflection, DeclarationReflection, SomeType } from 'typedoc-web';
import { findAllNodesOfType, getNodesByCategoryTitle } from '../../scripts/find-ast';
import { ComponentKind, ReflectionKind } from './Class';
import { formatComment, formatType, hasDeclaration } from './utils';

export interface ITypeAliasInfo {
  id: number;
  name: string;
  kind: ComponentKind;
  typeParameters?: {
    id: number;
    name: string;
    type: string;
    comment?: string;
  }[];
  typeDeclaration?: {
    id: number;
    name: string;
    type: string;
    comment?: string;
  }[];
  definedIn?: string;
  definedInUrl?: string;
}

export class TypeAliasInfo implements ITypeAliasInfo {
  id: number;
  name: string;
  kind: ComponentKind;
  typeParameters?: {
    id: number;
    name: string;
    type: string;
    comment?: string;
  }[];
  typeDeclaration?: {
    id: number;
    name: string;
    type: string;
    comment?: string;
  }[];
  definedIn?: string;
  definedInUrl?: string;

  constructor(typeAliasNode: DeclarationReflection) {
    const node = typeAliasNode as any;
    let typeDeclaration;

    if (node.type.declaration && node.type.declaration.children) {
      typeDeclaration =
        node.type.declaration.children.map((property: any) => ({
          id: property.id,
          name: property.name,
          comment: formatComment(property.comment),
          type: formatType(property.type),
        })) || [];
    }

    this.id = typeAliasNode.id;
    this.name = typeAliasNode.name;
    this.kind = ComponentKind.TypeAlias;
    this.typeParameters = node.type.typeParameters?.map(param => ({
      id: param.id,
      name: param.name,
      type: formatType(param.type),
      сomment: formatComment(param.comment),
    }));
    this.typeDeclaration = typeDeclaration;
    this.definedIn = typeAliasNode.sources?.[0]?.fileName;
    this.definedInUrl = typeAliasNode.sources?.[0]?.url;
  }
}

export function findTypeAliases(project: ProjectReflection, category?: string): TypeAliasInfo[] {
  const typeAliasNodes = category
    ? getNodesByCategoryTitle(project, category, ReflectionKind.TypeAlias)
    : findAllNodesOfType(project, ReflectionKind.TypeAlias);

  const result: TypeAliasInfo[] = [];

  for (const node of typeAliasNodes) {
    result.push(new TypeAliasInfo(node as DeclarationReflection));
  }

  return result;
}
