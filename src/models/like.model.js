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

// A like must point to exactly one supported target so a single document cannot
// accidentally represent multiple likes at once.
likeSchema.pre("validate", function(next) {
    const targets = [this.video, this.comment].filter(Boolean);

    if (targets.length !== 1) {
        return next(new Error("A like must belong to exactly one entity"));
    }

    next();
});

// These partial unique indexes prevent duplicate likes per user per entity
// while still allowing likes on different entity types.
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

// Query-heavy relationship fields get their own indexes for faster fan-out
// reads such as listing likes for a video/comment or a user's liked content.
likeSchema.index({ video: 1, createdAt: -1 });
likeSchema.index({ comment: 1, createdAt: -1 });
likeSchema.index({ likedBy: 1, createdAt: -1 });

export const Like = mongoose.model("Like", likeSchema);
