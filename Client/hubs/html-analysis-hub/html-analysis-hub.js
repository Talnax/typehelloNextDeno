/*
 * Author:  Rost Shevtsov ( herclia )
 * Created: 1/16/16.
 * product: NullChannel ( TypeHello )
 * file:    html-analysis-hub.js
 */

/*
   http://www.x-file.su/tm/ – сервис определения тональности или эмоциональной нагрузки текста от компании Ай-Теко.  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

   http://www.la0.ru/ – удобный и релевантный сервис анализа ссылок и бэклинков на интернет-ресурс. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   http://xseo.in/webarch
   http://xseo.in/smz - analys links

   http://regex.info/exif.cgi - сервис позволяет по URL изображения проводить его анализ. Работает практически со всеми видами файлов. - !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

   http://kbsportal.com/, http://kbsportal.com/demo - text analyses -- ????? !!!!!

   http://info.leximancer.com/ - text analyses -- ????? !!!!!

   http://www.meaningcloud.com/demo#  - text analyses -- ????? !!!!!

   http://stackoverflow.com/questions/13911681/remove-html-tags-from-a-javascript-string
   http://stackoverflow.com/questions/22398635/how-to-strip-html-tags-from-div-content-using-javascript-jquery
 */

/*
// support
 // http://nealchester.com/special-characters/ - HTML SPECIAL CHARACTERS
http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
http://stackoverflow.com/questions/2966796/how-to-get-a-webpage-as-plain-text-without-any-html-using-javascript

-How to convert simple array into two-dimensional array(matrix) in javascript (or jquery)
 http://stackoverflow.com/questions/4492385/how-to-convert-simple-array-into-two-dimensional-arraymatrix-in-javascript-or
 http://evanw.github.io/lightgl.js/docs/matrix.html - matrix.js

 */

"use strict";

var th  = th || {};
th.next = th.next || {};

