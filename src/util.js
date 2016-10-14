/**
 * Created by peak on 2016/10/14.
 */
exports.getModel = function (vm, path) {
    var arr = path.split(".")
    var model = vm[arr[0]]
    if (!model) {
        return null
    }
    for (var i = 1; i < arr.length; i++) {
        if (!arr[i]) {
            continue
        }
        var m = model[arr[i]]
        if (!m) {
            return null
        }
        model = m
    }
    return model
}