window.onload = function(){
  var canvas = document.getElementById("canvas");
  canvas.width = screen.width;
  canvas.height = screen.height;
  var ctx = canvas.getContext('2d');
  var done = false;
  var area = 0;
  var halfArea;
  var centerX = canvas.width/2;
  var centerY = canvas.height/2;
  var centerPoints = [];

  var Point = function(x, y, id){
    this.x = x;
    this.y = y;
    this.id = id;
    this.radius = 4;
    this.color = "#000";
  }

  Point.prototype.draw = function(){
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  var Side = function(p1, p2){
    this.point1 = p1;
    this.point2 = p2;
    this.slope = (this.point1.y-this.point2.y)/(this.point1.x-this.point2.x);
    this.color = "#000";
    this.thick = 2;
  }

  Side.prototype.draw = function(){
    ctx.beginPath();
    ctx.moveTo(this.point1.x, this.point1.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thick;
    ctx.lineTo(this.point2.x, this.point2.y);
    ctx.stroke();
  }

  var sides = [];
  var points = [];

  function getMousePos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {x: (evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
            y: (evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height};
  }

  function isConvex(sides){ //True if  the cross products of sides are all positive or all negative
    var hasPositive = false;
    var hasNegative = false;
    for(var i=1;i<sides.length;i++){
      var crossProduct = calcCrossProduct(sides[i-1], sides[i]);
      if(crossProduct<0){
        hasNegative = true;
      }
      if(crossProduct>0){
        hasPositive = true;
      }
      if(hasPositive&&hasNegative)return false;
    }
    return true;
  }

  function distance(point1, point2){
    return Math.pow(Math.pow(point1.x-point2.x, 2)+Math.pow(point1.y-point2.y, 2), 0.5);
  }

  function calcArea(point1, point2, point3){
    a = distance(point1, point2);
    b = distance(point1, point3);
    c = distance(point2, point3);
    s = (a+b+c)/2;
    return Math.pow((s*(s-a)*(s-b)*(s-c)), 0.5);
  }

  function calcCrossProduct(side1, side2){
    return (side1.point1.x-side1.point2.x)*(side2.point2.y-side2.point1.y)-(side1.point1.y-side1.point2.y)*(side2.point2.x-side2.point1.x);
  }

  function drawBackground(){
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<points.length;i++){
      points[i].draw();
    }
    for(var i=0;i<sides.length;i++){
      sides[i].draw();
    }
    if(done){
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.moveTo(points[0].x, points[0].y);
      for(var i=1;i<points.length;i++){
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = "#AAA";
      ctx.fill();
      for(var i=0;i<centerPoints.length;i++){
        centerPoints[i].draw();
      }
    }
    requestAnimationFrame(drawBackground);
  }

  function findCenter(){
    var xSum = 0;
    var ySum = 0;
    var epsilon = 10;
    var deltaX, deltaY;
    var scale = .002;
    var secret=0;
    for(var i=0;i<points.length;i++){
      xSum += points[i].x;
      ySum += points[i].y;
    }
    centerX = xSum/points.length; //estimate of center x
    centerY = ySum/points.length;
    centerPoints.push(new Point(centerX, centerY, -10));
    console.log("-----------------");
    console.log(centerX + "\t" + centerY);
    var resultX = calcAreaX(centerX);
    var resultY = calcAreaY(centerY);
    console.log("Loop");
    while((Math.abs(resultX-halfArea)>epsilon||Math.abs(resultY-halfArea)>epsilon)&&secret<500){
      console.log("----------------------------------------");
      console.log(secret);
      console.log("Should be " + halfArea);
      deltaX = resultX-halfArea;
      deltaY = resultY-halfArea;
      centerX = centerX-(deltaX*scale);
      centerY = centerY-(deltaY*scale);
      console.log("Center point");
      console.log(centerX + "\t" + centerY);
      resultX = calcAreaX(centerX);
      resultY = calcAreaY(centerY);
      centerPoints.push(new Point(centerX, centerY, secret));
      secret++;
    }
  }

  function calcAreaX(centerX){
    var pointsToUse = [];
    for(var i=0;i<points.length;i++){
      if(points[i].x<centerX)pointsToUse.push(points[i]);
    }
    for(var i=0;i<sides.length;i++){
      if(sides[i].point1.x<centerX&&sides[i].point2.x>centerX){
        var y = sides[i].point1.x + (centerX-sides[i].point1.x)*sides[i].slope;
        pointsToUse.splice(sides[i].point1.id, 0, new Point(centerX, y, -1)); //ID of this doesn't matter
      }
      if(sides[i].point2.x<centerX&&sides[i].point1.x>centerX){
        var y = sides[i].point2.x + (centerX-sides[i].point2.x)*sides[i].slope;
        pointsToUse.splice(sides[i].point2.id, 0, new Point(centerX, y, -1));
      }
    }
    var totalArea = 0;
    for(var i=1;i<pointsToUse.length-1;i++){
      totalArea += calcArea(pointsToUse[0], pointsToUse[i], pointsToUse[i+1]);
    }
    console.log(totalArea);
    return totalArea;
  }

  function calcAreaY(centerY){
    var pointsToUse = [];
    for(var i=0;i<points.length;i++){
      if(points[i].y<centerY)pointsToUse.push(points[i]);
    }
    for(var i=0;i<sides.length;i++){
      if(sides[i].point1.y<centerY&&sides[i].point2.y>centerY){
        var x = sides[i].point1.y + (centerY-sides[i].point1.y)*(1/sides[i].slope);
        pointsToUse.splice(sides[i].point1.id, 0, new Point(centerY, x, -1)); //ID of this doesn't matter
      }
      if(sides[i].point2.y<centerY&&sides[i].point1.y>centerY){
        var x = sides[i].point2.y + (centerY-sides[i].point2.y)*(1/sides[i].slope);
        pointsToUse.splice(sides[i].point2.id, 0, new Point(centerY, x, -1));
      }
    }
    var totalArea = 0;
    for(var i=1;i<pointsToUse.length-1;i++){
      totalArea += calcArea(pointsToUse[0], pointsToUse[i], pointsToUse[i+1]);
    }
    console.log(totalArea);
    return totalArea;
  }

  canvas.addEventListener("mouseup", function(event){
    var click = getMousePos(canvas, event);
    if(done)return;
    points.push(new Point(click.x, click.y, points.length));
    if(points.length>=2){
      sides.push(new Side(points[points.length-2], points[points.length-1]));
    }
  });

  document.getElementById("done").addEventListener("mouseup", function(event){
    sides.push(new Side(points[points.length-1], points[0]));
    if(!isConvex(sides)){
      alert("Not convex.");
      done = false;
      return;
    }
    done = true;
    for(var i=1;i<points.length-1;i++){
      area += calcArea(points[0], points[i], points[i+1]);
    }
    console.log(area);
    halfArea = area/2;
  });

  document.getElementById("go").addEventListener("mouseup", function(event){
    if(done){
      findCenter();
    }
  });

  requestAnimationFrame(drawBackground);

}
