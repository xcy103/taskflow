import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // every board query is scoped by owner
    },
  },
  { timestamps: true }
);

export const Board = mongoose.model('Board', boardSchema);
