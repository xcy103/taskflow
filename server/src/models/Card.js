import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
      index: true,
    },
    // Denormalized parent board — makes cascade-delete and board-wide queries cheap.
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    position: { type: Number, required: true }, // order within its list
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export const Card = mongoose.model('Card', cardSchema);
