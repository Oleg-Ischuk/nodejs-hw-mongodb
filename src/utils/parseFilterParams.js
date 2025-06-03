import createError from 'http-errors';

const parseFilterParams = (query) => {
  const { type, isFavourite } = query;
  const filter = {};

  if (type) {
    const validTypes = ['work', 'home', 'personal'];
    if (!validTypes.includes(type)) {
      throw createError(
        400,
        `Invalid contact type. Allowed types: ${validTypes.join(', ')}`,
      );
    }
    filter.contactType = type;
  }

  if (isFavourite !== undefined) {
    if (isFavourite === 'true') {
      filter.isFavourite = true;
    } else if (isFavourite === 'false') {
      filter.isFavourite = false;
    } else {
      throw createError(400, 'isFavourite must be either "true" or "false"');
    }
  }

  return filter;
};

export default parseFilterParams;
