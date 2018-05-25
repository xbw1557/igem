//index.js
//


//var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    feed: [],
    feed_length: 0,
    hasload: false,  //是否已经加载完初始数据
    reqid: -1  //目前要获取的问题概述的id
  },
  //事件处理函数
  bindItemTap: function () {
    wx.navigateTo({
      url: '../answer/answer'
    })
  },

  ///跳转到具体的问题页面
  bindQueTap: function (event) {
    //console.log(event);
    //console.log(event.currentTarget.dataset.qid);
    var qid = event.currentTarget.dataset.qid;
    wx.navigateTo({
      url: '../question/question?qid=' + qid  //注意勿漏等于号，否则在跳转后页面的解析接受会有问题
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    this.getData();
  },
  onShow: function () {

    this.getData(); //也需要加一个onshow执行此，否则发布问题以后，自己不能及时看到。
  },
  upper: function () { 
    wx.showNavigationBarLoading()
    this.refresh();
    console.log("upper");
    setTimeout(function () { wx.hideNavigationBarLoading(); wx.stopPullDownRefresh(); }, 2000);
  },
  lower: function (e) {
    wx.showNavigationBarLoading();
    var that = this;
    setTimeout(function () { wx.hideNavigationBarLoading(); that.nextLoad(); }, 1000);
    console.log("lower")
  },
  //scroll: function (e) {
  //  console.log("scroll")
  //},

  //发布新的问题
  newq: function () {
    wx.navigateTo({ url: "/pages/newq/newq" })
  },



  /*  //暂时似乎没有用，应该是留给  调用util.getData这个通过网络获取data的接口的
    //网络请求数据, 实现首页刷新
    refresh0: function () {
      var index_api = '';
      util.getData(index_api)
        .then(function (data) {
          //this.setData({
          //
          //});
          console.log(data);
        });
    },*/
  getData2: function () {
    var that = this;
    getApp().request({

      url: '/question',
      method: 'post',
      data: {
        reqid: that.data.reqid
      },
      success: function (res) { 
        if (res.statusCode!=400)
        {
          that.setData({ reqid: res.data.id, feed: res.data.data, feed_length: res.data.data.length });
        }
      }

    });

  },
   
  getData: function () {
    //在这里先request获取到question表格的长度，然后放在页面的状态变量reqid里。
    //然后再在此request的success里调用下面的getData2获取最新的8条问题概述
    ///【待检查】 //test ok

    var that = this;

    wx.showLoading({
      title: '加载中',
      mask: true
    });
    getApp().request({

      url: '/question',
      method: 'get',
      success: function (res) {
        wx.hideLoading();
        that.setData({ reqid: res.data.reqid });
        //console.log(that.data.reqid)
        that.getData2();

      }

    });
    //this.getData2();//直接使用getData2()会显示 getData2 is not defined     
  },
  refresh: function () {
    this.getData();
    
  },


  //获取到 新的 好几个 问题 的信息
  //关于lower函数有时候触发不了的问题，详情见服务端的question.js的注释
  //【待检查】 //改写，用reqid去获取接下来的六条问题概述，并且判断在 reqid<1的时候，使用wx.showToast显示"已经加载到底部" √
  nextLoad: function () {


    if (this.data.reqid < 1)   //判断已经加载到底部了
    {
      wx.showToast({
        title: '已经加载到底部',
        icon: 'success',
        duration: 2000
      })
      return;
    }

    ///////
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    var that = this;
    getApp().request({

      url: '/question',
      method: 'post',
      data: {
        reqid: that.data.reqid
      },
      success: function (res) {
        wx.hideLoading(); 
        that.setData({
          reqid: res.data.id,
          feed: that.data.feed.concat(res.data.data),  ///注意，这里用的是拼接，则feed里存放的 应该总是"所有已经加载出来过的数据{}"
          feed_length: that.data.feed_length + res.data.data.length
        });

      }

    });
    /// 
  },

  //进行问题检索 √
  search: function (e) {
    var that = this;
    var query = e.detail.value.trim();///搜索关键字
    if (query == "") { this.getData();} //如果关键字为空，则刷新为初始的QA页面（按时间显示所有问题，否则才发出search请求
    else {
      getApp().request({

        url: '/question/search',
        method: 'post',
        data: {
          query: query
        },
        success: function (res) {
          if (res.statusCode == 200) { //成功找到结果//一次返回所以匹配结果，所以直接置reqid为-1
            that.setData({ reqid:-1, feed: res.data, feed_length: res.data.length });
          }
          else { that.setData({ feed: []});} //未找到结果，则置空feed
        }

      });}
 
  }

})