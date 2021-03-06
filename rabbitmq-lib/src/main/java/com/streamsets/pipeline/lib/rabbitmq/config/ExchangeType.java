/**
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
package com.streamsets.pipeline.lib.rabbitmq.config;

import com.streamsets.pipeline.api.Label;

public enum ExchangeType implements Label {
  DIRECT("Direct", "direct"),
  FANOUT("Fanout", "fanout"),
  TOPIC("Topic", "topic"),
  //TODO: Support for headers exchange. HEADERS("Headers", "headers"),
  ;

  private final String label;
  private final String value;

  ExchangeType(String label, String value) {
    this.label = label;
    this.value = value;
  }

  @Override
  public String getLabel() {
    return label;
  }

  public String getValue() { return value; }

}
