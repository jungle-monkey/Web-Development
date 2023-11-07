
// Computer Science - Spring Semester 2021

// Project name: Project Assignment 3
// Description: RESTful task boards API using node.js

// Group: mara, solmundur

// File name: index.js
// File version: 0.2.1 alpha
// File date: 2021-03-11
// Internal file version: 2021-03-11-42a-merge4-nolog

const veff_nodejs_project_3_server_app_version_string = '2021-03-11-42a-merge4-nolog';
const veff_nodejs_project_3_server_app_heroku_deployed_url = "https://veff213-cs2021-pa-3-group-33.herokuapp.com";

/* SHR comment: node.js app setup starts here */

// Import express module to be able make application an express app:
const express = require('express');

// Import a body-parser module to be able to access the request body as json:
const bodyParser = require('body-parser');

// Use cors to avoid issues with testing on localhost:
const cors = require('cors');

// Make veff_nodejs_app an express app here:
const veff_nodejs_app = express();

// HTTP Port 3000 environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

// Tell express to use the body parser module
veff_nodejs_app.use(bodyParser.json());

// Tell express to use cors -- enables CORS for this backend
veff_nodejs_app.use(cors());  

/* SHR comment: node.js app setup ends here */



// VEFF213 comment: The following is an example of an array of three boards.
var veff_boards = [
    { id: '0', name: "Planned", description: "Everything that's on the todo list.", tasks: ["0","1","2"] },
    { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: [] },
    { id: '3', name: "Done", description: "Completed tasks.", tasks: ["3"] }
];

