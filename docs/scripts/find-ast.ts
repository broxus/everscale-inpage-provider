import { ProjectReflection, Reflection, ContainerReflection } from 'typedoc';

export function findAllNodesOfType(node: Reflection, type: string): Reflection[] {
  const result: Reflection[] = [];

  function searchChildren(childNode: Reflection) {
    if (childNode.kindString === type) {
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

export function getAllNodes(project: ProjectReflection): Reflection[] {
  const result: Reflection[] = [];

  function searchChildren(childNode: Reflection) {
    result.push(childNode);

    if (isContainerReflection(childNode)) {
      childNode.children!.forEach(searchChildren);
    }
  }

  function isContainerReflection(reflection: Reflection): reflection is ContainerReflection {
    return (reflection as ContainerReflection).children !== undefined;
  }

  searchChildren(project);
  return result;
}

// const typedocJson = require('./../build/typedoc-ast.json');
// const projectReflection: ProjectReflection = typedocJson as ProjectReflection;

// const nodes = getAllNodes(projectReflection);
// console.log(nodes.length);

// for (const node of nodes) {
//   console.log(node.name);
// }
// const allClasses = findAllNodesOfType(projectReflection, 'Class');
// const specificClass = findNodeByName(projectReflection, 'MyClassName');
