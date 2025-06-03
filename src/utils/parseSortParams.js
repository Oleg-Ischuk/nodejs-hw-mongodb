import createError from 'http-errors';

const SORT_FIELDS = [
  'name',
  'phoneNumber',
  'email',
  'contactType',
  'isFavourite',
  'createdAt',
  'updatedAt',
];

const parseSortParams = (query) => {
  const { sortBy = 'name', sortOrder = 'asc' } = query;

  // Валідація sortBy
  if (!SORT_FIELDS.includes(sortBy)) {
    throw createError(
      400,
      `Invalid sortBy field. Allowed fields: ${SORT_FIELDS.join(', ')}`,
    );
  }

  // Валідація sortOrder
  if (!['asc', 'desc'].includes(sortOrder)) {
    throw createError(400, 'sortOrder must be either "asc" or "desc"');
  }

  return {
    sortBy,
    sortOrder,
  };
};

export default parseSortParams;