var veff_tasks = [
    { id: '0', boardId: '0', taskName: "Another task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false },
    { id: '1', boardId: '0', taskName: "Prepare exam draft", dateCreated: new Date(Date.UTC(2021, 00, 21, 16, 48)), archived: false },
    { id: '2', boardId: '0', taskName: "Discuss exam organisation", dateCreated: new Date(Date.UTC(2021, 00, 21, 14, 48)), archived: false },
    { id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true }
];

// SHR comment: Application specific contants defined below:

const veff_application_entry_location = "/api/v1/";

// Boolean: Define if we want to log to console.log and log extra debugging information:
const veff_debug_logging = false;
const veff_console_logging = false;

// SHR comment: HTTP specifis status code constants defined below:

const http_success = 200;

const http_created = 201;

const http_request_not_valid = 400;
const http_resource_not_found = 404;
const http_unsupported_resource_request = 405;

const http_get_successful = http_success;
const http_patch_successful = http_success;
const http_put_successful = http_success;
const http_delete_successful = http_success;

const http_post_successfully_created = http_created;

const http_error_request_not_valid = http_request_not_valid;
const http_error_resource_does_not_exist = http_resource_not_found; 


// SHR comment: Application specific arrays and variables defined below:

var veff_error_response_array = [
{ http_status: '400', veff_board_response_string: 'Bad Request: Board ID Not Found.' },
{ http_status: '404', veff_board_response_string: 'Error: Resource not found.' } ];
const http_not_valid_index = 0;
const http_not_found_index = 1;

var veff_current_board_id_number = -1;    // This variable stores the board id number currently being processed, init to -1 which means no boards do exist
var veff_current_task_id_number = -1;     // This variable stores the task id number currently being processed, init to -1 which means no tasks do exist
var veff_current_tasks_array = [];        // Array containing task numbers of the current board being processed
var veff_next_board_id_number = -1;       // This variable stores the next board id number to be created, init to -1 which means no boards do exist
var veff_next_task_id_number = -1;        // This variable stores the next task id number to be created, init to -1 which means no tasks do exist
var veff_current_board_array_index = -1;  // This variable stores the board id array index currently being processed, init to -1 which means no boards do exist
var veff_current_task_array_index = -1;   // This variable stores the task id array index currently being processed, init to -1 which means no tasks do exist

// SHR comment: Application specific functions defined below:

// SHR comment: The following function returns true if a board id in veff_boards array is found using given input parameter veff_board_id_to_look_for.
// -- The function sets the veff_current_board variable veff_current_board_id_number if board id was successfully found in veff_boards array.
// -- The function returns true if matching board id was found, otherwise returns false.
function veff_check_if_board_exists(veff_board_id_to_look_for) {
  veff_board_id_as_number = Number(veff_board_id_to_look_for);

  if ( veff_board_id_as_number != NaN ) {
    for ( current_veff_board_counter = 0 ; current_veff_board_counter < veff_boards.length ; current_veff_board_counter ++) {
      current_board_id_as_number = Number(veff_boards[current_veff_board_counter].id);
      if ( current_board_id_as_number == veff_board_id_as_number ) {
        veff_current_board_id_number = current_board_id_as_number;    // Global variable to be used inside endpoints.
        veff_current_board_array_index = current_veff_board_counter;  // Global variable to be used inside endpoints.
        return true;
      }
    }
  }

  return false;
}


// SHR comment: The following function returns true if a task id in veff_tasks array is found using given input parameter veff_task_id_to_look_for.
// -- The function sets the veff_current_task variable veff_current_task_id_number if task id was successfully found in veff_tasks array.
// -- The function returns true if matching task id was found, otherwise returns false.
function veff_check_if_task_exists(veff_task_id_to_look_for) {
  veff_task_id_as_number = Number(veff_task_id_to_look_for);

  if ( veff_task_id_as_number != NaN ) {
    for ( current_veff_task_counter = 0 ; current_veff_task_counter < veff_tasks.length ; current_veff_task_counter ++) {
      current_task_id_as_number = Number(veff_tasks[current_veff_task_counter].id);
      if ( current_task_id_as_number == veff_task_id_as_number ) {
        veff_current_task_id_number = current_task_id_as_number;    // Global variable to be used inside endpoints.
        veff_current_task_array_index = current_veff_task_counter;  // Global variable to be used inside endpoints.
        return true;
      }
    }
  }

  return false;
}


// SHR comment: Function tries to find the highest board id number from the veff_boards array of JSON objects.
// -- The function both sets and returns the veff_next_board_id_number variable.
function veff_find_highest_board_id() {
  if ( veff_boards.length > 0 ) {
    for ( current_veff_board_counter = 0 ; current_veff_board_counter < veff_boards.length ; current_veff_board_counter ++) {
      current_board_id_as_number = Number(veff_boards[current_veff_board_counter].id);
      if ( current_board_id_as_number > veff_next_board_id_number ) {
        veff_next_board_id_number = current_board_id_as_number;
      }
      if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: current_board_id_as_number is : ' + current_board_id_as_number ); }
    }
    if ( veff_next_board_id_number >= 0 ) {
      veff_next_board_id_number++;
    }
  }

  return veff_next_board_id_number;
}


// SHR comment: Function tries to find the highest tasks id number from the veff_tasks array of JSON objects.
// -- The function both sets and returns the veff_next_task_id_number variable.
function veff_find_highest_task_id() {
  if ( veff_tasks.length > 0 ) {
    for ( current_veff_task_counter = 0 ; current_veff_task_counter < veff_tasks.length ; current_veff_task_counter ++) {
      current_task_id_as_number = Number(veff_tasks[current_veff_task_counter].id);
      if ( current_task_id_as_number > veff_next_task_id_number ) {
        veff_next_task_id_number = current_task_id_as_number;
      }
            if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: current_task_id_as_number is : ' + current_task_id_as_number ); }
    }
    if ( veff_next_task_id_number >= 0 ) {
      veff_next_task_id_number++;
    }
  }

  return veff_next_task_id_number;
}



// SHR comment: Function checks if all tasks have the archived attribute set in selected board, selected at array index from input parameter.
// -- The function returns true if all checks pass, otherwise false.
function veff_check_all_tasks_archived( veff_board_at_array_index_to_check ) {
  for ( current_veff_board_task_index_counter = 0 ; current_veff_board_task_index_counter < veff_boards[ veff_board_at_array_index_to_check ].tasks.length ; current_veff_board_task_index_counter ++ )
    {
      veff_current_task_id_to_check = veff_boards[ veff_board_at_array_index_to_check ].tasks[ current_veff_board_task_index_counter ];

      for ( veff_tasks_array_counter = 0 ; veff_tasks_array_counter < veff_tasks.length ; veff_tasks_array_counter++ )
        {
          if ( veff_tasks[ veff_tasks_array_counter ].taskId = veff_current_task_id_to_check && veff_tasks[ veff_tasks_array_counter ].archived == false )
            {
              return false;
            }
        }
    }

  return true;
}


// VEFF213 comment: Your endpoints go here



// **  **  **  **  **  **  **  **  **
// **  **  **  **  **  **  **  **  **
// SHR comment: VEFF213 --- ENDPOINTS for BOARDS follow - Internal data resource : veff_boards
// **  **  **  **  **  **  **  **  **
// **  **  **  **  **  **  **  **  **


/* HTTP GET request to: http://127.0.0.1:3000/ 
*  request: The request sent to the server
*  response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: 1
// Endpoint name: Read all booards
veff_nodejs_app.get( veff_application_entry_location + "boards", function(boards_get_request, boards_get_response) {

  // Return a response with the status 200 and a json object containing all the filtered veff_boards:

// Mara's code starts here:
    var veff_boards_filtered_array = [];

    for (var i = 0; i < veff_boards.length; i++) {
        var returned_board_object = { //Creating new board object without the tasks array 
            id: veff_boards[i].id,
            name: veff_boards[i].name,
            description: veff_boards[i].description
        };
        veff_boards_filtered_array.push(returned_board_object);
      } // Mara's code ends here.

  return boards_get_response.status( http_get_successful ).json( veff_boards_filtered_array );
});



/* HTTP GET request to: http://127.0.0.1:3000/ 
*  request: The request sent to the server
*  response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: 2
// Endpoint name: Read board by given boardID
// Returns all tasks of selected board
veff_nodejs_app.get( veff_application_entry_location + "boards/:boardId", function(board_get_request, board_get_response){
  let veff_board_id = board_get_request.params.boardId;
  let veff_board_id_as_number = Number(veff_board_id);

  console.log(' VEFF213: veff_nodejs_app.get request made to boards :boardId , requesting board id: ' + veff_board_id + ' which is a JS typeof: ' + typeof veff_board_id + ' with the Number() value: ' + veff_board_id_as_number);

  var veff_board_id_found = veff_check_if_board_exists ( veff_board_id );

  if ( veff_board_id_found == true )
    {
      veff_current_tasks_numbers_array = veff_boards[ veff_current_board_array_index ].tasks;
      veff_current_tasks_json_array = [];

      for ( current_task_array_counter = 0 ; current_task_array_counter < veff_current_tasks_numbers_array.length ; current_task_array_counter ++ )
        {
          veff_current_tasks_json_array.push(veff_tasks[veff_current_tasks_numbers_array[current_task_array_counter]]);

          if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: veff_current_tasks_json_array is : ' + JSON.stringify(veff_current_tasks_json_array) ); }
        }

    }  // if statement closed here
  else { return board_get_response.status( http_resource_not_found ).json( veff_error_response_array [ http_not_found_index] ); }

  let requested_veff_board_object = veff_boards[ veff_current_board_array_index ];
  
  if ( veff_console_logging == true ) { console.log(' VEFF213: Requested board JSON contents are : ' + JSON.stringify( requested_veff_board_object )); }

  // Return a response with the status 200 and a json object containing all the veff213 tasks from board with the id requested by :id :
  return board_get_response.status( http_get_successful ).json( veff_current_tasks_json_array );

});


/* HTTP POST request to: http://127.0.0.1:3000/ 
*  boards_post_request: The request sent to the server
*  boards_post_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: 3
// Endpoint name: Create new booard
// Returns newly created board with all attributes, including task array
veff_nodejs_app.post( veff_application_entry_location + "boards", (boards_post_request, boards_post_response) => {

  console.log(' VEFF213 :: HTTP POST Request to Server: ' + JSON.stringify(boards_post_request.body) + ' :: Which is a JS typeof: ' + typeof boards_post_request.body );

  // The current working board gets the number value of veff_next_board_id_number :
  let veff_board_id_as_number = veff_next_board_id_number;

  // Grab the expressjs POST parameters from the 'body' object:
  let veff_new_board_name = boards_post_request.body.name;
  let veff_new_board_description = boards_post_request.body.description;

  if ( veff_new_board_name == undefined || veff_new_board_name == "" || veff_new_board_description == undefined ) {
    return boards_post_response.status( http_error_request_not_valid ).json( veff_error_response_array [ http_not_valid_index ] );
  }

    // Create new VEFF board object:
 
    veff_new_board_object = {
      id: veff_board_id_as_number,
      name: veff_new_board_name,
      description: veff_new_board_description,
      tasks: []  // The newly created board tasks array is empty by default
    };

    // Use JavaScript Array Push method to add the new board JSON object to the veff_boards array:
    veff_boards.push(veff_new_board_object);

    // Increment veff_next_board_id_number counter:
    veff_next_board_id_number++;

    // Return HTTP status code 201 "created" as response and respond with veff_new_board_object as JSON:
    return boards_post_response.status( http_post_successfully_created ).json( veff_new_board_object );
  
} );


/* HTTP PATCH request to: http://127.0.0.1:3000/ 
*  board_patch_request: The request sent to the server
*  board_patch_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: 4
// Endpoint name: Update board by :boardId
// Returns all attributes of the updated board if successful
veff_nodejs_app.patch( veff_application_entry_location + "boards/:boardId", (board_patch_request, board_patch_response) => {

    let veff_board_id = board_patch_request.params.boardId;
    let veff_board_id_as_number = Number(veff_board_id);

  if ( veff_check_if_board_exists ( veff_board_id ) == true )
    {
      let requested_veff_board_object = veff_boards[ veff_current_board_array_index ];

      if ( veff_console_logging == true ) { console.log(' VEFF213 :: HTTP PATCH board with id Request to Server: ' + JSON.stringify(patch_request) + ' on board id: ' + veff_board_id); }

      if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: Current veff_boards array is : ' + JSON.stringify( veff_boards ) );
        console.log(' -- VEFF213 debug: Current veff_tasks array is : ' + JSON.stringify( veff_tasks ) ); }

// Mara's code starts here:
      for (var i = 0; i < boards.length; i++) {
          if (veff_boards[i].id == veff_board_id) { // Found board by boardId ?
              var veff_active_tasks_flag = false;
              for (var j = 0; j < tasks.length; j++){
                  if (veff_tasks[j].boardId == veff_board_id && veff_tasks[j].archived == false){
                    veff_active_tasks_flag = true;
                  }
              }
              if (veff_active_tasks_flag == true){
                  return board_patch_response.status( http_error_request_not_valid ).send("Unable to update board. Board has active tasks."); // Send status 400.
              }
              else {
                  veff_boards[i].name = board_patch_request.body.name;
                  veff_boards[i].description = board_patch_request.body.description;

              }
              break;
          }
      } // Mara's code ends here.

    if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: Current veff_boards array is : ' + JSON.stringify( veff_boards ) );
      console.log(' -- VEFF213 debug: Current veff_tasks array is : ' + JSON.stringify( veff_tasks ) ); }

    return board_patch_response.status( http_patch_successful ).json(veff_boards[ veff_current_board_array_index ]); // Send status code 200 and deleted board object.
    }
  else { return board_patch_response.status( http_resource_not_found ).json( veff_error_response_array [ http_not_found_index] ); }

} );


/* HTTP DELETE request to: http://127.0.0.1:3000/ 
*  delete_request: The request sent to the server
*  delete_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: 5
// Endpoint name: Delete board by :boardId
// Returns deleted board contents if successful
veff_nodejs_app.delete( veff_application_entry_location + "boards/:boardId", (board_delete_request, board_delete_response) => {

  let veff_board_id = board_delete_request.params.boardId;
  let veff_board_id_as_number = Number(veff_board_id);

//    let requested_veff_board_object = veff_boards[veff_board_id];

  if ( veff_console_logging == true ) {
     console.log(' VEFF213 :: HTTP DELETE board with id Request to Server: ' + board_delete_request + ' on board id: ' + veff_board_id + ' which has board id as number ' + veff_board_id_as_number );
   }

  if ( veff_check_if_board_exists ( veff_board_id ) == true )
    {
    if ( veff_check_all_tasks_archived ( veff_current_board_array_index ) == true )
      {
// Mara's code starts here:
      for (var i = 0; i < veff_boards.length; i++) {
        if (veff_boards[i].id == board_delete_request.params.boardId)
          {
            var veff_deleted_board_object = veff_boards.splice(i,1);
          }
        } // Mara's code ends here.
      }
      else { return board_delete_response.status( http_error_request_not_valid ).send("Unable to update board. Board has active tasks."); }

      return board_delete_response.status( http_delete_successful ).json( veff_deleted_board_object );
    }
  else { return board_delete_response.status( http_error_request_not_valid ).json( veff_error_response_array [ http_not_found_index ] ).send("Board not found"); }

} );


/* HTTP DELETE request to: http://127.0.0.1:3000/ 
*  delete_request: The request sent to the server
*  delete_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: 6
// Endpoint name: Delete all boards
// Returns content of merged deleted board contents if successful
veff_nodejs_app.delete( veff_application_entry_location + "boards", (boards_delete_request, boards_delete_response) => {

  if ( veff_console_logging == true ) { console.log(' VEFF213 :: HTTP DELETE all boards Request to Server: ' + boards_delete_request ); }

  // Only runs code when veff_board array is not already empty:
  if ( veff_boards.length > 0 )
    {

/*
    var current_task_object = {};
    var deleted_boards_tasks_joined = [];

    for ( veff_boards_index = 0 ; veff_boards_index < veff_boards.length ; veff_boards_index ++ )
      {
         for ( veff_board_tasks_index = 0 ; veff_board_tasks_index < veff_boards[veff_boards_index].tasks.length ; veff_boards_tasks_index ++ )
           {
              for ( veff_all_tasks_index = 0 ; veff_all_tasks_index < veff_tasks.length ; veff_all_tasks_index ++ ) {
                if ( veff_tasks[veff_all_tasks_index] == veff_boards[veff_boards_index].tasks[veff_board_tasks_index] )
                  {
                     current_task_object = veff_tasks[veff_all_tasks_index];
                     break;
                  }
           }
         current_task_object = . . . ; 
      }
*/

// Mara's code starts here:
    var veff_deleled_boards = veff_boards.splice(0, veff_boards.length);
    var veff_deleled_tasks = veff_tasks.splice(0, veff_tasks.length);
    var veff_combined_arrays = veff_deleled_boards.concat(veff_deleted_tasks);

// Mara's code ends here.

      return boards_delete_response.status( http_delete_successful ).json( veff_combined_arrays );
    }
  else { return boards_delete_response.status( http_error_request_not_valid ).json( veff_error_response_array [ http_not_valid_index ]); }

} );



