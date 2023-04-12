import { ProjectReflection, Reflection, ContainerReflection } from 'typedoc';
import { ReflectionKind } from '../.vitepress/ast-utils/Class';

export function findAllNodesOfType(node: Reflection, type: ReflectionKind): Reflection[] {
  const result: Reflection[] = [];

  function searchChildren(childNode: Reflection) {
    if (childNode.kind === type) {
      result.push(childNode);
    }

    if (isContainerReflection(childNode)) {
      childNode.children!.forEach(searchChildren);
    }
  }

  function isContainerReflection(reflection: Reflection): reflection is ContainerReflection {
    return (reflection as ContainerReflection).children !== undefined;
  }

  searchChildren(node);
  return result;
}

export function findNodeByName(node: Reflection, name: string): Reflection | null {
  if (node.name === name) {
    return node;
  }

  if (isContainerReflection(node)) {
    for (const child of node.children!) {
      const result = findNodeByName(child, name);
      if (result) {
        return result;
      }
    }
  }

  function isContainerReflection(reflection: Reflection): reflection is ContainerReflection {
    return (reflection as ContainerReflection).children !== undefined;
  }

  return null;
}

function isContainerReflection(reflection: Reflection): reflection is ContainerReflection {
  return (reflection as ContainerReflection).children !== undefined;
}

export function getAllNodes(project: ProjectReflection): Reflection[] {
  const result: Reflection[] = [];
  project.categories;

  function searchChildren(childNode: Reflection) {
    result.push(childNode);

    if (isContainerReflection(childNode)) {
      childNode.children!.forEach(searchChildren);
    }
  }

  searchChildren(project);
  return result;
}

// export function getNodesByCategoryTitle(project: ProjectReflection, categoryTitle: string, kind?: string): Reflection[] {
//   const category = project.categories?.find(c => c.title === categoryTitle);
//   if (!category) return [];

//   const nodes = category.children?.map(ref => project.getReflectionById(ref.id)).filter(Boolean) as Reflection[];
//   const result: Reflection[] = [];

//   function searchChildren(childNode: Reflection) {
//     result.push(childNode);

//     if (isContainerReflection(childNode)) {
//       childNode.children!.forEach(node => {
//         const child = project.getReflectionById(node.id);
//         if (child) searchChildren(child);
//       });
//     }
//   }

//   nodes.forEach(searchChildren);
//   return result;
// }

function getReflectionById(project: ProjectReflection, id: number): Reflection | undefined {
  function searchChildren(children: Reflection[]): Reflection | undefined {
    for (const child of children) {
      if (child.id === id) {
        return child;
      }
      if (isContainerReflection(child)) {
        const result = searchChildren(child.children || []);
        if (result) return result;
      }
    }
    return undefined;
  }

  return searchChildren(project.children || []);
}

function getReflectionsByKind(project: ProjectReflection, kind: ReflectionKind): Reflection[] {
  const result: Reflection[] = [];

  function searchChildren(children: Reflection[]) {
    for (const child of children) {
      if (child.kind === kind) {
        result.push(child);
      }
      if (isContainerReflection(child)) {
        searchChildren(child.children || []);
      }
    }
  }

  searchChildren(project.children || []);
  return result;
}

export function getNodesByCategoryTitle(
  project: ProjectReflection,
  categoryTitle: string,
  kind?: ReflectionKind,
): Reflection[] {
  const category = project.categories?.find(c => c.title === categoryTitle);
  if (!category) return [];

  const nodes = category.children
    ?.map(id => getReflectionById(project, id as any as number))
    .filter(Boolean) as Reflection[];

  let filteredNodes = nodes;
  if (kind) {
    filteredNodes = getReflectionsByKind(project, kind).filter(node => nodes.includes(node));
  }

  const result: Reflection[] = [];

  function searchChildren(childNode: Reflection) {
    result.push(childNode);

    if (isContainerReflection(childNode)) {
      childNode.children!.forEach(node => {
        const child = getReflectionById(project, node.id);
        if (child && filteredNodes.includes(child)) searchChildren(child);
      });
    }
  }

  filteredNodes.forEach(searchChildren);
  return result;
}
