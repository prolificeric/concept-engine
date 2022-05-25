import {
  Concept,
  isAtom,
  isCompound,
  isDirective,
  isPattern,
  isString,
  isVariable,
  getConceptsDeep,
  filterUniqueConcepts,
} from './concepts';

import {
  interpolateToConcepts,
  interpolateToConcept,
  toConcepts,
} from './interpolation';

import type {
  ConceptSetSource,
  VariableInterpolationDict,
} from './interpolation';

import {
  extractVariables,
  getPatternVariables,
  matchPattern,
} from './matching';

import type { VariableDict } from './matching';

import { parseConcepts, parseConcept } from './expansion';
import { getConceptMasks } from './masking';
import { getAlphaHash, getDigest } from './hashing';

export type { ConceptSetSource, VariableInterpolationDict, VariableDict };

export {
  Concept,
  isAtom,
  isCompound,
  isDirective,
  isPattern,
  isString,
  isVariable,
  getPatternVariables,
  getConceptsDeep,
  filterUniqueConcepts,
  interpolateToConcepts,
  interpolateToConcept,
  toConcepts,
  parseConcepts,
  parseConcept,
  matchPattern,
  extractVariables,
  getConceptMasks,
  getAlphaHash,
  getDigest,
};
