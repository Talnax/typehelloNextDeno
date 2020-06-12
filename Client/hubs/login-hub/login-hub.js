/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013, 5/26/13
 * product:  Web-Аssistant ( TypeHello )
 * file:    login-hub.js
 */

var th = th || {};
th.next = th.next || {};

th.next.LoginHub = ( function( $ ) {
    var This
        , _public = LoginHub.prototype;

    function LoginHub() {

        initSocketIO();

        setActiveChannel( document.URL );

        This               = this;
        this.cssClassHub   = '.login-hub';
        this.hubStatus     = statusHub.not_active;

        this.elServerSide  = $('#http-login-respond');
        this.nickName      = null;
        this.logInComplete = false;

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            this.initHub();

            this.checkUserIdentity();

            This.commonHub.setScrollHubPosition( This );

            This.btnSignUP = $('#btn-sign-up');
            This.pnlTerms = $('.login-hub .th-sign-up .th-terms-panel');
            //This.userPic   = $('.login-hub .user-profile-picture');
            This.pnlSignUP = $('.login-hub .th-sign-up');

            setUIEvents();

            //enableBtnSignUp( false );

            This.hubStatus = statusHub.initialized;
        }
        catch(err) {
            console.log('ERROR(LoginHub.Initialize())' + err );
        }
    };

    _public.httpLogin = function( user ) {
        try {

            if(!isDefine(user)) return;

            This.showProgressBar(true);

            //This.userPic.addClass('invisible-item');

            showHttpServerResponse('Call Server...');

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('New User Fail... ' + errorThrown );

                //This.elServerSide.css('display', 'block');

                showHttpServerResponse('<li class="red-frg">New User Fail...</li>');
            }

            setTimeout(function() {

                var req = 'login';

                var ajaxData = JSON.stringify(user);

                ajaxCall( pathServer + req, req + '=' + ajaxData, This.httpLogin_Complete, error_call );

            }, 600 );
        }
        catch(err) {
            console.log('ERROR(LoginHub.httpLogin())' + err );
        }
    };

    _public.httpLogin_Complete = function( data, textStatus, jqXHR ){
        try {
            This.showProgressBar(false);

            var parser = JSON.parse(data);

            var logMsg;

            if( parser.err ) {
                logMsg = '<li class="red-frg">Login Fail...</li>';

                $('.th-standard-login').css('display','block');

                //This.showProgressBar(false);
            }
            else {
                var user = parser.backmessage;

                saveLocalStorageValues( storageNick, user.nick );

                setUser(user);

                if(This.socketLogin()) {
                    logMsg = '<li>Login Completed</li>';
                }
                else {
                    logMsg = '<li class="red-frg">Socket Fail...</li>';
                    $('.th-standard-login').css('display','block');
                    This.showProgressBar(false);
                }
            }

            showHttpServerResponse(logMsg);
        }
        catch(err) {
            console.log('ERROR(LoginHub.httpLogin_Complete())' + err );
        }
    };

    _public.socketLogin = function() {
        try {
            var user = getUser();

            if( !isDefine( user.socket_id )) {
                user.channels = [];
                user.socket_id = null;
            }

            Socket.emit( socketEvents.socket_login, { 'user': user });

            return true;
        }
        catch ( err ) {
            console.log("Can't connect to Socket server" + err.message);
            return false;
        }
    };

    _public.isLogInCompleted = function() {
        return This.logInComplete;
    };

    _public.socketLogin_Completed = function( msg, socket ) {
        try {
            This.showProgressBar(false);

            var logMsg;

            if( msg.isError.status !== false ) {
                console.log('Socket-Server return ERROR: ' + msg.isError.value );

                showHttpServerResponse('<li class="red-frg">Socket Fail...</li>');
                alert("Ooops, look like we don't support this page yet...");
                This.hubShow(false);

                return;
            }
            else if( msg.login === 'success' ) {
                logMsg = '<li>' + 'Login completed for '+ msg.user.nick + '</li>';
            }
            else if( msg.login === 'null' ) {
                logMsg = '<li>' + 'Join completed for '+ msg.user.nick + '</li>';
            }

            setUser(msg.user);  // update user value with channels

            // open 'public' chat.

            var channel = {
                'url':  document.URL,
                'type': channelType._public,
                'kind': channelKind.text
            };

            // open hab-talk

            if(!isDefine(hubTalk)) {
                initTalkHub(function() {
                    showTalkHub( channel, logMsg );
                });
            }
            else {
                showTalkHub( channel, logMsg );
            }


           loadHub( 'note-hub', function(res) {
              if( res === 'ok' ) {
                 if( !hubNote ) {
                    hubNote = new th.next.NoteHub();
                 }
                 hubNote.hubShow( true );
              }
           });
        }
        catch(err) {
            console.log('ERROR(LoginHub.socketLogin_Completed())' + err );
            This.showProgressBar(false);
        }
    };

    _public.checkUserIdentity = function() {
        try {

            var _nick = getCookie(storageNick);
            var _pwd  = getCookie(storagePswd);

            if( isDefine(_nick)  && isDefine(_pwd)) {
                if( _nick !== '' && _pwd !== '' ) {
                    var user = userId;
                    user.nick = _nick;
                    user.pwd  = _pwd;

                    $('#input-login-nick').val(_nick);
                    $('#input-login-password').val(_pwd);

                    This._user = user;

                    setTimeout( function() {
                        var iii = 0;
                        $('.th-standard-login').css('display', 'none');
                        This.httpLogin( This._user );
                    }, 600 );

                    return;
                }
            }

            var nickName = readLocalStorageValues( storageNick );

            if( isDefine(nickName)) {
                $('#input-login-nick').val(nickName);

                setTimeout( function() {
                    $('#input-login-password').focus();
                }, 600 );
            }
            else {
                setTimeout( function() {
                    $('#input-login-nick').focus();
                }, 600 );
            }
        }
        catch(err) {
            console.log('ERROR(LoginHub.checkLocalStorage())' + err );
        }
    };

    // --------------------------------------------------------------- Common Hub functions

    _public.initHub = function() {
        This.commonHub.initHub(This);
    };

    _public.fromHubToHub = function( fromHub, objArgs ) {
        This.commonHub.fromHubToHub( This, fromHub, objArgs );
    };

    _public.hubShow = function( bShow ) {
        This.commonHub.hubShow( This, bShow);
        This.hubStatus = This.hubStatus < statusHub.active ? statusHub.active: This.hubStatus;
    };

    _public.hubRemove = function() {
        This.commonHub.hubRemove.call(this);
    };

    _public.showProgressBar = function( bShow ) {
        This.commonHub.showProgressBar( This, bShow);
    };

    _public.getHubStatus = function( bShow ) {
        return This.hubStatus;
    };

    // --------------------------------------------------------------- OnClick functions

    _public.onMainMenuAction_Click = function(e) {
        e.preventDefault();

        This.commonHub.onMainMenuAction_Click(This, e);

        return false;
    };

    _public.onBtnLogin_Click = function(e) {
        try {
            e.preventDefault();

            var user = getUser();

            if( user === null ) {
                user = userId;

                user.nick = document.getElementById("input-login-nick").value;
                if(!isDefine( user.nick ) || user.nick === '') {
                    return false;
                }

                user.pwd = document.getElementById("input-login-password").value;
                if(!isDefine( user.pwd ) || user.pwd === '' ) {
                    alert('And your password is ?');
                    return false;
                }

                $('.th-standard-login').css('display', 'none');

                setCredentials( user );

                This.httpLogin( user );
            }
            else {
                This.socketLogin(); // run only socket login, but we DON'T need it to :)
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(LoginHub.onBtnLogin_Click())' + err );
            return false;
        }
    };

    _public.onBtnSignUp_Click = function(e) {
        try {
            e.preventDefault();

//            var btnOpacity = This.btnSignUP.css('opacity');
//            if( btnOpacity < 1.0 ) {
//                //alert('Hi, please fill login values!');
//                return false;
//            }

            var userTmp = getUser();

            var user = {};
            user.id         = GUID();
            user.online     = onlineStatus.online;
            user.nick       = document.getElementById("input-sign-up-nick").value.trim();
            user.pwd        = document.getElementById("input-sign-up-password").value.trim();
            user.mail       = document.getElementById("input-sign-up-mail").value;
            user.date       = getCurrentDate();
            user.gender     = 'undefine'; //document.getElementById("select-sign-up-gender").value;
            user.language   = 'undefine';
            user.country    = 'undefine';
            user.hobby      = !userTmp ? '' : userTmp.hobby;
            user.hobbies    = !userTmp ? [] : userTmp.hobbies;
            user.interest   = '';
            user.interests  = [];
            user.pic        = '';
            user.site       = '';
            user.city       = '';
            //user.profession = '';
            //user.expertise  = '';
            //user.about_me   = '';
            //user.birth      = '';

            This.pnlSignUP.css('display','none');

            This.showProgressBar(true);

            checkAllSignUpData( user, function(res){
                This.showProgressBar(false);

                if(!res)   {
                    This.pnlSignUP.css('display','block');
                    return false;
                }
                else {
                    setCredentials( user );
                    isNewUser = true;
                    This.httpLogin( user );
                }
            });

            return false;
        }
        catch(err) {
            console.log('ERROR(LoginHub.onBtnSignUp_Click())' + err );
            return false;
        }
    };

    _public.onLnkNewUser_Click = function(e) {
        try {
            e.preventDefault();

            //This.userPic.removeClass('invisible-item');

            This.elServerSide.css('display', 'none');

            $('.th-standard-login').css('display', 'none');

            This.pnlSignUP.css('display','block');

            setTimeout( function() {
                $('#input-sign-up-nick').focus();
            }, 600 );

            return false;
        }
        catch(err) {
            console.log('ERROR(LoginHub.onLnkNewUser_Click())' + err );
            return false;
        }
    };

    _public.onKeepMeLoggedIn_Click = function() {
    };

    function onTerms_Click(e) {
        try {
            e.preventDefault();
            window.open("http://www.typehello.com/new-terms.html");
            return false;
        }
        catch(err) {
            console.log('ERROR(LoginHub.onTerms_Click())' + err );
            return false;
        }
    }

    function onDataUsePolicy_Click(e) {
        try {
            e.preventDefault();
            alert("This document in PROGRESS :)");
            return false;
        }
        catch(err) {
            console.log('ERROR(LoginHub.onDataUsePolicy_Click())' + err );
            return false;
        }
    }

    function onCookieUse_Click(e) {
        try {
            e.preventDefault();
            alert("This document in PROGRESS :)");
            return false;
        }
        catch(err) {
            console.log('ERROR(LoginHub.onCookieUse_Click())' + err );
            return false;
        }
    }

    function onNickName_LostFocus(e) {
        try {
            e.preventDefault();

            var elNick = $(this)[0]; //document.getElementById("input-sign-up-nick");
            var nick = elNick.value;
            if( nick.length === 0  ) {
                //enableBtnSignUp( false );
            }
            else if(nick.length < 3 || nick.length > 9 ) {
                alert("Oops, Length of `Nick` have to be between 3 and 9 characters !");
                //elNick.focus();
                //enableBtnSignUp( false );
            }
            else if (nick.indexOf(' ') > -1) {
                alert("Oops, `Nick` have to be without blank(' ') character !");
            }
            else {
                if( This.nickName !== nick ) {
                    This.nickName = nick;

                    checkNickName(This.nickName);
                }
                else {
                    //enableBtnSignUp( true );
                }
            }
            return false;
        }
        catch(err) {
            console.log('ERROR(LoginHub.onNickName_LostFocus())' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

    function setUIEvents() {
        try {

            $('#th-btn-login').click(This.onBtnLogin_Click);

            $('#input-login-password').keyup(function(e) {
                if(e.keyCode === 13) {
                    This.onBtnLogin_Click(e);
                }
            });

            This.btnSignUP.click(This.onBtnSignUp_Click);
            $('#th-btn-new-user').click(This.onLnkNewUser_Click);

            $('#sing-up-terms').click(onTerms_Click);
            $('#sign-up-data-use-policy').click(onDataUsePolicy_Click);
            $('#sign-up-cookie-use').click(onCookieUse_Click);

            $('#input-sign-up-nick').blur(onNickName_LostFocus);
        }
        catch( err ) {
            console.log('ERROR(LoginHub.setUIEvents()): ' + err );
        }
    }

    function enableBtnSignUp( enable ) {
        try {
            if(enable) {
                This.btnSignUP.css('opacity', '1.0');
                This.pnlTerms.css('opacity', '1.0');
            }
            else {
                This.btnSignUP.css('opacity', '0.3');
                This.pnlTerms.css('opacity', '0.3');
            }
        }
        catch(err) {
            console.log('ERROR(LoginHub.enableBtnSignUp())' + err );
        }
    }

//    function showPanel( jqEl, show ) {
//        try {
//            if(show) {
//                jqEl.css('display', 'block');
//            }
//            else {
//                jqEl.css('display', 'none');
//            }
//
//        }
//        catch(err) {
//            console.log('ERROR(LoginHub.showPanel())' + err );
//        }
//    }
    function setCredentials(user) {
        try {
            // delete previous cookie.

           delCookie( storageNick, "" );
           delCookie( storagePswd, "" );

           // set new  cookie.

            var exdays = 18;
            setCookie( storageNick, user.nick, exdays );
            setCookie( storagePswd, user.pwd, exdays );
        }
        catch( err ) {
            console.log('ERROR(LoginHub.setCredentials())' + err );
        }
    }

    function initTalkHub( callback ) {
        try {
            This.commonHub.getHub( hubTalk, 'talk-hub', function( reference ) {
                if( reference.init ) {
                    hubTalk = new th.next.TalkHub();
                }
                sendCallBack(callback);
            });
        }
        catch(err) {
            console.log('ERROR(LoginHub.openTalkHub())' + err );
        }
    }

    function showTalkHub( channel, logMsg ) {
        try {
            This.logInComplete = true;
            This.hubShow( false );

            //hubTalk.hubShow( true );
            hubTalk.socketOpenChat( channel );

            showSocketServerResponse( logMsg );

            // show profile-hub if user is new

            if( isNewUser ) {
                setTimeout(function() {
                    if( !hubProfile ) {
                        loadHub( 'profile-hub', function(res) {
                            if( res === 'ok' ) {
                                if( !hubProfile ) {
                                    hubProfile  = new th.next.ProfileHub();
                                }
                                hubProfile.hubShow( true );
                                hubProfile.showFirstTime(getUser());
                            }
                        });
                    }
                    else {
                        hubProfile.hubShow( true );
                        hubProfile.showFirstTime(getUser());
                    }
                }, 1500);
            }
           else {
               // show ???-hub from user's settings.
               //if( !ctrlSettings ) {
               //   setTimeout(function() {
               //      ctrlSettings  = new th.next.SettingsController();
               //      ctrlSettings.openStartHubs();
               //   }, 600 );
               //}
            }
        }
        catch(err) {
            console.log('ERROR(LoginHub.showTalkHub())' + err );
        }
    }
    /*
    function setListValuesOfBirthDay() {
        try {
            var opt;

            // month.

            var month = document.getElementById("birth-month");
            for(var i = 0; i < monthName.length;  i++ ) {
                opt = document.createElement('option');
                opt.innerHTML = monthName[i];
                opt.value = (i + 1).toString();

                month.appendChild(opt);
            }

            // day.

            var day = document.getElementById("birth-day");
            for(var j = 0; j < 31;  j++ ) {
                opt = document.createElement('option');
                opt.innerHTML = (j + 1).toString();
                opt.value = (j + 1).toString();

                day.appendChild(opt);
            }

            // year.

            var date  = new Date();
            var ydate = date.getFullYear();

            var year = document.getElementById("birth-year");
            for(var l = ydate; l > 1904;  l-- ) {
                opt = document.createElement('option');
                opt.innerHTML = l.toString();
                opt.value = l.toString();

                year.appendChild(opt);
            }
        }
        catch(err) {
            console.log('ERROR(LoginHub.getBirthValue())' + err );
        }
    }
    */
    /*
    function getBirthValue() {
        try {
            var month = document.getElementById("birth-month").value;
            if(month === '0') {
                return '';
            }

            var day = document.getElementById("birth-day").value;
            if(day === '0') {
                return '';
            }

            var year = document.getElementById("birth-year").value;
            if(year === '0') {
                return '';
            }

            return month + '-' + day + '-' + year;
        }
        catch(err) {
            console.log('ERROR(LoginHub.getBirthValue())' + err );
            return null;
        }
    }
    */
    function showHttpServerResponse( response ) {
        try {
            This.elServerSide.append(response);
            This.elServerSide[0].scrollTop = This.elServerSide[0].scrollHeight;
        }
        catch(err) {
            console.log('ERROR(LoginHub.showHttpServerResponse())' + err );
        }
    }

    function showSocketServerResponse( response ) {
        try {
            var elSocketSide = $("#messages-server");
            elSocketSide.append(response);
        }
        catch(err) {
            console.log('ERROR(LoginHub.showSocketServerResponse())' + err );
        }
    }

    function checkAllSignUpData( user, callback ) {
        try {
            if( user.nick.length < 3 ||  user.nick.length > 9 ) {
                alert("`Nick` have to be between 3 and 9 characters !");
                sendCallBack(callback(false));
                return;
            }

            if( user.nick.indexOf(' ') > -1 ) {
                alert("`Nick` have to be without blank(' ') character !");
                sendCallBack(callback(false));
                return;
            }

            if( user.pwd.length < 3 || user.pwd.length > 6 ) {
                alert("`Password` have to be between 3 and 6 characters !");
                sendCallBack(callback(false));
                return;
            }

            if( user.pwd.indexOf(' ') > -1 ) {
                alert("`Password` have to be without blank(' ') character !");
                sendCallBack(callback(false));
                return;
            }

            checkEMail( user.mail, function(res) {
                return callback(res);
                //sendCallBack(callback(res));
                //return;
            });
        }
        catch(err) {
            console.log('ERROR(LoginHub.checkAllSignUpData())' + err );
            sendCallBack(callback(res));
        }
    }

    function checkNickName( nickName ) {
        try {
            function success_call( data, textStatus, jqXHR ) {

                This.showProgressBar( false );

                enableBtnSignUp( true );

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);
                    console.log(parser.param);

                    if( parser.param.length > 0 ) {
                        alert('This nick already exist :(');
                    }
                }
                else {
                    alert( "We can't get data :(");
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('FAIL[LoginHub.checkNickName()]' + errorThrown );
                This.showProgressBar( false );
            }

            if(!isDefine( nickName )) return;

            enableBtnSignUp( false );

            var req     = 'check-nick-name';
            var request = {
                dbcall:        'db-find',
                dbcollection:  'users',
                dbrequest:      { 'nick': nickName }
            };

            var ajaxData = JSON.stringify(request);

            setTimeout(function() {
                ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
            }, 600);

            This.showProgressBar( true );
        }
        catch(err) {
            console.log('ERROR(LoginHub.checkNickName())' + err );
            This.showProgressBar( false );
        }
    }

    function checkEMail( eMail, callback ) {
        try {
            function success_call( data, textStatus, jqXHR ) {

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( parser.param.length > 0 ) {
                        alert('This eMail already exist :(');
                        //sendCallBack(callback(false));
                        return callback(false);
                    }
                    else {
                        //sendCallBack(callback(true));
                        return callback(true);
                    }
                }
                else {
                    //sendCallBack(callback(true));
                    return callback(true);
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('FAIL[LoginHub.checkEMail()]' + errorThrown );
                sendCallBack(callback(false));
            }

            if(!isDefine( eMail )) {
                alert("`eMail` is NOT correct !");
                sendCallBack(callback(false));
                return;
            }

            if( !isEmailCorrect(eMail)) {
                alert("`eMail` is NOT correct !");
                sendCallBack(callback(false));
                return;
            }

            var req     = 'check-email';
            var request = {
                dbcall:        'db-find',
                dbcollection:  'users',
                dbrequest:      { 'mail': eMail }
            };

            var ajaxData = JSON.stringify(request);

            setTimeout(function() {
                ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
            }, 600);
        }
        catch(err) {
            console.log('ERROR(LoginHub.checkEMail())' + err );
            sendCallBack(callback(false));
        }
    }

    return LoginHub;

})( thJQ );

th.next.LogInController = (function($) {
    var This
        ,_public = LogInController.prototype;

    function LogInController() {
        This = this;

        this.Initialize();
    }

    _public.Initialize = function() {
    };

    return LogInController;

})(thJQ);





































