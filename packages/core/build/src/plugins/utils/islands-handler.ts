import islands from 'caldaria-islands/babel';

export type IslandsOnEntry = (id: string, entry: string) => void;

export interface IslandsHandlerOptions {
  extension: string;
  assets: string;
  prefix: string;
  generate?: 'dom' | 'ssr';
  onEntry?: IslandsOnEntry;
}

export default class IslandsHandler {
  private entries = new Map<string, string>();

  private filenames = new Map<string, string>();

  private options: IslandsHandlerOptions;

  constructor(options: IslandsHandlerOptions) {
    this.options = options;
  }

  private createEntry(entry: string): string {
    const result = this.entries.get(entry);
    if (result) {
      return result;
    }
    const id = `${this.options.prefix}-${this.entries.size}`;
    this.entries.set(entry, id);
    this.options.onEntry?.(id, entry);
    return id;
  }

  private getFilename(pth: string) {
    const filename = this.filenames.get(pth);

    if (filename) {
      return filename;
    }

    const entry = this.createEntry(pth);
    const newFilename = `/${this.options.assets}/${entry}.js`;
    this.filenames.set(pth, newFilename);
    return newFilename;
  }

  getPlugins(
    pth: string,
  ) {
    if (this.options.generate !== 'ssr') {
      return [];
    }
    if (new RegExp(`\\.client\\.${this.options.extension}$`).test(pth)) {
      return [[islands, { source: this.getFilename(pth) }]];
    }
    return [[islands]];
  }
}
