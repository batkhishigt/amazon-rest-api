module.exports = async function (Model, limit, page) {
  const total = await Model.countDocuments();
  const pageCount = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  let end = start + limit - 1;
  if (end > total) end = total;
  const pagination = { total, pageCount, start, end };

  if (page < pageCount) pagination.nextPage = page + 1;
  if (page > 1) pagination.prevPage = page - 1;
  return pagination;
};
