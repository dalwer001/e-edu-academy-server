const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config()
const port = process.env.PORT || 5500;


app.use(cors())
app.use(express.json());
app.use(fileUpload());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u97y4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

    const courseCollection = client.db("eEducation").collection("courses");
    const reviewCollection = client.db("eEducation").collection("reviews");
    const ordersCollection = client.db("eEducation").collection("orders");
    const adminsCollection = client.db("eEducation").collection("admins");


    app.post('/addCourse', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        courseCollection.insertOne({ title, description, image, price })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.get('/courses', (req, res) => {
        courseCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post('/addReview', (req, res) => {
        reviewCollection.insertOne(req.body)
            .then(result => {
                res.send(result)
            })
    })
    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.get('/courseOrder/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        courseCollection.find({ _id: id })
            .toArray((err, course) => {
                res.send(course[0]);
            })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0)
            })
    })


    app.get('/courseList', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, courses) => {
                res.send(courses);
            })
    })
    app.get('/ordersList', (req, res) => {
        ordersCollection.find()
            .toArray((err, orders) => {
                res.send(orders);
            })
    })
    app.patch('/updateOrderList/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        ordersCollection.updateOne({ _id: id },
            {
                $set: { status: req.body.status }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    app.delete('/deleteCourse/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        courseCollection.deleteOne({ _id: id })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })


    app.post('/addAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.insertOne({ email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })


    app.get('/admin', (req, res) => {
        adminsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })


});







app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port);