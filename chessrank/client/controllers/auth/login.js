﻿angular.module('chessRank')
    .controller('loginCtrl', function ($scope, $rootScope, $modalInstance, authEvent, authService) {
        $scope.request = {};

        $scope.loginComplete = function () {
            $rootScope.currentUser = authService.getCurrentUser();
            $rootScope.$broadcast(authEvent.loginSuccess);

            $modalInstance.close();
        }

        $scope.loginFailed = function (error) {
            if (error.status === 300) {
                $scope.request.overwriteExisting = true;
            } else {
                $scope.loginError = error.data.message || 'Unknown error';
                $rootScope.$broadcast(authEvent.loginFailed);
            }
        }

        $scope.clearErrors = function () {
            $scope.loginError = null
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    });