//Idea for this program from Daniel Shiffman, code is my own
window.onload = function(){
  var canvas = document.getElementById("canvas");
  canvas.width = screen.width;
  canvas.height = screen.height;
  var width = canvas.width;
  var height = canvas.height;
  var ctx = canvas.getContext("2d");
  var life = 0;
  var target = new Object();
  target.x = width/2;
  target.y = 50;
  var gen = 0;
  var speed = 1;
  var tempSpeed = 1;
  var start = false;
  var holdBlock = false;
  var oldCoords, newCoords;

  function Rocket(randForce, force){
    this.x = width/2;
    this.y = height;
    this.width = 80;
    this.height = 10;
    this.angle = 0;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.forces = [];
    this.stuckTime = -1;
    this.isStuck = false;
    this.isStuckBad = false;
    if(randForce){
      for(var i=0;i<400;i++){
        this.forces.push([Math.random()*-2 + 1, Math.random()*-2 + 1]);
      }
    }
    else{
      this.forces = force;
    }
  }

  Rocket.prototype.update = function(){
    this.addForce();
  }

  Rocket.prototype.draw = function(){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = "#CCC";
    ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    ctx.restore();
  }

  Rocket.prototype.addForce = function(){
    if(!this.isStuck){
      this.xVelocity += this.forces[life][0];
      if(this.xVelocity>10)this.xVelocity=10;
      if(this.xVelocity<-10)this.xVelocity=-10;
      if(this.yVelocity>10)this.yVelocity=10;
      if(this.yVelocity<-10)this.yVelocity=-10;
      this.yVelocity += this.forces[life][1];
      this.angle = Math.atan(this.yVelocity/this.xVelocity);
      this.x += this.xVelocity;
      this.y += this.yVelocity;
      if(1/(this.calcHealth()) < 25){ //basically distance
        this.stuckTime = life;
        this.isStuck = true;
      }
    }
  }

  Rocket.prototype.collision = function(){
    for(var i=0;i<blocks.length;i++){
      var block = blocks[i];
      if(this.x < block.x || this.x > block.bottomRightX)continue;
      var percent = (this.x-block.x)/(block.bottomRightX-block.x);
      var epsilon = 5;
      if(block.y-(block.y-block.bottomRightY)*(percent)-this.y < epsilon && block.y-(block.y-block.bottomRightY)*(percent)-this.y > -epsilon){
        this.isStuck = true;
        this.isStuckBad = true;
      }
    }
  }

  Rocket.prototype.calcHealth = function(){
    var deltaX = this.x-target.x; //x of target
    var deltaY = this.y - target.y; //y of target
    var temp = 1/(Math.pow(Math.pow(deltaX, 2) + Math.pow(deltaY, 2), 0.5)); //Since smaller is better, we to invert this
    if(this.isStuck)temp += 1/this.stuckTime;
    return temp
  }

  function Block(x, y){
    this.x = x;
    this.y = y;
    this.toX = x;
    this.toY = y;
    this.height = 10;
    this.angle = 0;
    this.color = "#fff";
    this.isHeld = true;
  }

  Block.prototype.draw = function(){
    ctx.save();
    ctx.translate((this.toX+this.x)/2, (this.toY+this.y)/2);
    ctx.rotate(this.angle);
    this.length = Math.pow(Math.pow(this.toX-this.x, 2)+Math.pow(this.toY-this.y, 2), 0.5);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.length/2, -this.height/2, this.length, this.height);
    ctx.restore();
  }

  function drawBackground(){
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(target.x, target.y, 25, 0, Math.PI*2);
    ctx.strokeStyle = "#FFF";
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.stroke();
  }

  function crossover(mates, weighted){
    var mate1, mate2;
    var ans = [];
    var arr;
    for(var j=0;j<25;j++){
      arr = [];
      var num = Math.floor(Math.random() * mates.length);
      mate1 = mates[num];
      mate2 = mates[Math.floor(Math.random() * mates.length)];
      for(var i=0;i<400;i++){
        if(!weighted)arr.push([(mate1.forces[i][0]+mate2.forces[i][0])/2 - 0.5*Math.random()+0.25, (mate1.forces[i][1]+mate2.forces[i][1])/2 - 0.5*Math.random()+0.25]);
        else{ //More than just frame-to-frame "learning"
          var newX = 0;
          var newY = 0;
          for(k=Math.max(0, i-5);k<Math.min(i+5, 400);k++){
            newX += (mate1.forces[k][0]+mate2.forces[k][0])/Math.pow(3, Math.abs(i-k)+1); //Denominator should theoretically add to 1
            newY += (mate1.forces[k][1]+mate2.forces[k][1])/Math.pow(3, Math.abs(i-k)+1); //So that it doesn't get way faster
          }
          newX += -0.5*Math.random() + 0.25;
          newY += -0.5*Math.random() + 0.25;
          arr.push([newX, newY]);
        }
      }
      ans.push(new Rocket(false, arr));
    }
    return ans;
  }

  var rockets = [];
  var blocks = [];
  for(var i=0;i<25;i++){
    rockets.push(new Rocket(true, []));
  }

  function loop(){
    for(var i=0;i<rockets.length;i++){
      rockets[i].update();
      rockets[i].collision();
    }
    if(gen%speed==0){
      animate();
    }
    life += 1;
    if(life==400){ //End of generation
      document.getElementById("gen").innerHTML = "generation: " + gen;
      for(var i=0;i<rockets.length;i++){
        rockets[i].health = rockets[i].calcHealth();
      }
      gen += 1;
      var mate1, mate2, mate3;
      var max1 = -10;
      var max2 = -10;
      var max3 = -10;
      for(var i=0;i<rockets.length;i++){
        if(rockets[i].isStuckBad)continue;
        if(rockets[i].health > max1){
          mate1 = rockets[i];
          max1 = rockets[i].health;
          continue;
        }
        if(rockets[i].health > max2){
          mate2 = rockets[i];
          max2 = rockets[i].health;
          continue;
        }
        if(rockets[i].health > max3){
          mate3 = rockets[i];
          max3 = rockets[i].health;
          continue;
        }
      }
      life = 0;
      rockets = crossover([mate1, mate2, mate3], false);
    }
  }

  function animate(){
    drawBackground();
    drawBlocks();
    for(var i=0;i<rockets.length;i++){
      rockets[i].draw();
    }
  }

  function drawBlocks(){
    drawBackground();
    for(var i=0;i<blocks.length;i++){
      blocks[i].draw();
    }
    if(go)requestAnimationFrame(drawBlocks);
  }

  function getMousePos(canvas, event){
    var rect = canvas.getBoundingClientRect();
    return {x:event.clientX - rect.left, y:event.clientY - rect.top};
  }

  drawBackground();
  document.getElementById("start").addEventListener("mousedown", function(event){
    go = false;
    cancelAnimationFrame(drawBlocks);
    start = true;
    setInterval(loop, 0);
  });

  var s = setInterval(function(){
    var t = document.getElementById("speed").value;
    speed = t;
  }, 500);

  canvas.addEventListener("mousedown", function(event){
    if(!start){
      newCoords = getMousePos(canvas, event);
      if(holdBlock){
        for(var i=0;i<blocks.length;i++){
          var block = blocks[i];
          if(block.isHeld)blocks[i].isHeld = false;
          block.topLeftX = block.x;
          block.topLeftY = block.y - block.height/2;
          block.bottomLeftX = block.x;
          block.bottomLeftY = block.y + block.height/2;
          block.topRightX = block.x + block.length*Math.cos(block.angle);
          block.topRightY = block.y + block.length*Math.sin(block.angle)-block.height/2;
          block.bottomRightX = block.x + block.length*Math.cos(block.angle);
          block.bottomRightY = block.y + block.length*Math.sin(block.angle)+block.height/2;
        }
        holdBlock = false;
      }
      else{
        blocks.push(new Block(newCoords.x, newCoords.y));
        holdBlock = true;
      }
      oldCoords = newCoords;
    }
  });

  canvas.addEventListener("mousemove", function(event){
    var block;
    if(!start){
      if(holdBlock){
        for(var i=0;i<blocks.length;i++){
          if(blocks[i].isHeld)block = blocks[i];
        }
        newCoords = getMousePos(canvas,event);
        var deltaX = newCoords.x - oldCoords.x;
        var deltaY = newCoords.y - oldCoords.y;
        block.toX += deltaX;
        block.toY += deltaY;
        block.angle = Math.atan((block.toY-block.y)/(block.toX-block.x));
        oldCoords = newCoords;
      }
    }
  });
  var go = true;
  requestAnimationFrame(drawBlocks);

};
