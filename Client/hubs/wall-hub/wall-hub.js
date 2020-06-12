/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    wall-hub.js
 */

th.next.WallHub = (function($) {
    var This,
        _public = WallHub.prototype;

    function WallHub() {
        This = this;
        this.cssClassHub = '.wall-hub';

        this.hubStatus    = statusHub.not_active;
        this.userPerClick = null;

        this.wallTemplate        = null;
        this.wallCommentTemplate = null;

        this.feedbackClass = ".wall-hub-dlg-feedback";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            This.commonHub.removeMainMenuItem( This, 'wall');

            this.initHub();

            This.commonHub.setHubPosition( This );

            setTimeout(function() {
                This.readAllWallPosts();
            }, 600);

            rePositionHub();

            setUIEvents();

            This.hubStatus = statusHub.initialized;
        }
        catch(err) {
            console.log('ERROR(WallHub.Initialize())' + err );
        }
    };

    _public.readAllWallPosts = function() {
        try {
            var user = getUser();
            if(!isDefine( user ))
                return;

            if( !isDefine( ctrlWall )) {
                ctrlWall  = new th.next.WallController();
            }

            This.showProgressBar( true );

            // re-init

            $("#wall-list-view-ctrl li").remove();

            ctrlWall.listWallPosts = [];

            // get posts

            ctrlWall.getWallPosts( user, function(result) {
                This.showProgressBar( false );

                showWallPosts();
            });
        }
        catch(err) {
            console.log('ERROR(WallHub.readAllWallPosts())' + err );
        }
    };

    _public.refreshUI = function() {
        try {
            $("#wall-list-view-ctrl li").remove();

            showWallPosts();
        }
        catch(err) {
            console.log('ERROR(WallHub.refreshUI())' + err );
        }
    };

    _public.removePost = function(e) {
        try {
            // remove item from UI

            var template = $(e.target).closest('.wall-list-view-item-template').remove();

            // remove from memory

            //addNotShowProperties( getPostIndexById(This.postData.id) );
            addNotShowPropertiesToPost(This.postData);

            // remove from database

            This.showProgressBar( true );

            setTimeout(function() {
                ctrlWall.removeWallPost(getUser(), This.postData, function() {
                    This.showProgressBar( false );
                });
            }, 600);

        }
        catch( err ) {
            console.log('ERROR(PinHub.removePin()): ' + err );
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

    function onWallMainMenu_Click( event ) {
        try {
            event.preventDefault();

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-template-dlg' );

            if( typeof This.commonHub[fun] === 'function' ) {
                This.commonHub[fun]( This, arg, function( result, post ) {

                    if( fun === 'showWallItemDlg') {

                        // add new post to list

                        if( result === true ) {
                            ctrlWall.listWallPosts.push({post: post});
                            This.refreshUI();
                        }
                    }
                });
            }
            else if( typeof This[fun] === 'function' ) {
                This[fun]();
            }

            return false;
        }
        catch(err) {
            console.log('WallHub.onTalkMainMenu_Click(): ' + err );
            return false;
        }
    }

    function onUserAction_Click ( event ) {
        try {
            event.preventDefault();

            This.userPerClick = getUserPerDataTemplate( 'wall-list-view-item-template', event );
            This.postData = ctrlWall.getPostById(This.userPerClick.post_id);

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-template-dlg' );

            if( typeof This.commonHub[fun] === 'function' ) {

                This.commonHub[fun]( This, arg, function( result, sub_post ) {

                    if( fun === 'showSubPostWallItemDlg') {

                        // add new sub-post to list

                        if( result === true ) {
                            //ctrlWall.listWallPosts.push({post: post});

                            for( var i = 0; i < ctrlWall.listWallPosts.length; i++ ) {
                                var post = ctrlWall.listWallPosts[i].post;

                                if( post.id === sub_post.post_id ) {
                                    var comments = post.comments;
                                    comments.push( sub_post.comment );

                                    This.refreshUI();

                                    break;
                                }
                            }
                        }
                    }
                });
            }
            else if( typeof This[fun] === 'function' ) {
                This[fun](event);
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(WallHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    function onItemPostLink_Click( event ) {
        try {
            event.preventDefault();

            var el = event.target;
            var postLink = $(this).attr('href');

            window.open(postLink);

            return false;
        }
        catch(err) {
            console.log('ERROR(PinHub.onItemPostLink_Click()): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

    function setUIEvents() {
        try {

            $(document).on("click", ".wall-hub #wall-list-view-ctrl li .template-link a", onItemPostLink_Click );

            $(document).on("click", ".wall-hub .th-user-actions li", onUserAction_Click );

            $(document).on("click", ".wall-hub ul.th-ul-main-menu li", onWallMainMenu_Click );

            $(document).on("mouseenter", "#wall-list-view-ctrl li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '1.0');
            });
            $(document).on("mouseleave", "#wall-list-view-ctrl li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '0.0');
            });
        }
        catch( err ) {
            console.log('ERROR(WallHub.setUIEvents()): ' + err );
        }
    }

    function getPostById( _postId ) {
        try {

            for( var i = 0; i < ctrlWall.listWallPosts.length; i++) {
                var post = ctrlWall.listWallPosts[i].post;

                if( post.id === _postId) {
                    return post;
                }
            }

            return null;
        }
        catch(err) {
            console.log('ERROR(WallHub.getPostById())' + err );
            return null;
        }
    }

    function addNotShowPropertiesToPost( _post ) {
        try {

            var user = getUser();

            if( _post.hasOwnProperty('not_show_for')) {
                var not_show = _post.not_show_for;

                if( not_show.indexOf(user.id) < 0 ) {
                    _post.not_show_for.push(user.id);
                }
            }
            else {
                _post.not_show_for = [];
                _post.not_show_for.push(user.id);
            }
        }
        catch(err) {
            console.log('ERROR(WallHub.getPostById())' + err );
        }
    }

    function showWallPosts() {
        try {
            var user_id = getUser().id;

            if( !isDefine(ctrlWall.listWallPosts))
                return;

            // last post become first

            for( var i = ctrlWall.listWallPosts.length - 1; i >= 0; i--) {
                var post = ctrlWall.listWallPosts[i].post;

                if( post.hasOwnProperty('not_show_for')) {
                    var not_show = post.not_show_for;

                    if( not_show.indexOf(user_id) > -1 ) {
                        continue;
                    }
                }

                bindDataTemplateValues(i, ctrlWall.listWallPosts[i] );
            }
        }
        catch(err) {
            console.log('ERROR(WallHub.updateUIPost())' + err );
        }
    }

    function rePositionHub() {
        try {
            // move hub to right side.

            var hub_width = parseInt($(This.cssClassHub).css('width'));

            $(This.cssClassHub).css('left', parseInt( window.innerWidth - hub_width - 18 ) + 'px');

            //$(This.cssClassHub).css('top', yPosition + 'px');
        }
        catch(err) {
            console.log('ERROR(WallHub.rePositionHub())' + err );
        }
    }

    function bindDataTemplateValues ( index, arg ) {
        try {

            function hideTemplatePic(tmpImg) {
                tmpImg.attr('src', '' );
                tmpImg.css( 'margin-top', '0');
                tmpImg.css( 'margin-bottom', '0');
                tmpImg.css( 'visibility', 'hidden');
            }

            function setTemplatePic() {
                if( post.pic === '' ) {
                    hideTemplatePic(tmpImg);
                }
                else {
                    tmpImg.attr('src', post.pic );
                }
            }

            if( !isDefine(arg)) {
                return;
            }

            if( !isDefine(This.wallTemplate)) {
                var itemScript   = $('#wall-item-template').html();
                This.wallTemplate = $( itemScript );

                if( !isDefine(This.wallTemplate) || This.wallTemplate.length === 0 )
                    return;
            }

            var post = arg.post;

            post.sender.post_id = arg.post.id;  // additional value
            var jsnUser = JSON.stringify(post.sender);
            $(This.wallTemplate).find('.template-data span').text(jsnUser);

            $(This.wallTemplate).find('.template-date span').text(post.date);

            $(This.wallTemplate).find('.template-nick span').text(post.sender.nick);

            var lenTtl = 60;
            $(This.wallTemplate).find('.template-title span')
                .text( post.title.length >= lenTtl ? post.title.slice( 0, lenTtl - 3 ) + '...' : post.title );

            var lenMsg = 255;
            $(This.wallTemplate).find('.template-text span')
                .text(post.msg.length >= lenMsg ? post.msg.slice( 0, lenMsg - 3 ) + '...' : post.msg);

            var lenLink = 90;
            $(This.wallTemplate).find('.template-link a')
                .text( post.link.length >= lenLink ? post.link.slice( 0, lenLink - 3 ) + '...' : post.link );   // text of link
            $(This.wallTemplate).find('.template-link a').attr('href', post.link );                             // value of link

            var tmpImg = $(This.wallTemplate).find('.template-pic img');
            setTemplatePic();

            var imgDiv  = $(This.wallTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, post.sender );

            var htmlTemplate = This.wallTemplate[0].outerHTML;
            $("#wall-list-view-ctrl").last().append('<li>' + htmlTemplate + '</li>');

            imgDiv[0].removeAttribute('style');  // remove previous person image.
            tmpImg[0].removeAttribute('style');  // remove previous post image.

            // add sub-post( post comments )

            for( var i = 0; i < post.comments.length; i++ ) {
                bindDataTemplateSubValues ( i, post.comments[i] );
            }
        }
        catch(err) {
            console.log('ERROR(WallHub.bindDataTemplateValues())' + err );
        }
    }

    function bindDataTemplateSubValues ( index, arg ) {
        try {

            if( !This.wallCommentTemplate) {
                var commentScript   = $('#wall-item-comment-template').html();
                This.wallCommentTemplate = $( commentScript );
            }

            if( This.wallCommentTemplate.length === 0 )
                return;

            arg.sender.post_id = arg.id;  // additional value
            var jsnUser = JSON.stringify(arg.sender);
            $(This.wallCommentTemplate).find('.template-data span').text(jsnUser);

            $(This.wallCommentTemplate).find('.template-date span').text(arg.date);

            $(This.wallCommentTemplate).find('.template-nick span').text(arg.sender.nick);

            $(This.wallCommentTemplate).find('.template-text span').text(arg.msg);

            var imgDiv  = $(This.wallCommentTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, arg.sender );

            var htmlTemplate = This.wallCommentTemplate[0].outerHTML;
            $( ".wall-list-view-comments-ctrl" ).last().append('<li>' + htmlTemplate + '</li>');

            imgDiv[0].removeAttribute('style');  // remove previous pic.
        }
        catch(err) {
            console.log('ERROR(WallHub.bindDataTemplateValues())' + err );
        }
    }
    /*
    function getPostIndexById( _postId ) {
        try {

            for( var i = 0; i < ctrlWall.listWallPosts.length; i++) {
                var post = ctrlWall.listWallPosts[i].post;

                if( post.id === _postId) {
                    return i;
                }
            }

            return -1;
        }
        catch(err) {
            console.log('ERROR(WallHub.getPostById())' + err );
            return -1;
        }
    }

    function addNotShowPropertiesByIndex( _post_index ) {
        try {
            var user = getUser();
            var post = ctrlWall.listWallPosts[_post_index].post;

            if( post.hasOwnProperty('not_show_for')) {
                var not_show = post.not_show_for;

                if( not_show.indexOf(user.id) < 0 ) {
                    post.not_show_for.push(user.id);
                }
            }
            else {
                post.not_show_for = [];
                post.not_show_for.push(user.id);
            }
        }
        catch(err) {
            console.log('ERROR(WallHub.getPostById())' + err );
        }
    }
    */
    return WallHub;

})(thJQ);

th.next.WallController = (function($) {
    var This
        ,_public = WallController.prototype;

    function WallController() {
        This = this;

        this.listWallPosts = [];
        //this.listFriends   = null;

        this.Initialize();
    }

    _public.Initialize = function() {
    };

    _public.getWallPosts = function( userOwner, callback ) {
        try {
            // if we need refresh, delete This.listWallPosts = []; first

            if( This.listWallPosts.length > 0)
                return;

            if(!isDefine( userOwner )) return;

            var dbreq  = { 'receivers': userOwner.id };
            var retval =  { 'post':1 };

            var req = 'get-n-last-wall-posts';
            var request = {
                  dbcall:       'db-add'
                , dbcollection: 'wall'
                , dbrequest:    {
                     'receivers': userOwner.id
                 }
                , dbreturn : {
                    'post':1        // what object of record have to return
                }
                , dblimit: {
                    'limit': 18     // how many record have to return
                }
            };

            var ajaxData = JSON.stringify(request);

            function success_call( data, textStatus, jqXHR ) {

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( typeof parser.param === "object" ) {

                        This.listWallPosts = parser.param;

                        sendCallBack(callback( true ));

                        return;
                    }
                }

                sendCallBack(callback( false ));
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[WallController.getAllWallItems()]: ' + errorThrown );

                sendCallBack(callback( false));
            }

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(WallController.getAllWallItems())' + err );
        }
    };

    //_public.addWallPost = function( _title, _message, _link, _img, _language, _person_status, _This, callback  ) {
    _public.addWallPost = function( _post, _This, callback  ) {
        try {

            _This.showProgressBar( true );

            _message  = encodeURIComponent( removeLineBreaks( _post.msg ));
            _title    = isDefine(_post.title ) ? encodeURIComponent( removeLineBreaks( _post.title )) : '';
            _link     = isDefine(_post.link) ? encodeURIComponent( removeLineBreaks(_post.link )) : '';
            _img     = isDefine(_post.img) ? encodeURIComponent( removeLineBreaks(_post.img )) : '';

            //var friends = ['6262-1731-396-2670-398611611659', '6262-1731-396-2670-398611611333', '3360-2610-1489-1888-10718461535'];
            getFriends( _post, function( _persons ) {

                var friends = [];
                if( _persons.length > 0 ) {
                    friends = _persons.slice(0);
                }
                friends.push(getUser().id);

                var req     = 'add-wall-post';
                var request = {
                    dbcall:        'db-add',
                    dbcollection:  'wall',
                    dbrequest:      {
                          'receivers':  friends
                        , 'post'     :  {
                              'id':     GUID()
                            , 'sender': getUserId(getUser())
                            , 'date':   getCurrentDate()
                            , 'title':  _title
                            , 'msg':    _message
                            , 'link':   _link
                            , 'pic':    _img
                            , 'comments': []
                        }
                    }
                };

                var mailLink = "";
                if( _link != "") {
                    mailLink = "<br> Link to content of post: " + _link;
                }

                var ajaxData = JSON.stringify(request);

                ajaxCall( pathServer + req, req + '=' + ajaxData,
                        function( data, textStatus, jqXHR ) {

                            if( _persons.length < 1 )
                                return;

                            sendMailToUsersID(
                                getUser(),
                                friends,
                                "TypeHello notification",
                                " send new post on Wall." + mailLink,
                                mailNotificationType.wall,
                                mailContentType.html,
                                function() {}
                            );
                        },
                        function( jqXHR, textStatus, errorThrown ) {});

                // update UI

                decodePost( request.dbrequest.post );

                sendCallBack(callback( true, request.dbrequest.post ));

                _This.showProgressBar( false );
            });
        }
        catch(err) {
            console.log('ERROR(WallController.addWallPostRoutine())' + err );
        }
    };

    _public.addWallSubPost = function( _message, _This, callback  ) {
        try {

            if(!isDefine( _message )) return;

            _message  = encodeURIComponent( removeLineBreaks(_message ));

            var req     = 'add-wall-sub-post';
            var request = {
                  post_id:      _This.userPerClick.post_id
                , comment:      {
                      'id':     GUID()
                    , 'sender': getUserId(getUser())
                    , 'date':   getCurrentDate()
                    , 'title':  ''
                    , 'msg':    _message
                    , 'link':   ''
                }
            };

            _This.showProgressBar( true );

            var ajaxData = JSON.stringify(request);

            setTimeout(function() {
                ajaxCall( pathServer + req, req + '=' + ajaxData,
                    function( data, textStatus, jqXHR ) {},
                    function( jqXHR, textStatus, errorThrown ) {});

                // update UI

                decodePost( request.comment );

                sendCallBack(callback( true, request ));

                _This.showProgressBar( false );

            }, 600);
        }
        catch(err) {
            console.log('ERROR(WallController.addWallSubPost())' + err );
        }
    };

    _public.removeWallPost = function (_user, _post, callback ) {
        try {

            if( !isDefine(_post)) sendCallBack(callback());
            if( !isDefine(_post)) sendCallBack(callback());

            var req     = 'remove-wall-post';
            var request = {
                dbcall:        'db-remove',
                dbcollection:  'wall',
                post_id:       _post.id,
                not_show_for:  _user.id
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {},
                function( jqXHR, textStatus, errorThrown ) {});

            sendCallBack(callback());    // we don't wait for http-response
        }
        catch(err) {
            console.log('ERROR(WallController.getRemovePost()): ' + err );
            sendCallBack(callback());
        }
    };

    _public.getPostById = function (_postId) {
        try {

            if(!isDefine( _postId )) return null;

            for( var i = 0; i < This.listWallPosts.length; i++ ) {
                var post = This.listWallPosts[i].post;
                if( post.id === _postId) {
                    return post;
                }
            }

            return null;
        }
        catch(err) {
            console.log('ERROR(WallController.getPostById()): ' + err );
            return null;
        }
    };

    // --------------------------------------------------------------- Support functions

    function getFriends( _post, callback ) {
        try {
            this.post = _post;

            loadHub( 'person-hub', function(res) {
                if( res === 'ok' ) {
                    if( !ctrlPerson ) {
                        ctrlPerson = new th.next.PersonController();
                    }

                    ctrlPerson.getPersons( getUser(), function() {
                        //This.listFriends = [];
                        var persons = [];

                        if( ctrlPerson.listPerson !== null ) {
                            for( var i = 0; i < ctrlPerson.listPerson.length; i++ ) {
                                var item = ctrlPerson.listPerson[i];
                                var checkLan = false;
                                var checkSts = false;

                                // check language

                                if( item.person.language === ""                         ||
                                    this.post.language.toLowerCase() === "any language" ||
                                    this.post.language.toLowerCase() === item.person.language.toLowerCase() ) {
                                    checkLan = true;
                                }

                                // check status

                                if( this.post.status.toLowerCase() === "all" ||
                                    this.post.status.toLowerCase() === item.status ) {
                                    checkSts = true;
                                }


                                if(checkLan && checkSts ) {
                                    persons.push(ctrlPerson.listPerson[i].person.id);
                                }
                            }
                        }

                        sendCallBack(callback(persons));
                    });
                }
            });
        }
        catch(err) {
            console.log('ERROR(WallController.getFriends())' + err );
        }
    }

    function decodePost( request ) {
        try {
            request.msg   = decodeURIComponent( request.msg );
            request.title = decodeURIComponent( request.title );
            request.link  = decodeURIComponent( request.link );
            request.pic   = decodeURIComponent( request.pic );
        }
        catch(err) {
            console.log('ERROR(WallController.decodePost())' + err );
        }
    }

    return WallController;

})(thJQ);
