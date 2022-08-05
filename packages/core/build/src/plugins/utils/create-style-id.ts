import UniqueIdGenerator from './id-generator';

export default function createStyleId(prefix: string) {
  const styleIds = new UniqueIdGenerator();
  const paths = new Map<string, string>();

  return (source: string) => {
    const id = paths.get(source);
    if (id) {
      return id;
    }
    const newID = `${prefix}-${styleIds.next()}`;
    paths.set(source, newID);
    return newID;
  };
}
