/**
 * Created by peak on 15/11/14.
 */
exports.install = function (Vue) {
    Vue.prototype.verify = function (rules, opts) {
        var vm = this
        var verifies = require("./verifies.js")
        var Verification = require("./Verification.js")
        opts = opts || {}
        new Verification({
            vm: vm,
            rules: rules,
            verifies: Vue.util.extend(vm.$options.verifies || {}, verifies),
            namespace: opts.namespace,
            debug: opts.debug
        }).init()
    }
}