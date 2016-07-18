﻿(function () {

    var visited = {};

    function visitObject(vm, visit, visitArray) {
        "use strict";
        if (!vm || !!visited[vm._MappedId])
            return;

        if (typeof vm !== "object")
            return;

        visited[vm._MappedId] = vm;

        if (Array.isArray(vm)) {
            visitArray(vm);
            vm.forEach(value =>  visitObject(value, visit, visitArray));
            return;
        }

        visited[vm._MappedId] = vm;

        for (var property in vm) {
            if (!vm.hasOwnProperty(property))
                continue;

            var value = vm[property];
            if (typeof value === "function")
                continue;

            visit(vm, property);
            visitObject(value, visit, visitArray);
        }
    }

    var vueVm = null;

    function Listener(listener, change){
        this.listen = function(){
            this.subscriber = listener();
        }

        this.silence = function(value){
            this.subscriber();
            change(value);
            this.listen();
        }
    }

    function collectionListener(object, observer) {
        return function (changes) {
            var arg_value = [], arg_status = [], arg_index = [];
            var length = changes.length;
            for (var i = 0; i < length; i++) {
                arg_value.push(changes[i].value);
                arg_status.push(changes[i].status);
                arg_index.push(changes[i].index);
            }
            observer.TrackCollectionChanges(object, arg_value, arg_status, arg_index);
        };
    }

    function updateArray(array, observer) {
        var changelistener = collectionListener(array, observer);
        var listener = array.subscribe(changelistener);
        array.silentSplice = function () {
            listener();
            var res = array.splice.apply(array, arguments);
            listener = array.subscribe(changelistener);
            return res;
        };
    }

    function onPropertyChange(observer, prop, father) {
        var blocked = false;

        return function (newVal, oldVal) {
            if (blocked){
                blocked = false;
                return;
            }

            if (newVal === oldVal)
                return;

            if (Array.isArray(newVal)) {
                var args = [0, oldVal.length].concat(newVal);
                oldVal.splice.apply(oldVal, args);
                blocked = true;
                father[prop] = oldVal;
                return;
            }

            observer.TrackChanges(father, prop, newVal);
        };
    }


    var inject = function (vm, observer) {
        if (!vueVm)
            return vm;

        visitObject(vm, (father, prop) => {
            father.__silenter = father.__silenter || {};
            var silenter = father.__silenter;
            var listenerfunction =  onPropertyChange(observer, prop, father);
            newListener = new Listener(() => vueVm.$watch(() => father[prop], listenerfunction), (value) => father[prop] = value);
            newListener.listen();
            silenter[prop] = newListener;
        }, array => updateArray(array, observer));
        return vm;
    };

    var helper = {
        inject: inject,
        register: function (vm, observer) {
            vueVm = new Vue({
                el: "#main",
                data: vm
            });

            window.vm = vueVm;

            return inject(vm, observer);
        }
    };

    window.glueHelper = helper;
}())