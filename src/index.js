/**
 * Created by peak on 15/11/14.
 */
exports.install = function (Vue, options) {
    options = options || {}
    var methods = require("./methods.js")
    methods = Vue.util.extend(methods, options.methods || {})

    Vue.prototype.$verify = function (rules) {
        var vm = this
        var Verification = require("./Verification.js")
        var verifier = vm.$options.verifier || {}
        new Verification({
            vm: vm,
            rules: rules,
            methods: Vue.util.extend(verifier.methods || {}, methods),
            namespace: verifier.namespace || options.namespace
        }).init()
    }
}