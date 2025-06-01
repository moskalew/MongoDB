const express = require('express');
const chalk = require('chalk');
const path = require('path');
const mongoose = require('mongoose');
const {
  addNote,
  getNotes,
  removeNote,
  updateNote,
} = require('./notes.controller');
const { addUser } = require('./users.controller');

const port = 3000;
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'pages');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/register', async (req, res) => {
  res.render('register', {
    title: 'Express App',
    error: undefined,
  });
});

app.post('/register', async (req, res) => {
  try {
    await addUser(req.body.email, req.body.password);

    res.redirect('/login');
  } catch (e) {
    console.log(e);
    res.render('register', {
      title: 'Express App',
      error: e.message,
    });
  }
});

app.get('/', async (req, res) => {
  res.render('index', {
    title: 'Express App',
    notes: await getNotes(),
    created: false,
    error: false,
  });
});

app.post('/', async (req, res) => {
  try {
    await addNote(req.body.title);
    res.render('index', {
      title: 'Express App',
      notes: await getNotes(),
      created: true,
      error: false,
    });
  } catch (e) {
    console.error('Creation error', e);
    res.render('index', {
      title: 'Express App',
      notes: await getNotes(),
      created: false,
      error: true,
    });
  }
});

app.delete('/:id', async (req, res) => {
  await removeNote(req.params.id);
  res.render('index', {
    title: 'Express App',
    notes: await getNotes(),
    created: false,
    error: false,
  });
});

app.put('/:id', async (req, res) => {
  await updateNote({ id: req.params.id, title: req.body.title });
  res.render('index', {
    title: 'Express App',
    notes: await getNotes(),
    created: false,
    error: false,
  });
});

mongoose
  .connect(
    'mongodb+srv://xuitos1:Spas1boMongodb@cluster0.3kizskk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => {
    app.listen(port, () => {
      console.log(chalk.green(`Server has been started on port ${port}...`));
    });
  });
