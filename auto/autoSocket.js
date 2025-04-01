console.show();

importClass('java.io.BufferedReader');
importClass('java.io.IOException');
importClass('java.io.InputStream');
importClass('java.io.InputStreamReader');
importClass('java.io.OutputStream');
importClass('java.io.PrintWriter');
importClass('java.net.Socket');
importClass('java.net.ServerSocket');

const message = require('./message');

// 消息处理函数
function handleMessage(messageStr) {
    try {
        const data = JSON.parse(messageStr);
        log("解析消息：" + JSON.stringify(data));
        
        switch(data.type) {
            case "login":
                return handleLogin();
            case "send_message":
                return handleSendMessage(data.content);
            case "search_user":
                return handleSearchUser(data.username);
            case "add_user":
                return handleAddUser();
            case "get_contacts":
                return handleGetContacts();
            case "get_messages":
                return handleGetMessages();
            case "auto_reply":
                return handleAutoReply(data.replyText);
            default:
                return "unknown_command";
        }
    } catch(e) {
        log("消息处理错误：" + e);
        return "error";
    }
}

// 处理登录
function handleLogin() {
    log("处理登录请求");
    try {
        // 打开抖音
        launch("com.ss.android.ugc.aweme");
        sleep(3000);
        
        // 进入消息页面
        message.goToMessagePage();
        
        // 发送登录成功响应
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
            message: "登录失败"
        });
    }
}

// 处理发送消息
function handleSendMessage(content) {
    log("处理发送消息：" + content);
    // 找到输入框并输入消息
    text("发送消息…").findOne().setText(content);
    sleep(1000);
    // 点击发送按钮
    click(665,1241);
    sleep(1000);
    return "message_sent";
}

// 处理获取联系人列表
function handleGetContacts() {
    log("处理获取联系人列表");
    // 获取联系人列表的逻辑
    return "contacts_list";
}

// 处理获取消息列表
function handleGetMessages() {
    log("处理获取消息列表");
    // 获取消息列表的逻辑
    return "messages_list";
}

// 主程序
var serversocket = new ServerSocket(3000);
log('服务端已经启动,正在等待客户端连接...');
var socket = serversocket.accept();
log('客户端已连接')

var inputStream = socket.getInputStream();
var inputStreamReader = new InputStreamReader(inputStream);
var bufferedReader = new BufferedReader(inputStreamReader);
var outputStream = socket.getOutputStream();
var printWriter = new PrintWriter(outputStream);

var temp = null;
var info = "";

while(true){
    try {
        temp = bufferedReader.readLine();
        if(temp != null) {
            info = temp;
            log("收到客户端信息：" + info);
            
            // 处理消息并获取响应
            const response = handleMessage(info);
            log("发送响应：" + response);
            
            // 发送响应给客户端
            printWriter.print(response);
            printWriter.flush();
        }
        sleep(200);
    } catch(e) {
        log("发生错误：" + e);
        break;
    }
}

// 保持连接开放，不要关闭
// 只有在发生错误时才退出循环