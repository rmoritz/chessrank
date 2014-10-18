﻿angular.module('chessRank')
    .controller('sectionAddCtrl', function (_, $scope, $state, tournament, playSystem, tieBreak,
                                            lookups, timeControlFilter) {
        $scope.action = $state.current.data.action;
        $scope.section = {
            tournamentId: tournament['_id'],
            invitationOnly: false
        };

        $scope.currency = _.find(lookups.currencies,
            function (cur) {
                return cur.value === tournament.registrationFeeCurrencyId;
            });

        $scope.datePickerOptions = {
            start: 'year',
            format: 'dd MMM yyyy',
            min: moment().subtract(6, 'months').toDate(),
            max: moment().add(6, 'months').toDate()
        };

        $scope.playSystemOptions = [
            { label: 'Round Robin', value: playSystem.roundRobin },
            { label: 'Double Round Robin', value: playSystem.doubleRoundRobin },
            { label: 'Swiss', value: playSystem.swiss }
        ];

        $scope.tieBreakOptions = {
            dataTextField: 'label',
            dataValueField: 'value',
            dataSource: [
                { label: 'Neustadl', value: tieBreak.neustadl },
                { label: 'Buchholz', value: tieBreak.buchholz },
                { label: 'Median', value: tieBreak.median },
                { label: 'Modified Median', value: tieBreak.modifiedMedian }
            ]
        };

        $scope.timeControlOptions = _.map(lookups.stdTimeControls,
            function (tc) {
                return {
                    value: angular.toJson(tc),
                    label: _.map(tc, function (ctrl) {
                        return timeControlFilter(ctrl);
                    }).join(', ')
                }
            });

        $scope.editComplete = function () {
            $state.go('^');
        }

        $scope.editFailed = function (error) {
            $scope.editError = error.data.message || 'Unknown error';
        }

        $scope.clearError = function () {
            $scope.editError = null;
        }
    });