import { Schema, model, models } from 'mongoose';

const SearchTermSchema = new Schema(
  {
    term: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    lastSearched: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SearchTerm = models.SearchTerm || model('SearchTerm', SearchTermSchema);

export default SearchTerm;
