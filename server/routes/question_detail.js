 
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

////////////////////////////////////////////////【不可缺少】
///两个预处理的中间件，对req的登录状态等先进行检查，且对req进行加工处理，如填充session值。
router.use(loginCheckMiddleware);

router.all('*', function (req, res, next) {
  if (!req.session) {
    res.status(401).json({
      error: '未登录'
    });
    return;
  }
  next();
});
////////////////////////////////////////////////  


//获取问题详情
router.post('/', function (req, res, next) {

  var qid = req.body.qid;
  var response;

  mysql("question").where({          //通过qid搜索数据表，找到对应问题记录
    question_id: qid
  })
    .select('*')
    .then(function (result) {
      if (result.length > 0) {
        var data = result[0];
        res.json({                 //封装好问题信息，response给客户端
          question_id: data.question_id, 
          feed_source_id: data.feed_source_id,
          feed_source_name: data.feed_source_name, 
          feed_source_img: data.feed_source_img,
          question: data.question,
          answer_ctnt: data.answer_ctnt,
          good_num: data.good_num,
          comment_num: data.comment_num,
          question_detail: data.question_detail
        });
      }
      else {
        res.status(400).json({
          error: '已无此问题'
        });
      }
    });

});


//令浏览数+1
router.post('/addview', function (req, res, next) {
 
  var updateData = {
    good_num: req.body.new_good_num, 
  }

  mysql("question").where({
    question_id: req.body.qid
  }).update(updateData)
    .then(function () {
      res.json(updateData);
    });


});

module.exports = router; //注意，漏了此，上传部署代码会失败，但报错可能被warning覆盖掉而看不到此原因。
