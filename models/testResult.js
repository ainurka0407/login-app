const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testName: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  dateTaken: { type: Date, default: Date.now }
});

const TestResult = mongoose.model('TestResult', testResultSchema);
module.exports = TestResult;
