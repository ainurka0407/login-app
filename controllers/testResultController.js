//testResultController.js
const TestResult = require('../models/testResult');

exports.getUserResults = async (req, res) => {
    try {
      const userId = req.user && req.user._id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
      }
      const results = await TestResult.find({ userId });
      res.json(results);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

  
exports.createTestResult = async (req, res) => {
    try {
      const userId = req.user && req.user._id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
      }
      const { testName, score, total } = req.body;
      const newResult = new TestResult({ userId, testName, score, total });
      const savedResult = await newResult.save();
      res.json(savedResult);
    } catch (error) {
      console.error("Error saving test result:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
//for admin
exports.getAllResults = async (req, res) => {
    try {
      // Populate the userId field with the email from the User model
      const results = await TestResult.find({}).populate('userId', 'email');
      // Map results to add a safe userEmail property
      const formattedResults = results.map(result => ({
        userEmail: result.userId ? result.userId.email : "No email",
        testName: result.testName,
        score: result.score,
        total: result.total,
        date: result.dateTaken
      }));
      res.json(formattedResults);
    } catch (error) {
      console.error("Error fetching all test results:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  