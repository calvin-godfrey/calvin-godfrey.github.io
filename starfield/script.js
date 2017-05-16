window.onload = function(){
  var c = document.getElementById("canvas");
  c.width = screen.width;
  c.height = screen.height;
  var ctx = c.getContext("2d");
  var width = c.width;
  var height = c.height*0.9;
  var SHIFT = 0.1;
  var MAX_DIST = Math.sqrt(Math.pow(width/2,2)+Math.pow(height/2,2));
  ctx.fillStyle="#000";
  ctx.fillRect(0,0,width,height);

  pointArray = [];

  var point = function(){
    this.x = (width/2)-10+Math.random()*20;
    this.prevX = this.x;
    this.y = (height/2)-10+Math.random()*20;
    this.prevY = this.y;
    this.angle = Math.random()*2*Math.PI;
    this.speed = SHIFT+Math.random()*2;
    this.base = 8+Math.random()*8;
  };

  point.prototype.getDistance = function(){
    return Math.sqrt(Math.pow(width/2-this.x,2)+Math.pow(height/2-this.y,2));
  };

  point.prototype.getOldDistance = function(){
    return Math.sqrt(Math.pow(width/2-this.prevX,2)+Math.pow(height/2-this.prevY,2));
  };

  point.prototype.draw = function(){
    var ratio = this.getOldDistance()/MAX_DIST;
    var radius = this.base;
    ctx.beginPath();
    ctx.moveTo(this.prevX, this.prevY);
    ctx.arc(this.prevX, this.prevY, radius, 0, Math.PI*2);
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fill();

    if(this.x>0 && this.x<width && this.y>0 && this.y < height)
    {
      var r_radius = this.base*(this.getDistance()/MAX_DIST);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.arc(this.x, this.y, r_radius, 0, Math.PI*2);
      ctx.strokeStyle = "#777";
      ctx.stroke();
      ctx.fillStyle = "#777";
      ctx.fill();
      return true;
    }
    else{
      return false;
    }
  };

  point.prototype.shift = function(){
      this.prevX = this.x;
      this.prevY = this.y;
      this.x += Math.cos(this.angle)*this.speed;
      this.y += Math.sin(this.angle)*this.speed;
      this.speed *= 1.025;
  };

  function addPoint(){
    pointArray.push(new point());
    pointArray[pointArray.length-1].draw();
  };

  for(var i=0;i<200;i++){
    pointArray.push(new point());
    for(var j=0;j<Math.random()*50;j++){pointArray[i].shift();}
    pointArray[i].draw();
  }

  var loop = window.setInterval(function(){
    for(var i=0;i<pointArray.length;i++){
      var current = pointArray[i];
      current.shift();
      if(current.draw()==false){
        pointArray.splice(i,1);
        i--;
        addPoint();
      }
    }
  }, 16);
};