// **  **  **  **  **  **  **  **  **
// **  **  **  **  **  **  **  **  **
// SHR comment: VEFF213 --- ENDPOINTS for TASKS follow - Internal data resource : veff_tasks
// **  **  **  **  **  **  **  **  **
// **  **  **  **  **  **  **  **  **


// --- TASKS edition ---
/* HTTP GET request to: http://127.0.0.1:3000/ 
*  tasks_get_request: The request sent to the server
*  tasks_get_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: Tasks -- 1
// Endpoint name: Get all tasks from board using :boardId
// Returns all tasks from selected board, performs sorting according to "sort" query parameter
veff_nodejs_app.get( veff_application_entry_location + "boards/:boardId/tasks", function(tasks_get_request, tasks_get_response) {

  let veff_board_id = tasks_get_request.params.boardId;
  let veff_board_id_as_number = Number(veff_board_id);

  var veff_board_id_found = veff_check_if_board_exists ( veff_board_id );
  if ( veff_console_logging == true ) {
      console.log(' VEFF213: Tasks GET :: veff_nodejs_app.get request made to boards :id , requesting board id: ' + veff_board_id + ' which is a JS typeof: ' + typeof veff_board_id + ' with the Number() value: ' + veff_board_id_as_number);
      console.log(' VEFF213: Tasks GET :: veff_nodejs_app.get expressJS query parameters in tasks_get_request.query: ' + JSON.stringify(tasks_get_request.query) + ' which is a JS typeof ' + typeof tasks_get_request.query);
    }

  if ( veff_board_id_found == true )
    {
      veff_current_tasks_numbers_array = veff_boards[veff_current_board_array_index].tasks;
      veff_current_tasks_json_array = [];

      for ( current_task_array_counter = 0 ; current_task_array_counter < veff_current_tasks_numbers_array.length ; current_task_array_counter ++ )
        {
          veff_current_tasks_json_array.push(veff_tasks[veff_current_tasks_numbers_array[current_task_array_counter]]);

          if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: veff_current_tasks_json_array is : ' + JSON.stringify( veff_current_tasks_json_array ) ); }
        }

    // SHR comment: Logging to console.log
    let requested_veff_board_object = veff_boards[veff_current_board_array_index];
    console.log(' VEFF213: requested board ' + JSON.stringify( requested_veff_board_object ));
    
    if ( tasks_get_request.query.sort != "")
      {
         if ( tasks_get_request.query.sort == "taskName" )
           {
             if ( veff_console_logging == true ) { console.log(' VEFF213: Tasks :: GET - Sorting by taskName.'); }
             return tasks_get_response.status( http_get_successful ).json( veff_current_tasks_json_array.sort((a,b) => {
                    var nameA = a.taskName.toUpperCase();
                    var nameB = b.taskName.toUpperCase();
                    if (nameA < nameB) { return -1; }
                    if (nameA> nameB) { return 1; }
                    else { return 0; } 
                    }) );
           }
         else if ( tasks_get_request.query.sort == "id" )
           {
             if ( veff_console_logging == true ) { console.log(' VEFF213: Tasks :: GET - Sorting by id.'); }
             return tasks_get_response.status( http_get_successful ).json( veff_current_tasks_json_array.sort( function(a, b) { return Number(a.id) - Number(b.id); } ) );
           }
         else if ( tasks_get_request.query.sort == "dateCreated" )
           {
             if ( veff_console_logging == true ) { console.log(' VEFF213: Tasks :: GET - Sorting by dateCreated.'); }
             return tasks_get_response.status( http_get_successful ).json( veff_current_tasks_json_array.sort( function(a, b) { return Number(a.dateCreated) - Number(b.dateCreated); } ) );
           }
         else
          {
            if ( veff_console_logging == true ) { console.log(' VEFF213: Tasks :: GET - Not sorting at all, wrong paramater!'); }
            return tasks_get_response.status( http_get_successful ).json( veff_current_tasks_json_array );
          }
      }
    else 
      {
        // Return a response with the status 200 and a JSON object containing all the veff213 tasks from board with the id requested by :id :
        return tasks_get_response.status( http_get_successful ).json( veff_current_tasks_json_array );
      }
  }
  else { return tasks_get_response.status( http_resource_not_found ).json( veff_error_response_array [ http_not_found_index] ); }

});


// --- TASKS edition ---
/* HTTP GET request to: http://127.0.0.1:3000/ 
*  task_get_request: The request sent to the server
*  task_get_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: Tasks -- 2
// Endpoint name: Get specific task as :taskId from board using :boardId
// Returns selected task from selected board
veff_nodejs_app.get( veff_application_entry_location + "boards/:boardId/tasks/:taskId", function(task_get_request, task_get_response) {

  let veff_board_id = task_get_request.params.boardId;
  let veff_board_id_as_number = Number(veff_board_id);

  let veff_task_id = task_get_request.params.taskId;
  let veff_task_id_as_number = Number(veff_task_id);

  if ( veff_console_logging == true ) {
      console.log(' VEFF213: Tasks :: veff_nodejs_app.get request made to boards :id , requesting board id: ' + veff_board_id + ' which is a JS typeof: ' + typeof veff_board_id + ' with the Number() value: ' + veff_board_id_as_number);
      console.log(' VEFF213: Tasks :: veff_nodejs_app.get request made to tasks :id , requesting task id: ' + veff_task_id + ' which is a JS typeof: ' + typeof veff_task_id + ' with the Number() value: ' + veff_task_id_as_number);
    }

  // 1. Check if both :boardId and :taskId are valid as numbers after conversion from string.
  // 2. Check if :boardId found in veff_boards array and :taskId found in veff_tasks array.

  var veff_board_id_found = veff_check_if_board_exists ( veff_board_id );
  if ( veff_board_id_found == true )
    {
      var veff_task_id_found = veff_check_if_task_exists ( veff_task_id );
      if ( veff_task_id_found == true ) 
        {
          veff_current_tasks_numbers_array = veff_boards[veff_current_board_array_index].tasks;

          veff_current_tasks_json_array = veff_tasks[veff_current_tasks_numbers_array[veff_current_task_array_index]];

          if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: veff_current_tasks_json_array is : ' + JSON.stringify( veff_current_tasks_json_array ) ); }
    
          // Return a response with the status 200 and a JSON object containing the selected task from the veff213 tasks from board with the id requested by :boardId :
          return task_get_response.status( http_get_successful ).json( veff_current_tasks_json_array );
        }
      else { return task_get_response.status( http_resource_not_found ).json( veff_error_response_array [ http_not_found_index] ).send('Task not found by taskId.'); }  // Send status 404.
    }
  else { return task_get_response.status( http_resource_not_found ).json( veff_error_response_array [ http_not_found_index] ).send('Board not found by boardId.'); }  // Send status 404.

});


// --- TASKS edition ---
/* HTTP POST request to: http://127.0.0.1:3000/ 
*  tasks_post_request: The request sent to the server
*  tasks_post_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: Tasks -- 3
// Endpoint name: Create new task on board using :boardId
// Returns newly created tasks from selected board
veff_nodejs_app.post( veff_application_entry_location + "boards/:boardId/tasks", (tasks_post_request, tasks_post_response) => {

  if ( veff_console_logging == true ) {
      console.log(' VEFF213 :: HTTP POST Request to Server at boards using boardId and to tasks ' + JSON.stringify(tasks_post_request.body) + ' :: Which is a JS typeof: ' + typeof tasks_post_request );
    }

  let veff_board_id = tasks_post_request.params.boardId;

  let veff_board_id_as_number = Number(veff_board_id);

  let veff_new_task_name = tasks_post_request.body.taskName;

// SHR comment: Only creates a new task if taskName is not empty!

  if ( veff_check_if_board_exists ( veff_board_id ) == true && veff_new_task_name != "" ) {

    // Get task creation time timestamp using Date()
    current_task_creation_timestamp = new Date();
    veff_new_task_id = veff_next_task_id_number.toString();

    // Create new VEFF task object: 
    veff_new_task_object = {
      id: veff_new_task_id,
      boardId: veff_board_id,
      taskName: veff_new_task_name,
      dateCreated: Date.UTC(current_task_creation_timestamp),
      archived: false };

    if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: Current veff_boards array is : ' + JSON.stringify( veff_boards ) );
      console.log(' -- VEFF213 debug: Current veff_tasks array is : ' + JSON.stringify( veff_tasks ) ); }

    // Use JavaScript Array Push method to add the new task JSON object to the veff_tasks array:
    veff_tasks.push(veff_new_task_object);

    // Update veff_next_task_id_number counter:
    veff_next_task_id_number++;

    // Update the array list in the JSON object of the currently selected board:
    veff_boards[ veff_current_board_array_index ].tasks.push( veff_new_task_object.id );
    
    if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: Current veff_boards array is : ' + JSON.stringify( veff_boards ) );
      console.log(' -- VEFF213 debug: Current veff_tasks array is : ' + JSON.stringify( veff_tasks ) ); }
   
    return tasks_post_response.status( http_post_successfully_created ).json( veff_new_task_object ); // Send status 201.
  } 
  else { return tasks_post_response.status( http_resource_not_found ).json( veff_error_response_array [ http_not_found_index] ).send('Board not found by boardId or taskName empty.'); }  // Send status 404.
  
} );


// --- TASKS edition ---
/* HTTP DELETE request to: http://127.0.0.1:3000/ 
*  task_delete_request: The request sent to the server
*  task_delete_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: Tasks -- 4
// Endpoint name: Delete task selected as :taskId on board using :boardId
// Returns deleted task from selected board
veff_nodejs_app.delete( veff_application_entry_location + "boards/:boardId/tasks/:taskId", (task_delete_request, task_delete_response) => {

  let veff_board_id = task_delete_request.params.boardId;
  let veff_board_id_as_number = Number(veff_board_id);

  let veff_task_id = task_delete_request.params.taskId;
  let veff_task_id_as_number = Number(veff_task_id);

  if ( veff_console_logging == true ) {
      console.log(' VEFF213: Tasks :: veff_nodejs_app.delete request made to boards :boardId , requesting board id: ' + veff_board_id + ' which is a JS typeof: ' + typeof veff_board_id + ' with the Number() value: ' + veff_board_id_as_number);
      console.log(' VEFF213: Tasks :: veff_nodejs_app.delete request made to task :taskId , requesting task id: ' + veff_task_id + ' which is a JS typeof: ' + typeof veff_task_id + ' with the Number() value: ' + veff_task_id_as_number);
    }

  // 1. Check if both :boardId and :taskId are valid as numbers after conversion from string.
  // 2. Check if :boardId found in veff_boards array and :taskId found in veff_tasks array.

  var veff_board_id_found = veff_check_if_board_exists ( veff_board_id );
  if ( veff_board_id_found == true )
    {
      var veff_task_id_found = veff_check_if_task_exists ( veff_task_id );

      if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: Current veff_boards array is : ' + JSON.stringify( veff_boards ) );
        console.log(' -- VEFF213 debug: Current veff_tasks array is : ' + JSON.stringify( veff_tasks ) ); }
     
      if ( veff_task_id_found == true )
        {

// Mara's code starts here:
            for (var i = 0; i < veff_tasks.length; i++) {
                if (veff_tasks[i].id == task_delete_request.params.taskId) { //Is taskid the same?
                    
                    for (var j =0; j < veff_boards.length; j++) { //Iteration through boards 

                        if (veff_boards[j].id == task_delete_request.params.boardId) { // Is the boardid the same?

                            for (var k = 0; k < veff_boards[j].tasks.length; k++) { //Iteration through all the tasks for that board

                                if (veff_boards[j].tasks[k] == task_delete_request.params.taskId) { // Is the taskid the same as in the board array?
                                    veff_boards[j].tasks.splice(k,1);
                                }
                            }
                        }
                    }
                    var veff_deleted_task = veff_tasks.splice(i,1);

                }
            } // Mara's code ends here.

// SHR code continues here:
        }
      else { return task_delete_response.status( http_resource_not_found ).send("Task with id: " + task_delete_request.params.taskId + " not found"); }       

      if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: Current veff_boards array is : ' + JSON.stringify( veff_boards ) );
        console.log(' -- VEFF213 debug: Current veff_tasks array is : ' + JSON.stringify( veff_tasks ) ); }

      return task_delete_response.status( http_delete_successful ).json( veff_deleted_task );
    }
  else { return task_delete_response.status( http_resource_not_found ).send("Board with id: " + task_delete_request.params.boardId + " not found"); } 

// SHR comment: Mocked return statement for testing purposes only:


} );


// --- TASKS edition ---
/* HTTP PATCH request to: http://127.0.0.1:3000/ 
*  task_patch_request: The request sent to the server
*  task_patch_response: The response you want to send back
*/

