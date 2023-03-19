import { useState } from "react"

//gives identity of user who signin
import { useGetIdentity } from "@pankod/refine-core"

import { FieldValue , FieldValues, useForm } from "@pankod/refine-react-hook-form"

import { useNavigate } from "@pankod/refine-react-router-v6"
import Form from "components/common/Form"
import { readFile } from "fs"

const CreateProperty = () => {

  const navigate  = useNavigate();

  const {data :  user}  =  useGetIdentity();

  const [propertyImage ,  setPropertyImage] =  useState({name : '' ,  url : ''});
  const {refineCore : {onFinish ,  formLoading}  , register , handleSubmit} =  useForm();

  const handleImageChnage = (file : File) => {
    const reader  = (readFile : File) =>  new Promise<string>
    ((resolve ,  reject)=>{
      const fileReader =  new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string)
      fileReader.readAsDataURL(readFile);

    });

    reader(file).then((result :  string) => setPropertyImage({
      name : file?.name , url : result 
    }));
  }

  const onFinishHandler = async (data :  FieldValues) => {
    if(!propertyImage.name) return alert('Please select an image');

    await onFinish({...data , photo :  propertyImage.url , email : user.email })
  }
  return (
    <Form 
      type = "Create"
      register = {register}
      onFinish = {onFinish}
      formLoading = {formLoading}
      handleSubmit = {handleSubmit}
      handleImageChange = {handleImageChnage}
      onFinishHandler= {onFinishHandler}
      propertyImage = {propertyImage}/>
  )
}

export default CreateProperty