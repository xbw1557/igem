var moment = require('moment');
var config = require('./config');
var sessionTable = 'session';

//使用knex库(进行数据库连接与增删改查等基本操作)
var mysql = require('knex')({       //配置好数据库实例，其后则使用mysql进行数据库操作。
  client: 'mysql',
  connection: {
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.db,
    charset: config.mysql.char
  }
});

//【检查 发出请求的用户 的登录状态 的中间件】
//根据request header里的skey信息，进入数据库的session表进行查询，获取唯一对应的session，以赋值给req.session，若查询失败，则req.session为null
var loginCheckMiddleware = function (req, res, next) {

  var skey = req.headers.skey;
  req.session = null;

  if(!skey) {
    next();
    return;
  }

  mysql(sessionTable).select('*').where({
    skey: skey
  })
    .then(function (result) {
      if (result.length > 0) {
        var session = result[0];
        var lastLoginTime = session.last_login_time;
        var expireTime = config.expireTime * 1000;

        if (moment(lastLoginTime, 'YYYY-MM-DD HH:mm:ss').valueOf() + expireTime > +new Date) {
          req.session = session;
        }
      }
      next();
    })
    .catch(function (e) {
      next();
    });

};

function only(obj, keys) {
  obj = obj || {};
  if ('string' == typeof keys) keys = keys.split(/ +/);
  return keys.reduce(function (ret, key) {
    if (null == obj[key]) return ret;
    ret[key] = obj[key];
    return ret;
  }, {});
};

//向外部暴露三个接口
module.exports = {
  mysql: mysql,
  loginCheckMiddleware: loginCheckMiddleware,
  only
};