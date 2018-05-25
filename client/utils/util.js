///其实已经完全不用了，只是保留注释。

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
};

var index = require('../data/data_index.js')
var index_next = require('../data/data_index_next.js')
var discovery = require('../data/data_discovery.js')
var discovery_next = require('../data/data_discovery_next.js')

/*
function getData(url){
  return new Promise(function(resolve, reject){
    wx.request({
      url: url,
      data: {},
      header: {
        //'Content-Type': 'application/json'
      },
      success: function(res) {
        console.log("success")
        resolve(res)
      },
      fail: function (res) {
        reject(res)
        console.log("failed")
      }
    })
  })
}*/

///// 对QA页面 基于参考代码的自改进，前端应该只需要修改此两个函数，改为从后台取数据
//考虑：这里return的数据除了页面要显示的，还可以加一个“标注取到了data里，id为多少的[问题概述]数据”
//则下一次再调用这个getData的函数时，就可以将这个值作为参数再传到服务端，让服务端从id+1的记录开始取。
//且注意，还需要加一个“已加载到达底部”的处理。（可在前端加，如 判断feed_length到50[多了对于页面大小也是负担]就不再执行lower函数里的 再向后台要数据，而是可以只直接弹出一个窗口显示“已经到达底部”）
//且可能需要调整一下“取消 加载成功 窗口”的位置
/*
function getData2(){
  return index.index;  //返回data文件夹下的一个json数据
}

function getNext(){
  return index_next.next;
}*/
var response;
function getData2() {
  
  getApp().request({

    url: '/question',
    method: 'post',
    data: {
      reqid:1
    },
    success: function (res) {
      //console.log(res);
      response = res.data;
    }

  });
  console.log(response);
  return response;
}

function getNext() {
  return index_next.next;
}

//////


function getDiscovery(){
  return discovery.discovery;
}

function discoveryNext(){
  return discovery_next.next;
}



//module.exports.getData = getData;
module.exports.getData2 = getData2;
module.exports.getNext = getNext;
module.exports.getDiscovery = getDiscovery;
module.exports.discoveryNext = discoveryNext;




