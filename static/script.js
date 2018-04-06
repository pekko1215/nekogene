window.jQuery = window.$ = require('./jquery-3.3.1.min.js');
const prompt = require('electron-prompt');
// Electron
const {
    remote,
    ipcRenderer
} = require('electron');
const {
    app,
    Menu,
    BrowserWindow
} = remote;
var handleNames = localStorage.getItem('handleNames')||{};

var nanasiindex = 0;

function saveHandleNames(){
    localStorage.setItem('handleNames',JSON.stringify(handleNames))
}

function appendComment({
    text,
    name
}) {
    var $comment = $('<div class="comment"/>');
    var $nameWrap = $('<div class="name-wrap"/>');
    var $name = $('<div class="name"/>');
    var $textWrap = $('<div class="text-wrap"/>');
    var $text = $('<div class="text"/>');
    $name.text(name);
    $text.text(text);
    $comment.append($nameWrap);
    $nameWrap.append($name);
    $comment.append($textWrap);
    $textWrap.append($text);
    $(document.body).prepend($comment)
    $comment.css({
        transform: 'scale(0)',
        opacity: 0
    })
    $comment.animate({
        opacity: 1
    }, {
        duration: "fast",
        step: function(now) {
            $(this).css({
                transform: `scale(${now})`
            })
        }
    })
}
Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: "接続",
    click() {
        prompt({
            title: '放送URLの入力',
            label: 'URL:',
            value: '',
            inputAttrs: { // attrs to be set if using 'input'
                type: 'url'
            },
            type: 'input' // 'select' or 'input, defaults to 'input'
        }).then((r) => {
            console.log(r)
            var lv = r.match(/(co|lv)\d+/);
            if (lv != null) {
                liveid = lv[0];
                ipcRenderer.send('setlive', lv[0])
                nanasiindex = 1;
            }
            console.log(lv)
        }).catch(console.error);
    }
}, {
    label: "開発者ツール",
    click() {
        remote.getCurrentWindow().toggleDevTools();
    }
}]))
ipcRenderer.on('title', function(event, message) {
    $('.comment').remove()
})
ipcRenderer.on('message', function(event, message) {
    var $message = $(message).filter('chat');
    if($message.length>1){
        var arg = arguments.callee;
        $message.each(function(){
            arg(event,$(this));
        })
        return
    }
    console.log(message)
    var userId = $message.attr('user_id');
    var text = $(message).text();
    var name = null;
    if (/(＠|@|by)/.test(text)) {
        var name = text.split(text.match(/(＠|@|by)/g).slice(-1)[0]).slice(-1)[0];
        handleNames[userId] = name;
        appendComment({text,name})
        return;
    }
    if (userId in handleNames) {
        name = handleNames[userId];
        saveHandleNames();
        appendComment({text,name})
    } else {
        if (!isNaN(userId)) {
            //生IDが取得できる場合
            $.get(`http://seiga.nicovideo.jp/api/user/info?id=${userId}`, (data) => {
                name = ($(data).find('nickname').text());
                handleNames[userId] = name;
                saveHandleNames();
                appendComment({text,name})
            })
        } else {
            name = `野良ナース${nanasiindex++}`;
            handleNames[userId] = name;
            saveHandleNames();
            appendComment({text,name})
            //184ついてる場合
        }
    }
})