// VEFF213 Project Assignment 3   ---   ENDPOINT   ---   Number: Tasks -- 5
// Endpoint name: Partially update task selected as :taskId on board using :boardId
// Returns updated task if successful
veff_nodejs_app.patch( veff_application_entry_location + "boards/:boardId/tasks/:taskId", (task_patch_request, task_patch_response) => {

  let veff_board_id = task_patch_request.params.boardId;
  let veff_board_id_as_number = Number(veff_board_id);

  let veff_task_id = task_patch_request.params.taskId;
  let veff_task_id_as_number = Number(veff_task_id);

  if ( veff_console_logging == true ) {
      console.log(' VEFF213: Tasks :: veff_nodejs_app.patch request made to boards :boardId , requesting board id: ' + veff_board_id + ' which is a JS typeof: ' + typeof veff_board_id + ' with the Number() value: ' + veff_board_id_as_number);
      console.log(' VEFF213: Tasks :: veff_nodejs_app.patch request made to task :taskId , requesting task id: ' + veff_task_id + ' which is a JS typeof: ' + typeof veff_task_id + ' with the Number() value: ' + veff_task_id_as_number);
      console.log(' VEFF213: Tasks :: expressJS PATCH body object contents: ' + JSON.stringify( task_patch_request.body ) );
    }

  // 1. Check if both :boardId and :taskId are valid as numbers after conversion from string.
  // 2. Check if :boardId found in veff_boards array and :taskId found in veff_tasks array.

  var veff_board_id_found = veff_check_if_board_exists ( veff_board_id );

  if ( veff_board_id_found == true ) {
      var veff_task_id_found = veff_check_if_task_exists ( veff_task_id );
    }
  else {
      return task_patch_response.status( http_resource_not_found ).send("Board with id: " + task_patch_request.params.boardId + " not found");
    }

  if ( veff_task_id_found == true )
    {
    let veff_task_updated_task_name = task_patch_request.body.taskName;
    let veff_task_updated_board_id = task_patch_request.body.boardId;
    let veff_task_updated_archived_status = task_patch_request.body.archived;

    console.log(' VEFF213: Updated name: ' + veff_task_updated_task_name + '     :: Updated boardId: ' + veff_task_updated_board_id + '     :: Updated archived status: ' + veff_task_updated_archived_status );

    if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: Current veff_boards array is : ' + JSON.stringify( veff_boards ) );
      console.log(' -- VEFF213 debug: Current veff_tasks array is : ' + JSON.stringify( veff_tasks ) ); }

// Mara's code starts here:
            for (var i = 0; i < veff_tasks.length; i++) {
                if (veff_tasks[i].id == veff_task_id) { //Is taskid the same?
                    if (veff_task_updated_board_id != undefined) { //Checking whether there is a change in the body (site text)
                        veff_tasks[i].boardId = veff_task_updated_board_id;
                    }
                    if (veff_task_updated_task_name != undefined) {
                        veff_tasks[i].taskName = veff_task_updated_task_name;
                    }
                    if (veff_task_updated_archived_status != undefined) {
                        veff_tasks[i].archived = veff_task_updated_archived_status;
                    }

// Debugging line added:
    if ( veff_debug_logging == true ) { console.log(' -- VEFF213 debug: Current veff_boards array is : ' + JSON.stringify( veff_boards ) );
      console.log(' -- VEFF213 debug: Current veff_tasks array is : ' + JSON.stringify( veff_tasks ) ); }

                    return task_patch_response.status( http_patch_successful ).json( veff_tasks[i] ); // Send status code 200 and current updated task.
                }
            } // Mara's code ends here.

// SHR code continues here:

    }
    else { return task_patch_response.status( http_resource_not_found ).send("Task with id: " + task_patch_request.params.taskId + " not found"); }  

} );



