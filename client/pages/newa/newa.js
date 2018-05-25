var config = require('../../config');

Page({
  data: {
    pictures: [], //存放所有upload了的图片,即一串URL地址 
    detail: '',  //存放回答内容
    //qid:-1 //存放qid
  },

  onLoad: function (options) {
    this.setData({ qid: options.qid });    
  },


  onShow: function ()   
  {


  },


  //点击发布回帖
  //将edit完毕的数据"detail以及一个图片URL数组，上传到数据库，以新增一条回帖记录
  formSubmit: function (e) {

    this.setData({ detail: e.detail.value.detail.trim() }); 
    var that = this;

    wx.showLoading({
      title: '正在发布回帖',
      mask: true
    });

    getApp().request({

      url: '/answer/postanswer',
      method: 'post',
      data: {
        qid: that.data.qid,
        detail: that.data.detail,
        pictures: that.data.pictures
      },
      success: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: '成功发布',
          icon: 'success',
          duration: 2000
        })
      }

    });

  },


  ///////////////////////////////保存edit数据  

   /*
  changedetail: function (e) { 
    //注意这里可能会没有（失焦）触发，从而点击发帖以后，回复内容为空的。
    //发布问题的也有一样的问题  //已经修复，解析见 newq.js
    this.setData({ detail: e.detail.value.trim() });
  },*/

  //上传图片
  UploadPicture: function (e) {

    var that = this;

    wx.chooseImage({
      success: function (res) {

        wx.showLoading({
          title: '上传图片中',
          mask: true
        });

        wx.uploadFile({
          header: {
            skey: wx.getStorageSync('skey')
          },
          url: config.host + '/question/UploadPicture',
          filePath: res.tempFilePaths[0],
          name: 'avatar',  
          success: function (res) {
            if (res.statusCode == 200) {
            wx.hideLoading();
            //服务器返回上传图片的URL地址，将其add到页面的内部状态变量pictures中
            newpictures = that.data.pictures;
            newpictures.push(res.data);
            that.setData({ pictures: newpictures });}
            else{
              wx.showToast({
                title: '图片过大，上传失败，请重新填写问题',
                icon: 'none',
                duration: 2000
              })
            }
          }
        });

      }
    });
  }


})
