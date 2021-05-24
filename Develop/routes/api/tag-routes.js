const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", (req, res) => {
  Tag.findAll({
    include: [
      {
        model: Product,
        attributes: ["id", "product_name", "price", "stock", "category_id"],
      },
    ],
  })
    .then((dbTagData) => res.json(dbTagData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
  // find all tags
  // be sure to include its associated Product data
});

router.get("/:id", async (req, res) => {
  try {
    let tag = await Tag.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Product,
          attributes: ["id", "product_name", "price", "stock", "category_id"],
        },
      ],
    });

    if (!tag) return res.status(404).json({ message: "tag not found" });
    return res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    let tag = await Tag.create(req.body);
    return res.status(201).json(tag);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
});

// create a new tag
router.put("/:id", async (req, res) => {
  try {
    let tag = await Tag.findByPk(req.params.id);
    let updatedTag = await tag.update(req.body);
    if (!updatedTag)
      return res.status(404).json({
        message: "cannot upate tag that doesn't exist",
      });
    return res.status(200).json({
      tag: updatedTag,
    });
  } catch (err) {
    console.log(err);
    let { message } = err;
    return res.status(500).json({ message });
  }
});
// update a tag's name by its `id` value
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await ProductTag.destroy({ where: { tag_id: id } });
    let deletedTag = await Tag.destroy({ where: { id } });
    if (!deletedTag)
      return res
        .status(404)
        .json({ message: "cannot delete tag that doesn't exist" });
    return res.status(200).json({
      message: "tag deleted",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err.message });
  }
});
// delete on tag by its `id` value
module.exports = router;
