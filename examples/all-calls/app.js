/*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

/**
*  @file app.js
*  @author Rod Simpson (rod@apigee.com)
*
*  This file contains the main program logic for All Calls App.
*/
$(document).ready(function () {

  var client = new UsergridClient({orgId: "rwalsh", appId: "jssdktestapp", authMode: UsergridAuthMode.NONE});

  function hideAllSections(){
    $('#get-page').hide();
    $('#get-nav').removeClass('active');
    $('#post-page').hide();
    $('#post-nav').removeClass('active');
    $('#put-page').hide();
    $('#put-nav').removeClass('active');
    $('#delete-page').hide();
    $('#delete-nav').removeClass('active');
    $('#login-page').hide();
    $('#login-nav').removeClass('active');
    $('#response').html("// Press 'Run Query' to send the API call.");
  }
  //bind the show buttons
  $('#show-get').bind('click', function() {
    hideAllSections();
    $('#get-nav').addClass('active');
    $('#get-page').show();
  });

  $('#show-post').bind('click', function() {
    hideAllSections();
    $('#post-nav').addClass('active');
    $('#post-page').show();
  });

  $('#show-put').bind('click', function() {
    hideAllSections();
    $('#put-nav').addClass('active');
    $('#put-page').show();
  });

  $('#show-delete').bind('click', function() {
    hideAllSections();
    $('#delete-nav').addClass('active');
    $('#delete-page').show();
  });

  $('#show-login').bind('click', function() {
    hideAllSections();
    $('#login-nav').addClass('active');
    $('#login-page').show();
  });

  $('#run-get').bind('click', function() {
    _get();
  });

  $('#run-post').bind('click', function() {
    _post();
  });

  $('#run-put').bind('click', function() {
    _put();
  });

  $('#run-delete').bind('click', function() {
    _delete();
  });

  $('#run-login').bind('click', function() {
    _login();
  });

  //start with the get page showing by default
  $('#get-page').show();

  //bind the create new dog button
  $('#main-menu').bind('click', function() {
    $('#get-page').hide();
    $('#post-page').hide();
    $('#put-page').hide();
    $('#delete-page').hide();
    $('#login-page').hide();
    $('#main').show();
    $("#response").html('');
  });

  function _get() {
    var endpoint = $("#get-path").val();
    client.GET(endpoint, function(err,usergridResponse) {
      if (err) {
        $("#response").html('<pre>ERROR: '+JSON.stringify(err,null,2)+'</pre>');
      } else {
        $("#response").html('<pre>'+JSON.stringify(usergridResponse.entities,null,2)+'</pre>');
      }
    })
  }

  function _post() {
    var endpoint = $("#post-path").val();
    var data = $("#post-data").val();
    data = JSON.parse(data);
    client.POST(endpoint, data, function (err,usergridResponse) {
      if (err) {
        $("#response").html('<pre>ERROR: '+JSON.stringify(err,null,2)+'</pre>');
      } else {
        $("#response").html('<pre>'+JSON.stringify(usergridResponse.entity,null,2)+'</pre>');
      }
    });
  }

  function _put() {
    var endpoint = $("#put-path").val();
    var data = $("#put-data").val();
    data = JSON.parse(data);
    client.PUT(endpoint, data, function (err,usergridResponse) {
      if (err) {
        $("#response").html('<pre>ERROR: '+JSON.stringify(err,null,2)+'</pre>');
      } else {
        $("#response").html('<pre>'+JSON.stringify(usergridResponse.entity,null,2)+'</pre>');
      }
    });
  }

  function _delete() {
    var endpoint = $("#delete-path").val();
    client.DELETE(endpoint, function (err,usergridResponse) {
      if (err) {
        $("#response").html('<pre>ERROR: '+JSON.stringify(err,null,2)+'</pre>');
      } else {
        $("#response").html('<pre>'+JSON.stringify(usergridResponse.entity,null,2)+'</pre>');
      }
    });
  }

  function _login() {
    var username = $("#username").val();
    var password = $("#password").val();
    client.authenticateUser({username:username, password:password}, function (err,usergridResponse,token) {
      if (err) {
        $("#response").html('<pre>ERROR: '+JSON.stringify(err,null,2)+'</pre>');
      } else {
        $("#response").html('<pre>'+JSON.stringify(usergridResponse,null,2)+'</pre>');
      }
    });
  }
});