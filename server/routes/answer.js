 
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
 
//获取回答
router.post('/', function (req, res, next) {

  var qid = req.body.qid;
  var response=[];

  mysql("answer").where({  
    question_id: qid
  })  
    .select('*')
    .then(function (result) {
      if (result.length > 0) {
         
        for (var i = 0; i < result.length; i++) 
        {
          var data = result[i]; 
          response.push(data); 
        }
        //将组织好的response通过res.json发出去
        res.json(response);
      }
      else {
        res.status(400).json({
          error: '没有可获取回答'
        });
      }
    });

});



//////////////////////////////////发布新回答 post /postanswer
//功能：即在answer和answer_pictures表格里insert一条新的记录
  
var newaid;//[1]先从answer表格里确定，现有answer条数，从而给本answer赋值id
var newapid;
router.post('/postanswer', function (req, res, next) {

  mysql("answer").count({ count: '*' })
    .then(function (result) {
      newaid = result[0].count + 1;
      mysql("answer_picture").count({ count: '*' })
        .then(function (result) {
          newapid = result[0].count + 1;
          next();
        });
    });

   
});

//[2]查用户表，获取发布回帖的用户的名字和头像(用于下方插入answer记录)
var name = ''; var avatar = '';
router.post('/postanswer', function (req, res, next) {

  mysql(userTable).where({        
    open_id: req.session.open_id
  })
    .select('*')
    .then(function (result) {
      if (result.length > 0) {
        var data = result[0];
        console.log(data);
        name = data.name;
        avatar = data.avatar;
        next();
      }
    });
});

//[3]向两个表格里插入新记录
router.post('/postanswer', function (req, res, next) {

  var answerInfo = req.body;
  var insertData = { 
    qid: answerInfo.qid,
    detail: answerInfo.detail,
    pictures: answerInfo.pictures
  }


  var newrows = [];
  for (var i = 0; i < insertData.pictures.length; i++) {
    var newrow = { unique_id: newapid + i,answer_id: newaid, img: insertData.pictures[i] };
    newrows.push(newrow);
  }
  console.log(newrows);
 
  var now_comment_num; 
   //获取当前时间
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
   /////获取当前时间end
   
  console.log(insertData)
  //四个嵌套的mysql操作
  mysql("answer").insert({ answer_id: newaid, question_id: insertData.qid, feed_source_id: req.session.open_id, answer_ctnt: insertData.detail, good_num: 0, feed_source_name: name, feed_source_img: avatar, time: currentdate, picture_num:insertData.pictures.length })
  //新增picture_num字段，用于控制 回帖楼 显示/不显示 "查看附图"字样
    .then(function (result) {
      mysql("answer_picture").insert(newrows).then(function (result) {
        ////修改相应的question表
        mysql("question").where({
          question_id: insertData.qid
        })
          .select('*')
          .then(function (result) {
            if (result.length > 0) {
              var data = result[0]; 
              now_comment_num = data.comment_num; //先提取出本问题的现有评论数
              mysql("question").where({ //令本问题评论数+1，并更新其“最新回答内容”
                question_id: insertData.qid
              }).update({ answer_ctnt: insertData.detail, comment_num: now_comment_num + 1 })
                .then(function () {
                  res.end("ok");
                });
            }
          });
       ////
      });
    });
 

});

//////////////////////////////////发布新回帖end

 

////根据aid，查询并返回该问题发布时上传的图片 
router.post('/picture', function (req, res, next) {

  var aid = req.body.aid;

  mysql('answer_picture').where({          //通过aid搜索数据表，找到对应记录
    answer_id: aid
  })
    .select('*')
    .then(function (result) {
      if (result.length > 0) {
        response = [];
        for (var i = 0; i < result.length; i++) {
          var data = result[i];

          response.push(
            data.img
          )

        }
        //将组织好的response通过res.json发出去
        res.json(response);
      } else {
        res.status(400).json({
          error: ''
        });
      }
    });
});
 
module.exports = router;
