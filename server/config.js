module.exports = {
  port: 5757,
  //过期时间，秒
  expireTime: 24 * 3600,
  appid: 'wx8fa61c5901a83488',//your app id
  secret: '7a3b953a828b6771e2c6fe8efc25b8fc', // 填入：微信公众平台的开发设置，生成获取到的Appsecret(小程序密钥)
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',//phpMyadmin登录名，默认是root
    db: 'todo', //数据库名称
    pass: 'wx8fa61c5901a83488',//phpMyadmin登录名密码，默认是your app id
    char: 'utf8mb4'
  },
  //文件云存储  
  cos: {
    region: 'ap-guangzhou',  //存储桶所属地域
    fileBucket: 'todo'  //存储桶名称
  }
};