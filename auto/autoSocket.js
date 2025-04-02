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
importClass('android.view.accessibility.AccessibilityNodeInfo');
importClass('android.view.accessibility.AccessibilityWindowInfo');

// 消息模块
var message = {};

// 转到消息页
message.goToMessagePage = function () {
    try {
        Logger.info("开始导航到消息页面");
        
        // 增加等待时间
        sleep(5000);
        
        // 检查当前是否已经在消息页面
        var inputBox = id("msg_et").findOne(5000);
        if (inputBox) {
            Logger.info("已经在消息页面");
            return true;
        }
        
        // 尝试多种方式查找消息按钮
        var msgBtn = null;
        try {
            // 方式1：通过文本查找
            msgBtn = text("消息").findOne(5000);
            if (!msgBtn) {
                // 方式2：通过描述查找
                msgBtn = desc("消息").findOne(5000);
            }
            if (!msgBtn) {
                // 方式3：通过ID查找
                msgBtn = id("com.ss.android.ugc.aweme:id/message_tab").findOne(5000);
            }
        } catch(e) {
            Logger.error("查找消息按钮时出错: " + e);
        }
        
        if (!msgBtn) {
            Logger.error("未找到消息按钮，尝试返回主页");
            back();
            sleep(3000);
            msgBtn = text("消息").findOne(5000);
        }
        
        if (!msgBtn) {
            Logger.error("仍然无法找到消息按钮");
            return false;
        }
        
        Logger.info("找到消息按钮，准备点击");
        msgBtn.click();
        Logger.info("成功点击消息按钮");
        
        // 增加等待时间，确保页面完全加载
        sleep(8000);
        
        // 查找并点击收到的消息按钮
        Logger.info("开始查找收到的消息按钮");
        var receivedMsgBtn = className("android.widget.Button").findOne(8000);
        if (receivedMsgBtn) {
            Logger.info("找到收到的消息按钮，准备点击");
            receivedMsgBtn.click();
            Logger.info("成功点击收到的消息按钮");
            sleep(5000);
        } else {
            Logger.error("未找到收到的消息按钮");
            return false;
        }
        
        // 验证是否成功进入消息页面
        inputBox = id("msg_et").findOne(8000);
        if (inputBox) {
            Logger.info("成功进入消息页面");
            return true;
        }
        
        // 尝试其他方式查找输入框
        inputBox = text("发送消息…").findOne(8000);
        if (inputBox) {
            Logger.info("通过文本找到输入框");
            return true;
        }
        
        inputBox = className("android.widget.EditText").findOne(8000);
        if (inputBox) {
            Logger.info("通过类名找到输入框");
            return true;
        }
        
        // 如果还是找不到，尝试点击输入框区域
        Logger.info("尝试点击输入框区域");
        click(540, 1200);
        sleep(3000);
        
        // 再次检查输入框
        inputBox = id("msg_et").findOne(5000);
        if (inputBox) {
            Logger.info("点击区域后找到输入框");
            return true;
        }
        
        Logger.error("未能成功进入消息页面");
        return false;
    } catch(e) {
        Logger.error("goToMessagePage错误: " + e);
        return false;
    }
};

// 找到联系人
message.findNameByHistoryList = function (name) {
    var contact = text(name).findOne(5000);
    contact.parent().parent().parent().parent().click();
};

