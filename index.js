const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const port = process.env.PORT;
const router = require('./Items/router/router')

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
  optionsSuccessStatus: 204,
}));

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
