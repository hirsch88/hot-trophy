(function () {
  'use strict';

  angular
    .module('app.router', [
      'ui.router',
      'ui.router.router',
      'ui.router.state'
    ])
    .constant('APP_ROUTER_PRIVATE_ROUTES', getSecuredRoutes())
    .config(RouterConfig)
    .factory('AppRouterService', AppRouterService)
    .run(AppRouter);

  /**
   * @description
   * ToDo
   *
   * @returns {string[]}
   */
  function getSecuredRoutes() {
    return [
      '/admin/*'
    ];
  }

  /**
   * @name RouterConfig
   * @param $urlRouterProvider
   * @constructor
   */
  function RouterConfig($urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
  }

  /**
   * @name AppRouterService
   * @returns {{}}
   * @constructor
   */
  function AppRouterService(APP_ROUTER_PRIVATE_ROUTES) {

    var _initialized = false;

    var service = {
      hasInitialized: getInit,
      initialized:    initialized,
      isStatePrivate: isStatePrivate,
      isUrlPrivate:   isUrlPrivate
    };

    return service;

    ////////////////////////////////////////////////

    function getInit() {
      return _initialized;
    }

    function initialized() {
      _initialized = true;
    }

    function isStatePrivate($state) {
      console.log($state);



    }

    /**
     * @name isThisAPrivateRoute
     * @param url
     * @returns {Boolean}
     */
    function isUrlPrivate(url) {
      var isPrivate = false;
      url = parseRoute(url);

      for (var i = 0; i < APP_ROUTER_PRIVATE_ROUTES.length; i++) {
        if (doesUrlMatchPattern(APP_ROUTER_PRIVATE_ROUTES[i], url)) {
          isPrivate = true;
        }
      }

      return isPrivate;
    }

    /**
     * @name parseRoute
     * @param route
     * @returns {String}
     */
    function parseRoute(route) {
      return route.split('#')[1] || route || '';
    }

    /**
     * @name doesUrlMatchPattern
     * @param pattern
     * @param route
     * @returns {Boolean}
     */
    function doesUrlMatchPattern(pattern, route) {
      var exp = new RegExp(pattern);
      return exp.test(route);
    }


  }

  /**
   * @name AppRouter
   * @param c3Event
   * @param $rootScope
   * @param $urlRouter
   * @param logger
   * @param $state
   * @constructor
   */
  function AppRouter($q, $rootScope, $urlRouter, logger, $state, AppRouterService) {

    var log = logger('AppRouter');
    log.info('start');

    $rootScope.$on('$locationChangeSuccess', onLocationChange);

    $urlRouter.listen();


    ////////////////////////////////////////////////

    /**
     * @name onLocationChange
     * @param event
     * @param toUrl
     * @param fromUrl
     */
    function onLocationChange(event, toUrl, fromUrl) {
      log.info('onLocationChange', toUrl);

      // Halt state change from even starting
      event.preventDefault();

      // is this a private route
      isThisAPrivateRoute({
        route:   toUrl,
        initial: !AppRouterService.hasInitialized()
      })
        .then(hasValidSession)
        .then(loadInitialData)
        .finally(function (options) {
          log.info('finally', options);
          AppRouterService.initialized();
          $urlRouter.sync();
        })
        .catch(function (err) {
          log.warn('catch', err);
          if (err.redirct) {
            log.info('redirect to login');
            $state.go('authLogin');
          }

          if (err.sync) {
            log.info('Browser sync');
            $urlRouter.sync();
          }
        });
    }

    /**
     * @name isThisAPrivateRoute
     * @param options
     * @returns {Promise}
     */
    function isThisAPrivateRoute(options) {
      var deferred = $q.defer();
      //var isPrivate = false;
      //
      //options.route = parseRoute(options.route);
      //
      //for (var i = 0; i < APP_ROUTER_PRIVATE_ROUTES.length; i++) {
      //  if (doesUrlMatchPattern(APP_ROUTER_PRIVATE_ROUTES[i], options.route)) {
      //    isPrivate = true;
      //  }
      //}

      var isPrivate = AppRouterService.isUrlPrivate(options.route);

      if (isPrivate) {
        deferred.resolve(options);
      } else {
        deferred.reject({
          sync: true
        });
      }

      return deferred.promise;
    }

    /**
     * @name hasValidSession
     * @param options
     * @returns {Promise}
     */
    function hasValidSession(options) {
      var deferred = $q.defer();

      // TODO: Check if the user has a valid session
      if (true) {
        deferred.resolve(options);

      } else {
        deferred.reject({
          session: true,
          redirct: true
        });
      }

      return deferred.promise;
    }

    /**
     * @name
     * @description
     * Here we will load some initial data for the application like the active event, but
     * only at the first run.
     *
     * @param options
     * @returns {Promise}
     */
    function loadInitialData(options) {
      var deferred = $q.defer();

      // TODO: Load some initial data for the application
      if (AppRouterService.hasInitialized()) {
        deferred.resolve(options);

      } else {
        log.info('loadInitialData');
        deferred.resolve(options);

        //log.error('c3Events.init()', err);
        //deferred.reject({
        //  error: err
        //});
      }
      return deferred.promise;
    }

    /**
     * @name parseRoute
     * @param route
     * @returns {String}
     */
    function parseRoute(route) {
      return route.split('#')[1] || route || '';
    }

    /**
     * @name doesUrlMatchPattern
     * @param pattern
     * @param route
     * @returns {Boolean}
     */
    function doesUrlMatchPattern(pattern, route) {
      var exp = new RegExp(pattern);
      return exp.test(route);
    }

  }


}());
