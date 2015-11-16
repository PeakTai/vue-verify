/**
 * Created by peak on 15/11/15.
 */
"use strict"
function Verification(opts) {
    this.vm = opts.vm
    this.rules = opts.rules
    this.verifies = opts.verifies
    this.namespace = opts.namespace || "verify"
    this.debug = !!opts.debug
}
Verification.prototype.getVerifyModelPath = function (modelPath) {
    return this.namespace + "." + modelPath
}

Verification.prototype.valid = function (modelPath, val) {
    var self = this
    var verifyModelPath = self.getVerifyModelPath(modelPath)
    var ruleMap = self.rules[modelPath]
    //required first
    var requiredValid = self.verifies.required(val)

    if (ruleMap.required) {
        self.vm.$set(verifyModelPath + ".required", !requiredValid)
        self.update$valid(modelPath)
    }

    //other verifications
    Object.keys(ruleMap).forEach(function (rule) {
        if ("required" === rule) {
            return
        }

        if (!requiredValid) {
            self.vm.$set(verifyModelPath + "." + rule, false)
            self.update$valid(modelPath)
            return
        }

        if (!self.verifies.hasOwnProperty(rule)) {
            console.warn("unknown verify rule:" + rule + ",you can set it in verifies of Vue constructor options first")
            return
        }
        var arg = ruleMap[rule]
        var verifyFn = self.verifies[rule]
        var result = verifyFn(val, arg)

        if (typeof result === "boolean") {
            self.vm.$set(verifyModelPath + "." + rule, !result)
            self.update$valid(modelPath)
            return
        }
        //promise
        else if (result instanceof Function) {
            var Promise = require("promiz")
            new Promise(result).then(function () {
                self.vm.$set(verifyModelPath + "." + rule, false)
                self.update$valid(modelPath)
            }, function (reason) {
                self.vm.$set(verifyModelPath + "." + rule, true)
                self.update$valid(modelPath)
            })
        } else {
            throw "unsupported returned value of \"" + rule + "\" vrfity function"
        }

    })
}


Verification.prototype.update$valid = function (modelPath) {
    var self = this
    var verifyModelPath = self.getVerifyModelPath(modelPath)
    var verifyModel = self.vm.$get(verifyModelPath)
    var keyValid = true
    for (var prop in verifyModel) {
        //ignore $dirty and $valid
        if ("$dirty" === prop || "$valid" === prop) {
            continue
        }
        if (verifyModel[prop]) {
            keyValid = false
            break
        }
    }
    self.vm.$set(verifyModelPath + ".$valid", keyValid)

    //verify.$valid
    var valid = true
    var keys = Object.keys(self.rules)
    for (var i = 0; i < keys.length; i++) {
        if (!self.vm.$get(self.getVerifyModelPath(keys[i]) + ".$valid")) {
            valid = false
            break
        }
    }
    self.vm.$set(self.namespace + ".$valid", valid)
}

Verification.prototype.init = function () {
    var self = this
    self.vm.$set(self.namespace + ".$dirty", false)
    self.vm.$set(self.namespace + ".$valid", false)
    Object.keys(self.rules).forEach(function (modelPath) {
        self.vm.$set(self.getVerifyModelPath(modelPath) + ".$dirty", false)
        self.valid(modelPath, self.vm.$get(modelPath))
    })
    self.watch()
}

Verification.prototype.watch = function () {
    var self = this
    Object.keys(self.rules).forEach(function (modelPath) {
        self.vm.$watch(modelPath, function (newVal, oldVal) {
            self.vm.$set(self.getVerifyModelPath(modelPath) + ".$dirty", true)
            self.vm.$set(self.namespace + ".$dirty", true)
            self.valid(modelPath, newVal)
        })
    })

}

module.exports = Verification
