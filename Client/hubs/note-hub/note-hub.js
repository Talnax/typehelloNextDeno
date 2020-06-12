/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013
   product: Web-Аssistant ( TypeHello )
 * file:    note-hub.js
 */

var th  = th || {};
th.next = th.next || {};

th.next.NoteHub = (function($) {
    var This,
        _public = NoteHub.prototype;

    function NoteHub() {
        This = this;
        this.cssClassHub = '.note-hub';

        this.hubStatus    = statusHub.not_active;
        this.userPerClick = null;

        this.noteTemplate   = null;
        this.searchResults = [];
        this.collapseCss   = false;
        this.noteChanged   = false;

        this.posFormatting = null;

        this.feedbackClass = ".note-hub-dlg-feedback";
        this.settingsClass = ".note-hub-dlg-settings";

        this.commonHub = new th.next.CommonHub( this );

        this.Initialize();
    }

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {
        try {
            if( !isDefine( ctrlNote )) {
                ctrlNote  = new th.next.NoteController();
            }

            This.commonHub.removeMainMenuItem( This, 'note');

            this.initHub();

            This.commonHub.setHubPosition( This );

            This.hubStatus = statusHub.initialized;

            setTimeout(function() {
                This.readAllNotes();
            }, 600);

            //rePositionHub();

            setUIEvents();
        }
        catch(err) {
            console.log('ERROR(NoteHub.Initialize())' + err );
        }
    };

    _public.readAllNotes = function() {
        try {

            var user = getUser();

            if(!isDefine( user ))
              return;

            This.showProgressBar( true );

            $("#note-list-view-ctrl li").remove(); // re-init list of notes

            ctrlNote.listNotePosts = [];

            ctrlNote.getNotes( user, function(result) {

                This.showProgressBar( false );

                if( !isDefine(ctrlNote.listNotePosts))
                    return;

                // last note become first

                for( var i = ctrlNote.listNotePosts.length - 1; i >= 0; i--) {
                    bindDataTemplateValues(i, ctrlNote.listNotePosts[i]);
                }
            });
//            ctrlNote.getFavIcon(function(fIcon) {
//
//                if(!isDefine(fIcon) || fIcon === '') {
//                    ctrlNote.favIcon = 'http://typehello.com/favicon.ico';
//                }
//                else {
//                    ctrlNote.favIcon = fIcon;
//                }
//
//                // get notes
//
//                ctrlNote.getNotes( user, function(result) {
//                    This.showProgressBar( false );
//
//                    if( !isDefine(ctrlNote.listNotePosts))
//                        return;
//
//                    // last note become first
//
//                    for( var i = ctrlNote.listNotePosts.length - 1; i >= 0; i--) {
//                        bindDataTemplateValues(i, ctrlNote.listNotePosts[i]);
//                    }
//                });
//            });
        }
        catch(err) {
            console.log('ERROR(NoteHub.readAllNotes())' + err );
        }
    };

    _public.refreshUI = function( listNotes ) {
        try {
            $("#note-list-view-ctrl li").remove();

            for( var i = listNotes.length; i >= 0; i--) {
                bindDataTemplateValues(i, listNotes[i]);
            }
        }
        catch(err) {
            console.log('ERROR(NoteHub.refreshUI())' + err );
        }
    };

    _public.removeNote = function(e) {
        try {
            // remove item from UI

            var template = $(e.target).closest('.note-list-view-item-template').remove();

            // remove from database

            var note = This.noteData;

            This.showProgressBar( true );

            setTimeout(function() {
                ctrlNote.removeNote(This.noteData, function() {
                    This.showProgressBar( false );
                });
            }, 600);
        }
        catch( err ) {
            console.log('ERROR(NoteHub.removeNote()): ' + err );
        }
    };

    _public.expandItem = function(e) {
        // http://stackoverflow.com/questions/3326078/jquery-call-function-from-a-string
        try {

            var list_view = $('#note-list-view-ctrl');

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
            console.log('ERROR(NoteHub.expandItem()): ' + err );
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

            if( ctrlNote.listNotePosts.length === 0 ) {
                return false;
            }

            var searchValue = $('#input-search-notes').val().toLowerCase();
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
            console.log('ERROR(NoteHub.onSearch_Click()): ' + err );
            return false;
        }
    }

    // http://stackoverflow.com/questions/17077777/jquery-press-button-as-enter-on-a-text-field
    function onNoteMainMenu_Click( event ) {
        try {
            event.preventDefault();

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-template-dlg' );

            if( typeof This.commonHub[fun] === 'function' ) {
                This.commonHub[fun]( This, arg, 'create', null, function( result, note ) {

                    if( fun === 'showNoteItemDlg') {

                        // add new note to list

                        if( result === true ) {
                            ctrlNote.listNotePosts.push({note: note});
                            This.refreshUI(ctrlNote.listNotePosts);
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
            console.log('ERROR(NoteHub.onNoteMainMenu_Click()): ' + err );
            return false;
        }
    }

    function onUserAction_Click ( event ) {
        try {
            event.preventDefault();

            //This.userPerClick = getUserPerDataTemplate( 'note-list-view-item-template', event );
            var noteId = getUserPerDataTemplate( 'note-list-view-item-template', event );
            This.noteData = ctrlNote.decodeNote(ctrlNote.getNoteById(noteId));

            if( !isDefine(This.noteData))
                return false;

            var el  = event.target;
            var fun = el.getAttribute( 'data-action' );
            var arg = '.' + el.getAttribute( 'data-template-dlg' );

            contextMenuAction(fun, arg );

            return false;
        }
        catch(err) {
            console.log('ERROR(NoteHub.onUserAction_Click()): ' + err );
            return false;
        }
    }

    function onItemNote_Click( event ) {
        try {
            event.preventDefault();

            var noteId = getUserPerDataTemplate( 'note-list-view-item-template', event );

            showNoteDialog(noteId);

            return false;
        }
        catch(err) {
            console.log('ERROR(NoteHub.onItemNote_Click()): ' + err );
            return false;
        }
    }

    function onFormatting_Click( event ) {
        try {
            event.preventDefault();

            var el  = event.target;
            var act = el.getAttribute( 'data-action' );

            if( act === 'link') {
                addFormatting( "<link>", "</link>" );
            }
            else if(act === 'bold') {
                addFormatting( "<b>", "</b>" );
            }
            else if (act === 'pic') {
                addFormatting( "<pic>", "</pic>" );
            }
            else if (act === 'web') {
                addWebInfoFormatting();
            }

            return false;
        }
        catch(err) {
            console.log('ERROR(NoteHub.onFormatting_Click()): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Formatting

    function addFormatting( _startString, _endString ) {
        try {

            var noteEl = $(".th-dlg-note-item textarea.th-dlg-note-item-text");

            if( !isDefine(This.posFormatting)) {
                This.posFormatting = getCaret(noteEl[0]);
            }

            if( isDefine(This.posFormatting)) {

                if( This.posFormatting.posStart < 0 )
                    return;

                var noteText = noteEl.val();

                if( This.posFormatting.posStart !== This.posFormatting.posEnd ) {
                    var endNote =
                        noteText.substr(0, This.posFormatting.posEnd) +
                            _endString +
                            noteText.substr(This.posFormatting.posEnd);
                    var startNote =
                        endNote.substr(0, This.posFormatting.posStart) +
                            _startString +
                            endNote.substr(This.posFormatting.posStart);
                    noteEl.val( startNote );
                }
                else {
                    var newNote =
                        noteText.substr(0, This.posFormatting.posStart) +
                            _startString + _endString +
                            noteText.substr(This.posFormatting.posStart);
                    noteEl.val( newNote );

                    // set cursor position.

                    var cursorPos = This.posFormatting.posStart + _startString.length;
                    setCursor(noteEl[0], cursorPos, cursorPos);
                }

                This.posFormatting = null;
                This.noteChanged = true;    // user change content of note
            }
        }
        catch(err) {
            console.log('ERROR(NoteHub.addFormatting()): ' + err );
        }
    }

    function addWebInfoFormatting() {
        try {

            var noteEl = $(".th-dlg-note-item textarea.th-dlg-note-item-text");

            if( !isDefine(This.posFormatting)) {
                This.posFormatting = getCaret(noteEl[0]);
            }

            if( !isDefine(This.posFormatting)) {
                This.posFormatting = {};
                This.posFormatting.posStart = 0;
                This.posFormatting.posEnd = 0;
            }

            This.posFormatting.posStart = This.posFormatting.posEnd;

            var noteText = noteEl.val();

            var pageTitle = document.title !== "" ? "\n<b>" + document.title + "</b>": "";
            var pageDescription = getMetaContent('description');
            pageDescription = pageDescription !== "" ?  "\n" + pageDescription: "";
            var pageUrl = "\n<link>" + document.URL + "</link>\n";

            var webInfo = pageTitle + pageDescription + pageUrl;

            var newNote =
                noteText.substr(0, This.posFormatting.posStart) +
                    webInfo +
                    noteText.substr(This.posFormatting.posStart);
            noteEl.val( newNote );

            This.posFormatting = null;
            This.noteChanged = true;    // user change content of note

            noteEl.focus();
            noteEl[0].setSelectionRange(noteEl.val().length, 0);
        }
        catch(err) {
            console.log('ERROR(NoteHub.addWebInfoFormatting()): ' + err );
        }
    }

    // --------------------------------------------------------------- ShowNoteDlg

    function showNoteDialog(noteId) {
        try {
            This.noteData = ctrlNote.decodeNote(ctrlNote.getNoteById(noteId));

            bindDataShowNoteDlg();

            // show dialog

            var zIndex = This.commonHub.getHubZIndex(This);
            This.showNoteDlg.find('.th-dlg').css('z-index', zIndex + 1 );
            This.showNoteDlg.removeClass('invisible-item');
        }
        catch(err) {
            console.log('NoteHub.showNoticeDlg(): ' + err );
        }
    }

    function bindDataShowNoteDlg() {
        try {

            //setNoteImage( This.showNoteDlg.find('.th-dlg-image-panel'), This.noteData.status);

            This.showNoteDlg
                .find('.th-dlg-show-note-title')
                .text( decodeURIComponent(This.noteData.title));

            This.showNoteDlg
                .find('.th-dlg-show-note-tags')
                .text(decodeURIComponent(This.noteData.tags));

            This.showNoteDlg
                .find('.th-dlg-show-note-status')
                .text(decodeURIComponent(This.noteData.status));

            var txtNote = decodeURIComponent(This.noteData.msg);
            var htmlFormat = htmlFormatting(txtNote);
//            This.showNoteDlg
//                .find('.th-dlg-show-note-content')
//                .text( reFormat );
            This.showNoteDlg
                .find('.th-dlg-show-note-content')
                .empty()
                .append( '<span>' + htmlFormat + '</span>');
        }
        catch(err) {
            console.log('ERROR(NoteHub.bindDataShowDlg())' + err );
        }
    }

    // http://jsfiddle.net/YP3KW/
    // http://stackoverflow.com/questions/6064956/replace-all-occurrences-in-a-string?lq=1
    // http://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
    function htmlFormatting(_note_text) {
        try {
            // bold

            var regex = new RegExp("<b>", 'g');
            _note_text = _note_text.replace(regex, '<span class="th-bold">');

            regex = new RegExp("</b>", 'g');
            _note_text = _note_text.replace(regex, '</span>');

            // <link>rost</link>1234567890 <link>resh</link>

            var linkIndex = 0;
            var linkNode = null;

            while ( linkIndex > -1 ) {

                linkNode = getNodeValueByPos( _note_text, "<link>", "</link>", 0 );

                linkIndex = linkNode.indexLast;

                if( isDefine(linkNode.nodeValue )) {
                    _note_text =_note_text.replace("<link>", "<a class='th-note-show-dlg-link' href='" + linkNode.nodeValue + "'>");
                    _note_text =_note_text.replace("</link>", "</a>");
                }
            }

            // <img src="URL" alt="..." />

            linkIndex = 0;

            while ( linkIndex > -1 ) {

                linkNode = getNodeValueByPos( _note_text, "<pic>", "</pic>", 0 );

                linkIndex = linkNode.indexLast;

                if( isDefine(linkNode.nodeValue )) {
                    _note_text =_note_text.replace("<pic>", "<br><img class='th-note-show-dlg-img' src='" + linkNode.nodeValue + "'>");
                    _note_text =_note_text.replace("</pic>", "<br>");
                }
            }

            // '/n'

            _note_text = _note_text.replace( /\n/g, '<br>' );

            return _note_text;
        }
        catch(err) {
            console.log('ERROR(NoticeHub.htmlFormatting())' + err );
           return "";
        }
    }

    function getNodeValueByPos( _note_text, _startNode, _finishNode, _posStart ) {
        try {
            var indexFirst = _note_text.indexOf(_startNode, _posStart );

            if( indexFirst > -1 ) {
                var indexLast = _note_text.indexOf(_finishNode, indexFirst + _startNode.length);

                if( indexLast > -1 ) {
                    var nodeValue = _note_text.substring( indexFirst + _startNode.length, indexLast );

                    return {
                        nodeValue:  nodeValue,
                        indexFirst: indexFirst,
                        indexLast:  indexLast
                    };
                }
            }

            return {
                nodeValue:  null,
                indexFirst: -1,
                indexLast:  -1
            };
        }
        catch(err) {
            console.log('ERROR(NoticeHub.getNodeValueByPos())' + err );
            return {
                nodeValue:  null,
                indexFirst: -1,
                indexLast:  -1
            };
        }
    }

    function setNoteImage( _elImage, _note_status ) {
        try {
            _elImage
                .removeClass('note-status-define')
                .removeClass('note-status-progress')
                .removeClass('note-status-complete');

            var ci =
                _note_status === note_status.define   ? 'note-status-define' :
                _note_status === note_status.progress ? 'note-status-progress' : 'note-status-complete';

            _elImage.addClass(ci);

        }
        catch(err) {
            console.log('ERROR(NoticeHub.setNoticeImage())' + err );
        }
    }

    function onCloseShowNoteDlg_Click( event ) {
        try {
            event.preventDefault();

            if( !This.showNoteDlg.hasClass('invisible-item')) {
                This.showNoteDlg.addClass('invisible-item');
                This.noteData = null;
            }

            return false;
        }
        catch(err) {
            console.log('NoteHub.onCloseAddNoticeDlg_Click(): ' + err );
            return false;
        }
    }

    // --------------------------------------------------------------- Support functions

    function setUIEvents() {
        try {

            // showNoteDialog ------------------------------------------------------------

            This.showNoteDlg = $('#th-dlg-template-show-note');

            $(document).on("click", "#th-dlg-template-show-note .th-dlg-show-note .btn-circle", onCloseShowNoteDlg_Click );

            // formatting note dialog --------------------------------------------------------

            $(document).on("click", ".th-dlg-note-item .th-formatting-tools-list li", onFormatting_Click );

            // http://stackoverflow.com/questions/24490653/modifying-input-field-on-keyup-click-and-drop-events
            $(document).on("keyup click", ".th-dlg-note-item textarea.th-dlg-note-item-text", function(e) {
                This.posFormatting = getCaret(this);
            });

            // another events ------------------------------------------------------------

            $('#btn-input-search-notes').click( onSearch_Click );
            $('#input-search-notes').keyup(function(e) { if(e.keyCode === 13) { onSearch_Click(e); } });

            $(document).on("click", ".note-hub .th-user-actions li span", onUserAction_Click );

            //$(document).on("click", "#note-list-view-ctrl li .template-title", onItemNote_Click );
            $(document).on("click", "#note-list-view-ctrl li .template-text span", onItemNote_Click );

            $(document).on("click", ".note-hub ul.th-ul-main-menu li", onNoteMainMenu_Click );

            $(document).on("mouseenter", "#note-list-view-ctrl li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '1.0');
            });
            $(document).on("mouseleave", "#note-list-view-ctrl li", function(e) {
                var itemToolBar = $(this).find('.th-user-actions');
                itemToolBar.css( 'opacity', '0.0');
            });

            // check if user save all data of note

            $(window).bind('beforeunload', function(e) {
                if(This.noteChanged) {
                    return 'HEY SAVE YOUR NOTE FIRST ?';
                }
            });
        }
        catch( err ) {
            console.log('ERROR(NoteHub.setUIEvents()): ' + err );
        }
    }

    function contextMenuAction( fun, arg ) {
        try {
            if( typeof This.commonHub[fun] === 'function' ) {
                This.commonHub[fun]( This, arg, 'edit', This.noteData, function( result, note ) {

                    if( fun === 'showNoteItemDlg') {

                        // edit note

                        if( result === true ) {

                           /*
                            var noteData = ctrlNote.getNoteById(note.id);
                            noteData.title  = note.title;
                            noteData.msg    = note.msg;
                            noteData.tags   = note.tags;
                            noteData.status = note.status;
                            //noteData.link  = note.link;
                            noteData.pic    = note.pic;
                           */

                           var noteIndex = ctrlNote.getNoteIndexById(note.id);
                           ctrlNote.listNotePosts[noteIndex].note = note;
                           //var updatedNote = ctrlNote.listNotePosts[noteIndex].note;
                           //updatedNote = note;

                           This.refreshUI(ctrlNote.listNotePosts);
                        }
                    }
                });
            }
            else if( typeof This[fun] === 'function' ) {
                if( fun === 'removeNote') {
                    if (confirm("Are you sure you want delete this Note?") !== true) {
                        return;
                    }
                }
                This[fun](event);
            }
        }
        catch(err) {
            console.log('ERROR(NoteHub.contexMenuAction()): ' + err );
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

                for( var i = 0; i < ctrlNote.listNotePosts.length; i++ ) {
                    var noteCheck = ctrlNote.listNotePosts[i];

                    if( noteCheck.note.title.toLowerCase().indexOf(sValue) > -1 ||
                        noteCheck.note.msg.toLowerCase().indexOf(sValue)   > -1 ||
                        noteCheck.note.tags.toLowerCase().indexOf(sValue)  > -1 ) {

                        // if this 'note' already in list of result?

                        var isNoteExist = false;
                        for( var l = 0; l < This.searchResults.length; l++ ) {
                            var noteIn = This.searchResults[l];

                            if( noteIn.note.id === noteCheck.note.id ) {
                                isNoteExist = true;
                                break;
                            }
                        }

                        if( !isNoteExist ) {
                            This.searchResults.push( noteCheck );
                        }
                    }
                }
            }

            if( This.searchResults.length > 0 ) {
                This.refreshUI(This.searchResults);
            }

        }
        catch(err) {
            console.log('ERROR(NoteHub.searchRoutine()): ' + err );
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
            console.log('ERROR(NoteHub.rePositionHub())' + err );
        }
    }

    function removeCommandCharacters(_text) {
        //http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
        try {
            var arrCommmads = ['<b>','</b>','<pic>','</pic>','<link>','</link>'];

            for( var i = 0; i < arrCommmads.length; i++ ) {
                var rpl = new RegExp(arrCommmads[i], 'g');
                _text = _text.replace(rpl, '');
            }

            return _text;
        }
        catch(err) {
            console.log('ERROR(NoteHub.removeCommandCharacters())' + err );
        }
    }

    function bindDataTemplateValues ( index, arg ) {
        try {

            function setNoteStatusImage( _note_status ) {
                try {
                    var elImage = $(This.noteTemplate).find('.template-favicon');

                    elImage
                        .removeClass('note-status-define')
                        .removeClass('note-status-progress')
                        .removeClass('note-status-complete');

                    /*
                    var classImage;

                    if( _note_status === note_status.define ) {
                        classImage = 'note-status-define';
                    }
                    else if( _note_status === note_status.progress ) {
                        classImage = 'note-status-progress';
                    }
                    else if( _note_status === note_status.complete ) {
                        classImage = 'note-status-complete';
                    }

                    elImage.addClass(classImage);
                    */

                    var ci =
                        _note_status === note_status.define   ? 'note-status-define' :
                        _note_status === note_status.progress ? 'note-status-progress' : 'note-status-complete';

                    elImage.addClass(ci);
                }
                catch(err) {
                    console.log('ERROR(NoteHub.setNoteStatusImage()): ' + err );
                }
            }

            function setTemplatePic() {
                if( note.pic === '' ) {
                    //hideTemplatePic(tmpImg);
                    tmpImg.css( 'display', 'none');
                }
                else {
                    tmpImg.attr('src', note.pic );
                }
            }

            if( !isDefine(arg)) {
                return;
            }

            if( !This.noteTemplate) {
                var itemScript   = $('#note-item-template').html();
                This.noteTemplate = $( itemScript );
            }

            if( This.noteTemplate.length === 0 )
                return;

            var _note = arg.note;

            var note = ctrlNote.decodeNote(_note);

            var jsnUser = JSON.stringify(_note.id);   // id of user will not decode
            $(This.noteTemplate).find('.template-data span').text(jsnUser);

            $(This.noteTemplate).find('.template-date span').text(_note.date);

            var lenTtl = 60;
            $(This.noteTemplate).find('.template-title span')
                .text( note.title.length >= lenTtl ? note.title.slice( 0, lenTtl - 3 ) + '...' : note.title );

            var content = $(This.noteTemplate).find('.template-text span');
            if( note.msg === '') {
                content.closest('div').css( 'margin-top', '0');
                content.text('');
            }
            else {

                var clnMsg = removeCommandCharacters(JSON.parse(JSON.stringify( note.msg)));
                var msg2 = removeCommandCharacters(cloneObject(note.msg));
                var lenMsg = 90;

                content
                    .text(clnMsg.length >= lenMsg ? clnMsg.slice( 0, lenMsg - 3 ) + '...' : clnMsg);
                //content.closest('div').css( 'margin-top', '15px');
            }

            var tmpImg = $(This.noteTemplate).find('.template-pic img');
            setTemplatePic();

            //setNoteStatusImage( note.status );

            var htmlTemplate = This.noteTemplate[0].outerHTML;
            $("#note-list-view-ctrl").last().append('<li>' + htmlTemplate + '</li>');

            tmpImg[0].removeAttribute('style');  // remove previous note image.
        }
        catch(err) {
            console.log('ERROR(NoteHub.bindDataTemplateValues())' + err );
        }
    }

    return NoteHub;

})(thJQ);

th.next.NoteController = (function($) {
    var This
        ,_public = NoteController.prototype;

    function NoteController() {
        This = this;

        this.listNotePosts = [];
        this.favIcon      = null;

        this.Initialize();
    }

    _public.Initialize = function() {
    };

    _public.getFavIcon = function( callback ) {
        try {

            function checkIconUrl( icon_url, callback) {
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

            function getFavIconUrlByDomain() {
                var urlFavIcon = "";

                var domain = getDomain();

                if( domain.indexOf('http://www.') > -1 ) {
                    urlFavIcon   = encodeURI( removeLineBreaks( getDomain() + '/favicon.ico'));
                }
//            else if( domain.indexOf('http://') > -1 ) {
//                note.ico   = encodeURI( removeLineBreaks( getDomain() + '/favicon.ico'));
//            }
                else if( domain.indexOf('www.') > -1 ) {
                    urlFavIcon   = encodeURI( removeLineBreaks( 'http://' + getDomain() + '/favicon.ico'));
                }
                else {
                    urlFavIcon   = encodeURI( removeLineBreaks( 'http://www.' + getDomain() + '/favicon.ico'));
                }

                return urlFavIcon;
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
            console.log('ERROR(NoteController.getFavIcon())' + err );
        }
    };

    _public.getNotes = function( userOwner, callback ) {
        try {
            // if we need refresh, delete This.listNotePosts = []; first

            if( This.listNotePosts.length > 0)
                return;

            if(!isDefine( userOwner ))
                return;

            var req = 'get-n-last-notes';
            var request = {
                dbcall:       'db-get'
                , dbcollection: 'notes'
                , dbrequest:    {
                    'owner': userOwner.id
                }
                , dbreturn : {
                    'note': 1 // what object of record have to return
                }
//                , dblimit: {
//                    'limit': 4 // how many record have to return
//                }
            };

            var ajaxData = JSON.stringify(request);

            function success_call( data, textStatus, jqXHR ) {

                if(isJsonData(data)) {
                    var parser = JSON.parse(data);

                    if( typeof parser.param === "object" ) {

                        This.listNotePosts = parser.param;

                        sendCallBack(callback( true ));

                        return;
                    }
                }

                sendCallBack(callback( false ));
            }

            function error_call ( jqXHR, textStatus, errorThrown ) {
                console.log('ERROR[NoteController.getNotes()]: ' + errorThrown );

                sendCallBack(callback( false));
            }

            ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
        }
        catch(err) {
            console.log('ERROR(NoteController.getNotes())' + err );
        }
    };

    _public.addNote = function( _note, _This, callback  ) {
        try {

            if( !isDefine(_note)) {
                return;
            }

            _This.showProgressBar( true );

            var note = This.encodeNote(_note);

            var req     = 'add-note';
            var request = {
                dbcall:        'db-add',
                dbcollection:  'notes',
                dbrequest:      {
                    'owner':  getUser().id
                    , 'note':   {
                          'id':     GUID()
                        , 'date':   getCurrentDate()
                        , 'title':  note.title
                        , 'msg':    note.msg
                        , 'status': note.status
                        //, 'link':   note.link
                        , 'pic':    note.pic
                        , 'tags':   note.tags
                        , 'comments': []
                    }
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {
                  return;
                },
                function( jqXHR, textStatus, errorThrown ) {
                    console.log('add new NOTE Fail... -' + errorThrown );
                });

            // update UI

            //This.decodeNote( request.dbrequest.note );

            //sendCallBack(callback( true, request.dbrequest.note ));
           sendCallBack(callback( true, _note ));

            _This.showProgressBar( false );

        }
        catch(err) {
            console.log('ERROR(NoteController.addNote())' + err );
        }
    };

    _public.removeNote = function( note, callback  ) {
        try {

            if( !isDefine(note)) {
                sendCallBack(callback());
                return;
            }

            var req     = 'remove-note';
            var request = {
                dbcall:        'db-remove',
                dbcollection:  'notes',
                dbfind:        {
                    'owner':   getUser().id,
                    'note.id': note.id
                }
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {},
                function( jqXHR, textStatus, errorThrown ) {});

            sendCallBack(callback());    // we don't wait for http-response
        }
        catch(err) {
            console.log('ERROR(NoteController.removeNote())' + err );
        }
    };

    _public.updateNote = function( _note, _This, callback  ) {
        try {

            if( !isDefine(_note)) return;

            _This.showProgressBar( true );

            var note = This.encodeNote( _note );

            var req     = 'update-note';
            var request = {
                dbcall:        'db-update',
                dbcollection:  'notes',
                //dbfind:        { 'owner': getUser().id, 'note.id': note.id },
                dbfind:        { 'note.id': note.id },
                dbupdate:       { '$set': {
                  'note.title':     note.title
                  , 'note.msg':     note.msg
                  , 'note.status':  ''
                  //, 'note.link':   note.link
                  , 'note.pic':     note.pic === 'undefined' ? '' : note.pic
                  , 'note.tags':    note.tags === 'undefined' ? '' : note.tags
               }}
               /*
                dbupdate:      { '$set': {
                      'note.title':  note.title
                    , 'note.msg':    note.msg
                    , 'note.status': note.status
                    //, 'note.link':   note.link
                    , 'note.pic':    note.pic
                    , 'note.tags':   note.tags
                }}
               */
            };

            var ajaxData = JSON.stringify(request);

            ajaxCall( pathServer + req, req + '=' + ajaxData,
                function( data, textStatus, jqXHR ) {
                   _This.showProgressBar( false );
                   sendCallBack(callback( true, _note ));
                },
                function( jqXHR, textStatus, errorThrown ) {
                   _This.showProgressBar( false );
                   sendCallBack(callback( false, _note ));
                });
        }
        catch(err) {
            console.log('ERROR(NoteController.updateNote())' + err );
        }
    };

    _public.getNoteById = function (noteId) {
        try {

            if( !isDefine(noteId)) {
                return null;
            }

            for( var i = 0; i < This.listNotePosts.length; i++ ) {
                var note = This.listNotePosts[i].note;
                if( note.id === noteId) {
                    return note;
                }
            }

            return null;
        }
        catch(err) {
            console.log('ERROR(NoteController.getNoteById()): ' + err );
            return null;
        }
    };

    _public.getNoteIndexById = function (noteId) {
        try {

            if( !isDefine(noteId)) {
                return -1;
            }

            for( var i = 0; i < This.listNotePosts.length; i++ ) {
                var note = This.listNotePosts[i].note;
                if( note.id === noteId) {
                    return i;
                }
            }

            return -1;
        }
        catch(err) {
            console.log('ERROR(NoteController.getNoteIndexById()): ' + err );
            return -1;
        }
    };

    // --------------------------------------------------------------- Support functions

    _public.encodeNote = function( note ) {
        try {
            if( !isDefine(note))
                return;

           var noteEncoded = {};

           noteEncoded.msg    = encodeURIComponent( encodeLineBreaks( note.msg ));
           noteEncoded.status = encodeURIComponent( encodeLineBreaks( note.status ));
           noteEncoded.tags   = encodeURIComponent( encodeLineBreaks( note.tags ));
           noteEncoded.title  = isDefine(note.title) ? encodeURIComponent( encodeLineBreaks( note.title )) : '';
           noteEncoded.pic    = isDefine(note.pic) ? encodeURIComponent( encodeLineBreaks( note.pic )) : '';
           noteEncoded.id     = note.id;

           return noteEncoded;
        }
        catch(err) {
            console.log('ERROR(NoteController.encodeNote())' + err );
        }
    }

    _public.decodeNote =  function( note ) {
        try {

           if( !isDefine(note))
              return;

           var noteDecoded = {};

           noteDecoded.msg    = decodeURIComponent( decodeLineBreaks( note.msg ));
           noteDecoded.status = decodeURIComponent( decodeLineBreaks( note.status ));
           noteDecoded.tags   = decodeURIComponent( decodeLineBreaks( note.tags ));
           noteDecoded.title  = decodeURIComponent( decodeLineBreaks( note.title ));
           noteDecoded.pic    = decodeURIComponent( decodeLineBreaks( note.pic ));
           noteDecoded.id     = note.id;
           noteDecoded.date   = note.date;

           return noteDecoded;
        }
        catch(err) {
            console.log('ERROR(NoteController.decodeNote())' + err );
        }
    }

    return NoteController;

})(thJQ);
