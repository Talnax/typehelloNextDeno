/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013, 5/26/13
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    hub-center.js
 */

/*
 We have MVC and MV-V-M but for Web development we have another infrastructure:

 ui.html + ui.js     - VIEW
 ui-controller.js    - CONTROLLER
 DataBase or *.json  - MODEL

 1.  User make click on HTML <button /> tag, this event go to UI.js ( VIEW )
 2.  UI.js call ui-controller.js ( CONTROLLER ) to make modification in DataBase/json ( MODEL )
 3.  After this changes callback return base of chain controller.js -> UI.js
 4.  And UI.js will change HTML page( VIEW )

 In Source it will look like:

 ui.html :
 <html>
 <body>
 <input id='read-db' type="button" />
 <script src='controller.js'></script>
 <script src='ui.js'></script>
 </body>
 </html>

 ui.js   :
 window.onload = function() {
 var btn = document.getElementById('read-db');
 btn.onclick = function( e ) {
 callDB( function() {
 btn.setAttribute('style', 'background-color: lightblue');
 } ) ;
 }
 }

 ui-controller.js   :
 function callDB( callback ) {
 readDB( user, function( result ) {
 callback( result );
 } );
 }

 */

var th = th || {};
th.next = th.next || {};

th.next.HubCenter = ( function($) {
    var This
        , _public = HubCenter.prototype;

    function HubCenter() {
        This               = this;
        this.cssClassHub   = '.hub-center';
        this.hubStatus     = statusHub.not_active;

        this.btnLogo       = $('.hub-center-btn');
        this.hubPanel      = $('.hub-panel');

        this.centerBttn    = $( this.cssClassHub + ' .hub-center-btn');
        this.slideMenu     = $( this.cssClassHub + ' .th-slide-menu');

        this.commonHub = new th.next.CommonHub( this );
        //this.commonHub.InitializeHub(this);

        this.Initialize();
    }

/*
    function init() {

        var container = document.getElementById( 'st-container' ),
            buttons = Array.prototype.slice.call( document.querySelectorAll( '#st-trigger-effects > button' ) ),
        // event type (if mobile use touch events)
            eventtype = mobilecheck() ? 'touchstart' : 'click',
            resetMenu = function() {
                classie.remove( container, 'st-menu-open' );
            },
            bodyClickFn = function(evt) {
                if( !hasParentClass( evt.target, 'st-menu' ) ) {
                    resetMenu();
                    document.removeEventListener( eventtype, bodyClickFn );
                }
            };

        buttons.forEach( function( el, i ) {
            var effect = el.getAttribute( 'data-effect' );

            el.addEventListener( eventtype, function( ev ) {
                ev.stopPropagation();
                ev.preventDefault();
                container.className = 'st-container'; // clear
                classie.add( container, effect );
                setTimeout( function() {
                    classie.add( container, 'st-menu-open' );
                }, 25 );
                document.addEventListener( eventtype, bodyClickFn );
            });
        } );

    }
*/

    // --------------------------------------------------------------- Public functions

    _public.Initialize = function() {

       This.commonHub.removeMainMenuItem( This, 'center');

       This.commonHub.setHubPosition( This );

        This.hubStatus = statusHub.initialized;

       setUIEvents();
    };

    // --------------------------------------------------------------- Common Hub functions

    _public.hubShow = function( bShow ) {
      //This.commonHub.hubShow( This, bShow);
       if( bShow ) {
          $( This.cssClassHub ).css( 'display', 'block');
          $( This.cssClassHub ).css("z-index", zIndex );
       }
       else {
          $( This.cssClassHub ).css( 'display', 'none');
       }
   };

    _public.onMainMenuAction_Click = function(e) {
      $( This.cssClassHub ).css( 'display', 'none');
      This.commonHub.onMainMenuAction_Click(This, e);
   };

    _public.getHubStatus = function( bShow ) {
        return This.hubStatus;
    };

    // --------------------------------------------------------------- Click functions

    // --------------------------------------------------------------- Support functions

   function setUIEvents() {
      try {

         This.centerBttn.mouseenter(function() {
            $(this).parent().css( 'display', 'none');
            This.slideMenu.css( 'display', 'block');
         });

         This.slideMenu.mouseleave(function() {
            $(this).css( 'display', 'none');
            $(this).find('.th-slide-menu-separator-subset').css( 'display', 'none');
            This.centerBttn.parent().css( 'display', 'block');
         });

         This.slideMenu.find('.th-slide-menu-separator .th-slide-menu-separator-text').mouseenter(function() {
            $(this).css('color', 'black');
            $(this).parent().find('.th-slide-menu-separator-subset').css( 'display', 'block');
         });

         This.slideMenu.find('.th-slide-menu-separator').mouseleave(function() {
            $(this).find('.th-slide-menu-separator-text').css('color', 'white');
         });

         // slide main menu clicks

         var elSlideMainMenuItem = This.cssClassHub + " .th-slide-menu-ul li.th-slide-menu-item";

         This.slideMainMenuItem  = $( elSlideMainMenuItem );

         $(document).on( "click", elSlideMainMenuItem, This.onMainMenuAction_Click );

      }
      catch( err ) {
         console.log('ERROR(NoteHub.setUIEvents()): ' + err );
      }
   }

    return HubCenter;

})(thJQ);

th.next.HubCenterController = (function($){
    var This
        ,_public = HubCenterController.prototype;

    function HubCenterController() {
        This = this;

        this.Initialize();
    }

    _public.Initialize = function() {
        console.log( "LogInController.Initialize()" );
    };

    return HubCenterController;

})(thJQ);
