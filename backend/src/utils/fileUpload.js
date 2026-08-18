import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.cloudinary_cloud_name,
    api_key:process.env.cloudinary_api_key,
    api_secret:process.env.cloudinary_api_secret

});

  const uploadonCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null;
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });
    
        // Asynchronous, non-blocking disk cleanup.
        fs.promises.unlink(localfilepath).catch(() => {});
        return response;
    } catch (err) {
        // Only attempt to clean up if the file path exists, but do it asynchronously.
        // We do not throw or expose cleanup failures.
        if (localfilepath) {
            fs.promises.unlink(localfilepath).catch(() => {});
        }
        // Properly propagate the original Cloudinary upload error rather than masking it behind "null".
        throw err;
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

const extractPublicIdFromCloudinaryUrl = (url) => {
    if (!url) return null;
    const splitUrl = url.split("/");
    const uploadIndex = splitUrl.indexOf("upload");
    if (uploadIndex === -1) return null;
    
    let publicIdSegment = splitUrl.slice(uploadIndex + 1);
    // Ignore the version string if it exists (e.g. v1634567890)
    if (publicIdSegment[0] && publicIdSegment[0].match(/^v\d+$/)) {
        publicIdSegment.shift();
    }
    
    const publicIdWithExtension = publicIdSegment.join("/");
    const lastDotIndex = publicIdWithExtension.lastIndexOf(".");
    return lastDotIndex !== -1 
        ? publicIdWithExtension.substring(0, lastDotIndex) 
        : publicIdWithExtension;
};

export { uploadonCloudinary, deleteFromCloudinary, extractPublicIdFromCloudinaryUrl };
