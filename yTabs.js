var yTabs;

(function(window, undefined) {
	yTabs = function( node, options ) {
		var self = this,
			toString, settings, tabHash, tabs, items, triggerType, current, itemsLength, hash,
			$canvas, canvas,
			initialize, next, prev, switchTo, _bindEvents, addEventListener, removeEventListener, _fireEvent, _public_methods;

		toString = Object.prototype.toString;

		function extend( dest, source ) {
			var dest = dest;

			if ( toString.call( dest ) !== '[object Object]' ) {
				dest = {};
			}

			if ( toString.call( source ) !== '[object Object]' ) {
				return dest;
			}

			for ( var p in source ) {
				if ( source.hasOwnProperty( p ) ) {
					dest[p] = source[p];
				}
			}

			return dest;
		}

		var defaults = {
			start: 0,
			transition: 0, // 0: show, 1: fade, 2: slide, 3: Smooth Scroll
			useHash: true,
			contain: true,
			activeClass: 'y-tab-active',
			selectors: 'li',
			frames: '.y-tab-frame',
			trigger: 'click',
			onStart: null,
            onHash: null
		};

		settings = extend( defaults, options );

		activeClass = settings.activeClass;

		// Allow Callbacks
		var _eventListeners = {
			'tabstart': [],
			'tab': [],
			'tabend': [],
			'scrollend': []
		};

		var clicked = false;

		initialize = function initialize() {
			if ( typeof node === 'string' ) {
				$canvas = $( node );
				canvas = $canvas[0];
			} else {
				if ( node.nodeType ) {
					$canvas = $( node );
					canvas = node;
				} else {
					$canvas = node;
					canvas = node[0];
				}
			}

			triggerType = settings.trigger ? settings.trigger === 'mouse' ? 'mouseenter' : settings.trigger : 'click';

			tabs = $canvas.find( settings.selectors ).not('.tab-anchor');

			if ( settings.contain ) {
				items = $canvas.find( settings['frames'] );
			} else {
				items = typeof settings['frames'] === 'string' ? $(settings['frames']) : settings['frames'];
			}

			itemsLength = items.length;

			current = Math.max( 0, Math.min( settings.start, itemsLength - 1 ) );

			tabs.removeClass(activeClass);
			tabs.eq( current ).addClass(activeClass);

			items.hide();
			items.eq( current ).show();

			settings.onStart && settings.onStart.call( this, items.eq( current ) );

			_bindEvents();
		};

		_bindEvents = function _bindEvents() {
            if ( settings.useHash ) {
    			$(window).on("hashchange", function() {
    				var changeHash = window.location.hash.replace('#', '');
    			});
            }

			tabHash = [];

			tabs.each(function( inx, none ) {
				var $this = $(this);

				var hash = $this.data('hash');

				tabHash.push( hash );

				$this.on( triggerType, function() {
					clicked = true;
					switchTo( inx );
				} );
			});

			var hash = window.location.hash.replace('#tab-', '');

			if ( hash && ~$.inArray( hash, tabHash ) && settings.useHash ) {
                var inx = $.inArray( hash, tabHash );

                switchTo( inx );

                settings.onHash && settings.onHash.call( this, tabs.eq( current ), items.eq( current ) );
			}
		};

		switchTo = function switchTo( which ) {
			current = ( itemsLength + ( which % itemsLength ) ) % itemsLength;

            if ( tabs.eq( current ).hasClass( activeClass ) ) {
                return;
            }

            tabs.removeClass( activeClass );
            tabs.eq( current ).addClass( activeClass );

            items.hide();
            items.eq( current ).show();

			_fireEvent( 'tab', {
                tab: tabs.eq( current ),
				element: items.eq( current )
			} );

            if ( settings.useHash ) {
		        setHash();
            }
		};

		function hashAnimate( hash ) {
			var hashIndex = $.inArray( hash, tabHash ) != -1 ? $.inArray( hash, tabHash ) : 0 ;

			switchTo( hashIndex );
		}

		function setHash() {
			var hash = tabs.eq( current ).data( 'hash' );

			window.location.hash = "#tab-" + hash;
		}

		addEventListener = function addEventListener( eventname, eventlistener ) {
			// Not Allow Callback Break
			if ( !_eventListeners.hasOwnProperty( eventname ) ) {
				return false;
			}

			_eventListeners[ eventname ].push( eventlistener );

			return true;
		};

		removeEventListener = function removeEventListener( eventname, eventlistener ) {
			var i;

			if ( !_eventListeners.hasOwnProperty( eventname ) ) {
				return false;
			}

			for ( i = _eventListeners[eventname].length; i >= 0; i = i - 1 ) {
				if (_eventListeners[ eventname ][ i ] === eventlistener) {
					_eventListeners[ eventname ].splice( i, 1 );
				}
			}

			return true;
		};

		_fireEvent = function _fireEvent( eventName, eventObject ) {
			var i, l;
				eventObject.srcObject = _public_methods;
			for ( i = 0, l = _eventListeners[ eventName ].length; i < l; i = i + 1 ) {

				try {
					_eventListeners[ eventName ][ i ]( eventObject );
				} catch (error) {}
			}
		};

		initialize();

		_public_methods = {
			on: addEventListener,
			off: removeEventListener,
			switchTo: switchTo
		};

		return _public_methods;
	};
}(this));