// SHR comment: VEFF213 --- Server startup procedure follows, inits variables to starting values for both next board id and next task id:


/* Start the node.js server here below and output greeting message and version info using console.log() : */

veff_nodejs_app.listen(port, () => {
  console.log('VEFF213 :: Welcome to the mara20 and solmundur20 node.js web server, version: ' + veff_nodejs_project_3_server_app_version_string);
  console.log('VEFF213 :: node.js JavaScript event app is listening on HTTP port number: ' + port);
  console.log('VEFF213 :: This node.js server should be found deployed at Heroku at: ' + veff_nodejs_project_3_server_app_heroku_deployed_url);
  console.log('VEFF213 :: The API should be running and available online at: ' + veff_nodejs_project_3_server_app_heroku_deployed_url + veff_application_entry_location);
  
  // The following code tries to find the highest veff_boards id number and then inits the veff_next_board_id_number variable:
  veff_find_highest_board_id();
  if ( veff_next_board_id_number >= 0 ) {
    console.log('VEFF213 :: veff_boards array found. Next board id number found being number: ' + veff_next_board_id_number);
  }
  else {
    veff_next_board_id_number = 0;
    console.log('VEFF213 :: veff_boards array empty. Next board id number is: ' + veff_next_board_id_number);
  }

  // The following code tries to find the highest veff_tasks id number and then inits the veff_next_task_id_number variable:
  veff_find_highest_task_id();
  if ( veff_next_task_id_number >= 0 ) {
    console.log('VEFF213 :: veff_tasks array found. Next task id number found being number: ' + veff_next_task_id_number);
  }
  else {
    veff_next_task_id_number = 0;
    console.log('VEFF213 :: veff_tasks array empty. Next task id number is: ' + veff_next_task_id_number);
  }
 
});

