var koa = require('koa');
var app = module.exports = new koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});
const Router = require('koa-router');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

app.use(bodyParser());

app.use(cors());

app.use(middleware);

function middleware(ctx, next) {
  const start = new Date();
  return next().then(() => {
    const ms = new Date() - start;
    console.log(`${start.toLocaleTimeString()} ${ctx.request.method} ${ctx.request.url} ${ctx.response.status} - ${ms}ms`);
  });
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const assets = [];
const names = ['a', 'b', 'c'];
const statuses = ['active', 'inactive'];

for (let i = 0; i < 10; i++) {
  assets.push({
    id: i + 1,
    name: `a${getRandomInt(1, 10)}`,
    postBy: names[getRandomInt(0, names.length)],
    borrowers: [],
    status: statuses[getRandomInt(0, statuses.length)],
  });
}

const router = new Router();

router.get('/asset', ctx => {
  const status = ctx.query.status
  if (status) {
    ctx.response.body = assets.filter(obj => obj.status === status);
  } else {
    const postBy = ctx.query.postBy
    ctx.response.body = postBy ? assets.filter(obj => obj.postBy === postBy) : assets;
  }
  ctx.response.status = 200;
});

const broadcast = data => {
  const stringifiedData = JSON.stringify(data);
  console.log(`boadcast ${stringifiedData}`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(stringifiedData);
    }
  });
};

router.post('/asset', ctx => {
  const body = ctx.request.body;
  const name = body.name;
  const postBy = body.postBy;
  if (typeof name !== 'undefined'
    && typeof postBy !== 'undefined') {
    const index = assets.findIndex(obj => obj.name == name);
    if (index !== -1) {
      ctx.response.body = {text: 'Asset already exists!'};
      ctx.response.status = 404;
    } else {
      const maxId = Math.max.apply(Math, assets.map(function (obj) {
        return obj.id;
      })) + 1;
      let obj = {
        id: maxId,
        name,
        postBy,
        borrowers: [],
        status: statuses[0],
      };
      assets.push(obj);
      broadcast(obj);
      ctx.response.body = obj;
      ctx.response.status = 200;
    }
  } else {
    ctx.response.body = {text: 'Missing or invalid fields!'};
    ctx.response.status = 404;
  }
});

router.patch('/asset/:id', ctx => {
  const id = ctx.params.id;
  if (typeof id !== 'undefined') {
    const index = assets.findIndex(obj => obj.id == id);
    if (index === -1) {
      ctx.response.body = {text: 'Invalid asset id'};
      ctx.response.status = 404;
    } else {
      Object.assign(assets[index], ctx.request.body);
      ctx.response.body = assets[index];
      ctx.response.status = 200;
      broadcast(assets[index]);
    }
  } else {
    ctx.response.body = {text: 'Id missing or invalid'};
    ctx.response.status = 404;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
