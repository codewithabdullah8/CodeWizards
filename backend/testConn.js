// Simple connection test script. Usage:
// Windows PowerShell:
// $env:MONGODB_URI="your-uri"; node testConn.js

require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydiaryDB';
console.log('Testing connection to:', uri);

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('OK: connected');
    return mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Connection failed:', err);
    process.exit(1);
  });
