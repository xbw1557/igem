
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

//获取问题概述表的长度
router.get('/', function (req, res, next) {

  var reqid = req.body.reqid;
  var response;

  mysql("question").count({ count: '*' })   //此处用count({count:'*'})这种写法而不用count(*)，否则，后面再result里要获取count值的时候，sql库自动设置变量名因为是count(*)，所以写在代码里会识别不了，从而提取不出来，这里用这种写法给这个变量重命名为count，后面就可以提取出它了
    .then(function (result) {
      //res.json({reqid:result}); 
      res.json({ reqid: result[0].count});   
    });

});
 
//获取问题概述
router.post('/', function (req, res, next) {

  var reqid = req.body.reqid;
  var response;
  
  mysql("question").whereIn('question_id', [reqid - 7, reqid - 6,reqid-5, reqid-4, reqid-3, reqid-2, reqid-1, reqid]) //取用从reqid向上的8条问题概述//因为要倒序显示最新的话题
  
  .select('*')
    .then(function (result) {
      if (result.length > 0) {
        response = { id: reqid - result.length, data: [] };
        for (var i = 0; i < result.length; i++)//循环取用获取到的每一条记录，组织放入response中，response 被组织为一个对象，该对象内有两个属性{id,data}，其中id返回一个值，data返回一个list，list内各个对象是各个问题概述（也即每一条记录）
        {
        var data = result[i];

        response.data.push({
          question_id: data.question_id,
          answer_id: data.answer_id,
          feed_source_id: data.feed_source_id,
          feed_source_name: data.feed_source_name,
          feed_source_txt: data.feed_source_txt,
          feed_source_img: data.feed_source_img,
          question: data.question,
          answer_ctnt: data.answer_ctnt,
          good_num: data.good_num,
          comment_num: data.comment_num
        })
        
        }
        //将组织好的response通过res.json发出去
        res.json(response);
      }
      else {
        res.status(400).json({
          error: '没有可获取问题了'
        });
      }
    });

});



//////////////////////////////////发布新问题 post /postquestion 
//功能：即在question和question_pictures表格里insert一条新的记录

//注意，此是拆分为几部分实现的（下面[1][2][3]三个部分），每个部分（step）之间使用next()来进行连接 

var newqid;//[1]先从question表格里确定，现有question条数，从而给本question赋值id
var newqpid;//再从question_picture表格里确定，现有记录条数，从而给后续插入各条附图记录赋值id//必须新增此主键，question_picture表格才能进行删/改。
router.post('/postquestion', function (req, res, next) {
  
    mysql("question").count({ count: '*' })  
      .then(function (result) {  
         newqid = result[0].count+1;

         mysql("question_picture").count({ count: '*' })
           .then(function (result) {
             newqpid = result[0].count + 1;
             next();
           });
         
      });

   
 
});

//[2]查用户表，获取发布问题的用户的名字和头像(用于下方插入question记录)
var name = ''; var avatar = '';
router.post('/postquestion', function (req, res, next) {

  mysql(userTable).where({          //通过open_id搜索数据表，找到对应用户记录
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
router.post('/postquestion', function (req, res, next) {

  var questionInfo = req.body;
  var insertData = {
    title: questionInfo.title,
    detail: questionInfo.detail,
    pictures: questionInfo.pictures
  }


  var newrows = [];
  for (var i = 0; i < insertData.pictures.length; i++) {
    var newrow = { unique_id: newqpid+i,question_id: newqid, img: insertData.pictures[i] };
    newrows.push(newrow);
  }
  console.log(newrows);
 
   mysql("question").insert({ question_id: newqid, feed_source_id: req.session.open_id, question: insertData.title, question_detail: insertData.detail, good_num: 0, comment_num: 0, answer_ctnt: '', feed_source_name: name, feed_source_img: avatar })
    .then(function (result) {
      mysql("question_picture").insert(newrows).then(function (result) {
        res.end("ok");  
      });
    });

  
 });

//////////////////////////////////发布新问题end

//
///用户上传图片到cos：（上传问题图片）
router.post('/UploadPicture', function (req, res, next) {
   
  // 用于解析文件上传
  var form = new multiparty.Form({
    encoding: 'utf8',
    autoFiles: true,
    uploadDir: '/tmp'
  });

  form.parse(req, function (err, fields, files) {

    if (err) {
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


////根据qid，查询并返回该问题发布时上传的图片 
router.post('/picture', function (req, res, next) {

  var qid = req.body.qid;
 
  mysql('question_picture').where({          //通过qid搜索数据表，找到对应记录
    question_id: qid
  })
    .select('*')
    .then(function (result) {   
      if (result.length > 0) {
        response = [];
        for (var i = 0; i < result.length; i++) 
        {
          var data = result[i];

          response.push(
            data.img
          )

        }
        //将组织好的response通过res.json发出去
        res.json(response);
      } else {
        res.status(400).json({
          error: '没有可获取问题了'
        });
      }
    });
});

////根据query，查询并返回所有匹配的问题
router.post('/search', function (req, res, next) {

  var query = req.body.query;

  mysql('question').where('question', 'like', '%'+query+'%')
    .select('*')
    .then(function (result) {
      if (result.length > 0) {
        response = [];
        for (var i = 0; i < result.length; i++) {
          var data = result[i];

          response.push(data)

        }
        //将组织好的response通过res.json发出去
        res.json(response);
      } else {
        res.status(400).json({
          error: '没有匹配问题'
        });
      }
    });
});


module.exports = router;
