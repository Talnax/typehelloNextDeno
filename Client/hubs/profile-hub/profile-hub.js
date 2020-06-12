/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    profile-hub.js
 */

var th = th || {};
th.next = th.next || {};

th.next.ProfileHub = (function($) {
    var This
        , _public = ProfileHub.prototype;

    var profile_expander = {
        required:    0,
        recommended: 1,
        extended:    2
    }

    function ProfileHub() {
        This               = this;
        this.cssClassHub   = '.profile-hub';
        this.hubStatus     = statusHub.not_active;

        this.activeExpander = null;

        this.userImageData = null;

        this.feedbackClass = ".profile-hub-dlg-feedback";
        this.settingsClass = ".profile-hub-dlg-settings";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {

            if( !ctrlProfile ) {
                ctrlProfile  = new th.next.ProfileController();
            }

            This.commonHub.removeMainMenuItem( This, 'profile');

            this.initHub();

            This.commonHub.setHubPosition( This );

            This.setLanguage = $("#th-read-lng");
            This.setCountry  = $("#th-read-country");
            This.setGender   = $("#th-read-gender");

            This.expRecommended = $(".th-profile-recommended");
            This.expExtended    = $(".th-profile-extended");

            This.btnRecommended = $('#btn-expander-recommended');
            This.btnExtended    = $('#btn-expander-extended');

            setUIEvents();

            This.hubStatus = statusHub.initialized;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.Initialize()): ' + err);
        }
    };

    _public.showFullProfile = function (user) {
        try {
            if(!isDefine( user )) return;

            if( This.hubStatus >= statusHub.load_data ) return;

            // read only values.

            showMinimumProfile( user );

            showRecommendedProfile( user );

            loadProfile(user);
        }
        catch(err) {
            console.log('ERROR(ProfileHub.showFullProfile()): ' + err);
        }
    };

    _public.showFirstTime = function (user) {
        try {

            This.showFullProfile(user);

            setActiveExpander( profile_expander.recommended );

            setTimeout(function() {
                var content =
                    "<span class='th-bold th-font-18'>Hello " + getUser().nick + "</span> !<br><br>" +
                    "A little advise, just spend less than " +
                    "<span class='th-bold th-font-18'>15</span> seconds for filling your profile.<br><br>" +
                    "In this case people can see you and share news and interests.<br><br>" +
                    //"Also you can send SMS, find friends and leave comments on web-page.<br><br><br>" +
                    //"Have Fun" +
                    "- TypeHello Team :)";
                showMessageDlg( content );
            }, 600);
        }
        catch(err) {
            console.log('ERROR(ProfileHub.showFullProfile()): ' + err);
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

    function onSubmitProfile_Click( e ) {
        try {
            e.preventDefault();

            function success_call( data, textStatus, jqXHR ) {
                if(isJsonData(data)) {
                  var parser = JSON.parse(data);
                  This.showProgressBar(false);
                  This.hubShow(false);
                }
            }

            var user = getUser();

            var dbupdate = getUpdatedRequest( user );

            if(!isDefine(dbupdate))
                return false;

            var request = {
                dbcall:        'db-update',
                dbcollection:  'users',
                dbfind:        { 'id': user.id, 'nick': user.nick },
                dbupdate:      { '$set': dbupdate }
            };

            setTimeout( function() {
                ctrlProfile.updateFullProfile
                   ( user,
                    request,
                    success_call,
                    function ( jqXHR, textStatus, errorThrown ) {
                        This.showProgressBar(false);
                        console.log( 'ERROR[ProfileHub->ctrlProfile.getFullProfile()]: ' + errorThrown );
                        This.hubShow(false);
                    });
            }, 600 );

            This.showProgressBar(true);

            return false;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.onSubmitProfile_Click()): ' + err);
            This.showProgressBar(false);
            return false;
        }
    }

    function onImage_Click(e) {
        try {
            e.preventDefault();

            var user = getUser();

            var pathFile = e.target.files[0];
            loadFileAsDataURL(pathFile, function() {
                if( This.userImageData !== null && This.userImageData !== undefined ) {
                    $('.profile-hub .th-section .user-profile-picture')
                    .css( 'background-image', 'url(' + This.userImageData + ')');
                }
            });

            return false;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.onImage_Click()): ' + err);
            return false;
        }
    }

    function onExpanderRecommended_Click(e) {
        try {
            e.preventDefault();

            setActiveExpander( profile_expander.recommended );

            return false;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.onExpanderRecommended_Click()): ' + err);
            return false;
        }
    }

    function onExpanderExtended_Click(e) {
        try {
            e.preventDefault();

            setActiveExpander( profile_expander.extended );

            return false;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.onExpanderExtended_Click()): ' + err);
            return false;
        }
    }

    function onSelectGender_Click(e) {
        try {
            e.preventDefault();

            var gender = event.target.value;

            setStandardValue( This.setGender, gender );

            var userPic = This.elPic.val() === '' ? '' : This.elPic.val();

            var user = {
                gender: gender,
                pic:    userPic // getUser().pic
            };

            This.commonHub.setUserIcon( This.userPic, user );

            return false;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.onSelectGender_Click()): ' + err);
            return false;
        }
    }

    function onSelectCountry_Click(e) {
        try {
            e.preventDefault();

            var country = event.target.value;

            setStandardValue( This.setCountry, country );

            This.setCountry.text(country);

            return false;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.onSelectCountry_Click()): ' + err);
            return false;
        }
    }

    function onSelectLanguage_Click(e) {
        try {
            e.preventDefault();

            var language = event.target.value;

            setStandardValue( This.setLanguage, language );

            This.setLanguage.text(language);

            return false;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.onSelectLanguage_Click()): ' + err);
            return false;
        }
    }

    function onProfileImage_Enter( event ) {
        try {
            event.preventDefault();

            var image = event.target.value;

            var user = {
                gender: getUser().gender,
                pic: image
            };

            This.commonHub.setUserIcon(This.userPic, user );

            return false;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.onProfileImage_Enter()): ' + err );
            return false;
        }
    }

    function onBtnInfo_Click( event ) {
        try {
            event.preventDefault();

            var da = $(this).attr('data-action');

            var msg;

            if( da === 'recommended-info') {
                msg = 'Those info help you be more transparent, set your online picture, language and country';
            }
            else {
                msg = 'Additional information give you chance, find another persons with same interest like you.<br><br>' +
                    'Also say few word about your hobbies and share passion of your site, if you have one :)'
            }

            showMessageDlg(msg);

            return false;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.onBtnInfo_Click()): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

    function setUIEvents() {
        try {

            This.elPic = $('#th-profile-picture');
            This.elPic.blur(function(e) {
                onProfileImage_Enter(e);
            });

            $(document).on("click", ".profile-hub .th-article-expander-block .th-glyph", onBtnInfo_Click );

            $('#btn-submit-profile').click( onSubmitProfile_Click );

            $('#btn-expander-recommended').click( onExpanderRecommended_Click );

            $('#btn-expander-extended').click( onExpanderExtended_Click );

            $('#th-profile-gender').change( onSelectGender_Click );

            $('#th-profile-country').change( onSelectCountry_Click );

            $('#th-profile-language').change( onSelectLanguage_Click );
        }
        catch( err ) {
            console.log('ERROR(ProfileHub.setUIEvents()): ' + err );
        }
    }

    function showMessageDlg( content ) {
        This.commonHub.showInfoDlg(
            This,
            '.profile-hub-dlg-info',
            content,
            function( params ) {}
        );
    }

    function setActiveExpander( active_expander ) {
        // http://jsfiddle.net/mblase75/fa5Wn/
        // http://stackoverflow.com/questions/5041494/manipulating-css-pseudo-elements-using-jquery-e-g-before-and-after
        try {

            if(!isDefine( active_expander )) return;

            This.expRecommended.css('display', 'none' );
            This.expExtended.css('display', 'none' );

            This.btnExtended.removeClass('special');
            This.btnRecommended.removeClass('special');

            if( This.activeExpander === active_expander ) {
                This.activeExpander = null; // expander'S closed
                return;
            }

            This.activeExpander = active_expander;

            if ( active_expander === profile_expander.recommended ) {
                This.expRecommended.css('display', 'block' );
                This.btnRecommended.addClass('special');
                This.btnExtended.removeClass('special');
            }
            else {
                This.expExtended.css('display', 'block' );
                This.btnExtended.addClass('special');
                This.btnRecommended.removeClass('special');
            }
        }
        catch(err) {
            console.log('ERROR(ProfileHub.setActiveExpander()): ' + err);
        }
    }

    function showMinimumProfile( user ) {
        try {
            if(!isDefine( user )) return;

            $("#th-read-nick").text(user.nick);

            setStandardValue(This.setLanguage, user.language);

            setStandardValue(This.setCountry, user.country);

            setStandardValue(This.setGender, user.gender);
        }
        catch(err) {
            console.log('ERROR(ProfileHub.showMinimumProfile()): ' + err);
        }
    }

    function setStandardValue ( el_html, value ) {
       try {
           if(!isDefine( el_html )) return;
           if(!isDefine( value )) return;

           el_html.text(value);

           checkUndefineValue( el_html, value );
       }
       catch(err) {
           console.log('ERROR(ProfileHub.setStandardValue()): ' + err);
       }
    }

    function checkUndefineValue( el_html, value ) {
        try {
            if(!isDefine( el_html )) return;
            if(!isDefine( value )) return;

            var show = value === 'undefine' ? true : false;

            showAlertColor( el_html, show );
        }
        catch(err) {
            console.log('ERROR(ProfileHub.checkUndefine()): ' + err);
        }
    }

    function showRecommendedProfile( user ) {
        try {
            if(!isDefine( user )) return;

            $('#th-profile-gender').val(user.gender.toLowerCase());
            $('#th-profile-country').val(user.country.toLowerCase());
            $('#th-profile-language').val(user.language.toLowerCase());

            setProfilePic(user);
        }
        catch(err) {
            console.log('ERROR(ProfileHub.showRecommendedProfile()): ' + err);
        }
    }

    function setProfilePic(user) {
        try {
            if( !isDefine(This.userPic)) {
                This.userPic = $('.profile-hub .th-section .user-profile-picture');
            }

            This.commonHub.setUserIcon(This.userPic, user );
        }
        catch(err) {
            console.log('ERROR(setProfilePic()): ' + err);
        }
    }

    function loadProfile(user) {
        try {
            function success_call( data, textStatus, jqXHR ) {
                This.hubStatus = statusHub.data_loaded;
                This.showProgressBar( false );

                try {
                    if(isJsonData(data)) {
                        var parser = JSON.parse(data);
                        user = parser.param[0];
                        bindReadWriteProfile( user );
                    }
                }
                catch(err) {
                    console.log('FAIL-PARSING[ProfileHub->ctrlSms.getFullProfile()]: ' + err);
                    This.hubStatus = statusHub.data_loaded_err;
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log( 'ERROR[ProfileHub->ctrlProfile.getFullProfile()]: ' + errorThrown );
                This.showProgressBar( false );
                This.hubStatus = statusHub.data_loaded_err;
            }

            setTimeout( function() {
                ctrlProfile.getFullProfile( user, success_call, error_call );
            }, 600 );

            This.showProgressBar( true );
        }
        catch(err) {
            console.log('ERROR(ProfileHub.reloadProfile()): ' + err);
            This.showProgressBar( false );
        }
    }

    function loadFileAsDataURL (file, callback)  {
        // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
        try {
            var reader = new FileReader();

            reader.onload = function(data) {
                if(This.userImageData !==  data.target.result ) {
                    This.userImageData = data.target.result;
                }
                sendCallBack(callback());
            };

            reader.readAsDataURL(file);
        }
        catch(err) {
            console.log('ERROR(ProfileHub.loadFileAsDataURL()): ' + err);
        }
    }

    function bindReadWriteProfile ( user ) {
        try {
            if(!isDefine(user)) return;

            This.elPic.val(isDefine(user.pic) ? decodeURIComponent(user.pic)  : '');

            $('#th-profile-city').val(isDefine(user.city) ? decodeURIComponent(user.city) : '');

            $('#th-profile-site').val(isDefine(user.site) ? decodeURIComponent(user.site) : '');

            $('#th-profile-about-me').text(isDefine(user.about_me) ? decodeURIComponent(user.about_me) : '');

            $('#th-profile-hobbies').text(isDefine(user.hobby) ? decodeURIComponent(user.hobby) : '');

            $('#th-profile-interests').text(isDefine(user.interests) ? decodeURIComponent(user.interests) : '');
        }
        catch(err) {
            console.log('ERROR(ProfileHub.bindFullProfile()): ' + err);
        }
    }

    function getUpdatedRequest( user ) {
        try {
            var data = getReadWriteProfileValues();

            var dbupdate = null;

            for( var prop in data ) {
                if( user.hasOwnProperty(prop) &&
                    data.hasOwnProperty(prop)) {

                    if( user[prop] !== data[prop]) {
                        if( dbupdate === null ) {
                            dbupdate = {};
                        }

                        dbupdate[prop] = data[prop];
                        user[prop]     = data[prop];
                    }
                }
                else {
                    if( dbupdate === null ) {
                        dbupdate = {};
                    }

                    dbupdate[prop] = data[prop];
                    user[prop]     = data[prop];
                }
            }

            if( isDefine(data.pic) && data.pic !== user.pic ) {
                user.pic = data.pic;
                setUser(user);
                setProfilePic(user);
            }

            return dbupdate;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.getUpdatedRequest()): ' + err);
            return null;
        }
    }

    function getReadWriteProfileValues() {
        try {
            var data = {};

            data.gender     = encodeURIComponent(removeLineBreaks($('#th-profile-gender').val()));
            data.country    = encodeURIComponent(removeLineBreaks($('#th-profile-country').val()));
            data.language   = encodeURIComponent(removeLineBreaks($('#th-profile-language').val()));

            data.city       = encodeURIComponent(removeLineBreaks($('#th-profile-city').val()));
            data.site       = encodeURIComponent(removeLineBreaks($('#th-profile-site').val()));

            data.hobby      = encodeURIComponent(removeLineBreaks($('#th-profile-hobbies').val()));
            data.hobbies    = data.hobby.split('%2C');

            data.interest   = encodeURIComponent(removeLineBreaks($('#th-profile-interests').val()));
            data.interests = data.interest.split('%2C');

            data.pic = encodeURIComponent(removeLineBreaks(This.elPic.val().trim()));

            return data;
        }
        catch(err) {
            console.log('ERROR(ProfileHub.getReadWriteProfileValues()): ' + err);
            return null;
        }
    }

    function updateUserProperties( user, update) {
        try {
            for (var prop in update) {
                if (update.hasOwnProperty(prop) &&
                    user.hasOwnProperty(prop)) {
                    user[prop] = update[prop];
                }
            }
        }
        catch(err) {
            console.log('ERROR(ProfileHub.updateUserProperties()): ' + err);
        }
    }

    function showAlertColor( el_html, show ) {
        try {
            if( show ) {
                //el_html.addClass('color-alert');
                el_html[0].setAttribute("style", "color: red");
            }
            else {
                //el_html.removeClass('color-alert');
                el_html[0].removeAttribute('style');
            }
        }
        catch(err) {
            console.log('ERROR(ProfileHub.setAlertColor()): ' + err);
        }
    }

    return ProfileHub;

})(thJQ);

th.next.ProfileController = (function($) {
    var This
        ,_public = ProfileController.prototype;

    function ProfileController() {
        This = this;

        this.Initialize();
    }

    _public.Initialize = function() {
    };

    _public.getFullProfile = function( userForAction, success_call, error_call ) {
        try {
            if(!isDefine( userForAction )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            var req       = 'get-full-profile';
            var request = {
                dbcall:        'db-find',
                dbcollection:  'users',
                //dbrequest:      { 'id': userForAction.id, 'nick': userForAction.nick }
                dbrequest:      { 'id': userForAction.id }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(): ' + err);
        }
    };

    _public.updateFullProfile = function( userForAction, request, success_call, error_call ) {
        try {
            if(!isDefine( userForAction )) return;
            if(!isDefine( success_call )) return;
            if(!isDefine( error_call )) return;

            var req = 'update-full-profile';
//        var request = {
//            dbcall:        'db-update',
//            dbcollection:  'users',
//            dbrequest:      { 'id': userForAction.id, 'nick': userForAction.nick }
//        };
            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(ProfileController.updateFullProfile()): ' + err);
        }
    };

    return ProfileController;

})(thJQ);


