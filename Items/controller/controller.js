const Category = require("../models/category");
const Item = require("../models/Item");

class ItemsController {
  async create(req, res) {
    try {
      const { parentId, name, img, icon, lvl, maxLvl, products } = req.body;

      let parentCategory;

      if (parentId) {
        parentCategory = await Category.findById(parentId);

        if (!parentCategory) {
          return res
            .status(404)
            .json({ msg: "Родительская категория не найдена" });
        }
      } else {
        // Если parentId равен null, значит, это главная категория
        parentCategory = null;
      }

      // Проверка, что lvl не больше maxLvl
      if (lvl > maxLvl) {
        return res.status(400).json({ msg: "lvl не может быть больше maxLvl" });
      }

      const newCategory = new Category({
        name,
        img,
        icon,
        lvl,
        maxLvl,
        parentCategory: parentCategory ? parentCategory._id : null,
      });

      await newCategory.save();

      // Проверка, что lvl равен maxLvl для добавления товаров
      if (lvl === maxLvl && products && products.length > 0) {
        let addedProducts = [];

        for (const productData of products) {
          const newProduct = new Item({
            name: productData.name,
            categoryID: newCategory._id,
          });
          await newProduct.save();
          addedProducts.push(newProduct);
        }

        if (addedProducts.length > 0) {
          newCategory.items = addedProducts;
          await newCategory.save();
        }
      }

      if (parentCategory) {
        parentCategory.childCategories.push(newCategory._id);
        await parentCategory.save();
      }

      res.status(200).json({ created: true, newCategory, parentCategory });
    } catch (e) {
      res.status(500).json({ msg: "Internal Server Error", error: e.message });
    }
  }

  async all(req, res) {
    try {
      const topLevelCategories = await Category.find({
        parentCategory: null
      }).populate('childCategories')
      // const topLevelCategories = await Category.find({
      //   parentCategory: null,
      // }).populate({
      //   path: "childCategories",
      //   populate: {
      //     path: "items",
      //     model: "Item",
      //   },
      // });
      res.status(200).json(topLevelCategories);
    } catch (error) {
      console.error("Ошибка при получении категорий:", error);
      res
        .status(500)
        .json({ msg: "Internal server error", error: error.message });
    }
  }
}

module.exports = new ItemsController();
