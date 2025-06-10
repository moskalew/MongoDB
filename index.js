const express = require('express');
const chalk = require('chalk');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const {
  addNote,
  getNotes,
  removeNote,
  updateNote,
} = require('./notes.controller');
const { addUser, loginUser } = require('./users.controller');
const auth = require('./middlewares/auth');

const port = 3000;
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'pages');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/login', async (req, res) => {
  res.render('login', {
    title: 'Express App',
    error: undefined,
  });
});

app.post('/login', async (req, res) => {
  try {
    const token = await loginUser(req.body.email, req.body.password);

    res.cookie('token', token);

    res.redirect('/');
  } catch (e) {
    res.render('login', {
      title: 'Express App',
      error: e.message,
    });
  }
});

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
    if (e.code === 11000) {
      res.render('register', {
        title: 'Express App',
        error: 'Email is already register',
      });
      return;
    }
    res.render('register', {
      title: 'Express App',
      error: e.message,
    });
  }
});

app.use(auth);

app.get('/', async (req, res) => {
  res.render('index', {
    title: 'Express App',
    notes: await getNotes(),
    created: false,
    error: false,
    user: req.user,
  });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

app.post('/', async (req, res) => {
  try {
    await addNote(req.body.title, req.user.email);
    res.render('index', {
      title: 'Express App',
      notes: await getNotes(),
      created: true,
      error: false,
      user: req.user,
    });
  } catch (e) {
    console.error('Creation error', e);
    res.render('index', {
      title: 'Express App',
      notes: await getNotes(),
      created: false,
      error: true,
      user: req.user,
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
    user: req.user,
  });
});

app.put('/:id', async (req, res) => {
  await updateNote({ id: req.params.id, title: req.body.title });
  res.render('index', {
    title: 'Express App',
    notes: await getNotes(),
    created: false,
    error: false,
    user: req.user,
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
