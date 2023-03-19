import mongoose from 'mongoose';
import Property from '../mongodb/modles/property.js'

import User from '../mongodb/modles/user.js'
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const getAllProperties = async (req, res) => {

    const { _end, _order, _start, _sort, title_like = "", propertyType = "" } = req.query;
    const query = {};
    if (propertyType !== '') {
        query.propertyType = propertyType;
    }
    if (title_like) {
        //i means case insensitive
        query.title = { $regex: title_like, $options: 'i' };
    }
    try {

        const count = await Property.countDocuments({ query });
        const properties = await Property
            .find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order })


        res.header('x-total-count', count);
        //so that we can see the total count from header
        res.header('Access-Control-Expose-Headers', 'x-total-count')



        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getPropertyDetails = async (req, res) => {
    const { id } = req.params;
    const propertyExists = await Property.findOne({ _id: id }).populate('creator');

    if (propertyExists) { res.status(200).json(propertyExists) }
    else {
        res.status(404).json({ message: 'Property not found' })
    }

};
const createProperty = async (req, res) => {

    try {

        const { title, description, propertyType, location, price, photo, email } = req.body;

        //start a new session..

        // const session = await mongoose.startSession();
        // session.startTransaction();
        // const user = await User.findOne({ email }).session(session);
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');

        const photUrl = await cloudinary.uploader.upload(photo);

        const newProperty = await Property.create({
            title,
            description,
            propertyType,
            location,
            price,
            photo: photUrl.url,
            creator: user._id
        });

        user.allProperties.push(newProperty._id);

        user.save();
        // await user.save({ session });
        // await session.commitTransaction();
        res.status(200).json({ message: 'Property created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });

    }

};
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyToFindImage = await Property.findById({ _id: id })
        const { title, description, propertyType, location, price, photo } =
            req.body;


        var photoUrl ='';
        var pic = '';
        if(photo === ''){
             pic = (propertyToFindImage.photo)
        }
        else{

             photoUrl = await cloudinary.uploader.upload(photo);
        }

        await Property.findByIdAndUpdate(
            { _id: id },
            {
                title,
                description,
                propertyType,
                location,
                price,
                photo: photoUrl.url || pic,
            },
        );

        res.status(200).json({ message: "Property updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};
const deleteProperty = async (req, res) => {

    try {
        const { id } = req.params;

        const propertyToDelete = await Property.findById({ _id: id }).populate(
            "creator",
        );

        if (!propertyToDelete) throw new Error("Property not found");

        // const session = await mongoose.startSession();
        // session.startTransaction();

        const userId = propertyToDelete.creator._id;
        const user = await User.findOne({ userId });
        await Property.findOneAndRemove(id);
       console.log(user);
       user.allProperties.pull(id);
      user.save();

        // await  Property.findByIdAndRemove(id , (error ,  data) => {
        //     if(error){
        //         res.status(500).json({ message: error.message });

        //     }else{
        //         propertyToDelete.creator.allProperties.pull(propertyToDelete);
        //         propertyToDelete.creator.save()
        //     }
        // })

        //     propertyToDelete.remove({ session });
       // propertyToDelete.creator.allProperties.pull(propertyToDelete);

        // await propertyToDelete.creator.save({ session });
        // await session.commitTransaction();

        res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllProperties,
    getPropertyDetails,
    createProperty,
    updateProperty,
    deleteProperty
}