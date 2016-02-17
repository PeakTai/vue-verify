/*!
 * vue-verify 0.5.0
 * build in February 17th 2016, 14:17:13
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["vueVerify"] = factory();
	else
		root["vueVerify"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by peak on 15/11/14.
	 */
	exports.install = function (Vue, options) {

	    options = options || {}
	    var buildInMethods = Vue.util.extend(__webpack_require__(1), processMethod(options.methods))

	    Vue.prototype.$verify = function (rules) {
	        var vm = this
	        var verifier = vm.$options.verifier || {}
	        var methods = Vue.util.extend(processMethod(verifier.methods), buildInMethods)
	        var namespace = verifier.namespace || options.namespace || "verify"

	        vm.$set(namespace + ".$dirty", false)
	        vm.$set(namespace + ".$valid", false)
	        vm.$set(namespace + ".$rules", rules)

	        Object.keys(rules).forEach(function (modelPath) {
	            vm.$set(getVerifyModelPath(modelPath) + ".$dirty", false)
	            verify(modelPath, vm.$get(modelPath))
	        })

	        Object.keys(rules).forEach(function (modelPath) {
	            vm.$watch(modelPath, function (val) {
	                vm.$set(getVerifyModelPath(modelPath) + ".$dirty", true)
	                vm.$set(namespace + ".$dirty", true)
	                verify(modelPath, val)
	            })
	        })


	        function getVerifyModelPath(modelPath) {
	            return namespace + "." + modelPath
	        }

	        function verify(modelPath, val) {
	            var ruleMap = rules[modelPath]

	            if (!ruleMap.required && !methods.required.fn(val)) {
	                //if model not required and value is blank,make it valid
	                Object.keys(ruleMap).forEach(function (rule) {
	                    if (methods.hasOwnProperty(rule)) {
	                        update(modelPath, rule, false)
	                    }
	                })
	                return
	            }

	            var ruleMapClone = Vue.util.extend({}, ruleMap)
	            var keys = Object.keys(ruleMapClone).sort(function (a, b) {
	                var m1 = methods[a]
	                var m2 = methods[b]
	                var p1 = m1 ? m1.priority : 100
	                var p2 = m2 ? m2.priority : 100
	                return p1 - p2
	            })

	            stepVerify(modelPath, ruleMapClone, keys, 0, val)
	        }

	        function stepVerify(modelPath, ruleMap, keys, index, val) {
	            if (index >= keys.length) {
	                return
	            }
	            var rule = keys[index]
	            if (!rule) {
	                return
	            }
	            if (!methods.hasOwnProperty(rule)) {
	                console.warn("can not find verify method of rule \"" + rule + "\"")
	                return
	            }
	            var arg = ruleMap[rule]
	            var verifyFn = methods[rule].fn
	            var result = verifyFn.call(vm, val, arg)

	            if (typeof result === "boolean") {
	                update(modelPath, rule, !result)
	                if (result) {
	                    stepVerify(modelPath, ruleMap, keys, index + 1, val)
	                }
	                return
	            }
	            //promise
	            else if (result instanceof Function) {
	                var Promise = __webpack_require__(2)
	                new Promise(result).then(function () {
	                    update(modelPath, rule, false)
	                    stepVerify(modelPath, ruleMap, keys, index + 1, val)
	                }, function (reason) {
	                    update(modelPath, rule, true)
	                })
	            } else {
	                throw "unsupported returned value of the verify method \"" + rule + "\""
	            }

	        }

	        function update(modelPath, rule, inValid) {
	            var verifyModelPath = getVerifyModelPath(modelPath)
	            vm.$set(verifyModelPath + "." + rule, inValid)

	            var verifyModel = vm.$get(verifyModelPath), modelValid = true
	            Object.keys(verifyModel).forEach(function (prop) {
	                //ignore $dirty and $valid
	                if ("$dirty" === prop || "$valid" === prop) {
	                    return
	                }
	                //keep only one rule has invalid flag
	                if (!modelValid) {
	                    vm.$set(verifyModelPath + "." + prop, false)
	                } else if (verifyModel[prop]) {
	                    modelValid = false
	                }
	            })

	            vm.$set(verifyModelPath + ".$valid", modelValid)

	            //verify.$valid
	            var valid = true
	            var keys = Object.keys(rules)
	            for (var i = 0; i < keys.length; i++) {
	                if (!vm.$get(getVerifyModelPath(keys[i]) + ".$valid")) {
	                    valid = false
	                    break
	                }
	            }
	            vm.$set(namespace + ".$valid", valid)
	        }
	    }
	    function processMethod(methods) {
	        if (!methods) {
	            return {}
	        }

	        function process(method) {
	            if (!method) {
	                return null
	            }
	            if (typeof method === 'function') {
	                return {priority: 100, fn: method}
	            }

	            if (!Vue.util.isObject(value)) {
	                return null
	            }
	            if (typeof method.fn != "function") {
	                return null
	            }
	            var priority = method.priority
	            if (!priority) {
	                return {priority: 100, fn: method.fn}
	            }
	            if (typeof priority != 'number' || priority < 1 || priority > 100) {
	                return null
	            }
	            return {priority: priority, fn: method.fn}

	        }

	        var result = {}
	        Object.keys(methods).forEach(function (key) {
	            var value = methods[key]
	            var method = process(value)
	            if (!method) {
	                console.log("can not accept method \"" + key + "\"", value)
	                throw "can not accept method \"" + key + "\""
	            } else {
	                result[key] = method
	            }
	        })
	        return result
	    }

	    Vue.prototype.$verifyReset = function () {
	        var vm = this
	        console.log(vm)
	        var verifier = vm.$options.verifier || {}
	        var namespace = verifier.namespace || options.namespace || "verify"

	        var rules = vm.$get(namespace + ".$rules")
	        if (rules) {
	            vm.$verify(rules)
	        }
	    }
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * required
	 *
	 * This function validate whether the value has been filled out.
	 *
	 * @param val
	 * @return {Boolean}
	 */

	function required(val) {
	    if (Array.isArray(val)) {
	        return val.length > 0
	    } else if (typeof val === 'number') {
	        return true
	    } else if ((val !== null) && (typeof val === 'object')) {
	        return Object.keys(val).length > 0
	    } else {
	        return !val
	            ? false
	            : true
	    }
	}


	/**
	 * pattern
	 *
	 * This function validate whether the value matches the regex pattern
	 *
	 * @param val
	 * @param {RegExp} pat
	 * @return {Boolean}
	 */

	function pattern(val, pat) {
	    if (!(pat instanceof RegExp)) {
	        return false
	    }

	    return pat.test(val)
	}


	/**
	 * minLength
	 *
	 * This function validate whether the minimum length of the string or array.
	 *
	 * @param {String} val
	 * @param {String|Number} min
	 * @return {Boolean}
	 */

	function minLength(val, min) {
	    return (typeof val === 'string' || Array.isArray(val)) &&
	        isInteger(min) &&
	        val.length >= parseInt(min, 10)
	}


	/**
	 * maxLength
	 *
	 * This function validate whether the maximum length of the string.
	 *
	 * @param {String} val
	 * @param {String|Number} max
	 * @return {Boolean}
	 */

	function maxLength(val, max) {
	    return (typeof val === 'string' || Array.isArray(val)) &&
	        isInteger(max, 10) &&
	        val.length <= parseInt(max, 10)
	}


	/**
	 * min
	 *
	 * This function validate whether the minimum value of the numberable value.
	 *
	 * @param {*} val
	 * @param {*} arg minimum
	 * @return {Boolean}
	 */

	function min(val, arg) {
	    return !isNaN(+(val)) && !isNaN(+(arg)) && (+(val) >= +(arg))
	}


	/**
	 * max
	 *
	 * This function validate whether the maximum value of the numberable value.
	 *
	 * @param {*} val
	 * @param {*} arg maximum
	 * @return {Boolean}
	 */

	function max(val, arg) {
	    return !isNaN(+(val)) && !isNaN(+(arg)) && (+(val) <= +(arg))
	}


	/**
	 * isInteger
	 *
	 * This function check whether the value of the string is integer.
	 *
	 * @param {String} val
	 * @return {Boolean}
	 * @private
	 */

	function isInteger(val) {
	    return /^(-?[1-9]\d*|0)$/.test(val)
	}

	function equalTo(val, modelPath) {
	    return val === this.$get(modelPath)
	}


	/**
	 * export(s)
	 */
	module.exports = {
	    required: {
	        fn: required,
	        priority: 1
	    },
	    minLength: {
	        fn: minLength,
	        priority: 2
	    },
	    maxLength: {
	        fn: maxLength,
	        priority: 3
	    },
	    min: {
	        fn: min,
	        priority: 4
	    },
	    max: {
	        fn: max,
	        priority: 5
	    },
	    pattern: {
	        fn: pattern,
	        priority: 6
	    },
	    equalTo: {
	        fn: equalTo,
	        priority: 7
	    }
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, setImmediate, module) {(function () {
	  global = this

	  var queueId = 1
	  var queue = {}
	  var isRunningTask = false

	  if (!global.setImmediate)
	    global.addEventListener('message', function (e) {
	      if (e.source == global){
	        if (isRunningTask)
	          nextTick(queue[e.data])
	        else {
	          isRunningTask = true
	          try {
	            queue[e.data]()
	          } catch (e) {}

	          delete queue[e.data]
	          isRunningTask = false
	        }
	      }
	    })

	  function nextTick(fn) {
	    if (global.setImmediate) setImmediate(fn)
	    // if inside of web worker
	    else if (global.importScripts) setTimeout(fn)
	    else {
	      queueId++
	      queue[queueId] = fn
	      global.postMessage(queueId, '*')
	    }
	  }

	  Deferred.resolve = function (value) {
	    if (!(this._d == 1))
	      throw TypeError()

	    if (value instanceof Deferred)
	      return value

	    return new Deferred(function (resolve) {
	        resolve(value)
	    })
	  }

	  Deferred.reject = function (value) {
	    if (!(this._d == 1))
	      throw TypeError()

	    return new Deferred(function (resolve, reject) {
	        reject(value)
	    })
	  }

	  Deferred.all = function (arr) {
	    if (!(this._d == 1))
	      throw TypeError()

	    if (!(arr instanceof Array))
	      return Deferred.reject(TypeError())

	    var d = new Deferred()

	    function done(e, v) {
	      if (v)
	        return d.resolve(v)

	      if (e)
	        return d.reject(e)

	      var unresolved = arr.reduce(function (cnt, v) {
	        if (v && v.then)
	          return cnt + 1
	        return cnt
	      }, 0)

	      if(unresolved == 0)
	        d.resolve(arr)

	      arr.map(function (v, i) {
	        if (v && v.then)
	          v.then(function (r) {
	            arr[i] = r
	            done()
	            return r
	          }, done)
	      })
	    }

	    done()

	    return d
	  }

	  Deferred.race = function (arr) {
	    if (!(this._d == 1))
	      throw TypeError()

	    if (!(arr instanceof Array))
	      return Deferred.reject(TypeError())

	    if (arr.length == 0)
	      return new Deferred()

	    var d = new Deferred()

	    function done(e, v) {
	      if (v)
	        return d.resolve(v)

	      if (e)
	        return d.reject(e)

	      var unresolved = arr.reduce(function (cnt, v) {
	        if (v && v.then)
	          return cnt + 1
	        return cnt
	      }, 0)

	      if(unresolved == 0)
	        d.resolve(arr)

	      arr.map(function (v, i) {
	        if (v && v.then)
	          v.then(function (r) {
	            done(null, r)
	          }, done)
	      })
	    }

	    done()

	    return d
	  }

	  Deferred._d = 1


	  /**
	   * @constructor
	   */
	  function Deferred(resolver) {
	    'use strict'
	    if (typeof resolver != 'function' && resolver != undefined)
	      throw TypeError()

	    if (typeof this != 'object' || (this && this.then))
	      throw TypeError()

	    // states
	    // 0: pending
	    // 1: resolving
	    // 2: rejecting
	    // 3: resolved
	    // 4: rejected
	    var self = this,
	      state = 0,
	      val = 0,
	      next = [],
	      fn, er;

	    self['promise'] = self

	    self['resolve'] = function (v) {
	      fn = self.fn
	      er = self.er
	      if (!state) {
	        val = v
	        state = 1

	        nextTick(fire)
	      }
	      return self
	    }

	    self['reject'] = function (v) {
	      fn = self.fn
	      er = self.er
	      if (!state) {
	        val = v
	        state = 2

	        nextTick(fire)

	      }
	      return self
	    }

	    self['_d'] = 1

	    self['then'] = function (_fn, _er) {
	      if (!(this._d == 1))
	        throw TypeError()

	      var d = new Deferred()

	      d.fn = _fn
	      d.er = _er
	      if (state == 3) {
	        d.resolve(val)
	      }
	      else if (state == 4) {
	        d.reject(val)
	      }
	      else {
	        next.push(d)
	      }

	      return d
	    }

	    self['catch'] = function (_er) {
	      return self['then'](null, _er)
	    }

	    var finish = function (type) {
	      state = type || 4
	      next.map(function (p) {
	        state == 3 && p.resolve(val) || p.reject(val)
	      })
	    }

	    try {
	      if (typeof resolver == 'function')
	        resolver(self['resolve'], self['reject'])
	    } catch (e) {
	      self['reject'](e)
	    }

	    return self

	    // ref : reference to 'then' function
	    // cb, ec, cn : successCallback, failureCallback, notThennableCallback
	    function thennable (ref, cb, ec, cn) {
	      if ((typeof val == 'object' || typeof val == 'function') && typeof ref == 'function') {
	        try {

	          // cnt protects against abuse calls from spec checker
	          var cnt = 0
	          ref.call(val, function (v) {
	            if (cnt++) return
	            val = v
	            cb()
	          }, function (v) {
	            if (cnt++) return
	            val = v
	            ec()
	          })
	        } catch (e) {
	          val = e
	          ec()
	        }
	      } else {
	        cn()
	      }
	    };

	    function fire() {

	      // check if it's a thenable
	      var ref;
	      try {
	        ref = val && val.then
	      } catch (e) {
	        val = e
	        state = 2
	        return fire()
	      }

	      thennable(ref, function () {
	        state = 1
	        fire()
	      }, function () {
	        state = 2
	        fire()
	      }, function () {
	        try {
	          if (state == 1 && typeof fn == 'function') {
	            val = fn(val)
	          }

	          else if (state == 2 && typeof er == 'function') {
	            val = er(val)
	            state = 1
	          }
	        } catch (e) {
	          val = e
	          return finish()
	        }

	        if (val == self) {
	          val = TypeError()
	          finish()
	        } else thennable(ref, function () {
	            finish(3)
	          }, finish, function () {
	            finish(state == 1 && 3)
	          })

	      })
	    }


	  }

	  // Export our library object, either for node.js or as a globally scoped variable
	  if (true) {
	    module['exports'] = Deferred
	  } else {
	    global['Promise'] = global['Promise'] || Deferred
	  }
	})()

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(3).setImmediate, __webpack_require__(5)(module)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(4).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).setImmediate, __webpack_require__(3).clearImmediate))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
});
;