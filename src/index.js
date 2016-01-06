/**
 * Created by peak on 15/11/14.
 */
exports.install = function (Vue) {
    Vue.prototype.$dirty = false
    Vue.prototype.$verify = function (rules) {
        var vm = this
        var methods = require("./methods.js")
        var Verification = require("./Verification.js")
        var verifier = vm.$options.verifier || {}
        new Verification({
            vm: vm,
            rules: rules,
            methods: Vue.util.extend(verifier.methods || {}, methods),
            namespace: verifier.namespace
        }).init()
    }
}