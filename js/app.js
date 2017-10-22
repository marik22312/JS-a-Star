var app = angular.module("myApp", []);

  /*
  *  Modes:
  *  0 - set route/wall
  *  1 - set start
  *  2 - set end
  */

app.controller("mainCtrl", mainCtrl);

function mainCtrl($scope){

  $scope.mode = 0;
  $scope.mazeRows = 12; // number of rows
  $scope.mazeCols = 12; // number of columns

  $scope.tiles = new Array($scope.mazeRows);

  var openSet = [];
  var closedSet = [];
  var path;
  $scope.finished = false;
  $scope.stepCount = 0;

  var startPoint = undefined;
  var endPoint = undefined;

  $scope.Cell = function(row, col){
    this.row = row; //cell X dir
    this.col = col; // cell Y

    this.isStart = false;
    this.isEnd = false;
    this.isWall = false;
    this.isPath = false;

    this.f = 0;
    this.g = 0;
    this.h = 0;

    this.neighbors = [];
    this.previous = undefined;

    this.setValue = function(){
      switch ($scope.mode) {
        case 0:
          _setWall(this);
          break;
        case 1:
          _setStart(this);
          startPoint = this;
          break;

        case 2:
          _setEnd(this);
          endPoint = this;
          break;

        default:
          console.log("Bad Mode");
          break;
      }
    } /* this.setValue; */

    this.addNeighbors = function(grid){
      var row = this.row;
      var col = this.col;

      if (row < $scope.mazeCols - 1) {
        this.neighbors.push(grid[row + 1][col]);
      }
      if (row > 0) {
        this.neighbors.push(grid[row - 1][col]);
      }
      if (col < $scope.mazeRows - 1) {
        this.neighbors.push(grid[row][col + 1]);
      }
      if (col > 0) {
        this.neighbors.push(grid[row][col - 1]);
      }
    } /* this.addNeighbors */
  } /* $scope.Cell */
  //generete new array
  $scope.init = function(){
    /* reset all */
    var openSet = [];
    var closedSet = [];
    var path;
    
    $scope.finished = false;
    $scope.stepCount = 0;

    var startPoint = undefined;
    var endPoint = undefined;
    //Set a new grid array
    for (let i = 0; i < $scope.mazeRows; i++) {
      $scope.tiles[i] = new Array($scope.mazeCols);
    }

    //define initial value of 0 to all cells
    arr = $scope.tiles;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        $scope.tiles[i][j] = new $scope.Cell(i,j);
      }
    }

    //define initial value of 0 to all cells
    arr = $scope.tiles;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        arr[i][j].addNeighbors(arr);
      }
    }
  } /* $scope.init() */

  function _setWall(cell){
     if (cell.isWall) {
       cell.isWall = false;
     } else {
       cell.isWall = true;
     }
     return;
  };
  function _setStart(cell){
      if (cell.isEnd) _clearBoard("end");
    _clearBoard("start");
    cell.isWall = false;
    cell.isStart = true;
    $scope.mode = 0;
  };
  function _setEnd(cell){
    if (cell.isStart) _clearBoard("start");
    _clearBoard("end");
    cell.isWall = false;
    cell.isEnd = true;
    $scope.mode = 0;
  };

  function _clearBoard(t){
    arr = $scope.tiles;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        switch (t) {
          case "start":
            arr[i][j].isStart = false
            break;

          case "end":
            arr[i][j].isEnd = false
            break;
          default:
            break;
        }
      }
    }
  }; /* _clearBoard */

  function removeFromArray(arr, ele){
    for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i] == ele) {
                arr.splice(i, 1);
            }
        }
  } /* removeFromArray */

  function distance(x1, y1, x2, y2){
    var dist, powX, powY, sumX, sumY;
    sumX = x1-x2;
    sumY = y1-y2;
    powX = Math.pow(sumX, 2);
    powY = Math.pow(sumY, 2);

    dist = Math.sqrt(powX + powY);

    return dist;
  } /* distance() */

  $scope.Debug = function(){
    console.log("Start Point is:",startPoint);
    console.log("end Point is:",endPoint);
    console.log("openSet is:",openSet);
    console.log("Cells Are:", $scope.tiles);
    console.log("path:", path);
  }

  $scope.startGame = function(){
    if (typeof(startPoint) === 'undefined') {
      console.log("No Starting Point")
      return;
    }
    if (typeof(endPoint) === 'undefined') {
      console.log("No Ending Point")
      return;
    }
    openSet = [startPoint];
    var stepCount = 0;

    var nextSpot = 0;
    var count = 0;
    while (openSet.length > 0) {
      // debugger;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[nextSpot].f) {
          nextSpot = i;
        }
      } /* for loop */

      var currentSpot = openSet[nextSpot];
      var neighbors = currentSpot.neighbors;

      if (currentSpot === endPoint) {
        path = [];
        var temp = currentSpot;
        path.push(temp);
        while (temp.previous) {
          path.push(temp.previous);
          temp = temp.previous;

          for (let i = 0; i < path.length; i++) {
            if ((!path[i].isStart) && (!path[i].isEnd)) {
              path[i].isPath = true;
            }
          }
        }
        arr = $scope.tiles;
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length; j++) {
            if (arr[i][j].isPath) {
              $scope.stepCount++;
            }
          }
        }
        $scope.finished = true;
        console.log("END in", $scope.stepCount);
        break;
      } else {
        removeFromArray(openSet, currentSpot);
        closedSet.push(currentSpot);
      }
      for (let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];

        if (!closedSet.includes(neighbor) && !neighbor.isWall) {
          var tempG = currentSpot.g + 1;

          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
            }
          } else {
            neighbor.g = tempG;
            openSet.push(neighbor);
          }

          neighbor.h = distance(neighbor.col, neighbor.row, endPoint.col, endPoint.row);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = currentSpot;
        }

      }
    } /* while loop */
    if (openSet.length <= 0) {
      console.log("No Solution");
    }
  } /* startGame(); */
  } /* END of controller */
