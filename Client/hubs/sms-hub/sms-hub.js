/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013, 5/24/13
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    sms-hub.js
 */

var th  = th || {};
th.next = th.next || {};

/*
     var message = {
         "receiver":  dbrequest.receiver,
         "sender":    dbrequest.sender,
         "data":      dbrequest.date,
         "messages": [ dbrequest.message ] { date, from, sms }
     };
 */

th.next.SmsHub = (function($) {
    var This
        ,_public = SmsHub.prototype;

    var statusUI = {
        initialize:             0,
        userPanel:              1,
        messagesPanel:          2
    };

    var uiStatus = statusUI.initialize;

    function SmsHub() {
        This             = this;
        this.cssClassHub = '.sms-hub';
        this.hubStatus   = statusHub.not_active;

        this.menuGoBack     = null;
        this.menuRefresh    = null;

        this.usrTemplate    = null;
        this.msgTemplate    = null;
        this.bubbleLeft     = null;
        this.bubbleRight    = null;

        this.userPerClick    = null;
        this.indexActiveUser = -1;
        this.arraySmsUsers   = [];

        this.feedbackClass = ".sms-hub-dlg-feedback";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            This.commonHub.removeMainMenuItem( This, 'sms');

            this.initHub();

            setUIEvents();
//        var workMenu = $( this.cssClassHub + ' ul.th-ul-main-menu li.mm-main-menu');
//        $(document).on("click", workMenu.selector, function(e) {
//            $( This.cssClassHub + " .th-hub-slide-menu").slideToggle("fast");
//        });
            // template for messages panel
            This.msgTemplate = $('.messages-list-view-item-template' );
            This.bubbleLeft  = $(This.msgTemplate).find('.bubbledLeft.template-item');
            This.bubbleRight = $(This.msgTemplate).find('.bubbledRight.template-item');

            setMainMenu();

            changeUi(statusUI.initialize);

            This.commonHub.setHubPosition( This );

            This.hubStatus = statusHub.initialized;
        }
        catch(err) {
            console.log('ERROR(SmsHub.initHub())' + err );
        }
    };

    _public.socketSendSmsNotification = function( sms) {
        try {
            Socket.emit( socketEvents.socket_sms_notification, sms );
        }
        catch( err ) {
            console.log('ERROR(SmsHub.socketSendSmsNotification()): ' + err );
        }
    };

    // we can get notification from both side: from sender and receiver
    // Example: Rost send message to Cibee
    // Server send notification to Rost and Cibee clients
    // Rost-hub  have icon of Cibee, and have to update this array of sms
    // Cibee-hub have icon of Rost,  and have to update this array of sms
    _public.socketSms_Notification_Completed = function( sms, socket ) {
        try {
            if( This.arraySmsUsers.length === 0 ) {
                This.readAllUsers(true, function(res) {
                    if(!res) return;

                    updateUIWithNewSms( sms, socket, false );
                });
            }
            else {
                updateUIWithNewSms( sms, socket, true );
            }
        }
        catch( err ) {
            console.log('ERROR(SmsHub.socketSms_Notification_Completed()): ' + err );
        }
    };

    _public.readAllUsers = function( refresh, call_back ) {
        try {
            var beforeListTmpl = $('#users-sms-list-view-ctrl li div.sms-list-view-item-template');

            if( uiStatus === statusUI.messagesPanel )  return;

            if( !refresh && This.arraySmsUsers.length !== 0 ) return;

            var user = getUser();
            if(!isDefine( user )) return;

            function success_call( data, textStatus, jqXHR ) {

                This.hubStatus = statusHub.data_loaded;

                This.showProgressBar( false );

                try {
                    if(isJsonData(data)) {
                        var parser = JSON.parse(data);

                        This.indexActiveUser = -1;
                        This.arraySmsUsers   = [];

                        if( typeof parser.param === "object" ) {
                            This.arraySmsUsers = parser.param;

                            for( var i = 0; i < This.arraySmsUsers.length; i++) {
                                bindUsersDataTemplateValues(i, This.arraySmsUsers[i]);
                            }

                            $(This.menuRefresh).removeClass('invisible-item');

                            uiStatus = statusUI.userPanel;

                            sendCallBack(call_back( true ));

                            return;
                        }
                    }
                    This.commonHub.showInfoDlg(
                        This,
                        '.sms-hub-dlg-info',
                        "You don't have any -sms- yet",
                        function( params ) {});

                    sendCallBack(call_back( true ));
                }
                catch(err) {
                    console.log('FAIL-PARSING[SmsHub->ctrlSms.getAllSmsUsers()]: ' + err);

                    This.hubStatus = statusHub.data_loaded_err;

                    sendCallBack(call_back( false ));
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[SmsHub->ctrlSms.getAllSmsUsers()]: ' + errorThrown);

                This.showProgressBar( false );

                This.hubStatus = statusHub.data_loaded_err;

                sendCallBack(call_back( false ));
            }

            if( !ctrlSms ) {
                ctrlSms  = new th.next.SmsController();
            }

            ctrlSms.getAllSmsUsers(user, success_call, error_call);

            This.showProgressBar( true );
        }
        catch( err ) {
            console.log('ERROR(SmsHub.readAllUsers()): ' + err );
            This.showProgressBar( false );
        }
    };

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

    _public.getHubZIndex = function() {
        This.commonHub.getHubZIndex(This);
    };

    _public.isHubOnTop = function() {
        return This.commonHub.isHubOnTop(This);
    };

    // --------------------------------------------------------------- OnClick functions

    function onUser_Click( e ) {
        try {
            e.preventDefault();

            This.userPerClick = null;
            This.userPerClick = getUserPerDataTemplate('sms-list-view-item-template', e);

            showMessagesPerUser();

            changeUserIcon(This.userPerClick);

            changeUi(statusUI.messagesPanel);

            return false;
        }
        catch(err) {
            console.log('ERROR(SmsHub.onUser_Click()): ' + err );
            return false;
        }
    }

    function onBtnSendMessage(e) {
        try {
            e.preventDefault();

            var msgEl   = $('#id-sms-text');
            var message = msgEl.val();

            if( message.length < 1 ) return false;

            var httpRequest = null;
            var userOwner   = getUser();

            function success_call( data, textStatus, jqXHR ) {
                This.showProgressBar(false);

                if(isJsonData(data)) {
                    if( httpRequest!== null ) {
                        httpRequest.message.sms = message;  // clean message with specific characters.
                        This.socketSendSmsNotification(httpRequest);
                    }
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log( 'ERROR[talkHub->ctrlSms.sendSms()]: ' + errorThrown );

                This.showProgressBar(false);
            }

            if( !ctrlSms ) {
                ctrlSms  = new th.next.SmsController();
            }

            setTimeout( function() {
                msgEl.val('');
                httpRequest = ctrlSms.addSms( userOwner, This.userPerClick, message, success_call, error_call );
            }, 600 );

            This.showProgressBar(true);

            return false;
        }
        catch( err ) {
            console.log('ERROR(SmsHub.onBtnSendMessage()): ' + err );
            This.showProgressBar(false);
            return false;
        }
    }

    function onMenuGoBack_Click(e) {

        e.preventDefault();

        changeUi(statusUI.userPanel);

        return false;
    }

    function onMenuRefresh_Click(e) {

        e.preventDefault();

        cleanUsersPanel();

        This.readAllUsers(true, function(res) {});

        return false;
    }

    function getIndexActiveUser() {

        try {
            for( var j = 0; j < This.arraySmsUsers.length; j++ ) {
                var smsTmp = This.arraySmsUsers[j];
                if( smsTmp.userActiveId === This.userPerClick.id ) {
                    return j;
                }
            }

            return -1;
        }
        catch( err ) {
            console.log('ERROR(SmsHub.getIndexActiveUser()): ' + err );
            return -1;
        }
    }

    // --------------------------------------------------------------- Support functions

    function setUIEvents() {
        try {
            $(document).on("click", ".sms-list-view-item-template", onUser_Click );

            $('#id-sms-text').keyup(function(e) { if(e.keyCode === 13) { onBtnSendMessage(e); } });
            $("#id-btn-send-sms").click( onBtnSendMessage );

            //$('#btn-close-sms-hub').click( onCloseSmsHub_Click );
        }
        catch( err ) {
            console.log('ERROR(SmsHub.setUIEvents()): ' + err );
        }
    }

    function updateUIWithNewSms( sms, socket, add_new_message ) {
        try {

            var user = getUser();

            // update ui when 'sender' get message to own client side

            if( sms.sender.id === user.id ) {

                for( var i = 0; i < This.arraySmsUsers.length; i++ ) {
                    if( sms.receiver.id === This.arraySmsUsers[i].userActiveId ) {
                        // we don't need to show signal if owner send message.
                        addNewSmsUI(i, sms, false, add_new_message );
                        break;
                    }
                }
            }

            // update ui when 'receiver' get message to own client side

            else if( sms.receiver.id === user.id ) {

                for( var j = 0; j < This.arraySmsUsers.length; j++ ) {
                    // Rost send message to Cibee from Rost's side
                    // sender.id   = 'Rost'
                    // receiver.id = 'Cibee'
                    // when message come to 'Cibee' client side.
                    // we need to look icon of 'Rost' and this icon
                    // have to be highlight, because this is conversation between
                    // from Cibee side: 'Rost(icon)  / Cibee'
                    // from Rost  side: 'Cibee(icon) / Rost'
                    if( sms.sender.id === This.arraySmsUsers[j].userActiveId ) {
                        addNewSmsUI(j, sms, true, add_new_message);
                        break;
                    }
                }
            }
        }
        catch( err ) {
            console.log('ERROR(SmsHub.updateUIWithNewSms()): ' + err );
        }
    }

    function addNewSmsUI(i, sms, show_signal, add_new_message ) {
        try {
            if( add_new_message ) {
                This.arraySmsUsers[i].messages.push(sms.message);
            }

            if (uiStatus === statusUI.userPanel && show_signal ) {
                This.arraySmsUsers[i].signal = true;
                showSignalForUser(i, true);
            }
            else if( uiStatus === statusUI.messagesPanel ) {

                if( i === This.indexActiveUser ) {
                    bindMessageDataTemplateValues(sms.message);
                }
            }
        }
        catch( err ) {
            console.log('ERROR(SmsHub.addNewSmsUI()): ' + err );
        }
    }

    function cleanUsersPanel() {
        try {
            // clean users
            // DEBUG    var beforeListTmpl = $('#users-sms-list-view-ctrl li div.sms-list-view-item-template');
            $('#users-sms-list-view-ctrl li').remove();
            $('#users-sms-list-view-ctrl').append( '<li>' + This.usrTemplate[0].outerHTML + '</li>' );
            // DEBUG    var afterListTmpl = $('#users-sms-list-view-ctrl li div.sms-list-view-item-template');

            // clean messages.
            if( This.indexActiveUser > -1 ) {
                $('#messages-list-view-ctrl .messages-list-view-item-template .bubbledLeft').remove();
                $('#messages-list-view-ctrl .messages-list-view-item-template .bubbledRight').remove();
            }
        }
        catch( err ) {
            console.log('ERROR(SmsHub.cleanUsersPanel()): ' + err );
        }
    }

    function setMainMenu() {
        try {
            //This.menuGoBack = $('.sms-hub ul.th-ul-main-menu li.mm-back-menu');
           This.menuGoBack = $('.sms-hub ul.th-ul-main-menu li.li_shop');
            $(document).on("click", This.menuGoBack.selector, onMenuGoBack_Click );

            //This.menuRefresh = $('.sms-hub ul.th-ul-main-menu li.mm-refresh-menu');
           This.menuRefresh = $('.sms-hub ul.th-ul-main-menu li.li_params');
            $(document).on("click", This.menuRefresh.selector, onMenuRefresh_Click );
        }
        catch( err ) {
            console.log('ERROR(SmsHub.setMainMenu()): ' + err );
        }
    }

    function bindUsersDataTemplateValues ( index, arg ) {
        try {
            if( !This.usrTemplate ) {
                This.usrTemplate = $('.sms-list-view-item-template.template-item');
            }

            if( This.usrTemplate.length === 0 )
                return;

            var user    = arg.receiver.id !== getUser().id ? arg.receiver: arg.sender;
            var uSignal = arg.receiver.id === getUser().id ? arg.receiver: arg.sender;

            // first init for all this values for future use in code above.
            arg.userActiveId = user.id;
            arg.signal       = false;
            if(uSignal.hasOwnProperty('sms_reading')) {
                arg.signal = uSignal.sms_reading === false ? true : false;
            }
//            if(user.hasOwnProperty('sms_reading')) {
//                arg.signal = user.sms_reading === false ? true : false;
//            }

            // get all information about user in one shot and set it
            // like json format to text value of empty div tag = 'template-data'.

            var jsnUser = JSON.stringify(user);
            $(This.usrTemplate).find('.template-data span').text(jsnUser);

            // set value of user to template.

            $(This.usrTemplate).find('.template-date span').text(arg.date);

            var shortProfile = getStrUserShortProfile(user);

            $(This.usrTemplate).find('.template-nick span').text(user.nick);

            var imgDiv  = $(This.usrTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, user);
            imgDiv[0].setAttribute('title', shortProfile );

            var htmlTemplate = This.usrTemplate[0].outerHTML;
            var itemVisible = htmlTemplate.replace( "template-item", "" );

            var liTemplate = '<li>' + itemVisible + '</li>';
            $("#users-sms-list-view-ctrl").append(liTemplate);

            imgDiv[0].removeAttribute('style');  // remove previous pic.

            if( arg.signal ) {
                showSignalForUser( index, true );
            }
        }
        catch( err ) {
            console.log('ERROR(SmsHub.bindUsersDataTemplateValues()): ' + err );
        }
    }

    function showMessagesPerUser() {
        try {
            if(!isDefine(This.msgTemplate)) return;

            // clean messages.
            if( This.indexActiveUser > -1 ) {
                $('#messages-list-view-ctrl .messages-list-view-item-template .bubbledLeft').remove();
                $('#messages-list-view-ctrl .messages-list-view-item-template .bubbledRight').remove();
            }

            This.indexActiveUser = getIndexActiveUser();

            if( This.indexActiveUser > -1 ) {
                var activeSmsUser = This.arraySmsUsers[This.indexActiveUser];

                if(!isDefine(activeSmsUser)) return;

                // if user-item have 'signal' remove it.
                if( activeSmsUser.signal ) {
                    showSignalForUser(This.indexActiveUser, false );

                    if( !ctrlSms ) {
                        ctrlSms  = new th.next.SmsController();
                    }

                    //var user    = arg.receiver.id !== getUser().id ? arg.receiver: arg.sender;
                    if( getUser().id !== activeSmsUser.receiver.id ) {
                        ctrlSms.changeSmsReadingStatus( activeSmsUser.receiver, activeSmsUser.sender, true );
                    }
                    else {
                        ctrlSms.changeSmsReadingStatus( activeSmsUser.sender, activeSmsUser.receiver, true );
                    }

                    This.arraySmsUsers[This.indexActiveUser].signal = false;

//                    if( getUser().id === activeSmsUser.sender.id ) {
//                        ctrlSms.changeSmsReadingStatus( activeSmsUser.sender, activeSmsUser.receiver, true );
//                    }
//                    else {
//                        ctrlSms.changeSmsReadingStatus( activeSmsUser.receiver, activeSmsUser.sender, true );
//                    }
                }

                for( var i = 0; i < activeSmsUser.messages.length; i++ ) {
                    var msg = activeSmsUser.messages[i];

                    bindMessageDataTemplateValues ( msg );
                }
            }
        }
        catch( err ) {
            console.log('ERROR(SmsHub.showMessagesPerUser()): ' + err );
        }
    }

    function bindMessageDataTemplateValues ( msg ) {
        try {
            var userOwner = getUser();

            var newBabble = msg.from === userOwner.id? This.bubbleLeft : This.bubbleRight;

            newBabble.find('span').text(msg.sms);

            var htmlBubble = newBabble[0].outerHTML;
            var htmlBubbleVisible = htmlBubble.replace( "template-item", "" );

            This.msgTemplate.append(htmlBubbleVisible);

            var elem = document.getElementById('messages-list-view-ctrl');
            elem.scrollTop = elem.scrollHeight;
        }
        catch( err ) {
            console.log('ERROR(SmsHub.bindMessageDataTemplateValues()): ' + err );
        }
    }

    function changeUi( _ui_status ) {
        try {
            var elem;

            uiStatus = _ui_status;

            var pic_element       = $('.sms-hub .user-profile-picture');
            var title_element     = $('.sms-hub .th-article .th-title');
            var sub_title_element = $('.sms-hub .th-article .sub-title');

            switch( uiStatus ) {
                case statusUI.initialize :
                    pic_element.css('display','none');
                   This.menuRefresh.css('display','block');
                   This.menuGoBack.css('display','none');
                    break;

                case statusUI.userPanel :
                    pic_element.css('display','none');

                    //$(This.menuRefresh).removeClass('invisible-item');
                    //$(This.menuGoBack).addClass('invisible-item');
                   This.menuRefresh.css('display','block');
                   This.menuGoBack.css('display','none');

                    title_element.text( 'MESSAGES' );
                    sub_title_element.text( 'Your messages from everyone');

                    $('.users-list').css('display','block');
                    $('.messages-list').css('display','none');
                    break;

                case statusUI.messagesPanel :
                    pic_element.css('display','block');

                    //$(This.menuRefresh).addClass('invisible-item');
                    //$(This.menuGoBack).removeClass('invisible-item');
                   This.menuRefresh.css('display','none');
                   This.menuGoBack.css('display','block');

                    // change title and description of article
                    title_element.text( This.userPerClick.nick );
                    sub_title_element.text( getStrUserShortProfile(This.userPerClick) );

                    $('.users-list').css('display','none');
                    $('.messages-list').css('display','block');

                    // scroll to bottom
                    elem = document.getElementById('messages-list-view-ctrl');
                    elem.scrollTop = elem.scrollHeight;
                    break;
            }
        }
        catch( err ) {
            console.log('ERROR(SmsHub.changeUi()): ' + err );
        }
    }

    function changeUserIcon( user ) {
        try {
            var imgDiv = $('.sms-hub .user-profile-picture');
            This.commonHub.setUserIcon( imgDiv, user );
//            if(user.gender === 'female') {
//                imgDiv.removeClass('user-image-male').addClass('user-image-female');
//            }
//            else {
//                imgDiv.removeClass('user-image-female').addClass('user-image-male');
//            }
//            if( user.pic ) {
//                imgDiv[0].setAttribute("style", "background-image: url("+ decodeURIComponent(user.pic) + ");");
//            }
        }
        catch( err ) {
            console.log('ERROR(SmsHub.changeUserIcon()): ' + err );
        }
    }

    function showSignalForUser( userIndex, bShow ) {
        try {
            var userArray = $("#users-sms-list-view-ctrl li .sms-list-view-item-template");
            var signalUser = userArray[userIndex + 1];  // one 'li' is template

            if( bShow)
                $(signalUser).find('.signal-item').css('display', 'block');
            else
                $(signalUser).find('.signal-item').css('display', 'none');
        }
        catch( err ) {
            console.log('ERROR(showSignalForUser()): ' + err );
        }
    }

    return SmsHub;

})(thJQ);

th.next.SmsController = (function($) {
    var This
        ,_public = SmsController.prototype;

    function SmsController() {
        This = this;

        Initialize();
    }

    function Initialize() {}

    // --------------------------------------------------------------- Public functions

    _public.getAllSmsUsers = function( userOwner, success_call, error_call) {
        try {
            if(!isDefine( userOwner )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            //var userId = getUserId(userOwner);

            var req       = 'get-all-sms-users';
            var request = {
                dbcall:        'db-find',
                dbcollection:  'messages',
                dbrequest:      { '$or': [ { "receiver.id": userOwner.id }, { "sender.id":   userOwner.id  } ] }
            };

            //var receiver_request = { '$and': [ { "receiver.id": receiver_id }, { "sender.id":   sender_id  } ] };
            //var sender_request   = { '$and': [ { "sender.id":   receiver_id },   { "receiver.id": sender_id  } ] };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );

        }
        catch(err) {
            console.log('ERROR[SmsHub->SmsController.getAllSmsUsers()]: ' + err);
        }
    };

    _public.changeSmsReadingStatus = function(userSender, userReceiver, status) {
        try {
            if(!isDefine( userSender )) return;
            if(!isDefine( userReceiver )) return;
            if(!isDefine( status )) return;

            var userSenderId   = getUserProfile(userSender);
            var userReceiverId = getUserProfile(userReceiver);

            var req     = 'change-sms-reading-status';
            var request = {
                sender:     userSenderId,
                receiver:   userReceiverId,
                status:     status
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function success_call( data, textStatus, jqXHR ) {},
                function error_call ( jqXHR, textStatus, errorThrown ) {
                    console.log( 'ERROR[SmsHub->ctrlSms.changeSmsReadingStatus()]' );
                } );
        }
        catch(err) {
            console.log('ERROR[SmsHub->SmsController.changeSmsReadingStatus()]: ' + err);
        }
    };

    _public.addSms = function( userSender, userReceiver, message, success_call, error_call ) {
        try {
            if(!isDefine( userSender )) return null;
            if(!isDefine( userReceiver )) return null;
            if(!isDefine( message )) return null;
            if(!isDefine( success_call )) return null;
            if(!isDefine( error_call )) return null;

            var userSenderId = getUserProfile(userSender);
            if( isDefine(userSenderId.pic) && userSenderId.pic !== '' )  {
                userSenderId.pic = encodeURIComponent(userSenderId.pic);
            }

            var userReceiverId = getUserProfile(userReceiver);
            if( isDefine(userReceiverId.pic) && userReceiverId.pic !== '') {
                userReceiverId.pic = encodeURIComponent(userReceiverId.pic);
            }

            var format_msg = encodeURIComponent(removeLineBreaks(message ));

            var req     = 'add-sms';
            var request = {
                sender:     userSenderId,
                receiver:   userReceiverId,
                date:       getCurrentDate(),
                message: {
                    from:   userSenderId.id,
                    sms:    format_msg,
                    date:   getCurrentDate()
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );

            return request;
        }
        catch(err) {
            console.log('ERROR[SmsController.addSms()]: ' + err);
            return null;
        }
    };

    // --------------------------------------------------------------- Support functions

    return SmsController;

})(thJQ);
