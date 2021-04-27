import * as uuid from 'uuid';
import { TodoItem } from '../models/TodoItem';
import { TodoItemRepository } from '../persistence/todo-item.repository';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoItemRepository = new TodoItemRepository();

export async function getAllTodoItems(userId: string): Promise<TodoItem[]> {
  return todoItemRepository.getAllTodoItems(userId);
}

export async function getTodoItem(todoId: string): Promise<TodoItem> {
  return todoItemRepository.getTodoItem(todoId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4();

  return await todoItemRepository.createTodoItem({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate,
    done: false,
  })
}

export async function updateTodo(
  todoId: string,
  userId: string,
  patchData: UpdateTodoRequest,
): Promise<boolean> {

  if (validateTodoItemBelongsToUser(todoId, userId)) {
    await todoItemRepository.updateTodoItem(userId, todoId, patchData);
    return true;
  }
  return false;
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<boolean> {
  if (validateTodoItemBelongsToUser(todoId, userId)) {
    await todoItemRepository.deleteTodoItem(userId, todoId);
    return true;
  }
  return false;
}

export async function validateTodoItemBelongsToUser(
  todoId: string,
  userId: string
): Promise<boolean> {

  const todoItem = await getTodoItem(todoId);
  return todoItem && todoItem.userId && todoItem.userId === userId;
}
