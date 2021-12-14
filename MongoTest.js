const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://Admin:${process.env.MONGO_USER}}@cluster0.${process.env.MONGO_KEY}.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });
client.connect(err=>{
    if (err) throw err;
    let dbo = client.db("Test");
    let myobj = { name: "Company Inc", address: "Highway 37" };
    dbo.collection("customers").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        client.close();
    });
})
