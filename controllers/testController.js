//testController.js
const Test = require('../models/test');

exports.getTests = async (req, res) => {
  try {
    const tests = await Test.find({});
    console.log("Fetched tests from database:", tests); // Логируем данные

    res.json(tests);
  } catch (error) {
    console.error("Error fetching tests:", error); // Логируем ошибку
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.deleteTestQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Test.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found.' });
    }
    res.json({ message: 'Question deleted successfully.' });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.addTestQuestion = async (req, res) => {
  try {
    // Expecting: { testName, question, options, correctAnswer }
    const { testName, question, options, correctAnswer } = req.body;
    if (!question || !options || !correctAnswer) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Create new question document.
    const newQuestion = new Test({
      testName: testName || "Default Test", // optionally include testName if needed
      question,
      options, // expect options as an array: [{ value: 'a', label: 'Option A' }, ...]
      correctAnswer
    });
    const savedQuestion = await newQuestion.save();
    res.json(savedQuestion);
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};