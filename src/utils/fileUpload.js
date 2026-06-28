import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.cloudinary_cloud_name,
    api_key:process.env.cloudinary_api_key,
    api_secret:process.env.cloudinary_api_secret

});

 const uploadonCloudinary=async (localfilepath)=>{
    try{
        if(!localfilepath)return null;
        const response=await cloudinary.uploader.upload(localfilepath,{
        resource_type:"auto"
        })
    
    fs.unlinkSync(localfilepath)
    return response;
        }
    catch(err){
    if(fs.existsSync(localfilepath)){
        fs.unlinkSync(localfilepath);
    }
    return null;
}
}

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
    } catch (err) {
        return null;
    }
}

export { uploadonCloudinary, deleteFromCloudinary };
