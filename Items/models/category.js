const { Schema, model } = require("mongoose");

const ItemSchema = new Schema({
  name: { type: String },
  img: { type: String },
  icon: {type: String},
  lvl: {type: Number},
  maxLvl: {type: Number},
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  childCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  items: [{type: Schema.Types.ObjectId, ref: 'items'}]
});

module.exports = model("Category", ItemSchema);