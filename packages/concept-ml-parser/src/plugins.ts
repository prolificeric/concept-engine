import { Concept } from './concepts';

export type Plugin = (parts: Concept[]) => Concept[];

export const applyAmpersand = (parts: Concept[]) => {
  const [head, ...rest] = parts;
  let hasAmpersand = false;

  const recurse = (parts: Concept[]): Concept[] => {
    return parts.map((part) => {
      if (part.key === '&') {
        hasAmpersand = true;
        return head;
      } else if (part.isCompound()) {
        return new Concept(recurse(part.parts));
      } else {
        return part;
      }
    });
  };

  const applied = recurse(rest);

  return hasAmpersand ? applied : parts;
};

export const allPlugins: Plugin[] = [applyAmpersand];

export const applyPlugins = (
  parts: Concept[],
  plugins: Plugin[],
): Concept[] => {
  return plugins.reduce((parts, plugin) => {
    return plugin(parts);
  }, parts);
};
