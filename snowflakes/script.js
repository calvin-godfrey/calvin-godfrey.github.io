window.onload = function(){
  var c = document.getElementById("canvas");
  c.width = screen.width;
  c.height = screen.height;
  var height = c.width;
  var width = c.width;
  var ctx = c.getContext("2d");
  var snowflakes = [];
  var WIND = -3+Math.random()*6;
  Snowflake = function(wide, tall){
    this.x = Math.random()*width/wide;
    this.y = Math.random()*height/tall;
    this.angle = Math.random()*2*Math.PI;
    this.height = 40+Math.random()*60;
    this.width = this.height;
    this.rotate = -Math.PI/16+Math.random()*Math.PI/8;
    this.fall = 4;
    this.velocityX = -3*Math.random()*6;
    this.velocityY = -3*Math.random()*6;
  }

  Snowflake.prototype.draw = function(erase){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    if(erase){
      ctx.drawImage(black, -(this.width), -(this.height), this.width*1.8, this.height*1.8);
    }
    ctx.drawImage(flake, -(this.width/2), -(this.height/2), this.width, this.height);
    ctx.restore();
  }

  Snowflake.prototype.shift = function(){
    this.x += WIND-1+this.velocityX;
    this.y += this.fall-this.velocityY;
    this.angle += this.rotate;
    this.rotate += -Math.PI/80+Math.random()*Math.PI/40;
    if(this.rotate<-Math.PI/24)this.rotate=-Math.PI/24;
    if(this.rotate>Math.PI/24)this.rotate = Math.PI/24;
    this.height += -3+Math.random()*6;
    if(this.height<10)this.height=10;
    if(this.height>80)this.height=80;
    this.width = this.height;
    this.velocityX += -0.5+Math.random();
    if(this.velocityX<-5)this.velocityX=-5;
    if(this.velocityX>5)this.velocityX=5;
    this.velocityY += -0.5+Math.random();
    if(this.velocityY>5)this.velocityY=5;
    if(this.velocityY<-5)this.velocityY=-5;
  }
  for(var i=0;i<1000;i++)snowflakes.push(new Snowflake(0.5, 1));
  var flake = new Image();
  var black = new Image();
  flake.src = "snowflake.png";
  black.src = "black.png";
  flake.onload = function(){
    requestAnimationFrame(main);
  }


  function main(){
    WIND += -0.3+Math.random()*0.6;
    if(WIND>2)WIND=2;
    if(WIND<-2)WIND=-2;
    ctx.clearRect(0,0,width,height);
    for(var i=0;i<snowflakes.length;i++){
      snowflakes[i].draw(false);
      if(snowflakes[i].y>height){
        snowflakes.splice(i, 1);
        i--;
        snowflakes.push(new Snowflake(0.5, 2000));
      }
      else{
        snowflakes[i].shift();
      }
    }
    requestAnimationFrame(main);
  }



};
