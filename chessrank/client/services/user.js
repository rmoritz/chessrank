﻿angular.module('chessRank')
    .factory('userService', function ($resource) {
        return $resource('api/users/:userId',
            { userId: '@id' },
            { update: { method: 'PUT' } });
    })
    .service('userLookupService', function ($q, _, userService) {
        var _this = this;

        this._users = [];

        this.findUser = function (userId) {
            if (_this.promise) {
                return _this.promise;
            }

            var user = _.find(_this._users, function (u) {
                return u.userId.$oid === userId;
            });

            if (user) {
                return $q.when(user);
            }

            _this.promise = userService.query().$promise.then(
                function (userList) {
                    _this._users = userList;
                    _this.promise = null;

                    var user = _.find(_this._users, function (u) {
                        return u.userId.$oid === userId;
                    });
                    return user;
                });
            return _this.promise;
        };

        return this;
    })
    .service('signupService', function (userService, $q, sprintf, baseTypeConverter) {
        this.validationRules = {
            name: {
                required: true,
                minlength: 2,
                maxlength: 50
            },
            surname: {
                required: true,
                minlength: 2,
                maxlength: 50
            },
            email: {
                required: true,
                type: 'email'
            },
            gender: {
                required: true
            },
            password: {
                required: true,
                minlength: 8,
                maxlength: 200,
                custom: function (value, model) {
                    var minDigits  = 1;
                    var minUpper   = 1;
                    var minLower   = 1;
                    var minSymbols = 1;

                    function occurrences(str, regex) {
                        var matches = str.match(regex);
                        return matches ? matches.length : 0;
                    }

                    function pluralize(word, qty) {
                        return qty > 1
                            ? word + 's'
                            : word;
                    }

                    function testDigits(str) {
                        return occurrences(value, /\d/g) >= minDigits;
                    }

                    function testUpper(str) {
                        return occurrences(value, /[A-Z]/g) >= minUpper;
                    }

                    function testLower(str) {
                        return occurrences(value, /[a-z]/g) >= minLower;
                    }

                    function testSymbols(str) {
                        return occurrences(value, /[~`\!@#\$%\^&*\(\)_\-\+=<,>\.\?\/\:;"'\|\\\{\[\}\]]/g) >= minSymbols;
                    }

                    var deferred = $q.defer();
                    
                    if (!testDigits(value)) {
                        deferred.reject(sprintf('Must contain at least %d %s',
                            minDigits, pluralize('digit', minDigits)));
                    } else if (!testUpper(value)) {
                        deferred.reject(sprintf('Must contain at least %d uppercase %s', 
                            minUpper, pluralize('letter', minUpper)));
                    } else if (!testLower(value)) {
                        deferred.reject(sprintf('Must contain at least %d lowercase %s',
                            minLower, pluralize('letter', minLower)));
                    } else if (!testSymbols(value)) {
                        deferred.reject(sprintf('Must contain at least %d %s',
                            minSymbols, pluralize('symbol', minSymbols)));
                    } else {
                        deferred.resolve();
                    }

                    return deferred.promise;
                }
            },
            password2: {
                required: true,
                custom: function (value, model) {
                    var deferred = $q.defer();
                    if (model.password === model.password2) {
                        deferred.resolve();
                    } else {
                        deferred.reject('Passwords do not match');
                    }
                    return deferred.promise;
                }
            },
            contactNumber: {
                pattern: /^\+\d{11}?$/
            }
        };

        function createRequest(model) {
            var request = angular.copy(model);
            var converter = new baseTypeConverter();

            delete request.password2;
            request.dateOfBirth = converter.jsDateToBsonUtcDropTime(model.dateOfBirth);
            request.gender = parseInt(model.gender, 10);
            if (model.federation) {
                request.federation = model.federation.value;
            }

            return JSON.stringify(request);
        }

        this.submit = function (model) {
            var request = createRequest(model);
            return userService.save(request).$promise;
        }

        return this;
    });