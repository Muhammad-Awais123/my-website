const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // یہ خود بخود createdAt اور updatedAt add کرے گا
);

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
