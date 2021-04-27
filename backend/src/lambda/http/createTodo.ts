import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { createTodo } from '../../domain/todo';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getUserId } from '../utils';
const middy = require('middy');
const { cors } = require('middy/middlewares');

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodoItem: CreateTodoRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  const createdItem = await createTodo(newTodoItem, userId);

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: createdItem
    })
  };
}).use(cors());
