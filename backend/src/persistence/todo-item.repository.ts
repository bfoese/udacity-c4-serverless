import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import { AppConfig } from '../config/app.config'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)


export class TodoItemRepository {

  public constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoItemTable = AppConfig.todoItemTable,
    private readonly todoIdIndex = AppConfig.todoIdIndex) {
  }

  public async getTodoItem(todoId: string): Promise<TodoItem | null> {
    const result = await this.docClient.query({
      TableName: this.todoItemTable,
      IndexName : this.todoIdIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      },
    }).promise();

    return result && result.Count === 1 ? (result.Items[0] as TodoItem) : null;
  }


  public async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todoItemTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise();

    const items = result && result.Items ? result.Items : [];
    return items as TodoItem[]
  }

  public async createTodoItem(item: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoItemTable,
      Item: item
    }).promise();
    return item;
  }

  public async updateTodoItem(userId: string, todoId: string, patchData: TodoUpdate): Promise<void> {
    console.log('start patch', userId, todoId, patchData);

    await this.docClient.update({
      TableName: this.todoItemTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set #nameKey = :nameVal, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#nameKey': 'name'
      },
      ExpressionAttributeValues: {
        ':nameVal': patchData.name,
        ':dueDate': patchData.dueDate,
        ':done': patchData.done
      }
    }).promise();
  }

  public async deleteTodoItem(userId: string, todoId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.todoItemTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }).promise();
  }
}

function createDynamoDBClient() {
  if (AppConfig.isOffline) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient();
}
