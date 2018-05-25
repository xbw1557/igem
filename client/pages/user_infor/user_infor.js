// pages/user_infor/user_infor.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid:"",//当前用户的openID
    infor:{} //当前用户个人信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {   
    this.setData({ userid: options.userid }); 

  }, 
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getinfor(); //根据用户id，向服务端获取此用户的data，以渲染显示出其个人信息页面
  },
  getinfor: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    getApp().request({

      url: '/user/see_user',
      method: 'post',
      data: {
        userid: that.data.userid
      },
      success: function (res) { 
        wx.hideLoading();
          that.setData({
            infor: res.data
          });
     
      }

    });
  }  
})