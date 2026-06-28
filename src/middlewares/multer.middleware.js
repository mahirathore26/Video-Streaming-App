import multer from "multer";
import path from "path";

const storage=multer.diskStorage({
    destination: function (req,file,cb){
        cb(null, "./public/temp");
    },
    filename: function (req,file,cb){
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension).replace(/\s+/g, "-");
        cb(null, `${Date.now()}-${baseName}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        return cb(null, true);
    }

    cb(new Error("Only image and video files are allowed"));
};

 export const upload = multer({storage,fileFilter})
;    
