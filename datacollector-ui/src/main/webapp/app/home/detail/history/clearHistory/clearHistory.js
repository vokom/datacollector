/*
 * Copyright 2017 StreamSets Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Controller for Clean History Modal.
 */

angular
  .module('dataCollectorApp.home')
  .controller('ClearHistoryModalInstanceController', function ($scope, $modalInstance, pipelineInfo, api) {
    angular.extend($scope, {
      issues: [],
      pipelineInfo: pipelineInfo,

      yes: function() {
        api.pipelineAgent.clearHistory(pipelineInfo.pipelineId).
          success(function() {
            $modalInstance.close(pipelineInfo);
          }).
          error(function(data) {
            $scope.issues = [data];
          });
      },
      no: function() {
        $modalInstance.dismiss('cancel');
      }
    });
  });
