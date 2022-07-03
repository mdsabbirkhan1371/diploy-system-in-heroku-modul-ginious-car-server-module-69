// first step 
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware 
app.use(cors());
app.use(express.json());

function verifyJWt(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log("inside verify", authHeader)
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized acces' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" })
        }
        // console.log('decoded', decoded)
        req.decoded = decoded;
        next();
    })

}

// connect to mongo db 

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.hzysi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const serviceCollection = client.db("Genious-Car-Service").collection("service");

        // order collection
        const orderCollection = client.db('Genious-Car-Service').collection('order');


        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


        // service API
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

        // post methode 

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

        // order collection api
        app.get('/order', verifyJWt, async (req, res) => {
            const decodeMail = req.decoded.email;
            // console.log(decodeMail)
            const email = req.query.email;
            if (email === decodeMail) {
                const query = { email: email }
                const cursor = orderCollection.find(query)
                const orders = await cursor.toArray()
                res.send(orders)
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }

        })


        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
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