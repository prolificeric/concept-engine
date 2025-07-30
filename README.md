# ConceptEngine

> A digital knowledge management platform built on nested hypergraphs for capturing, querying, and automating information.

ConceptEngine transforms how you store and interact with data by using a flexible nested hypergraph model and an intuitive query language called ConceptML. Create instant GraphQL APIs for your knowledge spaces and build powerful automations with triggers.

## 🚀 Features

- **Nested Hypergraphs**: Maximum flexibility in representing complex relationships
- **ConceptML**: Sentence-like language for expressing and querying data
- **GraphQL APIs**: Instant API generation for your knowledge spaces
- **Automated Triggers**: Set up actions based on data changes
- **Multi-tenant**: Secure spaces for individuals and organizations
- **Edge Computing**: Built on Cloudflare Workers for global performance

## 📁 Repository Structure

This monorepo contains:

```
apps/
├── api/        # Cloudflare Workers API with Durable Objects
├── dash/       # Next.js web dashboard
└── cli/        # Command-line interface

packages/
└── concept-ml-parser/  # ConceptML parsing library
```

## 🛠️ Tech Stack

- **API**: Cloudflare Workers, Durable Objects, GraphQL
- **Dashboard**: Next.js, React, Apollo Client, Monaco Editor
- **CLI**: TypeScript, Commander.js
- **Auth**: Auth0
- **Payments**: Stripe
- **Build**: Turborepo, pnpm workspaces

## 📋 Prerequisites

- Node.js 18.x
- pnpm 6.31.0 or higher
- Cloudflare account (for API deployment)
- Auth0 account (for authentication)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/concept-engine.git
   cd concept-engine
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env` files in each app directory with the required variables:
   
   For `apps/api`:
   ```env
   AUTH0_DOMAIN=your-auth0-domain
   AUTH0_AUDIENCE=concept-engine-api
   STRIPE_SECRET_KEY=your-stripe-secret
   ```
   
   For `apps/dash`:
   ```env
   AUTH0_DOMAIN=your-auth0-domain
   AUTH0_CLIENT_ID=your-auth0-client-id
   AUTH0_AUDIENCE=concept-engine-api
   COENG_BASE_URL=http://localhost:8787
   STRIPE_API_KEY=your-stripe-publishable-key
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - API server at http://localhost:8787
   - Dashboard at http://localhost:3000
   - CLI in watch mode

## 💻 Development

### Running individual apps

```bash
# API only
cd apps/api && pnpm dev

# Dashboard only
cd apps/dash && pnpm dev

# Build CLI
cd apps/cli && pnpm build
```

### Building for production

```bash
pnpm build
```

### Running tests

```bash
pnpm test
```

### Linting and formatting

```bash
pnpm lint
pnpm format
```

## 📝 ConceptML

Visit [our docs](https://coeng.io/docs) to learn about ConceptML.

## 🔌 API Usage

### GraphQL Endpoint

```
POST http://localhost:8787/graphql
```

### Basic Queries

```graphql
# Get a concept by key
query {
  concept(key: "user likes pizza") {
    key
    text
    parts {
      key
      text
    }
  }
}

# Add concepts
mutation {
  addConcepts(input: {
    concepts: ["user likes pizza", "user likes tacos"]
  }) {
    key
    text
  }
}
```

### Authentication

Include an Authorization header with your Auth0 JWT token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🖥️ CLI Usage

### Installation

```bash
cd apps/cli
pnpm build
pnpm link --global
```

### Commands

```bash
# Login
coeng login

# Select a space
coeng space select

# Add concepts
coeng add "user likes pizza"

# Query concepts
coeng query "$user likes $what"

# Get/set concept data
coeng data get "user"
coeng data set "user" '{"name": "John"}'
```

## 🚀 Deployment

### API Deployment (Cloudflare Workers)

1. Configure `wrangler.toml` with your account details
2. Deploy:
   ```bash
   cd apps/api
   pnpm deploy
   ```

### Dashboard Deployment

The dashboard can be deployed to any static hosting service:

**Vercel:**
```bash
cd apps/dash
vercel
```

**Netlify:**
```bash
cd apps/dash
pnpm build && pnpm export
netlify deploy --dir=out
```

## 📚 Learn More

- [Official Website](https://coeng.io/)