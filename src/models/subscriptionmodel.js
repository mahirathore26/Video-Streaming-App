import mongoose,{Schema} from "mongoose";
const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

// This guarantees one subscription relationship per subscriber/channel pair
// even under concurrent requests.
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// These directional indexes support the two main access patterns in the app:
// listing a channel's subscribers and listing the channels a user follows.
subscriptionSchema.index({ channel: 1, createdAt: -1 });
subscriptionSchema.index({ subscriber: 1, createdAt: -1 });

export const Subscription = mongoose.model("Subscription",subscriptionSchema) 
