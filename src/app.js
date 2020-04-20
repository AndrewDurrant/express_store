require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

const { NODE_ENV } = require('./config');

const app = express();

const morganOption = NODE_ENV === 'production'
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  let message; // eslint-disable-line no-unused-vars
  if (NODE_ENV === 'production') {
    message = 'Server error';
  } else {
    console.log(error);
    message = error.message;
  }
  res.status(500).json({ error: error.message });
});

const users = [
  {
    "id": "3c8da4d5-1597-46e7-baa1-e402aed70d80", 
    "username": "sallyStudent",
    "password": "c00d1ng1sc00l",
    "favoriteClub": "Cache Valley Stone Society",
    "newsLetter": "true"
  },
  {
    "id": "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    "username": "johnBlocton",
    "password": "veryg00dpassw0rd",
    "favoriteClub": "Salt City Curling Club",
    "newsLetter": "false"
  }
];

app.get('/', (req,res) => {
  res
    .send('A GET request');
});

app.get('/user', (req, res) => {
  res
    .json(users);
});

app.post('/', (req, res) => {
  console.log(req.body);
  
  res
    .send('POST request received.');
});

app.post('/user', (req, res) => {
  const { username, password, favoriteClub, newsLetter=false } = req.body;
  console.log(req.body);
  
  // All are required, check if they were sent
  if (!username) {
    return res
      .status(400)
      .send('Username required');
  }
  
  if (!password) {
    return res
      .status(400)
      .send('Password required');
  }
  
  if (!favoriteClub) {
    return res
      .status(400)
      .send('favorite Club required');
  }

  // make sure username is correctly formatted.
  if (username.length < 6 || username.length > 20) {
    return res
      .status(400)
      .send('Username must be between 6 and 20 characters');
  }
  
  // password length
  if (password.length < 8 || password.length > 36) {
    return res
      .status(400)
      .send('Password must be between 8 and 36 characters');
  }
  
  // password contains digit, using a regex here
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res
      .status(400)
      .send('Password must be contain at least one digit');
  }
  
  const clubs = [
    'Cache Valley Stone Society',
    'Ogden Curling Club', 
    'Park City Curling Club',
    'Salt City Curling Club',
    'Utah Olympic Oval Curling Club'
  ];

  // make sure the club is validation
  if (!clubs.includes(favoriteClub)) {
    return res
      .status(400)
      .send('Not a valid club');
  }

  const id = uuidv4();
  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter
  };

  users.push(newUser);

  res
    .status(201)
    .location(`http://localhost:8000/user/${id}`)
    .json(newUser);
});

app.delete('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return res
      .status(404)
      .send('User not found');
  }
  users.splice(index, 1);

  res
    .status(204)
    .end();
});

// if no route matches, return 404 with HTML page - Express default route

module.exports = app;