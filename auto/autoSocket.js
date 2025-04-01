console.show();

// 导入Java类
importClass('java.io.BufferedReader');
importClass('java.io.IOException');
importClass('java.io.InputStream');
importClass('java.io.InputStreamReader');
importClass('java.io.OutputStream');
importClass('java.io.PrintWriter');
importClass('java.net.Socket');
importClass('java.net.ServerSocket');

// 消息模块
var message = {};

// 转到消息页
message.goToMessagePage = function () {
    text("消息").findOne().parent().parent().parent().click();
    sleep(2000);
};

// 找到联系人
message.findNameByHistoryList = function (name) {
    var contact = text(name).findOne(5000);
    contact.parent().parent().parent().parent().click();
};

// 发消息
message.sendMessage = function (text1) {
    try {
        var inputBox = text("发送消息…").findOne(3000);
        if (!inputBox) {
            throw new Error("找不到输入框");
        }
        
        inputBox.setText(text1);
        sleep(1000);
        
        var sendBtn = text("发送").findOne(1000);
        if (sendBtn) {
            sendBtn.click();
        } else {
            click(665,1241);
        }
        return true;
    } catch (e) {
        log("发送消息失败:" + e);
        return false;
    }
};

// 监听新消息
message.noticeMessage = function () {
    var varNotify = id("ega").findOne(1000);
    if (varNotify) {
        varNotify.parent().parent().parent().parent().click();
        sleep(1000);
        var allMessage = id("df3").find();
        if (allMessage && allMessage.size() > 0) {
            var lastMsg = allMessage.get(allMessage.size() - 1).text();
            return {
                type: "message",
                content: lastMsg
            };
        }
    }
    return null;
};

// 消息处理器
var messageHandler = {
    queue: [],
    processing: false,
    
    handleMessage: function(messageStr) {
        try {
            var data = JSON.parse(messageStr);
            this.queue.push(data);
            
            if (!this.processing) {
                this.processQueue();
            }
            return {
                status: "success"
            };
        } catch (e) {
            log("消息处理错误:" + e);
            return {
                status: "error",
                error: e.toString()
            };
        }
    },
    
    processQueue: function() {
        this.processing = true;
        while (this.queue.length > 0) {
            var msg = this.queue.shift();
            message.sendMessage(msg);
            sleep(1000);
        }
        this.processing = false;
    }
};

// 运行前检查项
var checkList = {
    checkPermissions: function() {
        if (!auto.service) {
            toast("请开启无障碍服务！");
            return false;
        }
        return true;
    },
    
    checkApps: function() {
        // 检查所有可能的抖音包名
        var douyinPackages = [
            "com.ss.android.ugc.aweme",        // 抖音普通版
            "com.ss.android.ugc.aweme.lite",   // 抖音极速版
            "com.ss.android.article.news",      // 抖音火山版
            "com.ss.android.ugc.live"          // 抖音直播伴侣
        ];
        
        // 尝试通过应用名启动
        if (app.launchApp("抖音")) {
            log("通过应用名成功启动抖音");
            return true;
        }
        
        // 尝试通过包名检查
        for (var i = 0; i < douyinPackages.length; i++) {
            if (app.getPackageName(douyinPackages[i])) {
                log("找到抖音包名：" + douyinPackages[i]);
                return true;
            }
        }
        
        toast("未找到抖音应用，请确保已安装抖音！");
        return false;
    },
    
    checkNetwork: function() {
        try {
            // 简单检查是否有网络连接
            var networkAvailable = false;
            try {
                networkAvailable = http.get("http://www.baidu.com").statusCode === 200;
            } catch(e) {
                networkAvailable = false;
            }
            
            if (!networkAvailable) {
                toast("请检查网络连接");
                return false;
            }
            
            log("网络连接正常");
            return true;
        } catch (e) {
            log("网络检查出错: " + e);
            // 即使检查出错也返回 true，不影响主程序运行
            return true;
        }
    },
    
    runAll: function() {
        return this.checkPermissions() 
            && this.checkApps() 
            && this.checkNetwork();
    }
};

