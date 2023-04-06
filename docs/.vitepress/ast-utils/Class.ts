import {
  ProjectReflection,
  Reflection,
  ContainerReflection,
  ParameterReflection,
  SignatureReflection,
  DeclarationReflection,
} from 'typedoc';
//import { SignatureReflection } from 'typedoc/dist/lib/serialization/schema';
import { findAllNodesOfType } from '../../scripts/find-ast';
import {
  SignatureDescription,
  extractSignatureDescription,
  formatComment,
  formatType,
  formatReturnType,
} from './utils';

/**
 *  @category Class/Interfaces and Types
 */

export enum ReflectionKind {
  Project = 1,
  Module = 2,
  Namespace = 4,
  Enum = 8,
  EnumMember = 16,
  Variable = 32,
  Function = 64,
  Class = 128,
  Interface = 256,
  Constructor = 512,
  Property = 1024,
  Method = 2048,
  CallSignature = 4096,
  IndexSignature = 8192,
  ConstructorSignature = 16384,
  Parameter = 32768,
  TypeLiteral = 65536,
  TypeParameter = 131072,
  Accessor = 262144,
  GetSignature = 524288,
  SetSignature = 1048576,
  ObjectLiteral = 2097152,
  TypeAlias = 4194304,
  Reference = 8388608,
}

export interface Constructor {
  title?: string;
  signatureDescription?: SignatureDescription;
  parameters?: ParameterReflection[];
  formattedParameterComments?: Record<string, string>;
  formattedParameters?: Record<string, string>;
  returnType?: string;
  overridden?: string;
  definedIn?: string;
  definedInUrl?: string;
}
interface Accessor {
  name: string;
  comment: string;
  type: string;
  returnType?: string;
  returnComment?: string;
  definedIn: string | undefined;
  definedInUrl: string | undefined;
}

interface Method {
  name: string;
  comment: string;
  type: string;
  returnType?: string;
  returnComment?: string;
  definedIn?: string;
  definedInUrl?: string;
  parameters?: {
    name: string;
    type: string;
  }[];
}

interface Property {
  name: string;
  comment?: string;
  type?: string;
  isOptional?: boolean;
  definedIn?: string;
  definedInUrl?: string;
  inheritedFrom?: string;
}

export interface ClassInfo {
  name: string;
  constructors?: Constructor[];
  accessors?: Accessor[];
  methods?: Method[];
  properties?: Property[];
}

/**
 * @category Class/Extractors
 */

function extractConsturctorParams(signatures: SignatureReflection[]): ParameterReflection[] {
  const params = [] as ParameterReflection[];
  signatures.forEach(sig => {
    sig.parameters?.forEach(param => {
      params.push(param);
    });
  });
  return params;
}

function extractConstructors(reflection: ContainerReflection): Constructor[] {
  const constructors = [] as Constructor[];

  reflection.children?.forEach(child => {
    if (child.kind === ReflectionKind.Constructor) {
      const parameters = extractConsturctorParams(child.signatures!);
      //const comments = extractConstructorComments(child.signatures!);
      const description = extractSignatureDescription(child.signatures!);
      const formattedParameterComments = {} as Record<string, string>;

      const formattedParameters = {} as Record<string, string>;
      parameters.forEach(param => {
        formattedParameterComments[param.name] = formatComment(param.comment) || '';
        formattedParameters[param.name] = formatType(param.type);
      });
      const constructor: Constructor = {
        title: child.name,
        signatureDescription: description,
        parameters: parameters,
        formattedParameters: formattedParameters,
        formattedParameterComments: formattedParameterComments,
        returnType: 'void', // Assuming constructor always returns void
        definedIn: child.sources?.[0]?.fileName,
        definedInUrl: child.sources?.[0]?.url,
      };
      constructors.push(constructor);
    }
  });

  return constructors;
}

function extractAccessors(reflection: ContainerReflection): Accessor[] {
  const accessors = [] as Accessor[];

  reflection.children?.forEach(child => {
    if (child.kind === ReflectionKind.Accessor) {
      const getSignature = child.getSignature;
      const comment = getSignature ? formatComment(getSignature.comment) : '';
      const description = extractSignatureDescription([getSignature!]);
      const accessor: Accessor = {
        name: child.name,
        comment: comment,
        type: getSignature ? formatType(getSignature.type) : '',
        returnType: getSignature ? formatType(getSignature.type) : '',
        returnComment: description?.returns[0]?.description,
        definedIn: child.sources?.[0]?.fileName,
        definedInUrl: child.sources?.[0]?.url,
      };
      accessors.push(accessor);
    }
  });

  return accessors;
}
function extractMethods(reflection: ContainerReflection): Method[] {
  const methods = [] as Method[];

  reflection.children?.forEach(child => {
    if (child.kind === ReflectionKind.Method) {
      const signature = child.signatures?.[0];
      const comment = signature ? formatComment(signature.comment) : '';
      const description = extractSignatureDescription([signature!]);
      const parameters = signature?.parameters?.map(param => ({
        name: param.name,
        type: formatType(param.type),
      }));

      const method: Method = {
        name: child.name,
        comment: comment,
        type: signature ? formatType(signature.type) : '',
        returnType: signature ? formatType(signature.type) : '',
        returnComment: description?.returns[0]?.description,
        definedIn: child.sources?.[0]?.fileName,
        definedInUrl: child.sources?.[0]?.url,
        parameters: parameters,
      };

      methods.push(method);
    }
  });

  return methods;
}

function extractProperties(reflection: ContainerReflection): Property[] {
  const properties = [] as Property[];

  reflection.children?.forEach(child => {
    if (child.kind === ReflectionKind.Property) {
      const comment = formatComment(child.comment);
      const type = formatType(child.type);
      const isOptional = child.flags?.isOptional || false;
      const inheritedFrom = child.inheritedFrom ? formatType(child.inheritedFrom) : undefined;

      const property: Property = {
        name: child.name,
        comment: comment,
        type: type,
        isOptional: isOptional,
        definedIn: child.sources?.[0]?.fileName,
        definedInUrl: child.sources?.[0]?.url,
        inheritedFrom: inheritedFrom,
      };

      properties.push(property);
    }
  });

  return properties;
}

export async function findClassesWithMembers(project: ProjectReflection): Promise<ClassInfo[]> {
  const classes = findAllNodesOfType(project, 'Class');

  const result: ClassInfo[] = [];

  function processClass(classNode: Reflection) {
    //const constructorNodes = findAllNodesOfType(classNode, 'Constructor');
    // const accessorsNodes = findAllNodesOfType(classNode, 'Accessor');
    // const methodNodes = findAllNodesOfType(classNode, 'Method');
    // const propertyNodes = findAllNodesOfType(classNode, 'Property');

    result.push({
      name: classNode.name,
      constructors: extractConstructors(classNode as ContainerReflection),
      accessors: extractAccessors(classNode as ContainerReflection),
      methods: extractMethods(classNode as ContainerReflection),
      properties: extractProperties(classNode as ContainerReflection),
    });
  }

  for (const classNode of classes) {
    processClass(classNode);
  }

  return result;
}
