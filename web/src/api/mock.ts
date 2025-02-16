import Mock from 'mockjs'

Mock.mock(/data/, function () {
    console.log("你好")
})