th.next.htmAnalysis = (function($) {
   var This,
      _public = htmAnalysis.prototype;

   function htmAnalysis() {
      This = this;

      //this.listFrequencyWords = [];
      this.listExcludeWords = [];
      this.cssClassHub = '.html-analysis-hub';
      This.howManyWordsForPhrase = 9;

      this.activeUrl = document.location.href;

      this.localPageData = {};

      this.webPageData = [];

      this.dlgLabAnalysis = null;

      this.setPageElements();

      this.activePanel = '';

      this.feedbackClass = ".html-analysis-hub-dlg-feedback";

      this.hubStatus = statusHub.not_active;

      this.commonHub = new th.next.CommonHub( this );

      this.Initialize();

      // css
      // http://codepen.io/anon/pen/yepoNK
   }

   // --------------------------------------------------------------- Public functions

   _public.Initialize = function() {
      try {
         This.commonHub.removeMainMenuItem( This, 'html-analysis');

         this.initHub();

         This.commonHub.setHubPosition( This );

         if( !ctrlHtmlAnalysis ) {
            ctrlHtmlAnalysis  = new th.next.htmAnalysisController();
         }

         setUIEvents();

         setPageInfo();

         This.hubStatus = statusHub.initialized;

         showAnalysesToolSection(false);
      }
      catch(err) {
         console.log('ERROR(htmAnalysis.Initialize())' + err );
      }
   };

   _public.setPageElements = function() {
      try {
         this.hub            = $( this.cssClassHub);
         this.pageInfo       = $( this.cssClassHub + ' .general-page-info' );
         this.pageInfoItem   = $( this.cssClassHub + ' .general-page-info .ncl-page-item' );
         this.toolBar        = $( this.cssClassHub + ' ul.th-ul-main-menu'  );
         this.toolBarItem    = $( this.cssClassHub + ' ul.th-ul-main-menu li' );
         this.toolBarAnalys  = $( this.cssClassHub + ' ul.th-ul-main-menu .analyses-menu' );
         this.toolBarStandard = $( this.cssClassHub + ' ul.th-ul-main-menu .standard-menu' );
         this.toolTipFooter  = $( this.cssClassHub + ' .th-footer');
         this.mainPanel      = $( this.cssClassHub + ' .th-analysis-content' );

         this.hubTitleElm    = $( this.cssClassHub + ' .th-cover .th-article .th-title' );
         this.subTitleElm    = $( this.cssClassHub + ' .th-cover .th-article .sub-title' );
         this.hubTitleVal    = this.hubTitleElm.text();
         this.subTitleVal    = this.subTitleElm.text();
      }
      catch(err) {
         console.log('ERROR(htmlAnalysis.setPageElements())' + err );
      }
   };

   _public.refreshUI = function() {
      //try {
      //
      //}
      //catch(err) {
      //   console.log('ERROR(htmAnalysis.refreshUI())' + err );
      //}
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

   _public.showToolTip = function( txt_tooltip, show ) {
      try {
         if( show ) {
            This.toolTipFooter.css( 'display', 'block' );
            This.toolTipFooter.find('.footer-tool-tip').html(txt_tooltip);
         }
         else {
            This.toolTipFooter.css( 'display', 'none' );
         }
      }
      catch(err) {
         console.log('ERROR(htmAnalysis.showToolTip())' + err );
      }
   };

   // --------------------------------------------------------------- OnClick functions

   function onAnalysisMainMenu_Click( event ) {
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
         console.log('htmAnalysis.onAnalysisMainMenu_Click(): ' + err );
         return false;
      }
   }

   function onUserAction_Click ( e ) {
      try {
         e.preventDefault();

         var el  = event.target;
         var fun = el.getAttribute( 'data-action' );

         if( typeof This[fun] === 'function' ) {
            This[fun]();
         }

         return false;
      }
      catch(err) {
         console.log('ERROR(htmAnalysis.onUserAction_Click()): ' + err );
         return false;
      }
   }

   function onExcludeWords_Click( event ) {
      try {
         event.preventDefault();

         var content = $("#th-input-exclude-words").val().trim();
         This.listExcludeWords = content.split(" ");

         if( This.listExcludeWords.length === 0 )
            return;

         if( This.activeUrl !== document.location.href ) {
            prepareDynamicAnalysis(This.activeUrl);
         }
         else {
            setLocalContentInfo( function(err, frequency_words, pure_content ) {
               if(!err) {
                  setPhraseContentInfo(frequency_words, pure_content);
               }
            });
         }

         return false;
      }
      catch(err) {
         console.log('htmAnalysis.onExcludeWords_Click(): ' + err );
         return false;
      }
   }

   function onEntryWordsAnalysis_Click( event ) {
      try {
         event.preventDefault();

         var content = $("#th-input-analysis-words").val().trim();
         //This.listAnalysisWords = content.split(" ");
         This.listAnalysisWords = ['кисло']; // кисло

         if( This.listAnalysisWords.length !== 0 ) {
            prepareEntryWordsAnalysis(This.listAnalysisWords[0]);
         }

         return false;
      }
      catch(err) {
         console.log('htmAnalysis.onEntryWordsAnalysis_Click(): ' + err );
         return false;
      }
   }

   // --------------------------------------------------------------- Entry words

   function prepareEntryWordsAnalysis(analysis_word) {
      try {

         // amount of words in raw-text
         var amount_words_in_raw_text = This.localPageData.raw.split(' ').length - 1;
         //var entry = This.localPageData.raw.split(word).length - 1;

         var word_indexes = [];
         var values_per_analysis_word_in_raw_text = [];
         var count_analysis_word_in_raw_text = getAmountOfEntryWords(This.localPageData.raw, analysis_word, word_indexes );
         if( count_analysis_word_in_raw_text ) {
            values_per_analysis_word_in_raw_text = getEntryWordsListByIndex(This.localPageData.raw, word_indexes, analysis_word );
         }

         // ui data

         var data = {
            analysis_word: analysis_word,
            amount_words_in_raw_text: amount_words_in_raw_text,
            count_analysis_word_in_raw_text: count_analysis_word_in_raw_text,
            values_per_analysis_word_in_raw_text: values_per_analysis_word_in_raw_text

         };

         //var list = [3, 5, 7];
         //list.foo = 'bar';
         //
         //for (var key in list) {
         //   console.log(key); // 0, 1, 2, foo
         //}
         //
         //for (var value of list) {
         //   console.log(value); // 3, 5, 7
         //}

         setEntryWordsContentInfo(data);

      }
      catch(err) {
         console.log('htmlAnalysis.prepareDynamicAnalysis(): ' + err );
      }
   }

   function setEntryWordsContentInfo( data, callback) {
      try {

         // ui

         var tbody = $('.content-panel table.entry-table tbody');
         tbody.find('tr').remove(); // clean previous values

         /*
         for( var i = 0; i < len_words; i++ ) {
            var item = frequency_words[i];

            var tr_el =  "<tr>" +
               "<th>" + i + "</th>" +
               "<td>" + item.name  + "</td>" +
               "<td>" + item.count + "</td>" +
               "<td>" + item.freq  + "</td>" +
               "</tr>";

            var jq_tr = $(tr_el);

            tbody.append(jq_tr);
         }
         */

         // 1. occurrence of the word in the text
         var tr_el =  "<tr>" +
            "<th>" + 1 + "</th>" +
            "<td>" + 'amount of words in raw text'  + "</td>" +
            "<td>" + data.amount_words_in_raw_text + "</td>" +
            "</tr>";
         tbody.append($(tr_el));

         // 2. occurrence of the word in the text
         tr_el =  "<tr>" +
            "<th>" + 2 + "</th>" +
            "<td>" + 'occurrence of the word in the raw text'  + "</td>" +
            "<td>" + data.count_analysis_word_in_raw_text + "</td>" +
            "</tr>";
         tbody.append($(tr_el));

         // 3. values per analysis-word in raw text ( which words was finding per analysis-word )
         if( data.values_per_analysis_word_in_raw_text.length > 0 ) {

            var values = '';
            data.values_per_analysis_word_in_raw_text.forEach(function(item, i, arr) {
               values = values + item + '<br>'
            });

            tr_el = "<tr>" +
               "<th>" + 3 + "</th>" +
               "<td>" + 'values per analysis-word in raw text' + "</td>" +
               "<td>" + values + "</td>" +
               "</tr>";
            tbody.append($(tr_el));
         }

         $('.content-panel .entry-section .entry-links-key').text("word for analysis: " + data.analysis_word);
         $('.content-panel .entry-section .entry-links-val').text("[" + data.count_analysis_word_in_raw_text + "]");
      }
      catch(err) {
         console.log('htmlAnalysis.setEntryWordsContentInfo(): ' + err );
      }
   }

   function getAmountOfEntryWords (text, analysis_word, indexes) {
      try {
         // http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
         // https://learn.javascript.ru/string
         var start = 0, count = 0, offset = analysis_word.length;

         while((start = text.indexOf(analysis_word, start) + offset) !== (offset - 1)) {
            indexes.push(start - offset);
            ++count;
         }

         return count;
      }
      catch(err) {
         console.log('htmAnalysis.getAmountOfEntryWords(): ' + err );
         return -1;
      }
   }

   function getEntryWordsListByIndex( text, word_indexes, analysis_word ) {
      try {

         var offset = analysis_word.length;

         var word_values = word_indexes.map(function(index) {

            let next = 1;

            for( ;; ) {
               let word = text.substr(index, offset + next);
               var res = word.match(/[.,-\/#@+!$%\^&\*; «»:{}=\-_—`"'~()(\r\n|\n|\r)]/g);
               if(res === null) {
                  next++;
               }
               else {
                  return word.substr(0, offset + next-1);
               }
            }


         });

         //let next = 1;
         //let word = '';
         //let word_values = [];
         //for( let i = 0; i < word_indexes.length; i++ ) {
         //   var index = word_indexes[i];
         //
         //   for( ;; ) {
         //      word = text.substr(index, offset + next);
         //      var res = word.match(/[.,-\/#@+!$%\^&\*; «»:{}=\-_—`"'~()(\r\n|\n|\r)]/g);
         //      if(res === null) {
         //         next++;
         //      }
         //      else {
         //         word_values.push(word.substr(0, offset + next-1));
         //         next = 0;
         //         break;
         //      }
         //   }
         //
         //}

         return word_values;
      }
      catch(err) {
         console.log('htmAnalysis.getEntryWordsListByIndex(): ' + err );
      }
   }





   function onUrlDynamic_Click( event ) {
      try {
         event.preventDefault();

         var url = $("#th-input-dynamic-url").val().trim();
         //var url = 'http://www.rambler.ru/';
         //var url = 'http://letaet.livejournal.com/1204618.html';

         if(isURL(url)) {
            prepareDynamicAnalysis(url);
         }

         return false;
      }
      catch(err) {
         console.log('htmAnalysis.onUrlDynamic_Click(): ' + err );
         return false;
      }
   }

   function onShowAnalysisContent_Click( event ) {
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
         console.log('htmAnalysis.onShowAnalysisContent_Click(): ' + err );
         return false;
      }
   }

   function onCloseCleanContentText_Click() {
      try {
         event.preventDefault();

         // hide no need ui

         $('.clean-text-section').css('display', 'none');

         // show need ui

         showAnalysesContentPanel( true );

         return false;
      }
      catch(err) {
         console.log('htmAnalysis.onAnalysisMainMenu_Click(): ' + err );
         return false;
      }
   }

   function onCloseRawContentText_Click() {
      try {
         event.preventDefault();

         // hide no need ui

         $('.raw-text-section').css('display', 'none');

         // show need ui

         showAnalysesContentPanel( true );

         return false;
      }
      catch(err) {
         console.log('htmAnalysis.onCloseRawContentText_Click(): ' + err );
         return false;
      }
   }

   function onBtnExpanderTools_Click(event) {
      try {
         var el = event.target;

         var showPanel  = el.innerHTML === "+" ? true : false;
         var btnContent = el.innerHTML === "-" ? "+" : "-";

         el.innerHTML = btnContent;
         showAnalysesToolSection(showPanel);
      }
      catch(err) {
         console.log('ERROR[NewsHub.onBtnExpander_Click()]: ' + err );
      }
   }

   // --------------------------------------------------------------- On*Analyses

   _public.onHome = function() {
      try {
         This.hub.css('width', '330px');

         showAnalysisPanel(false);

         cleanDataSection();

         changeHubTitle( This.hubTitleVal, This.subTitleVal );
      }
      catch(err) {
         console.log('htmAnalysis.onHome(): ' + err );
      }
   };

   _public.onLab = function() {
      try {

         if( !isDefine( This.dlgLabAnalysis )) {
            This.dlgLabAnalysis  = new th.next.AnalysisLabDialog();
            This.dlgLabAnalysis.parentWnd = This;
         }

         This.dlgLabAnalysis.OpenDlg(This.cssClassHub);
      }
      catch(err) {
         console.log('htmAnalysis.onLab(): ' + err );
      }
   };

   _public.onTagAnalysis = function() {
      /*
      * http://www.cssscript.com/demo/pure-css-circular-percentage-bar/
      * http://codepen.io/geedmo/pen/InFfd
      * */
      try {
         This.activePanel = ' .web-panel';

         This.hub.css('width', '720px');

         showAnalysisPanel(true);

         setTagsInfo();

         setLinksInfo();

         changeHubTitle( "Tags on Page", "all type of tags on current web page" );
      }
      catch(err) {
         console.log('htmAnalysis.onTagAnalysis(): ' + err );
      }
   };

   _public.onContentAnalysis = function() {
      try {

         This.activePanel = ' .content-panel';

         showAnalysisPanel(true);

         setLocalContentInfo( function(err, frequency_words, pure_content ){
            if(!err) {
               setPhraseContentInfo(frequency_words, pure_content);
            }
         });

         changeHubTitle( "Content analysis", "frequency of words" );


         // ROST-TEST
         prepareEntryWordsAnalysis('кисло');

      }
      catch(err) {
         console.log('htmAnalysis.onContentAnalysis(): ' + err );
      }
   };

   //_public.onScriptAnalysis = function() {
   //   try {
   //
   //      This.activePanel = ' .script-panel';
   //
   //      showAnalysisPanel(true);
   //   }
   //   catch(err) {
   //      console.log('htmAnalysis.onScriptAnalysis(): ' + err );
   //   }
   //};

   _public.onRawContent = function() {
      try {
         // hide no need ui

         showAnalysesContentPanel( false );

         // set data

         var rawEl = $('.raw-text-section');
         var url, text;

         if( This.activeUrl !== document.location.href ) {
            var webPageData = checkWebPageData(This.activeUrl);
            text = webPageData.text;
            url = webPageData.url;
         }
         else {
            text = This.localPageData.raw;
            url = This.localPageData.url;
         }

         rawEl.find('.content-attributes .attribute-value').text(This.localPageData.url);
         $('#edit-raw-content').text(This.localPageData.raw);

         rawEl.css('display', 'block');
      }
      catch(err) {
         console.log('htmAnalysis.onRawContent(): ' + err );
      }
   };

   _public.onCleanContent = function() {
      try {

         // hide no need ui

         showAnalysesContentPanel( false );

         // set data

         $('.clean-text-section').css('display', 'block');

         if( This.activeUrl !== document.location.href ) {
            var webPageData = checkWebPageData(This.activeUrl);
            $('.content-attributes .attribute-value').text(webPageData.url);
            $('#edit-clean-content').text(webPageData.text);
         }
         else {
            $('.content-attributes .attribute-value').text(This.localPageData.url);
            $('#edit-clean-content').text(This.localPageData.text);
         }
      }
      catch(err) {
         console.log('htmAnalysis.onCleanContent(): ' + err );
      }
   };

   // --------------------------------------------------------------- Dynamic url

   function prepareDynamicAnalysis(url) {
      try {

         This.activeUrl = url;

         var webPageData = checkWebPageData(url);

         if( webPageData ) {

            runDynamicAnalysis(webPageData.text);

            return false;
         }

         This.showProgressBar( true );

         ctrlHtmlAnalysis.getPureTextPerUrl(url, function(err, data) {

            This.showProgressBar( false );

            if(!err) {

               data = decodeURIComponent(JSON.parse( data ).param);

               // cache web-data

               if(checkWebPageData(url) === null ) {
                  var dataItem = {
                     url: url,
                     text: data
                  }
                  This.webPageData.push(dataItem);
               }

               runDynamicAnalysis(data);
            }
         });
      }
      catch(err) {
         console.log('htmlAnalysis.prepareDynamicAnalysis(): ' + err );
      }
   }

   function runDynamicAnalysis(data) {
      try {

         This.listExcludeWords = $("#th-input-exclude-words").val().trim().split(" ");

         setDynamicContentInfo( data, function(err, frequency_words ) {
            if(!err) {
               setPhraseContentInfo(frequency_words, data );
            }
         });
      }
      catch(err) {
         console.log('htmlAnalysis.runDynamicAnalysis(): ' + err );
         return null;
      }
   }

   function setDynamicContentInfo( data, callback) {
      try {
         var words = data.split(' ');

         var frequency_words = ctrlHtmlAnalysis.frequencyWords(words);

         if( This.listExcludeWords.length > 0 ) {

            frequency_words = frequency_words.filter(function(item) {

               for( var i = 0; i < This.listExcludeWords.length; i++ ) {
                  if( item.name === This.listExcludeWords[i]) {
                     return false;
                  }
               }
               return true;
            });
         }

         // how many words we will use for phrase

         var len_words = frequency_words.length > This.howManyWordsForPhrase ?
            This.howManyWordsForPhrase : frequency_words.length;

         // ui

         var tbody = $('.content-panel table.word-table tbody');
         tbody.find('tr').remove(); // clean previous values

         for( var i = 0; i < len_words; i++ ) {
            var item = frequency_words[i];

            var tr_el =  "<tr>" +
               "<th>" + i + "</th>" +
               "<td>" + item.name  + "</td>" +
               "<td>" + item.count + "</td>" +
               "<td>" + item.freq  + "</td>" +
               "</tr>";

            var jq_tr = $(tr_el);

            tbody.append(jq_tr);
         }

         $('.content-panel .word-section .word-links-val').text("[" + frequency_words.length + "]");

         return callback( false, frequency_words );
      }
      catch(err) {
         console.log('htmlAnalysis.setDynamicContentInfo(): ' + err );
         return callback( true, null );
      }
   }

   // --------------------------------------------------------------- Local url

   function getPureLocalContent() {
      try {
         let pure_content = null;

         if(Object.keys(This.localPageData).length === 0 ) {   // returns 0 if empty or an integer > 0 if non-empty

            let raw = ctrlHtmlAnalysis.getHtmlContent();

            if( raw ) {
               raw = ctrlHtmlAnalysis.removeEditingCharacters(raw);

               if( raw ) {

                  let text = ctrlHtmlAnalysis.removeRussianPrepositions( raw.toLowerCase() );

                  if( text ) {

                     let words = ctrlHtmlAnalysis.cleanFromPunctuation(text);
                     text = words.join(' ');

                     if( text ) {

                        // remove additional 'blanks'
                        words = text.split(' ');
                        words = words.filter(function(item) { return item !== ''; });

                        // remove words less than 2 characters
                        words = words.filter(function(item) {
                           return item.length > 1;
                        });


                        pure_content = words.join(' ');

                        if(pure_content) {

                           This.localPageData.url  = This.activeUrl;
                           This.localPageData.text = pure_content;
                           This.localPageData.raw  = raw;
                        }
                     }
                  }
               }
            }
         }
         else {
            pure_content = This.localPageData.text;
         }

         return pure_content;
      }
      catch( err ) {
         console.log('ERROR(htmlAnalysis.getPureWordContentInfo()): ' + err );
         return null;
      }
   }

   function setLocalContentInfo(callback) {
      try {

         var pure_content = getPureLocalContent();
         if(!pure_content)
            return callback( true, null );

         var words = pure_content.split(" ");

         // list of words with frequency metadata

         var frequency_words = ctrlHtmlAnalysis.frequencyWords(words);

         if( This.listExcludeWords.length > 0 ) {

            frequency_words = frequency_words.filter(function(item) {

               for( var i = 0; i < This.listExcludeWords.length; i++ ) {
                  if( item.name === This.listExcludeWords[i]) {
                     return false;
                  }
               }
               return true;
            });
         }

         // how many words we will use for phrase

         var len_words = frequency_words.length > This.howManyWordsForPhrase ?
                         This.howManyWordsForPhrase : frequency_words.length;
         //This.listFrequencyWords = frequency_words.slice(0, len_words);

         // ui

         var tbody = $('.content-panel table.word-table tbody');
         tbody.find('tr').remove(); // clean previous values

         for( var i = 0; i < len_words; i++ ) {
            var item = frequency_words[i];

            var tr_el =  "<tr>" +
               "<th>" + i + "</th>" +
               "<td>" + item.name  + "</td>" +
               "<td>" + item.count + "</td>" +
               "<td>" + item.freq  + "</td>" +
               "</tr>";

            var jq_tr = $(tr_el);

            tbody.append(jq_tr);
         }

         $('.content-panel .word-section .word-links-val').text("[" + frequency_words.length + "]");

         return callback( false, frequency_words, pure_content );
      }
      catch( err ) {
         console.log('ERROR(htmlAnalysis.setLocalContentInfo()): ' + err );
         return callback( true, null );
      }
   }

   // --------------------------------------------------------------- Support functions

   /*
   function setPageValue( el_class, el_value ) {
      try {
         var el = '.ncl-page-item ' + el_class;
         var ttl = This.pageInfo.find(el);
         ttl.text(el_value);
      }
      catch(err) {
         console.log('htmAnalysis.setPageValue(): ' + err );
      }
   }
   */

   function showAnalysesContentPanel( show ) {
      try {

         var status = show ? 'block' : 'none';

         $('.tables-analysis-result').css('display', status);
         $('.analysis-tools-section').css('display', status);

      }
      catch(err) {
         console.log('htmAnalysis.showAnalysesContentPanel(): ' + err );
      }
   }

   function showAnalysesToolSection( show ) {
      try {

         var status = show ? 'block' : 'none';

         $('.analysis-panel .analysis-tools').css('display', status);
      }
      catch(err) {
         console.log('htmAnalysis.showAnalysesContentPanel(): ' + err );
      }
   }

   function checkWebPageData(url) {
      try {

         var res = null;

         if( This.webPageData.length < 1 ) {
            return res;
         }

         for (var prop in This.webPageData) {

            if(!This.webPageData.hasOwnProperty(prop))
               continue;

            var item = This.webPageData[prop];

            if(item.url === url) {
               res = item;
               break;
            }
         }

         return res;

         //var obj = { first: "John", last: "Doe" };
         //// Visit non-inherited enumerable keys
         //Object.keys(obj).forEach(function(key) {
         //   console.log(key, obj[key]);
         //});

         //for (var prop in obj) {
         //   // skip loop if the property is from prototype
         //   if(!obj.hasOwnProperty(prop)) continue;
         //   var text += obj[prop];
         //}

      }
      catch(err) {
         console.log('htmlAnalysis.checkWebPageData(): ' + err );
         return null;
      }
   }

   function setPageInfo() {
      try {
         //setPageValue('.document_title', document.title);

         //var ttl = This.pageInfo.find('.ncl-page-item .document_title');
         //ttl.text(document.title);
         //This.pageInfo.find('.ncl-page-item .document_title').text(document.title);

         // document.title
         This.pageInfoItem.find('.document_title').text(document.title);

         // document.location
         //This.pageInfoItem.find('.document_location').text(document.location);

         // document.lastModified
         This.pageInfoItem.find('.document_last_modified').text(document.lastModified);

         // all_html_tags
         var tags = window.document.getElementsByTagName('*');
         This.pageInfoItem.find('.all_html_tags').text(tags.length);

         // document.cookie
         This.pageInfoItem.find('.document_cookie')
            .text(document.cookie === "" ? "-" : document.cookie.split(" ").length);

         // document.doctype
         This.pageInfoItem.find('.document_doctype').text( !document.doctype ? '-' : document.doctype );

         // document.forms - how match ?
         This.pageInfoItem.find('.document_forms')
            .text(document.forms.length === 0 ? "-" : document.forms.length );

         // document.images - how match ?
         This.pageInfoItem.find('.document_images')
            .text(document.images.length === 0 ? "-" : document.images.length );

         // document.inputEncoding
         This.pageInfoItem.find('.document_input_encoding').text(document.inputEncoding);

         // document.links - how match ?
         This.pageInfoItem.find('.document_links')
            .text(document.links.length === 0 ? "-" : document.links.length );

         // document.scripts  - how match ?
         This.pageInfoItem.find('.document_scripts')
            .text(document.scripts .length === 0 ? "-" : document.scripts .length );

         // document.referrer - Returns the URL of the document that loaded the current document
         This.pageInfoItem.find('.document_referrer').text(document.referrer === '' ? '-' : document.referrer);

         // document.domain
         // document.embeds - Returns a collection of all <embed> elements the document

         // document.location
         var doc_loc = document.location;
         This.pageInfoItem.find('.doc_loc_host').text(doc_loc.host === '' ? '-' : doc_loc.host);
         This.pageInfoItem.find('.doc_loc_hostname').text(doc_loc.hostname === '' ? '-' : doc_loc.hostname);
         This.pageInfoItem.find('.doc_loc_href').text(doc_loc.href === '' ? '-' : doc_loc.href);
         This.pageInfoItem.find('.doc_loc_origin').text(doc_loc.origin === '' ? '-' : doc_loc.origin);
         This.pageInfoItem.find('.doc_loc_pathname').text(doc_loc.pathname === '' ? '-' : doc_loc.pathname);
         This.pageInfoItem.find('.doc_loc_port').text(doc_loc.port === '' ? '-' : doc_loc.port);
         This.pageInfoItem.find('.doc_loc_protocol').text(doc_loc.protocol === '' ? '-' : doc_loc.protocol);

      }
      catch(err) {
         console.log('htmAnalysis.setPageInfo(): ' + err );
      }
   }

   function setPhraseContentInfo( frequency_words, pure_content ) {
      // http://stackoverflow.com/questions/2966796/how-to-get-a-webpage-as-plain-text-without-any-html-using-javascript
      try {
         // only words without metadata

         var list_words = [];
         var freq_words = [];
         frequency_words.forEach(function(item) {
            //if( item.count > 1 ) {
            if( item.count > 2 ) {
               freq_words.push(item);
               list_words.push(item.name);
            }
         });

         // combination of this words

         list_words = list_words.slice(0, 6);   // no more than six and take if more than 2
         var combinations = ctrlHtmlAnalysis.shuffle(list_words);

         // phrases of this combination

         var list_phrases = ctrlHtmlAnalysis.phrasesFromWords(combinations);

         var frequency_phrases = ctrlHtmlAnalysis.frequencyPhrases(pure_content, list_phrases);
         frequency_phrases.sort(function(a,b){
            return b.frequency - a.frequency;
         });

         var phraseEl = $('.content-panel .tables-analysis-result .phrase-section');

         if( frequency_phrases.length > 0 ) {

            var len_phrases = frequency_phrases.length > 9 ? 9 : frequency_phrases.length;

            // ui

            var tbody = $('.content-panel table.phrase-table tbody');
            tbody.find('tr').remove(); // clean previous values

            for( var i = 0; i < len_phrases; i++ ) {

               var item = frequency_phrases[i];

               var tr_el =  "<tr>" +
                  "<th>" + i + "</th>" +
                  "<td>" + item.phrase  + "</td>" +
                  "<td>" + item.frequency  + "</td>" +
                  "</tr>";

               var jq_tr = $(tr_el);

               tbody.append(jq_tr);
            }

            phraseEl.css('display', 'block');
            phraseEl.find('.phrase-links-val').text("[" + frequency_phrases.length + "]");
         }
         else {
            phraseEl.css('display', 'none');
         }
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setPhraseContentInfo()): ' + err );
      }
   }

   function setTagsInfo() {
      try {

         var tbody = $('.tags-panel table tbody');
         tbody.find('tr').remove();

         var tag_objs = ctrlHtmlAnalysis.getHtmlTagsAndClasses();

         var tags     = ctrlHtmlAnalysis.getHtmlTags();
         tags         = ctrlHtmlAnalysis.frequencyWords(tags);

         for( var i = 0; i < tags.length; i++ ) {
            var item = tags[i];

            var tr_el =  "<tr>" +
               "<th>" + i + "</th>" +
               "<td>" + "&#60;&#47;" + item.name + "&#62;" + "</td>" +
               "<td>" + item.count + "</td>" +
               "<td>" + item.freq  + "</td>" +
               //"<td class='th-class'></td>"  +
            "</tr>";

            var jq_tr = $(tr_el);

            /*
            var index = ctrlHtmlAnalysis.hasElement(tag_objs,'tag',item.name);
            if( index > -1 ) {

               // add css-classes to grid

               var li_el = "";
               for( var l = 0; l < tag_objs[index].cls.length; l++ ) {
                  var cls = tag_objs[index].cls[l];
                  li_el += "<li class='th-cls-li'><span class='th-cls-item'>&#34;." + cls + "&#34;</span></li>";
               }

               if( li_el != '') {
                  var ul_el = "<ul class='th-cls-ul'>" + li_el + "</ul>";
                  var th_el = jq_tr.find('td.th-class');
                  th_el.append(ul_el);
               }
            }
            */

            tbody.append(jq_tr);

            $('.tags-panel .tags-section .tags-val').text("[" + tags.length + "]");
         }
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setTagsInfo()): ' + err );
      }
   }

   function setLinksInfo() {
      /* https://moz.com/researchtools/ose/ - инструмент анализа ссылок
       * https://css-tricks.com/snippets/javascript/get-url-and-url-parts-in-javascript/ - Get URL and URL Parts in JavaScript
       *
       *
       * What is Domain Authority?
       * Domain authority is a logarithmic score (ranging from 0-100) by Moz, which predicts how well a domain (web page) will rank in the search engine results.
       * http://www.bloggertipstricks.com/increase-domain-authority.html
       * http://www.seoreviewtools.com/what-is-domain-authority/
       * http://abhinavsingh.com/getting-google-page-rank-using-javascript-for-adobe-air-apps/ - Getting Google Page Rank
       *
       * http://www.similarweb.com/ !!!
       * http://nibbler.silktide.com/en_US - test sites
       *
       *
       *
       * */
      try {

         var doc_clone = document.cloneNode(true);
         var el = doc_clone.querySelector( '.th-node' );
         el.parentNode.removeChild( el );

         setHrefSection();

         setImgSection(doc_clone);

         setVideoSection(doc_clone);

         setScriptSection();

         setLinksSection();

         setIFrameSection();

      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setLinksInfo()): ' + err );
      }
   }

   function setHrefSection() {
      try {

         // clean

         var tbody = $('.links-panel table.href-table-links tbody');
         tbody.find('tr').remove();

         // data

         var html = $("html").clone();
         var no_js = $(html).find("script,noscript,style").remove().end();
         var node = $(no_js).find(".th-node").remove().end().html();
         var all_links = $(node).find("a");

         //var links = document.links; // body links
         //var arr = [].slice.call(links);
         var arr = [].slice.call(all_links);

         var links_obj = arr.map(function(item) {
            return {
               href:    $(item).attr("href"),
               type:    $(item).attr("type")    === undefined ? '-': $(item).attr("type"),
               name:    $(item).attr("name")    === undefined ? '-': $(item).attr("name"),
               target:  $(item).attr("target")  === undefined ? '-': $(item).attr("target"),
               title:   $(item).attr("title")   === undefined ? '-': $(item).attr("title"),
               text:    $(item).text()          === ''        ? '-': $(item).text()
            };
         });

         var show = links_obj.length === 0 ? 'none' : 'block';
         $('.links-panel .href-section').css('display',show);
         if( links_obj.length === 0 ) return;

         // ui

         for( var i = 0; i < links_obj.length; i++ ) {
            var link = links_obj[i];

            var tr_el =  "<tr>" +
               "<th>" + "<a href='"+ link.href + "' >" + link.href +"</a>"  + "</th>" +
               "<td>" + link.type   + "</td>" +
               "<td>" + link.name   + "</td>" +
               "<td>" + link.target + "</td>" +
               "<td>" + link.title  + "</td>" +
               "<td>" + link.text   + "</td>" +
               "</tr>";

            tbody.append(tr_el);
         }

         $('.links-panel .href-section .href-links-val').text("[" + links_obj.length + "]");
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setHrefSection()): ' + err );
      }
   }

   function setImgSection(doc_clone) {
      try {

         // clean

         var tbody = $('.links-panel table.img-table-links tbody');
         tbody.find('tr').remove();

         // data

         var imgs = doc_clone.getElementsByTagName("img");
         //var imgs = document.getElementsByTagName("img");
         var arr = [].slice.call(imgs);

         var imgs_obj = arr.map(function(item) {
            return {
               src:    $(item).attr("src"),
               height: $(item).attr("height") === undefined ? '-': $(item).attr("height"),
               width:  $(item).attr("width")  === undefined ? '-': $(item).attr("width"),
               ismap:  $(item).attr("ismap")  === undefined ? '-': $(item).attr("ismap"),
               alt:    $(item).attr("alt")    === undefined ? '-': $(item).attr("alt"),
               usemap: $(item).attr("usemap") === undefined ? '-': $(item).attr("usemap"),
               text:   $(item).text()         === ''        ? '-': $(item).text()
            };
         });

         var show = imgs_obj.length === 0 ? 'none' : 'block';
         $('.links-panel .img-section').css('display',show);
         if( imgs_obj.length === 0 ) return;

         // ui

         for( var i = 0; i < imgs_obj.length; i++ ) {
            var item = imgs_obj[i];

            var tr_el =  "<tr>" +
               "<th>" + "<a href='" + item.src + "' >" + item.src +"</a>"  + "</th>" +
               "<td>" + item.height + "</td>" +
               "<td>" + item.width  + "</td>" +
               "<td>" + item.ismap  + "</td>" +
               "<td>" + item.alt    + "</td>" +
               "<td>" + item.usemap + "</td>" +
               "</tr>";

            tbody.append(tr_el);
         }

         $('.links-panel .img-section .image-links-val').text("[" + imgs_obj.length + "]");
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setImgSection()): ' + err );
      }
   }

   function setVideoSection(doc_clone) {
      try {

         // clean

         var tbody = $('.links-panel table.video-table-links tbody');
         tbody.find('tr').remove();

         // data

         var videos = doc_clone.getElementsByTagName("video");
         //var videos = document.getElementsByTagName("video");
         var arr = [].slice.call(videos);

         var videos_obj = [];
         for( var l = 0; l < arr.length; l++ ) {
            var item = arr[l];

            var type = '-';
            var src = $(item).attr("src");

            if( src === undefined ) {

               var sources = $(item).find('source');

               if( sources != undefined ) {

                  var list = [].slice.call(sources);

                  //var s = '';
                  //list.forEach(function(current, i, arr) {
                  ////for( var t = 0; t < list.length; t++ ) {
                  //   //var current = list[t];
                  //   var v = $(current).attr("src") === undefined ? '-': $(current).attr("src");
                  //   s += s === '' ? v: ', ' + v;
                  //});

                  src = list.reduce(function(sum, current ) {
                     var v = $(current).attr("src") === undefined ? '-': $(current).attr("src");
                     return sum += sum === '' ? v: ', ' + v;
                     //return sum + sum === '' ? v: ', ' + v;
                  }, '');

                  type = list.reduce(function(sum, current ) {
                     var v = $(current).attr("type") === undefined ? '-': $(current).attr("type");
                     return sum += sum === '' ? v: ', ' + v;
                     //return sum + sum === '' ? v: ', ' + v;
                  }, '');
               }
            }

            var obj = {
               src:     src,
               type:    type,
               height:  $(item).attr("height")  === undefined ? '-': $(item).attr("height"),
               width:   $(item).attr("width")   === undefined ? '-': $(item).attr("width"),
               poster:  $(item).attr("poster")  === undefined ? '-': $(item).attr("poster"),
               preload: $(item).attr("preload") === undefined ? '-': $(item).attr("preload"),
               text:    $(item).text()          === ''        ? '-': $(item).text()
            };

            videos_obj.push(obj)
         }

         var show = videos_obj.length === 0 ? 'none' : 'block';
         $('.links-panel .video-section').css('display',show);
         if( videos_obj.length === 0 ) return;

         // ui

         for( var i = 0; i < videos_obj.length; i++ ) {
            item = videos_obj[i];

            var tr_el =  "<tr>" +
               "<th>" + "<a href='"  + item.src + "' >" + item.src +"</a>"  + "</th>" +
               "<td>" + item.type    + "</td>" +
               "<td>" + item.height  + "</td>" +
               "<td>" + item.width   + "</td>" +
               "<td>" + item.poster  + "</td>" +
               "<td>" + item.preload + "</td>" +
               "</tr>";

            tbody.append(tr_el);
         }

         $('.links-panel .video-section .video-links-val').text("[" + videos_obj.length + "]");
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setVideoSection()): ' + err );
      }
   }

   function setScriptSection() {
      try {
         var tbody = $('.links-panel table.script-table-links tbody');
         tbody.find('tr').remove();

         var scripts = document.getElementsByTagName("script");
         var arr = [].slice.call(scripts);

         var scripts_obj = arr.map(function(item) {
            return {
               src:     $(item).attr("src")     === undefined ? '-': $(item).attr("src"),
               type:    $(item).attr("type")    === undefined ? '-': $(item).attr("type"),
               async:   $(item).attr("async")   === undefined ? '-': $(item).attr("async"),
               charset: $(item).attr("charset") === undefined ? '-': $(item).attr("charset"),
               defer:   $(item).attr("defer")   === undefined ? '-': $(item).attr("defer")
            };
         });

         var show = scripts_obj.length === 0 ? 'none' : 'block';
         $('.links-panel .script-section').css('display',show);
         if( scripts_obj.length === 0 ) return;

         for( var i = 0; i < scripts_obj.length; i++ ) {
            var item = scripts_obj[i];

            var script_link = item.src === '-' ?
                              "<td>" + 'inline-script' + "</td>" :
                              "<th>" + "<a href='"  + item.src + "' >" + item.src +"</a>"  + "</th>";

            var tr_el =  "<tr>" +
               script_link +
               "<td>" + item.type    + "</td>" +
               "<td>" + item.async   + "</td>" +
               "<td>" + item.charset + "</td>" +
               "<td>" + item.defer   + "</td>" +
               "</tr>";

            tbody.append(tr_el);
         }

         $('.links-panel .script-section .script-links-val').text("[" + scripts_obj.length + "]");
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setScriptSection()): ' + err );
      }
   }

   function setLinksSection() {
      try {
         var tbody = $('.links-panel table.link-table-links tbody');
         tbody.find('tr').remove();

         var links = document.getElementsByTagName("link");
         var arr = [].slice.call(links);

         var links_obj = arr.map(function(item) {
            return {
               href:        $(item).attr("href")        === undefined ? '-': $(item).attr("href"),
               type:        $(item).attr("type")        === undefined ? '-': $(item).attr("type"),
               media:       $(item).attr("media")       === undefined ? '-': $(item).attr("media"),
               rel:         $(item).attr("rel")         === undefined ? '-': $(item).attr("rel"),
               crossorigin: $(item).attr("crossorigin") === undefined ? '-': $(item).attr("crossorigin")
            };
         });

         var show = links_obj.length === 0 ? 'none' : 'block';
         $('.links-panel .link-section').css('display',show);
         if( links_obj.length === 0 ) return;

         for( var i = 0; i < links_obj.length; i++ ) {
            var item = links_obj[i];

            var tr_el =  "<tr>" +
               "<th>" + i + "</th>" +
               "<td>" + "<a href='"  + item.href + "' >" + item.href +"</a>"  + "</td>" +
               "<td>" + item.type        + "</td>" +
               "<td>" + item.media       + "</td>" +
               "<td>" + item.rel         + "</td>" +
               "<td>" + item.crossorigin + "</td>" +
               "</tr>";

            tbody.append(tr_el);
         }

         $('.links-panel .link-section .link-links-val').text("[" + links_obj.length + "]");
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setLinksSection()): ' + err );
      }
   }

   function setIFrameSection() {
      try {
         var tbody = $('.links-panel table.iframe-table-links tbody');
         tbody.find('tr').remove();

         var iframes = document.getElementsByTagName("iframe");
         var arr = [].slice.call(iframes);

         var iframes_obj = arr.map(function(item) {
            return {
               src:     $(item).attr("src")     === undefined ? '-': $(item).attr("src"),
               width:   $(item).attr("width")   === undefined ? '-': $(item).attr("width"),
               height:  $(item).attr("height")  === undefined ? '-': $(item).attr("height"),
               name:    $(item).attr("name")    === undefined ? '-': $(item).attr("name"),
               sandbox: $(item).attr("sandbox") === undefined ? '-': $(item).attr("sandbox")
            };
         });

         var show = iframes_obj.length === 0 ? 'none' : 'block';
         $('.links-panel .iframe-section').css('display',show);
         if( iframes_obj.length === 0 ) return;

         for( var i = 0; i < iframes_obj.length; i++ ) {
            var item = iframes_obj[i];

            var tr_el =  "<tr>" +
               "<th>" + i + "</th>" +
               "<td>" + "<a href='"  + item.src + "' >" + item.src +"</a>"  + "</td>" +
               "<td>" + item.width   + "</td>" +
               "<td>" + item.height  + "</td>" +
               "<td>" + item.name    + "</td>" +
               "<td>" + item.sandbox + "</td>" +
               "</tr>";

            tbody.append(tr_el);
         }

         $('.links-panel .iframe-section .iframe-links-val').text("[" + iframes_obj.length + "]");
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setIFrameSection()): ' + err );
      }
   }

   function cleanDataSection() {
      try {
         if(This.activePanel === ' .links-panel' ) {

            var tbody = $('.links-panel table.href-table-links tbody');
            tbody.find('tr').remove();

            tbody = $('.links-panel table.img-table-links tbody');
            tbody.find('tr').remove();

            tbody = $('.links-panel table.video-table-links tbody');
            tbody.find('tr').remove();

            tbody = $('.links-panel table.script-table-links tbody');
            tbody.find('tr').remove();

            tbody = $('.links-panel table.link-table-links tbody');
            tbody.find('tr').remove();

            tbody = $('.links-panel table.iframe-table-links tbody');
            tbody.find('tr').remove();
         }
      }
      catch(err) {
         console.log('htmAnalysis.cleanDataSection(): ' + err );
      }
   }

   function showAnalysisPanel(show) {
      try {
         if( show ) {
            This.mainPanel.addClass('invisible-item');                              // hide main panel
            $( This.cssClassHub + This.activePanel ).removeClass('invisible-item'); // show current panel
            This.toolBarStandard.removeClass('invisible-item');                     // show home-button
            This.toolBarAnalys.addClass('invisible-item');                          // hide analyses-button
         }
         else {
            $( This.cssClassHub + This.activePanel ).addClass('invisible-item');
            This.mainPanel.removeClass('invisible-item');
            This.toolBarAnalys.removeClass('invisible-item');
            This.toolBarStandard.addClass('invisible-item');
         }
      }
      catch(err) {
         console.log('htmAnalysis.showAnalysisPanel(): ' + err );
      }
   }

   function changeHubTitle( _title, _subtitle ) {
      try {
         This.hubTitleElm.text(_title);
         This.subTitleElm.text(_subtitle);
      }
      catch(err) {
         console.log('ERROR(htmAnalysis.changeHubTitle()): ' + err );
      }
   }

   function setUIEvents() {
      try {

         //let hello = name => {
         //   alert('Hello, ' + name);
         //}; hello('New user');

         This.toolBarItem.click(onAnalysisMainMenu_Click);

         $('#btn-run-exclude-words').click(onExcludeWords_Click);
         $("#th-input-exclude-words").keyup( e => { if(e.keyCode == 13) { onExcludeWords_Click(e); }});

         $('#btn-dynamic-url-analysis').click(onUrlDynamic_Click);
         $('#th-input-dynamic-url').keyup( e => { if(e.keyCode == 13) { onUrlDynamic_Click(e); }});

         $('#btn-run-analysis-words').click(onEntryWordsAnalysis_Click);
         $('#th-input-analysis-words').keyup( e => { if(e.keyCode == 13) { onEntryWordsAnalysis_Click(e); }});

         $(document).on("click", ".analysis-content-menu ul li span", onShowAnalysisContent_Click );

         $(document).on("click", "#btn-close-clean-text-section", onCloseCleanContentText_Click );

         $(document).on("click", "#btn-close-raw-text-section", onCloseRawContentText_Click );

         $(document).on("click", ".analysis-panel .tools-expander .btn-expander", onBtnExpanderTools_Click );

         /*
         This.panelBtn.click(onUserAction_Click);

         This.panelBtn.mouseenter(function(e) {
            var tooltip = e.target.getAttribute('data-tip');
            This.showToolTip( tooltip, true );
         });

         This.panelBtn.mouseleave(function() {
            This.showToolTip( This, '', false );
         });
         */
      }
      catch( err ) {
         console.log('ERROR(htmAnalysis.setUIEvents()): ' + err );
      }
   }

   return htmAnalysis;

})(thJQ);

