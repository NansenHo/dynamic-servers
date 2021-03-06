var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

  if(path === '/sign_in' && method === 'POST'){
    const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
    const array = [] // 因为数据可能是分段上传的，所以要用数组。
    request.on('data',chunk=>{
        array.push(chunk) // chunk 就是一段数据
    }) // data 就是上传事件
    request.on('end', ()=>{ // 结束
        const string = Buffer.concat(array).toString()
        // Buffer : 把不同数据合成一个字符串
        const obj = JSON.parse(string) // 有 name password
        const user = userArray.find(
          user => user.name === obj.name && user.password === obj.password)
        if(user === undefined){
          response.statusCode = 400
          response.setHeader('Content-Type', 'text/json; charset=utf-8') // 告诉浏览器这个内容是 JSON
          response.end(`{"errorCode": 4001}`) // return JSON
          // 每个公司都应该有自己的一个 errorCode 编码，自己在文档中规定
        } else{
          response.statusCode = 200
          response.setHeader('Set-Cookie', 'logined=1') // 你登录成功就给你一个 Cookie 
          response.end()
        }
    })
  } else if(path === '/home.html'){
    const cookie = request.headers['cookie'] // 读取 Cookie ，忘了怎么读取，可以去 node.js 中文官网上找，在 http 里面
    if(cookie === 'logined=1'){
      const homeHtml = fs.readFileSync('./public/home.html').toString() // 替换 home 文件的内容
      // FileReaderSync接口允许以同步的方式读取File或Blob对象中的内容。
      // 得到文件了，记得 toString() 一下，因为其默认不是 toString
      const string = homeHtml.replace('{{loginStatus}}', '已登陆') // replace() 方法返回一个由替换值（replacement）替换部分或所有的模式（pattern）匹配项后的新字符串。
      response.write(string)
    }else {
      const homeHtml = fs.readFileSync('./public/home.html').toString()
      const string = homeHtml.replace('{{loginStatus}}', 'balabala登陆')
      response.write(string)
    }
  } else if(path === '/register' && method === 'POST'){
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    const userArray = JSON.parse(fs.readFileSync('./db/users.json'))
    const array = [] // 因为数据可能是分段上传的，所以要用数组。
    request.on('data',chunk=>{
        array.push(chunk) // chunk 就是一段数据
    }) // data 就是上传事件
    response.end('end', ()=>{ // 结束
        console.log(array)
        const string = Buffer.concat(array).toString()
        // Buffer : 把不同数据合成一个字符串
        console.log(string)
        const obj = JSON.parse(string)
        const lastUser = userArray[userArray.length - 1]
        console.log(obj.name)
        console.log(obj.password)
        const newUser = {
            id: lastUser ? lastUser.id + 1 : 1,
            // 如果数据库里没有东西，id 就是 1 
            name: obj.name,
            password: obj.password
        }
        // 还不知道，但是是 userArray 里面的 id 最大的人 +1
        // 一般是最后那个人的 id 是最大的
        userArray.push(newUser)
        fs.writeFileSync('./db/users.json', JSON.stringify(userArray))
        response.end()
    })
  }else{
    response.statusCode = 200
    const filePath = path === '/' ? '/index.html' : path
    // 如果 path 是 / ，就访问 index.html（默认首页） 。不是就访问它自己
    // 很多浏览器也会为你自动加上这句话
    const index = filePath.lastIndexOf('.')
    const suffix = filePath.substring(index)
    const fileTypes = {
        '.html':'text/html',
        '.css':'text/css',
        '.js':'text/javascript',
        '.json':'text/json',
        '.xml':'text/xml',
        '.png':'image/png',
        '.jpg':'image/jpeg'
    }
    response.setHeader('Content-Type', `${fileTypes[suffix] || 'text/html'};charset=utf-8`)
    let content 
    try{ // 意思是，我里面的代码有可能会报错
        content = fs.readFileSync(`./public${filePath}`)
    }catch(error){ // 出错了就抓住错误
        content = '文件不存在'
        response.statusCode = 404
    }
    response.write(content)
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)