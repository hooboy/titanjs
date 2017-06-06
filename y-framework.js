(function(global, document, undefined) {
	var global = this,
		doc = global.document,
		toString = Object.prototype.toString;

	var Y = {
		version: '0.0.1',
		global: global
	};

	Y.now = Date.now || function() {
		return new Date().getTime();
	};

	Y.trim = function( str ) {
		return ( typeof str === 'string' && String.prototype.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '') );
	};

	Y.isNumber = function( val ) {
		return Y.type( val ) === 'number';
	};

	Y.isString = function( val ) {
		return toString.call( val ) === '[object String]';
	};

	Y.isBoolean = function( val ) {
		return toString.call( val ) === '[object Boolean]';
	};

	Y.isFunction = function( val ) {
		return toString.call( val ) === '[object Function]';
	};

	Y.isArray = Array.isArray || function( val ) {
		return toString.call( val ) === '[object Array]';
	};

	Y.isObject = Object.isObject || function( val ) {
		return ( val != null ) && ( toString.call( val ) === '[object Object]' );
	};

	Y.isNothing = function( val ) {
		if( typeof val === "undefined" || val === null ) {
			return true;
		}

		return false;
	};

	Y.isDefined = function( val ) {
		return typeof val !== 'undefined';
	};

	Y.objectHasProperty = function( obj, prop ) {
		if( obj.hasOwnProperty ) {
			return obj.hasOwnProperty( prop );
		} else {
			return ( 'undefined' !== typeof obj[prop] );
		}
	};

	Y.isEmptyObject = function( obj ) {
		for ( var p in obj ) {
			return false;
		}

		return true;
	};

	/*
	 * 函数节流
	 * @param{ Function } 频繁触发的函数
	 * @return{ Function } 节流后的函数
	 */
	Y.throttle = function(fn, ms) {
		var isRunning = false;
		return function() {
			var args = Array.prototype.slice.call(arguments, 0);

			if ( isRunning ) {
				return false;
			}

			isRunning = true;

			setTimeout(function() {
				isRunning = false;

				fn.apply(null, args);
			}, ms || 50);
		};
	};

	Y.query = function(url, key) {

		if( !url || url.indexOf("?") == -1 ) {
			return;
		}

		var query = url.substring(url.indexOf("?") + 1),
			params = {};

		if( !!query ) {
			var i = 0,
				urls = query.split("&"),
				len = urls.length;

			for(; i<len; i++ ) {
				var param = urls[i].split("=");

				params[param[0]] = decodeURIComponent( param[1] );
			}
		}

		if( !!key ) {
			if( !!params[key] ) {
				return params[key];
			}
		}

		return params;
	};

	Y.cookie = function( cookieName, value, msToExpire, path, domain, secure ) {
		var args = Array.prototype.slice.call(arguments);

		if( typeof cookieName == "string" && args.length == 1 ) {
			return Y.getCookie( cookieName );
		}

		var expiryDate;

		if (msToExpire) {
			expiryDate = new Date();
			expiryDate.setTime(expiryDate.getTime() + msToExpire);
		}

		doc.cookie = cookieName + '=' + global.encodeURIComponent(value) +
			(msToExpire ? ';expires=' + expiryDate.toGMTString() : '') +
			';path=' + (path || '/') +
			(domain ? ';domain=' + domain : '') +
			(secure ? ';secure' : '');
	};

	Y.getCookie = function( cookieName ) {
		var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)'),
			cookieMatch = cookiePattern.exec(doc.cookie);

		return cookieMatch ? global.decodeURIComponent(cookieMatch[2]) : 0;
	};

	Y.each = function( val, callback ) {
		if( !val ) {
			return this;
		}

		var n,
			i = 0,
			length = val.length;

		if ( length === undefined ) {
			for( n in val ) {
				if( val.hasOwnProperty( n ) && callback.call( val[n], n, val[n] ) === false ) {
					break;
				}
			}
		} else {
			for( ; i < length; ) {
				if (callback.call( val[i], i, val[i++] ) === false ){
					break;
				}
			}
		}

		return val;
	};

	Y.extend = function( dest, source, over ) {
		var prop;

		if( this.isNothing( over ) ) {
			over = true;
		}

		if( dest && source && this.isObject( source ) ) {
			for( prop in source ) {
				if( this.objectHasProperty( source, prop ) ) {
					if( over ) {
						dest[prop] = source[prop];
					} else {
						if( typeof dest[prop] === "undefined" ) {
							dest[prop] = source[prop];
						}
					}
				}
			}
		}

		return dest;
	};

	Y.inArray = function( value, arr ) {
		if( typeof arr === 'object' ) {
			for( var i = 0, f = arr.length; i < f; ++i ) {
				if( arr[i] === value ) {
					return true;
				}
			}
		}

		return false;
	};

	Y.isBrowserObject = function( val ) {
		if( val === window || val === window.document ) {
			return true;
		}

		return this.isElement( val ) || this.isNode( val );
	};

	Y.isElement = function( val ) {
		return ( typeof window.HTMLElement === "object" ? val instanceof window.HTMLElement : typeof val === "object" && val.nodeType === 1 && typeof val.nodeName === "string" );
	};

	Y.isNode = function( val ) {
		return ( typeof window.Node === "object" ? val instanceof window.Node : typeof val === "object" && typeof val.nodeType === "number" && typeof val.nodeName === "string" );
	};

	Y.getOffset = function( axis ) {
		var axis = axis.toUpperCase();

		var pageOffset = "page" + axis + "Offset",
			scrollValue = "scroll" + axis,
			scrollDir = "scroll" + ( axis === "X" ? "Left" : "Top" );

		return window[pageOffset] || window[scrollValue] || (function () {
			var rootElem = document.documentElement || document.body.parentNode;
			return ( ( typeof rootElem[scrollDir] === "number" ) ? rootElem : document.body )[scrollDir];
		}());
	};

	Y.viewport = function() {
		if( document.compatMode == 'BackCompat' ) {
			return {
				width: doc.body.clientWidth,
				height: doc.body.clientHeight
			}
		} else {
			return {
				width: global.innerWidth || doc.documentElement.clientWidth,
				height: global.innerHeight || doc.documentElement.clientHeight
			}
		}
	};

	Y.support = (function (element) {
		var msPointer = navigator.msPointerEnabled && navigator.msMaxTouchPoints && !window.PointerEvent,
			pointer = (window.PointerEvent && navigator.pointerEnabled && navigator.maxTouchPoints) || msPointer,
			touch = pointer || 'ontouchstart' in window || ( window.DocumentTouch && document instanceof window.DocumentTouch );

		var support = {
				// touch: window.ontouchstart !== undefined || (window.DocumentTouch && document instanceof DocumentTouch)
				touch: touch,
				pointer: pointer
			},
			transitions = {
				webkitTransition: {
					end: 'webkitTransitionEnd',
					prefix: '-webkit-'
				},
				MozTransition: {
					end: 'transitionend',
					prefix: '-moz-'
				},
				OTransition: {
					end: 'otransitionend',
					prefix: '-o-'
				},
				transition: {
					end: 'transitionend',
					prefix: ''
				}
			},
			elementTests = function () {
				var transition = support.transition,
					prop,
					translateZ;
				document.body.appendChild(element);

				if (transition) {
					prop = transition.name.slice(0, -9) + 'ransform';
					if (element.style[prop] !== undefined) {
						element.style[prop] = 'translateZ(0)';
						translateZ = window.getComputedStyle(element)
							.getPropertyValue(transition.prefix + 'transform');
						support.transform = {
							prefix: transition.prefix,
							name: prop,
							translate: true,
							translateZ: !!translateZ && translateZ !== 'none'
						};
					}
				}

				if (element.style.backgroundSize !== undefined) {
					support.backgroundSize = {};
					element.style.backgroundSize = 'contain';
					support.backgroundSize.contain = window
							.getComputedStyle(element)
							.getPropertyValue('background-size') === 'contain';
					element.style.backgroundSize = 'cover';
					support.backgroundSize.cover = window
							.getComputedStyle(element)
							.getPropertyValue('background-size') === 'cover';
				}

				document.body.removeChild(element);
			};
		(function (support, transitions) {
			var prop;
			for (prop in transitions) {
				if (transitions.hasOwnProperty(prop) &&
						element.style[prop] !== undefined) {
					support.transition = transitions[prop];
					support.transition.name = prop;
					break;
				}
			}
		}(support, transitions));

		var isTransform3d = (function() {
			var prefix = ["transform", "msTransform", "WebkitTransform", "MozTransform", "OTransform", "KhtmlTransform"];
			var prop,
				left;

			var temp = document.createElement("div");

			while ( prop = prefix.shift() ) {
				if ( typeof temp.style[prop] !== "undefined" ) {
					temp.style.position = "absolute";

					document.documentElement.appendChild( temp );

					left = temp.getBoundingClientRect().left;

					temp.style[prop] = "translate3d(500px, 0px, 0px)";

					left = Math.abs( temp.getBoundingClientRect().left - left );

					if ( left > 100 && left < 900 ) {

						try {
							document.documentElement.removeChild(temp);
							temp = null;
						} catch (e) {}

						return true;
					}

					break;
				}
			}

			try {
				document.documentElement.removeChild(temp);
				temp = null;
			} catch (e) {}

			return false;
		})();

		support.transform3d = isTransform3d;

		if ( document.body ) {
			elementTests();
		} else {
			$(document).on('ready', elementTests);
		}

		return support;
	}(document.createElement('div')));

    Y.uniqueId = function( obj ) {
        obj._y_id = obj._y_id || ++Y.lastId;

        return obj._y_id;
    };

    Y.lastId = 0;

    var eventsKey = '_y_events';

    Y.bind = function (element, eventName, listener, context) {
        if( !element ) {
            return;
        }

        var eventNames = eventName.split(/\s+/);

        while (eventNames.length) {
            eventName = eventNames.shift();

            var _id = eventName + Y.uniqueId( listener ) + ( context ? '_' + Y.uniqueId( context ) : '' );

            if ( element[eventsKey] && element[eventsKey][_id] ) {
                return this;
            }

            var handler = function ( e ) {
                var e = e || window.event;

                e.preventDefault = e.preventDefault || function(e) {
                    return e.returnValue = false;
                };

                e.stopPropagation = e.stopPropagation || function(e) {
                    return e.cancelBubble = true;
                };

                return listener.call(context || element, e);
            };

            if (element.addEventListener) {
                element.addEventListener(eventName, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventName, handler);
            } else {
                element['on' + eventName] = handler;
            }

            element[eventsKey] = element[eventsKey] || {};
            element[eventsKey][_id] = handler;
        }

        return this;
    };

    Y.unbind = function (element, eventName, listener, context) {
        if( !element ) {
            return;
        }

        var eventNames = eventName.split(/\s+/);

        while (eventNames.length) {
            eventName = eventNames.shift();

            var _id = eventName + Y.uniqueId( listener ) + ( context ? '_' + Y.uniqueId( context ) : '' ),
                handler = element[eventsKey] && element[eventsKey][_id];

            if ( !handler ) {
                return this;
            }

            if (element.removeEventListener) {
                element.removeEventListener(eventName, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent('on' + eventName, handler);
            } else {
                element['on' + eventName] = null;
            }

            element[eventsKey][_id] = null;
        }

        return this;
    };

    Y.preventDefault = function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }

        return this;
    };

    Y.stopPropagation = function (e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }

        return this;
    };

    Y.stop = function (e) {
        return Y.preventDefault(e).stopPropagation(e);
    };

    Y.getMouseCoord = function( evt ) {
        var coord = {};

        coord.x = Y.getOffset('x');
        coord.y = Y.getOffset('y');

        if ( evt.touches ) {
            return {
                screenX: evt.touches[0] == undefined ? evt.touches.pageX - coord.x : evt.touches[0].pageX - coord.x,
                screenY: evt.touches[0] == undefined ? evt.touches.pageY - coord.y : evt.touches[0].pageY - coord.y
            }
        }

        return {
            screenX: evt.clientX == undefined ? evt.pageX - coord.x : evt.clientX,
            screenY: evt.clientY == undefined ? evt.pageY - coord.y : evt.clientY
        }
    };

	function expose() {
		var oldY = window.Y;

		Y.noConflict = function () {
			global.Y = oldY;
			return this;
		};

		global.Y = Y;
	}

	if ( typeof module === 'object' && typeof module.exports === 'object' ) {
		module.exports = Y;

	} else if ( typeof define === 'function' && define.amd ) {
		define(Y);

	} else {
		expose();
	}

})(this || window, document);


