const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', routes);

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }

  return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
