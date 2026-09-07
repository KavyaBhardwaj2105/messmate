const mongoose = require('mongoose');

const refreshSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  familyId: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: { type: Date, default: null },
  replacedByHash: { type: String, default: null },
  userAgent: { type: String, maxlength: 500 },
  ip: { type: String, maxlength: 100 },
}, { timestamps: true });

module.exports = mongoose.model('RefreshSession', refreshSessionSchema);