(function(Y, window, document, undefined ) {
	var Browser = (function() {
		var ua = navigator.userAgent.toLowerCase(),

			opera = window.opera && window.opera.buildNumber,

			ie = !opera && 'ActiveXObject' in window,

			webkit = ua.indexOf('webkit') !== -1,

			ieVersion = /msie\s(\d+)/.exec( ua ),

			ios = /ip(?:hone|ad|od;(?: u;)? cpu) os (\d+)/.exec( ua ),

			safari = /version\/(\d+)[.\d]+\s+safari/.exec( ua ),

			msPointer = navigator.msPointerEnabled && navigator.msMaxTouchPoints && !window.PointerEvent,

			pointer = (window.PointerEvent && navigator.pointerEnabled && navigator.maxTouchPoints) || msPointer,

			touch = pointer || 'ontouchstart' in window || ( window.DocumentTouch && document instanceof window.DocumentTouch );


		if( ie && !ieVersion ) {
			ieVersion = /trident\/.*; rv:(\d+)/.exec( ua );
		}

		var isMobile = function() {
			if ( Y.hasPointerEvent && navigator.msMaxTouchPoints > 1 ) {
				return true;
			}

			var os = [ "android", "webos", "iphone", "ipad", "blackberry", "kfsowi" ];

			for ( var p in os ) {
				if ( String(navigator.userAgent).toLowerCase().indexOf( String( os[p] ).toLowerCase() ) != -1 ) {
					return true;
				}
			}

			return false;
		}();

		var retina = 'devicePixelRatio' in window && window.devicePixelRatio > 1;

		if (!retina && 'matchMedia' in window) {
			var matches = window.matchMedia('(min-resolution:144dpi)');

			retina = matches && matches.matches;
		}

		var boxModel = (function() {
			return window.document.compatMode !== "BackCompat";
		})();

		return {
			opera: opera,

			ie: !!ie && ieVersion[1],

			webkit: webkit,

			safari: !!safari && safari[1],

			ios: !!ios && ios[1],

			mobile: isMobile,

			touch: !!touch,

			msPointer: !!msPointer,

			pointer: !!pointer,

			retina: !!retina,

			boxModel: !!boxModel
		}
	})();

	Y.browser = Browser;
})(Y, this || window, document);


