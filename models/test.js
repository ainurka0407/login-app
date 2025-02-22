//test.js
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ value: String, label: String }],
  correctAnswer: { type: String, required: true },
});


const Test = mongoose.model('Test', testSchema, 'tests');

module.exports = Test;
