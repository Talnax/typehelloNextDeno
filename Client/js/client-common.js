/*
 * Author:  Rost Shevtsov ( Herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    client-common.js
 */


// ----------------------------------------------------------------------------- Global values definition

var Socket      = null;
var User        = null;
var USERs       = {};
var aChannel    = null;
var zIndex      = 0;
var MSG_LENGTH  = 360;
var isNewUser   = false;

var hubOpening  = 0;

var yStart      = 9;
var xStart      = 9;

var yPosition   = yStart;
var xPosition   = xStart;

var yDelta      = 36;
var xDelta      = 33;

var hubCenter   = null;

var hubLogIn    = null;

var hubTalk     = null;
var ctrlTalk    = null;

var hubProfile  = null;
var ctrlProfile = null;

var hubIgnore   = null;
var ctrlIgnore  = null;

var hubPerson   = null;
var ctrlPerson  = null;

var hubSms      = null;
var ctrlSms     = null;

var hubSearch   = null;
var ctrlSearch  = null;

var hubWall     = null;
var ctrlWall    = null;

var hubComment  = null;
var ctrlComment = null;

var hubPin      = null;
var ctrlPin     = null;

var hubNews     = null;
var ctrlNews    = null;

var hubNote     = null;
var ctrlNote    = null;

var hubNotice   = null;
var ctrlNotice  = null;

var hubHtmlAnalysis   = null;
var ctrlHtmlAnalysis  = null;

var hubTextAnalysis   = null;
var ctrlTextAnalysis  = null;

var hubCenter           = null;
var hubCenterController = null;

var ctrlSettings = null;

var monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var userId = {
    id:   null,
    nick: null,
    pwd:  null
};

var storageNick  = 'th-nick';
var storagePswd  = 'th-pswd';

// ---------------------------------------------------------------------------- initSocketIO
function initSocketIO () {
    try {
        Socket = io.connect(pathServer);
        socketRouter();
    }
    catch( err) {
        console.log( 'FAIL[client-socket-router.initSocketIO()]: ', err.message );
    }
}

// ---------------------------------------------------------------------------- socketRouter
function socketRouter () {
    try {
        if(Socket === null)
            return;

        Socket.on( socketEvents.connect, function() {
            console.log('Connect to socket-service of TypeHello');
        });

        Socket.on( socketEvents.disconnect, function() {
            console.log('Disconnect from socket-service of TypeHello');
        });

        Socket.on( socketEvents.socket_login_completed, function (msg) {
            if( !hubLogIn ) return;
            hubLogIn.socketLogin_Completed(msg, Socket);
        });

        Socket.on( socketEvents.socket_open_chat_completed, function (msg) {
            if( !hubTalk ) return;
            hubTalk.socketOpenChat_Completed( msg, Socket );
        });

        Socket.on( socketEvents.socket_msg_chat_completed, function (msg) {
            if( !hubTalk ) return;
            hubTalk.socketMessageChat_Completed( msg, Socket );
        });

        Socket.on( socketEvents.socket_sms_notification_completed, function (msg) {
            var show_sms = false;

            if( msg.receiver.id !== msg.sender.id && msg.sender.id !== getUser().id ) {
                show_sms = true;
            }

            if( hubSms ) {
                if( show_sms ) {
                    hubSms.hubShow( true );
                }
                hubSms.socketSms_Notification_Completed( msg, Socket );
            }
            else {
                if( show_sms ) {
                    alert("You receive new SMS :)");

                    loadHub( 'sms-hub', function(res) {
                        if( res === 'ok' ) {
                            hubSms = new th.next.SmsHub();
                            //hubSms.readAllUsers(true, function(res) {
                                hubSms.hubShow(true);
                                hubSms.socketSms_Notification_Completed( msg, Socket );
                            //});
                        }
                    });
                }
            }
        });

        Socket.on( socketEvents.socket_person_notification_completed, function (msg) {
            if( !hubPerson ) {
                loadHub( 'person-hub', function(res) {
                    if( res === 'ok' ) {
                        hubPerson = new th.next.PersonHub();
                        hubPerson.personNotificationCompleted(msg);
                    }
                });
            }
            else {
                hubPerson.personNotificationCompleted(msg);
            }
        });

//        Socket.on( socketEvents.socket_message, function (msg) {
//            if( !hubTalk ) return;
//            hubTalk.socketMessage( msg, Socket );
//        });
    }
    catch( err) {
        console.log( 'ERROR[client-socket-router.socketRouter()]: ', err.message );
    }
}

