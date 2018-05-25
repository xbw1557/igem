var config = require('./config');  //获取config.js内设置的参数值 如host

App({

  //全局数据维护
  globalData: {
    //默认内部状态变量值
    userInfo: {
      name: '',
      avatar: '/images/icons/user-unlogin.png',
      intro:'',
      status:'',
      radio:'',
      school:'',
      project:''

    }
  },

  //弹出"登录中"加载窗
  onLaunch: function () {

    console.info('loading app...');
    /*wx.showLoading({
      title: '登录中',
      mask: true
    });*/
    /////////////////////////
  },

  //[1]检测是否登录 
  //[读取存储在本地storage的skey，若不存在则login()登录，存在则直接getUserInfo()获取用户基本信息]
  checkLogin: function (cb) {    //参数cb：额外要执行的函数
    console.info('check login...');
    var skey = wx.getStorageSync('skey');
    if (skey) {
      this.getUserInfo(cb);
    }
    else {
      this.login(cb);
    }
  },

  //[2]登录
  //1，直接调用wx.login获取code
  //2，获取response后，提取code向web server发出请求，（在web server端其再向腾讯服务器发出请求），以返回第三方【skey】，将其存储到本地，作为用户身份凭证(本地)
  //3，再调用getUserInfo获取用户信息
  //至此，完成用户登录【获取用户凭证skey 与 基本用户信息】
  login: function (cb) {
    console.info('login...');
    var that = this;
    wx.login({
      success: function (res) {
        // 登录请求
        wx.request({
          url: config.host + '/login',
          data: {
            code: res.code
          },
          success: function (res) {

            var skey = res.data.skey;

            console.info('already login, skey is', skey);

            //如果获取不到skey，则再次尝试 login()
            if (!skey) {
              that.login(cb);
              return;
            }

            wx.setStorageSync('skey', skey);
            that.getUserInfo(cb);
          }
        })
      }
    });
  },

  //[3]获取用户信息（向web server）
  //向web server的 /user发出request
  //若web server返回状态码401(鉴权失败) —— —— 属未登录用户，重新登录:login()
  //若web server返回状态码400 —— —— 在数据库的user表中未查询到此用户 —— —— 属未注册用户，调用registerUser() 进行注册
  //其他 —— —— 属已登录且注册的用户，直接从response的data中获取用户信息，并写入全局数据globalData
  getUserInfo: function (cb) {
    var that = this;
    this.request({           ///此处调用的是在此APP({})内自定义的函数request，因此是携带了本用户凭证skey的
      url: '/user',
      success: function (res) {
        // 未登录
        if (res.statusCode === 401) {
          that.login(cb);
        }
        else {
          // 未注册用户
          if (res.statusCode === 400) {
            that.registerUser(cb);
          }
          else { //已注册用户
            that.globalData.userInfo = res.data;          
            wx.hideLoading(); //取消"登录中"加载窗
            cb();
          }
        }
      }
    });
  },

  //[4]注册用户 (实即在User表中新增一条记录)
  //调用wx.getUserInfo向腾讯服务器获取用户信息
  //若授权失败则，则向user表写入的是默认的用户信息
  //否则写入的是通过wx.getUserInfo获取的用户信息
  registerUser: function (cb) {
    var that = this;
    wx.getUserInfo({    
      success: function (res) {
        var userInfo = res.userInfo;
        userInfo = {
          name: userInfo.nickName,
          avatar: userInfo.avatarUrl
        };
        that.request({ //调用web server的 post /user API 来向数据库写入一条新的user记录
          url: '/user',
          method: 'post',
          data: userInfo,
          success: function (res) {
            that.globalData.userInfo = userInfo;
            cb();
            wx.hideLoading();
          }
        });
      },
      //授权失败，用默认值注册
      fail: function () {
        
        that.request({
          url: '/user',
          method: 'post',
          data: that.globalData.userInfo,
          success: function () {
            cb();
            wx.hideLoading();
          }
        });
      }
    })
  },

   

  //[5]将wx.request进行再封装，自定义一个request函数
  //封装：添加host值、API版本号 以及 skey
  //【本项目内的业务请求均通过此函数向web server发出请求】【且经此发出的请求是携带skey(用户凭证)的】
  request: function (obj) {
    var skey = wx.getStorageSync('skey');
    obj.url = config.host + obj.url;
    obj.header = {
      skey: skey,
      version: config.apiVersion
    };
   // console.log(obj)
    return wx.request(obj);
  },


})
