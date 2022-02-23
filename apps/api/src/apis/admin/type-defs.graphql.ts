export default `
type Query {
  account: Account
  accessToken: AccessToken
  space(id: ID!): Space
}

type Mutation {
  addSpace(input: AddSpaceInput!): Space!
  updateSpace(input: UpdateSpaceInput!): Space!
  removeSpace(id: ID!): Boolean!

  addAccessToken(input: AddAccessTokenInput!): AccessToken!
  updateAccessToken(input: UpdateAccessTokenInput!): AccessToken!
  removeAccessToken(id: ID!): Boolean!

  createBillingSession(input: CreateBillingSessionInput!): BillingSession!
  createSubscriptionManagementSession(input: CreateSubscriptionManagementSessionInput!): SubscriptionManagementSession!
}

input CreateBillingSessionInput {
  successUrl: String!
  cancelUrl: String!
}

input CreateSubscriptionManagementSessionInput {
  returnUrl: String!
}

type SubscriptionManagementSession {
  id: ID!
  url: String!
}

type BillingSession {
  id: ID!
  url: String!
}

type Account {
  id: ID!
  billingId: ID
  level: AccountLevel!
  email: String!
  created: String!
  trialDaysLeft: Float!
  memberships: [Membership!]!
}

enum AccountLevel {
  TRIAL
  PREMIUM
}

type Space {
  id: ID!
  name: String!
  memberships: [Membership!]!
  accessTokens: [AccessToken!]!
}

type Invite {
  email: String!
  space: Space!
}

type AccessToken {
  id: ID!
  label: String!
  space: Space!
  role: MembershipRole!
  creator: Account!
}

type Permission {
  id: ID!
  pattern: String!
  actions: [Action!]!
}

enum Action {
  read
  write
  remove
}

type Membership {
  id: ID!
  account: Account!
  space: Space!
  role: MembershipRole!
}

enum MembershipRole {
  owner
  admin
  collaborator
}

input AddSpaceInput {
  name: String!
}

input UpdateSpaceInput {
  id: ID!
  name: String!
}

input AddAccessTokenInput {
  spaceId: ID!
  label: String!
  role: MembershipRole!
}

input UpdateAccessTokenInput {
  id: ID!
  role: MembershipRole
}
`;