(function(Y, window, document, undefined ) {
	var _camelCase = function( str ) {
		return str ? str.replace(/-(\w)/g, function (_, $1) {
			return $1.toUpperCase();
		}) : str;
	};

	Y.setOpacity = function( element, value ) {
		if( !element ) {
			return;
		}

		var val = 1;

		if (!isNaN(Number(value))){
			if      (value <= 0) {   val = 0;           }
			else if (value <= 1) {   val = value;       }
			else if (value <= 100) { val = value / 100; }
			else {                   val = 1;           }
		}

		if ('opacity' in element.style) {
			element.style.opacity = val;
		} else if ( 'filter' in element.style ) {

			var filter = false,
				filterName = 'DXImageTransform.Microsoft.Alpha';

			try {
				filter = element.filters.item(filterName);
			} catch (e) {
				if (val === 1) { return; }
			}

			val = Math.round(val * 100);

			if (filter) {
				filter.Enabled = (val !== 100);
				filter.Opacity = val;
			} else {
				element.style.filter += ' progid:' + filterName + '(opacity=' + val + ')';
			}
		}
	};

	Y.getStyle = function( element, prop ) {
		if( !element ) {
			return;
		}
	};

	Y.setStyle = function( element, prop, val ) {
		if( !element ) {
			return;
		}

		var p, styles = {};

		if( typeof prop === 'string' && !!val ) {

			styles[prop] = val;
		}

		if( typeof prop === 'object' ) {
			styles = prop;
		}

		for( p in styles ) {
			var name = _camelCase( p );
			var value = styles[p];

			if( styles.hasOwnProperty( p ) ) {
				if( name === 'opacity' ) {
					Y.setOpacity( element, value );
					continue;
				}

				if( name === 'float' ) {
					element.style.styleFloat = element.style.cssFloat = value;
					continue;
				}

				element.style[name] = value;
			}
		}

	};
})(Y, this || window, document);

