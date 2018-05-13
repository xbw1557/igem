var express = require('express');
var fs = require('fs');
var multiparty = require('multiparty');
// 腾讯云的文件存储SDK
var CosSdk = require('cos-nodejs-sdk-v5');
var router = express.Router();
var loginCheckMiddleware = require('../util').loginCheckMiddleware;
var mysql = require('../util').mysql;
var config = require('../config');

// 获取腾讯云配置
// serverHost, tunnelServerUrl, tunnelSignatureKey, qcloudAppId, qcloudSecretId, qcloudSecretKey, wxMessageToken
var qcloudConfig = JSON.parse(fs.readFileSync('/data/release/sdk.config.json', 'utf8'));
var userTable = 'user';

// 文件存储sdk初始化
var cos = new CosSdk({
  AppId: qcloudConfig.qcloudAppId,
  SecretId: qcloudConfig.qcloudSecretId,
  SecretKey: qcloudConfig.qcloudSecretKey
});

router.use(loginCheckMiddleware);  //使用用户鉴权中间件，所有匹配进入 /user下 路由的请求都会先进入此预处理中间件

router.all('*', function (req, res, next) {
  if (!req.session) {
    res.status(401).json({
      error: '未登录'
    });
    return;
  }
  next();
});

// 获取用户信息 // 此API对应客户端请求： get /user 
router.get('/', function (req, res, next) {

  mysql(userTable).where({          //通过open_id搜索数据表，找到对应用户记录
    open_id: req.session.open_id
  })
    .select('*')
    .then(function (result) {
      if (result.length > 0) {
        var data = result[0];
        res.json({                 //封装好用户信息，response给客户端
          name: data.name,
          avatar: data.avatar,
          intro: data.intro,
          status: data.status,
          radio: data.radio,
          school: data.school,
          project: data.project
        });
      }
      else {
        res.status(400).json({
          error: '未创建用户'
        });
      }
    });

});

//新增用户（即在数据表里新增一条用户记录  // 此API对应客户端请求： post /user 
router.post('/', function (req, res, next) {

  var userInfo = req.body; //提取request里发送过来的data

  if (!userInfo.name || !userInfo.avatar) {

    res.status(400).json({
      error: '参数错误'
    });

    return;
  }

  mysql(userTable).where({
    open_id: req.session.open_id
  })
    .count('open_id as hasUser')
    .then(function (ret) {
      if (ret[0].hasUser) {
        res.status(400).json({
          error: '用户已创建'
        });
      }
      else {
        userInfo = {
          open_id: req.session.open_id,
          name: userInfo.name,
          avatar: userInfo.avatar
        };
        mysql(userTable).insert(userInfo) //新增用户记录
          .then(function () {
            delete userInfo.open_id;
            res.json(userInfo);
          });
      }
    });

});

//更新用户详细信息（即修改数据表中的一条用户记录 // 此API对应客户端请求： post /user/changeinfor
router.post('/changeinfor', function (req, res, next) 
{
  var userInfo = req.body;
  var updateData = {
    intro: userInfo.intro,
    status: userInfo.status,
    radio: userInfo.radio,
    school: userInfo.school,
    project: userInfo.project
  }  

  mysql(userTable).where({
    open_id: req.session.open_id
  }).update(updateData)
    .then(function () {
      res.json(updateData);
    });

  
});

//更新用户头像（即修改数据表中的一条用户记录的avatar字段的值（改为一个新的url地址  
// 此API对应客户端请求： post /user/changeURL
//router.patch('/tw', function (req, res, next) 
router.post('/changeURL', function (req, res, next) 
{

  var userInfo = req.body;

  if (!userInfo.name && !userInfo.avatar) {

    res.status(400).json({
      error: '参数错误'
    });

    return;
  }

  var updateData = userInfo.name ? {
    name: userInfo.name
  } : {
    avatar: userInfo.avatar
  };
 

  mysql(userTable).where({
    open_id: req.session.open_id
  }).update(updateData)
    .then(function () {
      res.json(updateData);
    });

});

///用户上传图片到cos：
// 此API对应客户端请求： post /user/avatar
router.post('/avatar', function(req, res, next) {
  
  // 用于解析文件上传
  var form = new multiparty.Form({
    encoding: 'utf8',
    autoFiles: true,
    uploadDir: '/tmp'
  });

  form.parse(req, function(err, fields, files) {
    
    if(err) {
      next(err);
    }
    else {
      var avatarFile = files.avatar[0];
      var fileExtension = avatarFile.path.split('.').pop();
      var fileKey = parseInt(Math.random() * 10000000) + '_' + (+new Date) + '.' + fileExtension;
      
      var params = {
        //todo
        Bucket: config.cos.fileBucket,
        //ap-guangzhou
        Region: config.cos.region,
        Key: fileKey,
        Body: fs.readFileSync(avatarFile.path),
        ContentLength: avatarFile.size
      };
      
      cos.putObject(params, function (err, data) {//上传文件到cos 
        fs.unlink(avatarFile.path);// 删除临时文件
        if (err) {
          next(err);
          return;
        }
        res.end(data.Location);  
      });

    }

  });

});

module.exports = router;