const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", (req, res) => {
  // find all categories
  Category.findAll({
    include: [
      {
        model: Product,
        attributes: ["id", "product_name", "price", "stock", "category_id"],
      },
    ],
  })
    .then((dbCategoryData) => res.json(dbCategoryData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
  // be sure to include its associated Products
});

router.get("/:id", async (req, res) => {
  try {
    let category = await Category.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "category not found" });
    return res.status(200).json(category);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

//server could not find the requested website with id value => 404 error
//status code is used to communicate if it's really the server's fault or the client fault
// find one category by its `id` value
// be sure to include its associated Products

router.post("/", async (req, res) => {
  try {
    let category = await Category.create(req.body);
    return res.status(201).json(category);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    let category = await Category.findByPk(req.params.id);
    let updatedCategory = await category.update(req.body);
    if (!updatedCategory)
      return res.status(404).json({
        message: "cannot upate a category that doesn't exist",
      });
    return res.status(200).json({
      category: updatedCategory,
    });
  } catch (err) {
    console.log(err);
    let { message } = err;
    return res.status(500).json({ message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let deletedCategory = await Category.destroy({ where: { id } });
    if (!deletedCategory)
      return res
        .status(404)
        .json({ message: "cannot delete a category that doesn't exist" });
    return res.status(200).json({
      message: "category deleted",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err.message });
  }
});
// delete a category by its `id` value

module.exports = router;
