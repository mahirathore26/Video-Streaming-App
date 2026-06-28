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
    owner:{
        type: Schema.Types.ObjectId, 
        ref:"User",
        required:true,
    }   
},{
    timestamps:true
})

// Playlists are usually browsed by owner and recency, so this compound index
// supports dashboard/profile queries without changing the API layer.
playlistSchema.index({ owner: 1, createdAt: -1 });

// Name is a common search/display field, so indexing it helps future listing
// and lookup queries while remaining non-breaking for existing behavior.
playlistSchema.index({ name: 1 });

export const Playlist = mongoose.model("Playlist",playlistSchema)
