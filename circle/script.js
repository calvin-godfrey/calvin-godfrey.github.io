window.onload = function(){
  var canvas = document.getElementById("canvas");
  canvas.width = screen.width;
  canvas.height = screen.height;
  var RADIUS = 200;
  var X_CENTER = canvas.width/2;
  var Y_CENTER = canvas.height/2;
  var INNER_RADIUS = RADIUS/2;
  var ctx = canvas.getContext("2d");
  ctx.translate(0.5,0.5);
  window.requestAnimFrame = (function() { //Dunno if this is right but it works so I'm not removing it
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

  Point = function(x, y, angle, life){
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.life = life;
  }

  Point.prototype.calcPoint = function(){
    var tempx = (RADIUS-radius)*Math.cos(this.life)+radius*Math.cos(((RADIUS-radius)/radius)*this.life);
    var tempy = (RADIUS-radius)*Math.sin(this.life)-radius*Math.sin(((RADIUS-radius)/radius)*this.life);
    //var distance = Math.pow(Math.pow(tempx, 2)+Math.pow(tempy, 2), 0.5);
    this.x = tempx*Math.cos(this.angle)-tempy*Math.sin(this.angle); //Rotate the point
    this.y = tempy*Math.cos(this.angle)+tempx*Math.sin(this.angle);
    this.life = this.life + Math.PI/128;
  }

  Point.prototype.draw = function(){
    ctx.save();
    ctx.translate(X_CENTER, Y_CENTER);
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI*2);
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();
  }

  function drawBackground(){
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<outerPoints.length;i++){
      ctx.save();
      ctx.translate(X_CENTER, Y_CENTER);
      ctx.beginPath();
      ctx.arc(outerPoints[i][0], outerPoints[i][1], 1, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }
    if(!document.getElementById("ellipse").checked)outerPoints = [];
  }

  function drawLine(){
    if(!numLines){
      for(var i=0;i<Math.floor(points.length/2);i++){
        var other = Math.floor(points.length/2)+i;
        ctx.save();
        ctx.translate(X_CENTER, Y_CENTER);
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        var dx = points[i].x-points[other].x;
        var dy = points[i].y-points[other].y;
        var distance = Math.pow(Math.pow(dx, 2)+Math.pow(dy, 2), 0.5);
        ctx.lineWidth = 1;
        ctx.strokeStyle = getColor(distance);
        if(useMult){
          ctx.lineTo(points[i].x-dx*mult, points[i].y-dy*mult);
          if(showEllipse)outerPoints.push([points[i].x-dx*mult, points[i].y-dy*mult]);
          //if(outerPoints.length==128*points.length)outerPoints = [];
        }
        else{ctx.lineTo(points[i].x-dx, points[i].y-dy);}
        ctx.stroke();
        ctx.restore();
      }
    }
    else{
      var other = Math.floor(points.length/2);
      ctx.save();
      ctx.translate(X_CENTER, Y_CENTER);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      var dx = points[0].x-points[other].x;
      var dy = points[0].y-points[other].y;
      var slope = dy/dx;
      var distance = Math.pow(Math.pow(dx, 2)+Math.pow(dy, 2), 0.5);
      ctx.lineWidth = 1;
      ctx.strokeStyle = getColor(distance);
      ctx.lineTo(points[0].x-dx*mult, points[0].y-dy*mult);
      if(showEllipse)outerPoints.push([points[0].x-dx*mult, points[0].y-dy*mult]);
      if(outerPoints.length==256)outerPoints = []; //Means we have made a full revolution
      ctx.stroke();
      ctx.restore();
    }
  }

  var points;
  var outerPoints = [];
  var drawLines = false;
  var restart = false;
  var stopped = false;
  var doloop = undefined;
  var radius = 100;
  var numsLines = false;
  var mult = 1;
  var useMult = false;
  var showEllipse = false;
  function loop(){
    drawBackground();
    for(var i=0;i<points.length;i++){
      points[i].calcPoint();
      points[i].draw();
    }
    if(drawLines)drawLine();
    if(restart){stopped=true;return;}
    if(!restart)var doloop = window.requestAnimationFrame(loop);
  }

  function stop(){
    if(doloop){
      cancelRequestAnimationFrame(doloop);
      doloop = undefined;
    }
  }

  function start(){
    if(!doloop)loop();
  }

  function getColor(n){ //Returns color of line given its distance
    if(n<(RADIUS-radius)*0.25)return "#F00";
    if(n>(RADIUS-radius)*0.75)return "#00F";
    if(n>(RADIUS-radius)*0.55)var red=0;
    var red = Math.min(256, 256-((n-(RADIUS-radius)*0.25)/((RADIUS-radius)*0.5))*256);
    red = red.toString(16);
    if(red!="0")red = red.slice(0, red.indexOf("."));
    if(red.length==1)red = "0"+red;
    if(n<(RADIUS-radius)*0.45)var blue = 0;
    var blue = ((n-(RADIUS-radius)*0.25)/((RADIUS-radius)*0.5))*256;
    blue = blue.toString(16);
    if(blue!="0")blue = blue.slice(0, blue.indexOf("."));
    if(blue.length==1)blue = "0"+blue;
    var ans = "#"+red+"00"+blue;
    return ans;
  }

  document.getElementById("start").addEventListener("mousedown", function(event){
    stop();
    restart = true;
    ctx.fillStyle = "#FFF"; //Reset screen;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    var numPoints = document.getElementById("points").value;
    if(document.getElementById("set").checked)var magic = Math.PI;
    else{var magic = document.getElementById("magic").value;}
    radius = document.getElementById("radius").value;
    RADIUS = document.getElementById("Rradius").value;
    mult = document.getElementById("mult").value;
    points = [];
    for(var i=0;i<numPoints;i++){
      points.push(new Point(X_CENTER, Y_CENTER, i*Math.PI/numPoints, i*magic/numPoints)); //Legit last one is a magic number. Now clue why it is what it is
    }
    restart = false;
    start();
  });

  var p = setInterval(function(){
    document.getElementById("selected").innerHTML = document.getElementById("points").value;
  }, 500);

  var t = setInterval(function(){
    drawLines = document.getElementById("lines").checked;
    document.getElementById("dispMagic").innerHTML = document.getElementById("magic").value;
    document.getElementById("dispRadius").innerHTML = document.getElementById("radius").value;
    document.getElementById("dispRRadius").innerHTML = document.getElementById("Rradius").value;
    document.getElementById("multiplier").innerHTML = document.getElementById("mult").value;
    useMult = document.getElementById("useMult").checked;
    numLines = document.getElementById("nums").checked;
    showEllipse = document.getElementById("ellipse").checked;
  }, 500);

  document.getElementById("stop").addEventListener("mousedown", function(event){
    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    outerPoints = [];
    stop();
    restart = true;
  });

  document.getElementById("random").addEventListener("mousedown", function(event){
    var vA = document.getElementById("magic");
    var vB = document.getElementById("points");
    var vC = document.getElementById("Rradius");
    var vD = document.getElementById("radius");
    var vE = document.getElementById("mult");
    vA.value = Math.random()*1999;
    vB.value = Math.random()*508;
    vC.value = 150 + Math.random()*350;
    vD.value = Math.random()*150;
    vE.value = 1 + Math.random();


  });

}
