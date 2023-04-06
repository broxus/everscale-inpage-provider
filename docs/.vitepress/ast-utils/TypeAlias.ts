import { ContainerReflection, ProjectReflection, Reflection, DeclarationReflection, SomeType } from 'typedoc';
import { findAllNodesOfType } from '../../scripts/find-ast';
import { ReflectionKind } from './Class';
import { formatComment, formatType, hasDeclaration } from './utils';

export interface TypeAliasInfo {
  name: string;
  typeParameters?: {
    name: string;
    type: string;
    comment?: string;
  }[];
  typeDeclaration?: {
    name: string;
    type: string;
    comment?: string;
  }[];
  definedIn?: string;
  definedInUrl?: string;
}

export async function findTypeAliases(project: ProjectReflection): Promise<TypeAliasInfo[]> {
  const typeAliasNodes = findAllNodesOfType(project, 'Type alias');

  const result: TypeAliasInfo[] = [];
  //console.log(12312, typeAliasNodes);
  function processTypeAlias(typeAliasNode: DeclarationReflection): TypeAliasInfo {
    const node = typeAliasNode as any;
    let typeDeclaration;

    if (node.type.declaration && node.type.declaration.children) {
      typeDeclaration =
        node.type.declaration.children.map((property: any) => ({
          name: property.name,
          comment: formatComment(property.comment),
          type: formatType(property.type),
        })) || [];
    }

    return {
      name: typeAliasNode.name,
      typeParameters: node.type.typeParameters?.map(param => ({
        name: param.name,
        type: formatType(param.type),
        сomment: formatComment(param.comment),
      })),
      typeDeclaration: typeDeclaration,
      definedIn: typeAliasNode.sources?.[0]?.fileName,
      definedInUrl: typeAliasNode.sources?.[0]?.url,
    };
  }

  for (const node of typeAliasNodes) {
    console.log(JSON.stringify(processTypeAlias(node as DeclarationReflection).typeDeclaration));
    result.push(processTypeAlias(node as DeclarationReflection));
  }

  return result;
}
