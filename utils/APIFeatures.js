class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];

        excludeFields.forEach((field) => delete queryObj[field]);

        // Advanced filtering
        let queryString = JSON.stringify(queryObj);
        // Replace >= | > | <= | <
        queryString = queryString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Default behaviour
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        // Field Limiting
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').replace(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__V');
        }
        return this;
    }

    paginate() {
        // Pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
