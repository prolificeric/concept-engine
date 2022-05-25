import { Concept } from './concepts';
import { assert } from './util';

export interface Token {
  type: TokenType;
  value: string;
  range: {
    start: Position;
    end: Position;
  };
  prev?: Token;
  next?: Token;
}

export interface Position {
  line: number;
  column: number;
}

export type TokenTypeName =
  | 'ATOM'
  | 'STRING'
  | 'SPACES'
  | 'BRANCH'
  | 'COMMENT'
  | 'MULTI_LINE_COMMENT'
  | 'LEFT_SQUARE_BRACKET'
  | 'STRING'
  | 'LEFT_SQUARE_BRACE'
  | 'LEFT_CURLY_BRACE'
  | 'LEFT_PARENTHESIS'
  | 'RIGHT_SQUARE_BRACE'
  | 'RIGHT_CURLY_BRACE'
  | 'RIGHT_PARENTHESIS';

export interface TokenType {
  name: TokenTypeName;
  match: (source: string) => string | null;
}

export const parseTokens = (source: string): Token[] => {
  const tokens: Token[] = [];
  let rest = source;
  let lastToken: Token | null = null;

  parseLoop: while (rest.length > 0) {
    for (const type of tokenTypes) {
      const match = maybeMatchTokenType(type, rest);

      if (match) {
        tokens.push(match);

        if (lastToken) {
          lastToken.next = match;
          match.prev = lastToken;

          Object.assign(match.range.start, {
            line: lastToken.range.end.line,
            column: lastToken.range.end.column + 1,
          });

          if (match.range.end.line === 1) {
            match.range.end.column += match.range.start.column;
          }

          Object.assign(match.range.end, {
            line: match.range.start.line + match.range.end.line - 1,
          });
        }

        lastToken = match;
        rest = rest.slice(match.value.length);
        continue parseLoop;
      }
    }

    throw new Error(
      `Could not find a matching TokenType for at: "${rest.slice(0, 20)}"`,
    );
  }

  return tokens;
};

export const createRegExpTokenType = (
  name: TokenTypeName,
  regExp: RegExp,
): TokenType => {
  assert(
    regExp.source[0] === '^',
    'RegExp TokenType must match the beginning of string.',
  );

  return {
    name,
    match: (source) => {
      const result = source.match(regExp);
      return (result || [null])[0];
    },
  };
};

export const maybeMatchTokenType = (
  type: TokenType,
  source: string,
): Token | null => {
  const value = type.match(source);

  if (!value) {
    return null;
  }

  assert(
    source.slice(0, value.length) === value,
    'TokenType must match at beginning of source.',
  );

  const lines = value.split('\n');

  return {
    type,
    value,
    range: {
      start: {
        line: 1,
        column: 1,
      },
      end: {
        line: lines.length,
        column: lines.slice(-1)[0].length,
      },
    },
  };
};

export const tokenTypes: TokenType[] = [
  createRegExpTokenType('BRANCH', /^[ \t]*(\n|,)+[ \t]*/),
  createRegExpTokenType('SPACES', /^[ \t]+/),
  createRegExpTokenType('COMMENT', /^\/\*.+?\*\//),
  createRegExpTokenType('MULTI_LINE_COMMENT', /^\/\*(.|\n)+?\*\//),
  createRegExpTokenType('STRING', /^<<(.|\n)+?>>/),
  createRegExpTokenType('LEFT_SQUARE_BRACE', /^\[/),
  createRegExpTokenType('RIGHT_SQUARE_BRACE', /^\]/),
  createRegExpTokenType('LEFT_CURLY_BRACE', /^\{/),
  createRegExpTokenType('RIGHT_CURLY_BRACE', /^\}/),
  createRegExpTokenType('LEFT_PARENTHESIS', /^\(/),
  createRegExpTokenType('RIGHT_PARENTHESIS', /^\)/),
  createRegExpTokenType('ATOM', /^[^,\{\}\[\]\(\)\n ]+/),
];

export const formatPosition = (position: Position) => {
  return `line: ${position.line}, column: ${position.column}`;
};
