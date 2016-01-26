/**
 * Created by peak on 15/11/15.
 */
"use strict"
function Verification(opts) {
    this.vm = opts.vm
    this.rules = opts.rules
    this.methods = opts.methods
    this.namespace = opts.namespace || "verify"
}
Verification.prototype.getVerifyModelPath = function (modelPath) {
    return this.namespace + "." + modelPath
}

Verification.prototype.valid = function (modelPath, val) {
    var self = this
    var verifyModelPath = self.getVerifyModelPath(modelPath)
    var ruleMap = self.rules[modelPath]
    //required first
    var requiredValid = self.methods.required(val)

    if (!ruleMap.required && !requiredValid) {
        //if model not required and value is blank,make it valid
        Object.keys(ruleMap).forEach(function (rule) {
            if (self.methods.hasOwnProperty(rule)) {
                self.update$valid(modelPath, rule, false)
            }
        })
        return
    }

    if (ruleMap.required) {
        self.update$valid(modelPath, "required", !requiredValid)
    }

    //other verifications
    Object.keys(ruleMap).forEach(function (rule) {
        if ("required" === rule) {
            return
        }

        if (!self.methods.hasOwnProperty(rule)) {
            console.warn("can not find verify method of rule \"" + rule + "\"")
            return
        }

        var arg = ruleMap[rule]
        var verifyFn = self.methods[rule]
        var result = verifyFn.call(self.vm, val, arg)

        if (typeof result === "boolean") {
            self.update$valid(modelPath, rule, !result)
            return
        }
        //promise
        else if (result instanceof Function) {
            var Promise = require("promiz")
            new Promise(result).then(function () {
                self.update$valid(modelPath, rule, false)
            }, function (reason) {
                self.update$valid(modelPath, rule, true)
            })
        } else {
            throw "unsupported returned value of the verify method \"" + rule + "\""
        }

    })
}


Verification.prototype.update$valid = function (modelPath, rule, inValid) {
    var self = this
    var verifyModelPath = self.getVerifyModelPath(modelPath)
    self.vm.$set(verifyModelPath + "." + rule, inValid)

    var verifyModel = self.vm.$get(verifyModelPath), modelValid = true
    Object.keys(verifyModel).forEach(function (prop) {
        //ignore $dirty and $valid
        if ("$dirty" === prop || "$valid" === prop) {
            return
        }
        //keep only one rule has invalid flag
        if (!modelValid) {
            self.vm.$set(verifyModelPath + "." + prop, false)
        } else if (verifyModel[prop]) {
            modelValid = false
        }
    })

    self.vm.$set(verifyModelPath + ".$valid", modelValid)

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
