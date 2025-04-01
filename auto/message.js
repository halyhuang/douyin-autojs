// const { connect } = require("koa-route")

// console.show()
// console.log("test2")

// text("消息").findOne().parent().parent().parent().click()

// console.log('点击sept')
// text("Sept").findOne().parent().parent().parent().parent().click()
// //sleep(5000)
// console.log("输入")
// //id("df0").findOne().setText("hello")
// text("发送消息…").findOne().setText("hey,bro")
// console.log("ok")
// sleep(3000)
// console.log("点击发送")
// //id("eyk").findOne().click()
// click(665,1241)
// console.log("发送成功")
// if(id("eyk").findOne().parent().exists()){
//     console.log("哈哈哈哈")
// }

var message = {}
//转到消息页
message.goToMessagePage = function () {
    text("消息").findOne().parent().parent().parent().click()
    sleep(2000)
}

//找到联系人
message.findNameByHistoryList = function (name){
    var contact = text(name).findOne(5000)
    contact.parent().parent().parent().parent().click()
}

//发消息
message.sendMessage = function (text1){
    var inputBox = text("发送消息…").findOne()
    if (inputBox) {
        inputBox.setText(text1)
        sleep(1000)
        // 尝试找到发送按钮
        var sendBtn = text("发送").findOne(1000)
        if (sendBtn) {
            sendBtn.click()
        } else {
            click(665,1241)  // 注意：这里最好改用控件点击
        }
        return true
    }
    return false
}

//根据发消息人发来的消息提醒进入
message.noticeMessage = function () {
    var varNotify = id("ega").findOne(1000)
    if (varNotify) {
        varNotify.parent().parent().parent().parent().click()
        sleep(1000)
        //找到所有消息然后倒叙
        console.show()
        var allMessage = id("df3").find()
        if (allMessage && allMessage.size() > 0) {
            var lastMsg = allMessage.get(allMessage.size() - 1).text()
            return {
                type: "message",
                content: lastMsg
            }
        }
    }
    return null
}

// 测试服务
message.startServices = function() {
    try {
        // 启动服务
        this.goToMessagePage();
        log("消息页面已打开");
        return true;
    } catch (e) {
        log("服务启动失败:" + e);
        return false;
    }
};

// 测试消息发送
message.testMessageFlow = function() {
    // 测试用例
    var testCases = [
        { input: "ding", expected: "dong" },
        { input: "hello", expected: "你好！" },
        { input: "random", expected: "ding Please" }
    ];
    
    for (var i = 0; i < testCases.length; i++) {
        try {
            var test = testCases[i];
            var result = this.sendMessage(test.input);
            log("测试: " + test.input);
            log("期望: " + test.expected);
            log("实际: " + result);
            sleep(1000);
        } catch (e) {
            log("测试失败: " + test.input + ", 错误: " + e);
        }
    }
};

// 消息队列处理
var MessageQueue = function() {
    this.queue = [];
    this.processing = false;
};

MessageQueue.prototype.add = function(message) {
    this.queue.push(message);
    if (!this.processing) {
        this.process();
    }
};

MessageQueue.prototype.process = function() {
    this.processing = true;
    while (this.queue.length > 0) {
        var msg = this.queue.shift();
        message.sendMessage(msg);
        sleep(1000);
    }
    this.processing = false;
};

// 状态管理
var botState = {
    isLoggedIn: false,
    currentUser: null,
    lastMessageTime: 0,
    messageCount: 0,
    
    reset: function() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.lastMessageTime = 0;
        this.messageCount = 0;
    }
};

// 导出模块
module.exports = message

// 运行前检查
function checkEnvironment() {
    auto.waitFor();
    if (!auto.service) {
        toast("请开启无障碍服务");
        exit();
    }
    
    if (!app.getPackageName("com.ss.android.ugc.aweme")) {
        toast("请安装抖音");
        exit();
    }
    
    return true;
}

// 如果直接运行此文件，执行测试
if (engines.myEngine().source.toString() === engines.myEngine().getSource()) {
    console.show();
    log("开始测试消息模块...");
    
    if (checkEnvironment()) {
        message.startServices();
        message.testMessageFlow();
    }
}