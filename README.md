# Intro
vue-verify is a simple veriication plugin for vue,compatible with  Vue.js 0.12.0+.

# Usage
Import and install

```html
 <script src="vue.min.js"></script>
 <script src="vue-verify.js"></script>
 <script>
     Vue.use(vueVerify,options);
 </script>
```

Create a Vue instance,invoke $verify(rules) in the created lifecycle hook.

```js
new Vue({
    el: "#app",
    data: {
        name: null,
        age: 0
    },
    created: function () {
        //Vue.prototype.$verify(rules)
        this.$verify({
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

template code

```html
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

# Built-in verify methods

```js
new Vue({
    ...
    created:function(){
        this.$verify({
            modelPath:{
                //built-in verify methods as follows.
                required:true,//priority:  1
                minLength:3,// priority: 2
                maxLength:10,// priority: 3
                min:1,//priority: 4
                max:888,//priority: 5
                pattern:"/^1[3578][0-9]{9}$/",//priority: 6
                equalTo:"ABC"//priority: 7
            }
        })
    }
})
```

> Note: Get more information from examples.

# Options


```js
Vue.use(vueVerify, {
    namespace: "validator",
    methods: {
        email: {
            priority: 10,//default 100
            fn: function (val) {
                //return a boolean value
                return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
            }
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
});
```

You can also specify verification options for instance.
 
```
new Vue({
    el: "#app",
    data: {...},
    created: function () {
        this.$verify({...})
    },
    //specify verifier option
    verifier: options
})
```


## Namespace

Default is "verify".Can not specify in instance options since v0.6.0.

## methods

Specify custom verify methods.

> You can specify options global via  `Vue.use(vueVerify,options)`.

# Reset

You can reset the verify results with method `$verifyReset()` of Vue instance.

# Use in nodejs

```
npm install vue-verify --save-dev
```

``` js
var Vue = require("vue")
var VueVerify = require("vue-verify")
Vue.use(VueVerify)
```

# License
[Apache-2.0](http://opensource.org/licenses/Apache-2.0)
