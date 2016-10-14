/**
 * Created by peak on 15/11/14.
 */
exports.install = function (Vue, options) {

    options = options || {}
    var buildInMethods = Vue.util.extend(require("./methods.js"), processMethod(options.methods))
    var namespace = options.namespace || "verify"
    var util = require("./util.js")

    Vue.mixin({
        data: function () {
            var obj = {}
            obj[namespace] = {}
            return obj
        }
    })


    Vue.prototype.$verify = function (rules) {
        var vm = this
        var verifier = vm.$options.verifier || {}
        var methods = Vue.util.extend(processMethod(verifier.methods), buildInMethods)
        var verifyObj = vm[namespace]

        Vue.set(verifyObj, "$dirty", false)
        Vue.set(verifyObj, "$valid", false)
        Vue.set(verifyObj, "$rules", rules)

        Object.keys(rules).forEach(function (modelPath) {
            var model = getVerifyModel(modelPath)
            Vue.set(model, "$dirty", false)
            verify(modelPath, util.getModel(vm, modelPath))
        })

        Object.keys(rules).forEach(function (modelPath) {
            vm.$watch(modelPath, function (val) {
                var model = getVerifyModel(modelPath)
                Vue.set(model, "$dirty", true)
                Vue.set(verifyObj, "$dirty", true)
                verify(modelPath, val)
            })
        })

        function getVerifyModel(modelPath) {
            var arr = modelPath.split(".")
            var model = verifyObj[arr[0]]
            if (!model) {
                model = {}
                Vue.set(verifyObj, arr[0], {})
            }
            for (var i = 1; i < arr.length; i++) {
                if (!arr[i]) {
                    continue
                }
                var m = model[arr[i]]
                if (!m) {
                    m = {}
                    Vue.set(model, arr[i], m)
                }
                model = m
            }
            return model
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

            var keys = Object.keys(ruleMap).sort(function (a, b) {
                var m1 = methods[a]
                var m2 = methods[b]
                var p1 = m1 ? m1.priority : 100
                var p2 = m2 ? m2.priority : 100
                return p1 - p2
            })

            stepVerify(modelPath, ruleMap, keys, 0, val)
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
                var Promise = require("promiz")
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
            var verifyModel = getVerifyModel(modelPath)
            Vue.set(verifyModel, rule, inValid)

            var modelValid = true
            Object.keys(verifyModel).forEach(function (prop) {
                //ignore $dirty and $valid
                if ("$dirty" === prop || "$valid" === prop) {
                    return
                }
                //keep only one rule has invalid flag
                if (!modelValid) {
                    Vue.set(verifyModel, prop, false)
                } else if (verifyModel[prop]) {
                    modelValid = false
                }
            })

            Vue.set(verifyModel, "$valid", modelValid)

            //verify.$valid
            var valid = true
            var keys = Object.keys(rules)
            for (var i = 0; i < keys.length; i++) {
                var model = getVerifyModel(keys[i])
                if (!model.$valid) {
                    valid = false
                    break
                }
            }
            Vue.set(verifyObj, "$valid", valid)
        }
    }

    Vue.prototype.$verifyReset = function () {
        var verify = this[namespace]

        var rules = verify.$rules
        if (rules) {
            vm.$verify(rules)
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

            if (!Vue.util.isObject(method)) {
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

}