// 发消息
message.sendMessage = function (text1) {
    try {
        Logger.info("开始发送消息: " + text1);
        
        // 1. 点击发送消息文本框
        Logger.info("步骤1: 点击发送消息文本框");
        var inputBox = id("msg_et").findOne(5000);
        if (!inputBox) {
            Logger.error("未找到发送消息文本框");
            return false;
        }
        
        // 确保文本框可以点击
        if (!inputBox.clickable()) {
            var clickableParent = inputBox;
            while (clickableParent && !clickableParent.clickable()) {
                clickableParent = clickableParent.parent();
            }
            if (clickableParent) {
                clickableParent.click();
            } else {
                inputBox.click();
            }
        } else {
            inputBox.click();
        }
        
        Logger.info("成功点击发送消息文本框");
        sleep(2000);
        
        // 2. 输入文本
        Logger.info("步骤2: 输入文本");
        // 重新获取输入框，避免状态失效
        inputBox = id("msg_et").findOne(5000);
        if (!inputBox) {
            Logger.error("输入文本时未找到文本框");
            return false;
        }
        inputBox.setText(text1);
        Logger.info("成功输入文本");
        sleep(2000);
        
        // 3. 点击发送按钮
        Logger.info("步骤3: 点击发送按钮");
        var sendBtn = className("android.widget.FrameLayout")
            .clickable(true)
            .depth(1)
            .findOne(5000);
            
        if (!sendBtn) {
            // 尝试其他方式查找发送按钮
            sendBtn = text("发送").findOne(5000);
            if (!sendBtn) {
                sendBtn = desc("发送").findOne(5000);
            }
        }
        
        if (!sendBtn) {
            Logger.error("未找到发送按钮");
            return false;
        }
        
        sendBtn.click();
        Logger.info("成功点击发送按钮");
        sleep(3000);
        
        // 4. 验证消息是否发送成功
        Logger.info("步骤4: 验证消息发送结果");
        var sentMessage = text(text1).findOne(5000);
        if (sentMessage) {
            Logger.info("消息发送成功");
            return true;
        } else {
            // 再次尝试查找已发送的消息
            sleep(2000);
            sentMessage = text(text1).findOne(3000);
            if (sentMessage) {
                Logger.info("消息发送成功(第二次确认)");
                return true;
            }
            Logger.error("消息发送可能失败");
            return false;
        }
    } catch (e) {
        Logger.error("发送消息失败:" + e);
        return false;
    }
};

// 修改界面分析工具
var UiHelper = {
    // 获取当前活动窗口
    getCurrentActivity: function() {
        return currentActivity();
    },
    
    // 获取当前包名
    getCurrentPackage: function() {
        return currentPackage();
    },
    
    // 深度遍历节点
    traverseNode: function(root, callback) {
        if (!root) return;
        
        // 处理当前节点
        callback(root);
        
        // 遍历子节点
        if (root.children) {
            root.children().forEach(function(child) {
                UiHelper.traverseNode(child, callback);
            });
        }
    },
    
    // 获取节点完整信息
    getNodeInfo: function(node) {
        if (!node) return null;
        try {
            return {
                text: node.text(),
                desc: node.desc(),
                id: node.id(),
                className: node.className(),
                bounds: node.bounds(),
                depth: node.depth(),
                indexInParent: node.indexInParent()
            };
        } catch(e) {
            return null;
        }
    },
    
    // 分析界面结构
    analyzeScreen: function() {
        var structure = [];
        try {
            // 使用 UiSelector 获取根节点
            var root = id("android:id/content").findOne(3000);
            if (root) {
                this.traverseNode(root, function(node) {
                    var info = UiHelper.getNodeInfo(node);
                    if (info && (info.text || info.desc)) {
                        structure.push(info);
                    }
                });
            }
        } catch(e) {
            Logger.error("分析界面结构时出错: " + e);
        }
        return structure;
    }
};

// 监听新消息
message.noticeMessage = function () {
    try {
        Logger.info("开始查找ding消息");
        
        // 1. 查找消息列表容器
        var messageContainer = id("x4a").findOne(5000);
        if (!messageContainer) {
            Logger.error("未找到消息列表容器");
            return null;
        }
        
        // 2. 直接查找包含ding文本的节点
        var dingNode = messageContainer.findOne(textContains("ding"));
        if (dingNode) {
            Logger.info("找到ding文本节点: " + dingNode.text());
            
            // 3. 获取可点击的父节点
            var clickableParent = dingNode;
            while (clickableParent && !clickableParent.clickable()) {
                clickableParent = clickableParent.parent();
            }
            
            if (clickableParent) {
                Logger.info("准备点击ding消息");
                clickableParent.click();
                Logger.info("成功点击ding消息");
                sleep(3000);
                
                return {
                    type: "message",
                    content: "ding",
                    messageId: dingNode.id() || "unknown"
                };
            } else {
                Logger.error("未找到可点击的父节点");
                return null;
            }
        }
        
        Logger.info("未找到ding消息");
        return null;
    } catch(e) {
        Logger.error("noticeMessage错误：" + e);
        return null;
    }
};

