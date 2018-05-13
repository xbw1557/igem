Page({
  data: {
    hasLoaded: false, 
  },

  onLoad: function () {

    console.info('loading index...');

    getApp().checkLogin(function () {

    });  //登录
    
  }, 
  onShow: function ()   
  {

    if (this.data.hasLoaded) {
      this.load();
    }
    this.data.hasLoaded = true;
  },


  load: function () { }, //加载初始页面所需数据等，待实现
})
