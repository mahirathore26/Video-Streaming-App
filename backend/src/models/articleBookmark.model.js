import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const articleBookmarkSchema = new Schema(
    {
        article: {
            type: Schema.Types.ObjectId,
            ref: "Article",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

articleBookmarkSchema.index({ user: 1, article: 1 }, { unique: true });
articleBookmarkSchema.index({ user: 1, createdAt: -1 });

articleBookmarkSchema.plugin(mongooseAggregatePaginate);
export const ArticleBookmark = mongoose.model("ArticleBookmark", articleBookmarkSchema);
