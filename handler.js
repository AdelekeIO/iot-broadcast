"use strict";
const axios = require("axios");
var data = [{ data: "dull" }];
const AWS = require("aws-sdk");
let dynamo = new AWS.DynamoDB.DocumentClient();

require("aws-sdk/clients/apigatewaymanagementapi");

const CHATCONNECTION_TABLE = "chatIdTable";

const successfullResponse = {
  statusCode: 200,
  body: "everything is alright"
};

module.exports.connectionHandler = (event, context, callback) => {
  console.log(event);

  if (event.requestContext.eventType === "CONNECT") {
    // Handle connection

    addConnection(event.requestContext.connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch(err => {
        console.log(err);
        callback(null, JSON.stringify(err));
      });
  } else if (event.requestContext.eventType === "DISCONNECT") {
    // Handle disconnection
    deleteConnection(event.requestContext.connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch(err => {
        console.log(err);
        callback(null, {
          statusCode: 500,
          body: "Failed to connect: " + JSON.stringify(err)
        });
      });
  }
};

// THIS ONE DOESNT DO ANYHTING
module.exports.defaultHandler = (event, context, callback) => {
  console.log("defaultHandler was called");
  console.log(event);

  callback(null, {
    statusCode: 200,
    body: "defaultHandler"
  });
};

module.exports.sendMessageHandler = (event, context, callback) => {
  d();
  sendMessageToAllConnected(event)
    .then(() => {
      callback(null, successfullResponse);
    })
    .catch(err => {
      callback(null, JSON.stringify(err));
    });
};

const sendMessageToAllConnected = event => {
  return getConnectionIds().then(connectionData => {
    return connectionData.Items.map(connectionId => {
      return send(event, connectionId.connectionId);
    });
  });
};

const getConnectionIds = () => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    ProjectionExpression: "connectionId"
  };

  return dynamo.scan(params).promise();
};

const send = (event, connectionId) => {
  const body = JSON.parse(event.body);
  const postData = body.data;

  const endpoint =
    event.requestContext.domainName + "/" + event.requestContext.stage;
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: endpoint
  });
  setTimeout(() => {
    const params = {
      ConnectionId: connectionId,
      Data: JSON.stringify({ body: postData, graph: data })
    };
    return apigwManagementApi.postToConnection(params).promise();
  }, 4000);
};

const addConnection = connectionId => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    Item: {
      connectionId: connectionId
    }
  };

  return dynamo.put(params).promise();
};

const deleteConnection = connectionId => {
  const params = {
    TableName: CHATCONNECTION_TABLE,
    Key: {
      connectionId: connectionId
    }
  };

  return dynamo.delete(params).promise();
};
const d = async () => {
  data = [{ data: "dull" }];
  let res = await axios({
    method: "POST",
    url: "https://9cwdo1u2ih.execute-api.us-east-1.amazonaws.com/dev/graphql",
    data: {
      query: `{
        devices{
          DeviceID
          mode
          payload
          expiry
          owner{
            CID
            name
            user
            locations
            deviceType
            email
          }
        }
      }`
    }
  })
    .then(res => {
      let { devices } = res.data.data;
      // console.log(devices);
      // data = devices;

      return devices;
    })
    .catch(err => console.log(err));
  console.log(res);
  data.push(res);
  return res;
};
// d();
// // setTimeout(() => {
// setInterval(() => {
//   console.log(data);
// }, 1000);
// }, 4000);
