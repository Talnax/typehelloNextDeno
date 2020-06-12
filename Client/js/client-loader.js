/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator
 * file:    client-loader.js
 */


var thJQ = null;    // reference to the JQuery, version which service will use.

// ----------------------------------------------------------------- isDefine
function isDefine( param ) {

    if (typeof param !== "undefined" && param !== null) {
        return true;
    }

    return false;
}


// ----------------------------------------------------------------- isScriptAlreadyIncluded
function isScriptAlreadyIncluded(src){
    var scripts = document.getElementsByTagName("script");

    for(var i = 0; i < scripts.length; i++) {
        if( scripts[i].getAttribute('src') === src ) {
            return true;
        }
    }

    return false;
}


// ----------------------------------------------------------------- sendCallBack
function sendCallBack(callback) {
    if (typeof callback === 'function') {
        callback();
    }
}


// ----------------------------------------------------------------- load CSS file pure javascript
function loadCss( css_url, callback ) {
    var head = document.getElementsByTagName('head')[0];

    var link = document.createElement('link');
    //link.type = 'text/css';
    link.rel  = 'stylesheet';
    link.href = css_url;

    link.onload = function () {
        sendCallBack(callback);
    };

    head.appendChild(link);
}


// ----------------------------------------------------------------- load JavaScript file
function loadJS(js_url, callback ) {
    if (typeof js_url === "undefined" && js_url === null) {
        sendCallBack(callback);
    }

    if(isScriptAlreadyIncluded(js_url)) {
        sendCallBack(callback);
    }

    var scr = document.createElement('script');
    scr.type = "text/javascript";
    scr.async = true;
    scr.src = js_url;
    scr.addEventListener('load', function () {
        sendCallBack(callback);
    }, false);

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(scr);
}


// ----------------------------------------------------------------- load jQuery files
function loadJQuery( url, callback ) {

    loadJS(url, function() {
        thJQ = jQuery.noConflict();

        sendCallBack(callback);
    });
}


// ----------------------------------------------------------------- load jQueryUI files
function loadJQueryUI( url, callback ) {

    if ( typeof jQuery.ui == 'undefined') {
        loadJS(url, function() {
            sendCallBack(callback);
        });
    }
    else {
        // check version

        var pageVersion = parseInt(jQuery.ui.version.split('.').join(''));
        var newVersion  = parseInt(versionQJUI.split('.').join(''));

        if( pageVersion < newVersion ){
            loadJS(url, function() {
                sendCallBack(callback);
            });
        }
        else {
            sendCallBack(callback);
        }
    }
}


// ----------------------------------------------------------------- get list of hub files
function getHubFiles( hubClass ) {

    var min = '';
    if( pathServer.indexOf('localhost') === -1 ) {
        min = '.min';
    }

    var cssUrl      = pathServer + 'CLIENT/hubs/' + hubClass + '/' + hubClass + '.css';
    var jsUrl       = pathServer + 'CLIENT/hubs/' + hubClass + '/' + hubClass + min + '.js';
    //var jsUrlCtrl   = pathServer + 'CLIENT/hubs/' + hubClass + '/' + hubClass + '-controller.js';
    var hubHtml     = pathServer + 'CLIENT/hubs/' + hubClass + '/' + hubClass + '.html';

    var hubFiles = [];
    hubFiles.push(cssUrl);
    hubFiles.push(jsUrl);
    //hubFiles.push(jsUrlCtrl);
    hubFiles.push(hubHtml);

    return hubFiles;
}


// ----------------------------------------------------------------- load files of hub
function getHub(hubFiles, hubClass, callback ) {

    function addHubContent( data ) {
        var htmlContent = JSON.parse(data);

        if( Object.prototype.toString.call( htmlContent ) !== '[object Array]' ) {
            htmlContent = htmlContent.data;
        }

        var htmlTxt = '';
        for( var i = 0; i < htmlContent.length; i++ ) {
            htmlTxt += String.fromCharCode(htmlContent[i]);
        }

        var html =  thJQ.parseHTML( htmlTxt );

        return html[0];
    }

    // load css file of hub

    if( !hubFiles[0] ) {
        return callback( null );
    }

    loadCss(hubFiles[0], function() {

        // load html file of hub

        if( !hubClass && !hubFiles[2] ) {
            return callback( null );
        }

        thJQ.ajax({
            url:            hubFiles[2],
            contentType:    'application/json',
            data:           {},
            dataType:       "jsonp",
            success:        function (data, textStatus, jqXHR) {

                var hubContent = addHubContent(data);

                if(hubContent !== null) {

                    // load javascript file of hub

                    if( !hubFiles[1] ) return;

                    loadJS(hubFiles[1], function() {
                        sendCallBack(callback(hubContent));
                    });
                }
            },
            error:          function (jqXHR, textStatus, errorThrown) {
                console.log( 'ERROR[hubLoadHtml]: ' + errorThrown );
                sendCallBack(callback(null));
            }
        });
    });
}


