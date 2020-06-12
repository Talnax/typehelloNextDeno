/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    notice-hub.js
 */

var th = th || {};
th.next = th.next || {};

th.next.NoticeHub = (function($) {
    var This
        , _public = NoticeHub.prototype;

    function NoticeHub() {
        This               = this;
        this.cssClassHub   = '.notice-hub';
        this.hubStatus     = statusHub.not_active;
        this.userPerClick  = null;

        this.noticeData     = null;
        this.noticeTemplate = null;
        this.noticeCommentTemplate = null;

        this.feedbackClass = ".notice-hub-dlg-feedback";
        this.settingsClass = ".notice-hub-dlg-settings";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            This.commonHub.removeMainMenuItem( This, 'notice');

            this.initHub();

            ctrlNotice = new th.next.NoticeController();

            //This.commonHub.setHubPosition( This );

            This.hubStatus = statusHub.initialized;

            setTimeout(function() {
                This.readAllNotices();
            }, 600);

            //rePositionHub();

            setUIEvents();
        }
        catch(err) {
            console.log('ERROR(NoticeHub.Initialize()): ' + err);
        }
    };

    _public.showAddNoticeDlg = function() {
        try {
            _showAddNoticeDlg();
        }
        catch( err ) {
            console.log('ERROR(NoticeHub.showAddNoticeDlg()): ' + err );
        }
    };

    _public.readAllNotices = function() {
        try {
            This.showProgressBar( true );

            ctrlNotice.listNotices = [];    // re-init

            // get notices

            ctrlNotice.getNotices( function(result) {
                This.showProgressBar( false );
                showAllNotices();
            });
        }
        catch( err ) {
            console.log('ERROR(NoticeHub.readAllNotices()): ' + err );
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

    _public.showAboutNoticePanel = function() {
        try {
            event.preventDefault();

            return false;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.showAboutNoticePanel()): ' + err );
            return false;
        }
    };

    // --------------------------------------------------------------- showCommentsPanel, showAddCommentsDlg

    function showCommentsPanel() {
        try {

            This.showNoticeCommentPanel.removeClass('invisible-item');

            var isFollower = isUserFollowerOfComments();
            This.showNoticeDlg.find(".th-dlg-show-follow-notice").prop('checked', isFollower );

            onShowNoticeDlgButtons(show_dlg_notice_buttons.show_comment );

            $('#th-dlg-template-show-notice .th-dlg-title').text('NOTICE COMMENTs');

            showAllCommentPerNotice();

            This.noticeCommentPanelInfo = This.showNoticeCommentPanel.find('.notice-comment-info');
//            if( This.noticeData.comments.length < 1 ) {
//                This.noticeCommentPanelInfo.removeClass('invisible-item');
//            }
//            if( This.noticeData.comments.length > 0 ) {
//                This.noticeCommentPanelInfo["addClass"]('invisible-item');     // make invisible, hide explanation panel.
//            }
//            else {
//                This.noticeCommentPanelInfo.removeClass('invisible-item');  // make visible, show explanation panel.
//            }

            var classFun = This.noticeData.comments.length > 0 ?
                "addClass" :    // make invisible, hide explanation panel.
                "removeClass";  // make visible, show explanation panel.

            This.noticeCommentPanelInfo[classFun]('invisible-item');
        }
        catch(err) {
            console.log('NoticeHub.showAddCommentToNoticeDlg(): ' + err );
        }
    }

    function addCommentToNotice_Click(event) {
        try {
            event.preventDefault();

            var txt_comment = This.addNoticeCommentDlg.find('.th-dlg-notice-comment-text').val();
            if( txt_comment.length < 6  ) {
                alert('Oops, type some comment, more then 6 characters !');
                return false;
            }

            var comment = {
                  'id':         GUID()
                , 'sender':     getUserId(getUser())
                , 'date':       getCurrentDate()
                , 'comment':    encodeURIComponent(removeLineBreaks(txt_comment))
                , 'title':      ''
                , 'link':       ''
                , 'pic':        ''
            };

            ctrlNotice.addCommentToNotice( This.noticeData, comment, function( res ) {

                // add current comment to the notice.

                This.noticeData.comments.push( comment );

                // refresh UI

                showCommentsPanel();

                // send mails to follow users

                checkFollowsUsers();

            });

            This.addNoticeCommentDlg.addClass('invisible-item');

            if( !This.noticeCommentPanelInfo.hasClass('invisible-item') )   {
                This.noticeCommentPanelInfo.addClass('invisible-item');
            }

            return false;
        }
        catch(err) {
            console.log('NoticeHub.addCommentToNotice_Click(): ' + err );
            return false;
        }
    }

    function showAddCommentToNoticeDlg() {
        try {

            This.addNoticeCommentDlg.find('.th-template-nick').text(getUser().nick);

            This.addNoticeCommentDlg.find('.th-dlg-notice-comment-text').val('');

            This.addNoticeCommentDlg.find('.th-dlg-title').text('ADD COMMENT');

            This.addNoticeCommentDlg.removeClass('invisible-item');
        }
        catch(err) {
            console.log('NoticeHub.showAddCommentToNoticeDlg(): ' + err );
        }
    }

    function showAllCommentPerNotice() {
        try {
            if( !isDefine(This.noticeCommentUl)) {
                This.noticeCommentUl = $("#notice-comment-list-view-ctrl");
            }
            //$("#notice-comment-list-view-ctrl li").remove();
            This.noticeCommentUl.find('li').remove();

            for( var i = 0; i < This.noticeData.comments.length; i++) {
                var comment = This.noticeData.comments[i];
                if( isDefine(comment)) {
                    bindDataCommentTemplateValues(comment);
                }
            }

            This.noticeCommentUl[0].scrollTop = This.noticeCommentUl[0].scrollHeight;
        }
        catch( err ) {
            console.log('ERROR(NoticeHub.showAllCommentPerNotice()): ' + err );
        }
    }

    function closeAddCommentToNoticeDlg_Click(event) {
        try {
            event.preventDefault();

            This.addNoticeCommentDlg.addClass('invisible-item');

            return false;
        }
        catch(err) {
            console.log('NoticeHub.closeAddCommentToNoticeDlg_Click(): ' + err );
            return false;
        }
    }

    function checkFollowsUsers() {
        try {
            // check if this notice have notice.follow_responses = 1 and
            // notice.follow_comments.length > 0, so send emails.

            var recievers = [];

            if( This.noticeData.follow_responses === 1 ) {
                recievers.push(This.noticeData.sender.id);
            }

            for( var i = 0; i < This.noticeData.followers_comments.length; i++ ) {
                var follower_id = This.noticeData.followers_comments[i].id;

                if( recievers.indexOf(follower_id) < 0 ) {
                    recievers.push(follower_id);
                }
            }

            if( recievers.length < 1 ) {
                return;
            }

            // send notification mail to all follow users

            var mainContent = " add new comment of Notice - '" + This.noticeData.title  + "'";

            sendMailToUsersID(
                getUser(),
                recievers,
                "TypeHello notification",
                decodeURIComponent(removeLineBreaks(mainContent)),
                mailNotificationType.notice,
                mailContentType.html,
                function() {});
        }
        catch(err) {
            console.log('NoticeHub.checkFollowsUsers(): ' + err );
        }
    }

    function bindDataCommentTemplateValues ( comment ) {
        try {
            if( !isDefine(comment)) return;

            if( !This.noticeCommentTemplate) {
                var itemScript   = $('#notice-item-comment-template').html();
                This.noticeCommentTemplate = $( itemScript );
            }

            if( This.noticeCommentTemplate.length === 0 ) return;

            $(This.noticeCommentTemplate).find('.template-data span').text(JSON.stringify(comment.sender));

            $(This.noticeCommentTemplate).find('.template-nick span').text(comment.sender.nick);

            $(This.noticeCommentTemplate).find('.template-date span').text(comment.date !== '' ? comment.date : '');

            /*
            var elPic = This.noticeCommentTemplate.find('.template-image');
            elPic.removeAttr("style");
            if( comment.sender.pic !== '') {
                elPic.attr("style", "background-image: url("+ decodeURIComponent(comment.sender.pic) + ");");
            }
            */
            This.commonHub.setUserIcon( This.noticeCommentTemplate.find('.template-image'), comment.sender );

            $(This.noticeCommentTemplate).find('.template-text span').text(decodeURIComponent(comment.comment));

            var htmlTemplate = This.noticeCommentTemplate[0].outerHTML;
            This.noticeCommentUl.last().append('<li>' + htmlTemplate + '</li>');
        }
        catch(err) {
            console.log('ERROR(NoticeHub.bindDataCommentTemplateValues())' + err );
        }
    }

    function onFollowerToComments_Click () {
        try {
            //event.preventDefault();

            var followChecked = $(this).prop('checked') ? 1 : 0;
            var userFollower  = isUserFollowerOfComments() ? 1 : 0;

            if( followChecked !== userFollower ) {

                showNoticeProgressBar( true ); // run progress

                if(followChecked === 1) {

                    ctrlNotice.addFollowerOfNoticeComments( This.noticeData, function(res) {
                        if( res !== null ) {
                            This.noticeData.followers_comments.push(getUserId(getUser()));
                            showNoticeProgressBar( false ); // stop progress
                        }
                    });
                }
                else {
                    ctrlNotice.removeFollowerOfNoticeComments( This.noticeData, function(res) {
                        if( res !== null ) {

                            for( var i = 0; i < This.noticeData.followers_comments.length; i++ ) {
                                var follower = This.noticeData.followers_comments[i];

                                // if this follower what we need remove it.

                                if( follower.id === getUser().id ) {
                                    This.noticeData.followers_comments.splice(i, 1);
                                    break;
                                }
                            }

                            showNoticeProgressBar( false ); // stop progress
                        }
                    });
                }
            }
        }
        catch(err) {
            console.log('NoticeHub.onFollowerToComments_Click(): ' + err );
        }
    }

    function isUserFollowerOfComments() {
        try {
            for( var i = 0; i < This.noticeData.followers_comments.length; i++ ) {
                var follower_id = This.noticeData.followers_comments[i].id;
                if( follower_id ===  getUser().id ) {
                    return true;
                }
            }

            return false;
        }
        catch(err) {
            console.log('NoticeHub.isUserFollowerOfComments(): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- ShowNoticeDlgClick functions

    var show_dlg_notice_buttons = {
        show_notice:        1,
        close_show_notice:  2,
        show_comment:       3,
        close_show_comment: 4
    };

    function showNoticeDialog(noticeId) {
        try {
            This.noticeData   = ctrlNotice.getNoticeById(noticeId);
            This.userPerClick = This.noticeData.sender;

            bindDataShowNoticeDlg();

            onShowNoticeDlgButtons(show_dlg_notice_buttons.show_notice);

            // show dialog

            var zIndex = This.commonHub.getHubZIndex(This);
            This.showNoticeDlg.find('.th-dlg').css('z-index', zIndex + 1 );
            This.showNoticeDlg.removeClass('invisible-item');
        }
        catch(err) {
            console.log('NoticeHub.showNoticeDlg(): ' + err );
        }
    }

    function bindDataShowNoticeDlg() {
        try {

            setNoticeImage(
                This.noticeData.pic,
                decodeURIComponent(This.noticeData.category),
                This.showNoticeDlg.find('.th-dlg-image-panel'));

            This.showNoticeDlg
                .find('.th-dlg-show-notice-nick')
                .text(This.noticeData.sender.nick !== '' ? This.noticeData.sender.nick: '');

            This.showNoticeDlg
                .find('.th-dlg-show-notice-language')
                .text(This.noticeData.sender.language !== '' ? This.noticeData.sender.language: '');

            This.showNoticeDlg
                .find('.th-dlg-show-notice-gender')
                .text(This.noticeData.sender.gender !== '' ? This.noticeData.sender.gender: '');

            This.showNoticeDlg
                .find('.th-dlg-show-notice-category')
                .text(decodeURIComponent(This.noticeData.category));

            This.showNoticeDlg
                .find('.th-dlg-show-notice-country')
                .text(This.noticeData.country !== '' ? This.noticeData.country: '');

            This.showNoticeDlg
                .find('.th-dlg-show-notice-city')
                .text(decodeURIComponent(This.noticeData.city));

            This.showNoticeDlg
                .find('.th-dlg-show-notice-tags')
                .text(decodeURIComponent(This.noticeData.tags));

            This.showNoticeDlg
                .find('.th-dlg-show-notice-title')
                .text( decodeURIComponent(This.noticeData.title));

            This.showNoticeDlg
                .find('.th-dlg-show-notice-content')
                .text( decodeURIComponent(This.noticeData.content));

            // ui changes

            if(This.noticeData.category === 'i can') {
                This.showNoticeDlg.find('.th-dlg-show-notice-category').css( 'color', 'dodgerblue');
            }
            else {
                This.showNoticeDlg.find('.th-dlg-show-notice-category').css( 'color', '#23a96e');
            }

//            // show dialog
//
//            onShowNoticeDlgButtons(show_dlg_notice_buttons.show_notice);
//
//            var zIndex = This.commonHub.getHubZIndex(This);
//            This.showNoticeDlg.find('.th-dlg').css('z-index', zIndex + 1 );
//            This.showNoticeDlg.removeClass('invisible-item');
        }
        catch(err) {
            console.log('ERROR(NoticeHub.bindDataShowDlg())' + err );
        }
    }

    function onCloseShowNoticeDlg_Click( event ) {
        try {
            event.preventDefault();

            // level 2: shown dialog ( showNoticeDlg ) and comment-panel above,
            // in this case we close only comment-panel

            if( !This.showNoticeCommentPanel.hasClass('invisible-item')) {
                This.showNoticeCommentPanel.addClass('invisible-item');
                onShowNoticeDlgButtons(show_dlg_notice_buttons.close_show_comment);

                $('#th-dlg-template-show-notice .th-dlg-title').text('SHOW NOTICE');
            }

            // level 1: shown only dialog ( showNoticeDlg ),
            // in this case we close everything

            else if( !This.showNoticeDlg.hasClass('invisible-item')) {
                This.showNoticeDlg.addClass('invisible-item');
                onShowNoticeDlgButtons(show_dlg_notice_buttons.close_show_notice);
                This.noticeData = null;
            }

            return false;
        }
        catch(err) {
            console.log('NoticeHub.onCloseAddNoticeDlg_Click(): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- ShowSmsDlg functions

    function showSMSDlg() {
        try {

            This.sendNoticeSMSDlg.find('.th-template-nick').text(getUser().nick);

            This.addNoticeCommentDlg.find('.th-dlg-notice-sms-text').val('');

            This.sendNoticeSMSDlg.removeClass('invisible-item');
        }
        catch(err) {
            console.log('NoticeHub.showSMSDlg(): ' + err );
        }
    }

    function sendNoticeSMS_Click( event ) {
        try {
            event.preventDefault();

            var message = This.sendNoticeSMSDlg.find('.th-dlg-notice-sms-text').val();
            if( message.length < 6 ) {
                alert('Oops, type some message, more then 6 characters !');
                return false;
            }

            showNoticeProgressBar( true ); // run progress

            closeSMSDlg();  // close sms-dialog

            // load 'sms-hub'

            loadHub( 'sms-hub', function(res) {
                if( res === 'ok' ) {
                    if( !ctrlSms ) {
                        ctrlSms  = new th.next.SmsController();
                    }

                    // send sms

                    var httpRequest = ctrlSms.addSms(
                        getUser(),
                        This.noticeData.sender,
                        message,
                        function(data, textStatus, jqXHR ) {
                            showNoticeProgressBar( false );    // stop progress
                        },
                        function(jqXHR, textStatus, errorThrown ) {
                            showNoticeProgressBar( false );    // stop progress
                        }
                    );
                }
            });

            return false;
        }
        catch(err) {
            console.log('NoticeHub.sendNoticeSMS_Click(): ' + err );
            return false;
        }
    }

    function closeSendNoticeSMSDlg_Click( event ) {
        try {
            event.preventDefault();

            closeSMSDlg();

            return false;
        }
        catch(err) {
            console.log('NoticeHub.closeSendNoticeSMSDlg_Click(): ' + err );
            return false;
        }
    }

    function closeSMSDlg() {
        try {
            This.sendNoticeSMSDlg.find('.th-dlg-notice-sms-text').val('');
            This.sendNoticeSMSDlg.addClass('invisible-item');
        }
        catch(err) {
            console.log('NoticeHub.closeSMSDlg(): ' + err );
        }
    }

    function showNoticeProgressBar( bShow ) {
        try {
            if( bShow ) {
                This.showNoticeDlg.find('.th-notice-progress').removeClass('invisible-item');
            }
            else {
                This.showNoticeDlg.find('.th-notice-progress').addClass('invisible-item');
            }
        }
        catch(err) {
            console.log('NoticeHub.showNoticeProgressBar(): ' + err );
        }
    }

    // --------------------------------------------------------------- ShowBanDlg functions

    function showBanDlg() {
        try {



            This.sendBanDlg.find('.th-template-nick').text(getUser().nick);

            //This.addNoticeCommentDlg.find('.th-dlg-notice-sms-text').val('');

            This.sendBanDlg.removeClass('invisible-item');
        }
        catch(err) {
            console.log('NoticeHub.showSMSDlg(): ' + err );
        }
    }

    function closeBanDlg_Click( event ) {
        try {
            event.preventDefault();

            closeBanDlg();

            return false;
        }
        catch(err) {
            console.log('NoticeHub.closeBanDlg_Click(): ' + err );
            return false;
        }
    }

    function closeBanDlg() {
        try {
            This.sendBanDlg.find('.th-dlg-notice-ban-text').val('');
            This.sendBanDlg.addClass('invisible-item');
        }
        catch(err) {
            console.log('NoticeHub.closeBanDlg(): ' + err );
        }
    }

    function sendNoticeBan_Click(event) {
        try {
            event.preventDefault();

            var txt_ban = This.showNoticeDlg.find('.th-dlg-notice-ban-text').val();
            if( txt_ban.length < 9  ) {
                alert('Oops, type some explanation of ban, more then 9 characters !');
                return false;
            }

            var ban = {
                  'id':     GUID()
                , 'sender': getUserId(getUser())
                , 'date':   getCurrentDate()
                , 'ban':    encodeURIComponent(removeLineBreaks(txt_ban))
            };

            closeBanDlg();

            showNoticeProgressBar( true );

            ctrlNotice.addBanToNotice( This.noticeData, ban, function( res ) {
                This.noticeData.bans.push(ban);
                showNoticeProgressBar( false );
            });

            return false;
        }
        catch(err) {
            console.log('NoticeHub.sendNoticeBan_Click(): ' + err );
            return false;
        }
    }

    function isUserInBanArray( ban_array, user_id ) {
            try {
                    for( var i = 0; i < ban_array.length; i++) {
                        var sender = ban_array[i].sender;

                        if( sender.id === user_id ) {
                            return true;
                        }
                    }

                return false;
            }
            catch(err) {
                console.log('NoticeHub.checkValueInArray(): ' + err );
                return false;
            }
    }

    // --------------------------------------------------------------- AddNoticeDialog

    function _showAddNoticeDlg() {
        try {
            This.addNoticeDlg.find('.th-template-nick').text(getUser().nick);

            This.addNoticeDlg.find(".th-dlg-add-notice-response").attr('checked',false);

            var category = This.addNoticeDlg.find('.th-dlg-add-notice-category').val().toLowerCase();

            setNoticeImage(null, category, This.addNoticeDlg.find('.th-dlg-image-panel'));

            var zIndex = This.commonHub.getHubZIndex(This);
            This.addNoticeDlg.find('.th-dlg').css('z-index', zIndex + 1 );
            This.addNoticeDlg.removeClass('invisible-item');
        }
        catch(err) {
            console.log('NoticeHub.showAddNoticeDlg(): ' + err );
        }
    }

    function onChangeNoticeCategory_Click( event ) {
        try {
            event.preventDefault();

            var imgValue = This.addNoticeDlg.find( ".th-dlg-add-notice-image").val();
            if( isDefine(imgValue) && imgValue !== '') {
                return false; // image of notice define, so we don't need to use image of category
            }

            var category = event.target.value;

            setNoticeImage(null, category, This.addNoticeDlg.find('.th-dlg-image-panel'));

            return false;
        }
        catch(err) {
            console.log('NoticeHub.onChangeNoticeCategory_Click(): ' + err );
            return false;
        }
    }

    function onCloseAddNoticeDlg_Click( event ) {
        try {
            event.preventDefault();

            This.addNoticeDlg.addClass('invisible-item');

            return false;
        }
        catch(err) {
            console.log('NoticeHub.onCloseAddNoticeDlg_Click(): ' + err );
            return false;
        }
    }

    function onNoticeMainMenu_Click( event ) {
        try {
            event.preventDefault();

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );

            if( typeof This[fun] === 'function' ) {
                This[fun]();
            }

            return false;
        }
        catch(err) {
            console.log('NoticeHub.onNoticeMainMenu_Click(): ' + err );
            return false;
        }
    }

    function onAddPostNotice_Click( event ) {
        try {
            event.preventDefault();

            function showProgressBar( bShow) {
                try {
                    if( bShow ) {
                        showAddNoticeProgressBar(true);
                        This.addNoticeDlg.find('.btn-circle').css( 'display', 'none');
                    }
                    else {
                        showAddNoticeProgressBar( false );
                        This.addNoticeDlg.addClass('invisible-item');
                        This.addNoticeDlg.find('.btn-circle').css( 'display', 'block');

                        // clear all text-fields of dialog

                        var elCleans = [
                            '.th-dlg-add-notice-city',
                            '.th-dlg-add-notice-title',
                            '.th-dlg-add-notice-content',
                            '.th-dlg-add-notice-tags'
                        ];

                        for( var i = 0; i < elCleans.length; i++ ) {
                            var elClass = elCleans[i];
                            cleanNoticeItemValue(elClass);
                        }
                    }
                }
                catch(err) {
                    console.log('NoticeHub.onAddPostNotice_Click().showProgressBar(): ' + err );
                }
            }

            var notice = getNoticeContent();

            if( !isDefine( notice ))
                return false;

            showProgressBar(true);

            ctrlNotice.addNotice( notice,
                function( data, textStatus, jqXHR ) {
                    ctrlNotice.listNotices.push(notice);
                    showProgressBar(false);
                    showAllNotices();
                },
                function( jqXHR, textStatus, errorThrown ) {
                    showProgressBar(false);
                });

            return false;
        }
        catch(err) {
            console.log('NoticeHub.onAddPostNotice_Click(): ' + err );
            return false;
        }
    }

    function showAddNoticeProgressBar( bShow ) {
        try {
            if( bShow ) {
                This.addNoticeDlg.find('.th-notice-progress').removeClass('invisible-item');
            }
            else {
                This.addNoticeDlg.find('.th-notice-progress').addClass('invisible-item');
            }
        }
        catch(err) {
            console.log('NoticeHub.showAddNoticeProgressBar(): ' + err );
        }
    }

    function getNoticeContent() {
        try {
            /*
             var notice = {};

             // for test

             notice.category = encodeURIComponent( removeLineBreaks('offer')).toLowerCase();
             notice.country = encodeURIComponent( removeLineBreaks('usa')).toLowerCase();
             //notice.province = encodeURIComponent( removeLineBreaks('California'));
             notice.city = encodeURIComponent( removeLineBreaks('San Francisco'));
             notice.title = encodeURIComponent( removeLineBreaks('MongoDB-as-a-Service on Microsoft Azure'));
             notice.content = encodeURIComponent( removeLineBreaks("In terms of which next-generation video game console gamers think is better, the “console war” we hear about so often is somewhat trivial. In terms of sales, however, the competition between Sony’s PlayStation 4 and Microsoft’s Xbox One "));
             notice.tags = encodeURIComponent( removeLineBreaks("MongoDB db database")).toLowerCase();
             notice.link = encodeURIComponent( removeLineBreaks('http://techforteenagers.com/ios-7-rumors/'));
             notice.pic = encodeURIComponent( removeLineBreaks('http://techforteenagers.com/wp-content/uploads/2013/05/ios-7-prototype-300x234.png'));
             notice.id = GUID();
             notice.date = getCurrentDate();
             //notice.sender = getUserId(getUser());
             notice.sender = getUser();
             notice.comments = [
             //                 {
             //                     "id" : "6712-3232-2125-3505-58920452925",
             //                     "sender" : {
             //                         "id" : "5600-1745-422-3767-348212862832",
             //                         "nick" : "herclia",
             //                         "gender" : "male",
             //                         "pic" : "http://typehello.com"
             //                     },
             //                     "date" : "4-28-2014",
             //                     "title" : "",
             //                     "msg" : "Ooo this is interesting",
             //                     "link" : ""
             //                 }
             ];

             return notice;
             */

            var notice = {};

            notice.country  = getNoticeItemValue('.th-dlg-add-notice-country').toLowerCase();
            notice.category = getNoticeItemValue('.th-dlg-add-notice-category').toLowerCase();
            notice.city     = getNoticeItemValue('.th-dlg-add-notice-city');
            notice.pic      = getNoticeItemValue('.th-dlg-add-notice-image');
            notice.link     = "";
            notice.id       = GUID();
            notice.date     = getCurrentDate();
            notice.sender   = getUserId(getUser()); notice.sender.language = getUser().language;
            notice.comments = [];
            notice.bans     = [];
            notice.follow_responses   = This.addNoticeDlg.find(".th-dlg-add-notice-response").prop('checked') ? 1 : 0;
            notice.followers_comments = [];

            notice.title  = getNoticeItemValue('.th-dlg-add-notice-title');
            if( notice.title === '') {
                alert("Hey, you can't post -notice- without title");
                return null;
            }

            notice.content = getNoticeItemValue('.th-dlg-add-notice-content');
            if( notice.content === '') {
                alert("Hey, you can't post -notice- without content");
                return null;
            }

            notice.tags = getNoticeItemValue('.th-dlg-add-notice-tags').toLowerCase();
            if( notice.tags === '') {
                alert("Hey, you can't post -notice- without tags");
                return null;
            }
//            for( var i in notice ) {
//                if( notice.hasOwnProperty(i)) {
//                    var item = notice[i];
//                    if( item === '' ) {
//                        delete notice[i];
//                    }
//                }
//            }
            return notice;
        }
        catch( err ) {
            console.log('ERROR(NoticeHub.getNoticeContent()): ' + err );
            return null;
        }
    }

    function getNoticeItemValue(elClass) {
        var elNotice = This.addNoticeDlg.find(elClass).val().trim();
        return encodeURIComponent( removeLineBreaks( elNotice ));
    }

    function cleanNoticeItemValue(elClass) {
        This.addNoticeDlg.find(elClass).val('');
    }

    // --------------------------------------------------------------- Search functions

    function onSearchNotice_Click ( event ){
        try {
            event.preventDefault();

            // filter -------------------------------------------------------------------

            var searchDiv = $('.notice-hub .search-notices');

            var filter = {
                'notice.country'  : $(searchDiv).find('.th-select-notice-country').val().toLowerCase(),
                'notice.category' : $(searchDiv).find('.th-select-notice-category').val().toLowerCase(),
                'notice.city'     : encodeURIComponent( removeLineBreaks( $('#input-notice-state-city').val()))
            };

            for( var key in filter ) {
                if( filter.hasOwnProperty(key)) {
                    var item = filter[key];
                    if( item.length < 2 ) {
                        delete filter[key];
                    }
                    else if( item === 'all')  {
                        delete filter[key];
                    }
                }
            }

            // tags ---------------------------------------------------------------------

            var tagsTxt = $('#input-search-notices-tags').val().toLowerCase();
            if( tagsTxt === '' && (JSON.stringify(filter) === '{}')) {
                return false;
            }

            //var searchSplit = searchValue.split(/,| /);
            var tagsValue = '';
            if( tagsTxt !== '' ) {
                tagsValue = tagsTxt.replace(',', ' ').split(' ');
                for( var l = 0; l < tagsValue.length; l++ ) {
                    if( tagsValue[l] === '') {
                        searchSplit.splice(l, 1);
                    }
                }
            }

            searchRoutine( filter, tagsValue );

            return false;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.onSearchNotice_Click()): ' + err );
            return false;
        }
    }

    function searchRoutine( filter, tagsValue ) {
        try {
            This.showProgressBar( true );

            ctrlNotice.findNotice(filter, tagsValue, function(result) {

                if( isJsonData(result)) {
                    var parser = JSON.parse(result);

                    //if( typeof parser.param === "object" ) {
                    if( isDefine(parser.param)) {

                        if( parser.param.length > 0 ) {
                            ctrlNotice.listNotices = [];

                            for( var i = 0; i < parser.param.length; i++ ) {
                                var notice = parser.param[i];
                                ctrlNotice.listNotices.push(notice);
                            }

                            showAllNotices();
                        }
                    }
                }

                This.showProgressBar( false );
            });
        }
        catch(err) {
            console.log('ERROR(NoticeHub.searchRoutine()): ' + err );
        }
    }

    // --------------------------------------------------------------- OnClick functions

    function onShowFooter_Buttons_Click( event ) {
        try {
            event.preventDefault();

            var el  = event.target;

            var action = $(event.target).text();

            if( action === "COMMENTs" ) {
                showCommentsPanel();
            }
            else if( action === "ADD COMMENT" ) {
                showAddCommentToNoticeDlg()
            }
            else if( action === "SMS" ) {
                showSMSDlg()
            }
            else if( action === "BAN" ) {
                showBanDlg()
            }

            return false;
        }
        catch(err) {
            console.log('NoticeHub.onShowNoticeDlgClick_Click(): ' + err );
            return false;
        }
    }

    function onNoticeImage_Enter( event ) {
        try {
            event.preventDefault();

            var category = This.addNoticeDlg.find('.th-dlg-add-notice-category').val().toLowerCase();

            var imgValue = This.addNoticeDlg.find( ".th-dlg-add-notice-image").val();

            setNoticeImage(imgValue, category, This.addNoticeDlg.find( ".th-dlg-image-panel"));

            /*
            if( isDefine(imgValue) && imgValue !== '') {
                var imgUrl = "url(" + imgValue + ")";
                This.addNoticeDlg.find( ".th-dlg-image-panel").css("background-image", imgUrl);
            }
            */
            return false;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.onNoticeImage_Enter()): ' + err );
            return false;
        }
    }

    function onNoticeExpander_Click( event ) {
        try {
            var el = event.target;

            event.preventDefault();

            var elVal = $(el).val();
            var elTxt = $(el).text();

            var expandDiv = $(".notice-hub .th-expander-region-filter-content");

            if( elTxt === '-' ) {
                expandDiv.css( 'display', 'none');
                $(el).html('+');
            }
            else if( elTxt === '+' ) {
                expandDiv.css( 'display', 'block');
                $(el).html('-');
            }

            /*
            var imgValue = This.addNoticeDlg.find( ".th-dlg-add-notice-image").val();

            if( isDefine(imgValue) && imgValue !== '') {
                //$("#th-dlg-template-add-notice .th-dlg-notice-image").attr('src', imgValue );

                var imgUrl = "url(" + imgValue + ")";
                This.addNoticeDlg.find( ".th-dlg-image-panel").css("background-image", imgUrl);
            }
            */
            return false;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.onNoticeExpander_Click()): ' + err );
            return false;
        }
    }

    function onNoticeMenu_Click( event ) {
    // http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
        try {
            event.preventDefault();

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );

            if( typeof This[fun] === 'function' ) {
                This[fun]();
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.onNoticeMenu_Click()): ' + err );
            return false;
        }
    }

    function onNoticeItem_Click( event ) {
        try {
            event.preventDefault();

            var el   = event.target;
            var elId = $(el)
                        .closest('.notice-list-view-item-template')
                        .find('.template-data span').text();
            var noticeId = JSON.parse(elId);

            showNoticeDialog(noticeId);

            return false;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.onNoticeItem_Click()): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions
    /*
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
    */

    function setUIEvents() {
        try {

            // showNoticeDlg ------------------------------------------------------------

            This.showNoticeDlg = $('#th-dlg-template-show-notice');

            This.showNoticeCommentPanel = This.showNoticeDlg.find('.notice-comment-panel');

            This.showNoticeDlgButtons = This.showNoticeDlg.find('.th-notice-show-list-btns');

            $(document).on("click", "#th-dlg-template-show-notice .th-dlg-show-notice .btn-circle", onCloseShowNoticeDlg_Click );

            $(document).on("click", "#th-dlg-template-show-notice ul.th-notice-show-list-btns li div.btn-rect", onShowFooter_Buttons_Click );

            $(document).on("click", "#th-dlg-template-show-notice .th-dlg-show-notice .th-dlg-show-follow-notice", onFollowerToComments_Click );

            // AddCommentNoticeDlg ------------------------------------------------

            This.addNoticeCommentDlg = This.showNoticeDlg.find('.th-dlg-add-comment-to-notice');

            $(document).on("click", "#th-dlg-template-show-notice .th-dlg-add-comment-to-notice .th-btn-add-notice-comment", addCommentToNotice_Click );

            $(document).on("click", "#th-dlg-template-show-notice .th-dlg-add-comment-to-notice .btn-circle", closeAddCommentToNoticeDlg_Click );

            // addBanDlg ------------------------------------------------

            This.sendBanDlg = This.showNoticeDlg.find('.th-dlg-add-ban-to-notice');

            $(document).on("click", "#th-dlg-template-show-notice .th-dlg-add-ban-to-notice .th-btn-ban-to-notice", sendNoticeBan_Click );

            $(document).on("click", "#th-dlg-template-show-notice .th-dlg-add-ban-to-notice .btn-circle", closeBanDlg_Click );

            // addSmsDlg ----------------------------------------------------------------

            This.sendNoticeSMSDlg = This.showNoticeDlg.find('.th-dlg-send-sms-to-notice-owner');

            $(document).on("click", "#th-dlg-template-show-notice .th-dlg-send-sms-to-notice-owner .th-btn-send-notice-sms", sendNoticeSMS_Click );

            $(document).on("click", "#th-dlg-template-show-notice .th-dlg-send-sms-to-notice-owner .btn-circle", closeSendNoticeSMSDlg_Click );

            // addNoticeDlg -------------------------------------------------------------

            This.addNoticeDlg = $('#th-dlg-template-add-notice');

            This.addNoticeDlg.find(".th-dlg-add-notice-category").change(onChangeNoticeCategory_Click);

            This.addNoticeDlg.find(".th-dlg-add-notice-image").keyup(function(e) {
                if(e.keyCode === 13)  {
                    onNoticeImage_Enter(e);
                }
            });

            This.addNoticeDlg.find(".th-dlg-add-notice-image").blur(function(e) {
                onNoticeImage_Enter(e);
            });

            $(document).on("click", "#th-dlg-template-add-notice .th-dlg-add-notice .btn-circle", onCloseAddNoticeDlg_Click );

            $(document).on("click", "#th-dlg-template-add-notice .th-btn-add-notice-post", onAddPostNotice_Click );

            // another events -----------------------------------------------------------

            $(document).on("click", "#notice-list-view-ctrl li", onNoticeItem_Click );

            $(document).on("click", "#notice-list-view-ctrl li .template-notice-menu span", onNoticeMenu_Click );

            $(document).on("click", ".notice-hub .search-notices .th-expander-sign", onNoticeExpander_Click );

            $(document).on("click", ".notice-hub ul.th-ul-main-menu li", onNoticeMainMenu_Click );

            $('#input-search-notices-tags').keyup(function(e) { if(e.keyCode === 13) { onSearchNotice_Click(e); } });
            $(document).on("click", "#btn-input-search-notices", onSearchNotice_Click );

            //$(document).on("click", "#th-dlg-template-add-notice .th-dlg-add-notice .btn-circle", onCloseAddNoticeDlg_Click );
            //$(document).on("click", ".th-dlg-add-notice-image", onNoticeImage_Enter );
            //$(document).on("click", "#messages-chat li ul.th-user-actions li span", onNoticeMenu_Click );
        }
        catch( err ) {
            console.log('ERROR(NoticeHub.setUIEvents()): ' + err );
        }
    }

    function setNoticeImage(pic, category, noticeImgEl ) {
        try {
            noticeImgEl.removeClass( 'th-template-notice-img-can');
            noticeImgEl.removeClass( 'th-template-notice-img-want');
            noticeImgEl.removeAttr("style");

            if( isDefine(pic) && pic !== '') {
                noticeImgEl.attr("style", "background-image: url("+ decodeURIComponent(pic) + ");");
            }
            else {
                if( category === 'i want') {
                    noticeImgEl.addClass( 'th-template-notice-img-want');
                }
                else {
                    noticeImgEl.addClass( 'th-template-notice-img-can');
                }
            }
        }
        catch(err) {
            console.log('ERROR(NoticeHub.setNoticeImage())' + err );
        }
    }

    /*
    function onShowNoticeDlgButtons( status ) {
        try {

            if( status === show_dlg_notice_buttons.show_notice ) {
                This.showNoticeDlgButtons.find('.th-btn-comment-notice').closest('li').removeClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-btn-ban-notice').closest('li').removeClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-btn-sms-notice').closest('li').removeClass('invisible-item');
            }
            else if (status === show_dlg_notice_buttons.show_comment ) {
                This.showNoticeDlgButtons.find('.th-btn-add-comment-notice').closest('li').removeClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-dlg-show-follow-notice').closest('li').removeClass('invisible-item');

                This.showNoticeDlgButtons.find('.th-btn-comment-notice').closest('li').addClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-btn-ban-notice').closest('li').addClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-btn-sms-notice').closest('li').addClass('invisible-item');
            }
            else if ( status === show_dlg_notice_buttons.close_show_notice ) {
                This.showNoticeDlgButtons.find('.th-btn-comment-notice').closest('li').addClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-btn-sms-notice').closest('li').addClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-btn-ban-notice').closest('li').addClass('invisible-item');
                //This.showNoticeDlgButtons.find('.th-btn-add-comment-notice').closest('li').addClass('invisible-item');
                //This.showNoticeDlgButtons.find('.th-dlg-show-follow-notice').closest('li').addClass('invisible-item');
            }
            else if ( status === show_dlg_notice_buttons.close_show_comment ) {
                This.showNoticeDlgButtons.find('.th-btn-add-comment-notice').closest('li').addClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-dlg-show-follow-notice').closest('li').addClass('invisible-item');

                This.showNoticeDlgButtons.find('.th-btn-comment-notice').closest('li').removeClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-btn-ban-notice').closest('li').removeClass('invisible-item');
                This.showNoticeDlgButtons.find('.th-btn-sms-notice').closest('li').removeClass('invisible-item');
            }
        }
        catch(err) {
            console.log('NoticeHub.onShowNoticeDlgButtons(): ' + err );
        }
    }
    */

    function onShowNoticeDlgButtons( status ) {
        try {

            if( status === show_dlg_notice_buttons.show_notice ) {
                showBttnsNotice('block');
            }
            else if (status === show_dlg_notice_buttons.show_comment ) {
                showBttnsComment('block');
                showBttnsNotice('none');
            }
            else if ( status === show_dlg_notice_buttons.close_show_notice ) {
                showBttnsNotice('none');
            }
            else if ( status === show_dlg_notice_buttons.close_show_comment ) {
                showBttnsComment('none');
                showBttnsNotice('block');
            }
        }
        catch(err) {
            console.log('NoticeHub.onShowNoticeDlgButtons(): ' + err );
        }
    }

    function showBttnsNotice( _display ) {
        try {
            This.showNoticeDlgButtons.find('.th-btn-comment-notice').closest('li').css('display', _display );
            This.showNoticeDlgButtons.find('.th-btn-ban-notice').closest('li').css('display', _display );
            This.showNoticeDlgButtons.find('.th-btn-sms-notice').closest('li').css('display', _display );
        }
        catch(err) {
            console.log('NoticeHub.showBttnsNotice(): ' + err );
        }
    }

    function showBttnsComment( _display ) {
        try {
            This.showNoticeDlgButtons.find('.th-btn-add-comment-notice').closest('li').css('display', _display );
            This.showNoticeDlgButtons.find('.th-dlg-show-follow-notice').closest('li').css('display', _display );
        }
        catch(err) {
            console.log('NoticeHub.showBttnsComment(): ' + err );
        }
    }

    function showAllNotices() {
        try {

            This.noticeData     = null;
            This.noticeTemplate = null;
            This.noticeCommentTemplate = null;

            if( !isDefine(This.noticesUl)) {
                This.noticesUl = $("#notice-list-view-ctrl");
            }
            This.noticesUl.find('li').remove();

            if( !isDefine(ctrlNotice.listNotices))
                return;

            for( var i = 0; i < ctrlNotice.listNotices.length; i++ ) {
                bindDataTemplateValues(i, ctrlNotice.listNotices[i] );
            }

            This.noticesUl[0].scrollTop = This.noticesUl[0].scrollHeight;
//
//            // last post become first
//
//            for( var i = ctrlWall.listWallPosts.length - 1; i >= 0; i--) {
//                var post = ctrlWall.listWallPosts[i].post;
//
//                if( post.hasOwnProperty('not_show_for')) {
//                    var not_show = post.not_show_for;
//
//                    if( not_show.indexOf(user_id) > -1 ) {
//                        continue;
//                    }
//                }
//
//                bindDataTemplateValues(i, ctrlWall.listWallPosts[i] );
//            }
        }
        catch(err) {
            console.log('ERROR(NoticeHub.showAllNotices())' + err );
        }
    }

    function bindDataTemplateValues ( index, notice ) {
        try {
            if( !isDefine(notice)) return;

            if( !This.noticeTemplate) {
                var itemScript   = $('#notice-item-template').html();
                This.noticeTemplate = $( itemScript );
            }

            if( This.noticeTemplate.length === 0 ) return;

            $(This.noticeTemplate).find('.template-data span').text(JSON.stringify(notice.id));

            $(This.noticeTemplate).find('.template-date span').text(notice.date !== '' ? notice.date : '');

            var txtCategory = decodeURIComponent(notice.category);
            var elCategory = $(This.noticeTemplate).find('.template-notice-category');
            elCategory.text(decodeURIComponent(notice.category));
            elCategory.css( 'color', txtCategory === 'i want'? '#23a96e': 'dodgerblue' );

            var elTitle = $(This.noticeTemplate).find('.template-notice-title');
            elTitle.text(decodeURIComponent(notice.title));

            setNoticeImage(notice.pic, txtCategory, This.noticeTemplate.find('.template-notice-img'));

            /*
            var lContent = 160;
            var content = notice.content.length > lContent ? notice.content.slice( 0, lContent) + '...' : notice.content;
            //$(This.noticeTemplate).find('.template-notice-text').text(decodeURIComponent(content !== '' ? content: ''));
            $(This.noticeTemplate).find('.template-notice-text').text(content !== '' ? content: '');
            */

            var _max = 127;
            var content = decodeURIComponent(notice.content);
            content = content.length > _max ? content.slice( 0, _max) + '...' : content;
            $(This.noticeTemplate).find('.template-notice-text').text(content);

            var htmlTemplate = This.noticeTemplate[0].outerHTML;
            $("#notice-list-view-ctrl").last().append('<li>' + htmlTemplate + '</li>');
        }
        catch(err) {
            console.log('ERROR(NoticeHub.bindDataTemplateValues())' + err );
        }
    }

    return NoticeHub;

})(thJQ);

th.next.NoticeController = (function($) {
    var This
        ,_public = NoticeController.prototype;

    function NoticeController() {
        This = this;

        this.listNotices = [];

        this.Initialize();
    }

    _public.Initialize = function() {
    };

    _public.getNotices = function( callback ) {
        try {
            var req     = 'get-n-last-notices';
            var request = {
                dbcall:        'db-get',
                dbcollection:  'notices',
                dbrequest:      {},
                dblimit: {
                    'limit': 18     // how many record have to return
                }
            };

            var ajaxData = JSON.stringify(request);

            function success_call( data, textStatus, jqXHR ) {

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( typeof parser.param === "object" ) {

                        //This.listNotices = parser.param;
                        for( var i = 0; i < parser.param.length; i++ ) {
                            var notice = parser.param[i].notice;
                            This.listNotices.push(notice);
                        }

                        sendCallBack(callback( true ));

                        return;
                    }
                }

                sendCallBack(callback( false ));
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[NoticeController.getNotices()]: ' + errorThrown );

                sendCallBack(callback( false));
            }

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(NoticeController.getNotices()): ' + err);
        }
    };

    _public.addNotice = function( notice, success_call, error_call ) {
        try {
            if(!isDefine( notice )) return;

            var req       = 'add-notice';
            var request = {
                dbcall:        'db-add',
                dbcollection:  'notices',
                dbrequest:     {
                    'notice':   notice
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(NoticeController.addNotice()): ' + err);
        }
    };

    _public.addBanToNotice = function( notice, ban, callback ) {
        try {
            if(!isDefine( notice )) return;
            if(!isDefine( ban )) return;
            if(!isDefine( callback )) return;

            var req       = 'add-ban-to-notice';

            var request = {
                notice_id:  notice.id,
                ban:        ban
            };

            var ajaxData = JSON.stringify(request);

            function success_call( data, textStatus, jqXHR ) {
                sendCallBack(callback( true ));
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[NoticeController.addBanToNotice()]: ' + errorThrown );
                sendCallBack(callback( false));
            }

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(NoticeController.addBanToNotice()): ' + err);
        }
    };

    _public.addCommentToNotice = function( notice, comment, callback ) {
        try {
            if(!isDefine( notice )) return;
            if(!isDefine( comment )) return;
            if(!isDefine( callback )) return;

            var req       = 'add-comment-to-notice';
            /*
            var request = {
                dbcall:        'db-add',
                dbcollection:  'notices',
                dbrequest:     {
//                    'filter': {
//                        'notice.id': notice.id
//                    },
                    'id': notice.id,
                    'comment':   comment
                }
            };
            /*
            /*
            var comment = {
                "id" :      GUID(),
                "sender":   getUser(),
                "date":     getCurrentDate(),
                "title":    "",
                "comment":  encodeURIComponent(removeLineBreaks(post)),
                "link":     ""
            };
            */
            var request = {
                  notice_id:    notice.id,
                  comment:      comment
//                , comment:      {
//                      'id':         GUID()
//                    , 'sender':     getUserId(getUser())
//                    , 'date':       getCurrentDate()
//                    , 'comment':    encodeURIComponent(removeLineBreaks(comment))
//                    , 'title': ''
//                    , 'link':   ''
//                    , 'pic':    ''
//                }
            };

            var ajaxData = JSON.stringify(request);

            function success_call( data, textStatus, jqXHR ) {

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    sendCallBack(callback( !parser.err ));
                }
                else {
                    sendCallBack(callback( false ));
                }
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[NoticeController.addCommentToNotice()]: ' + errorThrown );

                sendCallBack(callback( false));
            }

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(NoticeController.addCommentToNotice()): ' + err);
        }
    };

    _public.addFollowerOfNoticeComments = function( notice, callback ) {
        try {
            if(!isDefine( notice )) return;
            if(!isDefine( callback )) return;

            var req     = 'add-follower-of-notice-comments';
            var request = {
                notice_id:  notice.id,
                follower:   getUserId(getUser())
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {
                    sendCallBack(callback( data));
                },
                function( jqXHR, textStatus, errorThrown ) {
                    sendCallBack(callback( null));
                });
        }
        catch(err) {
            console.log('ERROR(NoticeController.addCommentToNotice()): ' + err);
        }
    };

    _public.removeFollowerOfNoticeComments = function( notice, callback ) {
        try {
            if(!isDefine( notice )) return;
            if(!isDefine( callback )) return;

            var req     = 'remove-follower-of-notice-comments';
            var request = {
                notice_id:  notice.id,
                follower:   getUserId(getUser())
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {
                    sendCallBack(callback( data));
                },
                function( jqXHR, textStatus, errorThrown ) {
                    sendCallBack(callback( null));
                });
        }
        catch(err) {
            console.log('ERROR(NoticeController.addCommentToNotice()): ' + err);
        }
    };

    _public.findNotice = function( filter, tags, callback ) {
        // http://docs.mongodb.org/manual/reference/operator/query/in/
        // http://docs.mongodb.org/manual/reference/operator/query/or/
        // http://docs.mongodb.org/manual/administration/indexes-text/
        // http://stackoverflow.com/questions/10610131/checking-if-a-field-contains-a-string
        try {
            if(!isDefine( filter )) return;
            if(!isDefine( tags ))   return;

            //var dbfind  = { $in: tags_value };
            var req     = 'find-notice';
            var request = {
                dbcall:        'db-find',
                dbcollection:  'notices',
//                filter: {
//                    'notice.category': 'offer',
//                    'notice.country': 'usa'
//                    'notice.province': 'california'
//                },
                filter: filter,
                tags: tags

                // what property we need to check:
                // var property_list = ['title','content','tags'];

                //{ 'notice.title': { $in: [ "iOS"] }   }
                /*
                dbrequest:     {
                    'notice.title':     dbfind,
                    'notice.content':   dbfind,
                    'notice.tags':      dbfind
                }
                */
            };

            /*
            var qqq =
                {
                    a: { $in: [ "a", "b", "c" ] },
                    b: { $in: [ "b", "c" ] }
                };
            */
            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                    function( data, textStatus, jqXHR ) {
                        sendCallBack(callback( data));
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        sendCallBack(callback( null));
                    });
        }
        catch(err) {
            console.log('ERROR(NoticeController.findNotice()): ' + err);
        }
    };

    _public.updateNotice = function( user, notice, success_call, error_call ) {
        try {
            if(!isDefine( user )) return;
            if(!isDefine( notice )) return;

            var req       = 'update-notice';
            var request = {
                dbcall:        'db-update',
                dbcollection:  'notices',
                dbrequest:     {
                    'user':     getUserId(user),
                    'notice':   notice
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(NoticeController.updateNotice()): ' + err);
        }
    };

    _public.getNoticeById = function (_noticeId) {
        try {

            if(!isDefine( _noticeId )) return null;

            for( var i = 0; i < This.listNotices.length; i++ ) {
                var notice = This.listNotices[i];
                if( notice.id === _noticeId) {
                    return notice;
                }
            }

            return null;
        }
        catch(err) {
            console.log('ERROR(NoticeController.getNoticeById()): ' + err );
            return null;
        }
    };

    return NoticeController;

})(thJQ);