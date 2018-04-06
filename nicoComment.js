exports.getviewer = function(thread) {
    return new Promise((resolve) => {
        var net = require('net');
        var viewer = net.connect(thread.port, thread.addr);
        viewer.on('connect', function() {
            viewer.setEncoding('utf-8');
            viewer.write('<thread thread="' + thread.thread + '" res_from="-5" version="20061206" />\0');
            resolve(viewer)
        });
    })
}
exports.getaleat = function() {
    return new Promise((resolve) => {
        var request = require('request');
        var cheerio = require('cheerio');
        var net = require('net');
        request({
            url: 'http://live.nicovideo.jp/api/getalertinfo',
        }, function(error, response) {
            if (error != null) throw error;
            // console.log(response.body)
            var $ = cheerio.load(response.body);
            var port = $('getalertstatus ms port').eq(0).text()
            var addr = $('getalertstatus ms addr').eq(0).text()
            var thread = $('getalertstatus ms thread').eq(0).text()
            var viewer = net.connect(port, addr);
            viewer.on('connect', function() {
                viewer.setEncoding('utf-8');
                viewer.write('<thread thread="' + thread + '" res_from="-1" version="20061206" />\0');
                resolve(viewer)
            })
        })
    })
}
exports.getliveInfo = function(session, live) {
    return new Promise((resolve) => {
        var request = require('request');
        var cheerio = require('cheerio');
        request({
            url: 'http://live.nicovideo.jp/api/getplayerstatus/' + live,
            headers: {
                Cookie: "user_session=" + session + ";",
            },
        }, function(error, response) {
            if (error != null) throw error;
            var $ = cheerio.load(response.body);
            resolve(response.body)
        })
    })
}
exports.fetchThread = function(session, live) {
    return new Promise((resolve) => {
        var request = require('request');
        var cheerio = require('cheerio');
        request({
            url: 'http://live.nicovideo.jp/api/getplayerstatus/' + live,
            headers: {
                Cookie: "user_session=" + session + ";",
            },
        }, function(error, response) {
            if (error != null) throw error;
            var $ = cheerio.load(response.body);
            var port = $('getplayerstatus ms port').eq(0).text()
            var addr = $('getplayerstatus ms addr').eq(0).text()
            var thread = $('getplayerstatus ms thread').eq(0).text()
            var title = $('title').text()
            resolve({port,addr,thread,title})
        });
    })
}