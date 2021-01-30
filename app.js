const express=require('express');
const app=express();
const port=process.env.PORT||9900;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongo=require('mongodb');
const MongoClient = mongo.MongoClient;
const mongourl="mongodb://localhost:27017";
let db; 

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


//health check
app.get('/',(req,res) =>{
    res.send("Health OK");
});

//city Route
app.get('/city',(req,res) =>{
    let sortcondition = {city_name:1};
    let limit=100;
    if(req.query.sort && req.query.limit){
        sortcondition = {city_name:Number(req.query.sort)}
        limit = Number(req.query.limit);
    }
    else if(req.query.sort){
        sortcondition = {city_name:Number(req.query.sort)}
    }
    else if(req.query.limit){
        limit = Number(req.query.limit);
    }
    db.collection('city').find().sort(sortcondition).limit(limit).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
});

//rest per city
app.get('/rest/:id',(req,res) =>{
    var id=req.params.id;
    db.collection('restaurant').find({city:id}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
});

//restaurant route
app.get('/rest',(req,res)=>{
    var condition={};
    //get rest on basis of meal + cost
    if(req.query.mealtype && req.query.lcost && req.query.hcost){
        condition = {$and:[{"type.mealtype":req.query.mealtype},{cost:{$lt:Number(req.query.hcost),$gt:Number(req.query.lcost)}}]}
    }
    //get rest on basis of meal + city
    else if(req.query.mealtype && req.query.city){
        condition = {$and:[{"type.mealtype":req.query.mealtype},{city:req.query.city}]}
    }
    //get rest on basis of meal + cuisine
    else if(req.query.mealtype && req.query.cuisine){
        condition = {$and:[{"type.mealtype":req.query.mealtype},{"Cuisine.cuisine":req.query.cuisine}]}
    }
    //get rest on basis of meal
    else if(req.query.mealtype){
        condition = {"type.mealtype":req.query.mealtype}
    }
    //get rest on basis of city
    else if(req.query.city){
        condition = {city:req.query.city}
    }
    db.collection('restaurant').find(condition).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
});

//post restaurant order
app.post('/placeorder',(req,res) => {
    db.collection('orders').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('data added');
    })
})

//get all ordered list
app.get('/orders',(req,res) => {
    let sortcondition = {cost:1};
    let limit=50;
    if(req.query.sort && req.query.limit){
        sortcondition = {cost:Number(req.query.sort)}
        limit = Number(req.query.limit);
    }
    else if(req.query.sort){
        sortcondition = {cost:Number(req.query.sort)}
    }
    else if(req.query.limit){
        limit = Number(req.query.limit);
    }
    db.collection('orders').find().sort(sortcondition).limit(limit).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})

//update order
app.put('/updateorder',(req,res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection('orders').update(
        {_id:id},
        {
            $set:{
                mealtype:req.body.mealtype,
                cuisine:req.body.cuisine,
                cost:req.body.cost,
                uname:req.body.uname
            }
        },(err,result) => {
            if(err) throw err;
            res.status(200).send('Data Updated');
        }
    )
})

//delete order
app.delete('/deleteorder',(req,res) => {
    var id = mongo.ObjectID(req.body._id)
    db.collection('orders').remove({_id:id},(err,result)=>{
        if(err) throw err;
        res.status(200).send("Data Removed")
    })
})

//Mealtype route
app.get('/meal',(req,res)=>{
    let sortcondition = {name:1};
    let limit=50;
    if(req.query.sort && req.query.limit){
        sortcondition = {name:Number(req.query.sort)}
        limit = Number(req.query.limit);
    }
    else if(req.query.sort){
        sortcondition = {name:Number(req.query.sort)}
    }
    else if(req.query.limit){
        limit = Number(req.query.limit);
    }
    db.collection('mealType').find().sort(sortcondition).limit(limit).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
});

//cuisine route
app.get('/cuisine',(req,res)=>{
    let sortcondition = {name:1};
    let limit=50;
    if(req.query.sort && req.query.limit){
        sortcondition = {name:Number(req.query.sort)}
        limit = Number(req.query.limit);
    }
    else if(req.query.sort){
        sortcondition = {name:Number(req.query.sort)}
    }
    else if(req.query.limit){
        limit = Number(req.query.limit);
    }
    db.collection('cuisine').find().sort(sortcondition).limit(limit).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    });
});

//connecton with mongo server
MongoClient.connect(mongourl,(err,connection)=>{
    if(err) console.log(err);
    db=connection.db('edunov');

    app.listen(port,(err)=>{
        if(err) throw err;
        console.log(`server is running on port ${port}`);
    });
});