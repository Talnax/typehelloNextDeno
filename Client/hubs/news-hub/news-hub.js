/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2015
 * product: NullChannel ( TypeHello )
 * file:    news-hub.js
 */

var item_db =
{
   //"_id" : ObjectId("5638594d41215a2505e63eee"),
   "owner" : "2247-261-104-1585-35782953638",
   "agent" : {
      "id" : "4376-3076-3710-2624-109813903702",
      "type" : "web",
      "activity" : true,
      "date" : "11-9-2015",
      "language" : "ru_ru",
      "searchFor" : "солнце",
      "isResultExist" : true,
      "searchExclude" : ""
   }
}

var th  = th || {};
th.next = th.next || {};

th.next.NewsHub = (function($) {
   var This,
       _public = NewsHub.prototype;

   function NewsHub() {
      This = this;
      this.cssClassHub = '.news-hub';

      this.hubStatus    = statusHub.not_active;
      this.userPerClick = null;

      this.searchResults = [];
      this.collapseCss   = false;
      this.newsChanged   = false;

      this.posFormatting = null;

      this.feedbackClass = ".news-hub-dlg-feedback";
      this.settingsClass = ".news-hub-dlg-settings";

      // new code

      this.commonHub = new th.next.CommonHub( this );

      This.listViewCtrl = $("#result-list-view-ctrl");

      //this.rssResultLinks = [];

      this.Initialize();
   }

   // --------------------------------------------------------------- Public functions

   _public.Initialize = function() {
      try {
         if( !isDefine( ctrlNews )) {
            ctrlNews  = new th.next.NewsController();
         }

         This.commonHub.removeMainMenuItem( This, 'news');

         this.initHub();

         This.commonHub.setHubPosition( This );

         This.hubStatus = statusHub.initialized;

         setTimeout(function() {
            This.readSearchAgents();
         }, 600);

         //rePositionHub();

         setUIEvents();
      }
      catch(err) {
         console.log('ERROR(NewsHub.Initialize())' + err );
      }
   };

   _public.readSearchAgents = function() {
      try {

         var user = getUser();

         if(!isDefine( user ))
            return;

         // re-init

         $("#result-list-view-ctrl li").remove();

         ctrlNews.listAgents = [];
         ctrlNews.listResultsPerAgent = [];
         //This.rssResultLinks = [];

         This.showProgressBar( true );

         ctrlNews.getAgents( getUser(), function(result) {

            This.showProgressBar( false );

            if( !isDefine(ctrlNews.listAgents))
               return;

            if( ctrlNews.listAgents.length === 0 )
               return;

            // Loop: result all rss-search-agents

            var indexer = 0;

            for( var i = 0; i < ctrlNews.listAgents.length; i++ ) {

               var agent = ctrlNews.listAgents[i];

               var agentNode = addAgentNode(agent, indexer++);

               if (!isDefine(agentNode)) {
                  continue;
               }
               else {

                  if( agent.hasOwnProperty('resultsAll')) {
                     agentNode.btnExpander[0].innerHTML = "+";
                     agentNode.ulResults.css("display", 'none');
                  }
                  else {
                     agentNode.btnExpander.css("display", 'none');
                     agentNode.ulResults.css("display", 'none');
                  }
               }
            }
         });
      }
      catch(err) {
         console.log('ERROR(NewsHub.readSearchAgents())' + err );
      }
   };

   _public.refreshUI = function( listNewss ) {
      try {
         $("#result-list-view-ctrl li").remove();

         for( var i = listNewss.length; i >= 0; i--) {
            bindDataTemplateValues(i, listNewss[i]);
         }
      }
      catch(err) {
         console.log('ERROR(NewsHub.refreshUI())' + err );
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

   // http://stackoverflow.com/questions/17077777/jquery-press-button-as-enter-on-a-text-field
   function onNewsMainMenu_Click( event ) {
      try {
         event.preventDefault();

         var el  = event.target;
         var fun = el.getAttribute( 'data-action' );
         var arg = '.' + el.getAttribute( 'data-template-dlg' );

         if( typeof This[fun] === 'function' ) {
            This[fun]();
         }

         return false;
      }
      catch(err) {
         console.log('ERROR(NewsHub.onNewsMainMenu_Click()): ' + err );
         return false;
      }
   }

   function onBtnExpander_Click(event) {
      try {
         var el = event.target;

         var showPanel  = el.innerHTML === "-" ? "none" : "block";
         var btnContent = el.innerHTML === "-" ? "+" : "-";

         var ulExpand = $(this).parent().find('ul.list-results-per-agent');

         if( btnContent === '-') {

            // is result belong to this agent already exist in 'listResultsPerAgent'

            var list = getAgentResultsFromController(ulExpand[0].id);

            if( !isDefine(list)) {

               var agent = {
                  id: ulExpand[0].id,
                  searchFor: ulExpand[0].getAttribute('data-search'),
                  searchExclude: ulExpand[0].getAttribute('data-exclude')
               };

               setTimeout(
                  function(_agent) {
                     showResultsForAgent(_agent);
                  }, 0, agent );
            }
            else {
               el.innerHTML = btnContent;
               $(ulExpand).css("display", showPanel);
            }
         }
         else {
            el.innerHTML = btnContent;
            $(ulExpand).css("display", showPanel);
         }
      }
      catch(err) {
         console.log('ERROR[NewsHub.onBtnExpander_Click()]: ' + err );
      }
   }

   // --------------------------------------------------------------- Search-Agents-Dlg

   _public.openSearchAgentsDld = function() {
      try {

         if( !isDefine( This.dlgSearchAgent )) {
            This.dlgSearchAgent  = new th.next.SearchAgentsDialog();
            This.dlgSearchAgent.parentWnd = This;
         }

         This.dlgSearchAgent.OpenDlg(This.cssClassHub, This.cssClassHub + ' .news-list');
      }
      catch(err) {
         console.log('ERROR[NewsHub.openSearchAgentsDld()]: ' + err );
      }
   };

   function noRepeatData(results) {
      try {

         var index;
         var noRepeatList = [];

         var noRepeatUrl = [];
         for (var i = 0; i < results.length; i++) {
            var url = decodeURIComponent(results[i].url);
            if(( index = noRepeatUrl.indexOf(url)) === -1 ) {
               noRepeatUrl.push(url);
            }
         }

         var noRepeatTitle = [];
         for (var i = 0; i < results.length; i++) {
            var ttl = decodeURIComponent(results[i].title);
            if(( index = noRepeatTitle.indexOf(ttl)) === -1 ) {
               noRepeatTitle.push(ttl);
            }
         }

         var noRepeat = noRepeatTitle.length < noRepeatUrl.length?
                        'noRepeatTitle' : 'noRepeatUrl';

         if(noRepeat === 'noRepeatUrl') {
            for (var k = 0; k < noRepeatUrl.length; k++) {
               for (var l = 0; l < results.length; l++) {
                  if(noRepeatUrl[k] === decodeURIComponent(results[l].url)) {
                     noRepeatList.push(results[l]);
                     break;
                  }
               }
            }
         }
         else {
            for (var k = 0; k < noRepeatTitle.length; k++) {
               for (var l = 0; l < results.length; l++) {
                  if(noRepeatTitle[k] === decodeURIComponent(results[l].title)) {
                     noRepeatList.push(results[l]);
                     break;
                  }
               }
            }
         }

         return noRepeatList;
      }
      catch(err) {
         console.log('ERROR[NewsHub.noRepeatData()]: ' + err );
      }
   }

   // --------------------------------------------------------------- Support functions

   function showResultsForAgent( agent ) {
      try {

         // block UI until data not received

         This.showProgressBar( true );
         $('.block-panel').css("display", 'block');

         ctrlNews.getAgentResults(agent, function( err, results ) {

            if( !err && isDefine(results)) {

               results = noRepeatData(results);

               var ulExpand = $( '#' + agent.id );

               var isShown = false;

               for (var j = 0; j < results.length; j++) {

                  var item = results[j];

                  var _maxTitle = 90;
                  var title = decodeURIComponent(item.title);
                  title = title.length > _maxTitle ? title.slice(0, _maxTitle) + '...' : title;

                  var url = decodeURIComponent(item.url);



                  if (item.url.length > 0) {

                     isShown = true; // at least one link of results can be show to user with normal content

                     var d = new Date(item.date);
                     var date = d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear();
                     var dElm = '<span class="date-value">' + date + '</span>';
                     var href = '<a href="' + url + '">' + title + '</a>';

                     var tag = '<li class="rss-agent-link" data-ref-id="' + item.ref + '">'
                        + ' - '
                        + href
                        + dElm
                        + '</li>';

                     var li = ulExpand.append(tag);

                     //This.rssResultLinks.push(item);
                  }
                  else {
                     console.log('NewsHub(Loop: content per agent: title + rssLink ): ' + item.title + ' : ' + item.url);
                  }
               }
               if(isShown) {
                  $(ulExpand).parent().find('.btn-expander').html('-');
                  $(ulExpand).css("display", 'block');
               }
            }

            // unblock UI

            This.showProgressBar( false );
            $('.block-panel').css("display", 'none');

         });
      }
      catch(err) {
         console.log('ERROR[NewsHub.showResultsForAgent()]: ' + err );
      }
   }

   function addAgentNode( agent, index ) {
      try {

         // show all rss-search-agents

         var ulMain = bindDataTemplateValues(ctrlNews.listAgents[index]);

         if( !isDefine(ulMain)) {
            return null;
         }

         var liMain = $(ulMain.children()[index]);

         // new ul element for agents-results

         //var id = agent.id;   // Math.random().toString().split('.')[1];
         var id = "id='" + agent.id + "'";
         var dataSearch = "data-search='" + agent.searchFor + "'";
         var dataExclude = "data-exclude='" + agent.searchExclude + "'";

         var ulElem = '<ul class="list-results-per-agent"' + " "
                     + id + " "
                     + dataSearch + " "
                     + dataExclude + " "
                     + '></ul>';
         liMain.append(ulElem).append("<hr>");

         var ulResults   = liMain.find("#" + agent.id );
         var btnExpander = $(ulResults).parent().find(".btn-expander");

         return {
            ulResults:   ulResults,
            btnExpander: btnExpander
         }
      }
      catch(err) {
         console.log('ERROR(NewsHub.addAgentNode())' + err );
      }
   }

   //function isContentAlreadyExist( item ) {
   //   try {
   //
   //      for( var i = 0; i < This.rssResultLinks.length; i++ ) {
   //
   //         if( This.rssResultLinks[i].url       === item.url &&
   //             This.rssResultLinks[i].searchFor === item.searchFor ) {
   //            return true;
   //         }
   //      }
   //
   //      return false;
   //   }
   //   catch(err) {
   //      console.log('ERROR(NewsHub.isContentExistInList())' + err );
   //   }
   //}

   function getAgentResultsFromController( agent_id ) {
      try {

         var agents = ctrlNews.listResultsPerAgent.length;

         if(agents > 0) {
            for( var i = 0; i < agents; i++ ) {
               if( ctrlNews.listResultsPerAgent[i].id === agent_id ) {
                  return ctrlNews.listResultsPerAgent[i];
               }
            }
            return null;
         }
         else {
            return null;
         }
      }
      catch(err) {
         console.log('ERROR(NewsController.getAgentResultsFromController())' + err );
      }
   }

   function bindDataTemplateValues(rssAgent) {
      try {

         if (!This.rssAgentTemplate) {
            var itemTemplate = $('#th-short-rss-agent-template').html();
            This.rssAgentTemplate = $(itemTemplate);
         }

         if (This.rssAgentTemplate.length === 0) {
            return;
         }

         var _max = 29;
         var search = rssAgent.searchFor.length > _max ? rssAgent.searchFor.slice( 0, _max) + '...' : rssAgent.searchFor;
         $(This.rssAgentTemplate).find('.body-search').text(search);

         //var exclude = rssAgent.searchExclude.length > _max ? rssAgent.searchExclude.slice( 0, _max) + '...' : rssAgent.searchExclude;
         //$(This.rssAgentTemplate).find('.body-exclude').text(exclude);

         $(This.rssAgentTemplate).find('.date-value').text(rssAgent.date);

         var htmlElement = This.rssAgentTemplate[0].outerHTML;
         var liElement = This.listViewCtrl.last().append(htmlElement);

         return liElement;
      }
      catch(err) {
         console.log('RssFeedAgentDialog.bindDataTemplateValues(): ' + err );
         return null;
      }
   }

   function setUIEvents() {
      try {

         $(document).on("click", ".news-hub ul.th-ul-main-menu li", onNewsMainMenu_Click );

         $(document).on("click", ".list-agent-item .btn-expander", onBtnExpander_Click );
      }
      catch( err ) {
         console.log('ERROR(NewsHub.setUIEvents()): ' + err );
      }
   }

   return NewsHub;

})(thJQ);

th.next.SearchAgentsDialog = (function($) {
   var This,
       _public = SearchAgentsDialog.prototype;

   function SearchAgentsDialog() {
      This = this;
      this.cssDlgId = '#rss-agent-dlg';

      this.newsTemplate  = null;
      this.rssAgentTemplate   = null;
      this.dlgShown = false;
      this.parentWnd = null;
      this.changeAgent = false;

      this.Initialize();
   }

   _public.Initialize = function() {
      try {
         if( !isDefine( ctrlNews )) {
            ctrlNews  = new th.next.NewsController();
         }

         This.dialogCtrl = $('#rss-agent-dlg');

         This.listAgentsPanel = $("#rss-agent-dlg .agent-rss-panel .list-agents-panel");

         This.listAgentsCtrl = $("#list-agents-ctrl");

         This.btAgentExpander = $('#new-agent-expander');

         This.dlgProgressBar = $('#rss-agent-dlg .th-dlg-progress-bar');

         This.uiBlockerPanel = $('#th-ui-blocker-panel');

         setUIEvents();

         //$( "#list-agents-expander" ).click(function() {
         //   return;
         //});

         onExpanderAction( $( "#list-agents-expander" )[0] );  // close 'ist-agents-expander'
      }
      catch(err) {
         console.log('ERROR(SearchAgentsDialog.Initialize())' + err );
      }
   };

   _public.OpenDlg = function(parentHub, contentOfHub) {
      try {

         This.parentHub = parentHub;
         This.contentOfHub = contentOfHub;

         showParentHub(false);

         // next time show dialog.

         if(This.dlgShown) {
            This.dialogCtrl.removeClass('invisible-item');
            return;  // not first time
         }

         // first time show dialog.

         This.dlgShown = true;

         This.dialogCtrl.removeClass('invisible-item');   // show dialog

         showListOfAgents(false);

         // show all rss-feed agents from db

         showProgressBar( false );

         if( !isDefine(ctrlNews.listAgents))
            return;

         for( var i = 0; i < ctrlNews.listAgents.length; i++ ) {
            addAgentTemplate(ctrlNews.listAgents[i]);
         }
      }
      catch(err) {
         console.log('SearchAgentsDialog.OpenDlg(): ' + err );
      }
   };

   // --------------------------------------------------------------- User Click

   function onCloseDld_Click(e) {
      try {
         e.preventDefault();

         if( !This.dialogCtrl.hasClass('invisible-item')) {

            This.dialogCtrl.addClass('invisible-item');

            showParentHub(true);

            if( This.changeAgent ) {
               This.changeAgent = false;
               This.parentWnd.readSearchAgents();
            }
         }

         return false;
      }
      catch(err) {
         console.log('SearchAgentsDialog.onCloseDld_Click(): ' + err );
         return false;
      }
   }

   function onAddAgent_Click(e) {
      try {
         e.preventDefault();

         var rssAgent = collectAgentData(e);

         if( !isDefine(rssAgent)) {
            return false;
         }

         addAgentTemplate(rssAgent);

         ctrlNews.listAgents.push(rssAgent);

         // send data to the server

         showProgressBar(true);

         ctrlNews.addAgent(rssAgent, This, function(bResult) {

            showProgressBar(false);

            This.changeAgent = true;

            resetAgentCtrls();
         });

         return false;
      }
      catch(err) {
         console.log('SearchAgentsDialog.onAddAgent_Click(): ' + err );
         return false;
      }
   }

   function onRemoveAgent_Click(event) {
      try {
         var el  = event.target;

         var tmpAgent = $(el).closest('li.list-agent-item');

         if( isDefine(tmpAgent)) {

            var agentIndex = tmpAgent.index();

            var agentObj = ctrlNews.listAgents[agentIndex];

            ctrlNews.removeAgent(agentObj, This, function(res) {

               tmpAgent.remove();

               This.changeAgent = true;

               ctrlNews.listAgents.splice( agentIndex ,1 );

               if( ctrlNews.listAgents.length === 0 )  {
                  showListOfAgents( false );
               }
            });
         }
         return false;
      }
      catch(err) {
         console.log('SearchAgentsDialog.onRemoveAgent_Click(): ' + err );
         return false;
      }
   }

   function onBtnExpander_Click(event) {
      try {
         var el  = event.target;

         /*
         var btnContent = el.innerHTML;

         var classPanel = "";

         if(el.id === "list-agents-expander") {
            classPanel = '#list-agents-ctrl';
         }
         else if(el.id === "new-agent-expander") {
            classPanel= ".new-agent-params";
         }

         var showPanel = btnContent === "-" ? "none" : "block";
         var newBtnContent = btnContent === "-" ? "+" : "-";

         el.innerHTML = newBtnContent;
         $(classPanel).css("display", showPanel);
         */

         onExpanderAction(el);
      }
      catch(err) {
         console.log('SearchAgentsDialog.onBtnExpander_Click(): ' + err );
      }
   }

   function onExpanderAction( element ) {
      try {
         var btnContent = element.innerHTML;

         var classPanel = "";

         if(element.id === "list-agents-expander") {
            classPanel = '#list-agents-ctrl';
         }
         else if(element.id === "new-agent-expander") {
            classPanel= ".new-agent-params";
         }

         var showPanel = btnContent === "-" ? "none" : "block";
         var newBtnContent = btnContent === "-" ? "+" : "-";

         element.innerHTML = newBtnContent;
         $(classPanel).css("display", showPanel);
      }
      catch(err) {
         console.log('SearchAgentsDialog.onExpanderAction(): ' + err );
      }
   }

   function resetAgentCtrls() {
      try {

         //$('#input-agent-news-title').val("");
         $('#input-agent-news-body').val("");
         $('#input-agent-exclude').val("");
      }
      catch(err) {
         console.log('SearchAgentsDialog.resetAgentCtrls(): ' + err );
      }
   }

   // --------------------------------------------------------------- Support functions

   function setUIEvents() {
      try {

         $(document).on("mouseenter", "#list-agents-ctrl li", function(e) {
            var itemToolBar = $(this).find('.btn-circle');
            itemToolBar.css( 'opacity', '1.0');
         });
         $(document).on("mouseleave", "#list-agents-ctrl li", function(e) {
            var itemToolBar = $(this).find('.btn-circle');
            itemToolBar.css( 'opacity', '0.0');
         });

         $(document).on("click", "#close-rss-agent-dlg", onCloseDld_Click );

         $(document).on("click", "#add-rss-agent-btn", onAddAgent_Click );

         $(document).on("click", "#list-agents-ctrl li .btn-remove-agent-item", onRemoveAgent_Click );

         $(document).on("click", "#list-agents-expander", onBtnExpander_Click );
         $(document).on("click", "#new-agent-expander", onBtnExpander_Click );
      }
      catch(err) {
         console.log('SearchAgentsDialog.setUIEvents(): ' + err );
      }
   }

   function addAgentTemplate(rssAgent) {
      try {

         //ctrlNews.listAgents.push(rssAgent);

         if( !This.rssAgentTemplate) {
            var itemTemplate   = $('#th-rss-agent-template-dlg').html();
            This.rssAgentTemplate = $( itemTemplate );
         }

         if( This.rssAgentTemplate.length === 0 )
            return;

         $(This.rssAgentTemplate).find('.langs-search').text(rssAgent.language);

         //$(This.rssAgentTemplate).find('.topics-search').text(rssAgent.topics);

         //$(This.rssAgentTemplate).find('.title-search').text(rssAgent.titleSearch);

         $(This.rssAgentTemplate).find('.body-search').text(rssAgent.searchFor);

         $(This.rssAgentTemplate).find('.body-exclude').text(rssAgent.searchExclude);

         var htmlTemplate = This.rssAgentTemplate[0].outerHTML;
         //$("#list-agents-ctrl").last().append('<li>' + htmlTemplate + '</li>');
         This.listAgentsCtrl.last().append(htmlTemplate);

         showListOfAgents(true);
      }
      catch(err) {
         console.log('SearchAgentsDialog.addAgentTemplate(): ' + err );
      }
   }

   function showProgressBar( bShow ) {
      try {
         This.dlgProgressBar.css('display', !bShow ? 'none' : "block");
         This.uiBlockerPanel.css('display', !bShow ? 'none' : "block");
      }
      catch(err) {
         console.log('SearchAgentsDialog.showProgressBar(): ' + err );
      }
   }

   function showParentHub( bShow ) {
      try {
         $(This.parentHub).css('width', !bShow ? '300px': "330px");
         $(This.parentHub + " .th-cover").css('box-shadow', !bShow ? 'none': "0 0 30px rgba(0,0,0,0.6),inset 0 0 30px rgba(0,0,0,0.15)");
         $(This.contentOfHub).css('display', !bShow ? 'none' : "block");
      }
      catch(err) {
         console.log('SearchAgentsDialog.showParentHub(): ' + err );
      }
   }

   function showListOfAgents( bShow ) {
      try {
         This.listAgentsPanel.css('display',!bShow ? 'none' : "block");
         //This.btAgentExpander.css('display',!bShow ? 'none' : "block");
         This.btAgentExpander.css('display', 'none');

         var style = bShow? ' none !important' : " block  !important";
         This.btAgentExpander.siblings().closest('hr').attr('style', 'display: ' + style);
      }
      catch(err) {
         console.log('SearchAgentsDialog.showListOfAgents(): ' + err );
      }
   }

   function collectAgentData(e) {
      try {
         // get all data from user-controls.

         var lang = $("#rss-agent-dlg .search-languages .search-languages-items").val();

         //var titleSearch = $('#input-agent-news-title').val();
         var searchFor = $('#input-agent-news-body').val();

         if( searchFor.length === 0 ) {
            alert('Please fill searching request');
            return null;
         }

         //var excludeSearch = $('#input-agent-exclude').val();

         var rssAgent = {
            id:    GUID(),
            type: "web",
            activity: true,
            date: getCurrentDate(),
            language: lang,
            searchFor: searchFor,
            searchExclude: ""
            //,result: [],
            //list: []
         };

         return rssAgent;
      }
      catch(err) {
         console.log('SearchAgentsDialog.collectAgentData(): ' + err );
      }
   }

   return SearchAgentsDialog;

})(thJQ);

th.next.NewsController = (function($) {
   var This
       ,_public = NewsController.prototype;

   function NewsController() {
      This = this;

      this.listAgents = [];

      this.listResultsPerAgent = [];

      this.Initialize();
   }

   _public.Initialize = function() {
   };

   _public.getAgents = function(userOwner, callback) {
      try {
         if(!isDefine( userOwner )) {
            return sendCallBack(callback(false));
         }

         var req = 'get-search-agents';

         var request = {
            dbcollection: 'search_agents'
            , dbrequest:    {
               'owner': userOwner.id,
               'agent.type': "web",
               'agent.activity': true
            }
            , dbreturn : {
               '_id':   0
               //,
               //'agent': 1
            }
         };

         var ajaxData = JSON.stringify(request);

         function success_call( data, textStatus, jqXHR ) {

            if(isJsonData(data)) {

               var parser = JSON.parse(data);

               if(parser.err === true ) {
                  return sendCallBack(callback( false ));
               }
               else if( typeof parser.param === "object" && Array.isArray(parser.param) ) {

                  parser.param.forEach(function(item) {
                     var agent = item.agent;
                     This.decodeAgent( agent );
                     This.listAgents.push(agent);
                  });

                  return sendCallBack(callback( true ));
               }
               else {
                  return sendCallBack(callback( false ));
               }
            }
            else {
               return sendCallBack(callback( false ));
            }
         }

         function error_call ( jqXHR, textStatus, errorThrown ) {
            console.log('ERROR[NewsController.getAllAgents()]: ' + errorThrown );

            return sendCallBack(callback( false));
         }

         ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
      }
      catch(err) {
         console.log('ERROR(NewsController.getAllAgents())' + err );
      }
   };

   _public.addAgent = function( agent, _This, callback  ) {
      try {

         if( !isDefine(agent)) {
            return;
         }

         This.encodeAgent(agent);

         var req     = 'add-search-agent';
         var request = {
            dbcollection: 'search_agents',
            dbrequest:      {
               'owner':  getUser().id,
               agent: agent
            }
         };

         var ajaxData = JSON.stringify(request);

         ajaxCall( pathServer + req, req + '=' + ajaxData,
             function( data, textStatus, jqXHR ) {
                return sendCallBack(callback( true));
             },
             function( jqXHR, textStatus, errorThrown ) {
                console.log('add new AGENT Fail... -' + errorThrown );
                return sendCallBack(callback( false));
             });
      }
      catch(err) {
         console.log('ERROR(NewsController.addNews())' + err );
      }
   };

   _public.removeAgent = function( agent, _This, callback  ) {
      try {

         if( !isDefine(agent)) {
            return;
         }

         This.encodeAgent(agent);

         var req     = 'remove-search-agent';
         var request = {
            dbcollection: 'search_agents',
            dbfind:        {
               'owner': getUser().id,
               'agent.id': agent.id
            },
            dbupdate: {
               '$set' : {
                  'agent.activity': false
               }
            }
         };

         var ajaxData = JSON.stringify(request);

         ajaxCall( pathServer + req, req + '=' + ajaxData,
            function( data, textStatus, jqXHR ) {
               return sendCallBack(callback( true));
            },
            function( jqXHR, textStatus, errorThrown ) {
               console.log('add new AGENT Fail... -' + errorThrown );
               return sendCallBack(callback( false));
            });
      }
      catch(err) {
         console.log('ERROR(NewsController.removeAgent())' + err );
      }
   };

   _public.getAgentResults = function( agent, callback) {
      try {
         if(!isDefine( agent )) {
            sendCallBack(callback(false));
         }

         This.encodeAgent(agent);

         var req = 'get-agent-results';

         // http://www.mkyong.com/mongodb/mongodb-find-all-documents-where-an-array-list-size-is-greater-than-n/
         //> db.nnn.find({'comments.id':'5473-2391-1013-3237-71940012141'},{'comments.$.post': 1}).pretty()
         //db.feed_content_2015_7_9.find({'content.id':'1873-985-869-1552-87721771837'},{'content.$.link': 1}).pretty()
         // db.getCollection('search_results').find({'searchFor': 'день', 'searchExclude': ''},{_id:0,'results':1})

         var request = {
            dbcollection: 'search_results'
            , dbrequest:    {
               'searchFor' :     agent.searchFor,
               'searchExclude':  agent.searchExclude
            }
            , dbreturn : {
               '_id' :    0,
               'results': 1 // what object of record have to return
            }
         };

         var ajaxData = JSON.stringify(request);

         function success_call( data, textStatus, jqXHR ) {

            if(!isJsonData(data)) {
               return sendCallBack(callback( true, null ));
            }
            else {
               var parser = JSON.parse(data);

               if(parser.err === true ) {
                  sendCallBack(callback( true, null ));
               }
               else {
                  var args = parser.param;

                  if( args.length > 0) {

                     var list = args[0].results;

                     var results = {
                        id:            agent.id,
                        searchFor:     agent.searchFor,
                        searchExclude: agent.searchExclude,
                        results:       list
                     }

                     This.listResultsPerAgent.push(results);

                     return sendCallBack(callback( false, list ));
                  }
                  else {
                     return sendCallBack(callback( true, null ));
                  }
               }
            }
         }

         function error_call ( jqXHR, textStatus, errorThrown ) {
            console.log('ERROR[NewsController.getAllAgents()]: ' + errorThrown );

            return sendCallBack(callback( false));
         }

         ajaxCall( pathServer + req, req + '=' + ajaxData, success_call, error_call );
      }
      catch(err) {
         console.log('ERROR(NewsController.getAgentResults())' + err );
      }
   };

   // --------------------------------------------------------------- Support functions

   _public.encodeAgent = function( agent ) {
      try {
         if( !isDefine(agent))
            return;

         agent.searchFor    = encodeURIComponent(encodeLineBreaksNew(  agent.searchFor ));
         agent.excludeSearch = encodeURIComponent(encodeLineBreaks(  agent.excludeSearch ));
      }
      catch(err) {
         console.log('ERROR(NewsController.encodeAgent())' + err );
      }
   };

   _public.decodeAgent =  function( agent ) {
      try {
         if( !isDefine(agent))
            return;

         agent.searchFor    = decodeURIComponent( decodeLineBreaksNew( agent.searchFor ));
         //agent.searchExclude = decodeURIComponent( decodeLineBreaks( agent.searchExclude ));
      }
      catch(err) {
         console.log('ERROR(NewsController.decodeAgent())' + err );
      }
   };

   return NewsController;

})(thJQ);