th.next.AnalysisLabDialog = (function($) {
   var This,
      _public = AnalysisLabDialog.prototype;

   function AnalysisLabDialog() {
      This = this;

      this.rssAgentTemplate   = null;
      this.dlgShown = false;
      this.parentWnd = null;

      this.Initialize();
   }

   _public.Initialize = function() {
      try {

         This.dialogCtrl = $('#th-dlg-template-show-lab');

         //This.dialogCtrl = $('#rss-agent-dlg');
         //
         //This.listAgentsPanel = $("#rss-agent-dlg .agent-rss-panel .list-agents-panel");
         //
         //This.listAgentsCtrl = $("#list-agents-ctrl");
         //
         //This.btAgentExpander = $('#new-agent-expander');
         //
         //This.dlgProgressBar = $('#rss-agent-dlg .th-dlg-progress-bar');
         //
         //This.uiBlockerPanel = $('#th-ui-blocker-panel');

         setUIEvents();

         //$( "#list-agents-expander" ).click(function() {
         //   return;
         //});

         //onExpanderAction( $( "#list-agents-expander" )[0] );  // close 'ist-agents-expander'
      }
      catch(err) {
         console.log('ERROR(SearchAgentsDialog.Initialize())' + err );
      }
   };

   _public.OpenDlg = function(parentHub) {
      try {

         This.parentHub = parentHub;

         //showParentHub(false);

         // next time show dialog.

         if(!This.dlgShown) {
            This.dialogCtrl.removeClass('invisible-item');
            This.dlgShown = true;
            return;  // not first time
         }
         //
         //// first time show dialog.
         //
         //This.dlgShown = true;
         //
         //This.dialogCtrl.removeClass('invisible-item');   // show dialog
      }
      catch(err) {
         console.log('SearchAgentsDialog.OpenDlg(): ' + err );
      }
   };

   function onCloseDld_Click(e) {
      try {
         e.preventDefault();

         if( !This.dialogCtrl.hasClass('invisible-item')) {

            This.dialogCtrl.addClass('invisible-item');

            This.dlgShown = false;

            //showParentHub(true);
            //
            //if( This.changeAgent ) {
            //   This.changeAgent = false;
            //   This.parentWnd.readSearchAgents();
            //}
         }

         return false;
      }
      catch(err) {
         console.log('SearchAgentsDialog.onCloseDld_Click(): ' + err );
         return false;
      }
   }

   // --------------------------------------------------------------- Support functions

   function setUIEvents() {
      try {
         $(document).on("click", "#close-analysis-lab-dlg", onCloseDld_Click );
      }
      catch(err) {
         console.log('SearchAgentsDialog.setUIEvents(): ' + err );
      }
   }

   return AnalysisLabDialog;

})(thJQ);