// ----------------------------------------------------------------- parse html content
/*
function parseHtmlContent( data, callback ) {
    var htmlContent = JSON.parse(data);

    var buffer = [];

    if( Object.prototype.toString.call( htmlContent ) !== '[object Array]' ) {
        htmlContent = htmlContent.data;
    }

    var htmlTxt = '';
    for( var i = 0; i < htmlContent.length; i++ ) {
        htmlTxt += String.fromCharCode(htmlContent[i]);
    }

    var html = thJQ.parseHTML( htmlTxt );

    sendCallBack(callback(html[0]));
}
*/

function parseHtmlContent( data, callback ) {

    var htmlContent = JSON.parse(data);

    if( Object.prototype.toString.call( htmlContent ) !== '[object Array]' ) {
        htmlContent = htmlContent.data;
    }

    var htmlTxt = '';
    for ( var item in htmlContent)  {
        if( htmlContent.hasOwnProperty(item)) {
            htmlTxt += String.fromCharCode(htmlContent[item]);
        }
    }

    var html =  thJQ.parseHTML( htmlTxt );

    for ( var key in html)  {
        if( html.hasOwnProperty(key)) {
            var valueTag = html[key].tagName;
            if( !isDefine(valueTag)) {
                html.splice(key, 1);
            }
        }
    }

    sendCallBack(callback(html));
}

// ----------------------------------------------------------------- load html
function loadHtml( htmlFile, parserRoutine, callback ) {

    thJQ.ajax({
        url:            htmlFile,
        contentType:    'application/json',
        data:           {},
        dataType:       "jsonp",
        success:
            function (data, textStatus, jqXHR) {
                parserRoutine( data, function( htmlContent ) {
                    thJQ('.th-node').append(htmlContent);
                    sendCallBack(callback('ok'));
                });
            },
        error:
            function (jqXHR, textStatus, errorThrown) {
                console.log( 'ERROR[loadHtml]: ' + errorThrown );
                sendCallBack(callback('fail'));
            }
    });
}


// ----------------------------------------------------------------- init hub
function loadHub( hubClass, callback ) {

    var res = 'ok';

    // check is this hub in DOM

    var _hub = thJQ('.th-node' + ' .' + hubClass );

    if( !isDefine( _hub[0])) {

        // get all files belong to this hub

        var hubFiles = getHubFiles( hubClass );

        // load hub

        getHub(hubFiles, hubClass, function( hub ) {
            if( hub ) {
                thJQ('.th-node').append(hub);
            }
            else {
                res = 'false';
            }

            sendCallBack(callback(res));

        });
    }
    else {
        sendCallBack(callback(res));
    }
}


// ----------------------------------------------------------------- show info what source of service loaded
function progressLoadText( _text ) {
    var divTxt = document.getElementsByClassName('th-loader-txt')[0];
    if( divTxt ) {
        divTxt.innerHTML = '';
        divTxt.innerHTML = _text;
    }
}


// ----------------------------------------------------------------- hide progress ctls after download service complete
function hideProgressCtrl() {
    thJQ('.th-loader-logo').css( 'display', 'none');
    thJQ('.th-loader-img').css( 'display', 'none');
    thJQ('.th-loader-panel').css( 'display', 'none');
    thJQ('.th-loader-txt').css( 'display', 'none');
}


// ----------------------------------------------------------------- init thService
function initTH() {

    // create main-th-div

    var thDiv = document.createElement("div");
    thDiv.className = 'th-node';
    document.body.appendChild(thDiv);

    // add template file

    var mainTMPL  = pathServer + 'CLIENT/html/templates.html';
    loadHtml( mainTMPL, parseHtmlContent, function( res ) {
        if( res === 'ok' ) {
            // init first 'login-hub'

            loadHub( 'login-hub', function(res) {
                if( res === 'ok' ) {

                    if( !hubLogIn ) {
                        hubLogIn    = new th.next.LoginHub();
                    }

                    hideProgressCtrl();

                    hubLogIn.hubShow( true );
                }
            });
        }
    });
}


