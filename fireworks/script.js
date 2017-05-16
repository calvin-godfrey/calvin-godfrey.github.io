window.onload = function(){
  var canvas = document.getElementById("canvas");
  canvas.width = screen.width;
  canvas.height = screen.height;
  var ctx = canvas.getContext("2d");
  var mouseDown = false;
  var started = false;
  var drawing = [];
  var realDrawing = [];
  var colors = ["#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"];
  var rockets = [];
  var GRAVITY = 3;

  function Point(x, y, vx, vy, color){
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isDone = false;
    this.radius = 3;
    this.color = colors[color];
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

  Point.prototype.step = function(){
    this.x += this.vx;
    this.y -= this.vy;
    if(this.y>screen.height)this.isDone = true;
    this.vy -= GRAVITY;
  }

  function Firework(x){
    this.y = screen.height;
    this.x = x;
    this.radius = 8;
    this.vy = -40 - Math.floor(Math.random()*20);
    this.particles = [];
    this.exploded = false;
    this.isDone = false;
  }

  Firework.prototype.draw = function(){
    if(!this.hasExploded){
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
      ctx.strokeStyle = "#ddd";
      ctx.stroke();
      ctx.fillStyle = "#ddd";
      ctx.fill();
    } else {
      if(this.particles.length==0){
        this.isDone = true;
        return;
      }
      for(var i=0;i<this.particles.length;i++){
        if(this.particles[i].isDone){
          this.particles.splice(i, 1);
          if(i>=this.particles.length)break;
        };
        this.particles[i].step();
        this.particles[i].draw();
      }
    }
  }

  Firework.prototype.step = function(){
    this.y += this.vy;
    this.vy += GRAVITY;
    if(!this.hasExploded)this.checkEnd();
  }

  Firework.prototype.checkEnd = function(){
    if(this.vy>0){
      this.explode();
    }
  }

  Firework.prototype.explode = function(){
    this.hasExploded = true;
    var color_num = Math.floor(Math.random()*colors.length);
    for(var i=0;i<realDrawing.length;i++){
      this.particles.push(new Point(this.x, this.y, -40*realDrawing[i][0], 20*realDrawing[i][1], color_num));
    }

  }

  function getMousePos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {x: (evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
      y: (evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height};
  }

  function drawLine(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 3;
    ctx.lineTo(x2,y2);
    ctx.stroke();
  }

  function drawLines(arr){
    for(var i=0;i<arr.length;i++){
      for(var j=0;j<arr[i].length-1;j++)
      drawLine(arr[i][j][0], arr[i][j][1], arr[i][j+1][0], arr[i][j+1][1]);
    }
  }

  function genDrawing(){
    var minX = 1e10;
    var maxX = -1e10;
    var minY = 1e10;
    var maxY = -1e10;
    for(var i=0;i<drawing.length;i++){
      for(var j=0;j<drawing[i].length;j++){
        if(drawing[i][j][0]<minX)minX = drawing[i][j][0];
        if(drawing[i][j][0]>maxX)maxX = drawing[i][j][0];
        if(drawing[i][j][1]<minY)minY = drawing[i][j][1];
        if(drawing[i][j][1]>maxY)maxY = drawing[i][j][1];
      }
    }
    var avgX = (minX+maxX)/2;
    var avgY = (minY+maxY)/2;
    for(var i=0;i<drawing.length;i++){
      for(var j=0;j<drawing[i].length;j++){
        realDrawing.push([(avgX-drawing[i][j][0])/avgX, (avgY-drawing[i][j][1])/avgY]);
      }
    }
  }

  function background(){
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    if(!started)drawLines(drawing);
  }

  function main(){
    background();
    //console.log(rockets.length);
    for(var i=0;i<rockets.length;i++){
      if(rockets[i].isDone){
        rockets.splice(i, 1);
        if(i>=rockets.length)break;
      }
      rockets[i].step();
      rockets[i].draw();
    }
    requestAnimationFrame(main);
  }

  requestAnimationFrame(main);

  canvas.addEventListener("mousedown", function(event){
    mouseDown = true;
    if(started){
      var pos = getMousePos(canvas, event);
      rockets.push(new Firework(pos.x));
    } else {
      drawing.push([]);
    }

  });

  canvas.addEventListener("mouseup", function(event){
    mouseDown = false;
  });

  canvas.addEventListener("mousemove", function(event){
    if(!mouseDown||started)return;
    var pos = getMousePos(canvas, event);
    drawing[drawing.length-1].push([pos.x, pos.y]);
  });

  document.getElementById("start").addEventListener("mousedown", function(event){
    started = true;
    genDrawing();
  })
}
