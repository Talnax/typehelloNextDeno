/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013, 5/26/13
 * product: Web-Communicator ( TypeHello ) Channel2Channel U2U
 * file:    common-hub.js
 */

var statusHub = {
    not_active:       0,  // level of constructor
    initialized:      1,  // _public.Initialize() - complete
    active:           2,  // all event competed - initHub(), socketOpenChat_Completed()...
    data_load:        3,  // start data load process
    data_loaded:      4,  // all data loaded - loadProfile(), readAllIgnores(), readAllUsers()...
    data_loaded_err:  5   // status if during load data getting error
};

var th = th || {};
th.next = th.next || {};

th.next.CommonHub = (function($){
    var This
        , _public = CommonHub.prototype;

    function CommonHub( targetClass ) {
        This = this;

        this.profileTemplate      = null;
        this.smsTemplate          = null;
        this.ignoreTemplate       = null;
        this.personAsTemplate     = null;
        this.perThemeTemplate     = null;
        this.perFilterTemplate    = null;
        this.feedbackTemplate     = null;
        this.wallItemTemplate     = null;
        this.wallSubItemTemplate  = null;
        this.commentItemTemplate  = null;
        this.pinItemTemplate      = null;
        this.noteItemTemplate     = null;
        this.infoTemplate         = null;
        this.settingsTemplate     = null;

        this.targetClass       = targetClass;

        this.InitializeHub(this);
    }

    // --------------------------------------------------------------- Public functions

    _public.InitializeHub = function() {
        try {
            var cssClass = this.targetClass.cssClassHub;

            this.targetClass.headerProgress     = $( cssClass + ' .th-common-progress-bar');
            this.targetClass.headerTopMenu      = $( cssClass + ' .th-header .th-top-menu');
            this.targetClass.slideMainMenu      = $( cssClass + ' .th-header .th-slide-menu');
            this.targetClass.toolTipFooter      = $( cssClass + ' .th-footer');
            this.targetClass.toolBar            = $( cssClass + ' .th-ul-main-menu');
            this.targetClass.toolBarItem        = $( cssClass + ' .th-ul-main-menu li');

            // COMMENT, because we upload template of main-menu for any hab, mean when we load hub menu doesn't exist YET !!!
            //this.targetClass.slideMainMenuItem  = $( cssClass + ' .th-header .th-slide-menu .th-slide-menu-item span');
            //this.targetClass.slideMainMenuItem  = $( cssClass + " .th-slide-menu-ul li.th-slide-menu-item");
            this.targetClass.slideMainMenuItem = null;
        }
        catch(err) {
            console.log('ERROR(CommonHub.Initialize())' + err );
        }
    };

    _public.getHub = function( hubObject, hubName, callback ) {
        try {
            var reference = {
                //hub: hubObject,
                init: true
            };

            if( !isDefine(hubObject)) {
                loadHub( hubName, function(res) {
                    if( res === 'ok' ) {
                        sendCallBack(callback(reference));
                    }
                });
            }
            else {
                reference.init = false;
                sendCallBack(callback(reference));
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.getHub())' + err );
        }
    };

    // --------------------------------------------------------------- Common Hub functions

    _public.initHub = function(_This) {
        try {

            raiseToHighestZIndex(_This.cssClassHub);

           $(document).on("click", _This.cssClassHub, function(e) {
              e.preventDefault();

              /*
              var zindeX = $(this).css('z-index');
              var zIndeX = $(this).zIndex();
              var zIndex = $(_This.cssClassHub).css("z-index" );
              var zHub = parseInt($(_This.cssClassHub).css("z-index" ));

              if( zHub < zIndex  ) {
                 zIndex += 1;
                 $(_This.cssClassHub).css("z-index", zIndex );
              }
               */

              //setTimeout(function(){
                 //if( hubPtr ) {
                    raiseToHighestZIndex(_This.cssClassHub);
                 //}
              //}, 1000);

              return false;
           });

            // toolbar

            _This.toolBarItem.mouseenter(function(e) {
                var tooltip = e.target.getAttribute('data-tip');
                This.showPanelToolTip( _This, tooltip, true );
            });

            _This.toolBar.mouseleave(function() {
                This.showPanelToolTip( _This, '', false );
            });

            // slide main menu show and hide

            _This.headerTopMenu.mouseenter(function() {
                if(!isDefine(getUser())) return;
                _This.slideMainMenu.css( 'display', 'block');
            });

            _This.slideMainMenu.mouseleave(function() {
                if(!isDefine(getUser())) return;
                _This.slideMainMenu.css( 'display', 'none');
                //This.showPanelToolTip( _This, '', false );
               $(this).find('.th-slide-menu-separator-subset').css( 'display', 'none');
            });

           _This.slideMainMenu.find('.th-slide-menu-separator .th-slide-menu-separator-text').mouseenter(function() {
              $(this).css('color', 'black');
              $(this).parent().find('.th-slide-menu-separator-subset').css( 'display', 'block');
            });

           _This.slideMainMenu.find('.th-slide-menu-separator').mouseleave(function() { // rgb( 45, 45, 45)
              $(this).find('.th-slide-menu-separator-text').css('color', 'white');
              //$(this).find('.th-slide-menu-separator-subset').css( 'display', 'none');
           });

            // slide main menu clicks

            var elSlideMainMenuItem = _This.cssClassHub + " .th-slide-menu-ul li.th-slide-menu-item";

            _This.slideMainMenuItem  = $( elSlideMainMenuItem );

            $(document).on( "click", elSlideMainMenuItem, _This.onMainMenuAction_Click );

            // slide main menu show-tooltip

            _This.slideMainMenuItem.mouseenter(function(e) {
               if(!isDefine(getUser())) return;

               var el = $(e.target).closest('li.th-slide-menu-item');
               var tooltip = el.attr('data-tip' );

               This.showPanelToolTip( _This, tooltip, true );
            });

            // hide hub

            $(document).on("click",
                _This.cssClassHub + " .th-header .btn-circle",
                function() {
                    _This.hubShow( false );
                });

            $( _This.cssClassHub ).draggable({handle:".drag-panel"});
        }
        catch(err) {
            console.log('ERROR(CommonHub.initHub())' + err );
        }
    };

    _public.showPanelToolTip = function( _This, txt_tooltip, show ) {
        try {
            if( show ) {
                _This.toolTipFooter.css( 'display', 'block' );
                _This.toolTipFooter.find('.footer-tool-tip').html(txt_tooltip);
            }
            else {
                _This.toolTipFooter.css( 'display', 'none' );
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.showPanelToolTip())' + err );
        }
    };

    _public.getHubZIndex = function(_This ) {
        try {
            var zHub = parseInt($(_This.cssClassHub).css("z-index" ));
            return zHub;
        }
        catch(err) {
            console.log('ERROR(CommonHub.getHubZIndex())' + err );
            return -1;
        }
    };

    _public.isHubOnTop = function(_This ) {
        try {
            var zHub = parseInt($(_This.cssClassHub).css("z-index" ));

            return zHub === zIndex ? true: false;

            /*
            if( zHub === zIndex ) {
                return true;
            }

            return false;
            */
        }
        catch(err) {
            console.log('ERROR(CommonHub.getHubZIndex())' + err );
            return false;
        }
    };

    _public.onMainMenuAction_Click = function( _This, e) {
        try {
            _This.slideMainMenu.css( 'display', 'none');

            var el = $(e.target).closest('li.th-slide-menu-item');
            var action = el.attr('data-action' );

            var fns = {
                  'pin':        actionPin
                , 'news':       actionNews
                , 'note':       actionNote
                , 'comment':    actionComment
                , 'talk' :      actionTalk
                , 'html-analysis': actionHtmlAnalysis
                //, 'settings':   actionSettings
                , 'sms':        actionSms
                , 'ignores':    actionIgnores
                , 'friends':    actionPerson
                , 'profile':    actionProfile
                , 'search':     actionSearch
                , 'wall':       actionWall
                , 'notice':     actionNotice
            };

            var hubPtr = null;
            if( fns.hasOwnProperty(action)) {
                fns[action]( e, function(pHub) {
                   hubPtr = pHub;
                } );
            }
            else if( action === 'feedback' ) {
                This.showFeedbackDlg(_This, _This.feedbackClass );
            }
            else if( action === 'settings' ) {
                This.showSettingsDlg(_This, _This.settingsClass );
            }

            // show dialog-z-index above of all.

            setTimeout(function(){
              if( hubPtr ) {
                 raiseToHighestZIndex(hubPtr.cssClassHub);
              }
            }, 1000);
        }
        catch(err) {
            console.log('ERROR(CommonHub.onMainMenuAction_Click())' + err );
        }
    };

    _public.fromHubToHub = function( _This, fromHub, objArgs ) {
//        try {
//            var i = 0;
//        }
//        catch(err) {
//            console.log('ERROR(CommonHub.fromHubToHub())' + err );
//        }

    };

    _public.hubShow = function( _This, bShow ) {
        try {

            //console.log('CommonHub.hubShow(hubOpening): ' + hubOpening);

            if(bShow) {

                $(_This.cssClassHub).css('display', 'block');

                //raiseToHighestZIndex(_This.cssClassHub);
//                if( zIndex != 0 ) {
//                    zIndex += 1;
//                    $(_This.cssClassHub).css("z-index", zIndex );
//                }

                if( _This.cssClassHub !== '.hub-center') {

                    _This.statusShow = true;
                    hubOpening++;

                    //console.log('CommonHub.hubShow(hubOpening++): ' + hubOpening);
                }

                if( hubCenter ) {
                    hubCenter.hubShow( false );
                }
            }
            else {

                $(_This.cssClassHub).css('display', 'none');

                hubOpening--;
                _This.statusShow = false;

                //console.log('CommonHub.hubShow(hubOpening--): ' + hubOpening);

                if( hubOpening === 0 ) {

                    if( !hubCenter ) {

                        loadHub( 'hub-center', function(res) {
                            if( res === 'ok' ) {
                                if( !hubCenter ) {
                                    hubCenter = new th.next.HubCenter();
                                }
                                hubCenter.hubShow( hubOpening > 0 ? false : true );  // this is correct don't touch
                            }
                        });
                    }
                    else {
                        hubCenter.hubShow( true );
                    }
                }
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.hubShow())' + err );
        }
    };

    _public.hubRemove = function( _This ) {
        try {
            var thisHub       = $(_This.cssClassHub);
            var parentTalkHub = thisHub[0].parentNode;

            parentTalkHub.removeChild(thisHub[0]);

            //_This = null;
        }
        catch(err) {
            console.log('ERROR(CommonHub.hubRemove())' + err );
        }
    };

    _public.setScrollHubPosition = function( _This ) {
        try {
            // http://stackoverflow.com/questions/9431050/difference-between-window-width-vs-document-width
            // http://stackoverflow.com/questions/3437786/how-to-get-web-page-size-browser-window-size-screen-size-in-a-cross-browser-wa

            var posTOP  = $(window).scrollTop();
            var posLEFT = $(window).scrollLeft();

            var posVertical   = posTOP  + yPosition;
            var posHorizontal = posLEFT + xPosition;

            $( _This.cssClassHub).css( 'top',  posVertical   + 'px');
            $( _This.cssClassHub).css( 'left', posHorizontal + 'px');

            //xPosition += xDelta;
            //yPosition += yDelta;

            // re-init after login-hub

            xPosition = xStart;
            yPosition = yStart;

            /*
            var winWidth = $(window).width();
            var docWidth = $(document).width();

            var w = window.innerWidth;
            var h = window.innerHeight;

            return;
            */
        }
        catch(err) {
            console.log('ERROR(CommonHub.setHubPosition())' + err );
        }
    };

    _public.setHubPosition = function( _This ) {
        try {
            var posVertical   = yPosition;
            var posHorizontal = xPosition;

            $( _This.cssClassHub).css( 'top',  posVertical   + 'px');
            $( _This.cssClassHub).css( 'left', posHorizontal + 'px');

            xPosition += xDelta;
            yPosition += yDelta;
        }
        catch(err) {
            console.log('ERROR(CommonHub.setHubPosition())' + err );
        }
    };

    _public.setUserIcon = function( $image_element, user ) {
        try {

            $image_element[0].removeAttribute('style');

            $image_element
                .removeClass('user-image-undefine')
                .removeClass('user-image-female')
                .removeClass('user-image-male');

            if(user.gender === 'female') {
                $image_element
                    //.removeClass('user-image-male')
                    .addClass('user-image-female');
            }
            else if(user.gender === 'male') {
                $image_element
                    //.removeClass('user-image-female')
                    .addClass('user-image-male');
            }
            else {
                $image_element
                    //.removeClass('user-image-female')
                    //.removeClass('user-image-male')
                    .addClass('user-image-undefine');
            }

            if( isDefine( user.pic ) && user.pic !== '' ) {
                $image_element[0].setAttribute("style", "background-image: url("+ decodeURIComponent(user.pic) + ");");
                //return;
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.setUserIcon())' + err );
        }
    };

    _public.removeMainMenuItem = function( _This, _item_name ) {
        try {
            var itemScript = $('#th-main-menu-template').html();
            var elUl = $( itemScript).closest('ul');
            var itemRemove = $(elUl).find('li[data-action="' + _item_name + '"]');
            //$(elUl).find('li[data-action="' + _item_name + '"]').remove();
           if(itemRemove.length > 0) {
              itemRemove.remove();
           }
            $( _This.cssClassHub + " .th-slide-menu").append(elUl);
        }
        catch(err) {
            console.log('ERROR(CommonHub.removeItemFromMainMenu())' + err );
        }
    };

    // --------------------------------------------------------------- Support functions

    function privateChatRoutine( _This ) {
        try {
            _This.showProgressBar( true );
        }
        catch(err) {
            console.log('ERROR(CommonHub.privateChatRoutine())' + err );
            _This.showProgressBar( false );
        }
    }

    function ignoreRoutine( _This ) {
        try {
            function success_call( data, textStatus, jqXHR ) {
                _This.showProgressBar( false );

                if( hubIgnore ) {
                    hubIgnore.refreshUI();
                }

                var parser = JSON.parse(data);
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[TalkHub->ctrlIgnore.addIgnore()]: ' + errorThrown);
                _This.showProgressBar( false );
            }

            This.getHub( ctrlIgnore, 'ignore-hub', function( reference ) {
                if( reference.init ) {
                    ctrlIgnore  = new th.next.IgnoreController();
                }

                setTimeout(function() {
                    ctrlIgnore.addIgnore( getUser(), _This.userPerClick, success_call, error_call );
                }, 600 );
            });

            _This.showProgressBar( true );
        }
        catch(err) {
            console.log('ERROR(CommonHub.ignoreRoutine())' + err );
            _This.showProgressBar( false );
        }
    }

    function sendSmsRoutine( _This, message ) {
        try {
            var httpSmsRequest;

            function success_call( data, textStatus, jqXHR ) {
                _This.showProgressBar( false );

                if(isJsonData(data)) {
                    Socket.emit( socketEvents.socket_sms_notification, httpSmsRequest );
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[CommonHub->ctrlSms.sendSms()]: ' + errorThrown);

                _This.showProgressBar( false );
            }

            This.getHub( ctrlSms, 'sms-hub', function( reference ) {
                if( reference.init ) {
                    ctrlSms = new th.next.SmsController();
                }

                setTimeout(function() {
                    httpSmsRequest = ctrlSms.addSms( getUser(), _This.userPerClick, message, success_call, error_call );
                }, 600 );
            });

            _This.showProgressBar( true );
        }
        catch(err) {
            console.log('ERROR(CommonHub.showSmsDlg())' + err );
            _This.showProgressBar( false );
        }
    }

    function bindFullProfile ( profileNode, user ) {
        try {
            if(!isDefine(user))     return;
            if(!isDefine(profileNode))     return;

            profileNode.find('.prf-nick').text(user.nick);

            profileNode.find('.prf-lng').text(user.language);

            profileNode.find('.prf-country').text(user.country);

            //profileNode.find('.prf-birth').text(cutUserBirth(user.birth));
            //getPanelElement('.prf-age').text(isDefine(user.age) ? user.age : '45');

            profileNode.find('.prf-gender').text(user.gender);

            var txtVal = isDefine(user.city ) ? (user.city.length > 0 ?  user.city : '...') : '...';
            profileNode.find('.prf-city').text( decodeURIComponent(txtVal ));

            txtVal = isDefine( user.hobbies ) ? (user.hobbies.length > 0 ?  user.hobbies : '...') : '...';
            profileNode.find('.prf-hobbies').text( decodeURIComponent(txtVal ));

            txtVal = isDefine( user.interests ) ? (user.interests.length > 0 ?  user.interests : '...') : '...';
            profileNode.find('.prf-interests').text( decodeURIComponent(txtVal ));

            //$('#th-profile-interests').text(isDefine(user.interests) ? decodeURIComponent(user.interests) : '');

            /*
            txtVal = isDefine( user.about_me ) ? (user.about_me.length > 0 ?  user.about_me : '...') : '...';
            profileNode.find('.prf-about-me').text( decodeURIComponent(txtVal ));

             txtVal = isDefine( user.profession ) ? (user.profession.length > 0 ?  user.profession : '...') : '...';
             profileNode.find('.prf-profession').text( decodeURIComponent(txtVal ));

             txtVal = isDefine( user.expertise) ? (user.expertise.length > 0 ?  user.expertise : '...') : '...';
             profileNode.find('.prf-expertise').text( decodeURIComponent(txtVal ));
            */

            var elPic = profileNode.find('.prf-picture');

            This.setUserIcon( elPic, user );
        }
        catch(err) {
            console.log('ERROR(TalkHub.bindFullProfile())' + err );
        }
    }

    function makePersonAsRoutine( _This ) {
        try {

            var Self = this;

            function sendPersonNotification() {
                try {

                    _This.showProgressBar( true );

                   var userCheck = getUserProfile(_This.userPerClick);
                   if( isDefine(userCheck.pic)) {
                      userCheck.pic = encodeURIComponent(userCheck.pic);
                   }

                    var req     = 'is-user-online';
                    var request = {
                        user: userCheck
                    };

                    var ajaxData = JSON.stringify(request);

                    // check is new-friend online?

                    ajaxCall( pathServer + req, req + '=' + ajaxData,
                        function( data, textStatus, jqXHR ) {
                            _This.showProgressBar( false );

                            var parser = JSON.parse(data);

                            if( typeof parser === "object" ) {

                                if( !parser.param ) {

                                    // if offline make current user 'Self.statusPerson' of new-friend

                                    setTimeout(function() {
                                        ctrlPerson.addPerson(
                                            _This.userPerClick,
                                            getUser(),
                                            Self.statusPerson,
                                            function( data, textStatus, jqXHR ) {_This.showProgressBar( false );},
                                            function( jqXHR, textStatus, errorThrown ) {_This.showProgressBar( false );})
                                    }, 600 );
                                }
                                else {

                                    // if 'new-friend' online, send notification.

                                    var user = getUser();

                                    var msg = {
                                        'user':     _This.userPerClick,
                                        'person':   user,
                                        'status':   Self.statusPerson,
                                        'msg':      'Hey, ' + user.nick + ' make you ' + Self.statusPerson
                                    };

                                    Socket.emit( socketEvents.socket_person_notification, msg );
                                }
                            }
                        },
                        function( jqXHR, textStatus, errorThrown ) {
                            _This.showProgressBar( false );
                        });

                }
                catch(err) {
                    console.log('ERROR(CommonHub.sendUserNotification())' + err );
                    _This.showProgressBar( false );
                }
            }

            function success_call( data, textStatus, jqXHR ) {
                _This.showProgressBar( false );

                var parser = JSON.parse(data);
                if( typeof parser === "object" ) {
                    if(hubPerson ) {
                        hubPerson.readAllPersons(getUser());
                    }

                    sendPersonNotification();
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[TalkHub->ctrlPerson.addPerson()]: ' + errorThrown );

                _This.showProgressBar( false );

                alert( "Server error for add person :(");
            }

            var statusPerson = _This.commonHub.personAsTemplate.find('.th-dlg-person-status').val();
            this.statusPerson = statusPerson;

            This.getHub( ctrlPerson, 'person-hub', function( reference ) {
                if( reference.init ) {
                    ctrlPerson = new th.next.PersonController();
                }

                setTimeout(function() {
                    ctrlPerson.addPerson( getUser(), _This.userPerClick, statusPerson, success_call, error_call );
                }, 600 );
            });

            _This.showProgressBar( true );
        }
        catch(err) {
            console.log('ERROR(CommonHub.makePersonAsRoutine())' + err );
            _This.showProgressBar( false );
        }
    }

    // --------------------------------------------------------------- Action functions

    function actionPin(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubPin,'pin-hub', function( reference ) {
                if( reference.init ) {
                    hubPin = new th.next.PinHub();
                }

                hubPin.hubShow( true );
            });

           sendCallBack(callback(hubPin));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionPin())' + err );
           sendCallBack(callback(hubPin));
        }
    }

    function actionNews(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubNews,'news-hub', function( reference ) {
                if( reference.init ) {
                    hubNews  = new th.next.NewsHub();
                }

                hubNews.hubShow( true );
            });

            sendCallBack(callback(hubNews));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionNews())' + err );
            sendCallBack(callback(hubNews));
        }
    }

    function actionNote(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubNote,'note-hub', function( reference ) {
                if( reference.init ) {
                    hubNote = new th.next.NoteHub();
                }

                hubNote.hubShow( true );
            });

            sendCallBack(callback(hubNote));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionNote())' + err );
            sendCallBack(callback(hubNote));
        }
    }

    function actionComment(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubComment,'comment-hub', function( reference ) {
                if( reference.init ) {
                    hubComment = new th.next.CommentHub();
                }

                hubComment.hubShow( true );
            });

           sendCallBack(callback(hubComment));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionComment())' + err );
           sendCallBack(callback(hubComment));
        }
    }

    function actionTalk(e, callback) {
        try {
            e.preventDefault();

            // open 'public' chat.
            var url = document.URL;
            var channel = {
                'url':  url,
                'type': channelType._public,
                'kind': channelKind.text
            };

            This.getHub( hubTalk,'talk-hub', function( reference ) {
                if( reference.init ) {
                    hubTalk = new th.next.TalkHub();
                    //hubTalk.socketOpenChat( getUser(), channel );
                }

                hubTalk.hubShow( true );
            });

           sendCallBack(callback(hubTalk));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionTalk())' + err );
           sendCallBack(callback(hubTalk));
        }
    }

