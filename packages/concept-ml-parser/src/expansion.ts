import { filterUniqueConcepts, Concept } from './concepts';
import { applyPlugins, allPlugins, Plugin } from './plugins';
import { parseTokens, Token } from './tokenization';

export const parseConcept = (
  source: string,
  plugins: Plugin[] = allPlugins,
): Concept => {
  const concept = parseConcepts(source, plugins)[0];

  if (!concept) {
    throw new Error('Invalid concept source');
  }

  return concept;
};

export const parseConcepts = (
  source: string | string[],
  plugins: Plugin[] = allPlugins,
) => {
  source = [source].flat().join('\n');

  const tokens = parseTokens(source);
  const root = parseExpansionTree(tokens);

  const permutations = getPermutations(root).map((permutation) => {
    return applyPlugins(permutation, plugins);
  });

  return filterUniqueConcepts(
    permutations.map((permutation) => {
      return new Concept(permutation);
    }),
  );
};

export const getPermutations = (block: BlockExpansionNode) => {
  const permutations: Concept[][] = [];

  visitPermutations(block, (parts) => {
    permutations.push(parts);
  });

  return permutations;
};

export const parseExpansionTree = (tokens: Token[]): BlockExpansionNode => {
  const root = new InlineBlockExpansionNode();
  let curBranch = root.addBranch();

  const handleBranching = () => {
    curBranch =
      curBranch.children.length > 0
        ? curBranch.parentBlock.addBranch()
        : curBranch;
  };

  const handleClosing = () => {
    const upBranch =
      curBranch.parentBlock.parentBranch ||
      (root.getLastBranch() as BranchExpansionNode);

    if (curBranch.children.length === 0) {
      curBranch.parentBlock.branches.pop();
    }

    if (curBranch.parentBlock.branches.length === 0) {
      curBranch.parentBlock.parentBranch?.children.pop();
    }

    curBranch = upBranch;
  };

  for (const token of tokens) {
    switch (token.type.name) {
      case 'ATOM':
        curBranch.appendChild(new Concept(token.value));
        break;
      case 'STRING':
        curBranch.appendChild(new Concept(token.value));
        break;
      case 'BRANCH':
        handleBranching();
        break;
      case 'MULTI_LINE_COMMENT':
        handleBranching();
        break;
      case 'LEFT_SQUARE_BRACE':
        curBranch = curBranch.addNestedBlock().addBranch();
        break;
      case 'LEFT_CURLY_BRACE':
        curBranch = curBranch.addInlineBlock().addBranch();
        break;
      case 'LEFT_PARENTHESIS':
        curBranch = curBranch.addParentheticalBlock().addBranch();
        break;
      case 'RIGHT_SQUARE_BRACE':
        if (curBranch.parentBlock instanceof NestedBlockExpansionNode) {
          handleClosing();
        }
        break;
      case 'RIGHT_CURLY_BRACE':
        if (curBranch.parentBlock instanceof InlineBlockExpansionNode) {
          handleClosing();
        }
        break;
      case 'RIGHT_PARENTHESIS':
        if (curBranch.parentBlock instanceof ParentheticalBlockExpansionNode) {
          handleClosing();
        }
        break;
      default:
        break;
    }
  }

  handleClosing();

  return root;
};

export abstract class BlockExpansionNode {
  branches: BranchExpansionNode[] = [];
  parentBranch?: BranchExpansionNode;

  appendBranch(branch: BranchExpansionNode) {
    this.branches.push(branch);
    branch.parentBlock = this;
    return this;
  }

  addBranch() {
    const branch = new BranchExpansionNode(this);
    this.appendBranch(branch);
    return branch;
  }

  getLastBranch(): BranchExpansionNode | null {
    return this.branches.slice(-1)[0] || null;
  }
}

export class InlineBlockExpansionNode extends BlockExpansionNode {}

export class ParentheticalBlockExpansionNode extends BlockExpansionNode {}

export class NestedBlockExpansionNode extends BlockExpansionNode {}

export class BranchExpansionNode {
  parentBlock: BlockExpansionNode;
  children: (Concept | BlockExpansionNode)[] = [];

  constructor(parentBlock: BlockExpansionNode) {
    this.parentBlock = parentBlock;
  }

  addInlineBlock() {
    const block = new InlineBlockExpansionNode();
    this.appendChild(block);
    return block;
  }

  addParentheticalBlock() {
    const block = new ParentheticalBlockExpansionNode();
    this.appendChild(block);
    return block;
  }

  addNestedBlock() {
    const block = new NestedBlockExpansionNode();
    this.appendChild(block);
    return block;
  }

  appendChild(child: Concept | BlockExpansionNode) {
    this.children.push(child);

    if (child instanceof BlockExpansionNode) {
      child.parentBranch = this;
    }

    return this;
  }

  getLastChild(): Concept | BlockExpansionNode | null {
    return this.children.slice(-1)[0] || null;
  }
}

export const visitPermutations = (
  block: BlockExpansionNode,
  visit: (parts: Concept[], passthrough?: boolean) => void,
) => {
  const next = (
    nodes: BranchExpansionNode['children'],
    prefixes: Concept[][] = [],
  ) => {
    const [head, ...rest] = nodes;

    if (!head) {
      return prefixes.forEach((prefix) => visit(prefix));
    }

    let permutations: Concept[][] = prefixes;

    const combine = (suffixes: Concept[][]) => {
      if (suffixes.length === 0) {
        return;
      }

      if (permutations.length === 0) {
        permutations = suffixes;
        return;
      }

      permutations = permutations.flatMap((left) => {
        return suffixes.map((right) => {
          return left.concat(right);
        });
      });
    };

    if (head instanceof Concept) {
      permutations =
        permutations.length === 0
          ? [[head]]
          : permutations.map((permutation) => {
              return permutation.concat(head);
            });
    } else {
      const subpermutations: Concept[][] = [];
      const passthroughs: Concept[][] = [];

      const tails = filterUniqueConcepts(
        permutations.flatMap((parts) => {
          return parts.length > 0 ? parts.slice(-1)[0] : [];
        }),
      );

      const processPassthroughs = () => {
        passthroughs.forEach((parts) => {
          visit(parts, true);
        });
      };

      visitPermutations(head, (parts, passthrough) => {
        if (passthrough) {
          passthroughs.push(parts);
        } else {
          subpermutations.push(parts);
        }
      });

      if (head instanceof NestedBlockExpansionNode) {
        passthroughs.forEach((parts) => {
          if (tails.length === 0) {
            visit(parts, true);
          } else {
            tails.forEach((tail) => {
              if (tail.isDirective()) {
                // Directives preceding a nested block cause parenthetical blocks
                // to not be passed through, but only expand within that context.
                subpermutations.push(parts);
              } else {
                visit(parts, true);
              }
            });
          }
        });

        combine(subpermutations.map((parts) => [new Concept(parts)]));
      } else if (head instanceof InlineBlockExpansionNode) {
        combine(subpermutations);
        processPassthroughs();
      } else if (head instanceof ParentheticalBlockExpansionNode) {
        subpermutations.forEach((right) => {
          if (tails.length === 0) {
            return visit(right, true);
          }

          tails.forEach((left) => {
            visit([left, ...right], true);
          });
        });

        processPassthroughs();
      }
    }

    next(rest, permutations);
  };

  block.branches.forEach((branch) => {
    next(branch.children);
  });
};
