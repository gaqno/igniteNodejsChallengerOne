const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const users = [];


app.use(cors());
app.use(express.json());


function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find((user) => user.username === username)

  if (!username) {
    return res.status(400).json({ message: "User not found! 🚨" })
  }

  req.user = user;
  return next();
}

app.post('/users', (req, res) => {
  const { username, name } = req.body;
  const id = uuidv4();
  const userAlreadyExists = users.some(
    (user) => user.username === username);

  if (userAlreadyExists) {
    return res.status(400).json({ error: 'User already exists!🚨 ' })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return res.status(201).json({ sucess: "Account sucessfully created 🧑‍🚀" })
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { username } = req.headers;

  if (!!username) {

    return res.status(201).send({
      id: uuidv4(),
      message: `All to-do from ${user.name}`,
      todo: user.todos
    })
  } else {
    res.status(401).send({ error: `Cannot get to-do from this user ${username}` })
  }
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { username } = req.headers;
  const { title, deadline } = req.body;
  const id = uuidv4();

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  return res.status(201).send({ sucess: `New to-do from ${user.name} 🥂`, todos: user.todos })

});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const i = user.todos.findIndex((todo) => todo.id === id);


  if (i > -1) {
    user.todos[0] = {
      ...user.todos[0],
      ...req.body,
    }

    return res.status(200).send({ msg: 'Sucessfully PUT!', user })
  } else {
    res.send({ error: 'To-do ID doesnt exist on system. ⭕' })
  }
})

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const i = user.todos.findIndex((todo) => todo.id === id);

  if (i > -1) {

    user.todos[0] = {
      ...user.todos[0],
      ...req.body
    }
    return res.send({ sucess: 'Task is marked was DONE!', todo: user.todos[0].done })
  } else {
    res.send({ error: 'Wrong ID or user doesnt exist , try again. ⭕' })
  }
})

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const i = user.todos.findIndex((todo) => todo.id === id);

  if (i > -1) {

    user.todos.splice(0, 1)
    return res.status(204).json({ msg: `${user.name} was deleted!` })
  } else {
    res.status(401).send({ error: 'Impossible delete something that doesnt exist!' })
  }
});

module.exports = app;