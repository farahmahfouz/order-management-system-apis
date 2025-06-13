class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['limit', 'page', 'sort', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let mongoQuery = {};

    Object.keys(queryObj).forEach((key) => {
      if (key.includes('[')) {
        const [field, operator] = key.split('[');
        const cleanOperator = operator.replace(']', '');
        mongoQuery[field] = {
          ...(mongoQuery[field] || {}),
          [`$${cleanOperator}`]: Number(queryObj[key]),
        };
      } else {
        mongoQuery[key] = isNaN(queryObj[key])
          ? queryObj[key]
          : Number(queryObj[key]);
      }
    });

    this.query = this.query.find(mongoQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort === 'totalStockValue') {
      this.manualSortByTotalStock = true;
    } else if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt _id');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  search() {
    if (this.queryString.search) {
      const searchTerm = this.queryString.search;
      this.query = this.query.find({ $text: { $search: searchTerm } });
    }
    return this;
  }
}

module.exports = APIFeatures;
