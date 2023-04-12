import { DeclarationReflection, ProjectReflection, SignatureReflection } from 'typedoc';
import {
  ClassInfo,
  InterfaceInfo,
  TypeAliasInfo,
  FunctionInfo,
  findClasses,
  findFunctions,
  findInterfaces,
  findTypeAliases,
  ReflectionKind,
} from '../.vitepress/ast-utils';

interface PageInfo {
  classes?: ClassInfo[];
  interfaces?: InterfaceInfo[];
  typeAliases?: TypeAliasInfo[];
  functions?: FunctionInfo[];
}

export type ContentItem = ClassInfo | FunctionInfo | InterfaceInfo | TypeAliasInfo;

export type PageContentMap = {
  [categoryName: string]: ContentItem[];
};

export interface Page {
  pageInfo: PageInfo;
  pageContentMap: PageContentMap;
}

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

function buildPageContentMap(toc: TableOfContent, pageInfo: PageInfo): any {
  const pageContentMap: any = {};

  toc.sections.forEach(section => {
    const sectionName = section.title;

    section.elements?.forEach(element => {
      const elementName = element.title;
      //console.log(elementName);
      const contentItems = findContentItemsById(element.id, pageInfo);
      if (contentItems.length) {
        if (!pageContentMap[sectionName]) {
          pageContentMap[sectionName] = {};
        }
        if (!pageContentMap[sectionName][elementName]) {
          pageContentMap[sectionName][elementName] = [];
        }
        // if (!pageContentMap[sectionName][elementName]) {
        //   pageContentMap[sectionName][elementName] = [];
        // }

        pageContentMap[sectionName][elementName] = pageContentMap[sectionName][elementName].concat(contentItems);
      }
      element.categories?.forEach(category => {
        const categoryName = category.name;

        // const contentItems = findContentItemsById(, pageInfo);
        // category?.children.forEach(childId => {
        //   const contentItems = findContentItemsById(childId, pageInfo);

        // if (contentItems.length) {
        //   if (!pageContentMap[sectionName]) {
        //     pageContentMap[sectionName] = {};
        //   }
        //   if (!pageContentMap[sectionName][elementName]) {
        //     pageContentMap[sectionName][elementName] = {};
        //   }
        //   if (!pageContentMap[sectionName][elementName][categoryName]) {
        //     pageContentMap[sectionName][elementName][categoryName] = [];
        //   }

        //   pageContentMap[sectionName][elementName][categoryName] =
        //     pageContentMap[sectionName][elementName][categoryName].concat(contentItems);
        // }
        // });
      });
    });
  });
  //console.log(pageContentMap);
  return pageContentMap;
}

function findContentItemsById(id: number, pageInfo: PageInfo): ContentItem[] {
  let result: any[] = [];

  const addMatches = (items: any[]) => {
    result = result.concat(items.filter(item => item.id === id));
  };

  if (pageInfo.classes) {
    addMatches(pageInfo.classes);
    pageInfo.classes.forEach(cls => {
      addMatches(cls.constructors || []);
      addMatches(cls.accessors || []);
      addMatches(cls.methods || []);
      addMatches(cls.properties || []);
    });
  }

  if (pageInfo.interfaces) {
    addMatches(pageInfo.interfaces);
    pageInfo.interfaces.forEach(intf => {
      addMatches(intf.methods || []);
      addMatches(intf.properties || []);
    });
  }

  if (pageInfo.typeAliases) {
    addMatches(pageInfo.typeAliases);
  }

  if (pageInfo.functions) {
    addMatches(pageInfo.functions);
  }

  return result;
}

export function buildPage(project: ProjectReflection, category: string, toc: TableOfContent): Page {
  const pageInfo: PageInfo = {
    classes: findClasses(project, category),
    interfaces: findInterfaces(project, category),
    typeAliases: findTypeAliases(project, category),
    functions: findFunctions(project, category),
  };

  const pageContentMap = buildPageContentMap(toc, pageInfo);

  const page: Page = {
    pageInfo: pageInfo,
    pageContentMap: pageContentMap,
  };

  return page;
}

function getCategoryName(child: DeclarationReflection) {
  switch (child.kind) {
    case ReflectionKind.Class:
      return 'Classes';
    case ReflectionKind.Constructor:
      return 'Constructors';
    case ReflectionKind.Method:
      return 'Methods';
    case ReflectionKind.Property:
      return 'Properties';
    case ReflectionKind.Accessor:
      return 'Accessors';

    case ReflectionKind.Interface:
      return 'Interfaces';
    case ReflectionKind.Enum:
      return 'Enums';
    case ReflectionKind.TypeAlias:
      return 'Type Aliases';
    case ReflectionKind.Variable:
      return 'Variables';
    case ReflectionKind.Function:
      return 'Functions';
    default:
      return 'Other';
  }
}

