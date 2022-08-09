import { PluginBuild } from 'esbuild';
import fs from 'fs/promises';
import path from 'path';
import { outputFile } from '../../fs';
import UniqueIdGenerator from './id-generator';

const DEPENDENCY_TREE = new Map<string, Set<string>>();
const DIRTY = new Map<string, boolean>();

export function addDependency(importer: string, imported: string) {
  let dependencies = DEPENDENCY_TREE.get(importer);

  if (!dependencies) {
    dependencies = new Set();
    DEPENDENCY_TREE.set(importer, dependencies);
  }

  dependencies.add(imported);
}

export function unmountFile(file: string) {
  DIRTY.delete(file);

  DEPENDENCY_TREE.delete(file);

  for (const dependencies of DEPENDENCY_TREE.values()) {
    dependencies.delete(file);
  }
}

const PENDING_DIRTY = new Set<string>();

export function markFile(file: string) {
  DIRTY.set(file, true);
  PENDING_DIRTY.add(file);
}

export function clearDirty() {
  for (const file of PENDING_DIRTY.keys()) {
    DIRTY.set(file, false);
  }
  PENDING_DIRTY.clear();
}

export function isFileDirty(file: string): boolean {
  const current = DIRTY.get(file);
  if (current == null) {
    markFile(file);
    return true;
  }
  if (current) {
    return true;
  }
  const dependencies = DEPENDENCY_TREE.get(file);
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
  const current = cache.ids.get(file);
  if (current) {
    return current;
  }
  const newID = cache.id.next();
  cache.ids.set(file, newID);
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

export function registerDependencyMarker(build: PluginBuild, filter: RegExp) {
  build.onResolve({
    filter,
  }, (args) => {
    if (args.kind !== 'entry-point' && args.kind !== 'require-resolve') {
      const directory = path.dirname(args.importer);
      addDependency(args.importer, path.join(directory, args.path));
    }
    return null;
  });
}
