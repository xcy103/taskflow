import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Matches listBoards: filter by owner, sort by createdAt. Cosmos requires the
// sort field to be indexed, so this must cover the sort too (not just owner).
boardSchema.index({ owner: 1, createdAt: -1 });

export const Board = mongoose.model('Board', boardSchema);
