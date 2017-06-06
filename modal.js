(function ($, Y, global, undefined) {
	var win = global,
		doc = document,
		SLICE = Array.prototype.slice;

	var uid = function() {
		var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		var Randomchars = (function(bin) {
			var str = '',
				i = 0,
				max = 6,
				l = bin.length;

			for ( ; i < max; i++ ) {
				str += bin.charAt( Math.floor( Math.random(l) * l ) );
			}

			return str;
		}(chars));

		return 'y-modal-' + Randomchars + +new Date();
	};

	var isPositionFixedSupported = (function() {
		var container = document.body || document.documentElement;

		if ( document.createElement && container && container.appendChild && container.removeChild ) {
			var el = document.createElement('div');

			if (!el.getBoundingClientRect) return null;

			el.innerHTML = 'x';
			el.style.cssText = 'position:fixed;top:100px;';
			container.appendChild(el);

			var originalHeight = container.style.height,
			originalScrollTop = container.scrollTop;

			container.style.height = '3000px';
			container.scrollTop = 500;

			// var elementTop = el.getBoundingClientRect().top;
			var elementTop = el.offsetTop;

			container.style.height = originalHeight;

			var isSupported = (elementTop === 100);
			container.removeChild(el);
			el = null;
			container.scrollTop = originalScrollTop;

			return isSupported;
		}

		return null;
	})();

	var MODAL_TEMPLATE = '<div class="y-modal" role="dialog">' +
						 '	<div class="y-modal-header"></div>' +
						 '	<div class="y-modal-container">' +
						 '		<div class="y-modal-content">' +
						 '			<div class="y-modal-message">{{message}}</div>' +
						 '		</div>' +
						 '		<div class="y-modal-buttons lap-one-whole">' +
						 '			<a href="#" class="y-modal-btn y-modal-accept button button-only" data-modal-confirm="true">确定</a>' +
						 '		</div>' +
						 '	</div>' +
						 '	<div class="y-modal-footer"></div>' +
						 '	<div class="y-modal-close"><span class="close">x</span></div>' +
						 '</div>';


	var Modal = function( modal, options ) {
		this.settings = $.extend( {}, Modal.defaults, options );

		this.element_map = {
			'close': 'data-modal-close',
			'confirm': 'data-modal-confirm'
		};

		this.element = {
			'overlay': '.y-modal-overlay',
			'close'  : '.y-modal-close .close',
			'accept' : '.y-modal-accept'
		};

		this.class_map = {
			'active': 'y-modal-active'
		};

		this.isNode = (function() {
			return !!modal.nodeType;
		}());

		this.uid = uid();

		this.$modal = null;

		this.modal_html = MODAL_TEMPLATE;

		this._isTweening = false;

		this._isActive = false;

		if ( this.isNode ) {
			this.$modal = $(modal);
		} else {
			this.modal_html = this.modal_html.replace( '{{message}}', modal );

			this.$modal = $(this.modal_html);

			this.$modal.attr( 'id', this.uid );

			$('body').append( this.$modal );
		}

        if ( $('body').find( this.element.overlay ).length < 1 ) {
            $('body').append( $('<div class="' + this.element.overlay.substring(1) + '" />') )
        }

		this.$overlay = $(this.element.overlay);

		this.$accept = this.$modal.find(this.element.accept);

		this.modal = this.$modal[0];

		this._dimension = {
			width : this.$modal.outerWidth(),
			height : this.$modal.outerHeight()
		};

		this._viewport = Y.viewport();

		this._page = {
			height: Math.max( document.documentElement.clientHeight || document.body.clientHeight, document.documentElement.scrollHeight || document.body.scrollHeight )
		};

		this._offset = {
			x: Y.getOffset('x'),
			y: Y.getOffset('y')
		};

		this._cache = {
			x: Y.getOffset('x') || 0,
			y: Y.getOffset('y') || 0
		};

		this._from = this._offset;

		this._to = {
			x: 0,
			y: 0
		};

		this._initialize();
	};

	Modal.activeElement = undefined;

	Modal.lastActive = undefined;

	var M = Modal.prototype;

	M._initialize = function() {
		var self = this;

		if ( !self.$modal.attr('tabIndex') ) {
            self.$modal.attr( 'tabIndex', -1 );
        }

		self.show();

		self.setup();
	};

	M._setFocus = function() {
		if ( Modal.activeElement ) {
			Modal.lastActive = document.activeElement;

			Modal.activeElement.focus();
		}
	};

	M._removeFocus = function() {
		if (Modal.lastActive) {
			// Modal.lastActive.focus();
		}
	};

	M._setActive = function( element ) {
		var self = this;

		Modal.activeElement = element;

		// $(Modal.activeElement).addClass( self.class_map['active'] );

		Modal.activeElement.setAttribute('aria-hidden', 'false');

		this._setFocus(element.id);
	};

	M._unsetActive = function() {
		var self = this;

		if ( Modal.activeElement ) {
			var $modal = $(Modal.activeElement);
			$modal.removeClass( self.class_map['active'] );

			if ( $modal.data('ym.modal') ) {
				$modal.removeData('ym.modal');
			}

			Modal.activeElement.setAttribute('aria-hidden', 'true');

			this._removeFocus();

			Modal.activeElement = null;
		}
	};

	M.show = function() {
		var self = this,
			$modal = self.$modal,
			modal = self.modal,
			style = modal.style,
			$overlay = self.$overlay;

		self.lock();

		self._viewport = Y.viewport();

		self._offset = {
			x: Y.getOffset('x'),
			y: Y.getOffset('y')
		};

		this._page = {
			height: Math.max( document.documentElement.clientHeight || document.body.clientHeight, document.documentElement.scrollHeight || document.body.scrollHeight )
		};

		var x = self._offset.x + ( ( self._viewport.width - self._dimension.width ) / 2 );
		var y = self._offset.y + ( ( self._viewport.height - self._dimension.height ) / 2 );

		self._to.x = x;
		self._to.y = y;

		$overlay.css('height', self._page.height + 'px');

		// self.animate(true, function() {
		// 	self._cache.x = x;
		// 	self._cache.y = y;

		// 	self._isActive = true;
		// });

		$modal.addClass( self.class_map['active'] );

		self._unsetActive();
		self._setActive( self.modal );
	};

	M.hide = function() {
		var self = this,
			$modal = self.$modal,
			modal = self.modal,
			$overlay = self.$overlay,
			isNode = self.isNode;

		if ( isNode ) {
			if ( $modal ) {
				$modal.removeClass(self.class_map['active']);
			}

			if ( $modal.data('ym.modal') ) {
				$modal.removeData('ym.modal');
			}
		} else {
			if ( $modal ) {
				$modal.remove();
			}
		}

		self._unsetActive();

		self.unlock();

		self._isActive = false;
	};

	M.setup = function() {
		var self = this,
			$modal = self.$modal,
			$overlay = self.$overlay;

		Y.bind( win, 'resize', Y.throttle( function() {
			// self.resize();
		}, 250 ), self );

		Y.bind( win, 'scroll', Y.throttle( function() {
			self.scrollTo();
		}, 250 ), self );

		Y.bind( $modal.find(self.element.close).get(0), 'click', function(evt) {
			self.hide();

			self.settings.onClose && self.settings.onClose.call();

            evt.preventDefault();
			// Y.stop(evt);
		} );

		if ( self.$accept.length ) {
			Y.bind( $modal.find(self.element.accept).get(0), 'click', function(evt) {
				self.hide();

                evt.preventDefault();
				// Y.stop(evt);
			} );
		}
	};

	M.lock = function() {
		var self = this,
			$overlay = self.$overlay;

		$overlay.show();
	};

	M.unlock = function() {
		var self = this,
			$overlay = self.$overlay;

		$overlay.hide();
	};

	M.resize = function() {
		var self = this;

		if ( !self._isActive ) {
			return;
		}

		self._viewport = Y.viewport();

		this._page = {
			height: Math.max( document.documentElement.clientHeight || document.body.clientHeight, document.documentElement.scrollHeight || document.body.scrollHeight )
		};

		var x = self._offset.x + ( ( self._viewport.width - self._dimension.width ) / 2 );
		var y = self._offset.y + ( ( self._viewport.height - self._dimension.height ) / 2 );

		self._to.x = x;
		self._to.y = y;

		self.animate( false, function() {
			self._cache.x = x;
			self._cache.y = y;
		} );
	};

	M.scrollTo = function() {
		var self = this;

		if ( !self._isActive ) {
			return;
		}

		self._viewport = Y.viewport();

		self._offset = {
			x: Y.getOffset('x'),
			y: Y.getOffset('y')
		};

		var x = self._offset.x + ( ( self._viewport.width - self._dimension.width ) / 2 );
		var y = self._offset.y + ( ( self._viewport.height - self._dimension.height ) / 2 );

		self._from.x = x;
		self._from.x = y;

		self._to.x = x;
		self._to.y = y;

		self.animate(false, function() {
			self._cache.x = x;
			self._cache.y = y;
		});
	};

	M.update = function(evt) {
		var self = this;

		self._dimension = {
			width : this.$modal.outerWidth(),
			height : this.$modal.outerHeight()
		};
	};

	M.animate = function(isFirst, callback) {
		var self = this,
			modal = self.modal,
			$modal = self.$modal,
			settings = self.settings,
			duration = settings.duration,
			easing = settings.easing in Y.Effect ? settings.easing : 'cubicEase',
			easingMethod = Y.Effect[easing];


		var from = self._cache,
			to = self._to;

		if ( isFirst ) {
			$modal.css( {
				'left': to.x + 'px',
				'top' : from.y
			} );
		} else {
			$modal.css( {
				'left': to.x + 'px',
				'top': from.y
			} );
		}
		var wasAnimating = self._isTweening;

		if( wasAnimating ) {
			Y.Animation.stop( self._isTweening );

			self._isTweening = false;
		}

		function tweenStep( percent, now, smooth ) {
			if ( smooth ) {
				var distance = {};
				distance.x = from.x + ( ( to.x - from.x ) * percent );
				distance.y = from.y + ( ( to.y - from.y ) * percent );

				if ( isFirst ) {
					$modal.css( {
						'top': distance.y + 'px'
					} );
				} else {
					$modal.css( {
						'top': distance.y + 'px',
						'left': distance.x + 'px'
					} );
				}
			}
		}

		function tweenVerify( id ) {
			return self._isTweening = id;
		}

		function tweenCompleted() {
			callback && callback.call();
		}

		self._isTweening = Y.Animation.start( tweenStep, tweenVerify, tweenCompleted, duration, easingMethod );
	};

	M.destory = function() {

	};

	M.on = function ( eventName, callback ) {
		var self = this, listeners, n;

		if ( typeof eventName === 'object' ) {
			listeners = [];

			for ( n in eventName ) {
				if ( eventName.hasOwnProperty( n ) ) {
					listeners[ listeners.length ] = this.on( n, eventName[ n ] );
				}
			}
		}

		if ( !this._subs[ eventName ] ) {
			this._subs[ eventName ] = [ callback ];
		} else {
			this._subs[ eventName ].push( callback );
		}
	};

	M.fire = function ( eventName ) {
		var args, i, len, subscribers = this._subs[ eventName ];

		if ( !subscribers ) {
			return;
		}

		args = Array.prototype.slice.call( arguments, 1 );

		for ( i=0, len=subscribers.length; i<len; i+=1 ) {
			subscribers[i].apply( this, args );
		}
	};

	M.off = function ( eventName, callback ) {
		var subscribers, index;

		if ( !callback ) {
			if ( !eventName ) {
				this._subs = {};
			} else {
				this._subs[ eventName ] = [];
			}
		}

		subscribers = this._subs[ eventName ];

		if ( subscribers ) {
			index = subscribers.indexOf( callback );
			if ( index !== -1 ) {
				subscribers.splice( index, 1 );
			}
		}
	};

	Modal.cssEase = {
		'cubicEase':           'ease',
		'cubicEaseIn':         'ease-in',
		'cubicEaseOut':        'ease-out',
		'cubicEaseInOut':      'ease-in-out',
		'cubicEaseInBack': 	   'cubic-bezier(0.86,0,0.07,1)',
		'cubicEaseBackIn': 	   'cubic-bezier(0.19,1,0.22,1)',
		'cubicEaseSnap':       'cubic-bezier(0,1,0.5,1)'
	};

	Modal.defaults = {
		width: 'auto',
		height: 'auto',
		type: 'alert', //alert,info,error,prompt,confirm
		easing: 'cubicEaseSnap',
		duration: 500,
		title: false,
		animate: true,
		fullscreen: false,
		backdrop: false,
		lock: true,
		close: true,
		onClose: null
	};

	$.fn.modal = function( option ) {
		var args = SLICE.call(arguments, 1);

		return this.each(function() {
			var $this = $(this),
				data = $this.data('ym.modal');

			if ( !data ) {
				data = new Modal( this, typeof option == 'object' && option );

				$this.data( 'ym.modal', data );
			}

			if ( typeof option == 'string' && option.charAt(0) !== '_' ) {
				data[option].apply(data, args);
			}
		});
	};

	/*
	 * AMD, module loader, global registration
	 */

	// Expose modal for loaders that implement the Node module pattern.
	if (typeof module === 'object' && module && typeof module.exports === 'object') {
		module.exports = Modal;

	// Register as an AMD module
	} else if (typeof define === 'function' && define.amd) {
		define('Modal', [], function () {
			return Modal;
		});

	// Export CSSModal into global space
	} else if (typeof global === 'object' && typeof global.document === 'object') {
		global.Modal = Modal;
	}

}(jQuery, Y, this || window));