// ----------------------------------------------------------------------------- Channels functions

function setActiveChannel (argument) {
    aChannel = argument;
}

function getActiveChannel () {
    return aChannel;
}

function buildChannel( user_from, user_to ) {

    var _combine = user_from + user_to;

    var _channel = [];

    for( var i = 0; i < _combine.length; i++ ) {
        _channel.push(_combine[i]);
    }

    _channel.sort();

    var _combine_channel = '';

    for( var j = 0; j < _channel.length; j++ ) {
        _combine_channel += _channel[j];
    }

    return _combine_channel;
}

// ----------------------------------------------------------------------------- Users functions

function setUser (argument) {
    User = argument;
}

function getUser () {
    return User;
}

function getUserId( user ) {
    var tmp = cloneObject(user);
    var userId = {
        id:     tmp.id,
        nick:   tmp.nick,
        gender: tmp.gender,
        pic:    tmp.pic
    };
    return userId;
}

function getStrUserShortProfile ( user ) {
    var shortProfile;

    shortProfile =  user.nick
        + ', ' + user.country
        + ', ' + user.language
        + ', ' + user.gender;
        //+ ', ' + cutUserBirth(user.birth);

    return shortProfile;
}

function cutUserBirth(_birth) {
    try {

        if( !isDefine(_birth) || _birth === '' )
            return '';

        var bs = _birth.split('-');

        var month = monthName[parseInt(bs[0]) - 1];

        return bs[1] + " " + month;
    }
    catch(err) {
        console.log('ERROR(LoginHub.onBtnSignUp_Click())' + err );
        return '';
    }
}

function getShortProfile( user ) {
    var tmp = cloneObject(user);
    var userProfile = {
        id:         tmp.id,
        nick:       tmp.nick,
        country:    tmp.country,
        language:   tmp.language,
        gender:     tmp.gender,
        birth:      tmp.birth,
        mail:       tmp.mail
    };
    return userProfile;
}

function getUserProfile( user ) {
    var tmp = cloneObject(user);
    var userProfile = {
        id:         tmp.id,
        nick:       tmp.nick,
        country:    tmp.country,
        language:   tmp.language,
        gender:     tmp.gender,
        birth:      tmp.birth,
        date:       tmp.date,
        pic:        tmp.pic,
        socket_id:  tmp.socket_id
    };
    return userProfile;
}

// ----------------------------------------------------------------------------- Position

function raiseToHighestZIndex(elem) {
   if( zIndex !== 0 ) {
      zIndex = parseInt( zIndex + 1 );
      thJQ(elem).css("z-index", zIndex );
      //console.log("z-index[ zIndex !== 0 ]", zIndex );
   }
   else {

      thJQ("*").each(function() {

         var tagName = thJQ(this).tagName;

         if (!thJQ(this).is( "iframe" )) {

            var cur_zindex = thJQ(this).css("z-index");

            if( cur_zindex !== 'auto') {

               cur_zindex = parseInt(cur_zindex);

               if( cur_zindex === 2147483647 ) {
                  return;
               }

               if (cur_zindex > zIndex) {

                  zIndex = parseInt( cur_zindex + 1 );

                  thJQ(elem).css("z-index", zIndex);

                  //console.log("z-index( zIndex === 0 )", zIndex );
               }
            }
         }
      });
   }
}

function setCursor(el, st, end) {
    if (el.setSelectionRange) {
        //el.focus();
        el.setSelectionRange(st, end);
        el.focus(st);
    } else {
        if (el.createTextRange) {
            var range = el.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', st);
            range.select();
        }
    }
}

//http://jsfiddle.net/hYuzk/3/
function getCaret(el) {
    if (el.selectionStart) {
        return {
            posStart: el.selectionStart,
            posEnd: el.selectionEnd
        }
    }
}

