$(document).on('ready', function () {
  var hasDuplicates = function (array) {
    var sortedValues = array.sort();
    for(var i = 1; i < sortedValues.length; i++) {
      if(sortedValues[i] && (sortedValues[i] === sortedValues[i-1])) {
        return true;
      }
    }
    return false;
  }

  var generateMatrix = function () {
    var rows = $('tr');
    var matrix = _.map(rows, function (row, rowIndex) {
      var cells = $(row).find('td');
      return _.map(cells, function (cell, cellIndex) {
        var value = $(cell).find('input').val();
        var set = value ? true : false;
        return {
          rowIndex: rowIndex,
          cellIndex: cellIndex,
          set: set,
          value: value
        }
      })
    });
    return matrix;
  }

  var hasRowConflictAt = function (rowIndex, matrix) {
    var row = matrix[rowIndex];
    var values = _.map(row, function (cell) {
      return (cell.value === "") ? undefined : +cell.value;
    });
    return hasDuplicates(values);
  }

  var hasRowConflicts = function (matrix) {
    for(var i = 0; i < matrix.length; i++) {
      if(hasRowConflictAt(i, matrix)) {
        return true;
      }
    }
    return false;
  }


  var hasColConflictAt = function (colIndex, matrix) {
    var colValues = _.map(matrix, function (row) {
      return +row[colIndex].value;
    });
    return hasDuplicates(colValues);
  }

  var hasColConflicts = function (matrix) {
    for(var i = 0; i < matrix.length; i++) {
      if(hasColConflictAt(i, matrix)) {
        return true;
      }
    }
    return false;
  }

  // rowGroup describes a grouping of rows as 1, 2, or 3, to describe the first, second, or third three rows, respectively
  // colGroup describes a grouping of cols as 1, 2, or 3, to describe the first, second, or third three cols, respectively
  // a group is therefore described in terms of a rowGroup and a colGroup, such as (2,2) for the center group

  var hasGroupConflictAt = function (rowGroup, colGroup, matrix) {
    var groups = {
      1: [0,3],
      2: [3,6],
      3: [6,9]
    }
    var rowGroupCoordinates = groups[rowGroup];
    var colGroupCoordinates = groups[colGroup];
    var group = [].slice.apply(matrix, rowGroupCoordinates).map(function (row) {
      return [].slice.apply(row, colGroupCoordinates);
    });
    var groupValues = _.flatten(group).map(function (cell) {
      return +cell.value;
    });
    var sortedValues = groupValues.sort();
    return hasDuplicates(sortedValues);
  }

  var hasGroupConflicts = function (matrix) {
    for(var rowGroupIndex = 1; rowGroupIndex < 4; rowGroupIndex++) {
      for(var colGroupIndex = 1; colGroupIndex < 4; colGroupIndex++) {
        if(hasGroupConflictAt(rowGroupIndex, colGroupIndex, matrix)) {
          return true;
        }
      }
    }
    return false;
  }

  var drawMatrix = function (matrix, solution) {
    var flat = _.flatten(matrix);
    
    if(solution) {
      flat = _.map(flat, function (cell) {
        return cell.value;
      })
    }

    $('input').each(function(index, input) {
      $(this).val(flat[index]);
    });
    // d3.selectAll('input')
    //   .data(flat)
    //   .val()


  }

  $('.solve')
    .on('click', function (e) {
      e.preventDefault();

      var matrix = generateMatrix();
      var hasConflicts = function () {
        return hasRowConflicts(matrix) || hasColConflicts(matrix) || hasGroupConflicts(matrix);
      }
      var setValue = function(rowIndex, colIndex, value) {
        matrix[rowIndex][colIndex].value = value;
      }
      var removeValue = function(rowIndex, colIndex) {
        matrix[rowIndex][colIndex].value = 0;
      }

      //helpers
      var mapValues = function () {
        return matrix.map(function (row) { 
          return row.map(function (cell) { 
            return cell.value;  
          });
        });
      }


      console.log('mapValues right before declaration', mapValues)

      var inner = function (rowIndex, colIndex, value, reverse) {
        // helper
        var rcv = function (r, c, v) {
          return _.isEqual([rowIndex, colIndex, value], [r,c,v]);
        }
        // end helper

        console.log('mapValues', mapValues)
        console.log('INNER:', '(',rowIndex,',', colIndex,')', 'value', value);

        var cell = matrix[rowIndex][colIndex];

        if(cell === undefined) { debugger; }
        if(cell.set) { // if the cell has been pre-set...
          if(reverse) {
            return inner(rowIndex, --colIndex, value);
          }
          if(colIndex < 8) {
            return inner(rowIndex, ++colIndex, 1); // move to the next column
          } else {
            return inner(++rowIndex, 0, 1);
          }
        } else if (!cell.set) { // otherwise...
          setValue(rowIndex, colIndex, value); // set the specified input
          var conflict = hasConflicts(); // check for conflicts
          if(conflict) { // if there is a conflict ...
            console.log('conflict, removing value:', '(',rowIndex,',', colIndex,')', 'value', value);
            removeValue(rowIndex, colIndex) // remove the value...
            if(value < 9) { // if the attempted input is less than 9...
              return inner(rowIndex, colIndex, ++value); // try with the next value up
            } else { // otherwise
              return false; // conflict is unavoidable using numbers 1-9 - go back down the line and change the values that came before
            }
          
          } else if (!conflict) { // if there is no conflict with the newly set value
            var nextColumn = colIndex < 8; // see if there is a next column
            var nextRow = rowIndex < 8; // see if there is a new row
            if(nextColumn) { // if there is a next column....
              var nextColWorks = inner(rowIndex, colIndex+1, 1); // move on to the next column and check to see if it provides a solution
              if(nextColWorks) { // if it provides a solution
                return nextColWorks; // return the solution
              } else { // otherwise
                console.log('currently at:', '(',rowIndex,',', colIndex,')', 'value', value);
                console.log('nextCol didnt work with current spread at:', '(',rowIndex,',', colIndex,')');
                if(value < 9) { // if the value is less than 9...
                  var initValue = value;
                  var nextValWorks = inner(rowIndex, colIndex, ++value); // remain in this column, increment value, and check for a solution
                  if(nextValWorks) { // if there is a solution...
                    return nextValWorks; // return it
                  } else { // otherwise
                    console.log('currently at:', '(',rowIndex,',', colIndex,')', 'value', value);
                    console.log('nextVal didnt work:', '(',rowIndex,',', colIndex,')', 'value', value, 'reverse', true);
                    // if(rcv(0,1,5)) { debugger; } 
                    return false
                    // return inner(rowIndex, colIndex, ++value);
                  }
                } else { // if the value is not less than 9...
                  return false; // end recursion
                }
              }
            } else if (nextRow) { // if there is no next column, see if there is a next row
              console.log('moving from row:', rowIndex, 'to next row:', rowIndex+1);
              return inner(rowIndex+1, 0, 1); // if so, move on to the next row
            } else if (!nextColumn && !nextRow) { // if we are on the last cell of the last row
              // return 'no next column or row'
              return matrix;
              // return matrix; // we have found a solution matrix, so we'll return it
            }
          }
        }
      }
      console.log('mapValues right after declaration', mapValues)
      
      var result = inner(0,0,1);
      console.log(result);
      drawMatrix(result, true);
    }); // end on click


  $('.clear')
    .on('click', function (e) {
      e.preventDefault();
      $('input').val('');
    });

  $('.play')
    .on('click', function (e) {
      e.preventDefault();

      drawMatrix([
        [3, "", "", "", 5, "", "", "", 2],
        ["", "", "", 9, "", 2, "", "", 8],
        [5, "", "", "", "", 4, "", 9, ""],
        [6, 3, "", "", 7, "", 8, "", ""],
        ["", "", "", "", "", "", 3, "", ""],
        ["", 1, 5, 6, "", 9, "", 4, ""],
        ["", 7, "", "", "", 1, "", 2, ""],
        ["", "", "", "", "", 6, "", "", 3],
        ["", "", "", 2, "", "", "", "", ""]
      ], false);

    });

  $('.tr1').find('.td1 input').focus();

}); // end on ready





