const {Schema, model} = require('mongoose')

const items = new Schema({
    name: String,
    desc: String,
    chars: Array,
    price: Number,
    oldPrice: Number,
    reviews: Array,
    views: Number,
    likes: Number,
    images: Array,
    keywords: Array,
    stock_quantity: Number,
    seller: String,
    categoryID: {type: Schema.Types.ObjectId}
})

module.exports = model('items', items)