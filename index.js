const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const port = 3000;
const router = require('./Items/router/router')

app.use(cors())
app.use(express.json())

app.use('/item', router)

const start = async () => {
    try {
        await mongoose.connect('mongodb+srv://88xgroup:3ziLyM33kkm26Txs@88server.etef7ng.mongodb.net/');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } catch (e) {
        console.log(e)
    }
}
start();