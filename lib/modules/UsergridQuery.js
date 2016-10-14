/*
 *Licensed to the Apache Software Foundation (ASF) under one
 *or more contributor license agreements.  See the NOTICE file
 *distributed with this work for additional information
 *regarding copyright ownership.  The ASF licenses this file
 *to you under the Apache License, Version 2.0 (the
 *"License"); you may not use this file except in compliance
 *with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0

 *Unless required by applicable law or agreed to in writing,
 *software distributed under the License is distributed on an
 *"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *KIND, either express or implied.  See the License for the
 *specific language governing permissions and limitations
 *under the License.
 *
 *  @author ryan bridges (rbridges@apigee.com)
 */

'use strict';

var UsergridQuery = function(type) {

    var self = this;

    var query = '',
        queryString,
        sort,
        urlTerms = {},
        __nextIsNot = false;

    self._type = type;

    // builder pattern
    _.assign(self, {
        type: function(value) {
            self._type = value;
            return self;
        },
        collection: function(value) {
            self._type = value;
            return self;
        },
        limit: function(value) {
            self._limit = value;
            return self;
        },
        cursor: function(value) {
            self._cursor = value;
            return self;
        },
        eq: function(key, value) {
            query = self.andJoin(key + ' ' + UsergridQueryOperator.EQUAL + ' ' + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        equal: this.eq,
        gt: function(key, value) {
            query = self.andJoin(key + ' ' + UsergridQueryOperator.GREATER_THAN + ' ' + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        greaterThan: this.gt,
        gte: function(key, value) {
            query = self.andJoin(key + ' ' + UsergridQueryOperator.GREATER_THAN_EQUAL_TO + ' ' + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        greaterThanOrEqual: this.gte,
        lt: function(key, value) {
            query = self.andJoin(key + ' ' + UsergridQueryOperator.LESS_THAN + ' ' + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        lessThan: this.lt,
        lte: function(key, value) {
            query = self.andJoin(key + ' ' + UsergridQueryOperator.LESS_THAN_EQUAL_TO + ' ' + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        lessThanOrEqual: this.lte,
        contains: function(key, value) {
            query = self.andJoin(key + ' contains ' + UsergridHelpers.useQuotesIfRequired(value));
            return self;
        },
        locationWithin: function(distanceInMeters, lat, lng) {
            query = self.andJoin('location within ' + distanceInMeters + ' of ' + lat + ', ' + lng);
            return self;
        },
        asc: function(key) {
            self.sort(key, UsergridQuerySortOrder.ASC);
            return self;
        },
        desc: function(key) {
            self.sort(key, UsergridQuerySortOrder.DESC);
            return self;
        },
        sort: function(key, order) {
            sort = (key && order) ? (' order by ' + key + ' '  + order) : '';
            return self;
        },
        fromString: function(string) {
            queryString = string;
            return self;
        },
        urlTerm: function(key,value) {
            if( key === 'ql' ) {
                self.fromString();
            } else {
                urlTerms[key] = value;
            }
            return self;
        },
        andJoin: function(append) {
            if (__nextIsNot) {
                append = 'not ' + append;
                __nextIsNot = false;
            }
            if (!append) {
                return query;
            } else if (query.length === 0) {
                return append;
            } else {
                return (_.endsWith(query, 'and') || _.endsWith(query, 'or')) ? (query + ' ' + append) : (query + ' and ' + append);
            }
        },
        orJoin: function() {
            return (query.length > 0 && !_.endsWith(query, 'or')) ? (query + ' or') : query;
        }
    });

    // public accessors
    Object.defineProperty(self, '_ql', {
        get: function() {
            var ql = 'select * ';
            if (queryString !== undefined) {
                ql = queryString;
            } else {
                ql += ((query.length > 0) ? 'where ' + (query || '') : '');
                ql += ((sort !== undefined) ? sort : '');
            }
            return ql;
        }
    });

    Object.defineProperty(self, 'encodedStringValue', {
        get: function() {
            var self = this;
            var limit = self._limit;
            var cursor = self._cursor;
            var requirementsString = self._ql;
            var returnString = undefined;

            if( limit !== undefined ) {
                returnString = 'limit' + UsergridQueryOperator.EQUAL + limit;
            }
            if( !_.isEmpty(cursor) ) {
                var cursorString = 'cursor' + UsergridQueryOperator.EQUAL + cursor;
                if( _.isEmpty(returnString) ) {
                    returnString = cursorString;
                } else {
                    returnString += '&' + cursorString;
                }
            }
            _.forEach(urlTerms,function(value,key) {
                var encodedURLTermString = encodeURIComponent(key) + UsergridQueryOperator.EQUAL + encodeURIComponent(value);
                if( _.isEmpty(returnString) ) {
                    returnString = encodedURLTermString;
                } else {
                    returnString += '&' + encodedURLTermString;
                }
            });
            if( !_.isEmpty(requirementsString) ) {
                var qLString = 'ql=' + encodeURIComponent(requirementsString);
                if( _.isEmpty(returnString) ) {
                    returnString = qLString;
                } else {
                    returnString += '&' + qLString;
                }
            }

            if( !_.isEmpty(returnString) ) {
                returnString = '?' + returnString;
            }
            return !_.isEmpty(returnString) ? returnString : undefined;
        }
    });

    Object.defineProperty(self, 'and', {
        get: function() {
            query = self.andJoin('');
            return self;
        }
    });

    Object.defineProperty(self, 'or', {
        get: function() {
            query = self.orJoin();
            return self;
        }
    });

    Object.defineProperty(self, 'not', {
        get: function() {
            __nextIsNot = true;
            return self;
        }
    });

    return self;
};
