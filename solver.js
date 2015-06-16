$(document).on('ready', function () {
  var hasDuplicates = function (array) {
    // debugger
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
      var mapValues = function () {
        return matrix.map(function (row) { 
          return row.map(function (cell) { 
            return cell.value;  
          });
        });
      }
      console.log('mapValues right before declaration', mapValues)

      var inner = function (rowIndex, colIndex, value) {
        var cell = matrix[rowIndex][colIndex];
        console.log('INNER:','rowIndex', rowIndex, 'colIndex', colIndex, 'value', value);
        if(cell.set) { // if the cell has been pre-set...
          return inner(rowIndex, ++colIndex, 1); // move to the next column
        } else if (!cell.set) { // otherwise...
          // console.log('setting value:','rowIndex', rowIndex, 'colIndex', colIndex, 'value', value);
          setValue(rowIndex, colIndex, value); // set the specified input
          var conflict = hasConflicts(); // check for conflicts
          if(conflict) { // if there is a conflict ...
            // console.log('Conflict...removing value:','rowIndex', rowIndex, 'colIndex', colIndex, 'value', value);
            removeValue(rowIndex, colIndex) // remove the value...
            if(value < 9) { // if the attempted input is less than 9...
              // console.log('value is less than 9, checking possibility of next value at:','rowIndex', rowIndex, 'colIndex', colIndex, 'value', value+1);
              // var possibleSoFar = inner(rowIndex, colIndex, ++value); // try again with a higher value
              // if (possibleSoFar) {
              //   console.log('POSSIBLE!!','rowIndex', rowIndex, 'colIndex', colIndex, 'value', value);
              //   return possibleSoFar;
              // } else {
              //   console.log('not possible at:','rowIndex', rowIndex, 'colIndex', colIndex, 'value', value+1);
              //   debugger
                // return inner(rowIndex, ++colIndex, )
              // }
              /* PRIOR IMPLEMENTATION */
              return inner(rowIndex, colIndex, ++value); 
            } else { // otherwise
              debugger
              return false; // conflict is unavoidable using numbers 1-9 - go back down the line and change the values that came before
            }
          } else if (!conflict) { // if there is no conflict with the newly set value
            var nextColumn = colIndex < 8; // see if there is a next column
            var nextRow = rowIndex < 8; // see if there is a new row
            if(nextColumn) { // if there is a new column....
              var nextColWorks = inner(rowIndex, ++colIndex, 1); // move on to the next column and check to see if it provides a solution
              if(nextColWorks) { // if it provides a solution
                return nextColWorks; // return the solution
              } else { // otherwise
                console.log('nextCol didnt work:','rowIndex', rowIndex, 'colIndex', colIndex, 'value', value);
                debugger
                var nextValWorks = inner(rowIndex, colIndex, ++value); // stay in this column and increment the value
                if(nextValWorks) {
                  return nextValWorks;
                } else {
                  console.log('nextVal didnt work:','rowIndex', rowIndex, 'colIndex', colIndex, 'value', value);
                  debugger
                  return false;  
                }
              }
            } else if (nextRow) { // if there is no next column, see if there is a next row
              console.log('nextRow', rowIndex+1);
              return inner(++rowIndex, 0, 1); // if so, move on to the next row
            } else if (!nextColumn && !nextRow) { // if we are on the last cell of the last row
              return 'no next column or row'
              // return matrix; // we have found a solution matrix, so we'll return it
            }
          }
        }
      }
      console.log('mapValues right after declaration', mapValues)
      
      var result = inner(0,0,1);
      console.log(result);
    }); // end on click


  $('.clear')
    .on('click', function (e) {
      e.preventDefault();
      $('input').val('');
    });

  $('.tr1').find('.td1 input').focus();

}); // end on ready









