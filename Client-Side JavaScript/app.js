console.log("I survived the fire at Sea Parks");

function createNewBoard() {

    var url = "https://veff-boards-hmv.herokuapp.com/api/v1/boards/"

    var boardname = document.getElementById("enterBoardname").value;

    newBoard = { name: boardname, description: "" };

    axios.post(url, newBoard)
        .then(function (response) {
            if (response.status === 201) {
                var board = createBoard("board" + response.data.id);
                var boardHeading = createBoardHeading(response.data.name);
                var createTaskName = createTaskNameForm(response.data.id);
                var taskList = createTaskList();
                var deleteBoardButton = createDeleteBoardButton();

                //Append elements to Board Div
                board.appendChild(deleteBoardButton);
                board.appendChild(boardHeading);
                board.appendChild(createTaskName);
                board.appendChild(taskList);

                document.getElementById("mainContent").appendChild(board);
            }
            else {
                console.log("STATUS: " + response.status);
                window.alert("Oops! Try again.");
            }
        })
        .catch(function (error) {
            console.log(error)
        })
};


function createBoard(boardID) {
    var board = document.createElement("div");
    var boardClass = document.createAttribute("class");
    boardClass.value = "board";

    var boardIDAttribute = document.createAttribute("id");
    boardIDAttribute.value = boardID;

    board.setAttributeNode(boardClass);
    board.setAttributeNode(boardIDAttribute);
    return board
}

function createDeleteBoardButton() {
    var deleteBoardButton = document.createElement("button");
    var deleteBoardButtonClass = document.createAttribute("class");
    deleteBoardButtonClass.value = "deleteBoard";
    var deleteBoardButtonOnClick = document.createAttribute("onclick");
    deleteBoardButtonOnClick.value = "deleteBoard(this)";
    var deleteBoardButtonText = document.createTextNode("X");
    var deleteBoardButtonType = document.createAttribute("type");
    deleteBoardButtonType.value = "button";

    deleteBoardButton.setAttributeNode(deleteBoardButtonClass);
    deleteBoardButton.setAttributeNode(deleteBoardButtonType);
    deleteBoardButton.setAttributeNode(deleteBoardButtonOnClick);
    deleteBoardButton.appendChild(deleteBoardButtonText);

    return deleteBoardButton
}

function createBoardHeading(boardname) {
    var boardHeading = document.createElement("h2");
    var boardHeadingClass = document.createAttribute("class");
    var boardHeadingText = document.createTextNode(boardname);

    boardHeadingClass.value = "boardName";

    boardHeading.setAttributeNode(boardHeadingClass);
    boardHeading.appendChild(boardHeadingText);

    return boardHeading
}

function createTaskNameForm(boardID) {
    var createTaskName = document.createElement("form");

    //Create Form inputs
    var createTaskTextbox = document.createElement("input");
    var createTaskButton = document.createElement("input");

    var createTaskTextboxClass = document.createAttribute("class");
    var createTaskTextboxType = document.createAttribute("type");
    var createTaskTextboxValue = document.createAttribute("value");
    var createTaskTextboxID = document.createAttribute("id");

    createTaskTextboxClass.value = "createTask";
    createTaskTextboxType.value = "text";
    createTaskTextboxValue.value = "Create new task";
    createTaskTextboxID.value = boardID + "createTaskTextbox";

    createTaskTextbox.setAttributeNode(createTaskTextboxClass);
    createTaskTextbox.setAttributeNode(createTaskTextboxType);
    createTaskTextbox.setAttributeNode(createTaskTextboxValue);
    createTaskTextbox.setAttributeNode(createTaskTextboxID);

    var createTaskButtonClass = document.createAttribute("class");
    var createTaskButtonType = document.createAttribute("type");
    var createTaskButtonValue = document.createAttribute("value");
    var createTaskButtonOnclick = document.createAttribute("onclick");

    createTaskButtonClass.value = "createTaskButton";
    createTaskButtonType.value = "button";
    createTaskButtonValue.value = "Create";
    createTaskButtonOnclick.value = "createNewTask(this)";


    createTaskButton.setAttributeNode(createTaskButtonClass);
    createTaskButton.setAttributeNode(createTaskButtonType);
    createTaskButton.setAttributeNode(createTaskButtonValue);
    createTaskButton.setAttributeNode(createTaskButtonOnclick);

    createTaskName.appendChild(createTaskTextbox);
    createTaskName.appendChild(createTaskButton);

    return createTaskName
}

function createTaskList() {
    var taskList = document.createElement("div");

    var taskListClass = document.createAttribute("class");
    taskListClass.value = "taskList";

    taskList.setAttributeNode(taskListClass);
    return taskList
}


function deleteBoard(delButton) {
    var board = delButton.parentNode;
    var boardID = board.id;

    url = "https://veff-boards-hmv.herokuapp.com/api/v1/boards/" + boardID.substring(5);
    axios.delete(url)
        .then(function (response) {
            console.log("Success: ", response.data);
        })
        .catch(function (error) {
            console.log("Error: ", error);
        })
        .then(function () {
        });


    board.remove();
}

