const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");
const sequelize = require("../../config/connection");

// The `/api/products` endpoint

// get all products
router.get("/", (req, res) => {
  Product.findAll({
    include: [
      {
        model: Category,
        attributes: ["id", "category_name"],
      },
      {
        model: Tag,
        attributes: ["id", "tag_name"],
      },
    ],
  })
    .then((dbProductData) => res.json(dbProductData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
  // find all products
  // be sure to include its associated Category and Tag data
});

// get one product
router.get("/:id", async (req, res) => {
  try {
    let product = await Product.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Category,
          attributes: ["id", "category_name"],
        },
        {
          model: Tag,
          attributes: ["id", "tag_name"],
        },
      ],
    });

    if (!product) return res.status(404).json({ message: "product not found" });
    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// find a single product by its `id`
// be sure to include its associated Category and Tag data

// create new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then(async (product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        product = product.toJSON();
        const unparsedTags = await ProductTag.bulkCreate(productTagIdArr);
        const tags = unparsedTags.map((tag) => tag.toJSON());
        return { ...product, tags };
      }
      // if no product tags, just respond
      res.status(201).json(product);
    })
    .then((productWithTagIds) => {
      console.log(productWithTagIds);
      res.status(200).json({ product: productWithTagIds });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put("/:id", (req, res) => {
  // update product data
  console.log("hello");
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      console.log(req.body);
      const newProductTags = req.body.tags
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tags.includes(tag_id))
        .map(({ id }) => id);
      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await ProductTag.destroy({ where: { product_id: id } });
    let deletedProduct = await Product.destroy({
      where: {
        id,
      },
    });
    if (!deletedProduct)
      return res
        .status(404)
        .json({ message: "cannot delete a product that doesn't exist" });
    return res.status(200).json({
      message: "product deleted",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err.message });
  }
});

module.exports = router;
