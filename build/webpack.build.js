/**
 * Created by peak on 15/11/15.
 */
var package = require("../package.json")
var webpack = require("webpack")
var moment = require("moment")
module.exports = {
    context: __dirname + "/../src",
    entry: "./index.js",
    output: {
        path: __dirname + "/../dist",
        filename: "vue-verify.js",
        library: "vueVerify",
        libraryTarget: "umd"
    },
    plugins: [
        new webpack.BannerPlugin("vue-verify " + package.version +
            "\nbuild in " + moment().format("MMMM Do YYYY, HH:mm:ss")
            + "\nhttps://github.com/PeakTai/vue-verify")
    ],
}