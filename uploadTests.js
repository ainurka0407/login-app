//uploadTests.js
const { MongoClient } = require("mongodb");

// URL подключения (замени на свой, если используешь MongoDB Atlas)
const uri = "mongodb://127.0.0.1:27017";

// Название базы данных и коллекции
const dbName = "webTestsDB";
const collectionName = "tests";

// Тесты, которые нужно добавить
const tests = [
  {
    question: "What tag is used to define a hyperlink in HTML?",
    options: [
      { value: "a", label: "link" },
      { value: "b", label: "a" },
      { value: "c", label: "href" },
      { value: "d", label: "hyper" },
    ],
    correctAnswer: "b",
  },
  {
    question: "Which tag creates the largest heading in HTML?",
    options: [
      { value: "a", label: "h6" },
      { value: "b", label: "h1" },
      { value: "c", label: "header" },
      { value: "d", label: "head" },
    ],
    correctAnswer: "b",
  },
  {
    question: "What is the purpose of the <br> tag?",
    options: [
      { value: "a", label: "Start a new paragraph" },
      { value: "b", label: "Break line" },
      { value: "c", label: "Bold text" },
      { value: "d", label: "Create a list" },
    ],
    correctAnswer: "b",
  },
  // Добавь остальные вопросы здесь...
];

(async () => {
  const client = new MongoClient(uri);

  try {
    // Подключаемся к серверу MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    // Получаем доступ к базе данных и коллекции
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Очищаем коллекцию, чтобы избежать дубликатов
    await collection.deleteMany({});

    // Добавляем тесты
    const result = await collection.insertMany(tests);
    console.log(`${result.insertedCount} tests added successfully!`);
  } catch (err) {
    console.error("Error connecting to MongoDB or inserting data", err);
  } finally {
    // Закрываем соединение
    await client.close();
  }
})();
