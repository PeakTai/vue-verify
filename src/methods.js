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
    var util = require("./util.js")
    var model = util.getModel(this, modelPath)
    return val === model
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