// 修改消息处理器
message.processMessage = function(msg) {
    if (!msg || !msg.content) {
        Logger.error("无效的消息内容");
        return false;
    }
    
    try {
        var content = msg.content.toLowerCase().trim();
        Logger.info("正在处理消息内容: " + content);
        
        // 检查是否是 ding 消息
        if (content === "ding") {
            Logger.info("收到 ding 消息，准备回复 dong");
            
            // 发送消息并验证结果
            var result = message.sendMessage("dong");
            if (result) {
                Logger.info("dong 消息发送成功");
                return true;
            } else {
                Logger.error("dong 消息发送失败");
                return false;
            }
        }
        
        return false;
    } catch(e) {
        Logger.error("处理消息错误: " + e);
        return false;
    }
};

// 添加事件管理器
var EventManager = {
    listeners: {},
    
    on: function(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },
    
    emit: function(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(function(callback) {
                try {
                    callback(data);
                } catch(e) {
                    Logger.error("事件处理错误: " + e);
                }
            });
        }
    },
    
    removeListener: function(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(function(cb) {
                return cb !== callback;
            });
        }
    }
};

// 修改消息监听线程
function startMessageListener() {
    threads.start(function() {
        Logger.info("启动消息监听线程");
        var retryCount = 0;
        var maxRetries = 5;
        var isClientConnected = false;
        
        // 监听客户端连接状态
        EventManager.on('clientConnected', function() {
            isClientConnected = true;
            Logger.info("客户端已连接，开始处理消息");
        });
        
        EventManager.on('clientDisconnected', function() {
            isClientConnected = false;
            Logger.info("客户端已断开，继续本地消息处理");
        });
        
        while(true) {
            try {
                var msg = message.noticeMessage();
                if (msg) {
                    Logger.info("收到新消息: " + JSON.stringify(msg));
                    var result = message.processMessage(msg);
                    Logger.info("消息处理结果: " + result);
                    
                    // 如果客户端已连接，发送处理结果
                    if (isClientConnected) {
                        sendMessageToClient({
                            type: "messageResult",
                            messageId: msg.messageId,
                            success: result,
                            timestamp: new Date().getTime()
                        });
                    }
                    
                    retryCount = 0;
                } else {
                    retryCount++;
                    if (retryCount > maxRetries) {
                        Logger.info("尝试刷新消息页面");
                        var msgTab = text("消息").findOne(2000);
                        if (msgTab) {
                            msgTab.click();
                            sleep(3000);
                        }
                        retryCount = 0;
                    }
                }
            } catch(e) {
                Logger.error("消息监听线程错误：" + e);
            }
            sleep(2000);
        }
    });
}

// 添加消息发送函数
function sendMessageToClient(message) {
    try {
        if (global.socket && !global.socket.isClosed()) {
            var printWriter = new PrintWriter(global.socket.getOutputStream());
            printWriter.println(JSON.stringify(message));
            printWriter.flush();
            Logger.debug("发送消息到客户端: " + JSON.stringify(message));
        }
    } catch(e) {
        Logger.error("发送消息到客户端失败: " + e);
    }
}

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

// 添加统一的日志处理
var Logger = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    
    level: 0, // 默认显示所有级别
    
    // 添加补零函数
    padZero: function(num) {
        return num < 10 ? '0' + num : num.toString();
    },
    
    // 添加补位函数
    padNumber: function(num, length) {
        var str = num.toString();
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    },
    
    format: function(level, message) {
        var now = new Date();
        var timeStr = this.padZero(now.getHours()) + ':' +
                     this.padZero(now.getMinutes()) + ':' +
                     this.padZero(now.getSeconds()) + '.' +
                     this.padNumber(now.getMilliseconds(), 3);
        return timeStr + '/' + level + ': ' + message;
    },
    
    debug: function(message) {
        if (this.level <= this.DEBUG) {
            var logMessage = this.format('D', message);
            console.log(logMessage);
            // 确保在AutoJS中显示
            if (typeof log !== 'undefined') {
                log(logMessage);
            }
        }
    },
    
    info: function(message) {
        if (this.level <= this.INFO) {
            var logMessage = this.format('I', message);
            console.info(logMessage);
            if (typeof log !== 'undefined') {
                log(logMessage);
            }
        }
    },
    
    warn: function(message) {
        if (this.level <= this.WARN) {
            var logMessage = this.format('W', message);
            console.warn(logMessage);
            if (typeof log !== 'undefined') {
                log(logMessage);
            }
        }
    },
    
    error: function(message) {
        if (this.level <= this.ERROR) {
            var logMessage = this.format('E', message);
            console.error(logMessage);
            if (typeof log !== 'undefined') {
                log(logMessage);
            }
        }
    }
};