function displayBoard(input_board, input_board_ID) {
    var boardname = input_board.name;
    var boardID = "board" + input_board_ID;

    var board = createBoard(boardID);
    var boardHeading = createBoardHeading(boardname);
    var createTaskName = createTaskNameForm(boardID);
    var taskList = createTaskList();
    var deleteBoardButton = createDeleteBoardButton();




    //Append elements to Board Div
    board.appendChild(deleteBoardButton);
    board.appendChild(boardHeading);
    board.appendChild(createTaskName);
    board.appendChild(taskList);

    //Populate the task list HTML element
    getTasksForBoard(boardID, taskList);

    document.getElementById("mainContent").appendChild(board);
}

function getAllBoards() {
    //The URL to which we will send the request
    var url = 'https://veff-boards-hmv.herokuapp.com/api/v1/boards/';

    //Perform a GET request to the url
    axios.get(url)
        .then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
                var board = response.data[i];
                displayBoard(board, board.id);
            }
        })
        .catch(function (error) {
            console.log(error);
        });

}

function getTasksForBoard(boardID, taskList) {
    //The URL to which we will send the request
    var url = 'https://veff-boards-hmv.herokuapp.com/api/v1/boards/' + boardID.substring(5) + '/tasks';
    console.log(url);

    //Perform a GET request to the url
    axios.get(url)
        .then(function (response) {
            fetchTaskList(boardID, response.data);
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
}

function fetchTaskList(boardID, task_objects) {
    var boardTaskList = document.getElementById(boardID).childNodes[3];
    console.log(typeof (boardTaskList));
    for (i = 0; i < task_objects.length; i++) {
        if (task_objects[i].archived === false && task_objects[i].taskName != "") {
            var task = addTask(task_objects[i].id, task_objects[i].taskName)
            boardTaskList.appendChild(task);
        }
    }
}

function addTask(taskID, taskName) {
    console.log(taskID);
    var task = document.createElement("div");
    var taskClass = document.createAttribute("class");
    var taskIdDiv = document.createAttribute("id");
    taskClass.value = "task";
    taskIdDiv.value = "task" + taskID;
    task.setAttributeNode(taskClass);
    task.setAttributeNode(taskIdDiv);

    var taskDescription = document.createElement("p");
    var taskDescriptionClass = document.createAttribute("class");
    taskDescriptionClass.value = "taskDescription";

    var taskDescriptionText = document.createTextNode(taskName);
    taskDescription.appendChild(taskDescriptionText);

    var deleteTaskButton = document.createElement("button");
    var deleteTaskButtonClass = document.createAttribute("class");
    var deleteTaskButtonType = document.createAttribute("type");
    var deleteTaskButtonOnClick = document.createAttribute("onclick");

    deleteTaskButtonType.value = "button"
    deleteTaskButtonClass.value = "deleteTask";
    deleteTaskButtonOnClick.value = "deleteTask(this)";

    deleteTaskButton.setAttributeNode(deleteTaskButtonClass);
    deleteTaskButton.setAttributeNode(deleteTaskButtonOnClick);
    deleteTaskButton.setAttributeNode(deleteTaskButtonType);

    var deleteTaskButtonText = document.createTextNode("X");
    deleteTaskButton.appendChild(deleteTaskButtonText);

    task.appendChild(deleteTaskButton);
    task.appendChild(taskDescription);

    return task
}

function deleteTask(delButton) {
    var task = delButton.parentNode;
    var boardID = task.parentNode.parentNode.id;

    url = "https://veff-boards-hmv.herokuapp.com/api/v1/boards/" + boardID.substring(5) + '/tasks/' + task.id.substring(4);
    axios.patch(url, { archived: true })
        .then(function (response) {
            console.log("Success: ", response.data);
            task.remove();
        })
        .catch(function (error) {
            console.log("Error: ", error);
        })
        .then(function () {
        });


}

function createNewTask(createTaskButton) {
    var board = createTaskButton.parentNode.parentNode;
    var boardID = board.id;

    var inputTaskName = document.getElementById(boardID + "createTaskTextbox").value;


    //The URL to which we will send the request
    var url = 'https://veff-boards-hmv.herokuapp.com/api/v1/boards/' + boardID.substring(5) + '/tasks';

    //Perform a 'POST' request to the url, and set the param 'taskName' in the request body to 'testApplicationTask'
    axios.post(url, { taskName: inputTaskName })
        .then(function (response) {
            console.log("Success: ", response.data);
            var boardTaskList = document.getElementById(boardID).childNodes[3];
            var task = addTask(response.data.id, inputTaskName);
            console.log("ID: " + response.data.id);
            boardTaskList.appendChild(task);
        })
        .catch(function (error) {
            console.log("Error: ", error);
        });
}

getAllBoards();

