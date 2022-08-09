import { OnResolveArgs, PluginBuild } from 'esbuild';
import fs from 'fs/promises';
import path from 'path';
import { outputFile } from '../../fs';
import getPOSIXPath from '../../get-posix-path';
import UniqueIdGenerator from './id-generator';

const DEPENDENCY_TREE = new Map<string, Set<string>>();
const DIRTY = new Map<string, boolean>();

function normalizePath(file: string) {
  return getPOSIXPath(file);
}

export function addDependency(importer: string, imported: string) {
  const normalizedImporter = normalizePath(importer);
  const normalizedImported = normalizePath(imported);
  let dependencies = DEPENDENCY_TREE.get(normalizedImporter);

  if (!dependencies) {
    dependencies = new Set();
    DEPENDENCY_TREE.set(normalizedImporter, dependencies);
  }

  dependencies.add(normalizedImported);
}

export function unmountFile(file: string) {
  const normalizedFile = normalizePath(file);
  DIRTY.delete(normalizedFile);

  DEPENDENCY_TREE.delete(normalizedFile);

  for (const dependencies of DEPENDENCY_TREE.values()) {
    dependencies.delete(normalizedFile);
  }
}

const PENDING_DIRTY = new Set<string>();

export function markCleanFile(file: string) {
  const normalizedFile = normalizePath(file);
  DIRTY.set(normalizedFile, false);
  PENDING_DIRTY.delete(normalizedFile);
}

export function markFile(file: string) {
  const normalizedFile = normalizePath(file);
  DIRTY.set(normalizedFile, true);
  PENDING_DIRTY.add(normalizedFile);
}

export function clearDirty() {
  for (const file of PENDING_DIRTY.keys()) {
    DIRTY.set(file, false);
  }
  console.log(DEPENDENCY_TREE);
  PENDING_DIRTY.clear();
}

export function isFileDirty(file: string): boolean {
  const normalizedFile = normalizePath(file);
  const current = DIRTY.get(normalizedFile);
  if (current == null) {
    markFile(normalizedFile);
    return true;
  }
  if (current) {
    return true;
  }
  const dependencies = DEPENDENCY_TREE.get(normalizedFile);
  if (dependencies) {
    for (const value of dependencies.keys()) {
      if (isFileDirty(value)) {
        return true;
      }
    }
  }

  return false;
}

export interface FileCache {
  prefix: string;
  ids: Map<string, string>;
  id: UniqueIdGenerator;
}

export function createFileCache(prefix: string): FileCache {
  return {
    prefix,
    ids: new Map(),
    id: new UniqueIdGenerator(),
  };
}

function getID(cache: FileCache, file: string) {
  const normalizedFile = normalizePath(file);
  const current = cache.ids.get(normalizedFile);
  if (current) {
    return current;
  }
  const newID = cache.id.next();
  cache.ids.set(normalizedFile, newID);
  return newID;
}

const CACHE_DIRECTORY = '.rigidity_cache';

function getTargetFile(cache: FileCache, file: string) {
  return path.join(
    process.cwd(),
    CACHE_DIRECTORY,
    cache.prefix,
    getID(cache, file),
  );
}

export async function writeFileCache(cache: FileCache, file: string, contents: string) {
  await outputFile(getTargetFile(cache, file), contents);
}

export function readFileCache(cache: FileCache, file: string) {
  return fs.readFile(getTargetFile(cache, file), 'utf-8');
}

export function resolvePath(args: OnResolveArgs): string {
  return new URL(args.path, `file://${args.resolveDir}/`).pathname.substring(1);
}

export function registerDependencyMarker(build: PluginBuild, filter: RegExp) {
  build.onResolve({
    filter,
  }, (args) => {
    if (args.kind !== 'entry-point' && args.kind !== 'require-resolve') {
      addDependency(args.importer, resolvePath(args));
    }
    return null;
  });
}
