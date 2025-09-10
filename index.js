require('dotenv').config();
const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const connectToMongo = require('./db');
const app = express();
const port = 5000;

app.use(cors({
  origin: ["http://localhost:5173", "https://i-note-book-two.vercel.app"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

connectToMongo();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => {
  res.send('Hello World!!!')
});

app.listen(port, () => {
  console.log(`iNoteBook backend listening on http://localhost:${port}`);
});