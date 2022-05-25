import { assert } from './util';

export type ConceptSource = string | (Concept | ConceptSource)[];

export class Concept {
  readonly key: string;
  readonly text: string;
  readonly parts: Concept[];

  constructor(source: ConceptSource) {
    if (Array.isArray(source)) {
      // Compounds

      // Instantiate each part as a Concept
      this.parts = source.map((partSource) => {
        if (partSource instanceof Concept) {
          return partSource;
        }

        return new Concept(partSource);
      });

      // Check for the set operator (orders parts by key)
      if (this.parts[0].key === ':') {
        this.parts = this.parts.slice(0, 1).concat(
          this.parts.slice(1).sort((a, b) => {
            return a.key.localeCompare(b.key);
          }),
        );
      }

      this.key = Concept.joinPartKeys(this.parts);
      this.text = this.key;
    } else {
      // Atoms

      this.key = source;
      this.parts = [];
      this.text = this.key.replace(/(^<<)|(>>$)/g, '');

      assert(
        this.isString() || !/[ ,\{\}\(\)]/.test(this.key),
        'Concept key cannot contain characters: ,{}() or space',
      );
    }

    if (this.parts.length === 1) {
      // Move 1-concept compounds up a level
      return this.parts[0];
    }
  }

  toDate() {
    return new Date(this.text);
  }

  toNumber() {
    return parseFloat(this.text);
  }

  toString() {
    return this.text;
  }

  isAtom(): boolean {
    return this.parts.length === 0;
  }

  isDirective(): boolean {
    return this.isAtom() && this.key[0] === '@';
  }

  isString(): boolean {
    return this.isAtom() && /^<<(.|\n)*>>$/.test(this.key);
  }

  isCompound(): boolean {
    return !this.isAtom();
  }

  isVariable(): boolean {
    return this.isAtom() && this.key[0] === '$';
  }

  isPattern(): boolean {
    return (
      this.isCompound() &&
      this.parts.some((part) => {
        return part.isVariable() || part.isPattern();
      })
    );
  }

  static joinPartKeys(parts: Concept[]) {
    return parts
      .map((part) => (part.isAtom() ? part.key : `[${part.key}]`))
      .join(' ');
  }
}

// Concept functions
export const isAtom = (concept: Concept) => {
  return concept.isAtom();
};

export const isCompound = (concept: Concept) => {
  return concept.isCompound();
};

export const isDirective = (concept: Concept) => {
  return concept.isDirective();
};

export const isString = (concept: Concept) => {
  return concept.isString();
};

export const isVariable = (concept: Concept) => {
  return concept.isVariable();
};

export const isPattern = (concept: Concept) => {
  return concept.isPattern();
};

export const getConceptsDeep = (concepts: Concept[]) => {
  const map = new Map<string, Concept>();

  const recurse = (concepts: Concept[]) => {
    for (const concept of concepts) {
      map.set(concept.key, concept);
      recurse(concept.parts);
    }
  };

  recurse(concepts);

  return Array.from(map.values());
};

export const filterUniqueConcepts = (concepts: Concept[]) => {
  const map = new Map<string, Concept>();
  concepts.forEach((concept) => map.set(concept.key, concept));
  return Array.from(map.values());
};
