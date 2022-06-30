// first step 
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware 
app.use(cors());
app.use(express.json());

// connect to mongo db 

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.hzysi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const serviceCollection = client.db("Genious-Car-Service").collection("service");
        // getmultiple doc
        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services)
        });

        // get one doc 
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        // post metode 

        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService)
            res.send(result)
        })

        // delete methode 
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = serviceCollection.deleteOne(query)
            res.send(result)
        })


    }
    finally {

    }


}
run().catch(console.dir);


// client.connect(err => {
//     const collection = client.db("Genious-Car-Service").collection("service");
//     console.log('Mongo Connected')
//     // perform actions on the collection object
//     client.close();
// });





app.get('/', (req, res) => {
    res.send('Genious Car Server Is Running')
})

app.listen(port, () => {
    console.log('Listening Genious Car Server', port)
})