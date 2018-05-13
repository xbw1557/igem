var config = require('../../config');

Page({
    //本页面的内部状态变量
  data: {
    hasLoaded: false,
    avatar: '',
    name:'',
    intro: '',
    status: '',
    radio: '',
    school: '',
    project: '',
    condition:true  //注意，非"true"
    
  },

  onLoad: function () {   
  }, 


  onShow: function ()    
  {
    this.setData({ avatar: getApp().globalData.userInfo.avatar });
    this.setData({ name: getApp().globalData.userInfo.name });
  
   
      this.load();
   
  },

//向服务器发出请求获取用户详细信息，加载初始页面所需各项数据
  load: function () 
  { 
    var that = this;
    getApp().request({  //请求服务器上的 API: get /user

      url: '/user',
      method: 'get',
      success: function (res) {  //成功收到服务器response时执行此
      
        getApp().globalData.userInfo.intro = res.data.intro; //从response里提取出data，更新到全局变量（即client/app.js内声明的globalData
        getApp().globalData.userInfo.status = res.data.status;
        getApp().globalData.userInfo.radio = res.data.radio;
        getApp().globalData.userInfo.school = res.data.school;
        getApp().globalData.userInfo.project = res.data.project;
        that.setData({ intro: getApp().globalData.userInfo.intro }); //再将response的data更新到本页面的内部状态变量
        that.setData({ status: getApp().globalData.userInfo.status });
        that.setData({ radio: getApp().globalData.userInfo.radio });
        that.setData({ school: getApp().globalData.userInfo.school });
        that.setData({ project: getApp().globalData.userInfo.project });
      }

    });

  },

  //修改头像
  changeAvatar: function (e) {

    var that = this;

    wx.chooseImage({ //选择本地图像
      success: function (res) {

        wx.showLoading({  //显示"更新用户信息"加载窗
          title: '更新用户信息',
          mask: true
        });

        wx.uploadFile({  //上传选中的图片到服务器
          header: {
            skey: wx.getStorageSync('skey')
          },
          url: config.host + '/user/avatar', //请求服务器上的 API: post /user/avatar
          filePath: res.tempFilePaths[0],
          name: 'avatar',
          success: function (res) { //成功通过上述API上传图片到COS后则进入此处（此处获取的res是上传图片存储的URL地址
            getApp().request(  //再次发出请求，请求服务器上的 API: post /user/changeURL，将res中的URL地址更新给数据库中本用户记录的avatar字段
              {
                url: '/user/changeURL',
              method: 'post', 
              data: {
                avatar: res.data     
              },
              success: function () {  
                wx.hideLoading();

                getApp().globalData.userInfo.avatar = res.data; 
                that.setData({ avatar: res.data });  //将页面的内部状态变量avatar更新为新的URL地址（COS中存放选择图片的地方），则此时显示头像为选中的新图片
              }
            });

          }
        });

      }
    });
  },
  
  
  
///修改用户信息
  postinfor: function ()
{
   ////先将新edit的数据先修改到本地数据
    getApp().globalData.userInfo.intro = this.tempdata.intro;
    getApp().globalData.userInfo.status = this.tempdata.status;
    getApp().globalData.userInfo.radio = this.tempdata.radio;
    getApp().globalData.userInfo.school = this.tempdata.school;
    getApp().globalData.userInfo.project = this.tempdata.project;
    this.setData({ intro: getApp().globalData.userInfo.intro });
    this.setData({ status: getApp().globalData.userInfo.status });
    this.setData({ radio: getApp().globalData.userInfo.radio });
    this.setData({ school: getApp().globalData.userInfo.school });
    this.setData({ project: getApp().globalData.userInfo.project });

    //console.log(this.tempdata)
    wx.showLoading({
      title: '更新用户信息',
      mask: true
    });

  getApp().request({  //将新edit的数据更新到数据库
  
    url: '/user/changeinfor',
    method: 'post',  
    data: {
      intro: this.tempdata.intro,
      status: this.tempdata.status,
      radio: this.tempdata.radio,
      school: this.tempdata.school,
      project: this.tempdata.project
    },
    success: function (res) {
      wx.hideLoading();  
    }
    
  });

  this.setData({ condition: true });
},

  editinfor:function()
  {
    this.setData({ condition: false});

  },
///////////////////////////////保存edit数据 //待修改 //各个edit规则独立+独立更新
tempdata:{
  intro: '',
  status: '',
  radio: '',
  school: '',
  project: ''
},
 changeintro: function (e) {
    this.tempdata.intro = e.detail.value.trim();
     
  },
  changestatus: function (e) {
    this.tempdata.status = e.detail.value.trim();
     
  },
  changeschool: function (e) {
    this.tempdata.school = e.detail.value.trim();
    console.log(name)
  },
  changeproject: function (e) {
    this.tempdata.project= e.detail.value.trim();
     
  },
  changeradio: function (e) {
    this.tempdata.radio = e.detail.value.trim();

  }

})
