const Category = require("../models/category");
const Item = require("../models/Item");

class ItemsController {
  async create(req, res) {
    try {
      const { parentId, name, img, icon, lvl, maxLvl } = req.body;

      let parentCategory;

      if (parentId) {
        parentCategory = await Category.findById(parentId);

        if (!parentCategory) {
          return res
            .status(404)
            .json({ msg: "Родительская категория не найдена" });
        }
      } else {
        parentCategory = null;
      }

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
        parentCategory: null,
      }).populate("childCategories");
      res.status(200).json(topLevelCategories);
    } catch (error) {
      console.error("Ошибка при получении категорий:", error);
      res
        .status(500)
        .json({ msg: "Internal server error", error: error.message });
    }
  }
  async getSubcategory(req, res) {
    try {
        const { id } = req.query;
        const page = parseInt(req.query.page) || 1;
        const pageSize = 24;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ msg: "Category not found" });
        }

        const categoryName = category.name;

        const totalItems = await Item.countDocuments({ categoryID: id });
        const pageCount = Math.ceil(totalItems / pageSize);

        const items = await Item.find({ categoryID: id })
            .sort({ stock_quantity: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        if (!items) {
            return res.status(500).json({ msg: "Failed to load category items" });
        }

        return res.status(200).json({ categoryName, items, pageCount });
    } catch (e) {
        console.error("Internal Server Error", e);
        return res
            .status(500)
            .json({ msg: "Internal Server Error", error: `${e}` });
    }
}




  async productCreate(req, res) {
    try {
      const { id, products } = req.body;

      const item = await Category.findById(id);
      if (!item) {
        res.status(404).json({ msg: "Category is not found" });
      }

      if (item.lvl === item.maxLvl) {
        let addedProducts = [];
        let productsAdded = false;

        for (const productData of products) {
          const newPrice = productData.price * 1.3;
          const oldPrice = productData.oldPrice * 1.3;

          // Skip the product if price is 0
          if (newPrice < 1) {
            continue;
          }

          const newProduct = new Item({
            name: productData.name,
            desc: productData.desc,
            chars: productData.chars,
            price: newPrice,
            oldPrice: oldPrice,
            reviews: productData.reviews,
            views: productData.views,
            likes: productData.likes,
            images: productData.images,
            stock_quantity: productData.stock_quantity,
            keywords: productData.keywords,
            seller: productData.seller || "88",
            categoryID: id,
          });

          await newProduct.save();
          item.items.push(newProduct);
          await item.save();
        }

        res.status(200).json({ msg: "products added", item });
      } else {
        res.status(500).json({ msg: "lvl != maxLvl" });
      }
    } catch (e) {
      console.error("Internal Server Error", e);
      return res
        .status(500)
        .json({ msg: "Internal Server Error", error: `${e}` });
    }
  }
  async getProduct(req, res) {
    try {
      const { id } = req.body;

      const item = await Item.findById(id);

      if (!item) {
        res.status(404).json({ msg: "Item not found" });
      }

      res.status(200).json(item);
    } catch (e) {
      res.status(500).json({ msg: "Internal Server error", error: `${e}` });
    }
  }
  async getNewProducts(req, res) {
    try {
      const newProducts = await Item.find({})
        .sort({ createdAt: -1 }) // Сортируем по убыванию даты создания
        .limit(10); // Получаем первые 10 товаров, вы можете изменить это значение по вашему усмотрению

      res.status(200).json(newProducts);
    } catch (e) {
      console.error("Internal Server Error", e);
      res.status(500).json({ msg: "Internal Server Error", error: `${e}` });
    }
  }
async getPopularProducts(req, res) {
    try {
        const { id } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ msg: "Category not found" });
        }

        // Populating childCategories and their items
        await category.populate({
            path: "childCategories",
            populate: {
                path: "items",
            },
        });

        // Creating an array of items from all child categories
        const allItems = category.childCategories.reduce(
            (items, childCategory) => {
                items.push(...childCategory.items);
                return items;
            },
            category.items
        );

        // Sorting products by availability first (in stock first, then out of stock),
        // and then by views in descending order
        const popularProducts = allItems
            .sort((a, b) => {
                // Sort by availability first
                const availabilityComparison = b.stock_quantity - a.stock_quantity;
                if (availabilityComparison !== 0) {
                    return availabilityComparison;
                }

                // If availability is the same, sort by views
                return b.views - a.views;
            })
            .slice(0, 8); // Getting the first 8 popular products

        res.status(200).json(popularProducts);
    } catch (e) {
        console.error("Internal Server Error", e);
        res.status(500).json({ msg: "Internal Server Error", error: `${e}` });
    }
}

async search(req, res) {
    try {
        const { query, page = 1 } = req.query;
        const pageSize = 8;

        if (!query) {
            return res.status(400).json({ msg: "Query parameter is required" });
        }

        const regex = new RegExp(query, 'i'); // Case-insensitive search using regular expression

        const productsInStock = await Item.find({ 
            stock_quantity: { $gt: 1 },
            name: regex // Add this line to search by name
        }).sort({ stock_quantity: -1 });
        
        const totalItemsInStock = productsInStock.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;

        // If there are enough items in stock to fill the page, use only in-stock items
        const results = totalItemsInStock >= endIndex
            ? productsInStock.slice(startIndex, endIndex)
            : [
                ...productsInStock.slice(startIndex),
                ...(await Item.find({ stock_quantity: 0, name: regex }).sort({ stock_quantity: -1 }))
            ];

        const totalPages = Math.ceil((totalItemsInStock + pageSize - 1) / pageSize);

        res.status(200).json({ results, totalPages });
    } catch (e) {
        console.error("Internal Server Error", e);
        return res
            .status(500)
            .json({ msg: "Internal Server Error", error: `${e}` });
    }
}

}

module.exports = new ItemsController();