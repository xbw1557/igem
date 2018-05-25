var config = require('../../config');

Page({
  data: {
    hasLoaded: false,
    avatar: '',
    name:'',
    intro: '',
    status: '',
    radio: '',
    school: '',
    project: '',
    condition:true  
    //注意，此处不能写成'true'，而必须用bool变量，然后在两个要相互切换显示/不显示的按钮的点集事件里，相互写上this.setData({ condition: true/false});  ，按钮上各自赋值 hidden="{{!condition}}"/ hidden="{{condition}}"   //// 否则如果都用成condition:'true'，会发生点击按钮以后 虽然看到Appdata里状态变量值变了，但是按钮不会改变，注意，此时并不是“this.setData了却没有发生数据渲染的问题”！！其实问题是，此时不管怎么变，condition的值都会视为"非空字符串"而已，所以其实不管改为"true"还是"false"，其都永远为真，所以永远只为显示某个按钮。 

  },

  onLoad: function () {  // 似乎是只在第一次第一次进入(即生成)这个页面的时候才会触发，所以如果在如按钮事件里改了什么参数要立刻渲染的，也是应该写在那里面，写在这里似乎没有用？
   
  }, 


  onShow: function ()  //似乎是每一次进入(即生成)这个页面的时候都会触发， 
  {
    this.setData({ avatar: getApp().globalData.userInfo.avatar });
    this.setData({ name: getApp().globalData.userInfo.name });
  
   
      this.load();
   
  },


  load: function () //向服务器发出请求获取用户详细信息，加载初始页面所需各项数据
  { 
    var that = this;
    getApp().request({

      url: '/user',
      method: 'get',
      success: function (res) {
      
        getApp().globalData.userInfo.intro = res.data.intro;
        getApp().globalData.userInfo.status = res.data.status;
        getApp().globalData.userInfo.radio = res.data.radio;
        getApp().globalData.userInfo.school = res.data.school;
        getApp().globalData.userInfo.project = res.data.project;
        that.setData({ intro: getApp().globalData.userInfo.intro });
        that.setData({ status: getApp().globalData.userInfo.status });
        that.setData({ radio: getApp().globalData.userInfo.radio });
        that.setData({ school: getApp().globalData.userInfo.school });
        that.setData({ project: getApp().globalData.userInfo.project });
      }

    });

  },

  changeAvatar: function (e) {

    var that = this;

    wx.chooseImage({
      success: function (res) {

        wx.showLoading({
          title: '更新用户信息',
          mask: true
        });

        wx.uploadFile({
          header: {
            skey: wx.getStorageSync('skey')
          },
          url: config.host + '/user/avatar',
          filePath: res.tempFilePaths[0],
          name: 'avatar',
          success: function (res) {
            getApp().request(
              {
                url: '/user/changeURL',
              method: 'post', 
              data: {
                avatar: res.data     
              },
              success: function () {  
                wx.hideLoading();

                getApp().globalData.userInfo.avatar = res.data;
                that.setData({ avatar: res.data });
              }
            });

          }
        });

      }
    });
  },

  postinfor: function ()
{
   ////先修改本地数据
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

  getApp().request({
  
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
