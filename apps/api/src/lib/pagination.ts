import { Pagination } from '../types';

export const defaultPaginationLimit = 20;

export const maxPaginationLimit = 100;

export const normalizePagination = ({
  limit = defaultPaginationLimit,
  offset = 0,
}: Partial<Pagination>): Pagination => {
  return {
    limit:
      limit > 0 ? Math.min(limit, maxPaginationLimit) : defaultPaginationLimit,
    offset: offset >= 0 ? offset : 0,
  };
};