(function(Y, global, document, undefined ) {
	var time = Date.now || function() {
		return +new Date();
	};

	var desiredFrames = 60;

	var millisecondsPerSecond = 1000;

	var running = {};

	var counter = 1;

	Y.Animation = {

		/**
		 * A requestAnimationFrame polyfill.
		 *
		 */
		requestAnimationFrame: (function() {

			// 检查是否支持requestAnimationFrame
			var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
			var isNative = !!requestFrame;

			if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
				isNative = false;
			}

			if (isNative) {
				return function(callback, root) {
					requestFrame(callback);
				};
			}

			var TARGET_FPS = 60;
			var requests = {};
			var requestCount = 0;
			var rafHandle = 1;
			var intervalHandle = null;
			var lastActive = +new Date();

			return function(callback, root) {
				var callbackHandle = rafHandle++;

				// 缓存callback
				requests[callbackHandle] = callback;
				requestCount++;

				if ( intervalHandle === null ) {

					intervalHandle = setInterval(function() {

						var time = +new Date();

						var currentRequests = requests;

						// 重置缓存
						requests = {};

						requestCount = 0;

						for( var key in currentRequests ) {
							if (currentRequests.hasOwnProperty(key)) {
								currentRequests[key](time);
								lastActive = time;
							}
						}

						// 超时处理
						if ( time - lastActive > 2500 ) {
							clearInterval(intervalHandle);
							intervalHandle = null;
						}

					}, 1000 / TARGET_FPS);
				}

				return callbackHandle;
			};

		})(),


		/**
		 * 根据动画唯一的ID使动画停止执行
		 *
		 */
		stop: function( id ) {
			var cleared = running[id] != null;

			if (cleared) {
				running[id] = null;
			}

			return cleared;
		},


		/**
		 * 根据动画唯一的ID判断是否动画仍在执行
		 *
		 */
		isRunning: function( id ) {
			return running[id] != null;
		},


		/**
		 * 启动动画
		 *
		 */
		start: function( stepCallback, verifyCallback, completedCallback, duration, easingMethod ) {

			var start = time();
			var lastFrame = start;
			var percent = 0;
			var dropCounter = 0;
			var id = counter++;

			// 优化动画执行
			if ( id % 20 === 0 ) {
				var newRunning = {};

				for (var usedId in running) {
					newRunning[usedId] = true;
				}

				running = newRunning;
			}

			var step = function( virtual ) {

				// 丢帧补帧，保持动画执行的流畅性
				var render = virtual !== true;

				// 获取当前时间戳
				var now = time();

				// 下一个动画执行之前进行验证
				if ( !running[id] || (verifyCallback && !verifyCallback(id)) ) {

					running[id] = null;

					completedCallback && completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, false);

					return;

				}

				// 在内存中更新丢掉的动画帧
				if ( render ) {
					var droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;

					for (var j = 0; j < Math.min(droppedFrames, 4); j++) {
						step( true );

						dropCounter++;
					}

				}

				// 计算百分比
				if (duration) {
					percent = (now - start) / duration;

					if (percent > 1) {
						percent = 1;
					}
				}

				// 执行步骤Callback
				var value = easingMethod ? easingMethod(percent) : percent;
				if ( (stepCallback(value, now, render) === false || percent === 1) && render ) {
					running[id] = null;

					completedCallback && completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, percent === 1 || duration == null);
				} else if (render) {
					lastFrame = now;

					Y.Animation.requestAnimationFrame( step );
				}
			};

			// 设置状态运行中
			running[id] = true;

			// 在chrome中webkitRequestAnimationFrame第一次返回的是0
			Y.Animation.requestAnimationFrame(step);

			// 返回唯一的动画ID
			return id;
		}
	};
})(Y, this || window, document);