// ----------------------------------------------------------------------------- Ajax calls

//http://habrahabr.ru/post/17640/
function ajaxCall( url, data, success_call, error_call ) {
    try {
        if( success_call === "undefined" || success_call === null ||
            error_call   === "undefined" || error_call   === null) {
            return;
        }

        thJQ.ajax({
            url:            url,
            contentType:    'application/json',
            scriptCharset:  "utf-8",
            data:           data,
            dataType:       "jsonp",
            success:        success_call,
            error:          error_call
        });
    }
    catch(err) {
        console.log('ERROR(client-common.ajaxCall())' + err );
    }
}

function ajaxPostFileCall( url, data, success_call, error_call ) {
    try {
        if( success_call === "undefined" || success_call === null ||
            error_call   === "undefined" || error_call   === null) {
            return;
        }

        thJQ.ajax({
            url:            url,
            data:           data,
            type:           'POST',
            /*
            //encoding:       'utf-8',
            //contentType:    false,
            //processData:    false,
            //dataType:       'JSON',
//            data: {
//                imgBase64: data
//            },
            //dataType:       "jsonp",
            */
            success:        success_call,
            error:          error_call
        });
    }
    catch(err) {
        console.log('ERROR(client-common.ajaxPostFileCall())' + err );
    }
}

// ----------------------------------------------------------------------------- Global function for client side

function getFileAsDataURL( pathFile, callback ) {
    try {
        var dataUrl = null;

        var reader = new FileReader();

        reader.onload = function(data) {
            dataUrl = data.target.result;
            sendCallBack(callback(dataUrl));
        };

        reader.readAsDataURL(pathFile);
    }
    catch(err) {
        console.log('ERROR(common-client.getFileAsDataURL()): ' + err);
    }
}

function getImageDataURL(url, success, error) {

    var data, canvas, ctx;

    var img = new Image();

    img.onload = function() {

        // Create the canvas element.

        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        // Get '2d' context and draw the image.
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Get canvas data URL

        try{
            data = canvas.toDataURL();

            success({
                image: img,
                data:  data
            });

        }
        catch(e) {
            error( e );
        }
    }

    // Load image URL.

    try {
        img.src = url;
    }
    catch(e) {
        error(e);
    }
}

