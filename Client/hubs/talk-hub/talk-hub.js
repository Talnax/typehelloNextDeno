/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013, 5/24/13
 * product:  Web-Аssistant ( TypeHello ) Channel2Channel
 * file:    talk-hub.js
 */

var th = th || {};
th.next = th.next || {};

th.next.TalkHub = (function( $ ) {
    var This,
        _public = TalkHub.prototype;

    var CHATs = {};

    function TalkHub() {
        This             = this;
        this.cssClassHub = '.talk-hub';
        this.hubStatus   = statusHub.not_active;

        this.activeChannel = null;
        this.chatTemplate  = null;
        this.channelTabs   = 0;
        this.argsDlgFilter  = null;

        this.userPerClick   = null;
        this.liItemTemplate = null;

        this.feedbackClass = ".talk-hub-dlg-feedback";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            This.commonHub.removeMainMenuItem( This, 'talk');

            this.initHub();

            //$("#chat-message").attr('maxlength', parseInt(MSG_LENGTH));

            setUIEvents();

            setFocusTextArea();

            //This.commonHub.setScrollHubPosition( This );
            This.commonHub.setHubPosition( This );
//            setTimeout(function() {
//                var mainTMPL  = pathServer + 'CLIENT/html/templates.html';
//                loadHtml(mainTMPL, parseHtmlContent, function(res) {
//                    This.commonHub.removeMainMenuItem( This, 'talk');
//                });
//            }, 600 );
            this.hubStatus = statusHub.initialized;

//            fnDelay(function() {
//                console.log('call after fnDelay()');
//            }, 1000);
        }
        catch( err ) {
            console.log('ERROR(TalkHub.Initialize()): ' + err );
        }
    };

//    var fnDelay = (function(){
//        var timer = 0;
//        return function(callback, ms){
//            clearTimeout(timer);
//            timer = setTimeout(callback, ms);
//        };
//    })();

    _public.buildPrivateChannel = function( _user, _userPerClick) {
        try {

            if( _userPerClick.id === _user.id ) {
                //alert("Hey, you can't create private chat with yourself :)");
                showMessageDlg( "Hey, you can't create private chat with yourself :)" );
                return;
            }

            var user_from = _user.id.split('-');
            var user_to   = _userPerClick.id.split('-');

            var private_channel = buildChannel( user_from[0] + user_from[1], user_to[0] + user_to[1] );
            var channel = {
                'url':  private_channel,
                'type': channelType._private,
                'kind': channelKind.text
            };

            This.userPerClick = _userPerClick;  // we can receive this call from any place of project

            This.socketOpenChat( channel );
        }
        catch(err) {
            console.log('ERROR(TalkHub.buildPrivateChannel()): ' + err);
        }
    };

    _public.socketOpenChat = function( channel ) {
        try {
            //initIgnoresList(function() {

                //channel.url = encodeURI(channel.url);
                //channel.url = encodeURIComponent(channel.url);

                // ROST - change this logic, because can be open 'friend' or 'private' chat dynamically.
                if( This.channelTabs > 8 ) {
                    showMessageDlg("You can't create more then 9 channels");
                    return;
                }

                var user = getUser();

                var isExist = isChannelPerUserExist( channel, user );

                if( !isExist ) {

                    // send message to new channel.

                    var msg = {
                        'user':         user,
                        'new_channel':  channel,
                        'anyone':       null    // mean this is NOT private or friend channel
                    };

                    Socket.emit( socketEvents.socket_open_chat, msg );

                    // check if user want to open private-channel

                    if( channel.type === channelType._private  ) {

                        msg = {
                            'user':         This.userPerClick,
                            'new_channel':  channel,
                            'anyone':       user    // mean this is ARE private or friend channel
                        };

                        Socket.emit( socketEvents.socket_open_chat, msg );
                    }
                }
                else {
                    showMessageDlg( 'This channel already exist!' );
                }

            //});
        }
        catch( err ) {
            console.log('ERROR(TalkHub.socketOpenChat()): ' + err );
        }
    };

    _public.socketOpenChat_Completed = function(msg, _socket) {
        try {

            // set properties of settings

            //if( !ctrlSettings ) {
            //    setTimeout(function() {
            //        ctrlSettings  = new th.next.SettingsController();
            //        ctrlSettings.openStartHubs();
            //    }, 600 );
            //}

            // action for event.

            var user = getUser();

            var isExist = isChannelPerUserExist( msg.channel, user );

            if( !isExist ) {

                // if this is private chat show alert

                if( msg.anyone ) {

                    // check ignores

                    //if( !checkIgnores(msg.anyone))
                    //    return;

                    alert( msg.anyone.nick + ' want to talk to you private!' );
                }

                addChannel(msg.channel, user);

                if( msg.isError.status !== false ) {
                    console.log( msg.msg );
                    $("#messages-server").append('<li class="red-frg">' + msg.isError.value + '</item>');
                }
                else {
                    $("#messages-server").append('<li>' + "Connect to channel..." + '</item>');
                }

                // send message to all of this channel, that user connect

                var txt =
                    msg.channel.type === channelType._private ?
                            'Connect to private channel...' :
                            'Join the channel...';

                var param = {
                    text:     txt,
                    user:     user,
                    channel:  msg.channel
                };

                Socket.emit( socketEvents.socket_msg_chat, param );

            }
            else {
                // only if type of channel 'private' or 'friend' we activate talk-hub

                if( msg.channel.type === channelType._private ) {
                    This.hubShow( true );
                    changeActiveChannelTab( msg.channel.url );
                }
            }
        }
        catch( err ) {
            console.log('ERROR(TalkHub.socketOpenChat_Completed()): ' + err );
        }
    };

    _public.socketMessageChat_Completed = function(msg, _socket) {
        try {
            // check ignores

            //if( !checkIgnores(msg.user)) return;

            // check user by filter

            if( !checkFilter(msg.user, getUser())) return;

            // update UI of current chat

            if( This.activeChannel === msg.channel.url ) {

                // make user profile short

                //msg.user = getUserProfile(msg.user);

                bindDataTemplateValues(msg);

                // scroll to bottom
                var elem = document.getElementById('messages-chat');
                elem.scrollTop = elem.scrollHeight;
            }

            // add user to array.

            if( !isDefine(USERs[msg.user.id])) {
                USERs[msg.user.id] = msg.user;
            }

            // update chats array

            var chat = CHATs[msg.channel.url];

            if( chat ) {
                var message = {
                    //user: getUserProfile(msg.user),
                    user: msg.user,
                    msg:  msg.msg
                };

                chat.messages.push(message);

                // show amount of messages if channel is not active

                if( This.activeChannel !== msg.channel.url ) {
                    if( !chat.hasOwnProperty('msg_counter')) {
                        chat.msg_counter = 1;
                    }
                    else {
                        chat.msg_counter += 1;
                    }

                    updateMessageCounter( msg.channel.url, chat.msg_counter );
                }
            }
        }
        catch( err ) {
            console.log('ERROR(TalkHub.socketMessageChat_Completed()): ' + err );
        }
    };

    _public.socketSendSmsNotification = function( sms) {
        try {
            Socket.emit( socketEvents.socket_sms_notification, sms );
        }
        catch( err ) {
            console.log('ERROR(TalkHub.socketSendSms()): ' + err );
        }
    };

//    _public.socketMessage = function(msg, _socket ) {
//        console.log( 'TalkHub.socketMessage() generic event_message', msg );
//
//        $("#messages-chat").append('<li>' + msg + '</item>');   // update UI
//    };

    // --------------------------------------------------------------- Common Hub functions

    _public.initHub = function() {
        This.commonHub.initHub(This);
    };

    _public.onMainMenuAction_Click = function(e) {
        This.commonHub.onMainMenuAction_Click(This, e);
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

    function onCloseChannelTab_Click( e ) {
        try {
            e.preventDefault();

            if( This.channelTabs === 1 ) {
                showMessageDlg( "Oops, you can't delete last channel :(" );
            }
            else {
                var fullCloseChannel = removeChannel(This.activeChannel);

                if( fullCloseChannel !== null ) {
                    Socket.emit( socketEvents.socket_close_chat,
                        { 'user': getUser(),
                            'remove_channel': fullCloseChannel });
                }
            }

            return false;
        }
        catch( err ) {
            console.log('ERROR(TalkHub.actionMakePersonAs()): ' + err );
            return false;
        }
    }

    function onChannelTab_Click(e) {
        try {
            e.preventDefault();

            var li = $(this).closest('li');
            var url = li[0].getAttribute('data-url' );

            changeActiveChannelTab(url);

            return false;
        }
        catch( err ) {
            console.log('ERROR(TalkHub.onChannelTab_Click()): ' + err );
            return false;
        }
    }

    function onTalkMainMenu_Click( event ) {
        try {
            event.preventDefault();

            var el = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-dlg' );

            var f = 'show' + fun;
            This.commonHub[f]( This, arg, function( args ) {

                // open new 'Chat' with specific channel 'url'
                if( fun === 'DlgPerTheme') {
                    var channel = {
                        'url':  args,
                        'type': channelType._special,
                        'kind': channelKind.text
                    };

                    This.socketOpenChat( channel );
                }

                // set new 'Filter' for chat
                else if( fun === 'DlgPerFilter' ) {
                    if(args !== null ) {
                        This.argsDlgFilter = args;  // args is set
                    }
                }
            });

            return false;
        }
        catch(err) {
            console.log('TalkHub.onTalkMainMenu_Click(): ' + err );
            return false;
        }
    }
    /*
    function onExpandListItem_Click(e) {
        try {
            e.preventDefault();

            var expand_value;

            if( $(this).text().toLowerCase() === 'expand' ) {
                $(this).text('collapse');
                var uid = getUserPerDataTemplate( 'chat-list-view-item-template', e);
                expand_value = getStrUserShortProfile( USERs[uid.user_id] );
            }
            else {
                $(this).text('expand');
            }

            var expand_content = $(this).parent().find('.expand-content');
            expand_content.text( expand_value );
            $(expand_content).toggle('fast', function() {} );
        }
        catch( err ) {
            console.log('ERROR(TalkHub.onExpandListItem()): ' + err );
        }
    }
    */
    function onUserAction_Click ( e ) {
        try {
            e.preventDefault();

            var owner  = getUser();
            var uid    = getUserPerDataTemplate('chat-list-view-item-template', e);
            var action = e.target.className.split(' ')[0];

            This.userPerClick   = USERs[uid.user_id];
            var template        = $(this).closest('.chat-list-view-item-template');
            This.liItemTemplate = template[0].parentNode;

            switch( action ) {
                case 'make-person-as':
                    actionMakePersonAs(owner);
                    break;
                case 'private-chat':
                    This.buildPrivateChannel( owner, This.userPerClick );
                    break;
                case 'send-sms':
                    actionSendSms();
                    break;
                case 'full-profile':
                    actionGetFullProfile();
                    break;
                case 'ignore-user':
                    actionIgnoreUser( owner );
                    break;
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(TalkHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    function onMessageChat_Click(e) {
        try {
            e.preventDefault();

            var el_msg = document.getElementById('chat-message');

            var msg = el_msg.value.trim();
            if( msg.length < 1 ) return false;

            var user = getUser();
            var url  = This.activeChannel ? This.activeChannel : document.URL;
            var type = isDefine(CHATs[url]) ? CHATs[url].channel.type: channelType._public;
            //var url  = This.activeChannel ? This.activeChannel : encodeURI(document.URL);
            //var url  = This.activeChannel ? This.activeChannel : encodeURIComponent(document.URL);

            var param = {
                text:     msg,
                user:     user,
                channel:  {
                    url:  url,
                    type: type
                    //type: channelType._public
                }
            };

            Socket.emit( socketEvents.socket_msg_chat, param );

            el_msg.value = "";

            return false;
        }
        catch( err ) {
            console.log('ERROR(TalkHub.onMessageChat_Click()): ' + err );
            return false;
        }
    }

    function onLogOut_Click ( e ) {
        try {
            e.preventDefault();

            delCookie( storageNick, "" );
            //delCookie( storagePswd, "" );

            location.reload();

            return false;
        }
        catch(err) {
            console.log('ERROR(TalkHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    // ------------------------------------------------------------- Support functions

    function getPanelElement( elementClass ) {
        try {
            //var element = $(liItemTemplate).find( elementClass );
            //return element;
            return $(This.liItemTemplate).find( elementClass );
        }
        catch( err ) {
            console.log('ERROR(TalkHub.getPanelElement()): ' + err );
            return null;
        }
    }

    function setFocusTextArea() {
        // http://stackoverflow.com/questions/16348483/how-can-i-trigger-a-keyup-event-and-pass-the-key
        // http://api.jquery.com/category/events/event-object/
        var msgElm = document.getElementById("chat-message");
        if( isDefine(msgElm)) {
            setTimeout(function() {
                msgElm.focus();
            }, 0);
        }
    }

    function initIgnoresList( callback ) {
        try {
            if( !isDefine(ctrlIgnore )) {
                This.commonHub.getHub( ctrlIgnore, 'ignore-hub', function( reference ) {
                    if( reference.init ) {
                        hubIgnore  = new th.next.IgnoreHub();
                        ctrlIgnore = new th.next.IgnoreController();
                    }

                    This.showProgressBar( true );

                    ctrlIgnore.getAllIgnores(getUser(), function( ignores ) {
                        //This.listIgnore = ignores;
                        This.showProgressBar( false );
                        sendCallBack( callback );
                    });
                });
            }
            else {
                sendCallBack( callback );
            }
        }
        catch( err ) {
            console.log('ERROR(TalkHub.initIgnoresList()): ' + err );
        }
    }

    function changeActiveChannelTab( url ) {
        try {
            if( This.activeChannel !== url ) {

                visibilityChannelTab( This.activeChannel, 0.2 );

                updateMessageCounter( url, "" );

                cleanChatPanel();

                setMessagesPerChannel( url );

                // scroll to bottom
                var elem = document.getElementById('messages-chat');
                elem.scrollTop = elem.scrollHeight;

                This.activeChannel = url;
                setActiveChannel(This.activeChannel);

                visibilityChannelTab( This.activeChannel, 1 );

                $('#chat-message').val('');

                showChatUrl( This.activeChannel );
            }
        }
        catch( err ) {
            console.log('ERROR(TalkHub.changeActiveChannelTab()): ' + err );
        }
    }

    function setUIEvents() {
        try {
//            $(document).on("click", This.cssClassHub, function(e) {
//                var zHub = $(This.cssClassHub).css("z-index" );
//
//                if( zHub <= zIndex  ) {
//                    zIndex = zHub + 1;
//                    thJQ(This.cssClassHub).css("z-index", zIndex );
//                }
//            });
//        var workMenu = $( this.cssClassHub + ' ul.th-ul-main-menu li.mm-main-menu');
//        $(document).on("click", workMenu.selector, function(e) {
//            $( This.cssClassHub + " .th-hub-slide-menu").slideToggle("fast");
//        });
            $('#btn-send-chat-message').click( onMessageChat_Click );
            $('#chat-message').keyup(function(e) { if(e.keyCode === 13) { onMessageChat_Click(e); } });

            $(document).on("mouseenter", "#messages-chat li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '1.0');
            });
            $(document).on("mouseleave", "#messages-chat li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '0.0');
            });

            $(document).on("click", "#messages-chat li ul.th-user-actions li span", onUserAction_Click );

            //$(document).on("click", ".chat-list-view-item-template .chat-footer .expand span", onExpandListItem_Click );

            $(document).on("click", ".talk-hub ul.th-ul-main-menu li", onTalkMainMenu_Click );

            $(document).on("click", 'ul.ul-tabs-chat-menu li', onChannelTab_Click );

            $(document).on("click", ".btn-close-channel", onCloseChannelTab_Click );

            $(document).on("click", "#th-link-log-out", onLogOut_Click );
        }
        catch( err ) {
            console.log('ERROR(TalkHub.setUIEvents()): ' + err );
        }
    }

    function checkIgnores( user ) {
        try {
            if( getUser().id === user.id ) {
                return true;
            }

            if( ctrlIgnore.listIgnore !== -1 &&  ctrlIgnore.listIgnore !== null ) {
                for( var i = 0; i < ctrlIgnore.listIgnore.length; i++ ) {
                    if( ctrlIgnore.listIgnore[i].hasOwnProperty('ignore') ) {
                        var ignore = ctrlIgnore.listIgnore[i].ignore;

                        if( ignore.id === user.id ) {
                            return false;
                        }
                    }
                }
            }

            return true;
        }
        catch( err ) {
            console.log('ERROR(TalkHub.checkIgnores()): ' + err );
            return true;
        }
    }

    function updateMessageCounter( _channel, counter ) {
        try {
            // re_init value

            if( counter === "" ) {
                CHATs[_channel].msg_counter = 1;
            }

            $("ul.ul-tabs-chat-menu li").each(function(index) {
                var dataUrl = $(this).attr('data-url');
                if( dataUrl === _channel ) {
                    $(this).find('.msg_counter').html(counter);
                }
            });
        }
        catch( err ) {
            console.log('ERROR(TalkHub.updateMessageCounter()): ' + err );
        }
    }

    function addChannel(channel, user) {
        try {
//            var talk = {
//                channel: channel,
//                messages: []
//            };
//
//            CHATs[channel.url] = talk;
            CHATs[channel.url] = {
                channel: channel,
                messages: []
            };

            user.channels.push( channel );

            setChatIcon( channel );

            showChatUrl( channel.url );

            cleanChatPanel();

            if( This.activeChannel !== null ) {
                visibilityChannelTab( This.activeChannel, 0.2 );
            }

            This.activeChannel = channel.url;
            setActiveChannel(This.activeChannel);

            $('#chat-message').val(''); // clean text-area of chat.

            This.channelTabs++;
        }
        catch( err ) {
            console.log('ERROR(TalkHub.addChannel()): ' + err );
        }
    }

    function removeChannel( _channel ) {
        try {
            // what is next channel become active ?

            for( var item in  CHATs ) {
                if( CHATs.hasOwnProperty(item)) {
                    var chat = CHATs[item];

                    if( This.activeChannel !== chat.channel.url ) {
                        This.activeChannel = chat.channel.url;
                        setActiveChannel(This.activeChannel);
                        break;
                    }
                }
            }

            cleanChatPanel();

            visibilityChannelTab( This.activeChannel, 1 );

            delete CHATs[_channel];

            setMessagesPerChannel( This.activeChannel );

            // remove channelTab

            $("ul.ul-tabs-chat-menu li").each(function(index)   {
                var dataUrl = $(this).attr('data-url');
                if( dataUrl === _channel ) {
                    $(this).remove();
                }
            });

            var fullChannel = removeChannelPerUser( _channel );

            showChatUrl ( This.activeChannel );

            This.channelTabs--;

            return fullChannel;
        }
        catch( err ) {
            console.log('ERROR(TalkHub.removeChannel()): ' + err );
            return null;
        }
    }

    function cleanChatPanel() {
        try {
            if( This.activeChannel !== null ) {
                $('#messages-chat > li').remove();
                $('#messages-chat').append( This.chatTemplate );
            }
        }
        catch( err ) {
            console.log('ERROR(TalkHub.cleanChatPanel()): ' + err );
        }
    }

    function showChatUrl ( url ) {
        // http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
        try {
            var chat = CHATs[url];

            var full_url = null;

            if( chat ) {
                var type_url = chat.channel.type;
                var dec_url  = decodeURIComponent( chat.channel.url).replace('?', '');

                var lenUrl = 90;
                dec_url = dec_url.length > lenUrl ? dec_url.slice( 0, lenUrl) + '...' : dec_url;

                if( type_url === channelType._public ) {
                    full_url = 'PUBLIC://' + dec_url;
                }
                else if (type_url === channelType._private ) {
                    full_url = 'PRIVATE://' + '*********';
                }
                else if (type_url === channelType._friends ) {
                    full_url = 'FRIENDS://' + '*********';
                }
                else {
                    full_url = 'SPECIAL://' + dec_url;
                }
            }

            var query = document.querySelectorAll( '#th-active-url' );
            if(query.length > 0) {
                query[0].innerHTML = full_url ? full_url: url;
            }
        }
        catch( err ) {
            console.log('ERROR(TalkHub.showChatUrl()): ' + err );
        }
    }

    function actionSendSms() {
        This.commonHub.showSmsDlg( This, '.show-dlg-sms', function( params ) {});
    }

    function actionGetFullProfile() {
        This.commonHub.showProfileDlg( This, '.show-dlg-profile', function( params ) {});
    }

    function actionIgnoreUser( user ) {
        try {
            if(!isDefine( user )) return;

            if( This.userPerClick.id === getUser().id ) {
                showMessageDlg( 'Do you want ignore yourself ?' );
                return;
            }

            // check if user already in ignore-list

            if (ctrlIgnore ) {
                if( ctrlIgnore.isUserIgnore(This.userPerClick)) {
                    showMessageDlg( 'This person already in ignore list :)' );
                    return;
                }
            }

            This.commonHub.showIgnoreDlg( This, '.show-dlg-ignore' );
        }
        catch( err ) {
            console.log('ERROR(TalkHub.actionIgnoreUser()): ' + err );
        }
    }

    function bindDataTemplateValues ( msg ) {
        try {
            if(!isDefine( msg )) return;

            // get template of chat-list-view-item
            if( !This.chatTemplate ) {
                This.chatTemplate = $('.chat-list-view-item-template.template-item');
            }
            if( This.chatTemplate.length === 0 )
                return;

            // get all information about user in one shot and set it
            // like json format to text value of empty div tag = 'template-data'.

            var uid = {
                user_id: msg.user.id
            };

            //var jsnUser = JSON.stringify(msg.user.id);
            var jsnUser = JSON.stringify(uid);
            $(This.chatTemplate).find('.template-data span').text(jsnUser);

            // set value of user to template.

            $(This.chatTemplate).find('.template-date span').text(getCurrentDate());

            $(This.chatTemplate).find('.template-msg span').text(msg.msg);

            $(This.chatTemplate).find('.template-nick span').text(msg.user.nick);

            var imgDiv  = $(This.chatTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, msg.user);

            var htmlTemplate = This.chatTemplate[0].outerHTML;
            var itemVisible = htmlTemplate.replace( "template-item", "" );

            $("#messages-chat").append('<li>' + itemVisible + '</li>');

            imgDiv[0].removeAttribute('style');  // remove previous pic.
        }
        catch( err ) {
            console.log('ERROR(TalkHub.bindDataTemplateValues()): ' + err );
        }
    }

    function bindFullProfile ( user ) {
        try {
            if(!isDefine(user))  return;

            getPanelElement('.info-nick').text(user.nick);

            getPanelElement('.info-lng').text(user.language);

            getPanelElement('.info-country').text(user.country);

            //getPanelElement('.info-birth').text(cutUserBirth(user.birth));
            //getPanelElement('.info-age').text(isDefine(user.age) ? user.age : '45');

            getPanelElement('.info-gender').text(user.gender);

            getPanelElement('.info-city').text( user.city.length > 0 ?  user.city : '...');

            getPanelElement('.info-about-me').text(user.about_me.length > 0 ? user.about_me : '...');

            getPanelElement('.info-hobbies').text(user.hobby.length > 0 ? user.hobby : '...');

            getPanelElement('.info-profession').text(user.profession.length > 0 ? user.profession : '...');

            getPanelElement('.info-expertise').text(user.expertise.length > 0 ? user.expertise : '...');
        }
        catch( err ) {
            console.log('ERROR(TalkHub.bindFullProfile()): ' + err );
        }
    }

    function setChatIcon( channel ) {
        try {
            var typeIs = null;
            var urlUI  = '';

            if( channel.type === channelType._public ) {
                typeIs = 'public';
            }
            else if (channel.type === channelType._private ) {
                typeIs = 'private';
            }
            else if (channel.type === channelType._friends ) {
                typeIs = 'friends';
            }
            else {
                typeIs = 'special';
            }

            var div_icon_class = '<div'
                + ' class="tab-chat-menu-icon talk-' + typeIs + '-channel"'
                + ' title="' + typeIs + ' channel"'
                + '></div>';

            var div_counter = '<div class="msg_counter"></div>';

            var queryLi =
                '<li'
                    + ' data-action="' + typeIs + '"'
                    + ' data-url="' + channel.url + '">'    // DON'T CHANGE IT !!!
                    + div_counter
                    + div_icon_class
                    + '</li>';

            /*
             var queryLi = '<li'
             + ' class="talk-' + typeIs + '-channel"'
             + ' title="' + typeIs + ' channel"'
             + ' data-action="' + typeIs + '"'
             + ' data-url="' + channel.url + '"'
             + '></li>';
             */
            $("ul.ul-tabs-chat-menu").append(queryLi);
        }
        catch( err ) {
            console.log('ERROR(TalkHub.setChatIcon()): ' + err );
        }
    }

    function visibilityChannelTab( _channel, _opacity ) {
        try {
            $("ul.ul-tabs-chat-menu li").each(function(index)
            {
                var dataUrl = $(this).attr('data-url');
                if( dataUrl === _channel ) {
                    //$(this).css('opacity', _opacity);
                    var item_tab_icon = $(this).find('div.tab-chat-menu-icon');
                    item_tab_icon.css('opacity', _opacity);
                }
            });
        }
        catch( err ) {
            console.log('ERROR(TalkHub.disableChannel()): ' + err );
        }
    }

    function setMessagesPerChannel( url ) {
        try {
            var chat = CHATs[url];

            if( chat ) {
                var messages = chat.messages;

                if( messages ) {
                    for( var item in messages ) {
                        if( messages.hasOwnProperty(item)) {
                            var msg = messages[item];

                            bindDataTemplateValues(msg);
                        }
                    }
                }
            }
        }
        catch( err ) {
            console.log('ERROR(TalkHub.setMessagesPerChannel()): ' + err );
        }
    }

    function isChannelPerUserExist( channel, user ) {
        try {
//            var talk = CHATs[channel.url];
//
//            if( talk ) {
//                return true;
//            }
//
//            return false;
//            if( isDefine(CHATs[channel.url]))
//                return true;
//
//            return false;

            return isDefine(CHATs[channel.url]) ? true : false;
        }
        catch( err ) {
            console.log('ERROR(TalkHub.isChannelPerUserExist()): ' + err );
            return false;
        }
    }

    function removeChannelPerUser( removeChannel ) {
        try {

            var fullChannel = null;

            var user = getUser();

            for ( var index in user.channels) {
                if( user.channels.hasOwnProperty(index)) {
                    var url = user.channels[index].url;
                    if ( url === removeChannel ) {
                        //delete user.channels[index];
                        fullChannel = user.channels[index];
                        user.channels.splice (index, 1);
                        return fullChannel;
                    }
                }
            }

            return fullChannel;

        }
        catch( err ) {
            console.log('ERROR(TalkHub.removeChannelPerUserExist()): ' + err );
            return null;
        }
    }

    function checkFilter( user, owner ) {
        try {

            if( user.id === owner.id )
                return true;

            if( This.argsDlgFilter ) {
                if(This.argsDlgFilter.hasOwnProperty('country')){
                    if( This.argsDlgFilter.country !== user.country) {
                        return false;
                    }
                }

                if(This.argsDlgFilter.hasOwnProperty('gender')) {
                    if( This.argsDlgFilter.gender !== user.gender) {
                        return false;
                    }
                }

                if(This.argsDlgFilter.hasOwnProperty('language')) {
                    if( This.argsDlgFilter.language !== user.language) {
                        return false;
                    }
                }

                if(This.argsDlgFilter.hasOwnProperty('nick')) {
                    var index = user.nick.indexOf( This.argsDlgFilter.nick );
                    if( index < 0 ) {
                        return false;
                    }
                }
            }

            return true;
        }
        catch( err ) {
            console.log('ERROR(TalkHub.checkFilter()): ' + err );
            return false;
        }
    }

    function showMessageDlg( content ) {
        This.commonHub.showInfoDlg(
            This,
            '.talk-hub-dlg-info',
            content,
            function( params ) {});
    }

    // --------------------------------------------------------------- Make person as

    function actionMakePersonAs( user ) {
        try {

            if(!isDefine( user )) return;

            if( user.id === This.userPerClick.id ) {
                showMessageDlg("You can't make friend of yourself :)");
                return;
            }

            function success_call( data, textStatus, jqXHR ) {

                This.showProgressBar( false );

                var parser = JSON.parse(data);

                if( typeof parser === "object" ) {
                    if( parser.param === 1) {
                        showMessageDlg( "This user already in your person's list" );
                    }
                    else {
                        This.commonHub.showMakePersonAsDlg( This, '.show-dlg-make-person-as' );
                    }
                }
                else {
                    showMessageDlg( "We can't get data from server :(" );
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[TalkHub->ctrlPerson.isPersonOfUser()]: ' + errorThrown);

                This.showProgressBar( false );

                showMessageDlg( "We can't get data from server :(" );
            }

            This.commonHub.getHub( ctrlPerson, 'person-hub', function( reference ) {
                if( reference.init ) {
                    ctrlPerson = new th.next.PersonController();
                }

                setTimeout(function() {
                    ctrlPerson.isPersonOfUser( user, This.userPerClick, 'friend', success_call, error_call );
                }, 600 );

            });

            This.showProgressBar( true );
        }
        catch( err ) {
            console.log('ERROR(TalkHub.actionMakePersonAs()): ' + err );
            This.showProgressBar( false );
        }
    }

    return TalkHub;

})( thJQ );

th.next.TalkController = (function($) {
    var This,
        _public = TalkController.prototype;

    function TalkController() {
        This = this;
        this.Initialize();
    }

    _public.Initialize = function() {};

    return TalkController;

})(thJQ);
