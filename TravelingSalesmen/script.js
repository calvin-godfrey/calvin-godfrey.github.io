window.onload = function(){
  var canvas = document.getElementById("canvas");
  var points = document.getElementById("getPoints");
  var minDistance = 1e20;
  var bestWay = [];
  var allArray;
  var iter = 0;
  canvas.width = screen.width;
  canvas.height = screen.height;
  var ctx = canvas.getContext('2d');

  Point = function(){
    this.x = Math.random()*canvas.width;
    this.y = Math.random()*canvas.height;
    this.radius = 6;
  };

  Point.prototype.draw = function(){
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.strokeStyle = "#ddd";
    ctx.stroke();
    ctx.fillStyle = "#ddd";
    ctx.fill();
  };

  Point.prototype.line = function(other, color, thick){
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = thick;
    ctx.lineTo(other.x, other.y);
    ctx.stroke();
  }

  Point.prototype.getDistance = function(other){
    return Math.sqrt(Math.pow(this.x-other.x,2)+Math.pow(this.y-other.y,2));
  };

  function factorial(n){
    return n>1?n*factorial(n-1):1;
  };

  function drawBackground(){
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(var i=0;i<pointList.length;i++){
      pointList[i].draw();
    };
  };

  function calcDistance(){
    var ans = 0;
    for(var i=1;i<pointList.length;i++){
      ans+=pointList[i].getDistance(pointList[i-1]);
    };
    return ans;
  };

  function drawLines(array, color, thick){
    for(var i=1;i<array.length;i++){
      array[i].line(array[i-1], color, thick);
    };
  };

  var usedChars = [];
  var permArr = [];
  function permute(input) {
    var i, ch;
    for (i = 0; i < input.length; i++) {
      ch = input.splice(i, 1)[0];
      usedChars.push(ch);
      if (input.length == 0) {
        permArr.push(usedChars.slice());
      }
      permute(input);
      input.splice(i, 0, ch);
      usedChars.pop();
  }
  return permArr;
};

  function copy(array){
    var ans = [];
    for(var i=0;i<array.length;i++){
      ans.push(array[i]);
    };
    return ans;
  };

  var pointList = [];
  var text = document.getElementById("percent");
  function animate(){
    drawBackground();
    drawLines(bestWay, "#ddd", 7);
    text.innerHTML = iter + "/" + allArray.length;
    pointList = allArray[iter];
    if(iter<allArray.length-1)drawLines(pointList, "#f00", 3);
    var dist = calcDistance();
    if(dist<minDistance){
      minDistance = dist;
      bestWay = copy(pointList);
    };
    if(iter<allArray.length-1)iter++;
  };

  function main(){
    drawBackground();
    drawLines(bestWay, "#ddd",7);
    var loop = setInterval(function(){
      animate();
    }, .1);
  }

  points.addEventListener('mousedown', function(event){
    for(var i=0;i<document.getElementById('points').value;i++){
      pointList.push(new Point());
      bestWay.push(pointList[i]);
    };
    allArray = permute(pointList);
    main();
    });
  };
