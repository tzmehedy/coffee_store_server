const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const app = express()
require("dotenv").config()

const port = process.env.PORT || 5000

//Middle ware
app.use(cors())
app.use(express.json())

app.get('/', (req,res)=>{
    res.send("coffee is coming soon")
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k8aq9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const coffeesCollection = client.db("coffeesDB").collection("coffees")


    app.get('/coffees', async(req,res)=>{
      const cursor = coffeesCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/coffees/:id',async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await coffeesCollection.findOne(query)
      res.send(result)
    })

    app.post('/coffees', async (req, res)=>{
      const coffees = req.body
      const result = await coffeesCollection.insertOne(coffees)
      res.send(result)
    })

    app.put("/coffees/:id", async(req,res)=>{
      const id = req.params.id
      const newCoffee = req.body

      const filter = {_id: new ObjectId(id)}

      const options = {upsert:true}

      const coffee = {
        $set: {
          name: newCoffee.name,
          chefName:newCoffee.chefName,
          supplier:newCoffee.supplier,
          taste:newCoffee.taste,
          category:newCoffee.category,
          details:newCoffee.details,
          photo:newCoffee.photo,
        },
      };

      const result = await coffeesCollection.updateOne(filter, coffee, options)

      res.send(result)


    })

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await coffeesCollection.deleteOne(query);

      res.send(result);
    });
   
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.listen(port, ()=>{
    console.log(`The Coffee server is running on the port: ${port}`)
})
