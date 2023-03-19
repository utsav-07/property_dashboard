import express from 'express';
//allow to use environment varibale
import *  as dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './mongodb/connect.js';

import userRouter from './routes/user.routes.js'
import propertyRouter from './routes/property.routes.js';



dotenv.config();

// 


const app = express();
app.use(cors());
app.use(express.json({limit  : '50mb'}));

app.get('/' , (req ,  res) => {
    res.send({message : 'Hellow world'})
})

app.use('/api/v1/users' , userRouter);
app.use('/api/v1/properties', propertyRouter);

const startServer =  async () => {
    try{
        //connect to the database
        console.log(process.env.MONGODB_URL)
        connectDB(process.env.MONGODB_URL)
        app.listen(8081 ,() => console.log('server started'))
    }catch(err){
        console.log(err);
    }
}


startServer();
