﻿'use strict'

angular.module('chessRank', ['ngResource', 'ui.router', 'ngAnimate', 'ncy-angular-breadcrumb',
    'ui.bootstrap', 'kendo.directives', 'formFor', 'formFor.bootstrapTemplates', 'toaster',
    'underscore', 'momentjs', 'sprintfjs', 'rmUtils'])
    .config(function ($stateProvider, $urlRouterProvider, $breadcrumbProvider) {
        $breadcrumbProvider.setOptions({
            templateUrl: 'static/views/breadcrumb.html'
        });

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('a', {
                abstract: true,
                template: '<ui-view />',
                resolve: {
                    lookupsService: 'lookupsService',
                    lookups: function (lookupsService) {
                        return lookupsService.getLookups();
                    }
                }
            })
            .state('a.home', {
                url: '/',
                templateUrl: 'static/views/home.html',
                controller: 'homeCtrl',
                data: {
                    ncyBreadcrumbLabel: 'Home'
                }
            })
            .state('a.tournaments', {
                url: '/tournaments',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/list.html',
                        controller: 'tournamentListCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Tournaments',
                    ncyBreadcrumbParent: 'a.home',
                },
                resolve: {
                    tournamentService: 'tournamentService',
                    tournaments: function (tournamentService) {
                        return tournamentService.query().$promise;
                    }
                },
            })
            .state('a.tournaments.details', {
                url: '/{tournamentId:[0-9a-fA-F]{24}}',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/details.html',
                        controller: 'tournamentDetailsCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: '{{ tournament.name }}'
                },
                resolve: {
                    tournament: function ($stateParams, tournaments, _) {
                        var res = _.find(tournaments,
                            function (tm) { return tm._id.$oid === $stateParams.tournamentId; });
                        return res;
                    },
                    sectionService: 'sectionService',
                    sections: function ($q, $stateParams, sectionService) {
                        return sectionService.query({ tournamentId: $stateParams.tournamentId }).$promise
                            .catch(function (error) {
                                if (error.status === 404) {
                                    return [];
                                }

                                var deferred = $q.defer();
                                deferred.reject(error);
                                return deferred.promise;
                            });
                    }
                }
            })
            .state('a.tournaments.details.section', {
                url: '/section/{sectionId:[0-9a-fA-F]{24}}',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/section/details.html',
                        controller: 'sectionDetailsCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: '{{ section.name }}'
                },
                resolve: {
                    section: function (_, $stateParams, sections, tournament) {
                        var res = _.find(sections,
                            function (sec) { return sec._id.$oid === $stateParams.sectionId; });
                        return res;
                    },
                    players: function (section, playerLookupService, lookups) {
                        var playerIds = _.map(section.registeredPlayerIds,
                            function (pid) { return pid.$oid; });
                        playerIds = playerIds.concat(_.map(section.confirmedPlayerIds,
                            function (pid) { return pid.$oid; }));

                        return playerLookupService.findPlayers(playerIds);
                    }
                }
            })
            .state('a.tournaments.details.section.edit', {
                url: '/edit',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/section/edit.html',
                        controller: 'sectionEditDetailsCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Edit Details'
                },
                resolve: {
                    section: function (section, tournament, lookups) {
                        return section;
                    }
                }
            })
            .state('a.tournaments.details.section.players', {
                url: '/players',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/section/players.html',
                        controller: 'sectionEditPlayersCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Edit Player Registrations'
                },
                resolve: {
                    section: function (section, tournament, lookups, players) {
                        return section;
                    }
                }
            })
            .state('a.tournaments.details.section.results', {
                url: '/results/{roundNumber:[1-50]}',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/section/round/results.html',
                        controller: 'roundResultsCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Results'
                }
            })
            .state('a.tournaments.details.section.capture_round', {
                url: '/round/{roundNumber:[1-50]}/capture',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/section/round/capture.html',
                        controller: 'roundCaptureResultsCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Capture Results'
                },
                resolve: {
                    section: function ($stateParams, section, players, tournament, lookups, sectionService) {
                        return section;
                    }
                }
            })
            .state('a.tournaments.details.edit', {
                url: '/edit',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/edit.html',
                        controller: 'tournamentEditCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Edit'
                },
                resolve: {
                    sections: function (tournament, sections, lookups) {
                        return sections;
                    }
                }
            })
            .state('a.tournaments.details.edit.add_section', {
                url: '/add_section',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/section/edit.html',
                        controller: 'sectionAddCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Add Section'
                },
                resolve: {
                    tournament: function (tournament, lookups) {
                        return tournament;
                    }
                }
            })
            .state('a.tournaments.add', {
                url: '/create',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/edit.html',
                        controller: 'tournamentAddCtrl',
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Create Tournament'                    
                },
                resolve: {
                    lookups: function (lookups) {
                        return lookups;
                    }
                }
            })
            .state('a.tournaments.add.add_section', {
                url: '/add_section',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/section/edit.html',
                        controller: 'sectionAddCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: 'Add Section'
                },
                tournamentEditService: 'tournamentEditService',
                resolve: {
                    tournament: function (tournamentEditService, lookups) {
                        return tournamentEditService.getTournamentToAdd();
                    }
                }
            })
            .state('a.tournaments.add.edit_section', {
                url: '/{sectionId:[0-9]{13}}',
                views: {
                    '@': {
                        templateUrl: 'static/views/tournament/section/edit.html',
                        controller: 'sectionEditCtrl'
                    }
                },
                data: {
                    ncyBreadcrumbLabel: '{{ section.name }}'
                },
                tournamentEditService: 'tournamentEditService',
                resolve: {
                    section: function (_, $stateParams, tournamentEditService) {
                        var res = _.find(tournamentEditService.getSectionsToAdd(),
                            function (sec) { return sec.fakeId === $stateParams.sectionId; });
                        return res;
                    },
                    tournament: function (tournamentEditService, lookups) {
                        return tournamentEditService.getTournamentToAdd();
                    }
                }
            })
            .state('a.signup', {
                url: '/signup',
                templateUrl: 'static/views/auth/signup.html',
                controller: 'signupCtrl',
                data: {
                    ncyBreadcrumbLabel: 'Sign up',
                    ncyBreadcrumbParent: 'a.home',
                },
                resolve: {
                    lookups: function (lookups) {
                        return lookups;
                    }
                }
            });
    });