// ----------------------------------------------------------------- load array of javascript files
function loadArrayJS( listUrls, index, callback ) {

    loadJS( listUrls[index], function() {

        ++index;

        if( index > listUrls.length - 1 ) {
            sendCallBack(callback);
        }
        else {
            loadArrayJS( listUrls, index, callback );
        }
    });
}


// ----------------------------------------------------------------- loader Panel with progress bar

function loaderPanel() {

    var pY, wW, i, s, wH, l;

    pY = (window.pageYOffset !== 'undefined') ? window.pageYOffset : (document.body).scrollTop;
    wW = window.innerWidth;
    wH = window.innerHeight;

    var d  = document.createElement('div');
    d.className = 'th-loader-panel';
    d.setAttribute('style', 'background:rgba(0,0,0,0.6);z-index:9999;height:' + wH + 'px;width:' + wW + 'px;left:0px;top:' + pY + 'px;position:absolute;');
    document.body.appendChild(d);

    l = document.createElement('img');
    l.className = 'th-loader-logo';
    //i.src = 'http://50.97.232.170:1337/' + pathClient + 'img/ajax-loader.gif';
    l.src = pathServer + pathClient + 'img/th-logo-48.png';
    l.setAttribute('style', 'z-index:9999;left:' + (wW/2 - 6) + 'px;top:' + parseInt(pY+wH/2-80) + 'px;position:absolute;width:36px');
    document.body.appendChild(l);

    i = document.createElement('img');
    i.className = 'th-loader-img';
    //i.src = 'http://50.97.232.170:1337/' + pathClient + 'img/ajax-loader.gif';
    i.src = pathServer + pathClient + 'img/ajax-loader.gif';
    i.setAttribute('style', 'z-index:9999;left:' + wW/2 + 'px;top:' + parseInt(pY+wH/2) + 'px;position:absolute;width:27px');
    document.body.appendChild(i);

    var t  = document.createElement('div');
    t.className = 'th-loader-txt';
    t.innerHTML = "Load service styles ...";
    t.setAttribute('style', 'color:#F0F0F0;font-size:15px;z-index:9999;left:' + parseInt(wW/2-69) + 'px;top:' + parseInt(pY+wH/2-36) + 'px;position:absolute;width:45px;width:210px;');
    document.body.appendChild(t);
}

// ----------------------------------------------------------------- Entry point of thService
function thMain() {

    loaderPanel(); // launch progress bar

    var mainCSS  = pathServer + "CLIENT/css/general.css";
    var glyphCSS = pathServer + "CLIENT/css/glyphs.css";

    //var jqUrl    = "http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js";
    var jqUrl    = pathServer + "CLIENT/lib/jquery-1.10.2.js";

    var jqUIUrl   = pathServer + "CLIENT/lib/jquery-ui-1.10.3.custom.min.js";
    //var jqUIUrl  = "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js";

    var min = '.min';
    if( pathServer.indexOf('localhost') !== -1 ) {
        min = '';
    }

    var listUrls = [
        pathServer + 'socket.io/socket.io.js',
        pathServer + 'CLIENT/js/client-common'      + min + '.js',
        pathServer + 'CLIENT/js/common-hub'         + min + '.js',
        pathServer + 'CLIENT/js/controller-settings'+ min + '.js',
        pathServer + 'SHARE/user-definition'        + min + '.js',
        pathServer + 'SHARE/socket-events'          + min + '.js'
    ];

    // load common css and js files

    loadCss(mainCSS, function() {                           // general.css
        loadCss(glyphCSS, function() {                      // glyphs.css

            progressLoadText('Load service library ...');

            loadJQuery( jqUrl, function() {                 // jquery.min.js
                loadJQueryUI( jqUIUrl, function() {         // jquery-ui-1.10.3.custom.min.js

                    progressLoadText('Load service modules ...');

                    loadArrayJS( listUrls, 0, function() {  // general js files
                        initTH();                           // start service login-hub.js
                    });
                });
            });
        });
    });
}

var pathClient  = 'CLIENT/';
//var pathServer  = 'http://52.53.223.73:1337/';    // remote
var pathServer  = 'http://localhost:1337/';         // local

//var versionQJ   = '1.10.2';
var versionQJUI = '1.10.2';