th.next.htmAnalysisController = (function($) {
   var This
      ,_public = htmAnalysisController.prototype;

   function htmAnalysisController() {
      This = this;
      this.Initialize();
   }

   _public.Initialize = function() {};

   _public.getPureTextPerUrl = function( url, callback ) {
      try {

         var req = 'get-text-per-url';

         var request = {
            url: url
         };

         var ajaxData = JSON.stringify(request);

         ajaxCall( pathServer + req, req + '=' + ajaxData,
            function( data, textStatus, jqXHR ) {
               var parser = JSON.parse(data);
               //var status = JSON.parse(jqXHR.responseJSON);

               return callback( parser.err, data );
            },
            function( jqXHR, textStatus, errorThrown ) {
               return callback( true, null );
            });
      }
      catch(err) {
         console.log('ERROR(AnalysisController.getHtmlTagsAndClasses())' + err );
      }
   };

   _public.hasElement = function (array, property, element ) {
      for (var i = 0; i < array.length; i++) {
         if (array[i][property] === element) {
            return i;
         }
      }
      return -1;
   };

   _public.getHtmlTagsAndClasses = function() {
      try {

         var tags = window.document.getElementsByTagName('*');

         var tag_objs = [];

         for( var i = 0; i < tags.length; i++ ) {
            var tag = tags[i];
            var classes = $(tag).attr('class');
            var tag_name = tag.tagName.toLowerCase();

            var index = This.hasElement(tag_objs,'tag',tag_name);

            if(index === -1 ) {
               tag_objs.push({
                  tag: tag_name,
                  cls: classes ? [].slice.call(tag.classList) : []
               });
            }
            else {
               if( classes ) {
                  var item = tag_objs[index];
                  var new_cls = classes.split(" ");

                  for( var j = 0; j < new_cls.length; j++ ) {
                     var exist = item.cls.indexOf(new_cls[j]);
                     if(exist === -1 ) {
                        item.cls.push(new_cls[j]);
                     }
                  }
               }
            }
         }

         return tag_objs;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.getHtmlTagsAndClasses())' + err );
      }
   };

   _public.getHtmlTags = function() {
      /*
      http://stackoverflow.com/questions/3184284/count-all-html-tags-in-page-php
      http://stackoverflow.com/questions/222841/most-efficient-way-to-convert-an-htmlcollection-to-an-array
      */
      try {

         var tags = window.document.getElementsByTagName('*');
         var arr = [].slice.call(tags);

         tags = arr.map( function(item ) {
            return item.tagName.toLowerCase();
         });

         return tags;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.getHtmlTags())' + err );
      }
   };

   _public.getAllHtmlLinks = function() {
      /*
       * example: http://stackoverflow.com/questions/3184284/count-all-html-tags-in-page-php
       *  <a href='???' />
       *  all javascript files src
       *  all css styles file  src
       *  title value
       *  <link rel="stylesheet" type="text/css" href="//cdn.sstatic.net/stackoverflow/all.css?v=7d81de239a5b">
       *  <link rel="shortcut icon" href="//cdn.sstatic.net/stackoverflow/img/favicon.ico?v=4f32ecc8f43d">
       *  <meta property="og:url" content="http://stackoverflow.com/questions/3184284/count-all-html-tags-in-page-php">
       *  <script async="" src="http://edge.quantserve.com/quant.js"></script>
       *  <a href="//stackoverflow.com">current community</a>
       */
      //try {
      //}
      //catch(err) {
      //   console.log('ERROR(AnalysisController.getAllHtmlLinks())' + err );
      //}
   };

   _public.getHtmlContent = function() {
      try {
         //var txt = $("html")
         //   .clone()
         //   .find("script,noscript,style").remove().end()
         //   .find(".th-node").remove().end()
         //   .html()
         //   .text();

         //var s = '<div><h1>heading</h1><p>para</p></div>';
         //var $s = $(s).find('h1').remove().end();
         //$('body').append($s);
         //$('body').append($s);

         var html = $("html").clone();
         var no_js = $(html).find("script,noscript,style").remove().end();
         var node = $(no_js).find(".th-node").remove().end().html();
         var txt = $(node).text();

         return txt;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.getHtmlContent())' + err );
      }
   };

   _public.cleanFromPunctuation = function(html_content) {
      try {

         var text = html_content.toLowerCase().trim();
         var words = text.split(' ');

         var delCharacters = [
            '[', '.', ',', '-', '\\', '/', ':', '{', '}', ']', '?', '–',
            '#', '@', '+', '!', '$',  '%', '^', '&', '*', ';', '«', '»',
            '-', '_', '—', '`', '"', '\'', '~', '(', ')',  '|', '→', '↓', '↑'
         ];

         // remove all words with length=1 equal to delCharacters,
         // example: 'this - one of', will remove '-' and we get: 'this one of'
         // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some

         words = words.filter(function(item) {

            //var ret = delCharacters.some(function(del) {
            //   return item === del;
            //});
            //
            //return !ret;

            return !delCharacters.some(function(del) {
               return item === del;
            });

         });

         words = words.map(function(item) {

            var characters = item.split('');

            var clean_list = characters.map( function( part ){
               for( var i = 0; i < delCharacters.length; i++ ) {
                  if( part === delCharacters[i]) {
                     return ' ';
                  }
               }
               return part;
            });

            return clean_list.join('').trim();
         });

         words = words.filter(function(item) { return item !== ''; });

         return words;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.cleanFromPunctuation())' + err );
      }
   };

   _public.removeHtmlSection = function( window_document, success_call, error_call ) {
      // http://stackoverflow.com/questions/6659351/removing-all-script-tags-from-html-with-js-regular-expression
      // remove <script/> section
      // http://stackoverflow.com/questions/8503560/how-do-i-use-jquery-to-remove-all-script-tags-in-a-string-of-html
      try {
         var script = $(window_document).find('script').remove();
         //var noscript = $(window.document).find('script').remove();
         // var wholeHtmlDocument = document.documentElement.outerHTML;
         //$(document.documentElement.outerHTML).text();

         // http://chase-seibert.github.io/blog/2012/02/03/jquery-remove-script-tags-from-a-string-of-html.html
         // var page_content = $("html").clone().find("script,noscript,style").remove().end().html();
      }
      catch(err) {
         console.log('ERROR(AnalysisController.removeHtmlSection())' + err );
      }
   };

   _public.frequencyWords = function(list) {
      try {
         var frequency = {};
         var list_len = list.length;

         for(var i = 0; i < list_len; i++) {
            var value = list[i];
            frequency[value] = value in frequency ? ++frequency[value] : 1;
         }

         var uniques = [];
         for(value in frequency) {
            var freq = frequency[value];
            var item = {
               name: value
               ,count: freq
               ,freq: (100 * freq / list_len).toFixed(1)
            };

            uniques.push(item);
         }

         uniques.sort(function(a,b){
            return b.freq - a.freq;
         });

         return uniques;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.frequencyWords())' + err );
      }
   };

   _public.removeEditingCharacters = function(text) {
      try {
         text = text.replace(/(\r\n|\n|\r)/g, ' ');
         text = text.replace(/\s+/g, ' ');
         text = text.trim();

         return text;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.removeEditingCharacters())');
         return null;
      }
   };

   _public.removeRussianPrepositions = function ( text ) {
      try {

         var words = text.split(' ');

         var del_words = [
            'их', 'если', 'только', 'даже', 'всё',

            'а', 'я', 'он', 'это', 'про', 'его', 'ибо', 'как', 'то', 'уже',
            'и','с','в','не','что','этот', 'том','но','во','для','нас',
            'мы','до','за','из','изо', 'к','ко','меж','на','над','о',
            'об','от','по','у','со','т.е', 'ли','или','т.д.', 'ни', 'т.е.',
            'в', 'так', 'тех', 'пор', 'там', 'чем', 'тоже', 'же', 'этой'
         ];

         var clean_list = words.filter(function(item) {
            //for( var i = 0; i < del_words.length; i++ ) {
            //   if( item === del_words[i]) {
            //      return false;
            //   }
            //}
            //return true;
            return !del_words.some(function(del) {
               return item === del;
            });
         });

         var res = clean_list.join(' ');

         return res;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.removePrepositions())');
         return null;
      }
   };

   _public.shuffle = function (list) {
      /**
       * http://stackoverflow.com/questions/18681165/shuffle-an-array-as-many-as-possible
       * http://jsfiddle.net/wCnLf/
       */
      try {
         var shufflings = [];
         while(true) {
            var clone = list.slice();
            var shuffling = [];
            var period = 1;
            while(clone.length) {
               var index = Math.floor(shufflings.length / period) % clone.length;
               period *= clone.length;
               shuffling.push(clone.splice(index,1)[0]);
            }
            shufflings.push(shuffling);
            if(shufflings.length == period)
               return shufflings;
         }
      }
      catch(err) {
         console.log('ERROR(AnalysisController.shuffle())');
         return null;
      }
   };

   _public.phrasesFromWords = function(combinations) {
      try {

         var list_phrases = [];

         for (var n = 0; n < combinations.length; n++) {

            var combination = combinations[n];
            var phrases = createPhrase(combination);

            for (var i = 0; i < phrases.length; i++) {

               var phrase = phrases[i];

               if (list_phrases.indexOf(phrase) < 0) {
                  list_phrases.push(phrase);
               }
            }
         }

         return list_phrases;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.phrasesFromWords())');
         return null;
      }
   };

   _public.frequencyPhrases = function(text, list_phrases) {
      try {
         var frequency_phrases = [];

         for( var i = 0; i < list_phrases.length; i++ ) {

            var phrase = list_phrases[i];
            var index  = text.indexOf(phrase);
            var count  = 0;

            while( index > -1 ) {
               count++;
               index  = text.indexOf(phrase, index + 1);
            }

            if(count > 0) {

               var item = {
                  phrase: phrase,
                  frequency: count
               };

               frequency_phrases.push(item);
            }
         }

         return frequency_phrases;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.frequencyPhrases())');
         return null;
      }
   };

   // --------------------------------------------------------------- Support functions

   function createPhrase( array ) {
      try {

         var phrases = [];

         for (var j = 0; j < array.length; j++) {
            var main_item = array[j];
            var current = main_item;

            for (var l = 0; l < array.length; l++) {
               var item = array[l];

               if (current != item) {
                  main_item += ' ' + item;
                  phrases.push(main_item);
               }
            }
         }
         return phrases;
      }
      catch(err) {
         console.log('ERROR(AnalysisController.createPhrase())');
         return null;
      }
   }

   return htmAnalysisController;

})(thJQ);


