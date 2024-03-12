// dependencies
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// variables
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5333;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xjslrno.mongodb.net/?retryWrites=true&w=majority`;

// middleware
app.use(cors());
app.use(express.json());

// Connect to MONGODB client
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
    // await client.connect();

    // access db and tasks collection
    const myTasks = client.db("priority-tasks").collection("tasks");
    const myUsers = client.db("priority-tasks").collection("users");

    // read all tasks
    app.get("/api/v1/userTasks/:email", async (req, res) => {
      const email = req.params.email;
      // create query
      const query = { email };
      // console.log(query);
      const tasks = await myTasks.find(query).toArray();

      res.send(tasks);
    });

    // an api to get specific task details
    app.get("/api/v1/findTask/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      // create query
      const query = { _id: new ObjectId(id) };
      // console.log(query);
      const task = await myTasks.find(query).toArray();

      res.send(task);
    });

    // find which professionals are using it
    app.get("/api/v1/users", async (req, res) => {
      // Execute the distinct operation
      const count = await myUsers.estimatedDocumentCount();
      // res.send(result);
      // specify "borough" as the field to return values for
      const projection = { _id: 0, profession: 1 };
      const result = await myUsers.find().project(projection).toArray();
      const roles = result.map(role => role.profession);
      
      res.send({ count, roles })
    });

    // add a user task
    app.post("/api/v1/add-task", async (req, res) => {
      const task = req.body;
      // insert into collection
      const result = await myTasks.insertOne(task);
      // send back the result
      res.send(result);
    });

    // add  a user DB_PASS
    app.post("/api/v1/add-user", async(req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await myUsers.insertOne(user);
      res.send(result);
    })

    // update the task
    app.patch("/api/v1/update-task/:id", async (req, res) => {
      const id = req.params.id;
      const task = req.body;

      const filter = { _id: new ObjectId(id) };

      const updatedTask = {
        $set: {
          title: task.title,
          description: task.description,
          deadline: task.deadline,
          priority: task.priority,
        },
      };

      const result = await myTasks.updateOne(filter, updatedTask);

      res.send(result);
    });

    // delete a task
    app.delete("/api/v1/delete-task/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const result = await myTasks.deleteOne(filter);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// methods
app.get("/", (req, res) => {
  res.send("Task Managment Server IS RUNNING!!!");
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
