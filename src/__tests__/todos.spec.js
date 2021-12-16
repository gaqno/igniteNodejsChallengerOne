const req = require('supertest');
const { validate } = require('uuid');

const app = require('../');

describe('Todos', () => {
  it("should be able to list all user's todo", async () => {
    const userResponse = await req(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user1'
      });

    const todoDate = new Date();

    const todoResponse = await req(app)
      .post('/todos')
      .send({
        title: 'test todo',
        deadline: todoDate
      })
      .set('username', userResponse.body.username);

    const res = await req(app)
      .get('/todos')
      .set('username', userResponse.body.username);

    expect(res.body).toEqual(
      expect.arrayContaining([
        todoResponse.body
      ]),
    )
  });

  it('should be able to create a new todo', async () => {
    const userResponse = await req(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user2'
      });

    const todoDate = new Date();

    const res = await req(app)
      .post('/todos')
      .send({
        title: 'test todo',
        deadline: todoDate
      })
      .set('username', userResponse.body.username)
      .expect(201);

    expect(res.body).toMatchObject({
      title: 'test todo',
      deadline: todoDate.toISOString(),
      done: false
    });
    expect(validate(res.body.id)).toBe(true);
    expect(res.body.created_at).toBeTruthy();
  });

  it('should be able to update a todo', async () => {
    const userResponse = await req(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user7'
      });

    const todoDate = new Date();

    const todoResponse = await req(app)
      .post('/todos')
      .send({
        title: 'test todo',
        deadline: todoDate
      })
      .set('username', userResponse.body.username);

    const res = await req(app)
      .put(`/todos/${todoResponse.body.id}`)
      .send({
        title: 'update title',
        deadline: todoDate
      })
      .set('username', userResponse.body.username);

    expect(res.body).toMatchObject({
      title: 'update title',
      deadline: todoDate.toISOString(),
      done: false
    });

    const getAllTodosResponse = await req(app)
      .get((`/todos/`))
      .set('username', userResponse.body.username);
    
    expect(
      getAllTodosResponse.body.find(
        (todo)=>todo.id === todoResponse.body.id
      ))
    .toMatchObject({
      title: 'update title',
      deadline: todoDate.toISOString(),
      done: false
    });
  });

  it('should not be able to update a non existing todo', async () => {
    const userResponse = await req(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user8'
      });

    const todoDate = new Date();

    const res = await req(app)
      .put('/todos/invalid-todo-id')
      .send({
        title: 'update title',
        deadline: todoDate
      })
      .set('username', userResponse.body.username)
      .expect(404);

    expect(res.body.error).toBeTruthy();
  });

  it('should be able to mark a todo as done', async () => {
    const userResponse = await req(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user3'
      });

    const todoDate = new Date();

    const todoResponse = await req(app)
      .post('/todos')
      .send({
        title: 'test todo',
        deadline: todoDate
      })
      .set('username', userResponse.body.username);

    const res = await req(app)
      .patch(`/todos/${todoResponse.body.id}/done`)
      .set('username', userResponse.body.username);

    expect(res.body).toMatchObject({
      ...todoResponse.body,
      done: true
    });
  });

  it('should not be able to mark a non existing todo as done', async () => {
    const userResponse = await req(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user4'
      });

    const res = await req(app)
      .patch('/todos/invalid-todo-id/done')
      .set('username', userResponse.body.username)
      .expect(404);

    expect(res.body.error).toBeTruthy();
  });

  it('should be able to delete a todo', async () => {
    const userResponse = await req(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user5'
      });

    const todoDate = new Date();

    const todo1Response = await req(app)
      .post('/todos')
      .send({
        title: 'test todo',
        deadline: todoDate
      })
      .set('username', userResponse.body.username);

    await req(app)
      .delete(`/todos/${todo1Response.body.id}`)
      .set('username', userResponse.body.username)
      .expect(204);

    const listResponse = await req(app)
      .get('/todos')
      .set('username', userResponse.body.username);

    expect(listResponse.body).toEqual([]);
  });

  it('should not be able to delete a non existing todo', async () => {
    const userResponse = await req(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user6'
      });

    const res = await req(app)
      .delete('/todos/invalid-todo-id')
      .set('username', userResponse.body.username)
      .expect(404);

    expect(res.body.error).toBeTruthy();
  });
});