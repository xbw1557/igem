// pages/picture/picture.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
   _type:'',
   pictures:[] //所有要显示的图片url
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //先从options.type里判断出要显示的是 问题的图片 还是 回答的图片，从而在下一步向服务端发出不同的请求，以去查不同的表格。
    this.setData({_type:options.type});
    if (this.data._type == "question") this.setData({ qid: options.qid });
    else  this.setData({ aid: options.aid });

    this.loadurl();
   
  }, 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  loadurl: function(){ 
    var that = this;
    if (this.data._type == "question") {
      //按照qid，从服务端获取本question的所有图片URL（仅为问题的，不含回答的,以供页面渲染显示
      getApp().request({

        url: '/question/picture',
        method: 'post',
        data: {
          qid: that.data.qid
        },
        success: function (res) { 
          that.setData({ pictures: res.data }); 
        }

      });
    }
    else {
      //按照aid，从服务端获取本回答的所有图片URL 
      getApp().request({

        url: '/answer/picture',
        method: 'post',
        data: {
          aid: that.data.aid
        },
        success: function (res) {
          that.setData({ pictures: res.data });
        }

      });
    }
  } 
})