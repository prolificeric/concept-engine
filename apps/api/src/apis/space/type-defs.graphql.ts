export default `
type Query {
  concept(key: ID!): Concept
  concepts(query: ConceptsQuery = {}): [Concept!]!
  matches(query: MatchesQuery!): [RuleSetMatch!]!
  match(query: MatchQuery!): RuleSetMatch
}

type Mutation {
  addConcepts(input: AddConceptsInput!): [Concept!]!
  removeConcepts(keys: [String!]!): Int!
  updateConceptData(input: UpdateConceptDataInput!): Concept!
}

type Concept {
  key: ID!
  text: String!
  data: String
  parts: [Concept!]!
  contexts: [Concept!]!
}

type RuleSetMatch {
  variables: [VariableMatch!]!
  valueOf(name: ID!): Concept!
  keyOf(name: ID!): String
  textOf(name: ID!): String
  dataOf(name: ID!): String
  matches(rules: [String!]!): [RuleSetMatch!]!
  match(rules: [String!]!): RuleSetMatch
  concept(rule: String!): Concept
}

type VariableMatch {
  name: ID!
  match: Concept!
}

input Pagination {
  limit: Int = 100
  startKey: String
  endKey: String
}

input ConceptsQuery {
  # patterns: [String!]!
  # interpolate: [Interpolation!] = []
  pagination: Pagination = {}
}

input MatchesQuery {
  rules: [String!]!
  interpolate: [Interpolation!] = []
  pagination: Pagination = {}
}

input MatchQuery {
  rules: [String!]!
  interpolate: [Interpolation!] = []
}

input AddConceptsInput {
  source: [String!]!
  interpolate: [Interpolation!] = []
}

input UpdateConceptDataInput {
  key: ID!
  data: String!
}

input Interpolation {
  key: String!
  value: [String!]!
}
`;
