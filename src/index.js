/**
 * Created by peak on 15/11/14.
 */
exports.install = function (Vue, options) {

    options = options || {}
    var buildInMethods = Vue.util.extend(require("./methods.js"), processMethod(options.methods))

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
        var verifier = vm.$options.verifier || {}
        var namespace = verifier.namespace || options.namespace || "verify"

        var rules = vm.$get(namespace + ".$rules")
        if (rules) {
            vm.$verify(rules)
        }
    }
}