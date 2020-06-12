/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    ignore-hub.js
 */

var th  = th || {};
th.next = th.next || {};

th.next.IgnoreHub = (function($) {
    var This,
        _public = IgnoreHub.prototype;

    function IgnoreHub() {
        This = this;
        this.cssClassHub = '.ignore-hub';

        this.hubStatus    = statusHub.not_active;
        this.userPerClick = null;
        this.usrTemplate  = null;

       this.feedbackClass = ".ignore-hub-dlg-feedback";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            This.commonHub.removeMainMenuItem( This, 'ignores');

            this.initHub();

            This.commonHub.setHubPosition( This );

            setUIEvents();

            This.hubStatus = statusHub.initialized;
        }
        catch(err) {
            console.log('ERROR(IgnoreHub.Initialize())' + err );
        }
    };

    _public.readAllIgnores = function() {
        try {
            var user = getUser();
            if(!isDefine( user ))
                return;

            function success_call( data, textStatus, jqXHR ) {
                This.showProgressBar( false );

                This.hubStatus = statusHub.data_loaded;

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( typeof parser.param === "object" ) {

                        ctrlIgnore.listIgnore = parser.param;

                        for( var i = 0; i < ctrlIgnore.listIgnore.length; i++) {
                            bindDataTemplateValues(i, ctrlIgnore.listIgnore[i]);
                        }

                        return;
                    }
                }

                This.commonHub.showInfoDlg( This,
                                            '.ignore-hub-dlg-info',
                                            "You don't have any -ignores- yet",
                                            function( params ) {});
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[IgnoreHub->ctrlIgnore.readIgnores()]: ' + errorThrown );

                This.showProgressBar( false );

                This.hubStatus = statusHub.data_loaded_err;
            }

            if( !ctrlIgnore ) {
                ctrlIgnore  = new th.next.IgnoreController();
                This.showProgressBar( true );
                ctrlIgnore.readIgnores( user, success_call, error_call );
            }
            else {
                if( ctrlIgnore.listIgnore.length === 0 ) {
                    //alert("You don't have any -ignores- yet");
                    This.commonHub.showInfoDlg( This,
                                                '.ignore-hub-dlg-info',
                                                "You don't have any -ignores- yet",
                                                function( params ) {});
                }
                else {
                    This.refreshUI();
                }
            }
        }
        catch(err) {
            console.log('ERROR(IgnoreHub.readAllIgnores())' + err );
        }
    };

    _public.refreshUI = function() {
        try {
            $("#ignore-list-view-ctrl li").remove();

            for( var i = 0; i < ctrlIgnore.listIgnore.length; i++) {
                bindDataTemplateValues(i, ctrlIgnore.listIgnore[i]);
            }
        }
        catch(err) {
            console.log('ERROR(IgnoreHub.refreshUI())' + err );
        }
    }

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

   function onIgnoreMainMenu_Click( event ) {
      try {
         event.preventDefault();

         var el  = event.target;
         var fun = el.getAttribute( 'data-action' );
         var arg = '.' + el.getAttribute( 'data-template-dlg' );

         if( typeof This[fun] === 'function' ) {
            if( fun === 'readAllIgnores') {

               $("#ignore-list-view-ctrl li").remove();  // clean ui

               ctrlIgnore = null;   // clean data

               This[fun]();
            }
         }

         return false;
      }
      catch(err) {
         console.log('IgnoreHub.onIgnoreMainMenu_Click(): ' + err );
         return false;
      }
   }

    function onUserAction_Click ( e ) {
        try {
            e.preventDefault();

            This.userPerClick = getUserPerDataTemplate( 'ignore-list-view-item-template', e);
            var userOwner    = getUser();
            var action       = e.target.title;

            // li for remove from UI.
            var template = $(this).closest('.ignore-list-view-item-template');
            var liTemplate = template[0].parentNode;

            var index = $( "#ignore-list-view-ctrl > li" ).index( this );

            switch( action ) {
                case 'remove':
                    actionRemoveUser( userOwner, liTemplate, This.userPerClick );
                    break;
                case 'sms':
                    break;
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(IgnoreHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

   function setUIEvents() {
      try {

         $(document).on("click", ".ignore-hub .th-user-actions li", onUserAction_Click );

         $(document).on("click", ".ignore-hub ul.th-ul-main-menu li", onIgnoreMainMenu_Click );
      }
      catch( err ) {
         console.log('ERROR(IgnoreHub.setUIEvents()): ' + err );
      }
   }

    function actionRemoveUser( user, liTemplate, remove_user ) {
        try {
            function success_call( data, textStatus, jqXHR ) {
                var parser = JSON.parse(data);

                if( typeof parser === "object" ) {
                    $(liTemplate).remove(); // remove <li/> from UI.
                    ctrlIgnore.removeFromArray( remove_user );
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[IgnoreHub->ctrlIgnore.removeIgnore()]: ' + errorThrown);
            }

            if( !ctrlIgnore ) {
                ctrlIgnore  = new th.next.IgnoreController();
            }

            ctrlIgnore.removeIgnore( user, This.userPerClick, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(IgnoreHub.actionRemoveUser())' + err );
        }
    }

    function bindDataTemplateValues ( index, arg ) {
        try {

            if( !isDefine(arg)) {
                return;
            }

            if( !This.usrTemplate) {
                var tmplScript   = $('#ignore-item-template').html();
                This.usrTemplate = $( tmplScript );
            }

            if( This.usrTemplate.length == 0 )
                return;

            var user = arg.ignore;
            var date = arg.ignoreDate;
            var info = arg.ignoreWhy;

            var jsnUser = JSON.stringify(user);
            $(This.usrTemplate).find('.template-data span').text(jsnUser);

            $(This.usrTemplate).find('.template-date span').text(date);

            var shortProfile = getStrUserShortProfile(user);
            $(This.usrTemplate).find('.template-text span').text(shortProfile);

            $(This.usrTemplate).find('.template-nick span').text(user.nick);

            var imgDiv  = $(This.usrTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, user);

            var htmlTemplate = This.usrTemplate[0].outerHTML;
            var itemVisible = htmlTemplate.replace( "template-item", "" );
            $("#ignore-list-view-ctrl").append('<li>' + itemVisible + '</li>');

            imgDiv[0].removeAttribute('style');  // remove previous pic.
        }
        catch(err) {
            console.log('ERROR(IgnoreHub.bindDataTemplateValues())' + err );
        }
    }

    return IgnoreHub;

})(thJQ);

th.next.IgnoreController = (function($) {
    var This
        ,_public = IgnoreController.prototype;

    function IgnoreController() {
        This = this;

        this.listIgnore = [];

        this.Initialize();
    }

    _public.Initialize = function() {};

    _public.addIgnore = function( userOwner, userForIgnore, success_call, error_call ) {
        try {

            if(!isDefine( userOwner )) return;
            if(!isDefine( userForIgnore )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            var userId        = getUserId(userOwner);
            var ignoreProfile = getUserProfile(userForIgnore);
//            if( isDefine(ignoreProfile.pic) && ignoreProfile.pic !== '') {
//              ignoreProfile.pic = encodeURIComponent(ignoreProfile.pic);
//            }
            var ignoreDate    = getCurrentDate();

            var req     = 'add-ignore';
            var request = {
                user: userId,
                ignores: [
                    {
                        ignore:     ignoreProfile,
                        ignoreDate: ignoreDate,
                        ignoreWhy:  'why ignore explanation values'
                    }
                ]
            };

            // add ignore person to current session.

            This.listIgnore.push(request.ignores[0]);

           if( isDefine(ignoreProfile.pic) && ignoreProfile.pic !== '') {
              request.ignores[0].ignore.pic = encodeURIComponent(ignoreProfile.pic);
           }

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(IgnoreController.AddIgnoreUser())' + err );
        }
    };

    _public.readIgnores = function( userOwner, success_call, error_call) {
        try {
            if(!isDefine( userOwner )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            //var userId = getUserId(userOwner);

            var req     = 'read-ignores';
            var request = {
                user: {id:userOwner.id}
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(IgnoreController.readIgnores())' + err );
        }
    };

    _public.getAllIgnores = function( userOwner, callback ) {
        try {

            if( This.listIgnore.length > 0)
                return;

            if(!isDefine( userOwner ))
                return;

            //var userId = getUserId(userOwner);
            //delete userId.pic;

            var req = 'read-ignores';

            var request = {
                user: {id:userOwner.id}
            };

            var ajaxData = JSON.stringify(request);

            function success_call( data, textStatus, jqXHR ) {
                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( typeof parser.param === "object" ) {
                        This.listIgnore = parser.param;

                        sendCallBack(callback( This.listIgnore ));

                        return;
                    }
                }

                sendCallBack(callback( -1 ));
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[IgnoreHub->ctrlIgnore.getAllIgnores()]: ' + errorThrown );

                sendCallBack(callback( -1 ));
            }

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(IgnoreController.readIgnores())' + err );
        }
    };

    _public.removeIgnore = function( userOwner, userForRemove, success_call, error_call ) {
        try {
            if(!isDefine( userOwner )) return;
            if(!isDefine( userForRemove )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            var userId = getUserId(userOwner);
            var removeUser = getUserProfile(userForRemove);
            if( isDefine(removeUser.pic) && removeUser.pic !== '') {
               removeUser.pic = encodeURIComponent(removeUser.pic);
            }

            var req     = 'remove-ignore';
            var request = {
                user: userId,
                removeUser: removeUser
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(IgnoreController.removeIgnore())' + err );
        }
    };

    _public.removeFromArray = function( remove_user ) {
        try {
            for( var i = 0; i < This.listIgnore.length; i++ ) {
                var item = This.listIgnore[i].ignore;
                if( item.id === remove_user.id ) {
                    This.listIgnore.splice(i, 1 );
                    break;
                }
            }
        }
        catch(err) {
            console.log('ERROR(IgnoreController.removeFromArray())' + err );
        }
    };

    _public.isUserIgnore = function( _user ) {
        try {
            for( var i = 0; i < This.listIgnore.length; i++ ) {
                var item = This.listIgnore[i].ignore;
                if( item.id === _user.id ) {
                    return true;
                }
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(IgnoreController.isUserIgnore())' + err );
            return false;
        }
    };

    return IgnoreController;

})(thJQ);




























