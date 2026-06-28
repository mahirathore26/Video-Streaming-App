import mongoose , { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema = new Schema({
    content:{
        type:String,
        required:true,
        trim:true,
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
        required:true,
    },
    owner:{
        type:Schema.Types.ObjectId,

        ref:"User",
        required:true,
    },
    

},{
    timestamps:true
})

// Comments are most commonly fetched by video and often filtered or joined by
// owner, so these indexes keep list and moderation queries efficient as data grows.
commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ owner: 1, createdAt: -1 });

commentSchema.plugin(mongooseAggregatePaginate);    
export const Comment = mongoose.model("Comment",commentSchema)