// [
//   [
//     {
//       "rowIndex": 0,
//       "cellIndex": 0,
//       "set": true,
//       "value": "7"
//     },
//     {
//       "rowIndex": 0,
//       "cellIndex": 1,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 0,
//       "cellIndex": 2,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 0,
//       "cellIndex": 3,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 0,
//       "cellIndex": 4,
//       "set": true,
//       "value": "2"
//     },
//     {
//       "rowIndex": 0,
//       "cellIndex": 5,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 0,
//       "cellIndex": 6,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 0,
//       "cellIndex": 7,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 0,
//       "cellIndex": 8,
//       "set": true,
//       "value": "4"
//     }
//   ],
//   [
//     {
//       "rowIndex": 1,
//       "cellIndex": 0,
//       "set": true,
//       "value": "8"
//     },
//     {
//       "rowIndex": 1,
//       "cellIndex": 1,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 1,
//       "cellIndex": 2,
//       "set": true,
//       "value": "3"
//     },
//     {
//       "rowIndex": 1,
//       "cellIndex": 3,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 1,
//       "cellIndex": 4,
//       "set": true,
//       "value": "4"
//     },
//     {
//       "rowIndex": 1,
//       "cellIndex": 5,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 1,
//       "cellIndex": 6,
//       "set": true,
//       "value": "9"
//     },
//     {
//       "rowIndex": 1,
//       "cellIndex": 7,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 1,
//       "cellIndex": 8,
//       "set": true,
//       "value": "7"
//     }
//   ],
//   [
//     {
//       "rowIndex": 2,
//       "cellIndex": 0,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 2,
//       "cellIndex": 1,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 2,
//       "cellIndex": 2,
//       "set": true,
//       "value": "2"
//     },
//     {
//       "rowIndex": 2,
//       "cellIndex": 3,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 2,
//       "cellIndex": 4,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 2,
//       "cellIndex": 5,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 2,
//       "cellIndex": 6,
//       "set": true,
//       "value": "3"
//     },
//     {
//       "rowIndex": 2,
//       "cellIndex": 7,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 2,
//       "cellIndex": 8,
//       "set": false,
//       "value": ""
//     }
//   ],
//   [
//     {
//       "rowIndex": 3,
//       "cellIndex": 0,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 3,
//       "cellIndex": 1,
//       "set": true,
//       "value": "7"
//     },
//     {
//       "rowIndex": 3,
//       "cellIndex": 2,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 3,
//       "cellIndex": 3,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 3,
//       "cellIndex": 4,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 3,
//       "cellIndex": 5,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 3,
//       "cellIndex": 6,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 3,
//       "cellIndex": 7,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 3,
//       "cellIndex": 8,
//       "set": false,
//       "value": ""
//     }
//   ],
//   [
//     {
//       "rowIndex": 4,
//       "cellIndex": 0,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 4,
//       "cellIndex": 1,
//       "set": true,
//       "value": "6"
//     },
//     {
//       "rowIndex": 4,
//       "cellIndex": 2,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 4,
//       "cellIndex": 3,
//       "set": true,
//       "value": "9"
//     },
//     {
//       "rowIndex": 4,
//       "cellIndex": 4,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 4,
//       "cellIndex": 5,
//       "set": true,
//       "value": "5"
//     },
//     {
//       "rowIndex": 4,
//       "cellIndex": 6,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 4,
//       "cellIndex": 7,
//       "set": true,
//       "value": "1"
//     },
//     {
//       "rowIndex": 4,
//       "cellIndex": 8,
//       "set": false,
//       "value": ""
//     }
//   ],
//   [
//     {
//       "rowIndex": 5,
//       "cellIndex": 0,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 5,
//       "cellIndex": 1,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 5,
//       "cellIndex": 2,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 5,
//       "cellIndex": 3,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 5,
//       "cellIndex": 4,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 5,
//       "cellIndex": 5,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 5,
//       "cellIndex": 6,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 5,
//       "cellIndex": 7,
//       "set": true,
//       "value": "8"
//     },
//     {
//       "rowIndex": 5,
//       "cellIndex": 8,
//       "set": false,
//       "value": ""
//     }
//   ],
//   [
//     {
//       "rowIndex": 6,
//       "cellIndex": 0,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 6,
//       "cellIndex": 1,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 6,
//       "cellIndex": 2,
//       "set": true,
//       "value": "9"
//     },
//     {
//       "rowIndex": 6,
//       "cellIndex": 3,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 6,
//       "cellIndex": 4,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 6,
//       "cellIndex": 5,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 6,
//       "cellIndex": 6,
//       "set": true,
//       "value": "6"
//     },
//     {
//       "rowIndex": 6,
//       "cellIndex": 7,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 6,
//       "cellIndex": 8,
//       "set": false,
//       "value": ""
//     }
//   ],
//   [
//     {
//       "rowIndex": 7,
//       "cellIndex": 0,
//       "set": true,
//       "value": "4"
//     },
//     {
//       "rowIndex": 7,
//       "cellIndex": 1,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 7,
//       "cellIndex": 2,
//       "set": true,
//       "value": "6"
//     },
//     {
//       "rowIndex": 7,
//       "cellIndex": 3,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 7,
//       "cellIndex": 4,
//       "set": true,
//       "value": "5"
//     },
//     {
//       "rowIndex": 7,
//       "cellIndex": 5,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 7,
//       "cellIndex": 6,
//       "set": true,
//       "value": "8"
//     },
//     {
//       "rowIndex": 7,
//       "cellIndex": 7,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 7,
//       "cellIndex": 8,
//       "set": true,
//       "value": "1"
//     }
//   ],
//   [
//     {
//       "rowIndex": 8,
//       "cellIndex": 0,
//       "set": true,
//       "value": "5"
//     },
//     {
//       "rowIndex": 8,
//       "cellIndex": 1,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 8,
//       "cellIndex": 2,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 8,
//       "cellIndex": 3,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 8,
//       "cellIndex": 4,
//       "set": true,
//       "value": "3"
//     },
//     {
//       "rowIndex": 8,
//       "cellIndex": 5,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 8,
//       "cellIndex": 6,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 8,
//       "cellIndex": 7,
//       "set": false,
//       "value": ""
//     },
//     {
//       "rowIndex": 8,
//       "cellIndex": 8,
//       "set": true,
//       "value": "2"
//     }
//   ]
// ]