//_public.onLinksAnalysis = function() {
//   try {
//
//      This.activePanel = ' .links-panel';
//
//      This.hub.css('width', '690px');
//
//      showAnalysisPanel(true);
//
//      setLinksInfo();
//
//      changeHubTitle( "Links on Page", "href, images, video, iframe, css, links" );
//   }
//   catch(err) {
//      console.log('htmAnalysis.onLinksAnalysis(): ' + err );
//   }
//};

/*
 //words = words.filter(function(item){ return item.replace(/[.,-\/#@+!$%\^&\*;«»:{}=\-_—`"'~()(\r\n|\n|\r)]/gm," ")});
 //words = words.filter(function(item){ return item.replace(/(\r\n|\n|\r)/gm,"")});
 //words = words.filter(function(item){ return item.replace(/[.,-\/#@+!$%\^&\*;:{}=\-_`'~()]/gm,"")});

 var removeCharacters = /[.,-\/#@+!$%\^&\*;«»:{}=\-_—`"'~()(\r\n|\n|\r)]/gm;
 words = words.map(function(item) {
 var characters = item.split('');
 var clean = characters.filter(function(item){ return item.replace(removeCharacters," ")});
 return clean.join('');
 });
 */

// get only text without tags, remove blanks
//var text = $(html_content).text().toLowerCase().trim();


//_public.cleanFromPunctuation = function ( text ) {
//   try {
//      var punctuationless = text.replace(/[.,-\/#@+!$%\^&\*;:{}=\-_`'~()]/g,"");
//
//      return punctuationless;
//   }
//   catch(err) {
//      console.log('ERROR(AnalysisController.removePrepositions())');
//      return null;
//   }
//}

//var items = tmp_items.filter(function(item){ return item.replace(/[.,-\/#@+!$%\^&\*;:{}=\-_`'~()(\r\n|\n|\r)]/gm,"")});
//var res = tmp_text.replace(/ и | с | в | не | что | этот | том | но | во | для | нас | мы | до | за | из | изо | к | ко | меж | на | над | о | об | от | по | у | со | т.е. | ли | или | т.д. | /g, ' ');




