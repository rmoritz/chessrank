﻿angular.module('chessRank')
    .factory('tournamentService', function ($resource) {
        return $resource('api/tournaments/:tournamentId',
            { tournamentId: '@id' },
            { update: { method: 'PUT' } });
    })
    .factory('playerService', function ($resource) {
        return $resource('api/players/:playerId',
            { tournamentId: '@id' },
            { update: { method: 'PUT' } });
    })
    .factory('userService', function ($resource) {
        return $resource('api/users/:userId',
            { userId: '@id' },
            { update: { method: 'PUT' } });
    });