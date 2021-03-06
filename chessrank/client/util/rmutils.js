﻿angular.module('rmUtils', [])
    .filter('rmTransform', function ($filter) {
        return function (array, filter) {
            if (!angular.isArray(array) || !angular.isString(filter)) {
                return array;
            }

            var newArray = [];
            angular.forEach(array, function (item) {
                var newItem = $filter(filter)(item);
                newArray.push(newItem);
            });

            return newArray;
        }
    })
    .filter('rmJoin', function () {
        return function (array, seperator) {
            if (!angular.isArray(array)) {
                return array;
            }
            return array.join(seperator || ',');
        }
    })
    .service('rmArrayUtil', function () {
        this.indexOf = function (array, test) {
            for (var i = 0; i != array.length; ++i) {
                if (test(array[i])) {
                    return i;
                }
            }
            return -1;
        }

        return this;
    })