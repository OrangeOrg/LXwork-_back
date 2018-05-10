/******/
(function(modules) { // webpackBootstrap
	/******/ // The module cache
	/******/
	var installedModules = {};
	/******/
	/******/ // The require function
	/******/
	function __webpack_require__(moduleId) {
		/******/
		/******/ // Check if module is in cache
		/******/
		if(installedModules[moduleId]) {
			/******/
			return installedModules[moduleId].exports;
			/******/
		}
		/******/ // Create a new module (and put it into the cache)
		/******/
		var module = installedModules[moduleId] = {
			/******/
			i: moduleId,
			/******/
			l: false,
			/******/
			exports: {}
			/******/
		};
		/******/
		/******/ // Execute the module function
		/******/
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
		/******/
		/******/ // Flag the module as loaded
		/******/
		module.l = true;
		/******/
		/******/ // Return the exports of the module
		/******/
		return module.exports;
		/******/
	}
	/******/
	/******/
	/******/ // expose the modules object (__webpack_modules__)
	/******/
	__webpack_require__.m = modules;
	/******/
	/******/ // expose the module cache
	/******/
	__webpack_require__.c = installedModules;
	/******/
	/******/ // define getter function for harmony exports
	/******/
	__webpack_require__.d = function(exports, name, getter) {
		/******/
		if(!__webpack_require__.o(exports, name)) {
			/******/
			Object.defineProperty(exports, name, {
				/******/
				configurable: false,
				/******/
				enumerable: true,
				/******/
				get: getter
				/******/
			});
			/******/
		}
		/******/
	};
	/******/
	/******/ // getDefaultExport function for compatibility with non-harmony modules
	/******/
	__webpack_require__.n = function(module) {
		/******/
		var getter = module && module.__esModule ?
			/******/
			function getDefault() {
				return module['default'];
			} :
			/******/
			function getModuleExports() {
				return module;
			};
		/******/
		__webpack_require__.d(getter, 'a', getter);
		/******/
		return getter;
		/******/
	};
	/******/
	/******/ // Object.prototype.hasOwnProperty.call
	/******/
	__webpack_require__.o = function(object, property) {
		return Object.prototype.hasOwnProperty.call(object, property);
	};
	/******/
	/******/ // __webpack_public_path__
	/******/
	__webpack_require__.p = "./";
	/******/
	/******/ // Load entry module and return exports
	/******/
	return __webpack_require__(__webpack_require__.s = 0);
	/******/
})
/************************************************************************/
/******/
([
	/* 0 */
	/***/
	(function(module, __webpack_exports__, __webpack_require__) {

		"use strict";
		Object.defineProperty(__webpack_exports__, "__esModule", {
			value: true
		});
		/* harmony import */
		var __WEBPACK_IMPORTED_MODULE_0__popup__ = __webpack_require__(1);
		/* harmony import */
		var __WEBPACK_IMPORTED_MODULE_1__style_popup_less__ = __webpack_require__(3);
		/* harmony import */
		var __WEBPACK_IMPORTED_MODULE_1__style_popup_less___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__style_popup_less__);
		/* harmony import */
		var __WEBPACK_IMPORTED_MODULE_2__style_animate_css__ = __webpack_require__(4);
		/* harmony import */
		var __WEBPACK_IMPORTED_MODULE_2__style_animate_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__style_animate_css__);
		/* harmony import */
		var __WEBPACK_IMPORTED_MODULE_3__style_index_less__ = __webpack_require__(5);
		/* harmony import */
		var __WEBPACK_IMPORTED_MODULE_3__style_index_less___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__style_index_less__);

		window.popup = __WEBPACK_IMPORTED_MODULE_0__popup__["a" /* default */ ];

		/***/
	}),
	/* 1 */
	/***/
	(function(module, __webpack_exports__, __webpack_require__) {

		"use strict";
		/* harmony export (immutable) */
		__webpack_exports__["a"] = popup;
		/* harmony import */
		var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(2);
		var _createClass = function() {
			function defineProperties(target, props) {
				for(var i = 0; i < props.length; i++) {
					var descriptor = props[i];
					descriptor.enumerable = descriptor.enumerable || false;
					descriptor.configurable = true;
					if("value" in descriptor) descriptor.writable = true;
					Object.defineProperty(target, descriptor.key, descriptor);
				}
			}
			return function(Constructor, protoProps, staticProps) {
				if(protoProps) defineProperties(Constructor.prototype, protoProps);
				if(staticProps) defineProperties(Constructor, staticProps);
				return Constructor;
			};
		}();

		var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
			return typeof obj;
		} : function(obj) {
			return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		};

		function _classCallCheck(instance, Constructor) {
			if(!(instance instanceof Constructor)) {
				throw new TypeError("Cannot call a class as a function");
			}
		}

		function popup(option) {
			var config = {
				title: '',
				footer: '',
				content: '',
				width: 280,
				height: 220,
				titleBtns: false,
				contentTable: {},
				dragable: false,
				isDialog: false,
				className: ''
			};

			if((typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object') {
				config = Object.assign(config, option);
			}

			function createDiv(className) {
				return $('<div class="' + className + '"></div>');
			}

			var Popup = function() {
				function Popup() {
					_classCallCheck(this, Popup);

					this._dom = {};
					this.init();
				}

				_createClass(Popup, [{
					key: 'init',
					value: function init() {
						var _this = this;

						this.createMain().appendTo('body');
						if(config.dragable === true) {
							this.drag();
						}
						this._dom.close.click(function() {
							_this.hide();
						});
					}
				}, {
					key: 'createMain',
					value: function createMain() {
						function translateToDom(content) {
							return $(content).length ? $(content) : content;
						}

						function filterEmptyDom() {
							var ret = document.createDocumentFragment(),
								args = Array.prototype.slice.call(arguments);
							args.forEach(function(v) {
								if(v.text()) {
									ret.appendChild(v[0]);
								}
							});
							return ret;
						}
						this._dom.title = createDiv('l-popup-title clearfix').append(translateToDom(config.title));
						this._dom.content = createDiv('l-popup-content').append(translateToDom(config.content));
						this._dom.footer = createDiv('l-popup-footer').append(translateToDom(config.footer));
						this._dom.close = createDiv('l-popup-close').text('×');
						if(Array.isArray(config.titleBtns)) {
							var btns = config.titleBtns.map(function(v) {
								return '<a class="bu bu-default">' + v.label + '</a>';
							});
							this._dom.title.append($('<div class="l-btns">' + btns.join('') + '</div>')).find('a').on('click', function() {
								config.titleBtns[$(this).index()].callback();
							});
						}
						if(config.contentTable && config.contentTable.name && config.contentTable.value) {
							var tableWrapper = $('<table class="l-popup-table"><tbody></tbody></table>'),
								trs = config.contentTable.name.map(function(v, i) {
									return '<tr><td>' + v + '</td><td>' + config.contentTable.value[i] + '</td></tr>';
								});
							this._dom.content.append(tableWrapper.append(trs.join('')));
						}

						this._dom.wrapper = createDiv('l-popup animated bounceIn' + (config.isDialog ? ' l-dialog' : '')).append(filterEmptyDom(this._dom.title, this._dom.content, this._dom.footer), this._dom.close);
						this.setSize({
							width: config.width,
							height: config.height
						});
						this.setPosition(config);
						this.addClass(config.className);
						return this._dom.wrapper;
					}
				}, {
					key: 'setSize',
					value: function setSize(_ref) {
						var width = _ref.width,
							height = _ref.height;

						this._dom.wrapper.css({
							width: width,
							height: height
						});
					}
				}, {
					key: 'setPosition',
					value: function setPosition(option) {
						var _position = {};
						if(option == null) {
							this._dom.wrapper.css({
								left: '50%',
								top: '50%',
								'margin-top': -config.height / 2,
								'margin-left': -config.width / 2
							});
							return this;
						}
						Object.keys(option).forEach(function(v) {
							if(['top', 'left', 'bottom', 'right'].indexOf(v) > -1) {
								_position[v] = option[v];
							}
						});
						this._dom.wrapper.css(_position);
						return this;
					}
				}, {
					key: 'addClass',
					value: function addClass(cla) {
						this._dom.wrapper.addClass(cla);
					}
				}, {
					key: 'close',
					value: function close() {
						this._dom.wrapper.remove();
					}
				}, {
					key: 'hide',
					value: function hide() {
						this._dom.wrapper.hide();
					}
				}, {
					key: 'show',
					value: function show() {
						this._dom.wrapper.show();
					}
				}, {
					key: 'change',
					value: function change(option) {
						if((typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object') {
							config = Object.assign(config, option);
							this.close();
							this.init();
						}
					}
				}, {
					key: 'changeContentTable',
					value: function changeContentTable(ContentTableObj) {
						if(ContentTableObj && ContentTableObj.name && ContentTableObj.value) {
							var trs= ContentTableObj.name.map(function(v, i) {
									return '<tr><td>' + v + '</td><td>' + ContentTableObj.value[i] + '</td></tr>';
								});
							
							
							var Tableinner = '<tbody>'+trs+'</tbody>';
							
							$($('.l-popup-table').get(0)).html(Tableinner)
						}
					}
				}, {
					key: 'drag',
					value: function drag() {
						if(config.title || Array.isArray(config.titleBtns)) {
							Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* drag */ ])(this._dom.wrapper[0], this._dom.title[0]);
						}
					}
				}]);

				return Popup;
			}();

			return new Popup(config);
		}

		/***/
	}),
	/* 2 */
	/***/
	(function(module, __webpack_exports__, __webpack_require__) {

		"use strict";
		/* unused harmony export throttle */
		/* harmony export (immutable) */
		__webpack_exports__["a"] = drag;

		function throttle(func, wait, options) {
			var context, args, result;
			var timeout = null;
			var previous = 0;
			if(!options) options = {};
			// 进入这个函数后说明是在remaining时间之后了，可直接执行函数，刷新previous,释放内存
			var later = function later() {
				previous = options.leading === false ? 0 : +new Date();
				timeout = null;
				result = func.apply(context, args);
				if(!timeout) context = args = null;
			};
			return function() {
				var now = +new Date();
				if(!previous && options.leading === false) previous = now;
				var remaining = wait - (now - previous);
				context = this;
				args = arguments;
				// 首次执行走第一个条件 ,(超过wait时间内也进入这个条件，高频率执行的时候，setTimeout还在队形中,应该把它清除并重新执行action)
				if(remaining <= 0 || remaining > wait) {
					// 首次执行将不进入这个条件
					if(timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					previous = now;
					result = func.apply(context, args);
					if(!timeout) context = args = null;
					// 第二次执行并且在wait时间内进入这个条件，高频率执行的时候会不断刷新这个remaining变量直到执行
				} else if(!timeout && options.trailing !== false) {
					timeout = setTimeout(later, remaining);
				}
				return result;
			};
		}

		function drag(obj, origin) {
			obj.style.position = 'fixed';

			function fixEvent(event) {
				event.target = event.srcElement;
				event.preventDefault = fixEvent.preventDefault;
				return event;
			}
			fixEvent.preventDefault = function() {
				this.returnValue = false;
			};
			obj.onmousedown = mousedown;

			function mousedown(ev) {
				var e = ev || fixEvent(window.event);
				var disX = e.clientX - obj.offsetLeft;
				var disY = e.clientY - obj.offsetTop;
				if(e.target == (origin || obj)) {
					// 节流
					document.onmousemove = throttle(move, 10);
					document.onmouseup = up;
				} else {
					document.onmousemove = null;
					document.onmouseup = null;
				}

				function move(ev) {
					var e = ev || fixEvent(window.event);
					var left = e.clientX - disX;
					var top = e.clientY - disY;
					if(obj.setCapture) {
						obj.setCapture();
					}
					if(left < 0) {
						left = 0;
					} else if(left > document.documentElement.clientWidth - obj.offsetWidth) {
						left = document.documentElement.clientWidth - obj.offsetWidth;
					}
					if(top < 0) {
						top = 0;
					} else if(top > document.documentElement.clientHeight - obj.offsetHeight) {
						top = document.documentElement.clientHeight - obj.offsetHeight;
					}
					obj.style.left = left + 'px';
					obj.style.top = top + 'px';
					return false;
				}

				function up() {
					if(obj.releaseCapture) {
						obj.releaseCapture();
					}
					document.onmousemove = null;
					document.onmouseup = null;
				}
			}
		}

		/***/
	}),
	/* 3 */
	/***/
	(function(module, exports) {

		// removed by extract-text-webpack-plugin

		/***/
	}),
	/* 4 */
	/***/
	(function(module, exports) {

		// removed by extract-text-webpack-plugin

		/***/
	}),
	/* 5 */
	/***/
	(function(module, exports) {

		// removed by extract-text-webpack-plugin

		/***/
	})
	/******/
]);