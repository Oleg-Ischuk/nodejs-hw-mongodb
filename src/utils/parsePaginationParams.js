import createError from 'http-errors';

const parsePaginationParams = (query) => {
  const { page = 1, perPage = 10 } = query;

  const pageNumber = parseInt(page, 10);
  const perPageNumber = parseInt(perPage, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    throw createError(400, 'Page must be a positive number');
  }

  if (isNaN(perPageNumber) || perPageNumber < 1) {
    throw createError(400, 'perPage must be a positive number');
  }

  if (perPageNumber > 100) {
    throw createError(400, 'perPage cannot exceed 100');
  }

  return {
    page: pageNumber,
    perPage: perPageNumber,
  };
};

export default parsePaginationParams;
