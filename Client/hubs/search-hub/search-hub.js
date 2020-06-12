/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013, 5/24/13
 * product: Web-Communicator ( TypeHello ) Channel2Channel ( OST )
 * file:    search-hub.js
 */

var th  = th || {};
th.next = th.next || {};

th.next.SearchHub = (function($) {
    var This
        ,_public = SearchHub.prototype;

    function SearchHub() {
        This = this;
        this.cssClassHub = '.search-hub';

        this.scanTimerId    = null;

        this.searchTemplate = null;
        this.searchPanel    = null;

        this.hubStatus      = statusHub.not_active;
        this.userPerClick   = null;
        this.argsDlgFilter  = {};

        this.feedbackClass  = ".search-hub-dlg-feedback";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {

            if( !ctrlSearch ) {
                ctrlSearch  = new th.next.SearchController();
            }

            feelSelectRadarLocation();

            This.txt_search = $('#input-search-panel');
            This.txt_search.keyup( onTextSearch_Enter );
            setTimeout( function() {
                This.txt_search.focus();
            }, 600 );

            This.searchPanel = $('.search-hub .search-list');

            This.commonHub.removeMainMenuItem( This, 'search');

            this.initHub();

            This.commonHub.setHubPosition( This );

            $('.search-hub ul.th-ul-main-menu').css('display', 'none'); // hide filter

            this.hubStatus = statusHub.initialized;

           setUIEvents();
        }
        catch(err) {
            console.log('ERROR[SearchHub.Initialize()]: ' + err );
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

    function onTextSearch_Enter(event) {
        try {
            event.preventDefault();

            if(event.keyCode === 13) {
                searchSwitch();
                return false;
            }

            var el  = event.target;
            var txt_value = el.value;

            var op_value = '.3';
            if( txt_value.length > 0 ) {
                op_value = '1';
            }

            This.btn_search.css('opacity', op_value );

            This.argsDlgFilter = {};    // if we change text-value automaticaly we reset filter-value

            return false;
        }
        catch(err) {
            console.log('ERROR(SearchHub.onTextSearch_Enter()): ' + err);
            return false;
        }
    }

    function onUserAction_Click ( event ) {
        try {
            event.preventDefault();

            This.userPerClick = getUserPerDataTemplate( 'search-list-view-item-template', event);

            var el       = event.target;
            var action   = el.getAttribute( 'data-action' );
            var fun      = el.getAttribute( 'data-action-dlg' );
            var template = '.' + el.getAttribute( 'data-template-dlg' );

            // Example:
            // data-action="profile"
            // data-action-dlg="showProfileDlg"
            // data-template-dlg="search-hub-dlg-profile"
            // This.commonHub.showProfileDlg( This, data-template-dlg.VALUE );

            if( action === 'friends') {

                if( This.userPerClick.id === getUser().id ) {
                    showMessageDlg("You can't make friend of yourself :)");
                    return false;
                }

                This.showProgressBar( true );

                This.commonHub.getHub( ctrlPerson, 'person-hub', function( reference ) {
                    if( reference.init ) {
                        ctrlPerson = new th.next.PersonController();
                    }

                    setTimeout(function() {
                        ctrlPerson.isPersonOfUserCallback( getUser(), This.userPerClick, 'friend', function(result) {
                            This.showProgressBar( false );

                            if( result === 1 ) {
                                showMessageDlg( "This user already in your person's list" );
                            }
                            else {
                                This.commonHub[fun]( This, template, function( params ) {});
                            }
                        });
                    }, 600 );

                });
            }
            else {
                This.commonHub[fun]( This, template, function( params ) {});
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(SearchHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    function onSearchMainMenu_Click( event ) {
        try {
            event.preventDefault();

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-dlg' );
            var f   = 'show' + fun;

             /*
            This.commonHub[f]( This, arg, function( args ) {
                if( fun === 'DlgPerFilter' ) {
                    if(args !== null ) {
                        This.argsDlgFilter = args;  // args is set

                        This.btn_search.css('opacity', '1' );

                        // set text-search
                        var txt_request = '';
                        for( var i in args ) {
                            if( args.hasOwnProperty(i)) {
                                var item = args[i];
                                txt_request += item + ' ';
                            }
                        }
                        This.txt_search.val(txt_request);
                    }
                }
            });
            */

            This.argsDlgFilter = {};

            This.commonHub[f]( This, arg, function() {
                if( fun === 'DlgPerFilter' ) {

                    if( JSON.stringify(This.argsDlgFilter) === '{}' ) {
                        return;
                    }

                    // set search value to 'input-search-panel'

                    var search_request = '';
                    for( var i in This.argsDlgFilter ) {
                        if( This.argsDlgFilter.hasOwnProperty(i)) {
                            var item = This.argsDlgFilter[i];
                            search_request += item + ' ';
                        }
                    }
                    search_request = search_request.trim();
                    This.txt_search.val(search_request);

                    var btn_opacity = '1';
                    if( search_request === '') {
                        btn_opacity = '.3';
                    }
                    This.btn_search.css('opacity', btn_opacity );
                }
            });

            return false;
        }
        catch(err) {
            console.log('ERROR[SearchHub.onSearchMainMenu_Click():] ' + err );
            return false;
        }
    }

    function onStartSearch_Click( e ) {
        try {

            e.preventDefault();

            searchSwitch();

            return false;
        }
        catch(err) {
            console.log('ERROR(SearchHub.onStartSearch_Click()): ' + err);
            uiActivateSearch(false);
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

   function setUIEvents() {
      try {
         $(document).on("click", ".search-hub ul.th-ul-main-menu li", onSearchMainMenu_Click );

         $(document).on("click", ".search-hub .th-user-actions li span", onUserAction_Click );

         This.btn_search = $('#btn-search-routine');
         This.btn_search.click( onStartSearch_Click );
         This.btn_search.css('opacity', '.3' );

      }
      catch( err ) {
         console.log('ERROR(SearchHub.setUIEvents()): ' + err );
      }
   }

    function searchSwitch() {
        try {

            cleanSearchPanel();

            var s_value = This.txt_search.val();

            if( s_value === '' ) {
                This.commonHub.showInfoDlg(
                    This,
                    '.search-hub-dlg-info',
                    "Hey, need arguments for search, type it or click filter button !",
                    function( params ) {});
            }
            else if( isDefine(This.argsDlgFilter) && JSON.stringify(This.argsDlgFilter) !== '{}') {
                searchFilterRoutine();
            }
            else {
                searchTextRoutine();
            }
        }
        catch ( err ) {
            console.log('ERROR(SearchHub.searchSwitch()): ' + err);
        }
    }

    function searchFilterRoutine() {
        try {

            if( This.hubStatus === statusHub.data_load )
                return;

            // search routine.

            function success_call( data, textStatus, jqXHR ) {

                uiActivateSearch( false );

                try {
                    if(isJsonData(data)) {
                        var parser = JSON.parse(data);

                        if( typeof parser.param === "object" ) {
                            var users = parser.param;

                            for( var i = 0; i < users.length; i++) {
                                bindDataTemplateValues(i, users[i]);
                            }

                            return;
                        }
                    }

                    This.commonHub.showInfoDlg(
                        This,
                        '.search-hub-dlg-info',
                        'Oops, nobody here :(',
                        function( params ) {});
                }
                catch(err) {
                    console.log('FAIL-PARSING[SearchHub->ctrlSearch.startSearch()]: ' + err);
                    This.hubStatus = statusHub.data_loaded_err;
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[SearchHub->ctrlSearch.startSearch()]: ' + errorThrown );

                uiActivateSearch( false );

                This.hubStatus = statusHub.data_loaded_err;
            }

            setTimeout( function() {
                var search_request = {
                    radarLocation:  $('.search-hub .radar-location').val(),
                    activeChannel: getActiveChannel(),
                    limit: 15
                };

                for( var i in This.argsDlgFilter ) {
                    if( This.argsDlgFilter.hasOwnProperty(i)) {
                        var item = This.argsDlgFilter[i];
                        if( item !== '') {
                            search_request[i] = item;
                        }
                    }
                }

                ctrlSearch.startSearch( 'search-per-filter', search_request, success_call, error_call );

            }, 600 );

            uiActivateSearch( true );
        }
        catch (err) {
            console.log('ERROR(SearchHub.searchFilterRoutine()): ' + err);
        }
    }

    function searchTextRoutine() {
        try {

            if( This.hubStatus === statusHub.data_load )
                return;

            // search routine.

            function success_call( data, textStatus, jqXHR ) {

                uiActivateSearch( false );

                try {
                    if(isJsonData(data)) {
                        var parser = JSON.parse(data);

                        if( typeof parser.param === "object" ) {
                            var users = parser.param;

                            for( var i = 0; i < users.length; i++) {
                                bindDataTemplateValues(i, users[i]);
                            }

                            return;
                        }
                    }

                    This.commonHub.showInfoDlg(
                        This,
                        '.search-hub-dlg-info',
                        'Oops, nobody here :(',
                        function( params ) {});
                }
                catch(err) {
                    console.log('FAIL-PARSING[SearchHub->ctrlSearch.startSearch()]: ' + err);
                    This.hubStatus = statusHub.data_loaded_err;
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[SearchHub->ctrlSearch.startSearch()]: ' + errorThrown );

                uiActivateSearch( false );

                This.hubStatus = statusHub.data_loaded_err;
            }

            setTimeout( function() {

                var search_request = {
                    radarLocation:  $('.search-hub .radar-location').val(),
                    activeChannel:  encodeURIComponent(getActiveChannel()),
                    txt_search:     This.txt_search.val(),
                    limit:          18
                };

                ctrlSearch.startSearch(
                    'search-per-text',
                    search_request,
                    success_call,
                    error_call );

            }, 600 );

            uiActivateSearch( true );
        }
        catch (err) {
            console.log('ERROR(SearchHub.searchTextRoutine()): ' + err);
        }
    }

    function feelSelectRadarLocation() {
        try {
            var radarLocation = $(".search-hub .radar-location");

            // set values

            for(var key in searchLocation ) {
                if( searchLocation.hasOwnProperty(key)) {
                    var value = searchLocation[key];

                    var opt = document.createElement('option');
                    opt.innerHTML = value;
                    opt.value = key;

                    radarLocation[0].appendChild(opt);
                }
            }
        }
        catch(err) {
            console.log('ERROR(SearchHub.feelSelectRadarLocation()): ' + err);
        }
    }

    function showMessageDlg( content ) {
        This.commonHub.showInfoDlg(
            This,
            '.search-hub-dlg-info',
            content,
            function( params ) {});
    }

    function uiActivateSearch( _activate ) {
        try {
            if( _activate ) {

                This.showProgressBar(true);
                startScanner();

                cleanSearchPanel();

                This.hubStatus = statusHub.data_load;   // start load data.

                This.btn_search.css('opacity', '.3' );
            }
            else {

                This.showProgressBar(false);
                stopScanner();

                This.searchPanel.css( 'display', 'block' );

                This.hubStatus = statusHub.data_loaded;

                This.btn_search.css('opacity', '1' );
            }
        }
        catch(err) {
            console.log('ERROR(SearchHub.uiActivateSearch()): ' + err);
        }
    }

    function startScanner() {

        try {
            var $rad = $('#scanner'),
                d = 0;

            (function rotate() {
                $rad.css({ transform: 'rotate('+ d +'deg)'}); // apply CSS3
                This.scanTimerId = setTimeout(function() {
                    ++d;         // next degree
                    rotate();    // recall function
                }, 25);          // every 25ms
            })();
        }
        catch(err) {
            console.log('ERROR(SearchHub.startScanner()): ' + err);
        }
    }

    function stopScanner() {

        try {
            clearInterval(This.scanTimerId);
            This.scanTimerId = null;
        }
        catch(err) {
            console.log('ERROR(SearchHub.stopScanner()): ' + err);
        }
    }

    function bindDataTemplateValues ( index, arg ) {
        try {
            if( !isDefine(arg)) {
                return;
            }

            if( !This.searchTemplate) {
                var tmplScript   = $('#search-item-template').html();
                This.searchTemplate = $( tmplScript );
            }

            if( This.searchTemplate.length == 0 )  return;

            var user = arg;

            var jsnUser = JSON.stringify(user);
            $(This.searchTemplate).find('.template-data span').text(jsnUser);

            $(This.searchTemplate).find('.template-date span').text(user.date);

            var shortProfile = getStrUserShortProfile(user);
            $(This.searchTemplate).find('.template-text span').text(shortProfile);

            $(This.searchTemplate).find('.template-nick span').text(user.nick);

            var imgDiv  = (This.searchTemplate).find('.template-image');
            This.commonHub.setUserIcon( imgDiv, user);
//            if(user.gender === 'female') {
//                imgDiv.removeClass('user-image-male').addClass('user-image-female');
//            }
//            else {
//                imgDiv.removeClass('user-image-female').addClass('user-image-male');
//            }

            var htmlTemplate = (This.searchTemplate)[0].outerHTML;
            var itemVisible = htmlTemplate.replace( "template-item", "" );
            $("#search-list-view-ctrl").append('<li>' + itemVisible + '</li>');

            imgDiv[0].removeAttribute('style');  // remove previous pic.
        }
        catch(err) {
            console.log('ERROR(SearchHub.bindDataTemplateValues()): ' + err);
        }
    }

    function cleanSearchPanel() {
        try {
            $('#search-list-view-ctrl li').remove();

            This.searchPanel.css( 'display', 'none' );
        }
        catch(err) {
            console.log('ERROR(SearchHub.cleanSearchPanel()): ' + err);
        }
    }

    return SearchHub;

})(thJQ);

th.next.SearchController = (function($) {
    var This
        ,_public = SearchController.prototype;

    function SearchController() {
        This = this;

        this.Initialize();
    }

    _public.Initialize = function() {
    };

    _public.startSearch = function( http_reg, search_request, success_call, error_call) {
        try {
            if(!isDefine( search_request )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            var ajaxData = JSON.stringify( search_request );

            ajaxCall( pathServer + http_reg, http_reg + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(SearchController.startSearch()): ' + err);
        }
    };

    return SearchController;

})(thJQ);
