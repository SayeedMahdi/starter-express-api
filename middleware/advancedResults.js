import ability from "../config/roles/ability.js";

const advancedResults = async ({ query, database, user }, res, next) => {

  // Check for Collection Model Existence
  if (!database || !database.model) {
    return next(new Error("Model is not defined"));
  }
  // Check aggregate stages
  if (database.aggregate && !database.aggregate.length > 0) {
    return next(new Error("No aggregation stages are provided"))
  }
  // Query params
  const sort = {};
  sort[query.sortColumn || "createdAt"] = query.sort === "asc" ? 1 : -1;
  const perPage = Number(query.perPage) || 10;
  const page = Number(query.page) || 1;

  // Database options
  const Model = database.model;
  const search = database?.search || {};
  const select = database?.select || "";

  // Get results based on query
  const getQueryResults = () => ({
    // Count documents
    countDocuments: () => (
      (database.deleted
        ? Model.countDocumentsDeleted(search)
        : Model.countDocuments(search)
      )
        .accessibleBy(
          database.control
            ? user.ability
            : ability("read", Model.modelName)
        )
    ),
    // Query results
    fetchResults: () => (
      (database.deleted
        ? Model.findDeleted(search)
        : Model.find(search)
      )
        .select(select)
        .populate(database?.populate)
        .accessibleBy(
          database.control
            ? user.ability
            : ability("read", Model.modelName)
        )
        .limit(perPage)
        .skip(perPage * (page - 1))
        .sort(sort)
        .lean()
    )
  })

  // Get results based on aggregation
  const getAggregationResults = () => ({
    // Count documents
    countDocuments: () => (
      Model.aggregate([
        ...database.aggregate,
        { $count: "total" }
      ]).then(result => {
        if (result.length === 0) {
          return 0
        }
        return result[0]["total"]
      })
    ),
    // Query results
    fetchResults: () => (
      Model.aggregate([
        ...database.aggregate,
        { $limit: perPage },
        { $skip: perPage * (page - 1) },
        { $sort: sort },
      ])
    )
  })

  const { countDocuments, fetchResults } = database.hasOwnProperty("aggregate")
    ? getAggregationResults()
    : getQueryResults();

  const count = await countDocuments();
  const results = await fetchResults();

  return res.json({
    length: count,
    results,
    page,
    pages: Math.ceil(count / perPage),
  });
};

export default advancedResults;
