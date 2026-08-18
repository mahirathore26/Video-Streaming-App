import mongoose , { Schema } from "mongoose";
const playlistSchema = new Schema({
    name:{
        type:String,    
        required:true,
        trim:true,
    },  
    description:{
        type: String,
        required:true,
        trim:true,
    },
    videos:[
        {   
            type: Schema.Types.ObjectId,
            ref:"Video",
        }           
    ],
    articles:[
        {
            type: Schema.Types.ObjectId,
            ref: "Article",
        }
    ],
    owner:{
        type: Schema.Types.ObjectId, 
        ref:"User",
        required:true,
    }   
},{
    timestamps:true
})


playlistSchema.index({ owner: 1, createdAt: -1 });


playlistSchema.index({ name: 1 });

export const Playlist = mongoose.model("Playlist",playlistSchema)
