const {Schema, model} = require('mongoose')

const ItemSchema = new Schema({
    name: String,
    desc: String,
    chars: Array,
    price: Number,
    oldPrice: Number,
    reviews: Array,
    views: Number,
    likes: Number,
    images: Array,
    categoryID: {type: Schema.Types.ObjectId}
})

module.exports = model('Item', ItemSchema)