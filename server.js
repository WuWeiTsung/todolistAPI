const http = require('http');
const {
  v4: uuidv4
} = require('uuid');
const errorHandle = require('./errorHandle');
const headers = require('./headers');

const todos = [];

const server = http.createServer((req, res) => {
  let body = "";
  req.on('data', chunk => {
    body += chunk;
  })

  if (req.url == "/todos" && req.method == "GET") {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      "data": todos,
    }));
    res.end();
  } else if (req.url == "/todos" && req.method == "POST") {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            "title": title,
            "id": uuidv4()
          }
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            "status": "success",
            "data": todos,
          }));
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (err) {
        errorHandle(res);
      }
    })

  } else if (req.url == "/todos" && req.method == "DELETE") {
    //刪除全部todo
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      "data": todos,
    }));
    res.end();
  } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
    //刪除單筆todo
    const id = req.url.split('/').pop();
    const index = todos.findIndex(element => element.id == id);
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        "status": "success",
        "data": todos,
      }));
      res.end();
    } else {
      errorHandle(res)
    }

  } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
    const id = req.url.split('/').pop();
    const index = todos.findIndex(element => element.id == id);

    req.on('end', chunk => {
      try {
        const title = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todos.findIndex(element => element.id == id);
        if (index !== -1 && title !== undefined) {
          todos[index].title = title;
          res.writeHead(200, headers)
          res.write(JSON.stringify({
            "status": "success",
            "data": todos,
          }))
          res.end();
        } else {
          errorHandle(res);
        }

      } catch {
        errorHandle(res);
      }
    })


  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      "status": "false",
      "message": "無此網站路由",
    }));
    res.end();
  }

});

server.listen(process.env.PORT || 3005);