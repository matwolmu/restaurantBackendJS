const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./schemas/index.js'); 
const graphqlResolvers = require('./resolvers/index.js'); 
const mongoose = require('mongoose');
require('dotenv').config()

const User = require('./db_models/user.js'); 




const connectionURI = 'mongodb+srv://admin:' + process.env.MONGODB_PW + '@cluster0.mn3wn.mongodb.net/' + process.env.MONGODB_DBNAME + '?retryWrites=true&w=majority'
mongoose.connect(connectionURI, {useNewUrlParser: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("mongoDB connected");

    
})






const app = express();
// middleware
app.use(express.json());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST', 'PUT');
        return res.status(200).json({});
    }
    next(); 
});




app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,    
    graphiql: true 
}));




User.find(function (err, user) {
    if (err) return console.error(err);
    console.log(user);
  })

  User.findOne({ name: 'admin' }, function (err, user) {
      if(user){
         console.log(user) 
      } else {
        console.log("error") 
      }
      
  });




const port = process.env.PORT || 5000;
app.listen(port, () => console.log("running!!"));