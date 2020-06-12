/*
 * Author:  Rost Shevtsov ( herclia )
 * project: TypeHello, 2013, 5/24/13
 * product: Web-Communicator ( TypeHello ) Channel2Channel
 * file:    controller-settings.js
 */

var th = th || {};
th.next = th.next || {};

th.next.SettingsController = (function($) {
    var This,
        _public = SettingsController.prototype;

    function SettingsController() {
        This = this;
        this.Initialize();
    }

    _public.Initialize = function() {};

   // issue of unreachable code
   // http://stackoverflow.com/questions/3039748/jslint-reports-unexpected-use-of-and-id-like-to-clean-this
    _public.openStartHubs = function() {
        //try {
        //
        //    // if new user sign-up we don't show any another hub
        //    if( isNewUser )
        //        return;
        //
        //    /*
        //    loadHub( 'wall-hub', function(res) {
        //        if( res === 'ok' ) {
        //            if( !hubWall ) {
        //                hubWall = new th.next.WallHub();
        //            }
        //            hubWall.hubShow( true );
        //        }
        //    });
        //    */
        //    /*
        //    loadHub( 'pin-hub', function(res) {
        //        if( res === 'ok' ) {
        //            if( !hubPin ) {
        //                hubPin = new th.next.PinHub();
        //            }
        //            hubPin.hubShow( true );
        //        }
        //    });
        //    */
        //
        //    /*
        //    loadHub( 'note-hub', function(res) {
        //        if( res === 'ok' ) {
        //            if( !hubNote ) {
        //                hubNote = new th.next.NoteHub();
        //            }
        //            hubNote.hubShow( true );
        //        }
        //    });
        //    */
        //
        //    //loadHub( 'news-hub', function(res) {
        //    //    if( res === 'ok' ) {
        //    //        if( !hubNews ) {
        //    //            hubNews  = new th.next.NewsHub();
        //    //        }
        //    //        hubNews.hubShow( true );
        //    //    }
        //    //});
        //}
        //catch(err) {
        //    console.log('ERROR(SettingsController.openStartHubs()): ' + err);
        //}
    };

    return SettingsController;

})(thJQ);