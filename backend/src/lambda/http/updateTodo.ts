import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { updateTodo } from '../../domain/todo';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';
const middy = require('middy');
const { cors } = require('middy/middlewares');


const logger = createLogger('APIGatewayProxyHandlerUpdateTodo');

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);

  const patchData: UpdateTodoRequest = JSON.parse(event.body);

  if (!patchData) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Patch data required'
      })
    }
  }

  try {
    const authorized = updateTodo(todoId, userId, patchData);

    if (!authorized) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Unauthorized'
        })
      }
    } else {
      return {
        statusCode: 204,
        body: undefined
      }
    }

  } catch (error) {
    logger.error('Update failed', { error: error.message });
    return {
      statusCode: 500,
      body: undefined
    }
  }
}).use(cors());
