# Intro
vue-verify is a simple veriication plugin for vue,compatible with  Vue.js 0.12.0+.

# Usage
import and install

``` html
 <script src="vue.min.js"></script>
 <script src="vue-verify.js"></script>
 <script>
     Vue.use(vueVerify);
 </script>
```

create a Vue instance,invoke verify function in the created lifecycle

``` js
new Vue({
    el: "#app",
    data: {
        name: null,
        age: 0
    },
    created: function () {
        //Vue.prototype.verify(rules,opts)
        this.verify({
            name: {
                required: true,
                maxLength: 16
            },
            age: {
                min: 15,
                max: 80
            }
        })
    }
})
```

template code

``` html
<div id="app">
    <p>
        <input v-model="name">
        <template v-if="verify.name.$dirty">
            <span v-if="verify.name.required">name reqiured</span>
            <span v-if="verify.name.maxLength">please enter no more than 16 characters</span>
        </template>
    </p>
    <p>
        <input v-model="age">
        <template v-if="verify.age.$dirty">
            <span v-if="verify.age.min">age must greater than or equal to 16</span>
            <span v-if="verify.age.max">age must smaller than or equal to 80</span>
        </template>
    </p>
    <p>
        <button type="button" v-if="verify.$dirty&&verify.$valid">submit</button>
    </p>
</div>
```

# Built-in varification

```
new Vue({
    ...
    created:function(){
        this.verify({
            modelPath:{
                //built-in varification as follows.
                required:true,
                pattern:"/^1[3578][0-9]{9}$/",
                minLength:3,
                maxLength:10,
                min:1,
                max:888
            }
        })
    }
})
```

Through the examples for more information

# User custom verification

```
new Vue({
    el: "#app",
    data: {...}
    created:function () {
        this.verify({...})
    },
    //specify verifies option
    verifies: {
        // add custom verification function to here
        email: function (val) {
            //return a boolean value
            return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
        },
        exist: function (val) {
            //return a promise function value for async verify
            return function (resolve, reject) {
                $.ajax({
                    url: "server side verify url",
                    data: {name: val},
                    success: function (json) {
                        json.valid ? resolve() : reject()
                    },
                    error: function (xhr) {
                        reject()
                    }
                })
            }
        }
    }
})
```

You can specify it global via `Vue.mixin({verifies:verifies})`.

# Options

## Namespace

Default is "verify".

```
new Vue({
    ...
    ready:function(){
        //Vue.prototype.verify(rules,opts)
        this.verify({
            //specify rules here
        },{
           //specify verify options here
            namespace:"validator"
        })
    }
})
```

# Use in nodejs

Install via github
```
npm install https://github.com/PeakTai/vueverify.git --save-dev
```

``` js
var Vue = require("vue")
var VueVerify = require("vue-verify")
Vue.use(VueVerify)
```

# License
[Apache-2.0](http://opensource.org/licenses/Apache-2.0)