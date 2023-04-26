// Copyright (c) Perpetual-Motion project
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/naming-convention */
import { fail } from 'assert';
import { assert } from '../assertions';
import { Factory } from '../async/factory';
import { lazy } from '../async/lazy';
import { Descriptors } from '../eventing/descriptor';
import { emitNow } from '../eventing/dispatcher';
import { ArbitraryObject } from '../eventing/interfaces';
import { Finder } from '../filesystem/find';
import { path } from '../filesystem/path';
import { first } from '../system/array';
import { primitives } from '../system/filter';
import { is } from '../system/guards';
import { searchPaths } from '../system/platform';
import { Primitive } from '../system/types';
import { Process } from './process';
import { ReadableLineStream } from './streams';

type ArrayPlusOptions<T, TOptions> = [...Array<T>] | [...Array<T>, TOptions];

interface ProgramOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  noninteractive?: boolean;
  // on?: string | Record<string, AribtraryFunction|string>;
  on?: ArbitraryObject;
  choices?: Promise<Set<string>>;
}

function options<T extends Record<string, any>>(args?: [...Array<Primitive>] | [...Array<Primitive>, T]): Partial<T> {
  return args && args.length ? is.primitive(args[args.length - 1]) ? {} : args.pop() as T : {};
}

interface Launcher {
  executable: Promise<string>;
  cmdlineArgs: Array<Primitive>;
  options: ProgramOptions;
}

interface CommandResult {
  code: number;
  console: ReadableLineStream;
  error: ReadableLineStream;
}

/**
 * A function that when called will execute a program, and allow the consumer to interact with it.
 *
 * @param args the command line arguments to pass to the program.
 * @returns a promise that resolves to a Process object, which can be used to interact with the program.
 */
export interface ProcessFunction extends Launcher {
  (...commandLineArguments: ArrayPlusOptions<Primitive, ProgramOptions>): Promise<Process>;
}


/**
 * A function that when called will execute a program, and return the CommandResult
 *
 * @param args the command line arguments to pass to the program.
 * @returns a promise that resolves to a CommandResult object, which can be used to get the results of the program.
 */
export interface CommandFunction extends Launcher {
  (...commandLineArguments: ArrayPlusOptions<Primitive, ProgramOptions>): Promise<CommandResult>;
}

async function processFactory(executable: string|Launcher, ...initialArgs: [...Array<Primitive>, ProgramOptions & {noninteractive:true}]) : Promise<CommandFunction>
async function processFactory(executable: string|Launcher, ...initialArgs: ArrayPlusOptions<Primitive, ProgramOptions>) : Promise<ProcessFunction>
async function processFactory(executable: string|Launcher, ...initialArgs: ArrayPlusOptions<Primitive, ProgramOptions>) : Promise<ProcessFunction|CommandFunction> {
  let cmdlineArgs=primitives(initialArgs);
  let opts=options(initialArgs);
  let fullPath: Promise<string>;

  if (typeof(executable)=== 'string') {
    fullPath = lazy<string>(async ()=>{
      if (!await path.isExecutable(executable)) {
        // if they didn't pass in a valid executable path, let's see if we can figure it out.

        // if we were handed some choices, we'll look at them, otherwise we'll see what we can find on the PATH.
        opts.choices ??= lazy(async ()=> new Finder(executable).scan(... await searchPaths).results);
        const choices = await opts.choices;
        // but before we look at any of that, let's see if someone else wants to take that off our hands
        const bin = await emitNow<string>('select-binary',Descriptors.none, executable, opts.choices? await opts.choices : new Set());
        return await path.isExecutable(bin)             || // we have a good one coming back from the event
          await path.isExecutable(first(opts.choices))  || // we're gonna pick the first one in the choices, if there are any.
          fail(new Error(`Unable to find full path to ${executable}`)); // we're out of options.
      }

      // we were given a valid executable path, so we'll just check with the event listeners real quick.
      const bin = await emitNow<string>('select-binary',Descriptors.none, executable, opts.choices? await opts.choices : new Set()) || executable;

      // ensure that the executable is an absolute path
      assert.isAbsolute(bin);

      // ensure that the executable exists and is executable
      await assert.isExecutable(bin);

      return bin;
    });
  } else {
    cmdlineArgs = [...(executable as Launcher).cmdlineArgs,...cmdlineArgs];
    opts = { ...opts, ...((executable as Launcher).options || {}) };
    fullPath = (executable as Launcher).executable;
  }

  let result:ProcessFunction|CommandFunction;
  if (opts.noninteractive) {
    // create launcher for non-interactive commands
    result = (async (...moreArgs: ArrayPlusOptions<Primitive, ProgramOptions>): Promise<CommandResult> =>{
      // make sure the path is executable

      // Create Process instance
      const moreOpts = options(moreArgs);
      const subscribers = opts.on ? moreOpts.on ? [opts.on, moreOpts.on] : [opts.on] : moreOpts.on ? [moreOpts.on] : [];

      const proc = await new Process(
        await fullPath,                                                                                   // executable
        [...result.cmdlineArgs,...primitives(moreArgs)],                                                  // arguments
        result.options.cwd || moreOpts.cwd || process.cwd(),                                              // cwd
        { ...process.env, ...result.options.env, ...moreOpts.env },                                       // environment
        false,                                                                                            // no stdin.
        ...subscribers                                                                                    // event handlers
      );

      const code =await proc.exitCode;
      return {
        code,
        console: proc.console,
        error: proc.error,
      };

    }) as any as CommandFunction;
  } else {
    // create Launcher function
    result = (async (...moreArgs: ArrayPlusOptions<Primitive, ProgramOptions>): Promise<Process> =>{
    // Create Process instance
      const moreOpts = options(moreArgs);
      const subscribers = opts.on ? moreOpts.on ? [opts.on, moreOpts.on] : [opts.on] : moreOpts.on ? [moreOpts.on] : [];
      return new Process(
        await fullPath,                                                                                   // executable
        [...result.cmdlineArgs,...primitives(moreArgs)],                                                  // arguments
        result.options.cwd || moreOpts.cwd || process.cwd(),                                              // cwd
        { ...process.env, ...result.options.env, ...moreOpts.env },                                       // environment
        true,
        ...subscribers                                                                                    // event handlers
      );
    }) as any as ProcessFunction;
  }

  result.cmdlineArgs = cmdlineArgs; // bind the default args to the function
  result.options = opts;            // bind the default options to the function
  result.executable = fullPath;         // bind the executable to the function

  return result;
}

/** Creates a callable ProcessLauncher  */
export const Program = Factory(processFactory);

/** Creates a callable CommandLauncher */
export const Command = Factory((executable: string|Launcher, ...initialArgs: ArrayPlusOptions<Primitive, ProgramOptions>)=> processFactory(executable,...primitives(initialArgs),{ ...options(initialArgs), noninteractive: true }));

export function cmdlineToArray(text: string, result: Array<string> = [], matcher = /[^\s"]+|"([^"]*)"/gi, count = 0): Array<string> {
  text = text.replace(/\\"/g, '\ufffe');
  const match = matcher.exec(text);
  return match ? cmdlineToArray(text, result, matcher, result.push(match[1] ? match[1].replace(/\ufffe/g, '\\"') : match[0].replace(/\ufffe/g, '\\"'))): result;
}

