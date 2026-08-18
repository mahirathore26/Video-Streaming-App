import mongoose , { Schema } from "mongoose";
const likeSchema = new Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment",
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
},{
    timestamps:true
})

likeSchema.pre("validate", function () {
    const targets = [this.video, this.comment].filter(Boolean);

    if (targets.length !== 1) {
        throw new Error("A like must belong to exactly one entity");
    }
});

likeSchema.index(
    { likedBy: 1, video: 1 },
    {
        unique: true,
        partialFilterExpression: { video: { $exists: true } }
    }
);
likeSchema.index(
    { likedBy: 1, comment: 1 },
    {
        unique: true,
        partialFilterExpression: { comment: { $exists: true } }
    }
);


likeSchema.index({ video: 1, createdAt: -1 });
likeSchema.index({ comment: 1, createdAt: -1 });
likeSchema.index({ likedBy: 1, createdAt: -1 });

export const Like = mongoose.model("Like", likeSchema);