// 消息处理函数
function handleMessage(info) {
    try {
        var data = JSON.parse(info);
        
        switch(data.type) {
            case "receive_message":
                if(data.content === "ding") {
                    message.sendMessage("dong");
                    return JSON.stringify({
                        type: "message_sent",
                        status: "success",
                        content: "dong"
                    });
                }
                break;
            case "send_message":
                var result = message.sendMessage(data.content);
                return JSON.stringify({
                    type: "message_sent",
                    status: result ? "success" : "failed",
                    content: data.content
                });
            case "login":
                return handleLogin();
        }
    } catch(e) {
        log("消息处理错误：" + e);
        return JSON.stringify({
            type: "error",
            message: e.toString()
        });
    }
}

// 修改 handleLogin 函数
function handleLogin() {
    log("处理登录请求");
    try {
        // 先尝试通过应用名启动
        if (app.launchApp("抖音")) {
            log("成功启动抖音");
        } else {
            // 如果应用名启动失败，尝试包名启动
            var douyinPackages = [
                "com.ss.android.ugc.aweme",
                "com.ss.android.ugc.aweme.lite"
            ];
            
            var launched = false;
            for (var i = 0; i < douyinPackages.length; i++) {
                if (app.getPackageName(douyinPackages[i])) {
                    launch(douyinPackages[i]);
                    launched = true;
                    log("通过包名启动抖音：" + douyinPackages[i]);
                    break;
                }
            }
            
            if (!launched) {
                throw new Error("无法启动抖音应用");
            }
        }
        
        sleep(3000); // 等待应用启动
        message.goToMessagePage();
        return JSON.stringify({
            type: "login_success",
            status: 0,
            message: "登录成功"
        });
    } catch(e) {
        log("登录失败：" + e);
        return JSON.stringify({
            type: "login_failed",
            status: 1,
            message: "登录失败：" + e
        });
    }
}

// 主程序
function main() {
    auto.waitFor();
    console.show();
    
    if (!checkList.runAll()) {
        toast("环境检查失败，请检查权限和应用安装情况");
        exit();
    }
    
    // 清理之前可能存在的脚本
    engines.all().forEach(function(engine) {
        if(engine.id !== engines.myEngine().id) {
            // 停止其他正在运行的脚本
            engine.forceStop();
        }
    });
    
    var serversocket = null;
    try {
        // 尝试不同的端口
        var ports = [3000, 3001, 3002, 3003, 3004];
        var connected = false;
        
        for(var i = 0; i < ports.length; i++) {
            try {
                serversocket = new ServerSocket(ports[i]);
                log('服务端已启动在端口: ' + ports[i]);
                connected = true;
                break;
            } catch(e) {
                log("端口 " + ports[i] + " 被占用，尝试下一个端口");
                continue;
            }
        }
        
        if(!connected) {
            throw new Error("所有端口都被占用，无法启动服务器");
        }
        
        log('等待客户端连接...');
        var socket = serversocket.accept();
        log('客户端已连接');
        
        var inputStream = socket.getInputStream();
        var inputStreamReader = new InputStreamReader(inputStream);
        var bufferedReader = new BufferedReader(inputStreamReader);
        var outputStream = socket.getOutputStream();
        var printWriter = new PrintWriter(outputStream);
        
        while(true) {
            try {
                var temp = bufferedReader.readLine();
                if(temp != null) {
                    log("收到客户端信息：" + temp);
                    var response = handleMessage(temp);
                    log("发送响应：" + response);
                    printWriter.print(response);
                    printWriter.flush();
                }
                sleep(200);
            } catch(e) {
                log("发生错误：" + e);
                break;
            }
        }
    } catch(e) {
        log("服务器错误：" + e);
    } finally {
        // 确保资源被正确释放
        try {
            if (serversocket != null && !serversocket.isClosed()) {
                serversocket.close();
            }
        } catch(e) {
            log("关闭服务器socket时出错：" + e);
        }
    }
}

// 添加退出处理
events.on('exit', function() {
    // 脚本退出时的清理工作
    log("脚本正在退出，清理资源...");
});

// 添加按键监听，按音量键停止脚本
events.observeKey();
events.onKeyDown("volume_down", function(event){
    toast("停止脚本");
    exit();
});

// 运行主程序
main();