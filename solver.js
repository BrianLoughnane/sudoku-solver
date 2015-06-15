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

  var setValue = function(rowIndex, colIndex, matrix, value) {
    matrix[rowIndex][colIndex] = value;
  }

  var removeValue = function(rowIndex, colIndex, matrix) {
    matrix[rowIndex][colIndex] = 0;
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

  var hasConflicts = function (matrix) {
    return hasRowConflicts(matrix) || hasColConflicts(matrix) || hasGroupConflicts(matrix);
  }

  $('.solve')
    .on('click', function (e) {
      e.preventDefault();

      var matrix = generateMatrix();
      var inner = function (rowIndex, colIndex) {

      }

      inner(0,0);

      // var firstRow = matrix[0];
      // for(var colIndex = 0; colIndex < firstRow.length; colIndex++) {
      //   var cell = firstRow[colIndex];
      //   if(cell.set === false) {

      //   }
      // }

      // console.log('hasRowConflicts', hasRowConflicts(matrix));
      // console.log('hasColConflicts', hasColConflicts(matrix));
      // console.log('hasGroupConflicts', hasGroupConflicts(matrix));
      // console.log('hasConflicts', hasConflicts(matrix));
    }); // end on click


  $('.clear')
    .on('click', function (e) {
      e.preventDefault();
      $('input').val('');
    });

  $('.tr1').find('.td1 input').focus();

}); // end on ready









