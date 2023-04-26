/* eslint-disable header/header */
// ===========================================
// AUTOGENERATED VALIDATOR FILE. DO NOT EDIT.
// ===========================================

import { createValidator } from '@perpetual-motion/automation';
import { CppStandard, CStandard } from './interfaces';

const code = `/* eslint-disable header/header */
/* eslint-disable @typescript-eslint/ban-types */

// Deep Partial implementation
export type Primitive = string | number | boolean | bigint | symbol | undefined | null | Date | Function | RegExp;
export type DeepPartial<T> =
  T extends Primitive | Function | Date ? T :
  {
    [P in keyof T]?:
    T[P] extends Array<infer U> ? Array<DeepPartial<U>> :
    T[P] extends ReadonlyArray<infer V> ? ReadonlyArray<DeepPartial<V>> :
    T[P] extends Primitive ? T[P] :
    DeepPartial<T[P]>
  } | T;

/** An Expression supports tempate variable substitution (ie \`the workspace is $ {workspaceFolder}, the PATH is $ {env:PATH} \`) */
export type Expression = string;

/** A Conditional is an Expression that is used to conditially apply configuation based on a specific condition being met */
export type Conditional = Expression ;

/** One or more (as a type or an array of a type) */
export type OneOrMore<T> = T | Array<T>;

/** A regular expression in a string
 *
 * take care that the string is properly escaped (ie, backslashes)
 */
export type RegularExpression = string;

/** Discovery requirements operations */
export type Operation = 'match' | 'folder'  | 'file' | 'regex';

/** officially supported standards (c++) */
export type CppStandard = 'c++98' | 'c++03' | 'c++11' | 'c++14' | 'c++17' | 'c++20' | 'c++23';

/** officially supported standards (c) */
export type CStandard = 'c89' | 'c99' | 'c11' | 'c17' | 'c23';

/** Package manager names */
export type PkgMgr = 'apt' | 'brew' | 'winget' | 'yum' | 'rpm' | 'dpkg';

/** A package definition */
export type Package = Partial<Record<PkgMgr, OneOrMore<string>>>;

/** A query definition - the 'active' requirements to get settings from a binary */
export type Query = Record<Expression, Record<string, OneOrMore<Expression>>>;

/** the target 'platform' (aka OS) */
export type Platform =
  'windows'|  // windows
  'linux'| // linux
  'macos'| // apple osx/darwin
  'ios'| // apple ios
  'none'| // bare metal
  'android'| // android
  'wasm'| // wasm
  'unknown'; // don't know what it is

/** The Target CPU/Processor architecture */
export type Architecture =
  'arm'| // arm aka aarch32
  'arm64'| // 64bit arm, aka aarch64
  'avr' | // AVR (arduino)
  'x64'| // x86_64 aka amd64 aka x64
  'x86'| // x86 (32bit)
  'riscv'| // riscv
  'ia64'| // ia64
  'mips'| // mips
  'ppc'| // ppc
  'sparc'| // sparc
  'wasm'| // wasm
  'unknown'; // don't know what it is

/** The "well-known" compiler. At the moment, some back end parts make assumptions base on this */
export type CompilerVariant = 'msvc' | 'clang' | 'gcc';

/** A requirement that the path to the discovered binary matches a given regular expression */
type Match = Record<'match', RegularExpression>;

/** A requirement that there is a folder relative to the location of the discovered binary */
type Folder = Record<'folder', Expression>;

/** A requirement that there is a file relative to the location of the discovered binary */
type File = Record<'file', Expression>;

/** A requirement to find a string in the binary itself */
type Rx = Record<'regex', Expression>;

/** The (passive) requirements to discover a binary  */
export interface Discover {
  binary: OneOrMore<RegularExpression>;
  locations?: OneOrMore<string>;
  requirements?: Record<string, Match|Folder|File|Rx>;
}

/** The Target specifies what the compiler is supposed to be outputting */
export interface Target {
  /** Well-known compiler variant (currently, just the three) */
  compiler?: CompilerVariant;

  /** the target platform */
  platform?: Platform;

  /** The target CPU/Processor architecture */
  architecture?: Architecture;

  /** The 'bit width' of the compiler */
  bits?: 64 | 32 | 16 | 8;

  /** additional arguments that are being passed to the compiler */
  compilerArgs?: OneOrMore<string>; // arguments that are assumed to be passed to the compiler on the command line
}

/** The declared 'default' properties that are */
export interface DefaultProperties {
  /** the file paths that indicate default #include locations  */
  includePath?: OneOrMore<Expression>;

  /** #defines that are implicitly specified so that the backend understands how to handle the code */
  defines?: Record<string,string>;

  /** the C++ standard that this toolset supports */
  cppStandard?: CppStandard | number;

  /** the C Standard that this toolset supports */
  cStandard?: CStandard | number;

  /** The settings for what the toolset is targeting */
  target?: Target;

  /** paths to files that are forcibly #included */
  forcedInclude?: OneOrMore<Expression>;

  /** unstructured data that can be passed thru to help the backend figure out what to do */
  additionalProperties? : Record<string, OneOrMore<Expression>>;
}

/** The interface for the toolset.XXX.json file */
export interface DefinitionFile {
  /** The cosmetic name for the toolkit */
  name: string;

  /** The cosmetic version for the toolkit */
  version?: string;

  /** files to automatically load and merge */
  import?: OneOrMore<string>;

  /** Describes the steps to find this toolkit */
  discover: Discover;

  /** Query steps to ask the compiler (by executing it) about its settings */
  query?: Query;

  /** Explicitly declared settings about this toolset */
  defaults?: DefaultProperties;

  /** The package identities if we are interested in bootstrapping it. */
  package?: Package;

  /** Conditional events that allow us to overlay additional configuration when a condition is met */
  conditions?: Record<string, OneOrMore<string>|PartialDefinitionFile>;
}

/** A partial definition file */
export type PartialDefinitionFile = DeepPartial<DefinitionFile>;

/**
 * The Toolset is the final results of the [discovery+query] process
 *
 * This is the contents that we're going to eventually pass to the back end.
 */
export interface Toolset {
  /** The name of the toolset (this is shown to the user) */
  name: string;

  /** The version of the toolset (this is shown to the user) */
  version: string;

  /** The full (verified) path to the compiler */
  compilerPath: string;

  /** The full set of default #include paths */
  includePath: Array<string>;

  /** The #defines that are implicitly specified */
  defines: Record<string, string>;

  /** The C++ standard that this toolset supports */
  cppStandard?: CppStandard;

  /** The C Standard that this toolset supports */
  cStandard?: CStandard;

  /** The settings for what the toolset is targeting */
  target: Target;

  /** paths to files that are forcibly #included */
  forcedInclude: Array<string>;

  /** unstructured data that can be passed thru to help the backend figure out what to do */
  additionalProperties: Record<string,OneOrMore<string>>;

  /** @internal */
  query:()=>Promise<void>;
}


/** the ABI (not needed?) */
export type Abi = 'eabihf'| // ARM EABI Hard Float
                  'eabi'| // ARM EABI Soft Float
                  'gnu'| // GNU (glibc?)
                  'msvc'| // microsoft visual c++
                  'wasm'; // WebAssembly


/** Ideally, we'd know the target ABI and Endian of the compiler, but there is not a use in the back end at the moment. */
// abi?: 'eabihf'|'eabi'|'gnu'|'elf'|'msvc'|'none'|'uclibc'|'wasm';
// endian?: 'little' | 'big';`;

