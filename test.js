const fs = require('fs')

// 读数据库
const userString = fs.readFileSync('./db/users.json').toString()
const userArray = JSON.parse(userString) 
// JSON.parse 可以把字符串变成对应的数组/对象/等
console.log(userArray)
// console.log(typeof userArray)
// console.log(userArray instanceof Array) // 如果 ture 就说明是数组

// 写数据库
const user3 = {id:3, name:'Tom', password:'yyy'}
userArray.push(user3)
// 把 userArray 放进数据库
const string = JSON.stringify(userArray) // 把 userArray 变成 string
fs.writeFileSync('./db/users.json', string)
// 运行一次（node test.js）就会增加一个 {id:3, name:'Tom', password:'yyy'} 。

