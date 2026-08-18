import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.cloudinary_cloud_name,
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_api_secret
});

async function run() {
    try {
        console.log("Keys:", process.env.cloudinary_cloud_name, process.env.cloudinary_api_key, process.env.cloudinary_api_secret);
        const res = await cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", { resource_type: "auto" });
        console.log("Success:", !!res.url);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
run();
