
window.onload = function(){
  var canvas = document.getElementById("canvas");
  canvas.width = screen.width;
  canvas.height = screen.height;
  var height = canvas.height;
  var width = canvas.width;
  var ctx = canvas.getContext("2d");
  var SEPARATE_SCALE = 10;
  var COHESION_SCALE = .5;
  var ALIGNMENT_SCALE = 300;
  var MOVE_SCALE = 2;
  var RANDOM_SCALE = 4;

  function Vector(x, y){
    this.x = x;
    this.y = y;
  }

  Vector.prototype.magnitude = function(){
    return Math.pow(Math.pow(this.x, 2)+Math.pow(this.y, 2), 0.5);
  }

  function Boid(x, y, a, v, id){
    this.id = id;
    this.x = x;
    this.y = y;
    this.angle = a*Math.PI/180;
    this.velocity = new Vector(v*Math.cos(this.angle), v*Math.sin(this.angle));
    this.radius = 250;
    this.maxSpeed = 4;
  }

  Boid.prototype.draw = function(){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle+Math.PI/2);
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "hsl(" + this.angle/(2*Math.PI)*360 + ",100%, 60%)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    var num = 4;
    ctx.moveTo(-num, num);
    ctx.lineTo(num, num);
    ctx.lineTo(0, -2*num);
    ctx.lineTo(-num,num);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  Boid.prototype.step = function(){
    if(isNaN(this.x)||isNaN(this.y)||isNaN(this.velocity.x)||isNaN(this.velocity.y)){
      this.x = Math.random()*width;
      this.y = Math.random()*height;
      this.velocity = new Vector(Math.random(), Math.random());
  }
    this.x += this.velocity.x*MOVE_SCALE;
    this.y += this.velocity.y*MOVE_SCALE;
    this.checkLocation();
  }

  Boid.prototype.checkLocation = function(){
    if(this.x<0)this.x=width-5;
    if(this.x>width)this.x=5;
    if(this.y<0)this.y=height-5;
    if(this.y>height)this.y=5;
    if(this.velocity.magnitude()>this.maxSpeed){
      this.velocity = mult(this.velocity, this.maxSpeed/this.velocity.magnitude());
    }
  }

  Boid.prototype.getDistance = function(other){
    return Math.pow(Math.pow(delta(this.x, other.x, width), 2)+Math.pow(delta(this.y, other.y, height), 2), 0.5);
  }

  Boid.prototype.separate = function(){
    var addX = 0;
    var addY = 0;
    for(var i=0;i<arr.length;i++){
      if(arr[i].id==this.id)continue;
      var distance = this.getDistance(arr[i]);
      if(distance<this.radius){
        var distanceVector = new Vector(delta(this.x, arr[i].x, width), delta(this.y, arr[i].y, height));
        distanceVector = normalize(distanceVector);
        addX += distanceVector.x/distance;
        addY += distanceVector.y/distance;
      }
    }
    return mult(new Vector(addX, addY), -SEPARATE_SCALE);
  }

  Boid.prototype.alignment = function(){
    var avgX = 0;
    var avgY = 0;
    var count = 0;
    for(var i=0;i<arr.length;i++){
      if(arr[i].id==this.id)continue;
      if(isNaN(arr[i].velocity.x)||isNaN(arr[i].velocity.y))continue;
      var distance = this.getDistance(arr[i]);
      if(distance<this.radius){
        var normal = normalize(arr[i].velocity);
        avgX += normal.x/distance;
        avgY += normal.y/distance;
        count++;
      }
    }
    avgX /= count;
    avgY /= count;
    return mult(new Vector(avgX, avgY), ALIGNMENT_SCALE);
  }

  Boid.prototype.cohesion = function(){
    var posX = 0;
    var posY = 0;
    var count = 0;
    for(var i=0;i<arr.length;i++){
      if(arr[i].id==this.id)continue;
      if(isNaN(arr[i].x)||isNaN(arr[i].y))continue;
      if(this.getDistance(arr[i])<this.radius){
        posX += arr[i].x;
        posY += arr[i].y;
        count++;
      }
    }
    posX /= count;
    posY /= count;
    return this.seek(new Vector(posX, posY));
  }

  Boid.prototype.seek = function(target){
    var posVector = new Vector(this.x, this.y);
    var des = mult(normalize(subtract(posVector, target)), this.maxSpeed);
    return mult(des, -COHESION_SCALE);
  }

  Boid.prototype.move = function(){
    var moveTo = new Vector(0,0);
    moveTo = add(moveTo, this.cohesion());
    moveTo = add(moveTo, this.separate());
    moveTo = add(moveTo, this.alignment());
    moveTo = add(moveTo, new Vector(Math.random()*-RANDOM_SCALE+RANDOM_SCALE/2, Math.random()*-RANDOM_SCALE+RANDOM_SCALE/2));
    this.velocity = add(this.velocity, normalize(moveTo));
    this.angle = -Math.atan2(this.velocity.x, this.velocity.y)+Math.PI/2;
  }

  function drawBackground(){
    ctx.fillStyle = "#8ED6FF";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  function normalize(vector){
    return new Vector(vector.x/vector.magnitude(),vector.y/vector.magnitude());
  }

  function subtract(vect1, vect2){
    return new Vector(vect1.x-vect2.x, vect1.y-vect2.y);
  }

  function mult(vect1, scalar){
    return new Vector(vect1.x*scalar, vect1.y*scalar);
  }

  function add(vect1, vect2){
    return new Vector(vect1.x+vect2.x, vect1.y+vect2.y);
  }

  function delta(a1, a2, aBoundary){
    var raw = Math.abs(a1-a2);
    var dist = a1-a2;
    var sign = 1;
    if(raw<aBoundary/2){
        sign = dist<0?1:-1;
    }
    if(raw>=aBoundary/2){
        sign = dist<0?-1:1;
    }
    return (raw<aBoundary/2)?raw*sign:(aBoundary-raw)*sign;
  }

  var arr = [];
  for(var i=0;i<500;i++){
    arr.push(new Boid(Math.random()*width, Math.random()*height, Math.random()*360, Math.random()*2, i));
  }

  function main(){
    drawBackground();
    for(var i=0;i<arr.length;i++){
      arr[i].draw();
      arr[i].step();
      arr[i].move();
    }
    requestAnimationFrame(main);
  }

  get_scales = setInterval(function(){
    COHESION_SCALE = document.getElementById("cohesion").value;
    SEPARATE_SCALE = document.getElementById("separate").value;
    ALIGNMENT_SCALE = document.getElementById("alignment").value;
  }, 50);

  requestAnimationFrame(main);
};
