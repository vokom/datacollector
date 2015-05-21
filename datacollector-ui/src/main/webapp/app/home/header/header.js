/**
 * Controller for Header Pane.
 */

angular
  .module('dataCollectorApp.home')

  .controller('HeaderController', function ($scope, $rootScope, $timeout, _, api, $translate,
                                           pipelineService, pipelineConstant, $modal) {


    var pipelineValidationInProgress = 'Validating Pipeline...',
      pipelineValidationSuccess = 'Validation Successful.';

    $translate('global.messages.validate.pipelineValidationInProgress').then(function(translation) {
      pipelineValidationInProgress = translation;
    });

    $translate('global.messages.validate.pipelineValidationSuccess').then(function(translation) {
      pipelineValidationSuccess = translation;
    });

    angular.extend($scope, {
      iconOnly: true,
      selectedSource: {},
      connectStage: {},

      /**
       * Callback function when Selecting Source from alert div.
       *
       */
      onSelectSourceChange: function() {
        var selectedStage = $scope.selectedSource.selected;
        $scope.trackEvent(pipelineConstant.STAGE_CATEGORY, pipelineConstant.ADD_ACTION, selectedStage.label, 1);
        $scope.pipelineConfig.issues = [];
        $scope.selectedSource = {};
        $scope.addStageInstance({
          stage: selectedStage
        });
      },

      /**
       * Callback function when selecting Processor/Target from alert div.
       */
      onConnectStageChange: function() {
        var connectStage = $scope.connectStage.selected;
        $scope.trackEvent(pipelineConstant.STAGE_CATEGORY, pipelineConstant.CONNECT_ACTION, connectStage.label, 1);
        $scope.addStageInstance({
          stage: connectStage,
          firstOpenLane: $scope.firstOpenLane
        });
        $scope.connectStage = {};
        $scope.firstOpenLane.stageInstance = undefined;
      },

      /**
       * Validate Pipeline
       */
      validatePipeline: function() {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Validate Pipeline', 1);
        $scope.$storage.maximizeDetailPane = false;
        $scope.$storage.minimizeDetailPane = false;
        $rootScope.common.infoList.push({
          message:pipelineValidationInProgress
        });
        api.pipelineAgent.validatePipeline($scope.activeConfigInfo.name).
          then(
          function (res) {
            $rootScope.common.infoList = [];
            $rootScope.common.successList.push({
              message: pipelineValidationSuccess
            });
          },
          function (res) {
            $rootScope.common.infoList = [];
            $rootScope.common.errors = [res.data];
          }
        );
      },

      /**
       * On Start Pipeline button click.
       *
       */
      startPipeline: function() {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Start Pipeline', 1);
        if($rootScope.common.pipelineStatus.state !== 'RUNNING') {
          var startResponse;
          $scope.$storage.maximizeDetailPane = false;
          $scope.$storage.minimizeDetailPane = false;
          $scope.$storage.readNotifications = [];
          $rootScope.common.pipelineMetrics = {};
          api.pipelineAgent.startPipeline($scope.activeConfigInfo.name, 0).
            then(
            function (res) {
              $scope.moveGraphToCenter();
              $rootScope.common.pipelineStatus = res.data;

              $timeout(function() {
                $scope.refreshGraph();
              });

            },
            function (res) {
              $rootScope.common.errors = [res.data];
            }
          );
        } else {
          $translate('home.graphPane.startErrorMessage', {
            name: $rootScope.common.pipelineStatus.name
          }).then(function(translation) {
            $rootScope.common.errors = [translation];
          });
        }
      },

      /**
       * On Stop Pipeline button click.
       *
       */
      stopPipeline: function() {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Stop Pipeline', 1);
        var modalInstance = $modal.open({
          templateUrl: 'app/home/header/stop/stopConfirmation.tpl.html',
          controller: 'StopConfirmationModalInstanceController',
          size: '',
          backdrop: 'static',
          resolve: {
            pipelineInfo: function () {
              return $scope.activeConfigInfo;
            }
          }
        });

        modalInstance.result.then(function(status) {
          $scope.moveGraphToCenter();
          $rootScope.common.pipelineStatus = status;
          $scope.refreshGraph();
        }, function () {

        });
      },


      /**
       * View the available snapshots.
       *
       */
      viewSnapshots: function() {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'View Snapshots', 1);
        var modalInstance = $modal.open({
          templateUrl: 'app/home/snapshot/modal/snapshotModal.tpl.html',
          controller: 'SnapshotModalInstanceController',
          size: '',
          backdrop: 'static',
          resolve: {
            pipelineConfig: function () {
              return $scope.pipelineConfig;
            },
            isPipelineRunning: function() {
              return $scope.isPipelineRunning;
            }
          }
        });

        modalInstance.result.then(function(snapshotName) {
          if(snapshotName) {
            $scope.viewSnapshot(snapshotName);
          }
        }, function () {

        });

      },


      /**
       * Reset Offset of pipeline
       *
       */
      resetOffset: function() {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Reset Offset', 1);
        var modalInstance = $modal.open({
          templateUrl: 'app/home/resetOffset/resetOffset.tpl.html',
          controller: 'ResetOffsetModalInstanceController',
          size: '',
          backdrop: 'static',
          resolve: {
            pipelineInfo: function () {
              return $scope.activeConfigInfo;
            }
          }
        });
      },

      /**
       * Callback function when Notification is clicked.
       *
       * @param alert
       */
      onNotificationClick: function(alert) {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Notification Message', 1);
        var edges = $scope.edges,
          edge;
        $scope.$storage.maximizeDetailPane = false;
        $scope.$storage.minimizeDetailPane = false;

        if(alert.type === 'METRIC_ALERT') {
          //Select Pipeline Config
          $scope.$broadcast('selectNode');
          $scope.changeStageSelection({
            selectedObject: undefined,
            type: pipelineConstant.PIPELINE
          });
        } else {
          //Select edge
          edge = _.find(edges, function(ed) {
            return ed.outputLane === alert.rule.lane;
          });

          $scope.changeStageSelection({
            selectedObject: edge,
            type: pipelineConstant.LINK
          });
        }
      },

      /**
       * Delete Selected Stage Instance/Stream
       */
      deleteSelection: function() {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Delete Selection', 1);
        $rootScope.$broadcast('deleteSelectionInGraph');
      },

      /**
       * Duplicate Stage
       */
      duplicateStage: function() {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Duplicate Stage', 1);
        if($scope.selectedType === pipelineConstant.STAGE_INSTANCE) {
          $scope.$emit('onPasteNode', $scope.selectedObject);
        }
      },

      /**
       * Auto arrange stages
       */
      autoArrange: function() {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Auto Arrange', 1);
        pipelineService.autoArrange($scope.pipelineConfig);
        $scope.refreshGraph();
      },

      /**
       * Delete Pipeline Configuration
       */
      deletePipelineConfig: function(pipelineInfo, $event) {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Delete Pipeline', 1);
        pipelineService.deletePipelineConfigCommand(pipelineInfo, $event);
      },

      /**
       * Duplicate Pipeline Configuration
       */
      duplicatePipelineConfig: function(pipelineInfo, $event) {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Duplicate Pipeline', 1);
        pipelineService.duplicatePipelineConfigCommand(pipelineInfo, $event);
      },

      /**
       * Import link command handler
       */
      importPipelineConfig: function(pipelineInfo, $event) {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Import Pipeline', 1);
        pipelineService.importPipelineConfigCommand(pipelineInfo, $event);
      },

      /**
       * Export link command handler
       */
      exportPipelineConfig: function(pipelineInfo, $event) {
        $scope.trackEvent(pipelineConstant.BUTTON_CATEGORY, pipelineConstant.CLICK_ACTION, 'Export Pipeline', 1);
        api.pipelineAgent.exportPipelineConfig(pipelineInfo.name);
      }
    });


    $scope.$on('bodyDeleteKeyPressed', function() {
      $scope.deleteSelection();
    });

  });