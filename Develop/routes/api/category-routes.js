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

router.get("/:id", (req, res) => {
  Category.findOne({
    where: {
      id: req.params.id,
    },
    include: [
      {
        model: Product,
        attributes: ["id", "product_name", "price", "stock", "category_id"],
      },
    ],
  })
    .then((dbCategoryData) => {
      if (!dbCategoryData) {
        //server could not find the requested website with id value => 404 error
        //status code is used to communicate if it's really the server's fault or the client fault
        res.status(404).json({ message: "Category ID does not exist" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
  // find one category by its `id` value
  // be sure to include its associated Products
});

router.post("/", (req, res) => {
  Category.create({});
  // create a new category
});

router.put("/:id", (req, res) => {
  Category.update({});
  // update a category by its `id` value
});

router.delete("/:id", (req, res) => {
  Category.destroy({});
  // delete a category by its `id` value
});

module.exports = router;