function GUID() {
    var S4;

    S4 = function() {
        return Math.floor(Math.random() * 0x1000);
    };

    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function removeLineBreaks( _text ) {
/*
    http://xhtml.ru/2006/05/25/encodestring/
    http://habrahabr.ru/post/17640/
    escape('`<>!@#$%^&*(){}[]=:/;?+\'"'):
    str.replace(/[`'"~!@#$%^&*()_|+\-=?;:,.<>\{\}\[\]\\\/]/gi, '');w
    return _text.trim();
*/
    _text = _text.replace(/"/g,"`");
    _text = _text.replace(/'/g,"`");
    _text = _text.replace(/\t/g, ' ');
    _text = _text.replace(/[%\\]/gi, '');
    _text = _text.replace(/(\r\n|\n|\r)/gm, " " );

    return _text;
}

function encodeLineBreaksNew( _text ) {
    try {

        if( !isDefine( _text))
            return;

        _text = _text.replace( /"/g,        '``');
        _text = _text.replace( /'/g,        '`');
        _text = _text.replace( /[%\\]/gi,   '');

        _text = _text.replace( /\t/g,       '```t');
        _text = _text.replace( /\n/g,       '```n');
        _text = _text.replace( /\r/g,       '```r');
        _text = _text.replace( /(\r\n)/gm,  '```r```n' );

        return _text;
    }
    catch(err) {
        console.log('ERROR(client-common.replaceLineBreaks())' + err );
        return null;
    }
}

function encodeLineBreaks( _text ) {
   try {

      if( !isDefine( _text))
         return;

      _text = _text.replace( /"/g,        '`');   // may be '``\'
      _text = _text.replace( /'/g,        '`');   // may be '`\'
      _text = _text.replace( /[%\\]/gi,   '');

      _text = _text.replace( /\t/g,       '```t');
      _text = _text.replace( /\n/g,       '```n');
      _text = _text.replace( /\r/g,       '```r');
      _text = _text.replace( /(\r\n)/gm,  '```r```n' );

      //_text = _text.replace(/(\r\n|\n|\r)/gm, " " );

      return _text;
   }
   catch(err) {
      console.log('ERROR(client-common.replaceLineBreaks())' + err );
      return null;
   }
}
/*
function escape (key, val) {
    if (typeof(val)!="string") return val;
    return val
        .replace(/[\"]/g, '\\"')
        .replace(/[\\]/g, '\\\\')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t')
        ;
}

var myJSONString = JSON.stringify(myJSON,escape);
*/

// http://stackoverflow.com/questions/6331895/how-to-replace-n-with-br-in-javascript
// http://stackoverflow.com/questions/4253367/how-to-escape-a-json-string-containing-newline-characters-using-javascript
function decodeLineBreaksNew( _text ) {
    try {

        if( !isDefine( _text))
            return;

        _text = _text.replace( /``/g,       '"' );
        _text = _text.replace( /`/g,        "'" );
        _text = _text.replace( /```t/g,     "\t" );
        _text = _text.replace( /```n/g,     "\n" );
        _text = _text.replace( /```r/g,     "\r" );
        _text = _text.replace( /```r```n/g, "\r\n"  );

        //_text = _text.replace(/(\r\n|\n|\r)/gm, " " );

        return _text;
    }
    catch(err) {
        console.log('ERROR(client-common.decodeLineBreaks())' + err );
        return null;
    }

}

function decodeLineBreaks( _text ) {
   try {

      if( !isDefine( _text))
         return;

      _text = _text.replace( /```t/g,     "\t" );
      _text = _text.replace( /```n/g,     "\n" );
      _text = _text.replace( /```r/g,     "\r" );
      _text = _text.replace( /```r```n/g, "\r\n"  );

      //_text = _text.replace(/(\r\n|\n|\r)/gm, " " );

      return _text;
   }
   catch(err) {
      console.log('ERROR(client-common.replaceLineBreaks())' + err );
      return null;
   }

}

function isJsonData( data ) {
    try {
        JSON.parse(data);
    } catch (err) {
        console.log('ERROR(client-common.isJsonData())' + err );
        return false;
    }
    return true;
}

function getCurrentDate() {
    var currentDate = new Date();

    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();

    var my_date = month + "-" + day + "-" + year;
    return my_date;
}

function cloneObject(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj)
        temp[key] = this.cloneObject(obj[key]);

    return temp;
}

function disableElements(el) {
    for (var i = 0; i < el.length; i++) {
        el[i].disabled = true;

        disableElements(el[i].children);
    }
}

function enableElements(el) {
    for (var i = 0; i < el.length; i++) {
        el[i].disabled = false;

        enableElements(el[i].children);
    }
}

function getUserPerDataTemplate( classDataTemplate, e ) {
    try {
        var user = null;

        var parent = e.target;

        while( parent ) {
            var index = parent.className.indexOf( classDataTemplate );

            if( index > -1 ) {
                //var jsnUser = $(parent).find('.template-data span').text();
                var jsnUser = thJQ(parent).find('.template-data span').text();

                if( jsnUser ) {
                    user = {};
                    user = JSON.parse(jsnUser);
                }

                break;
            }

            parent = parent.parentNode;
        }

        return user;
    }
    catch(err) {
        console.log('ERROR(getUserPerDataTemplate()): ' + err );
        return null;
    }
}

function readLocalStorageValues( key ) {

    if( window.localStorage ) {
        return window.localStorage[key];
    }

    return null;
}

function saveLocalStorageValues( key, value ) {
    if( window.localStorage ) {
        window.localStorage[key] = value;
    }
}

function getAge(birth) {

    var today = new Date();
    var nowyear = today.getFullYear();
    var nowmonth = today.getMonth();
    var nowday = today.getDate();

    var birthyear = birth.getFullYear();
    var birthmonth = birth.getMonth();
    var birthday = birth.getDate();

    var age = nowyear - birthyear;
    var age_month = nowmonth - birthmonth;
    var age_day = nowday - birthday;

    if(age_month < 0 || ( age_month === 0 && age_day < 0 )) {
        age = parseInt(age) -1;
    }
//    if (( age === 13 && age_month <= 0 && age_day <= 0) || age < 18) {
//    }
//    else {
//        alert("You have crossed your 18th birthday !");
//    }
    return age;
}

function isEmailCorrect(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getMetaContent(propName) {

    // we need to find some description on the page: class, id or meta

    try {
        var metas = document.getElementsByTagName('meta');

        for (i = 0; i < metas.length; i++) {
            if (metas[i].getAttribute("name") == propName) {
                return metas[i].getAttribute("content");
            }
        }

        return "";
    }
    catch(err) {
        console.log('ERROR(getMetaContent())' + err );
        return "";
    }
}

function getFaviconPage() {

    // http://stackoverflow.com/questions/10282939/how-to-get-favicons-url-from-a-generic-webpage-in-javascript

    try {
        var favicon = "";
        var links = document.getElementsByTagName('link');
        for(var i=0; i<links.length; i++) {
            var link = links[i];
            var rel = '"' + link.getAttribute("rel") + '"';
            var regexp = /(\"icon )|( icon\")|(\"icon\")|( icon )/i;
            if(rel.search(regexp) != -1) {
                favicon = link.getAttribute("href");
            }
        }
        return favicon;
    }
    catch(err) {
        console.log('ERROR(getFavIcon())' + err );
        return "";
    }
}

function getDomain() {
    try {
        var domain = window.location.hostname;

        if( domain === '' ) {
            domain = window.location.host;
        }

        if( domain === '' ) {
            domain = document.domain;
        }

        return domain;
    }
    catch(err) {
        console.log('ERROR(getDomain())' + err );
        return "";
    }
}

function isURL(str) {
   // http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
   var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
   return pattern.test(str);
}

// ----------------------------------------------------------------------------- Cookie

function setCookie(key, value, exdays) {
    var d = new Date();
    d.setTime( d.getTime() + ( exdays * 24*60*60*1000 ));
    var expires = "expires=" + d.toGMTString();
    //document.cookie = key + "=" + value + "; " + expires;
    document.cookie = key + "=" + value + ";domain=" + getDomain() + ";path=/;" + expires;
}

function getCookie(key) {
    var name = key + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) === 0 ) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function delCookie(key, value) {
    document.cookie = key + "=" + value + ";domain=" + getDomain() + ";path=/;" + "15-Sep-1996 05:00:00 GMT";
}

// ----------------------------------------------------------------------------- Mail

function sendMail(
    _user_from,
    _user_to,
    _mail_subject,
    _mail_message,
    _notification_type,
    _content_type,
    _callback ) {
    try {

        if(!isDefine( _user_from ))     return;
        if(!isDefine( _user_to ))       return;
        if(!isDefine( _mail_subject ))  return;
        if(!isDefine( _mail_message ))  return;
        if(!isDefine( _content_type ))  return;

        var req = 'send-mail-to-user';
        if( _content_type !== mailNotificationType.undefine ) {
            req = 'send-notify-mail';
        }
        var request = {
             user_from:          _user_from
            ,  user_to:          _user_to
            , mail_subject:      _mail_subject
            , mail_message:      _mail_message
            , notification_type: _notification_type // sms or wall or ...
            , content_type:     _content_type       // html or text
        };

        var ajaxData = JSON.stringify(request);

        ajaxCall(
            pathServer + req,
            req + '=' + ajaxData,
            function success_call( data, textStatus, jqXHR ) {},
            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log( "ERROR[ajaxCall.sendMail]: " + textStatus );
            }
        );

        sendCallBack( _callback );
    }
    catch(err) {
        console.log('ERROR(sendMail())' + err );
    }
}

function sendMailToUsersID(
    _user_from,
    _user_ids,
    _mail_subject,
    _mail_message,
    _notification_type,
    _content_type,
    _callback ) {
    try {

        if(!isDefine( _user_from ))     return;
        if(!isDefine( _user_ids ))       return;
        if(!isDefine( _mail_subject ))  return;
        if(!isDefine( _mail_message ))  return;
        if(!isDefine( _content_type ))  return;

        var req = 'send-notify-mail-users-id';

        var request = {
            user_from:           _user_from
            ,  user_ids:         _user_ids          // this is [array]
            , mail_subject:      _mail_subject
            , mail_message:      _mail_message
            , notification_type: _notification_type // sms or wall or ...
            , content_type:     _content_type       // html or text
        };

        var ajaxData = JSON.stringify(request);

        ajaxCall(
            pathServer + req,
            req + '=' + ajaxData,
            function success_call( data, textStatus, jqXHR ) {},
            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log( "ERROR[ajaxCall.sendMail]: " + textStatus );
            }
        );

        sendCallBack( _callback );
    }
    catch(err) {
        console.log('ERROR(sendMail(send-notify-mail-per-user-ids))' + err );
    }
}

// ----------------------------------------------------------------------------- Not use yet

/*

function getUserPerTemplate_Li( classDataTemplate, liTemplate ) {
    var user   = null;
    var parent = liTemplate;

    while( parent ) {
        var index = parent.className.indexOf( classDataTemplate );

        if( index > -1 ) {
            //var jsnUser = $(parent).find('.template-data span').text();
            var jsnUser = thJQ(parent).find('.template-data span').text();

            if( jsnUser ) {
                user = {};
                user = JSON.parse(jsnUser);
            }

            break;
        }

        parent = parent.parentNode;
    }

    return user;
}

var stringToObject = function(str, type) {
    type = type || "object";  // can pass "function"
    var arr = str.split(".");

    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
    }
    if (typeof fn !== type) {
        throw new Error(type +" not found: " + str);
    }

    return  fn;
};

var stringToFunction = function(str) {
    var arr = str.split(".");

    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
    }

    if (typeof fn !== "function") {
        throw new Error("function not found");
    }

    return  fn;
};

function shortGIUD() {
    var S4;

    S4 = function() {
        return Math.floor(Math.random() * 0x1000);
    };

    return S4() + "-" + S4();
}

function removeNewlines(str) {
    str = str.replace(/\s{2,}/g, ' ');
    str = str.replace(/\t/g, ' ');
    str = str.toString().trim().replace(/(\r\n|\n|\r)/g,"");
    console.log(str);
}

var randomValues = {

    randomString: function() {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var string_length = 9;
        var randomstring = '';

        for (var i=0; i<string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    },

    randomBirthday: function() {
        function getRandomArbitary (min, max) {
            return Math.random() * (max - min) + min;
        }

        function getRandomInt (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var year = getRandomInt (1963, 1990);
        var month = getRandomInt (1, 12);
        var day = getRandomInt (1, 29 );

        //return month + '/' + day + '/' + year;
        return year + '-' + month + '-' + day;
    },

    randomLanguage: function() {
        var langArray = ['English','Russian','French','Spanish','Italian'];
        var lang = langArray[Math.floor(Math.random() * langArray.length)];
        return lang;
    },

    randomHobbies: function() {
        var langArray = ['Bike','Motorcycle','Soccer','Volleyball','Software', 'Gadgets',
            'Walking', 'Audio books','Codding', 'Gaming','Movies','Social Network'];
        var lang = langArray[Math.floor(Math.random() * langArray.length)];
        return lang;
    },

    randomCountry: function(){
        var countryArray = ['USA','Russia','Canada','France','Spain', 'Italy'];
        var country = countryArray[Math.floor(Math.random() * countryArray.length)];
        return country;
    }
};

function readCookieValue(key) {
    return $.cookie(key);
}

function storeCookieValue(key, value) {
    $.cookie(key, value, { expires: 18 });
}

*/

/*
 For checking if a string is empty, null or undefined I use:

 function isEmpty(str) {
 return (!str || 0 === str.length);
 }
 For checking if a string is blank, null or undefined I use:

 function isBlank(str) {
 return (!str || /^\s*$/.test(str));
 }
 For checking if a string is blank or contains only white-space:

 String.prototype.isEmpty = function() {
 return (this.length === 0 || !this.trim());
 };
 */












