/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    person-hub.js
 */

var th  = th || {};
th.next = th.next || {};

th.next.PersonHub = (function($) {
    var This
        , _public = PersonHub.prototype;

    function PersonHub() {
        This             = this;
        this.cssClassHub = '.person-hub';

        this.hubStatus   = statusHub.not_active;

        this.indexActiveUser = -1;
        this.arrayPersons    = [];

        this.usrTemplate     = null;
        this.userPerClick    = null;
        this.activeAnimation = null;
        this.statusList      = null;

        this.feedbackClass = ".person-hub-dlg-feedback";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            if( !isDefine(ctrlPerson)) {
                ctrlPerson  = new th.next.PersonController();
            }

            This.commonHub.removeMainMenuItem( This, 'friends');

            this.initHub();

            //$('#btn-close-person-hub').click( onClosePersonHub_Click );

            $(document).on("click", ".person-list-view-item-template", onUser_Click );

            $(document).on("click", ".person-list-view-item-template li.th-person-menu-item", onMenuItem_Click );

            feelSelectStatusList();

            This.commonHub.setHubPosition( This );

            This.hubStatus = statusHub.initialized;
        }
        catch(err) {
            console.log('ERROR(PersonHub.Initialize()): ' + err);
        }
    };

    _public.readAllPersons = function( user ) {
        try {
            if(!isDefine( user )) return;

            cleanUsersPanel();

            This.statusList.val("all");

            function success_call( data, textStatus, jqXHR ) {

                This.showProgressBar( false );

                This.hubStatus = statusHub.data_loaded;

                try {
                    if(isJsonData(data)) {
                        var parser = JSON.parse(data);

                        This.indexActiveUser = -1;
                        This.arrayPersons    = null;
                        This.arrayPersons    = [];

                        if( typeof parser.param === "object" ) {
                            This.arrayPersons = parser.param;

                            for( var i = 0; i < This.arrayPersons.length; i++) {
                                bindPersonDataTemplateValues( i, This.arrayPersons[i] );
                            }

                            return;
                        }
                    }

                    This.commonHub.showInfoDlg(
                        This,
                        '.person-hub-dlg-info',
                        "You don't have any -friends- yet",
                        function( params ) {});
                }
                catch(err) {
                    console.log('FAIL-PARSING[PersonHub->ctrlPerson.readAllPersons()]: ' + err);

                    This.hubStatus = statusHub.data_loaded_err;
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[PersonHub->ctrlPerson.readAllPersons()]: ' + errorThrown );

                This.showProgressBar(false);

                This.hubStatus = statusHub.data_loaded_err;
            }

            setTimeout( function() {
                ctrlPerson.readPersons( user, success_call, error_call );
            }, 600 );

            This.showProgressBar(true);
        }
        catch(err) {
            console.log('ERROR(PersonHub.readAllPersons()): ' + err);
        }
    };

    _public.personNotificationCompleted = function( msg ) {
        try {
//            var msg = {
//                'user':     _This.userPerClick,
//                'person':    user,
//                'status':   Self.statusPerson,
//                'msg':      'Hey, ' + user.nick + ' make you ' + Self.statusPerson
//            };

            var fromWho = msg.user.gender === 'male' ? "Make him " : "Make here ";

            var ret = confirm(msg.msg + "\n" + fromWho + msg.status + " too?");
            if( !ret ) {
                msg.status = 'fellow';
            }

            ctrlPerson.addPerson( getUser(),
                                  msg.person,
                                  msg.status,
                                  function ( data, textStatus, jqXHR ) {},
                                  function error_call ( jqXHR, textStatus, errorThrown ) {
                                      console.log('ERROR[TalkHub->ctrlPerson.addPerson()]: ' + errorThrown );
                                  });
        }
        catch(err) {
            console.log('ERROR(PersonHub.personNotificationCompleted()): ' + err);
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

    // --------------------------------------------------------------- OnClick functions

    function onPersonStatus_Select(e ) {
        try {
            e.preventDefault();

            var prsStatus = $(this).val();

            cleanUsersPanel();

            for( var i = 0; i < This.arrayPersons.length; i++) {
                var tmpPerson = This.arrayPersons[i];

                if( tmpPerson.status === prsStatus ) {
                    bindPersonDataTemplateValues( i, This.arrayPersons[i] );
                }
                else if( prsStatus === 'all' ) {
                    bindPersonDataTemplateValues( i, This.arrayPersons[i] );
                }
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(PersonHub.onPersonStatus_Select()): ' + err);
            return false;
        }
    }

    function onMenuItem_Click(e) {

        try {
            e.preventDefault();

            var action = e.target.getAttribute('data-action' );

            This.userPerClick = null;
            This.userPerClick = getUserPerDataTemplate('person-list-view-item-template', e);

            switch( action ) {
                case 'sms':
                    This.commonHub.showSmsDlg( This, '.show-dlg-sms', function() {} );
                    break;
                case 'talk':
                    This.showProgressBar( true );
                    ctrlPerson.getSocketIDByUserID( This.userPerClick, function( arg ) {
                        This.showProgressBar( false );
                        if( arg === null ) {
                            This.commonHub.showInfoDlg(
                                This,
                                '.person-hub-dlg-info',
                                "You can't talk with " + This.userPerClick.nick + ". This person offline :(",
                                function( params ) {});
                        }
                        else {
                            This.userPerClick.socket_id = arg;
                            hubTalk.buildPrivateChannel( getUser(), This.userPerClick );
                        }
                    });
                    break;
                case 'profile':
                    This.commonHub.showProfileDlg( This, '.show-dlg-profile', function() {} );
                    break;
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(PersonHub.onUser_Click()): ' + err);
            return false;
        }
    }

    function onUser_Click( e ) {
        try {

            e.preventDefault();

            var personItem = $(this);

            This.userPerClick    = null;
            This.userPerClick    = getUserPerDataTemplate('person-list-view-item-template', e);
            This.indexActiveUser = getIndexActiveUser();

            function setActiveAnimation() {
                This.activeAnimation      = personItem;
                This.activeAnimation.id   = This.userPerClick.id;
                This.activeAnimation.user = This.userPerClick;
            }

            if( This.activeAnimation !== null ) {

                // just close active open item.
                animatePersonItem( This.activeAnimation, false, function() {

                    if( This.activeAnimation.id !== This.userPerClick.id ) {

                        // and open another clicked item.
                        animatePersonItem( personItem, true, function() {
                            setActiveAnimation();
                        });
                    }
                    else {
                        This.activeAnimation = null;
                    }
                });
            }
            else {
                animatePersonItem( personItem, true, function() {
                    setActiveAnimation();
                });
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(PersonHub.onUser_Click()): ' + err);
            return false;
        }
    }

    function onUserAction_Click ( e ) {
        try {
            e.preventDefault();

            var userPerClick = getUserPerDataTemplate( 'person-list-view-item-template', e);
            var userOwner    = getUser();
            var action       = e.target.className.split(' ')[0];

            // li for remove from UI.
            var template = $(this).closest('.person-list-view-item-template');
            var liTemplate = template[0].parentNode;

            switch( action ) {
                case 'remove':
                    break;
                case 'new':
                    break;
                case 'send-sms':
                    break;
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(PersonHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

    function getIndexActiveUser() {

        try {
            for( var j = 0; j < This.arrayPersons.length; j++ ) {
                var personTmp = This.arrayPersons[j];
                if( personTmp.id === This.userPerClick.id ) {
                    return j;
                }
            }

            return -1;
        }
        catch(err) {
            console.log('ERROR(PersonHub.getIndexActiveUser()): ' + err);
            return -1;
        }
    }

    function cleanUsersPanel() {
        try {
            // clean users

            $('#person-list-view-ctrl li').remove();
//          $('#person-list-view-ctrl').append( '<li>' + This.usrTemplate[0].outerHTML + '</li>' );
        }
        catch(err) {
            console.log('ERROR(PersonHub.cleanUsersPanel()): ' + err);
        }
    }

    function feelSelectStatusList() {
        try {
            This.statusList = $(".th-select-person-status");
            This.statusList.change( onPersonStatus_Select );

            // set first value for 'all'
            var firstVal = document.createElement('option');
            firstVal.innerHTML = 'all';
            firstVal.value = 'all';
            This.statusList[0].appendChild(firstVal);

            // set another values
            for(var key in personStatus ) {
                if( personStatus.hasOwnProperty(key)) {
                    var value = personStatus[key];

                    var opt = document.createElement('option');
                    opt.innerHTML = key;
                    opt.value = key;

                    This.statusList[0].appendChild(opt);
                }
            }
        }
        catch(err) {
            console.log('ERROR(PersonHub.feelSelectStatusList()): ' + err);
        }
    }

    function bindPersonDataTemplateValues ( index, arg ) {

        try {
            if( !This.usrTemplate) {
                var tmplScript   = $('#person-item-template').html();
                This.usrTemplate = $( tmplScript );
            }

            if( This.usrTemplate.length == 0 )  return;

            var user = arg.person;

            // get all information about user in one shot and set it
            // like json format to text value of empty div tag = 'template-data'.

            var jsnUser = JSON.stringify(user);
            $(This.usrTemplate).find('.template-data span').text(jsnUser);

            // set value of user to template.

            $(This.usrTemplate).find('.template-date span').text(arg.date);

            $(This.usrTemplate).find('.template-nick span').text(user.nick);

            var imgDiv  = $(This.usrTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, user);

            //var shortProfile = getStrUserShortProfile(user);

            var liTemplate = '<li>' + This.usrTemplate[0].outerHTML+ '</li>';
            $("#person-list-view-ctrl").append(liTemplate);

            imgDiv[0].removeAttribute('style');  // remove previous pic.
        }
        catch(err) {
            console.log('ERROR(PersonHub.bindUsersDataTemplateValues()): ' + err);
        }
    }

    function animatePersonItem( personItem, bShow, callback ) {

        try {
            if( bShow ) {
                personItem.animate({
                    width: '76%',
                    height: '90px'
                }, 'fast', function() {

                    var nick_element = $(this).find('.template-nick span');

                    nick_element.css( 'font-size', '12px');
                    nick_element.text(getStrUserShortProfile(This.userPerClick));

                    $(this).find('.btn-circle').css('display', 'none');

                    $(this)
                        .find('.template-image')
                        .css('width',  '54px')
                        .css('height', '54px');

                    $(this).find('.th-person-menu').css('display', 'block');

                    sendCallBack(callback);
                });
            }
            else {
                personItem.find('.th-person-menu').css('display', 'none');

                personItem.animate({
                    width: '78px',
                    height: '69px'
                }, 'fast', function() {

                    var nick_element = $(this).find('.template-nick span');

                    nick_element.text(personItem.user.nick);
                    nick_element.css( 'font-size', '13px');

                    $(this).find('.btn-circle').css('display', 'block');

                    $(this)
                        .find('.template-image')
                        .css('width',  '45px')
                        .css('height', '45px');

                    sendCallBack(callback);
                });
            }
        }
        catch(err) {
            console.log('ERROR(PersonHub.animatePersonItem()): ' + err);
        }
    }

    return PersonHub;

})(thJQ);

th.next.PersonController = (function($) {
    var This
        ,_public = PersonController.prototype;

    function PersonController() {
        This = this;

        this.listPerson = null;

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {};

    _public.readPersons = function( userOwner, success_call, error_call) {
        try {
            if(!isDefine( userOwner )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            var userId = getUserId(userOwner);

            var req     = 'get-all-persons-per-user';
            var request = {
                user: userId
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(PersonController.readPersons()): ' + err);
        }
    };

    _public.addPerson = function( userOwner, userForAdd, userStatus, success_call, error_call ) {
        try {
            if(!isDefine( userOwner )) return;
            if(!isDefine( userForAdd )) return;
            if(!isDefine( userStatus )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            var userId = getUserId(userOwner);
            if( isDefine(userOwner.pic)) {
                userId.pic = encodeURIComponent(userId.pic);
            }

            var userAdd = getUserProfile(userForAdd);
            if( isDefine(userAdd.socket_id )) {
                delete userAdd.socket_id;
            }
            if( isDefine(userAdd.pic)) {
                userAdd.pic = encodeURIComponent(userAdd.pic);
            }

            var currentDate = getCurrentDate();

            var req     = 'add-person-per-user';
            var request = {
                user: userId,
                date: currentDate,
                person: {
                    person:  userAdd,
                    status:  userStatus,
                    date:    currentDate
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(PersonController.AddPerson()): ' + err);
        }
    };

    _public.removePerson = function( userOwner, userForRemove, success_call, error_call ) {
        try {
            if(!isDefine( userOwner )) return;
            if(!isDefine( userForRemove )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

//            var userId       = getUserId(userOwner);
//            var removePerson = getUserProfile(userForRemove);

            var req     = 'remove-person-per-user';
            var request = {
                user:   {id: userOwner.id},
                person: {id: userForRemove.id}
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(PersonController.removePerson()): ' + err);
        }
    };

    _public.isPersonOfUser = function( userOwner, userForCheck, userStatus, success_call, error_call ) {
        try {
            if(!isDefine( userOwner )) return;
            if(!isDefine( userForCheck )) return;
            if(!isDefine( userStatus )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            var req     = 'is-person-of-user';
            var request = {
                user:   {id:userOwner.id},
                person: {id:userForCheck.id}
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(PersonController.isPersonOfUser()): ' + err);
        }
    };

    _public.isPersonOfUserCallback = function( userOwner, userForCheck, userStatus, call_back) {
        try {
            if(!isDefine( userOwner )) return;
            if(!isDefine( userForCheck )) return;
            if(!isDefine( userStatus )) return;

            var req     = 'is-person-of-user';
            var request = {
                user:   {id:userOwner.id},
                person: {id:userForCheck.id}
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {
                    var parser = JSON.parse(data);

                    if( typeof parser === "object" ) {
                         sendCallBack(call_back(parser.param));
                    }
                    else {
                        sendCallBack(call_back(-1));
                    }
                },
                function( jqXHR, textStatus, errorThrown ) {
                    sendCallBack(call_back(-1));
                } );
        }
        catch(err) {
            console.log('ERROR(PersonController.isPersonOfUser()): ' + err);
        }
    };

    _public.getSocketIDByUserID = function( userForCheck, call_back ) {
        try {
            if(!isDefine( userForCheck )) return;

            var req     = 'get-socket-id-by-user-id';
            var request = {
                user:   userForCheck
            };

            var ajaxData = JSON.stringify(request);

            //ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function success_call( data, textStatus, jqXHR ) {
                    var parser = JSON.parse(data);
                    if( typeof parser === "object" ) {
                        if( parser.param !== null ) {
                            call_back(parser.param);
                            return;
                        }
                    }
                    call_back(null);
                },
                function error_call ( jqXHR, textStatus, errorThrown ) {
                    This.showProgressBar( false );
                    call_back(null);
                });
        }
        catch(err) {
            console.log('ERROR(PersonController.isPersonOfUser()): ' + err);
        }
    };

    // --------------------------------------------------------------- Separate implementation

    _public.getPersons = function( userOwner, callback ) {
        try {

            if( This.listPerson !== null ) {
                sendCallBack(callback());
                return;
            }

            function success_call( data, textStatus, jqXHR ) {
                try {
                    if(isJsonData(data)) {
                        var parser = JSON.parse(data);

                        if( typeof parser.param === "object" ) {
                            This.listPerson = [];
                            This.listPerson = parser.param;
                        }
                    }
                    sendCallBack(callback);
                }
                catch(err) {
                    console.log('FAIL-PARSING[PersonHub->ctrlPerson.getPersons()]: ' + err);
                    sendCallBack(callback);
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[PersonHub->ctrlPerson.getPersons()]: ' + errorThrown );

                sendCallBack(callback);
            }

            if(!isDefine( userOwner )) return;

            var userId = getUserId(userOwner);

            var req     = 'get-all-persons-per-user';
            var request = {
                user: userId
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(PersonController.getPersons()): ' + err);
        }
    };

    // --------------------------------------------------------------- Support functions

    return PersonController;

})(thJQ);
