/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    pin-hub.js
 */

th.next.PinHub = (function($) {
    var This,
        _public = PinHub.prototype;

    function PinHub() {
        This = this;
        this.cssClassHub = '.pin-hub';

        this.hubStatus    = statusHub.not_active;
        this.userPerClick = null;

        this.pinTemplate   = null;
        this.searchResults = [];
        this.collapseCss   = false;

        this.feedbackClass = ".pin-hub-dlg-feedback";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            if( !isDefine( ctrlPin )) {
                ctrlPin  = new th.next.PinController();
            }

            This.commonHub.removeMainMenuItem( This, 'pin');

            this.initHub();

            This.commonHub.setHubPosition( This );

            This.hubStatus = statusHub.initialized;

            setTimeout(function() {
                This.readAllPins();
            }, 600);

            //rePositionHub();

            setUIEvents();
        }
        catch(err) {
            console.log('ERROR(PinHub.Initialize())' + err );
        }
    };

    _public.readAllPins = function() {
        try {
            var user = getUser();
            if(!isDefine( user ))
                return;

            This.showProgressBar( true );

            // re-init

            $("#pin-list-view-ctrl li").remove();

            ctrlPin.listPins = [];

            ctrlPin.getFavIcon(function(fIcon) {

                if(!isDefine(fIcon) || fIcon === '') {
                    ctrlPin.favIcon = 'http://typehello.com/favicon.ico';
                }
                else {
                    ctrlPin.favIcon = fIcon;
                }

                // get posts

                ctrlPin.getPins( user, function(result) {
                    This.showProgressBar( false );

                    if( !isDefine(ctrlPin.listPins))
                        return;

                    // last post become first

                    for( var i = ctrlPin.listPins.length - 1; i >= 0; i--) {
                        bindDataTemplateValues(i, ctrlPin.listPins[i]);
                    }
                });
            });
        }
        catch(err) {
            console.log('ERROR(PinHub.readAllPins())' + err );
        }
    };

    _public.refreshUI = function( listPins ) {
        try {
            $("#pin-list-view-ctrl li").remove();

            for( var i = listPins.length; i >= 0; i--) {
                bindDataTemplateValues(i, listPins[i]);
            }
        }
        catch(err) {
            console.log('ERROR(PinHub.refreshUI())' + err );
        }
    };

    _public.removePin = function(e) {
        try {
            // remove item from UI

            var template = $(e.target).closest('.pin-list-view-item-template').remove();

            // remove from database

            var pin = This.pinData;

            This.showProgressBar( true );

            setTimeout(function() {
                ctrlPin.removePin(This.pinData, function() {
                   var pinIndex = ctrlPin.getPinIndexById(pin.id);
                   ctrlPin.listPins.splice(pinIndex, 1);
                    This.showProgressBar( false );
                });
            }, 600);
        }
        catch( err ) {
            console.log('ERROR(PinHub.removePin()): ' + err );
           This.showProgressBar( false );
        }
    };

    _public.expandItem = function(e) {
        // http://stackoverflow.com/questions/3326078/jquery-call-function-from-a-string
        try {

            var list_view = $('#pin-list-view-ctrl');

            var _fun = !This.collapseCss ? 'addClass': 'removeClass';

            list_view.find('.template-text')[_fun]('invisible-item');
            list_view.find('.template-pic')[_fun]('invisible-item');
            list_view.find('.template-link span')[_fun]('invisible-item');

            this.collapseCss = !this.collapseCss;

            var tmp_li = list_view.find('li');

            if( this.collapseCss ) {
                tmp_li.css('cursor','pointer');
            }
            else {
                tmp_li.css('cursor','default');
            }
        }
        catch(err) {
            console.log('ERROR(PinHub.expandItem()): ' + err );
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

    function onSearch_Click ( event ){
        try {
            event.preventDefault();

            if( ctrlPin.listPins.length === 0 ) {
                return false;
            }

            var searchValue = $('#input-search-pins').val().toLowerCase();
            if( !isDefine(searchValue) || searchValue === '' ) {
                return false;
            }

            This.showProgressBar( true );

            This.collapseCss = false;

            searchRoutine( searchValue );

            This.showProgressBar( false );

            return false;
        }
        catch(err) {
            console.log('ERROR(PinHub.onSearch_Click()): ' + err );
            return false;
        }
    }

    function onPinMainMenu_Click( event ) {
        try {
            event.preventDefault();

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-template-dlg' );

            if( typeof This.commonHub[fun] === 'function' ) {
                This.commonHub[fun]( This, arg, 'create', null, function( err, pin ) {

                    if( fun === 'showPinItemDlg') {

                        // add new pin to list

                        if( err === false ) {
                            ctrlPin.listPins.push({post: pin});
                            This.refreshUI(ctrlPin.listPins);
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
            console.log('PinHub.onPinMainMenu_Click(): ' + err );
            return false;
        }
    }

    function onUserAction_Click ( event ) {
        try {
            event.preventDefault();

            //This.userPerClick = getUserPerDataTemplate( 'pin-list-view-item-template', event );
            var pinId = getUserPerDataTemplate( 'pin-list-view-item-template', event );
            This.pinData = ctrlPin.getPinById(pinId);

            if( !isDefine(This.pinData))
                return;

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-template-dlg' );

            if( typeof This.commonHub[fun] === 'function' ) {
                This.commonHub[fun]( This, arg, 'edit', This.pinData, function( err, pin ) {

                    if( fun === 'showPinItemDlg') {

                        // edit pin

                        if( err === false ) {
                            //var pinIndex = ctrlPin.getPinIndexById(pin.id);
                            //var pinData = ctrlPin.listPins[pinIndex].post;
                            var pinData = ctrlPin.getPinById(pin.id);
                            pinData.title = pin.title;
                            pinData.msg   = pin.msg;
                            pinData.tags  = pin.tags;
                            pinData.link  = pin.link;
                            pinData.pic   = pin.pic;

                            This.refreshUI(ctrlPin.listPins);
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
            console.log('ERROR(PinHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    function onItemPin_Click( event ) {
        try {
            event.preventDefault();

            var el = event.target;
            var el_tmp = $(event.target).closest('.pin-list-view-item-template');

            if( This.collapseCss ) {

                var _fun = !el_tmp.find('.template-text').hasClass('invisible-item') ? 'addClass': 'removeClass';

                el_tmp.find('.template-text')[_fun]('invisible-item');
                el_tmp.find('.template-pic')[_fun]('invisible-item');
                el_tmp.find('.template-link span')[_fun]('invisible-item');
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(PinHub.onItemPin_Click()): ' + err );
            return false;
        }
    }

    function onItemPinLink_Click( event ) {
        try {
            event.preventDefault();

            var el = event.target;
            var pinLink = $(this).attr('href');

            window.open(pinLink);

            return false;
        }
        catch(err) {
            console.log('ERROR(PinHub.onItemPinLink_Click()): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

    function setUIEvents() {
        try {

            $(document).on("click", ".pin-hub #pin-list-view-ctrl li .template-link a", onItemPinLink_Click );

            $('#btn-input-search-pins').click( onSearch_Click );
            $('#input-search-pins').keyup(function(e) { if(e.keyCode === 13) { onSearch_Click(e); } });

            $(document).on("click", ".pin-hub .th-user-actions li span", onUserAction_Click );

            $(document).on("click", ".pin-hub #pin-list-view-ctrl li", onItemPin_Click );

            $(document).on("click", ".pin-hub ul.th-ul-main-menu li", onPinMainMenu_Click );

            $(document).on("mouseenter", "#pin-list-view-ctrl li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '1.0');
            });
            $(document).on("mouseleave", "#pin-list-view-ctrl li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '0.0');
            });
        }
        catch( err ) {
            console.log('ERROR(PinHub.setUIEvents()): ' + err );
        }
    }

    function searchRoutine( searchValue ) {
        try {
            var searchSplit = searchValue.split(/,| /);

            for( var n = 0; n < searchSplit.length; n++ ) {
                if( searchSplit[n] === '') {
                    searchSplit.splice(n, 1);
                }
            }

            This.searchResults = null;
            This.searchResults = [];

            for( var j = 0; j < searchSplit.length; j++ ) {
                var sValue = searchSplit[j];

                if( sValue === '') return;

                for( var i = 0; i < ctrlPin.listPins.length; i++ ) {
                    var pinCheck = ctrlPin.listPins[i];

                    if( pinCheck.post.title.toLowerCase().indexOf(sValue) > -1 ||
                        pinCheck.post.msg.toLowerCase().indexOf(sValue)   > -1 ||
                        pinCheck.post.tags.toLowerCase().indexOf(sValue)  > -1 ) {

                        // if this 'pin' already in list of result?

                        var isPinExist = false;
                        for( var l = 0; l < This.searchResults.length; l++ ) {
                            var pinIn = This.searchResults[l];

                            if( pinIn.post.id === pinCheck.post.id ) {
                                isPinExist = true;
                                break;
                            }
                        }

                        if( !isPinExist ) {
                            This.searchResults.push( pinCheck );
                        }
                    }
                }
            }

            if( This.searchResults.length > 0 ) {
                This.refreshUI(This.searchResults);
            }

        }
        catch(err) {
            console.log('ERROR(PinHub.searchRoutine()): ' + err );
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
            console.log('ERROR(PinHub.rePositionHub())' + err );
        }
    }

    function bindDataTemplateValues ( index, arg ) {
        try {
            /*
            function hideTemplatePic(tmpImg) {
                //tmpImg.attr('src', '' );
                //tmpImg.css( 'margin-top', '0');
                //tmpImg.css( 'margin-bottom', '0');
                //tmpImg.css( 'visibility', 'hidden');
                tmpImg.css( 'display', 'none');
            }
            */
            function setTemplatePic() {
                if( post.pic === '' ) {
                    //hideTemplatePic(tmpImg);
                    tmpImg.css( 'display', 'none');
                }
                else {
                    tmpImg.attr('src', post.pic );
                }
            }

            if( !isDefine(arg)) {
                return;
            }

            if( !This.pinTemplate) {
                var itemScript   = $('#pin-item-template').html();
                This.pinTemplate = $( itemScript );
            }

            if( This.pinTemplate.length === 0 )
                return;

            var post = arg.post;

            var jsnUser = JSON.stringify(arg.post.id);
            $(This.pinTemplate).find('.template-data span').text(jsnUser);

            $(This.pinTemplate).find('.template-date span').text(post.date);

            var lenTtl = 60;
            $(This.pinTemplate).find('.template-title span')
                .text( post.title.length >= lenTtl ? post.title.slice( 0, lenTtl - 3 ) + '...' : post.title );

            var content = $(This.pinTemplate).find('.template-text span');
            if( post.msg === '') {
                content.closest('div').css( 'margin-top', '0');
                content.text('');
            }
            else {
                var lenMsg = 255;
                content
                    .text(post.msg.length >= lenMsg ? post.msg.slice( 0, lenMsg - 3 ) + '...' : post.msg);
                content.closest('div').css( 'margin-top', '15px');
            }

            var lenLink = 90;
            $(This.pinTemplate).find('.template-link a')
                .text( post.link.length >= lenLink ? post.link.slice( 0, lenLink - 3 ) + '...' : post.link );
            $(This.pinTemplate).find('.template-link a').attr('href', post.link );

            var tmpImg = $(This.pinTemplate).find('.template-pic img');
            setTemplatePic();

            $(This.pinTemplate).find('.template-favicon img').attr('src', post.ico );

            var htmlTemplate = This.pinTemplate[0].outerHTML;
            $("#pin-list-view-ctrl").last().append('<li>' + htmlTemplate + '</li>');

            tmpImg[0].removeAttribute('style');  // remove previous post image.
        }
        catch(err) {
            console.log('ERROR(PinHub.bindDataTemplateValues())' + err );
        }
    }

    return PinHub;

})(thJQ);

th.next.PinController = (function($) {
    var This
        ,_public = PinController.prototype;

    function PinController() {
        This = this;

        this.listPins = [];
        this.favIcon      = null;

        this.Initialize();
    }

    _public.Initialize = function() {
    };

    _public.getFavIcon = function( callback ) {
        try {

            function checkIconUrl( icon_url, callback) {
                try {
                    if( icon_url === '') {
                        sendCallBack(callback(icon_url));
                    }
                    else {
                        $("<img>", {
                            src: icon_url,
                            error: function() {
                                sendCallBack(callback(""));
                            },
                            load: function() {
                                sendCallBack(callback(icon_url));
                            }
                        });
                    }
                }
                catch(err) {
                    console.log('ERROR(PinController.getFavIcon.checkIconUrl())' + err );
                }
            }

            function getFavIconUrlByDomain() {
                try {
                    var urlFavIcon = "";

                    var domain = getDomain();

                    if( domain.indexOf('http://www.') > -1 ) {
                        urlFavIcon   = encodeURI( removeLineBreaks( domain + '/favicon.ico'));
                    }
    //            else if( domain.indexOf('http://') > -1 ) {
    //                pin.ico   = encodeURI( removeLineBreaks( getDomain() + '/favicon.ico'));
    //            }
                    else if( domain.indexOf('www.') > -1 ) {
                        urlFavIcon   = encodeURI( removeLineBreaks( 'http://' + domain + '/favicon.ico'));
                    }
                    else {
                        urlFavIcon   = encodeURI( removeLineBreaks( 'http://www.' + domain + '/favicon.ico'));
                    }

                    return urlFavIcon;
                }
                catch(err) {
                    console.log('ERROR(PinController.getFavIcon.getFavIconUrlByDomain())' + err );
                    return null;
                }
            }

            var urlFavIcon = getFavIconUrlByDomain();

            checkIconUrl( urlFavIcon, function( result ) {
                if( result === '') {

                    urlFavIcon = getFaviconPage();

                    if( urlFavIcon.indexOf('http') < 0 ) {
                        var domain = getDomain();
                        urlFavIcon = 'http://' + domain + urlFavIcon;
                    }

                    checkIconUrl( urlFavIcon, function( result ) {
                        sendCallBack(callback(result));
                    });
                }
                else {
                    sendCallBack(callback(result));
                }
            });
        }
        catch(err) {
            console.log('ERROR(PinController.getFavIcon())' + err );
        }
    };

    _public.getPins = function( userOwner, callback ) {
        try {
            // if we need refresh, delete This.listPins = []; first

            if( This.listPins.length > 0)
                return;

            if(!isDefine( userOwner ))
                return;

            var req = 'get-n-last-pin-posts';
            var request = {
                dbcall:       'db-get'
                , dbcollection: 'pin'
                , dbrequest:    {
                    'owner': userOwner.id
                }
                , dbreturn : {
                    'post':1        // what object of record have to return
                }
//                , dblimit: {
//                    'limit': 4     // how many record have to return
//                }
            };

            var ajaxData = JSON.stringify(request);

            function success_call( data, textStatus, jqXHR ) {

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( typeof parser.param === "object" ) {

                        This.listPins = parser.param;

                        sendCallBack(callback( true ));

                        return;
                    }
                }

                sendCallBack(callback( false ));
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[PinController.getPins()]: ' + errorThrown );

                sendCallBack(callback( false));
            }

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(PinController.getPins())' + err );
        }
    };

    //_public.addPin = function( pin, _This, callback  ) {
    _public.addPin = function( pin, callback  ) {
        try {

            if( !isDefine(pin)) {
                return;
            }

            //pin.msg   = encodeURIComponent( removeLineBreaks( pin.msg ));
            //pin.tags  = encodeURIComponent( removeLineBreaks( pin.tags ));
            //pin.title = isDefine(pin.title) ? encodeURIComponent( removeLineBreaks( pin.title )) : '';
            //pin.link  = isDefine(pin.link) ? encodeURIComponent( removeLineBreaks( pin.link )) : '';
            //pin.pic   = isDefine(pin.pic) ? encodeURIComponent( removeLineBreaks( pin.pic )) : '';

            encodePin(pin);
            pin.ico   = This.favIcon;

            var req     = 'add-pin-post';
            var request = {
                dbcall:        'db-add',
                dbcollection:  'pin',
                dbrequest:      {
                      'owner':  getUser().id
                    , 'post':   {
                            'id':   GUID()
                        , 'date':   getCurrentDate()
                        , 'title':  pin.title
                        , 'msg':    pin.msg
                        , 'link':   pin.link
                        , 'pic':    pin.pic
                        , 'tags':   pin.tags
                        , 'ico':    pin.ico
                        , 'comments': []
                    }
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {},
                function( jqXHR, textStatus, errorThrown ) {});

            // update UI

            decodePin( request.dbrequest.post );

            sendCallBack(callback( false, request.dbrequest.post ));
        }
        catch(err) {
            console.log('ERROR(PinController.addPin())' + err );
        }
    };

    _public.removePin = function( pin, callback  ) {
        try {

            if( !isDefine(pin)) {
                sendCallBack(callback());
            }

            var req     = 'remove-pin-post';
            var request = {
                dbcall:        'db-remove',
                dbcollection:  'pin',
                dbfind:        {
                    'owner':   getUser().id,
                    'post.id': pin.id
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {},
                function( jqXHR, textStatus, errorThrown ) {});

            sendCallBack(callback());    // we don't wait for http-response
        }
        catch(err) {
            console.log('ERROR(PinController.removePin())' + err );
        }
    };

    _public.updatePin = function( pin, callback  ) {
        try {

            if( !isDefine(pin)) {
                return;
            }

            //pin.msg   = encodeURIComponent( removeLineBreaks( pin.msg ));
            //pin.tags  = encodeURIComponent( removeLineBreaks( pin.tags ));
            //pin.title = isDefine(pin.title) ? encodeURIComponent( removeLineBreaks( pin.title )) : '';
            //pin.link  = isDefine(pin.link) ? encodeURI( removeLineBreaks( pin.link )) : '';
            //pin.pic   = isDefine(pin.pic) ? encodeURI( removeLineBreaks( pin.pic )) : '';

           encodePin(pin);

            var req     = 'update-pin-post';
            var request = {
                dbcall:        'db-update',
                dbcollection:  'pin',
                dbfind:        { 'owner': getUser().id, 'post.id': pin.id },
                dbupdate:      { '$set': {
                      'post.title':  pin.title
                    , 'post.msg':    pin.msg
                    , 'post.link':   pin.link
                    , 'post.pic':    pin.pic
                    , 'post.tags':   pin.tags
                }}
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {},
                function( jqXHR, textStatus, errorThrown ) {});

            // update UI

            decodePin( pin );

            sendCallBack(callback( false, pin ));    // we don't wait for http-response
        }
        catch(err) {
            console.log('ERROR(PinController.updatePin())' + err );
        }
    };

    _public.getPinById = function (pinId) {
        try {

            if( !isDefine(pinId)) {
                return null;
            }

            for( var i = 0; i < This.listPins.length; i++ ) {
                var pin = This.listPins[i].post;
                if( pin.id === pinId) {
                    return pin;
                }
            }

            return null;
        }
        catch(err) {
            console.log('ERROR(PinController.getPinById()): ' + err );
            return null;
        }
    };

    _public.getPinIndexById = function (pinId) {
        try {

            if( !isDefine(pinId)) {
                return -1;
            }

            for( var i = 0; i < This.listPins.length; i++ ) {
                var pin = This.listPins[i].post;
                if( pin.id === pinId) {
                    return i;
                }
            }

            return -1;
        }
        catch(err) {
            console.log('ERROR(PinController.getPinIndexById()): ' + err );
            return -1;
        }
    };

    // --------------------------------------------------------------- Support functions

    function decodePin( pin ) {
        try {
            pin.msg   = decodeURIComponent( pin.msg );
            pin.tags  = decodeURIComponent( pin.tags );
            pin.title = decodeURIComponent( pin.title );
            pin.link  = decodeURIComponent( pin.link );
            pin.pic   = decodeURIComponent( pin.pic );
        }
        catch(err) {
            console.log('ERROR(PinController.decodePin())' + err );
        }
    }

   function encodePin( pin ) {
      try {
         pin.msg   = encodeURIComponent( removeLineBreaks( pin.msg ));
         pin.tags  = encodeURIComponent( removeLineBreaks( pin.tags ));
         pin.title = isDefine(pin.title) ? encodeURIComponent( removeLineBreaks( pin.title )) : '';
         pin.link  = isDefine(pin.link) ? encodeURI( removeLineBreaks( pin.link )) : '';
         pin.pic   = isDefine(pin.pic) ? encodeURI( removeLineBreaks( pin.pic )) : '';
      }
      catch(err) {
         console.log('ERROR(PinController.encodePin())' + err );
      }
   }

    return PinController;

})(thJQ);
