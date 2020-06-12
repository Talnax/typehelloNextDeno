/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    comment-hub.js
 */

var th = th || {};
th.next = th.next || {};

th.next.CommentHub = (function($) {
    var This,
        _public = CommentHub.prototype;

    function CommentHub() {
        This = this;
        this.cssClassHub = '.comment-hub';

        this.hubStatus    = statusHub.not_active;
        this.userPerClick = null;

        this.commentTemplate        = null;
        this.commentCommentTemplate = null;

        this.feedbackClass = ".comment-hub-dlg-feedback";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            This.commonHub.removeMainMenuItem( This, 'comment');

            this.initHub();

            This.commonHub.setHubPosition( This );

            This.hubStatus = statusHub.initialized;

            setTimeout(function() {
                This.readAllCommentPosts();
            }, 600);

            setUIEvents();

            rePositionHub();
        }
        catch(err) {
            console.log('ERROR(CommentHub.Initialize())' + err );
        }
    };

    _public.readAllCommentPosts = function() {

        try {
            var user = getUser();

            if(!isDefine( user ))
                return;

            if( !isDefine( ctrlComment )) {
                ctrlComment  = new th.next.CommentController();
            }

            This.showProgressBar( true );

            // re-init

            $("#comment-list-view-ctrl li").remove();

            ctrlComment.listComments = [];

            // set comments

            ctrlComment.getCommentPosts( user, function(result) {
                This.showProgressBar( false );

                for( var i = 0; i < ctrlComment.listComments.length; i++) {
                    bindDataTemplateValues(i, ctrlComment.listComments[i]);
                }
            });
        }
        catch(err) {
            console.log('ERROR(CommentHub.readAllCommentPosts())' + err );
        }
    };

    _public.refreshUI = function() {

        try {
            $("#comment-list-view-ctrl li").remove();

            for( var i = ctrlComment.listComments.length - 1; i >= 0; i--) {
                bindDataTemplateValues(i, ctrlComment.listComments[i]);
            }
        }
        catch(err) {
            console.log('ERROR(CommentHub.refreshUI())' + err );
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

    function onCommentMainMenu_Click( event ) {
        try {
            event.preventDefault();

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-template-dlg' );

            if( typeof This.commonHub[fun] === 'function' ) {
                This.commonHub[fun]( This, arg, false,  function( result, post ) {

                    if( fun === 'showCommentItemDlg') {

                        // add new post to list

                        if( result === true ) {
                            ctrlComment.listComments.push({post: post});
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
            console.log('CommentHub.onCommentMainMenu_Click(): ' + err );
            return false;
        }
    }

    function onUserAction_Click ( event ) {
        try {
            event.preventDefault();

            This.userPerClick = getUserPerDataTemplate( 'comment-list-view-item-template', event );

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-template-dlg' );

            This.commonHub[fun]( This, arg, true, function( result, sub_post ) {

                if( fun === 'showCommentItemDlg') {

                    // add new sub-post to list

                    if( result === true ) {
                        //ctrlComment.listCommentPosts.push({post: post});

                        for( var i = 0; i < ctrlComment.listComments.length; i++ ) {
                            var post = ctrlComment.listComments[i].post;

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

            return false;
        }
        catch(err) {
            console.log('ERROR(CommentHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

    function setUIEvents() {
        try {

            $(document).on("click", ".comment-hub .th-user-actions li", onUserAction_Click );

            $(document).on("click", ".comment-hub ul.th-ul-main-menu li", onCommentMainMenu_Click );

            $(document).on("mouseenter", "#comment-list-view-ctrl li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '1.0');
            });
            $(document).on("mouseleave", "#comment-list-view-ctrl li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '0.0');
            });
        }
        catch( err ) {
            console.log('ERROR(CommentHub.setUIEvents()): ' + err );
        }
    }

    function rePositionHub() {
        try {
            // move hub to right side.

            var hub_width = parseInt($(This.cssClassHub).css('width'));

            $(This.cssClassHub).css('left', parseInt( window.innerWidth - hub_width - 36 ) + 'px');

            //$(This.cssClassHub).css('top', yPosition + 'px');
        }
        catch(err) {
            console.log('ERROR(CommentHub.rePositionHub())' + err );
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

            if( !This.commentTemplate) {
                var itemScript   = $('#comment-item-template').html();
                This.commentTemplate = $( itemScript );
            }

            if( This.commentTemplate.length === 0 )
                return;

            var post = arg.post;

            post.sender.post_id = arg.post.id;  // additional value
            var jsnUser = JSON.stringify(post.sender);

            $(This.commentTemplate).find('.template-data span').text(jsnUser);

            $(This.commentTemplate).find('.template-date span').text(post.date);

            $(This.commentTemplate).find('.template-nick span').text(post.sender.nick);

            //$(This.commentTemplate).find('.template-title span').text(post.title);

            $(This.commentTemplate).find('.template-text span').text(post.msg);

            $(This.commentTemplate).find('.template-link a').text(post.link);
            $(This.commentTemplate).find('.template-link a').attr('href', post.link );

            var tmpImg = $(This.commentTemplate).find('.template-pic img');
            setTemplatePic();

            var imgDiv  = $(This.commentTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, post.sender );

            var htmlTemplate = This.commentTemplate[0].outerHTML;
            $("#comment-list-view-ctrl").last().append('<li>' + htmlTemplate + '</li>');

            imgDiv[0].removeAttribute('style');  // remove previous person image.
            tmpImg[0].removeAttribute('style');  // remove previous post image.

            // add sub-post( post comments )

            for( var i = 0; i < post.comments.length; i++ ) {
                bindDataTemplateSubValues ( i, post.comments[i] );
            }
        }
        catch(err) {
            console.log('ERROR(CommentHub.bindDataTemplateValues())' + err );
        }
    }

    function bindDataTemplateSubValues ( index, arg ) {
        try {

            if( !This.commentCommentTemplate) {
                var commentScript   = $('#comment-item-comment-template').html();
                This.commentCommentTemplate = $( commentScript );
            }

            if( This.commentCommentTemplate.length === 0 )
                return;

            arg.sender.post_id = arg.id;  // additional value
            var jsnUser = JSON.stringify(arg.sender);
            $(This.commentCommentTemplate).find('.template-data span').text(jsnUser);

            $(This.commentCommentTemplate).find('.template-date span').text(arg.date);

            $(This.commentCommentTemplate).find('.template-nick span').text(arg.sender.nick);

//            $(This.commentCommentTemplate).find('.template-title span').text(post.title);

            $(This.commentCommentTemplate).find('.template-text span').text(arg.msg);

            var imgDiv  = $(This.commentCommentTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, arg.sender );

            var htmlTemplate = This.commentCommentTemplate[0].outerHTML;
            //var listSubPost = $(".comment-list-view-comments-ctrl");
            $( ".comment-list-view-comments-ctrl" ).last().append('<li>' + htmlTemplate + '</li>');

            imgDiv[0].removeAttribute('style');  // remove previous pic.
        }
        catch(err) {
            console.log('ERROR(CommentHub.bindDataTemplateSubValues())' + err );
        }
    }

    return CommentHub;

})(thJQ);

th.next.CommentController = (function($) {
    var This
        ,_public = CommentController.prototype;

    function CommentController() {
        This = this;

        this.listComments = [];

        this.Initialize();
    }

    _public.Initialize = function() {
    };

    _public.getCommentPosts = function( userOwner, callback ) {

        try {
            // if we need refresh, delete This.listCommentPosts = []; first

            if( This.listComments.length > 0)
                return;

            if(!isDefine( userOwner ))
                return;

            var dbreq  = { 'receivers': userOwner.id };
            var retval =  { 'post':1 };

            var req = 'get-comment-posts';
            var request = {
                dbcall:       'db-comment'
                , dbcollection: 'comment'
                , dbrequest:    {
                    'url': encodeURIComponent(removeLineBreaks(document.URL))
                }
                , dbreturn : {
                    'post':1
                }
//                , dblimit: {
//                    limit: 5
//                }
            };

            var ajaxData = JSON.stringify(request);

            function success_call( data, textStatus, jqXHR ) {

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( typeof parser.param === "object" ) {

                        This.listComments = parser.param;

                        sendCallBack(callback( true ));

                        return;
                    }
                }

                sendCallBack(callback( false ));
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[CommentController.getAllCommentItems()]: ' + errorThrown );

                sendCallBack(callback( false));
            }

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(CommentController.getCommentPosts())' + err );
        }
    };

    _public.addCommentPost = function( _message, _link, _img, _This, callback  ) {
        try {

            _This.showProgressBar( true );

            _message = encodeURIComponent( removeLineBreaks(_message ));
            _img     = isDefine(_img) ? encodeURIComponent( removeLineBreaks( _img )) : '';
            _link    = isDefine(_link) ? encodeURIComponent( removeLineBreaks(_link )) : '';

            var req     = 'add-comment-post';
            var request = {
                dbcall:        'db-add',
                dbcollection:  'comment',
                dbrequest:      {
                    'url':  encodeURIComponent(removeLineBreaks(document.URL))
                    , 'post':  {
                        'id':     GUID()
                        , 'sender': getUserId(getUser())
                        , 'date':   getCurrentDate()
                        , 'msg':    _message
                        , 'link':   _link
                        , 'pic':    _img
                        , 'comments': []
                    }
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {},
                function( jqXHR, textStatus, errorThrown ) {});

            // update UI

            decodePost( request.dbrequest.post );

            sendCallBack(callback( true, request.dbrequest.post ));

            _This.showProgressBar( false );

        }
        catch(err) {
            console.log('ERROR(CommentController.addCommentPost())' + err );
        }
    };

    _public.addCommentSubPost = function( _message, _This, callback  ) {
        try {
            _message  = encodeURIComponent( removeLineBreaks(_message ));

            var req     = 'add-comment-sub-post';
            var request = {
                post_id:      _This.userPerClick.post_id
                , comment:      {
                    'id':     GUID()
                    , 'sender': getUserId(getUser())
                    , 'date':   getCurrentDate()
                    , 'msg':    _message
                    , 'link':   ''
                    , 'pic':    ''
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
            console.log('ERROR(CommentController.addCommentSubPost())' + err );
        }
    };

    // --------------------------------------------------------------- Support functions

    function decodePost( request ) {
        try {
            request.msg  = decodeURIComponent( request.msg );
            request.pic  = decodeURIComponent( request.pic );
            request.link = decodeURIComponent( request.link );
        }
        catch(err) {
            console.log('ERROR(CommentController.decodePost())' + err );
        }
    }

    return CommentController;

})(thJQ);
