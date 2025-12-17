
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydiaryDB';
const CRON_ENABLED = process.env.CRON_ENABLED !== 'false';

const User = require('./src/models/User');
const Diary = require('./src/models/Diary');
const Reminder = require('./src/models/Reminder');
const ProfessionalDiary = require('./src/models/ProfessionalDiary/ProfessionalDiary');

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/diary', require('./src/routes/diary'));
app.use('/api/reminders', require('./src/routes/reminders'));
app.get('/api/health', (req,res)=>res.json({ok:true}));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/diary', require('./src/routes/diary'));
app.use('/api/reminders', require('./src/routes/reminders'));
app.use('/api/professional-diary', require('./src/routes/ProfessionalDiary'));  

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
  console.log('Connected to MongoDB');
  app.listen(PORT, ()=>console.log('Server running on port', PORT));
  if (CRON_ENABLED){
    cron.schedule('5 0 * * *', async ()=>{
      try{
        const today = new Date(); today.setHours(0,0,0,0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
        const users = await User.find({});
        for (const u of users){
          const hasToday = await Diary.exists({ userId: u._id, createdAt: { $gte: today, $lt: tomorrow } });
          if (!hasToday){
            const exists = await Reminder.exists({ userId: u._id, date: today });
            if (!exists){ await Reminder.create({ userId: u._id, date: today, message: "You didn't write your diary today." }); }
          }
        }
        console.log('Daily reminder check complete');
      }catch(e){ console.error('Cron error:', e.message); }
    });
    console.log('Cron scheduled 00:05.');
  }
}).catch(err=>console.error('MongoDB error', err));
