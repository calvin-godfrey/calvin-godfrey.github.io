window.onload = function(){
  var canvas = document.getElementById("canvas");
  canvas.width = screen.width;
  canvas.height = screen.height;
  var width = canvas.width;
  var height = canvas.height;
  var ctx = canvas.getContext("2d");
  var rule, range, numColors, ruleBase, useRandom;
  var ruleArray = [];
  var currRow = [];
  var prevRow = [];
  var currHeight = 0;
  var alpha = "0123456789abcdefghijklmnopqrstuvwxyz";
  var colorArray = [];
  ctx.translate(0.5, 0.5); //anti-aliasing

  function convertBase(val, from_base, to_base) { //THIS FUNCTION IS NOT MY CODE, I RUTHLESSLY STOLE IT FROM https://gist.github.com/ryansmith94/91d7fd30710264affeb9
    var from_range = alpha.slice(0, from_base);
    var to_range = alpha.slice(0, to_base);

    var dec_value = val.split('').reverse().reduce(function (carry, digit, index) {
      if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `'+digit+'` for base '+from_base+'.');
      return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
    }, 0);

    var new_value = '';
    while (dec_value > 0) {
      new_value = to_range[dec_value % to_base] + new_value;
      dec_value = (dec_value - (dec_value % to_base)) / to_base;
    }
    return new_value || '0';
  }

  function generateColors(){
    var redStart = +document.getElementById("redStart").value;
    var blueStart = +document.getElementById("blueStart").value;
    var greenStart = +document.getElementById("greenStart").value;
    var redEnd = +document.getElementById("redEnd").value;
    var blueEnd = +document.getElementById("blueEnd").value;
    var greenEnd = +document.getElementById("greenEnd").value;

    if(!(0<=redStart<=255)||!(0<=blueStart<=255)||!(0<=greenStart<=255)||!(0<=redEnd<=255)||!(0<=greenEnd<=255)||!(0<=blueEnd<=255)){
      alert("Invalid colors");
      return;
    }
    var between = colors - 2; //start and end account for two
    var baseRedStart = convertBase(redStart+"", 10, 16);
    if(baseRedStart.length == 1)baseRedStart = "0"+baseRedStart;
    var baseBlueStart = convertBase(blueStart+"", 10, 16);
    if(baseBlueStart.length == 1)baseBlueStart = "0"+baseBlueStart;
    var baseGreenStart = convertBase(greenStart+"", 10, 16);
    if(baseGreenStart.length == 1)baseGreenStart = "0"+baseGreenStart;
    colorArray.push("#"+baseRedStart+baseGreenStart+baseBlueStart);
    if(between == 0){
      var baseRedEnd = convertBase(redEnd+"", 10, 16);
      if(baseRedEnd.length == 1)baseRedEnd = "0"+baseRedEnd;
      var baseBlueEnd = convertBase(blueEnd+"", 10, 16);
      if(baseBlueEnd.length == 1)baseBlueEnd = "0"+baseBlueEnd;
      var baseGreenEnd = convertBase(greenEnd+"", 10, 16);
      if(baseGreenEnd.length == 1)baseGreenEnd = "0"+baseGreenEnd;
      colorArray.push("#"+baseRedEnd+baseGreenEnd+baseBlueEnd);
      return;
    }
    for(var i=1;i<=between;i++){
      var redMiddle = Math.round(redStart + (redEnd-redStart)/(between+1)*i);
      var greenMiddle = Math.round(greenStart + (greenEnd-greenStart)/(between+1)*i);
      var blueMiddle = Math.round(blueStart + (blueEnd-blueStart)/(between+1)*i);
      var baseRedMiddle = convertBase(redMiddle+"", 10, 16);
      if(baseRedMiddle.length == 1)baseRedMiddle = "0"+baseRedMiddle;
      var baseBlueMiddle = convertBase(blueMiddle+"", 10, 16);
      if(baseBlueMiddle.length == 1)baseBlueMiddle = "0"+baseBlueMiddle;
      var baseGreenMiddle = convertBase(greenMiddle+"", 10, 16);
      if(baseGreenMiddle.length == 1)baseGreenMiddle = "0"+baseGreenMiddle;
      colorArray.push("#"+baseRedMiddle+baseGreenMiddle+baseBlueMiddle);
    }
    var baseRedEnd = convertBase(redEnd+"", 10, 16);
    if(baseRedEnd.length == 1)baseRedEnd = "0"+baseRedEnd;
    var baseBlueEnd = convertBase(blueEnd+"", 10, 16);
    if(baseBlueEnd.length == 1)baseBlueEnd = "0"+baseBlueEnd;
    var baseGreenEnd = convertBase(greenEnd+"", 10, 16);
    if(baseGreenEnd.length == 1)baseGreenEnd = "0"+baseGreenEnd;
    colorArray.push("#"+baseRedEnd+baseGreenEnd+baseBlueEnd);
  }

  function initialRow(){
    if(useRandom){
      for(var i=0;i<width;i++){
        prevRow.push(Math.floor(Math.random() * colors));
      }
    } else {
      for(var i=0;i<width;i++){
        prevRow.push(0);
      }
      prevRow[width/2] = Math.floor(Math.random() * colors); //just the middle is random
    }
  }

  function displayRow(array){
    for(var i=0;i<array.length;i++){
      ctx.fillStyle = colorArray[colorArray.length-1-array[i]];
      ctx.fillRect(i, currHeight, 1, 1);
    }
  }

  function main(){
    currHeight += 1;
    if(currHeight > height)return;
    for(var i=0;i<prevRow.length;i++){
      var value = 0;
      for(var j=-range;j<=range;j++){
        if(i+j<0)continue;
        if(i+j>=prevRow.length)break;
        value += alpha.indexOf(prevRow[i+j]) * Math.pow(colors, range+j);
        }
      currRow.push(ruleArray[value]);
    }
    displayRow(currRow);
    prevRow = currRow.slice(0);
    currRow = [];
    main();
  }


  document.getElementById("start").addEventListener("mousedown", function(){
    range = +document.getElementById("range").value;
    rule = document.getElementById("rule").value;
    colors = document.getElementById("colors").value;
    useRandom = document.getElementById("random").checked;
    if(colors<2){
      alert("The value for colors must be at least 2");
      return;
    }
    if(colors>20){
      alert("Too many colors");
      return;
    }
    if(range>20){
      alert("Range too big, cannot compute");
      return;
    }
    var maxRule = Math.pow(colors, Math.pow(colors, 1+2*range));
    if(rule>maxRule){
      alert("Rule too big for range and number of colors");
      return;
    }
    for(var i=0;i<Math.pow(colors, 1+2*range);i++){
      ruleArray.push(0);
    }
    ruleBase = convertBase(rule, 10, colors); //ruleBase is a string!
    for(var i=0;i<ruleBase.length;i++){
      ruleArray[ruleArray.length-i-1] = alpha.indexOf(ruleBase.charAt(ruleBase.length-i-1));
    }
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    generateColors();
    console.log(colorArray);
    initialRow();
    displayRow(prevRow);
    main();
  });
}
