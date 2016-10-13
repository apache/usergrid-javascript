/*
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

$(document).ready(function () {

	  var client = new UsergridClient({orgId: "rwalsh", appId: "jssdktestapp", authMode: UsergridAuthMode.NONE}),
		  lastResponse,
		  lastQueryUsed,
		  previousCursors = [];

      var message = $('#message'),
          nextButton = $('#next-button'),
          previousButton = $('#previous-button'),
          dogsList = $('#dogs-list'),
          myDogList = $('#mydoglist'),
          newDog = $('#new-dog'),
          newDogButton = $('#new-dog-button'),
          createDogButton = $('#create-dog'),
          cancelCreateDogButton = $('#cancel-create-dog');

	  nextButton.bind('click', function() {
          message.html('');
          previousCursors.push(lastQueryUsed._cursor);
          lastQueryUsed = new UsergridQuery('dogs').desc('created').cursor(_.get(lastResponse,'responseJSON.cursor'));
          lastResponse.loadNextPage(client,function(usergridResponse) {
              handleGETDogResponse(usergridResponse)
          })
	  });

	  previousButton.bind('click', function() {
          message.html('');
		  var cursor = previousCursors.pop();
		  if( cursor === '' ) {
			  previousCursors = '';
			  cursor = undefined
		  }
		  drawDogs(cursor)
	  });

	  //bind the new button to show the "create new dog" form
      newDogButton.bind('click', function() {
          dogsList.hide();
          newDog.show();
	  });

	  //bind the create new dog button
      createDogButton.bind('click', function() {
		newdog();
	  });

	  //bind the create new dog button
      cancelCreateDogButton.bind('click', function() {
          newDog.hide();
          dogsList.show();
		drawDogs();
	  });

	  function drawDogs(cursor) {
		lastQueryUsed = new UsergridQuery('dogs').desc('created');
		if( cursor !== undefined && !_.isEmpty(cursor) ) {
			lastQueryUsed.cursor(cursor)
		}
		client.GET(lastQueryUsed,function(usergridResponse) {
            handleGETDogResponse(usergridResponse)
		});
	  }

	  function handleGETDogResponse(usergridResponse) {
          lastResponse = usergridResponse;
          if(lastResponse.error) {
              alert('there was an error getting the dogs');
          } else {
              myDogList.empty();
              nextButton.hide();
              previousButton.hide();

              _.forEach(lastResponse.entities,function(dog) {
                  myDogList.append('<li>'+ dog.name + '</li>');
              });

              if (lastResponse.hasNextPage) {
                  nextButton.show();
              }
              if (previousCursors.length > 0) {
                  previousButton.show();
              }
          }
	  }

	  function newdog() {
          createDogButton.addClass("disabled");

          var name = $("#name").val(),
              nameHelp = $("#name-help"),
              nameControl = $("#name-control");

          nameHelp.hide();
          nameControl.removeClass('error');

		if (Usergrid.validation.validateName(name, function (){
			    name.focus();
			    nameHelp.show();
			    nameControl.addClass('error');
			    nameHelp.html(Usergrid.validation.getNameAllowedChars());
                createDogButton.removeClass("disabled");})
		) {
			client.POST('dogs',{ name:name }, function(usergridResponse) {
				if (usergridResponse.error) {
                    alert('Oops! There was an error creating the dog. \n' + JSON.stringify(usergridResponse.error,null,2));
                    createDogButton.removeClass("disabled");
				} else {
                    message.html('New dog created!');
                    newDog.hide();
                    dogsList.show();
                    createDogButton.removeClass("disabled");
                    previousCursors = [];
                    drawDogs();
				}
			})
		}
	  }

	  drawDogs();
});
