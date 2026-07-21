import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    position: { type: Number, required: true }, // order within the board
  },
  { timestamps: true }
);

export const List = mongoose.model('List', listSchema);
