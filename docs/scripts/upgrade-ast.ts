import { DeclarationReflection, ProjectReflection, SignatureReflection } from 'typedoc';
import { ReflectionKind } from '../.vitepress/ast-utils/Class';
//import fs from 'fs';

type SubCategory = { name: string; children: number[]; parent: number; parentCategory: string };

export interface ProjectReflectionWithSubCategories extends ProjectReflection {
  subCategories?: SubCategory[];
}

export interface TocSection {
  id: number;
  title: string;
  elements?: TableOfContentElement[];
}

export interface TableOfContent {
  sections: TocSection[];
}

export interface TableOfContentElement {
  id: number;
  title: string;
  categories?: Category[];
}

export interface Category {
  id?: number;
  name: string;
  children: number[];
  subCategories?: SubCategory[];
}
export function addSubCategoriesToChildrenNodes(parent: DeclarationReflection) {
  const knownedSubCategories = new Map<string, Category>();
  let currentSubCategory: string | undefined;

  for (const child of parent.children!) {
    let signature: SignatureReflection | undefined;

    if (child.kind === ReflectionKind.Accessor) {
      signature = child.getSignature;
    } else if (child.signatures) {
      signature = child.signatures[0];
    }
    if (!signature) continue;

    const childId = child.id;

    if (signature.comment) {
      if (!signature.comment.blockTags) {
        signature.comment.blockTags = [];
      }
      if (signature.comment.blockTags.some(tag => tag.tag === '@subCategory')) {
        currentSubCategory = signature.comment?.blockTags.find(tag => tag.tag === '@subCategory')?.content[0].text;

        if (currentSubCategory && !knownedSubCategories.has(currentSubCategory)) {
          knownedSubCategories.set(currentSubCategory, {
            name: currentSubCategory,
            children: [],
          });
        }
      }
    }

    if (!currentSubCategory) continue;

    if (currentSubCategory) {
      knownedSubCategories.get(currentSubCategory)?.children.push(childId);
    }

    if (!signature.comment) {
      child.signatures![0].comment = {
        summary: [],
        blockTags: [{ tag: '@subCategory', content: [{ kind: 'text', text: currentSubCategory }] }],
      } as any;
    } else if (!signature.comment.blockTags) {
      signature.comment.blockTags = [
        { tag: '@subCategory', content: [{ kind: 'text', text: currentSubCategory }] } as any,
      ];
    } else if (!signature.comment.blockTags.some(tag => tag.tag === '@subCategory')) {
      signature.comment.blockTags.push({
        tag: '@subCategory',
        content: [{ kind: 'text', text: currentSubCategory }],
      } as any);
    }
  }

  return knownedSubCategories;
}

// export function extractCategories(parent: DeclarationReflection): Category[] {
//   const subCategoriesMap = new Map<string, SubCategory>();
//   const categoryMap = new Map<string, Category>();
//   let currentSubCategory: string | undefined;
//   if (!parent.children) return [];
//   for (const child of parent.children!) {
//     let signature: SignatureReflection | undefined;

//     if (child.kind === ReflectionKind.Accessor) {
//       signature = child.getSignature;
//     } else if (child.signatures) {
//       signature = child.signatures[0];
//     }
//     if (!signature) continue;

//     const childId = child.id;

//     const categoryName = getCategoryName(child);

//     let existCategory = categoryMap.get(categoryName);
//     if (!existCategory) {
//       existCategory = {
//         name: categoryName,
//         children: [],
//       };
//       categoryMap.set(categoryName, existCategory);
//     }

//     const comment = signature.comment;
//     if (comment) {
//       const blockTags = comment.blockTags || [];

//       const subCategoryTag = blockTags.find(tag => tag.tag === '@subCategory');

//       if (subCategoryTag) {
//         currentSubCategory = subCategoryTag.content[0].text;

//         let subCategory = subCategoriesMap.get(currentSubCategory);
//         if (!subCategory) {
//           subCategory = {
//             name: currentSubCategory,
//             children: [childId],
//             parent: parent.id,
//             parentCategory: categoryName,
//           };
//           subCategoriesMap.set(currentSubCategory, subCategory);

//           if (!existCategory.subCategories) {
//             existCategory.subCategories = [subCategory];
//           } else {
//             existCategory.subCategories.push(subCategory);
//           }
//         } else {
//           subCategory.children.push(childId);
//         }

//         existCategory.children.push(childId);
//       } else {
//         if (child.name === 'raw') {
//           console.log(currentSubCategory);
//         }
//         if (currentSubCategory) {
//           const subCategory = subCategoriesMap.get(currentSubCategory);
//           if (subCategory) {
//             subCategory.children.push(childId);
//             subCategoriesMap.set(currentSubCategory, subCategory);
//           }
//         }
//         existCategory.children.push(childId);
//       }
//     } else {
//       if (currentSubCategory) {
//         const subCategory = subCategoriesMap.get(currentSubCategory);
//         if (subCategory) {
//           subCategory.children.push(childId);
//           subCategoriesMap.set(currentSubCategory, subCategory);
//         }
//       }
//       existCategory.children.push(childId);
//     }
//   }

//   return [...categoryMap.values()];
// }

export async function upgradeAst() {
  const project = (await import('./../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflectionWithSubCategories;
  let knownedSubCategories = new Map<string, Category>();

  for (const node of project.children!) {
    if (node.kind === ReflectionKind.Class || node.kind === ReflectionKind.Interface) {
      const newKnownedSubCategories = addSubCategoriesToChildrenNodes(node);

      if (newKnownedSubCategories.size > 0) {
        knownedSubCategories = new Map([...knownedSubCategories, ...newKnownedSubCategories!]);
      }
    }
  }

  //project.subCategories = Array.from(knownedSubCategories.values());
  const path = './build/typedoc-ast.json';
  //fs.writeFileSync('./docs/build/typedoc-ast.json', JSON.stringify(project, null, 2));
}

function processNamespaceOrModule(
  node: DeclarationReflection,
  sectionMap: Map<number, TocSection[]>,
  subCategoryMap: Map<number, SubCategory[]>,
) {
  for (const child of node.children || []) {
    if (child.kind === ReflectionKind.Namespace || child.kind === ReflectionKind.Module) {
      processNamespaceOrModule(child, sectionMap, subCategoryMap);
    } else if (child.kind === ReflectionKind.Class || child.kind === ReflectionKind.Interface) {
      //processClassOrInterface(child, sectionMap, subCategoryMap);
    } else if (child.kind === ReflectionKind.Function || child.kind === ReflectionKind.Variable) {
      //processFunctionOrVariable(child, sectionMap);
    }
  }
}

if (module === require.main) {
  upgradeAst();
  const project = require('./../build/typedoc-ast.json') as ProjectReflection;
}