(function(Y, window, document, undefined) {
	Y.Effect = function( easingFn ) {
		var easing = function( p ) {
			var percent = easingFn( p );

			return percent;
		};

		return easing;
	};

	Y.Effect.linear = Y.Effect(function(t) {
		return t;
	});

	Y.Effect.easeInSine = Y.Effect(function(t) {
		return (t == 1) ? 1 : -Math.cos(t * (Math.PI / 2)) + 1;
	});

	Y.Effect.easeOutSine = Y.Effect(function(t) {
		return Math.sin(t * (Math.PI / 2));
	});

	Y.Effect.easeInOutSine = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeInSine(0, 1)(2 * t) * 0.5 : Y.Effect.easeOutSine(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeOutInSine = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeOutSine(0, 1)(2 * t) * 0.5 : Y.Effect.easeInSine(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeInQuad = Y.Effect(function(t) {
		return t * t;
	});

	Y.Effect.easeOutQuad = Y.Effect(function(t) {
		return -(t * (t - 2));
	});

	Y.Effect.easeInOutQuad = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeInQuad(0, 1)(2 * t) * 0.5 : Y.Effect.easeOutQuad(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeOutInQuad = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeOutQuad(0, 1)(2 * t) * 0.5 : Y.Effect.easeInQuad(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});


	Y.Effect.easeInCubic = Y.Effect(function(t) {
		return Math.pow(t, 3);
	});

	Y.Effect.easeOutCubic = Y.Effect(function(t) {
		return Math.pow((t - 1), 3) + 1;
	});

	Y.Effect.easeInOutCubic = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeIn(0, 1)(2 * t) * 0.5 : Y.Effect.easeOut(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeOutInCubic = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeOut(0, 1)(2 * t) * 0.5 : Y.Effect.easeIn(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeInQuart = Y.Effect(function(t) {
		return Math.pow(t, 4);
	});

	Y.Effect.easeOutQuart = Y.Effect(function(t) {
		return -(Math.pow(t - 1, 4) - 1);
	});

	Y.Effect.easeInOutQuart = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeInQuart(0, 1)(2 * t) * 0.5 : Y.Effect.easeOutQuart(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeOutInQuart = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeOutQuart(0, 1)(2 * t) * 0.5 : Y.Effect.easeInQuart(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeInQuint = Y.Effect(function(t) {
		return Math.pow(t, 5);
	});

	Y.Effect.easeOutQuint = Y.Effect(function(t) {
		return Math.pow(t - 1, 5) + 1;
	});

	Y.Effect.easeInOutQuint = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeInQuint(0, 1)(2 * t) * 0.5 : Y.Effect.easeOutQuint(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeOutInQuint = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeOutQuint(0, 1)(2 * t) * 0.5 : Y.Effect.easeInQuint(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});


	Y.Effect.easeInCircle = Y.Effect(function(t) {
		return -(Math.sqrt(1 - (t * t)) - 1);
	});

	Y.Effect.easeOutCircle = Y.Effect(function(t) {
		return Math.sqrt(1 - (t - 1) * (t - 1));
	});

	Y.Effect.easeInOutCircle = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeInCircle(0, 1)(2 * t) * 0.5 : Y.Effect.easeOutCircle(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeOutInCircle = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeOutCircle(0, 1)(2 * t) * 0.5 : Y.Effect.easeInCircle(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeInBack = Y.Effect(function(t) {
		var n = 1.70158;
		return (t == 1) ? 1 : (t / 1) * (t / 1) * ((1 + n) * t - n);
	});

	Y.Effect.easeOutBack = Y.Effect(function(t) {
		var n = 1.70158;
		return (t === 0) ? 0 : (t = t / 1 - 1) * t * ((n + 1) * t + n) + 1;
	});

	Y.Effect.easeInOutBack = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeInBack(0, 1)(2 * t) * 0.5 : Y.Effect.easeOutBack(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});


	Y.Effect.easeInElastic = Y.Effect(function(t) {
		var p = 0, a = 0, n;
		if (t === 0) {
			return 0;
		}
		if ((t/=1) == 1) {
			return 1;
		}
		if (!p) {
			p = 0.3;
		}
		if (!a || a < 1) {
			a = 1; n = p / 4;
		} else {
			n = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - 1) * (2 * Math.PI) / p));
	});

	Y.Effect.easeOutElastic = Y.Effect(function(t) {
		var p = 0, a = 0, n;
		if (t === 0) {
			return 0;
		}
		if ((t/=1) == 1) {
			return 1;
		}
		if (!p) {
			p = 0.3;
		}
		if (!a || a < 1) {
			a = 1; n = p / 4;
		} else {
			n = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		return (a * Math.pow(2, -10 * t) * Math.sin((t - n) * (2 * Math.PI) / p ) + 1);
	});

	Y.Effect.easeInOutElastic = Y.Effect(function(t) {
		var p = 0, a = 0, n;
		if (t === 0) {
			return 0;
		}
		if ((t/=1/2) == 2) {
			return 1;
		}
		if (!p) {
			p = (0.3 * 1.5);
		}
		if (!a || a < 1) {
			a = 1; n = p / 4;
		} else {
			n = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin( (t - n) * (2 * Math.PI) / p ));
		}
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin( (t - n) * (2 * Math.PI) / p ) * 0.5 + 1;
	});

	Y.Effect.easeOutBounce = Y.Effect(function(t) {
		if (t < (1 / 2.75)) {
			return (7.5625 * t * t);
		} else if (t < (2 / 2.75)) {
			return (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
		} else if (t < (2.5 / 2.75)) {
			return (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
		} else {
			return (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
		}
	});


	Y.Effect.easeInBounce = Y.Effect(function(t) {
		return 1 - Y.Effect.easeOutBounce(0, 1)(1 - t);
	});


	Y.Effect.easeInOutBounce = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeInBounce(0, 1)(2 * t) * 0.5 : Y.Effect.easeOutBounce(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});


	Y.Effect.easeInExpo = Y.Effect(function(t) {
		return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
	});

	Y.Effect.easeOutExpo = Y.Effect(function(t) {
		return (t == 1) ? 1 : -Math.pow(2, -10 * t / 1) + 1;
	});

	Y.Effect.easeInOutExpo = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeInExpo(0, 1)(2 * t) * 0.5 : Y.Effect.easeOutExpo(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.easeOutInExpo = Y.Effect(function(t) {
		return (t < 0.5) ? Y.Effect.easeOutExpo(0, 1)(2 * t) * 0.5 : Y.Effect.easeInExpo(0, 1)((2 * t) - 1) * 0.5 + 0.5;
	});

	Y.Effect.overphase = Y.Effect(function(t){
		t /= 0.652785;
		return (Math.sqrt((2 - t) * t) + (0.1 * t)).toFixed(5);
	});

	Y.Effect.sinusoidal = Y.Effect(function(t) {
		return (-Math.cos(t * Math.PI) / 2) + 0.5;
	});

	/**
	 * Cubic-Bezier curve
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @see http://www.netzgesta.de/dev/cubic-bezier-timing-function.html
	 */
	Y.Effect._cubicBezier = function( x1, y1, x2, y2 ){
		return function( t ){
			var cx = 3.0 * x1,
				bx = 3.0 * (x2 - x1) - cx,
				ax = 1.0 - cx - bx,
				cy = 3.0 * y1,
				by = 3.0 * (y2 - y1) - cy,
				ay = 1.0 - cy - by;

			function sampleCurveX(t) {
				return ((ax * t + bx) * t + cx) * t;
			}

			function sampleCurveY(t) {
				return ((ay * t + by) * t + cy) * t;
			}

			function sampleCurveDerivativeX(t) {
				return (3.0 * ax * t + 2.0 * bx) * t + cx;
			}

			function solveCurveX(x,epsilon) {
				var t0, t1, t2, x2, d2, i;
				for (t2 = x, i = 0; i<8; i++) {
					x2 = sampleCurveX(t2) - x;
					if (Math.abs(x2) < epsilon) {
						return t2;
					}
					d2 = sampleCurveDerivativeX(t2);
					if(Math.abs(d2) < 1e-6) {
						break;
					}
					t2 = t2 - x2 / d2;
				}
				t0 = 0.0;
				t1 = 1.0;
				t2 = x;
				if (t2 < t0) {
					return t0;
				}
				if (t2 > t1) {
					return t1;
				}
				while (t0 < t1) {
					x2 = sampleCurveX(t2);
					if (Math.abs(x2 - x) < epsilon) {
						return t2;
					}
					if (x > x2) {
						t0 = t2;
					} else {
						t1 = t2;
					}
					t2 = (t1 - t0) * 0.5 + t0;
				}
				return t2;
			}

			return sampleCurveY( solveCurveX(t, 1 / 200) );
		};
	};

	Y.Effect.cubicBezier = function( x1, y1, x2, y2 ){
		return Y.Effect( Y.Effect._cubicBezier( x1, y1, x2, y2 ) );
	};

	Y.Effect.getCustomCubicBezier = function ( value ) {
		var match, x1, y1, x2, y2;

		// cubic-bezier(x1, y1, x2, y2)
		match = value.match(/cubic-bezier\(\s*(.*?),\s*(.*?),\s*(.*?),\s*(.*?)\)/);

		if ( !match ) {
			return;
		}

		// Parse numbers
		x1 = !isNaN(parseFloat(match[1])) ? parseFloat(match[1]) : 0,
		y1 = !isNaN(parseFloat(match[2])) ? parseFloat(match[2]) : 0,
		x2 = !isNaN(parseFloat(match[3])) ? parseFloat(match[3]) : 1,
		y2 = !isNaN(parseFloat(match[4])) ? parseFloat(match[4]) : 1;

		return Y.Effect.cubicBezier( x1, y1, x2, y2 );
	};

	Y.Effect.cubicEase = Y.Effect.cubicBezier(0.25, 0.1, 0.25, 1);

	Y.Effect.cubicEaseIn = Y.Effect.cubicBezier(0.42, 0, 1, 1);

	Y.Effect.cubicEaseOut = Y.Effect.cubicBezier(0, 0, 0.58, 1);

	Y.Effect.cubicEaseInOut = Y.Effect.cubicBezier(0.42, 0, 0.58, 1);

	Y.Effect.cubicEaseOutIn = Y.Effect.cubicBezier(0, 0.42, 1, 0.58);

	Y.Effect.cubicEaseInBack = Y.Effect.cubicBezier(0.86, 0, 0.07, 1);

	Y.Effect.cubicEaseSnap = Y.Effect.cubicBezier(0, 1, 0.5, 1);

	Y.Effect.easeIn = Y.Effect.easeInCubic;

	Y.Effect.easeOut = Y.Effect.easeOutCubic;

	Y.Effect.easeInOut = Y.Effect.easeInOutCubic;

	Y.Effect.easeOutIn = Y.Effect.easeOutInCubic;

	Y.Effect.bounce = Y.Effect.easeOutBounce;

	Y.Effect.elastic = Y.Effect.easeInElastic;

})(Y, this || window, document);

(function(Y, window, document, undefined) {
  var lastTime = 0,
    vendors = ['ms', 'moz', 'webkit', 'o'],
    _requestFrame = !window.requestAnimationFrame ? window.requestAnimationFrame : null,
    _cancelFrame = !window.cancelAnimationFrame ? window.cancelAnimationFrame : null;

  for(var x = 0; x < vendors.length && typeof requestAnimationFrame != 'undefined'; ++x) {
    _requestFrame = window[vendors[x]+'RequestAnimationFrame'];
    _cancelFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!_requestFrame) {
    _requestFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!_cancelFrame) {
    _cancelFrame = function(id) {
      clearTimeout(id);
    };
  }

  var requestAnimFrame = function(callback, node) {
    return _requestFrame(callback, node);
  };

  var cancelAnimFrame = function(inId) {
    return _cancelFrame(inId);
  };

  var easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
  };

  var animatedScrollTo = function (element, to, duration, callback) {
    var start = element.scrollTop,
    change = to - start,
    animationStart = +new Date();
    var animating = true;
    var lastpos = null;

    var animateScroll = function() {
      if (!animating) {
        return;
      }
      requestAnimFrame(animateScroll);
      var now = +new Date();
      var val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration));
      if (lastpos) {
        if (lastpos === element.scrollTop) {
          lastpos = val;
          element.scrollTop = val;
        } else {
          animating = false;
        }
      } else {
        lastpos = val;
        element.scrollTop = val;
      }
      if (now > animationStart + duration) {
        element.scrollTop = to;
        animating = false;
        if (callback) { callback(); }
      }
    };
    requestAnimFrame(animateScroll);
  };

  Y.animatedScrollTo = animatedScrollTo;
})(Y, this || window, document);