//    function actionSettings(e) {
//        try {
//            e.preventDefault();
//
//            return false;
//        }
//        catch(err) {
//            console.log('ERROR(CommonHub.actionSettings())' + err );
//            return false;
//        }
//    }

    function actionNotice(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubNotice, 'notice-hub', function( reference ) {
                if( reference.init ) {
                    hubNotice  = new th.next.NoticeHub();
                }

                hubNotice.hubShow( true );
            });

           sendCallBack(callback(actionNotice));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionNotice())' + err );
           sendCallBack(callback(actionNotice));
        }
    }

    function actionSms(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubSms, 'sms-hub', function( reference ) {
                if( reference.init ) {
                    hubSms = new th.next.SmsHub();
                    hubSms.readAllUsers(true, function(res) {
                        hubSms.hubShow(true);
                    });
                }

                hubSms.hubShow(true);
            });

           sendCallBack(callback(hubSms));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionSms())' + err );
           sendCallBack(callback(hubSms));
        }
    }

   function actionHtmlAnalysis(e, callback) {
      try {
         e.preventDefault();

         This.getHub( hubHtmlAnalysis, 'html-analysis-hub', function( reference ) {
            if( reference.init ) {
               hubHtmlAnalysis = new th.next.htmAnalysis();
            }

            hubHtmlAnalysis.hubShow(true);
         });

         sendCallBack(callback(hubHtmlAnalysis));
      }
      catch(err) {
         console.log('ERROR(CommonHub.actionHtmlAnalysis())' + err );
         sendCallBack(callback(hubSms));
      }
   }

    function actionIgnores(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubIgnore, 'ignore-hub', function( reference ) {
                if( reference.init ) {
                    hubIgnore = new th.next.IgnoreHub();
                }

                hubIgnore.readAllIgnores();

                hubIgnore.hubShow(true);
            });

           sendCallBack(callback(hubIgnore));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionIgnores())' + err );
           sendCallBack(callback(hubIgnore));
        }
    }

    function actionPerson(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubPerson, 'person-hub', function( reference ) {
                if( reference.init ) {
                    hubPerson  = new th.next.PersonHub();
                }

                if( hubPerson.hubStatus !== statusHub.data_loaded) {
                    hubPerson.readAllPersons(getUser());
                }

                hubPerson.hubShow(true);
            });

           sendCallBack(callback(hubPerson));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionPerson())' + err );
           sendCallBack(callback(hubPerson));
        }
    }

    function actionProfile(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubProfile, 'profile-hub', function( reference ) {
                if( reference.init ) {
                    hubProfile  = new th.next.ProfileHub();
                }

                hubProfile.hubShow( true );
                hubProfile.showFullProfile(getUser());
            });

           sendCallBack(callback(hubProfile));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionProfile())' + err );
           sendCallBack(callback(hubProfile));
        }
    }

    function actionSearch(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubSearch, 'search-hub', function( reference ) {
                if( reference.init ) {
                    hubSearch  = new th.next.SearchHub();
                }

                hubSearch.hubShow( true );
            });

           sendCallBack(callback(hubSearch));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionSearch())' + err );
           sendCallBack(callback(hubSearch));
        }
    }

    function actionWall(e, callback) {
        try {
            e.preventDefault();

            This.getHub( hubWall, 'wall-hub', function( reference ) {
                if( reference.init ) {
                    hubWall = new th.next.WallHub();
                }

                hubWall.hubShow( true );
            });

           sendCallBack(callback(hubWall));
        }
        catch(err) {
            console.log('ERROR(CommonHub.actionWall())' + err );
           sendCallBack(callback(hubWall));
        }
    }

    // ------------------------------------------------------------- show Dialogs

    _public.showProgressBar = function( _This, bShow ) {
        try {
            if( bShow ) {
                _This.headerTopMenu.css( 'display', 'none' );
                _This.headerProgress.css( 'display', 'block' );
            }
            else {
                _This.headerProgress.css( 'display', 'none' );
                _This.headerTopMenu.css( 'display', 'block' );
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.showProgressBar())' + err );
        }
    };

    _public.showProfileDlg = function(_This, classContainer, _callback ) {
        try {
            function success_call( data, textStatus, jqXHR ) {
                _This.showProgressBar( false );

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( parser.param.length > 0 ) {

                        var objInit = initTemplateDlg( _This,
                                                        classContainer,
                                                        'profileTemplate',
                                                        '#th-dlg-template-profile' );

                        bindFullProfile ( _This.commonHub.profileTemplate, parser.param[0] );
                    }
                    else {
                        alert( "Profile of user doesn't exist :(");
                    }
                }
                else {
                    alert( "We can't get data :(");
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log( 'ERROR[TalkHub->ctrlTalk.getFullProfile()]: ' + errorThrown );
                alert( "We can't get data :(");
                _This.showProgressBar( false );
            }

            This.getHub( ctrlProfile, 'profile-hub', function( reference ) {
                if( reference.init ) {
                    ctrlProfile  = new th.next.ProfileController();
                }

                setTimeout(function() {
                    ctrlProfile.getFullProfile( _This.userPerClick, success_call, error_call );
                    sendCallBack( _callback( null ));
                }, 600 );
            });

            _This.showProgressBar( true );
        }
        catch(err) {
            console.log('ERROR(CommonHub.showProfileDlg()): ' + err );
        }
    };

    _public.showSettingsDlg = function(_This, classContainer ) {
        try {

            var objInit = initTemplateDlg(  _This,
                                            classContainer,
                                            'settingsTemplate',
                                            '#th-dlg-template-settings' );

            //_This.commonHub.personAsTemplate.find('.th-template-nick').html(_This.userPerClick.nick);
        }
        catch(err) {
            console.log('ERROR(CommonHub.showSettingsDlg()): ' + err );
        }
    };

    _public.showInfoDlg = function(_This, classContainer, _content, _callback ) {
        try {
            var objInit = initTemplateDlg( _This,
                                            classContainer,
                                            'infoTemplate',
                                            '#th-dlg-template-info' );
            //if( objInit.firstCall ) {}

            _This.commonHub.infoTemplate.find('.th-template-info').html( _content );
        }
        catch(err) {
            console.log('ERROR(CommonHub.showInfoDlg())' + err );
        }
    };

    _public.showFeedbackDlg = function( _This, classContainer ) {
        try {

            function sendFeedbackRoutine( txt_feedback) {

                var feed_back = encodeURIComponent(removeLineBreaks(txt_feedback));

                var req     = 'feedback';
                var request = {
                    dbcall:        'db-insert',
                    dbcollection:  'feedback',
                    dbrequest:      {
                        'user':     getUserId(getUser()),   //  getShortProfile(getUser()),
                        'feedback': feed_back
                    }
                };

                var ajaxData = JSON.stringify(request);

                setTimeout(function() {
                    ajaxCall( pathServer + req, req + '=' + ajaxData,
                              function( data, textStatus, jqXHR ){_This.showProgressBar( false );},
                              function( jqXHR, textStatus, errorThrown ){_This.showProgressBar( false );} );
                }, 600);
            }

            var objInit = initTemplateDlg( _This,
                                            classContainer,
                                            'feedbackTemplate',
                                            '#th-dlg-template-feedback' );

            if( objInit.firstCall ) {
                // send feedback and close dialog
                _This.commonHub.feedbackTemplate.find('.th-btn-send-feedback').click( function() {
                    var elMsg =   _This.commonHub.feedbackTemplate.find('.th-dlg-feedback-text');
                    var message = elMsg.val();

                    if(message.length < 1 ) {
                        alert('Hey type some feedback :)')
                    }
                    else {
                        elMsg.val('');
                        sendFeedbackRoutine( message );
                        showTemplateDialog( false, objInit.showDialog, _This.commonHub.feedbackTemplate, objInit.hubCloseBtn );
                        _This.showProgressBar( true );
                    }
                });
            }

            _This.commonHub.feedbackTemplate
                .find('.th-template-nick')
                .html( getUser().nick );
        }
        catch(err) {
            console.log('ERROR(CommonHub.showFeedbackDlg())' + err );
        }
    };

    _public.showWallItemDlg = function( _This, classContainer, callback ) {
        try {

            if(!isDefine(ctrlWall) ) {
                ctrlWall = new th.next.WallController();
            }

            var objInit = initTemplateDlg( _This,
                                            classContainer,
                                            'wallItemTemplate',
                                            '#th-dlg-template-wall-item' );

            var wallTempate = _This.commonHub.wallItemTemplate;

            var dlgTl = wallTempate.find('.th-dlg-title');
            var elMsg = wallTempate.find('.th-dlg-wall-item-text');
            var elTtl = wallTempate.find('.th-dlg-wall-item-title');
            var elLnk = wallTempate.find('.th-dlg-wall-item-link');
            var elImg = wallTempate.find('.th-dlg-wall-item-image-link');
            var elFil = wallTempate.find('.th-btn-div-fill-content');

            // clear all text-fields

            elMsg.val('');
            elTtl.val('');
            elLnk.val('');
            elImg.val('');

            // don't show title and link if we want to add only post

            var showElt = 'block';
            dlgTl.html('ADD POST TO THE WALL');
            showElt = 'block';

            elTtl.closest('.th-dlg-data').css('display', showElt );
            elLnk.closest('.th-dlg-data').css('display', showElt );
            elImg.closest('.th-dlg-data').css('display', showElt );
            elFil.css('display', showElt);

            if( objInit.firstCall ) {
                wallTempate.find('.th-btn-fill-wall-post-by-web-content').click( function() {
                    elTtl.val(document.title);
                    elLnk.val(document.URL);
                    elMsg.val(getMetaContent('description'));
                });

                // send add wall-item and close dialog
                wallTempate.find('.th-btn-add-wall-post').click( function() {
                    var _message = elMsg.val();
                    var _title   = elTtl.val();
                    var _link    = elLnk.val();
                    var _img     = elImg.val();

                    if(_message.length < 1 ) {
                        This.showInfoDlg( _This,
                                        '.wall-hub-dlg-info',
                                        'Hey type some post :)',
                                        function( params ) {});
                    }
                    else {

                        var _status = wallTempate.find('.th-dlg-wall-item-select-person-status').val().trim();
                        var _language = wallTempate.find('.th-dlg-wall-item-select-language').val().trim();

                        var post = {
                            title: _title,
                            msg: _message,
                            link: _link,
                            img: _img,
                            status: _status,
                            language: _language
                        };

                        ctrlWall.addWallPost( post, _This, callback);

                        showTemplateDialog( false,
                                            objInit.showDialog,
                                            _This.commonHub.wallItemTemplate,
                                            objInit.hubCloseBtn );
                    }
                });
            }

            _This.commonHub.wallItemTemplate.find('.th-template-nick').html( getUser().nick );

        }
        catch(err) {
            console.log('ERROR(CommonHub.showWallItemDlg())' + err );
        }
    };

    _public.showSubPostWallItemDlg = function( _This, classContainer, callback ) {
        try {

            if(!isDefine(ctrlWall) ) {
                ctrlWall = new th.next.WallController();
            }

            var objInit = initTemplateDlg( _This,
                                            classContainer,
                                            'wallSubItemTemplate',
                                            '#th-dlg-template-wall-item' );

            var dlgTl = _This.commonHub.wallSubItemTemplate.find('.th-dlg-title');
            var elMsg = _This.commonHub.wallSubItemTemplate.find('.th-dlg-wall-item-text');
            var elTtl = _This.commonHub.wallSubItemTemplate.find('.th-dlg-wall-item-title');
            var elLnk = _This.commonHub.wallSubItemTemplate.find('.th-dlg-wall-item-link');
            var elImg = _This.commonHub.wallSubItemTemplate.find('.th-dlg-wall-item-image-link');
            var elFil = _This.commonHub.wallSubItemTemplate.find('.th-btn-div-fill-content');

            // clear all text-fields

            elMsg.val('');
            elTtl.val('');
            elLnk.val('');
            elImg.val('');

            var showElt = 'none';

            dlgTl.html('ADD COMMENT TO THE POST');

            elTtl.closest('.th-dlg-data').css('display', showElt );
            elLnk.closest('.th-dlg-data').css('display', showElt );
            elImg.closest('.th-dlg-data').css('display', showElt );
            elFil.css('display', showElt);

            if( objInit.firstCall ) {
                _This.commonHub.wallSubItemTemplate.find('.th-btn-fill-wall-post-by-web-content').click( function() {
                    elTtl.val(document.title);
                    elLnk.val(document.URL);
                    elMsg.val(getMetaContent('description'));
                });

                // send add wall-item and close dialog
                _This.commonHub.wallSubItemTemplate.find('.th-btn-add-wall-post').click( function() {
                    var _message = elMsg.val();
                    var _title   = elTtl.val();
                    var _link    = elLnk.val();
                    var _img     = elImg.val();

                    if(_message.length < 1 ) {
                        This.showInfoDlg( _This,
                            '.wall-hub-dlg-info',
                            'Hey type some post :)',
                            function( params ) {});
                    }
                    else {

                        ctrlWall.addWallSubPost( _message, _This, callback);

                        showTemplateDialog( false,
                            objInit.showDialog,
                            _This.commonHub.wallSubItemTemplate,
                            objInit.hubCloseBtn );
                    }
                });
            }

            _This.commonHub.wallSubItemTemplate.find('.th-template-nick').html( getUser().nick );

        }
        catch(err) {
            console.log('ERROR(CommonHub.showSubPostWallItemDlg())' + err );
        }
    };

    _public.showPinItemDlg = function( _This, classContainer, _action, _pinData, callback ) {
        try {

            if(!isDefine(ctrlPin) ) {
                ctrlPin = new th.next.PinController();
            }

            function initDlg(_pinData, tmplPin) {
               try {

                  var elDlg = {
                     dlgTl:  tmplPin.find('.th-dlg-title'),
                     pinBtn: tmplPin.find('.th-btn-add-pin-post'),
                     elMsg:  tmplPin.find('.th-dlg-pin-item-text'),
                     elTtl:  tmplPin.find('.th-dlg-pin-item-title'),
                     elLnk:  tmplPin.find('.th-dlg-pin-item-link'),
                     elTag:  tmplPin.find('.th-dlg-pin-item-tags'),
                     elImg:  tmplPin.find('.th-dlg-pin-item-image-link')
                  };

                  // show or hide some elements

                  if( _action === 'edit' ) {
                     elDlg.dlgTl.html('EDIT THE PIN');
                     elDlg.pinBtn.text('UPDATE');

                     elDlg.elTtl.val(_pinData.title);
                     elDlg.elLnk.val(_pinData.link);
                     elDlg.elMsg.val(_pinData.msg);
                     elDlg.elImg.val(_pinData.pic);
                     elDlg.elTag.val(_pinData.tags);
                  }
                  else if (_action === 'create') {
                     elDlg.dlgTl.html('CREATE NEW PIN');
                     elDlg.pinBtn.text('CREATE');

                     // dialog's value

                     elDlg.elTtl.val(document.title.length > 0 ? document.title : '');
                     elDlg.elLnk.val(document.URL.length > 0 ? document.URL : '');
                     elDlg.elTag.val('');
                     elDlg.elMsg.val('');
                     elDlg.elMsg.val(getMetaContent('description'));
                     elDlg.elImg.val('');
                  }

                  return elDlg;
               }
               catch(err) {
                  console.log('ERROR(CommonHub.showPinItemDlg().initDlg())' + err );
                  return null;
               }
            }

            var objInit = initTemplateDlg( _This, classContainer,
                                           'pinItemTemplate',
                                           '#th-dlg-template-pin-item' );

            var tmplPin = _This.commonHub.pinItemTemplate;

            var elDlg = initDlg(_pinData, tmplPin);

           if( elDlg === null ) {
              return sendCallBack(This.pinCallBack( true, null ));
           }

           // cache all values before click

           This.elDlg       = elDlg;
           This.pinAction   = _action;
           This.pinCallBack = callback;
           This.pinInstance = _This;

            if( objInit.firstCall ) {

               This.elDlg.pinBtn.click( function(event) {

                  event.preventDefault();

                    var _message = This.elDlg.elMsg.val();
                    var _title   = This.elDlg.elTtl.val();
                    var _link    = This.elDlg.elLnk.val();
                    //var _tag     = elDlg.elTag.val();
                    //var _img     = elDlg.elImg.val();

                    if( _title.length < 1 || _message.length < 1 || _link.length < 1 ) {
                        alert("Hey type some note content :)");
                    }
                    else {

                       showTemplateDialog(false, objInit.showDialog,
                                          _This.commonHub.pinItemTemplate,
                                          objInit.hubCloseBtn );

                        var pin = {
                            id:    isDefine(_pinData) ? _pinData.id: '',
                            msg:    _message,
                            title:  _title,
                            link:   _link,
                            pic:    This.elDlg.elImg.val(),
                            tags:   This.elDlg.elTag.val()
                        };

                       _This.showProgressBar( true );

                       var fun = This.pinAction === 'edit' ? 'updatePin' : 'addPin';

                       ctrlPin[fun]( pin, function( err, _recorded_pin ) {
                          _This.showProgressBar( false );
                          return sendCallBack(This.pinCallBack( err, _recorded_pin ));
                       });
                    }

                  return false;
                });
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.showFeedbackDlg())' + err );
           return sendCallBack(This.pinCallBack( true, null ));
        }
    };

    _public.showNoteItemDlg = function( _This, classContainer, _action, _noteData, callback ) {
        try {

            function showHidePerAction() {
                try {

                    var showElt = 'none';
                    if( _action === 'edit' ) {
                        dlgTl.html('EDIT THE NOTE');
                        ntBtn.text('UPDATE');

                        setNoteStatusImage(_noteData.status);

                        elTtl.val(_noteData.title);
                        elTag.val(_noteData.tags);
                        elMsg.val( " " + _noteData.msg + "\n\n");
                        ntSct.val(_noteData.status);

                        // set cursor

                        elMsg.focus();
                        elMsg[0].setSelectionRange(elMsg.val().length, 0);
                        //elMsg.focus().val(elMsg.val());
                    }
                    else if (_action === 'create') {
                        dlgTl.html('CREATE NEW NOTE');
                        showElt = 'block';
                        ntBtn.text('ADD');
                        elMsg.val(" "); // start from 1-position

                        setNoteStatusImage(note_status.define);

                        elMsg.focus();
                       elMsg[0].setSelectionRange(0, 0);
                        //elMsg.focus().val("");
                    }

                }
                catch ( err ) {
                    console.log('ERROR(NoteHub.showNoteItemDlg.showHidePerAction()): ' + err );
                }
            }

            function setNoteStatusImage( _note_status ) {
                try {
                    var elImage = $('.th-dlg-note-item .template-status-icon');

                    elImage
                        .removeClass('note-status-define')
                        .removeClass('note-status-progress')
                        .removeClass('note-status-complete');

                    var ci =
                        _note_status === note_status.define   ? 'note-status-define' :
                        _note_status === note_status.progress ? 'note-status-progress' : 'note-status-complete';

                    elImage.addClass(ci);
                }
                catch(err) {
                    console.log('ERROR(NoteHub.showNoteItemDlg.setNoteStatusImage()): ' + err );
                }
            }

            function updateNote() {
                try {
                    var _message = elMsg.val().trim();
                    var _title   = elTtl.val();
                    var _status  = ntSct.val();
                    var _tag     = elTag.val();
                    var _link    = "";  // elLnk.val();
                    var _img     = "";  // elImg.val();

                    if( _title.length < 1 || _message.length < 1 ) {
                        alert("Hey type some note content :)");
                        return false;
                    }
                    else {
                        var note = {
                            id:    isDefine(This.noteData) ? This.noteData.id: '',
                            msg:    _message,
                            status: _status,
                            title:  _title,
                            link:   _link,
                            pic:    _img,
                            tags:   _tag
                        };

                        if( This.noteAction === 'edit' ) {
                            This.noteInstance.noteChanged = false;   // note store, so we don't need to show user save-dialog
                            ctrlNote.updateNote( note, This.noteInstance, This.noteCallBack );
                        }
                        else if( This.noteAction === 'create' ) {
                            This.noteInstance.noteChanged = false;
                            ctrlNote.addNote( note, This.noteInstance, This.noteCallBack );
                        }
                        /*
                        showTemplateDialog(
                            false,
                            objInit.showDialog,
                            _This.commonHub.noteItemTemplate,
                            objInit.hubCloseBtn );
                         */
                        return true;
                    }
                }
                catch(err) {
                    console.log('ERROR(CommonHub.showNoteItemDlg.updateNote()): ' + err );
                }
            }

            if(!isDefine(ctrlNote) ) {
                ctrlNote = new th.next.NoteController();
            }

            var objInit =
                initTemplateDlgWithoutCloseButton(
                    _This,
                    classContainer,
                    'noteItemTemplate',
                    '#th-dlg-template-note-item'
                );

            var tmplNote = _This.commonHub.noteItemTemplate;

            //$('.note-hub .th-cover').css('height', '20px');

            var ntSct = tmplNote.find('.th-dlg-note-item-status');
            var ntBtn = tmplNote.find('.th-btn-add-note-post');
            var dlgTl = tmplNote.find('.th-dlg-title');
            var elMsg = tmplNote.find('.th-dlg-note-item-text');
            var elTtl = tmplNote.find('.th-dlg-note-item-title');
            var elTag = tmplNote.find('.th-dlg-note-item-tags');

            elMsg.val('');
            elTtl.val('');
            elTag.val('');
            ntSct.val('define');

            showHidePerAction();

            This.noteAction   = _action;
            This.noteCallBack = callback;
            This.noteInstance = _This;
            This.noteData     = _noteData;
            This.noteContent  = elMsg.val();

            if( objInit.firstCall ) {

                _This.commonHub['noteItemTemplate'].find('.btn-circle').click( function() {
                    if(This.noteInstance.noteChanged === true ) {
                        if (confirm("Do you want to save this Note before close?") === true) {
                            if(!updateNote())
                                return;
                        }
                    }

                    This.noteInstance.noteChanged = false;

                    showTemplateDialog(
                        false,
                        objInit.showDialog,
                        _This.commonHub.noteItemTemplate,   // This.noteInstance.commonHub.noteItemTemplate
                        objInit.hubCloseBtn );
                });

                elMsg.bind("propertychange input paste", function(e) {
                    if(This.noteContent !== elMsg.val()) {
                        This.noteInstance.noteChanged = true;
                    }
                });

                ntSct.change(function(e) {
                    var noteStatus = e.target.value;
                    setNoteStatusImage( noteStatus );
                });

                ntBtn.click( function() {
                    if(updateNote()) {
                        showTemplateDialog(
                            false,
                            objInit.showDialog,
                            _This.commonHub.noteItemTemplate,
                            objInit.hubCloseBtn );
                    }

                    /*
                    var _message = elMsg.val();
                    var _title   = elTtl.val();
                    var _status  = ntSct.val();
                    var _tag     = elTag.val();
                    var _link    = "";  // elLnk.val();
                    var _img     = "";  // elImg.val();

                    if( _title.length < 1 || _message.length < 1 ) {
                        alert("Hey type some note content :)");
                    }
                    else {
                        var note = {
                            id:    isDefine(This.noteData) ? This.noteData.id: '',
                            msg:    _message,
                            status: _status,
                            title:  _title,
                            link:   _link,
                            pic:    _img,
                            tags:   _tag
                        };

                        if( This.noteAction === 'edit' ) {
                            ctrlNote.updateNote( note, This.noteInstance, This.noteCallBack );
                        }
                        else if( This.noteAction === 'create' ) {
                            ctrlNote.addNote( note, This.noteInstance, This.noteCallBack );
                        }

                        showTemplateDialog(
                            false,
                            objInit.showDialog,
                            _This.commonHub.noteItemTemplate,
                            objInit.hubCloseBtn );
                    }
                    */
                });
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.showNoteItemDlg())' + err );
        }
    };

    _public.showCommentItemDlg = function( _This, classContainer, _comment, callback ) {
        try {

            if(!isDefine(ctrlComment) ) {
                ctrlComment = new th.next.CommentController();
            }

            var objInit = initTemplateDlg( _This,
                                            classContainer,
                                            'commentItemTemplate',
                                            '#th-dlg-template-comment-item' );

            var dlgTl = _This.commonHub.commentItemTemplate.find('.th-dlg-title');
            var elMsg = _This.commonHub.commentItemTemplate.find('.th-dlg-comment-item-text');
            var elLnk = _This.commonHub.commentItemTemplate.find('.th-dlg-comment-item-link');
            var elImg = _This.commonHub.commentItemTemplate.find('.th-dlg-comment-item-image-link');

            var showElt = 'none';
            if( _comment ) {
                dlgTl.html('ADD COMMENT');
            }
            else {
                dlgTl.html('ADD COMMENT TO THE PAGE');
                showElt = 'block';
            }

            elLnk.closest('.th-dlg-data').css('display', showElt );
            elImg.closest('.th-dlg-data').css('display', showElt );

            // don't show title and link if we want to add only post

//            if( _comment ) {
//                elTtl.closest('.th-dlg-data').css('display', 'none' );
//                elLnk.closest('.th-dlg-data').css('display', 'none' );
//                dlgTl.html('ADD COMMENT TO THE POST');
//            }
//            else {
//                elTtl.closest('.th-dlg-data').css('display', 'block' );
//                elLnk.closest('.th-dlg-data').css('display', 'block' );
//                dlgTl.html('ADD POST TO THE WALL');
//            }

            This.Comments        = _comment;
            This.commentCallBack = callback;
            This.thisInstance    = _This;

            if( objInit.firstCall ) {

                // send add wall-item and close dialog
                _This.commonHub.commentItemTemplate.find('.th-btn-add-comment-post').click( function() {
                    //var _title   = elTtl.val();
                    var _message = elMsg.val();
                    var _link    = elLnk.val();
                    var _img     = elImg.val();

                    if(_message.length < 1 ) {
                        This.showInfoDlg( _This,
                                        '.comment-hub-dlg-info',
                                        'Hey type some comment :)',
                                        function( params ) {});
                    }
                    else {
                        //elTtl.val('');
                        elMsg.val('');
                        elLnk.val('');
                        elImg.val('');

                        if( This.Comments ) {
                            ctrlComment.addCommentSubPost( _message, This.thisInstance, This.commentCallBack );
                        }
                        else {
                            ctrlComment.addCommentPost( _message, _link, _img, This.thisInstance, This.commentCallBack );
                        }

//                        ctrlComment.addCommentPost( _message, _link, _img, This.thisInstance, This.commentCallBack );

                        showTemplateDialog( false,
                                            objInit.showDialog,
                                            _This.commonHub.commentItemTemplate,
                                            objInit.hubCloseBtn );
                    }
                });
            }

            _This.commonHub.commentItemTemplate.find('.th-template-nick').html( getUser().nick );

        }
        catch(err) {
            console.log('ERROR(CommonHub.showCommentItemDlg())' + err );
        }
    };

    _public.showSmsDlg = function(_This, classContainer, _callback ) {
        try {

            var objInit = initTemplateDlg( _This,
                                            classContainer,
                                            'smsTemplate',
                                            '#th-dlg-template-sms' );

            if( objInit.firstCall ) {
                // send sms and close dialog
                _This.commonHub.smsTemplate.find('.th-btn-send-sms').click( function() {
                    var elMsg   = _This.commonHub.smsTemplate.find('.th-dlg-sms-text');
                    var message = elMsg.val();

                    if(message.length < 1 ) {
                        //alert('Hey type some message :)')
                        This.showInfoDlg( _This,
                                            '.talk-hub-dlg-info',
                                            'Hey type some message :)',
                                            function( params ) {});
                    }
                    else {
                        elMsg.val('');
                        sendSmsRoutine( _This, message );
                        showTemplateDialog( false, objInit.showDialog, _This.commonHub.smsTemplate, objInit.hubCloseBtn );
                    }
                });
            }

            _This.commonHub.smsTemplate.find('.th-template-nick').html(_This.userPerClick.nick);

            sendCallBack( _callback( null ));
        }
        catch(err) {
            console.log('ERROR(CommonHub.showSmsDlg()): ' + err );
        }
    };

    _public.showIgnoreDlg = function(_This, classContainer ) {
        try {

            var objInit = initTemplateDlg( _This,
                                            classContainer,
                                            'ignoreTemplate',
                                            '#th-dlg-template-ignore' );

            if( objInit.firstCall ) {
                // add ignore person and close dialog
                _This.commonHub.ignoreTemplate.find('.th-btn-ignore').click( function() {
                    ignoreRoutine( _This );
                    showTemplateDialog( false, objInit.showDialog, _This.commonHub.ignoreTemplate, objInit.hubCloseBtn );
                });
            }

            _This.commonHub.ignoreTemplate.find('.th-template-nick').html(_This.userPerClick.nick);

        }
        catch(err) {
            console.log('ERROR(CommonHub.showIgnoreDlg()): ' + err );
        }
    };

    _public.showMakePersonAsDlg = function(_This, classContainer ) {

        function feelPersonStatusList() {

            var statusList = _This.commonHub.personAsTemplate.find(".th-dlg-person-status");

            // set values
            for(var key in personStatus ) {
                if( personStatus.hasOwnProperty(key)) {
                    var value = personStatus[key];

                    var opt = document.createElement('option');
                    opt.innerHTML = key;
                    opt.value = key;

                    statusList[0].appendChild(opt);
                }
            }
        }

        try {

            var objInit = initTemplateDlg(  _This,
                                            classContainer,
                                            'personAsTemplate',
                                            '#th-dlg-template-make-person-as' );

            if( objInit.firstCall ) {
                _This.commonHub.personAsTemplate.find('.btn-make-person-as').click( function() {
                    makePersonAsRoutine( _This );
                    showTemplateDialog( false, objInit.showDialog, _This.commonHub.personAsTemplate, objInit.hubCloseBtn );
                });

                feelPersonStatusList();
            }

            _This.commonHub.personAsTemplate.find('.th-template-nick').html(_This.userPerClick.nick);
        }
        catch(err) {
            console.log('ERROR(CommonHub.showMakePersonAsDlg()): ' + err );
        }
    };

    _public.showDlgPerTheme = function(_This, classContainer, _callback ) {
        try {

            function onClick( e ) {
                var elChannel = _This.commonHub.perThemeTemplate.find('.th-dlg-channel-per-theme-text');
                var channel   = elChannel.val();

                if(channel.length < 1 ) {
                    //alert('Hey type some channel :)')
                    This.showInfoDlg( _This,
                                        '.talk-hub-dlg-info',
                                        'Hey type some channel :)',
                                        function( params ) {});
                }
                else {
                    elChannel.val('');
                    // open new chat.
                    sendCallBack( _callback( channel ));
                    showTemplateDialog( false,
                                        objInit.showDialog,
                                        _This.commonHub.perThemeTemplate,
                                        objInit.hubCloseBtn );
                }
            }

            var objInit = initTemplateDlg( _This,
                                            classContainer,
                                            'perThemeTemplate',
                                            '#th-dlg-template-per-theme' );

            if( objInit.firstCall ) {
                _This.commonHub.perThemeTemplate.find('.th-btn-open-channel-per-theme').click( onClick );
                //$('.th-dlg-channel-per-theme-text').keyup(function(e) { if(e.keyCode === 13) { onClick(e); } });
                _This.commonHub.perThemeTemplate.find('.th-dlg-channel-per-theme-text').keyup(function(e) { if(e.keyCode === 13) { onClick(e); } });
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.showDlgPerTheme()): ' + err );
        }
    };


    // ------------------------------------------------------------- Dialogs Template

    //
    // _This          - hub-class
    // hubContainer   - '.show-dlg-make-person-as'
    // commonTemplate - 'smsTemplate'
    // scriptID       - th-dlg-template-profile
    //
    function initTemplateDlg( _This, hubContainer, commonTemplate, scriptID ) {
        try {
            var firstCall = false;

            var showDialog  = $( _This.cssClassHub + ' ' + hubContainer );
            var hubCloseBtn = $( _This.cssClassHub + ' .th-header .btn-circle');

            if( !isDefine( _This.commonHub[commonTemplate] )) {
                firstCall = true;

                var tmplScript = $(scriptID).html();
                _This.commonHub[commonTemplate] = $( tmplScript );

                _This.commonHub[commonTemplate].find('.btn-circle').click( function() {
                    showTemplateDialog( false, showDialog, _This.commonHub[commonTemplate], hubCloseBtn );
                });
            }

            var retObj = {
                firstCall:      firstCall,
                showDialog:     showDialog,
                hubCloseBtn:    hubCloseBtn,
                commonTemplate: _This.commonHub[commonTemplate]
            };

            showTemplateDialog( true, showDialog, _This.commonHub[commonTemplate], hubCloseBtn );

            return retObj;
        }
        catch(err) {
            console.log('ERROR(CommonHub.initTemplateDlg())' + err );
            return null;
        }
    }

    function showTemplateDialog( bShow, divDlg, dlgTemplate, btnClose ) {
        try {
            if( bShow ) {   // show dialog

                divDlg.append( dlgTemplate );
                divDlg.css('display', 'block');

                // hide close button of hub
                btnClose.css('display', 'none');
            }
            else {          // hide dialog

                divDlg.css('display', 'none');
                divDlg.remove(":first-child");

                // show close button of hub again
                btnClose.css('display', 'block');
            }
        }
        catch(err) {
            console.log('ERROR(CommonHub.showTemplateDialog())' + err );
        }
    }

    function initTemplateDlgWithoutCloseButton( _This, hubContainer, commonTemplate, scriptID ) {
        try {
            var firstCall = false;

            var showDialog  = $( _This.cssClassHub + ' ' + hubContainer );
            var hubCloseBtn = $( _This.cssClassHub + ' .th-header .btn-circle');

            if( !isDefine( _This.commonHub[commonTemplate] )) {
                firstCall = true;

                var tmplScript = $(scriptID).html();
                _This.commonHub[commonTemplate] = $( tmplScript );

//                _This.commonHub[commonTemplate].find('.btn-circle').click( function() {
//                    showTemplateDialog( false, showDialog, _This.commonHub[commonTemplate], hubCloseBtn );
//                });
            }

            var retObj = {
                firstCall:      firstCall,
                showDialog:     showDialog,
                hubCloseBtn:    hubCloseBtn,
                commonTemplate: _This.commonHub[commonTemplate]
            };

            showTemplateDialog( true, showDialog, _This.commonHub[commonTemplate], hubCloseBtn );

            return retObj;
        }
        catch(err) {
            console.log('ERROR(CommonHub.initTemplateDlg())' + err );
            return null;
        }
    }

    return CommonHub;

})(thJQ);