export function extractCategories(parent: DeclarationReflection): Category[] {
  const subCategoriesMap = new Map<string, SubCategory>();
  const categoryMap = new Map<string, Category>();
  let currentSubCategoryKey: string | undefined;
  if (!parent.children) return [];
  for (const child of parent.children!) {
    let signature: SignatureReflection | undefined;

    if (child.kind === ReflectionKind.Accessor) {
      signature = child.getSignature;
    } else if (child.signatures) {
      signature = child.signatures[0];
    }
    if (!signature) continue;

    const childId = child.id;

    const categoryName = getCategoryName(child);

    let existCategory = categoryMap.get(categoryName);
    if (!existCategory) {
      existCategory = {
        name: categoryName,
        children: [],
      };
      categoryMap.set(categoryName, existCategory);
    }

    const comment = signature.comment;

    if (comment) {
      const blockTags = comment.blockTags || [];

      const subCategoryTag = blockTags.find(tag => tag.tag === '@subCategory');

      if (subCategoryTag) {
        const currentSubCategory = subCategoryTag.content[0].text;
        currentSubCategoryKey = `${categoryName}_${currentSubCategory}`;

        let subCategory = subCategoriesMap.get(currentSubCategoryKey);
        if (!subCategory) {
          subCategory = {
            name: currentSubCategory,
            children: [childId],
            parent: parent.id,
            parentCategory: categoryName,
          };
          subCategoriesMap.set(currentSubCategoryKey, subCategory);

          if (!existCategory.subCategories) {
            existCategory.subCategories = [subCategory];
          } else {
            existCategory.subCategories.push(subCategory);
          }
        } else {
          subCategory.children.push(childId);
        }

        existCategory.children.push(childId);
      } else {
        if (currentSubCategoryKey) {
          const subCategory = subCategoriesMap.get(currentSubCategoryKey);
          if (subCategory && subCategory.parentCategory === categoryName) {
            subCategory.children.push(childId);
            subCategoriesMap.set(currentSubCategoryKey, subCategory);
          }
        }
        existCategory.children.push(childId);
      }
    } else {
      if (currentSubCategoryKey) {
        const subCategory = subCategoriesMap.get(currentSubCategoryKey);
        if (subCategory && subCategory.parentCategory === categoryName) {
          subCategory.children.push(childId);
          subCategoriesMap.set(currentSubCategoryKey, subCategory);
        }
      }
      existCategory.children.push(childId);
    }
  }

  return [...categoryMap.values()];
}

export function buildTableOfContent(
  project: ProjectReflection,
  category: string,
  sectionIdDl: string = '.',
): TableOfContent {
  const toc: TableOfContent = { sections: [] };
  const sectionMap = new Map<number, TableOfContentElement[]>();
  let lastId = 0;
  const undefinedSections: DeclarationReflection[] = [];
  for (const node of project.children!) {
    if (!project.categories?.find(cat => cat.title === category)) continue;
    if (
      ![ReflectionKind.TypeAlias, ReflectionKind.Class, ReflectionKind.Interface, ReflectionKind.Function].includes(
        node.kind,
      )
    )
      continue;

    let sectionTag = node.comment?.blockTags?.find(tag => tag.tag === '@tocSection');
    let refTag = node.comment?.blockTags?.find(tag => tag.tag === '@tocRef');
    const subCategories = extractCategories(node);

    if (node.kind === ReflectionKind.Function) {
      sectionTag = node.signatures?.[0].comment?.blockTags?.find(tag => tag.tag === '@tocSection');
      refTag = node.signatures?.[0].comment?.blockTags?.find(tag => tag.tag === '@tocRef');
    }

    if (sectionTag) {
      const sectionId = Number(sectionTag.content[0]?.text.split(sectionIdDl)[0]);

      const sectionTitle = sectionTag.content[0]?.text.substring(sectionTag.content[0].text.indexOf(' ') + 1);

      sectionMap.set(sectionId, [{ id: node.id, title: node.name, categories: subCategories }]);
      toc.sections.push({ id: sectionId, title: sectionTitle, elements: sectionMap.get(sectionId)! });
      lastId = sectionId;
    } else if (refTag) {
      const sectionId = Number(refTag.content[0].text);
      const sectionElements = sectionMap.get(sectionId);

      if (sectionElements) {
        sectionElements.push({ id: node.id, title: node.name, categories: subCategories });
      }
      lastId = sectionId;
    } else {
      undefinedSections.push(node);
    }
  }

  if (undefinedSections.length > 0) {
    for (const node of undefinedSections) {
      const sectionName = getCategoryName(node);

      const section = toc.sections.find(section => section.title === sectionName);

      const subCategories = extractCategories(node);
      if (section) {
        if (!section.elements) {
          section.elements = [];
        }
        section.elements.push({ id: node.id, title: node.name, categories: subCategories });
      } else {
        lastId++;
        toc.sections.push({
          id: lastId,
          title: sectionName,
          elements: [{ id: node.id, title: node.name, categories: subCategories }],
        });
      }
    }
  }
  (project as any)['tableOfContent'] = toc;

  //fs.writeFileSync('./docs/build/typedoc-ast.json', JSON.stringify(project, null, 2));
  toc.sections.sort((a, b) => a.id - b.id);

  return toc;
}