// 修改主程序
function main() {
    auto.waitFor();
    console.show();
    
    if (!checkList.runAll()) {
        Logger.error("环境检查失败，请检查权限和应用安装情况");
        exit();
    }
    
    // 清理之前可能存在的脚本
    engines.all().forEach(function(engine) {
        if(engine.id !== engines.myEngine().id) {
            engine.forceStop();
            Logger.debug("停止脚本：" + engine.id);
        }
    });
    
    // 启动消息监听线程
    startMessageListener();
    Logger.info("消息监听线程已启动");
    
    var serversocket = null;
    try {
        var ports = [3000, 3001, 3002, 3003, 3004];
        var connected = false;
        
        for(var i = 0; i < ports.length; i++) {
            try {
                serversocket = new ServerSocket(ports[i]);
                Logger.info('服务端已启动在端口: ' + ports[i]);
                connected = true;
                break;
            } catch(e) {
                Logger.warn("端口 " + ports[i] + " 被占用，尝试下一个端口");
                continue;
            }
        }
        
        if(!connected) {
            throw new Error("所有端口都被占用，无法启动服务器");
        }
        
        Logger.info('等待客户端连接...');
        var socket = serversocket.accept();
        global.socket = socket; // 保存socket引用
        var clientIP = socket.getInetAddress().getHostAddress();
        Logger.info('客户端已连接，IP: ' + clientIP);
        
        // 触发客户端连接事件
        EventManager.emit('clientConnected');
        
        // 发送连接成功消息给客户端
        var printWriter = new PrintWriter(socket.getOutputStream());
        printWriter.println(JSON.stringify({
            status: "connected",
            message: "连接成功",
            serverIP: clientIP,
            timestamp: new Date().getTime()
        }));
        printWriter.flush();
        
        var inputStream = socket.getInputStream();
        var inputStreamReader = new InputStreamReader(inputStream);
        var bufferedReader = new BufferedReader(inputStreamReader);
        var outputStream = socket.getOutputStream();
        var printWriter = new PrintWriter(outputStream);
        
        while(true) {
            try {
                var temp = bufferedReader.readLine();
                if(temp != null) {
                    Logger.info("收到客户端消息：" + temp);
                    var response = handleMessage(temp);
                    Logger.info("发送响应：" + response);
                    printWriter.println(response);
                    printWriter.flush();
                }
                sleep(200);
            } catch(e) {
                Logger.error("处理消息时发生错误：" + e);
                break;
            }
        }
    } catch(e) {
        Logger.error("服务器错误：" + e);
    } finally {
        try {
            if (serversocket != null && !serversocket.isClosed()) {
                serversocket.close();
            }
            if (global.socket && !global.socket.isClosed()) {
                global.socket.close();
            }
            // 触发客户端断开事件
            EventManager.emit('clientDisconnected');
        } catch(e) {
            Logger.error("关闭服务器socket时出错：" + e);
        }
    }
}

// 修改退出处理
events.on('exit', function() {
    // 脚本退出时的清理工作
    Logger.info("脚本正在退出，清理资源...");
    try {
        if (global.socket && !global.socket.isClosed()) {
            global.socket.close();
        }
        // 触发客户端断开事件
        EventManager.emit('clientDisconnected');
    } catch(e) {
        Logger.error("退出时关闭socket出错：" + e);
    }
});

// 添加按键监听，按音量键停止脚本
events.observeKey();
events.onKeyDown("volume_down", function(event){
    toast("停止脚本");
    exit();
});

// 运行主程序
main();