export const validateDefinitionFile = createValidator(code, 'DefinitionFile');

export const validatePartialDefinitionFile = createValidator(code, 'PartialDefinitionFile');

const cppStandards = new Map<string|number, CppStandard>([
  // strings
  ['c++98', 'c++98'], ['c++03', 'c++03'], ['c++11', 'c++11'], ['c++14', 'c++14'], ['c++17', 'c++17'], ['c++20', 'c++20'], ['c++23', 'c++23'],
  ['C++98', 'c++98'], ['C++03', 'c++03'], ['C++11', 'c++11'], ['C++14', 'c++14'], ['C++17', 'c++17'], ['C++20', 'c++20'], ['C++23', 'c++23'],
  ['98', 'c++98'], ['03', 'c++03'], ['11', 'c++11'], ['14', 'c++14'], ['17', 'c++17'], ['20', 'c++20'], ['23', 'c++23'],
  ['gnu++98', 'c++98'], ['gnu++03', 'c++03'], ['gnu++11', 'c++11'], ['gnu++14', 'c++14'], ['gnu++17', 'c++17'], ['gnu++20', 'c++20'], ['gnu++23', 'c++23'],
  ['GNU++98', 'c++98'], ['GNU++03', 'c++03'], ['GNU++11', 'c++11'], ['GNU++14', 'c++14'], ['GNU++17', 'c++17'], ['GNU++20', 'c++20'], ['GNU++23', 'c++23'],
  ['1998', 'c++98'], ['2003', 'c++03'], ['2011', 'c++11'], ['2014', 'c++14'], ['2017', 'c++17'], ['2020', 'c++20'], ['2023', 'c++23'],
  // numbers
  [98, 'c++98'], [3, 'c++03'], [11, 'c++11'], [14, 'c++14'], [17, 'c++17'], [20, 'c++20'], [23, 'c++23'],
  [1998, 'c++98'], [2003, 'c++03'], [2011, 'c++11'], [2014, 'c++14'], [2017, 'c++17'], [2020, 'c++20'], [2023, 'c++23'],
]);

// given a string or a number, return a valid CppStandard or undefined
export function toCppStandard(value: string|number|undefined|Array<any>): CppStandard|undefined {
  if (Array.isArray(value)) {
    value = value.flat(2)[0] as string|number|undefined;
  }
  return value ? cppStandards.get(value) || cppStandards.get(value.toString().substring(0,4)) : undefined;
}

const cStandards = new Map<string|number, CStandard>([
  // strings
  ['c89', 'c89'], ['c99', 'c99'], ['c11', 'c11'], ['c17', 'c17'], ['c23', 'c23'],
  ['C89', 'c89'], ['C99', 'c99'], ['C11', 'c11'], ['C17', 'c17'], ['C23', 'c23'],
  ['89', 'c89'], ['99', 'c99'], ['11', 'c11'], ['17', 'c17'], ['23', 'c23'],
  ['gnu89', 'c89'], ['gnu99', 'c99'], ['gnu11', 'c11'], ['gnu17', 'c17'], ['gnu23', 'c23'],
  ['GNU89', 'c89'], ['GNU99', 'c99'], ['GNU11', 'c11'], ['GNU17', 'c17'], ['GNU23', 'c23'],
  ['1989', 'c89'], ['1999', 'c99'], ['2011', 'c11'], ['2017', 'c17'], ['2023', 'c23'],
  // numbers
  [89, 'c89'], [99, 'c99'], [11, 'c11'], [17, 'c17'], [23, 'c23'],
  [1989, 'c89'], [1999, 'c99'], [2011, 'c11'], [2017, 'c17'], [2023, 'c23'],
]);

// given a string or a number, return a valid CStandard or undefined
export function toCStandard(value: string|number|undefined|Array<any>): CStandard|undefined {
  if (Array.isArray(value)) {
    value = value.flat(2)[0] as string|number|undefined;
  }
  return value ? cStandards.get(value) || cStandards.get(value.toString().substring(0,4)) : undefined;
}