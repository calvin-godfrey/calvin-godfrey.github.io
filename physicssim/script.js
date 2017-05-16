window.onload = function(){
  var canvas = document.getElementById("canvas");
  var collision = document.getElementById("collision");
  var useCollision;
  var REBOUND;
  var checkCollision = setInterval(function(){
    useCollision = collision.checked;
    REBOUND = document.getElementById("rebound").value;
  }, 100);
  canvas.width = screen.width;
  canvas.height = screen.height;
  var width = canvas.width;
  var height = canvas.height;
  var ctx = canvas.getContext("2d");
  var ballArray = [];
  var lineArray = [];
  var startClickLocation, endClickLocation, tempEndLocation, tempPrevEndLocation;
  var FACTOR = 0.08;
  var GRAVITY = 0.2; //Arbitrary number unrelated to 9.8 m/s^2
  var RADIUS = 20;
  var MASS = 5;
  tempEndLocation = {x:null, y:null};
  tempPrevEndLocation = {x:null, y:null};
  var isMouseDown = false;
  var isRightMouseDown = false;
  var start = {x:null, y:null};
  var color = ["#F00", "#000", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"];

  var Vector = function(x, y){
      this.x = x;
      this.y = y;
      this.magnitude = Math.pow(Math.pow(x, 2)+Math.pow(y, 2), 0.5);
  }

  var Ball = function(x, y){
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.isDone = false;
    this.color = color[Math.floor(Math.random()*color.length)];
    this.mass = RADIUS;
  }

  Ball.prototype.draw = function(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, 16, 0, Math.PI*2);
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  Ball.prototype.setup = function(endX, endY){
    this.velocityX = (this.x-endX)*FACTOR;
    this.velocityY = (this.y-endY)*FACTOR;
    this.isDone = true;
  }

  Ball.prototype.move = function(){
    this.moveReally();
    if(useCollision){
      this.checkWallCollision();
      this.checkBallCollision();
      this.checkLineCollision();
    }
  }

  Ball.prototype.moveReally = function(){
    this.x += this.velocityX;
    this.y += this.velocityY;
    if(document.getElementById("gravity").checked)this.velocityY += GRAVITY;
    this.draw();
    this.prevX = this.x;
    this.prevY = this.y;
  }

  Ball.prototype.checkWallCollision = function(){
    if(this.x-RADIUS<=0){
      this.x = RADIUS;
      this.velocityX *= -REBOUND;
    }
    if(this.x+RADIUS>=width){
      this.x = width-RADIUS;
      this.velocityX *= -REBOUND;
    }
    if(this.y+RADIUS>=height){
      this.y = height-RADIUS;
      this.velocityY *= -REBOUND;
    }
    if(this.y-RADIUS<=0){
      this.y = RADIUS;
      this.velocityY *= -REBOUND;
    }
  }

  Ball.prototype.checkBallCollision = function(){
    for(var i=0;i<ballArray.length;i++){
      if(i==this.index||ballArray[i].isDone==false){
        continue;
      }
      else if(distance(this, ballArray[i])<=RADIUS*2){
        var other = ballArray[i];
        var dis = distance(this, other);
        this.velocity = new Vector(this.velocityX, this.velocityY);
        other.velocity = new Vector(other.velocityX, other.velocityY);
        var n = new Vector((other.x-this.x)/dis, (other.y-this.y)/dis);
        var p = (2*(dotProduct(this.velocity, n)-dotProduct(other.velocity, n)))/(this.mass+other.mass);
        this.velocityX = this.velocity.x - p*this.mass*n.x;
        this.velocityY = this.velocity.y - p*this.mass*n.y;
        other.velocityX = other.velocity.x + p*other.mass*n.x;
        other.velocityY = other.velocity.y + p*other.mass*n.y;
      }
    }
  }

  Ball.prototype.checkLineCollision = function(){
    for(var i=0;i<lineArray.length;i++){
      var distance = this.lineDistance(lineArray[i]);
      if(this.x<lineArray[i].x1&&this.x<lineArray[i].x2)continue;
      if(this.x>lineArray[i].x1&&this.x>lineArray[i].x2)continue;
      if(distance < RADIUS){
        var normalSlope = -1/lineArray[i].slope;
        var normal = new Vector(1, normalSlope);
        var velocitySlope = this.velocityX/(this.velocityY+1e-10); //no divide by 0
        this.velocity = new Vector(this.velocityX, this.velocityY);
        var perpAngle = Math.acos(dotProduct(this.velocity, normal)/(this.velocity.magnitude*normal.magnitude));
        var u = new Vector((dotProduct(this.velocity, normal)/dotProduct(normal, normal))*normal.x, (dotProduct(this.velocity, normal)/dotProduct(normal, normal))*normal.y);
        var w = new Vector(this.velocity.x-u.x, this.velocity.y-u.y);
        this.velocity = new Vector(w.x-u.x, w.y-u.y);
        this.velocityX = this.velocity.x * REBOUND;
        this.velocityY = this.velocity.y * REBOUND;
      }
    }
  }

  Ball.prototype.lineDistance = function(line){
    return Math.abs((line.y2-line.y1)*this.x-(line.x2-line.x1)*this.y+line.x2*line.y1-line.y2*line.x1)/(Math.pow(Math.pow(line.x1-line.x2, 2) + Math.pow(line.y1-line.y2, 2), 0.5)); //thanks wikipedia
  }

  var Line = function(x1, y1, x2, y2){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.slope = (y2-y1)/(x2-x1);
  }

  Line.prototype.draw = function(){
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.strokeStyle = "#000";
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();

  }

  function dotProduct(v1, v2){
      return v1.x*v2.x+v1.y*v2.y;
  }

  function getMousePos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {x: (evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
      y: (evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height};
  }

  function distance(ball, other){
    return Math.sqrt(Math.pow(ball.x-other.x,2)+Math.pow(ball.y-other.y,2));
  }

  function drawTrajectory(start, end, color){
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = color;
    if(color=="#FFF"){
      ctx.lineWidth = 3;
    }
    else{
      ctx.lineWidth = 1;
    }
    ctx.stroke();
  }

  canvas.addEventListener("mousedown", function(event){
    if(event.which == 3)return;
    startClickLocation = getMousePos(canvas, event);
    tempEndLocation.x = startClickLocation.x;
    tempEndLocation.y = startClickLocation.y;
    tempPrevEndLocation.x = startClickLocation.x;
    tempPrevEndLocation.y = startClickLocation.y;
    isMouseDown = true;
    ballArray.push(new Ball(startClickLocation.x, startClickLocation.y));
    ballArray[ballArray.length-1].draw();
  });

  canvas.addEventListener("mouseup", function(event){
    if(event.which == 3)return;
    endClickLocation = getMousePos(canvas, event);
    drawTrajectory(startClickLocation, endClickLocation, "#FFF");
    isMouseDown = false;
    ballArray[ballArray.length-1].setup(endClickLocation.x, endClickLocation.y);
    ballArray[ballArray.length-1].index = ballArray.length-1;
  });

  canvas.addEventListener("mousemove", function(event){
    if(event.which == 3)return;
    if(isMouseDown){
      tempEndLocation = getMousePos(canvas, event);
      drawTrajectory(startClickLocation, tempPrevEndLocation, "#FFF");
      tempPrevEndLocation.x = tempEndLocation.x;
      tempPrevEndLocation.y = tempEndLocation.y;
      drawTrajectory(startClickLocation, tempEndLocation, "#000");
      ballArray[ballArray.length-1].draw();
    }
  });

  canvas.addEventListener("contextmenu", function(event){
    event.preventDefault();
    var loc = getMousePos(canvas, event);
    if(isRightMouseDown){
      lineArray.push(new Line(start.x, start.y, loc.x, loc.y));
    } else {
      start = loc;
    }
    isRightMouseDown = !isRightMouseDown;
    return false;
  }, false);

  function updateText(){
    document.getElementById("dispRebound").innerHTML = REBOUND;
    var energy = 0;
    for(var i=0;i<ballArray.length;i++){
      energy += ballArray[i].mass * Math.pow(Math.pow(ballArray[i].velocityX, 2)+Math.pow(ballArray[i].velocityY, 2), 0.85);
      energy += ballArray[i].mass * GRAVITY * (canvas.height - ballArray[i].y);
    }
    document.getElementById("energy").innerHTML = Math.round(energy);
  }

  var animate = function(){
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0,0,width,height);
    for(var i=0;i<ballArray.length;i++){
      if(ballArray[i].isDone==false){
        continue;
      }
      ballArray[i].move();
      if(ballArray[i].x<-200||ballArray[i].x>width+200||ballArray[i].y>height+200){
        ballArray.splice(i,1);
      }
    }
    for(var i=0;i<lineArray.length;i++){
      lineArray[i].draw();
    }
    updateText();
    window.requestAnimationFrame(animate);
  }

  var loop = window.requestAnimationFrame(animate);

};
