const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ Error:', err.message); process.exit(1); });

const taskSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  cat:       { type: String, enum: ['work','personal','urgent','other'], default: 'other' },
  done:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json({ success: true, data: tasks });
});

app.get('/api/tasks/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: task });
});

app.post('/api/tasks', async (req, res) => {
  const task = await Task.create({ title: req.body.title, cat: req.body.cat });
  res.status(201).json({ success: true, data: task });
});

app.put('/api/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: task });
});

app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.post('/api/seed', async (req, res) => {
  await Task.deleteMany({});
  await Task.insertMany([
    { title: 'Set up project repo', cat: 'work' },
    { title: 'Buy groceries', cat: 'personal' },
    { title: 'Fix production bug', cat: 'urgent' },
    { title: 'Read design book', cat: 'personal', done: true },
  ]);
  res.json({ success: true });
});

app.listen(process.env.PORT || 3001, () => console.log('🚀 Server on http://localhost:3001'));