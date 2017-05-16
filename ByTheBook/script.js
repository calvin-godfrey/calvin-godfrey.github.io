window.onload = function(){
  var canvas = document.getElementById("canvas");
  var check = document.getElementById("check");
  canvas.width = screen.width;
  canvas.height = screen.height;
  var width = canvas.width;
  var height = canvas.height;
  var SCALE = 80;
  var loop;
  var ctx = canvas.getContext("2d");
  var MOUSEDOWN = false;
  var EPSILON = 60; //Distance to "lock" blocks together
  var held = null;
  var prevLocation, clickLocation, distance, currLevel;
  function getMousePos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {x: (evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
      y: (evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height};
  }

  Block = function(wwidth, hheight, color, letter){
    this.x = Math.random()*canvas.width;
    this.y = canvas.height/1.5 + Math.random()*canvas.height/3;
    this.width = wwidth*SCALE;
    this.height = hheight*SCALE;
    this.color = color;
    this.yTop = this.y-this.height/2;
    this.yBottom = this.y+this.height/2;
    this.xLeft = this.x-this.width/2;
    this.xRight = this.x+this.width/2;
    this.letter = letter;
    this.isVertical = false;
  }

  Block.prototype.draw = function(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.xLeft, this.yTop, this.width, this.height);
    ctx.font = "15px Arial";
    ctx.fillStyle = "#fff";
    if(this.letter)ctx.fillText(this.letter,this.x, this.y+5);
  }

  Block.prototype.rotate = function(){
    if(this.color=="#000")return;
    var temp = this.height;
    this.height = this.width;
    this.width = temp;
    this.changeBounds();
    this.isVertical = !this.isVertical;
  }
  Block.prototype.move = function(deltaX, deltaY){
    this.x += deltaX;
    this.y += deltaY;
    this.changeBounds();
  }

  Block.prototype.changeBounds = function(){
    this.yTop = this.y-this.height/2;
    this.yBottom = this.y+this.height/2;
    this.xLeft = this.x-this.width/2;
    this.xRight = this.x+this.width/2;
  }

  Block.prototype.getDistance = function(other){
    if(this.x<other.x){
      if(this.xRight<other.xLeft)return 1e10;
    }
    if(this.x>other.x){
      if(this.xLeft>other.xRight)return 1e10;
    }
    if(this.y<other.y){
      return -this.yBottom+other.yTop;
    }
      return -this.yTop+other.yBottom;
  }

  Block.prototype.isTouch = function(other){
    if(this.yTop==other.yBottom||this.yBottom==other.yTop||this.xLeft==other.xRight||this.xRight==other.xLeft)return true;
    return false;
  }

  Block.prototype.reset = function(){
    this.x = Math.random()*canvas.width;
    this.y = canvas.height/1.5 + Math.random()*canvas.height/3;
    this.changeBounds();
  }

  //height: B>F>A=I>D=E=G>H=K>J=C=L
  //width: L=K>A=B>C>G=I>H>J>D=E=F

  var A = new Block(2.25,      0.5, "#017000", "A");
  var B = new Block(A.width/SCALE,   0.6875, "#ff8300", "B");
  var C = new Block(2.125,    0.25, "#040044", "C");
  var D = new Block(1.5,     0.375, "#a30000", "D");
  var E = new Block(D.width/SCALE,     D.height/SCALE, "#894501", "E");
  var F = new Block(D.width/SCALE,     0.625, "#ffbf00", "F");
  var G = new Block(1.875,   D.height/SCALE, "#7e06ad", "G");
  var H = new Block(1.75,   0.3125, "#ff99fb", "H");
  var I = new Block(G.width/SCALE,     A.height/SCALE, "#1ed0e8", "I");
  var J = new Block(1.6875,   C.height/SCALE, "#512400", "J");
  var K = new Block(2.5,    H.height/SCALE, "#d10c47", "K");
  var L = new Block(K.width/SCALE,      C.height/SCALE, "#019957", "L");
  var Base1 = new Block(10, 0.25, "#000");
  var Base2 = new Block(10, 0.25, "#000");

  var blocks;

  function Level(constraints, blocks, reqHorizontal, horizontal, reqVertical, vertical, specHorizontal, specVertical, noTouch){
    this.constraints = constraints;
    this.blocks = blocks;
    this.reqHorizontal = reqHorizontal;
    this.horizontal = horizontal;
    this.reqVertical = vertical;
    this.specVertical = specVertical;
    this.specHorizontal = specHorizontal;
    this.noTouch = noTouch;
  }

  Level.prototype.displayConstraints = function(){
    var text = document.getElementById("constraints");
    text.innerHTML = '';
    for(var i=0;i<this.constraints.length;i++){
      text.innerHTML += this.constraints[i];
      text.innerHTML += "<br>";
    }
  }

Level.prototype.touchBase = function(){
  var ans = 0;
  if(Base1.y>Base2.y){
    for(var i=0;i<this.blocks.length;i++){
      if(this.blocks[i].yTop==Base2.yBottom)ans++;
    }
  }
  else{
    for(var i=0;i<this.blocks.length;i++){
      if(this.blocks[i].yTop==Base1.yBottom)ans++;
    }
  }
  return ans > 1;
}

  Level.prototype.getHorizontal = function(){
    var ans = 0;
    for(var i=2; i<this.blocks.length;i++){//Start at two to skip the bases
      if(!this.blocks[i].isVertical)ans++;
    }
    return ans;
  }

  Level.prototype.getVertical = function(){
    var ans = 0;
    for(var i=2;i<this.blocks.length;i++){
      if(this.blocks[i].isVertical)ans++;
    }
    return ans;
  }

  Level.prototype.checkSpecVertical = function(){
    for(var i=0;i<this.specVertical.length;i++){
      if(!this.specVertical[i].isVertical)return false;
    }
    console.log('vert true');
    return true;
  }

  Level.prototype.checkSpecHorizontal = function(){
    for(var i=0;i<this.specHorizontal.length;i++){
      if(this.specVertical[i].isVertical)return false;
    }
    return true;
  }

  Level.prototype.checkTouch = function(){
    return this.noTouch[0].isTouch(this.noTouch[1]);
  }

  Level.prototype.checkLevel = function(){
    if(!this.touchBase())return false;
    if(this.reqHorizontal){
      if(this.getHorizontal()!=this.horizontal)return false;
    }
    if(this.reqVertical){
      if(this.getVertical()!=this.vertical)return false;
    }
    if(this.specVertical){
      if(!this.checkSpecVertical())return false;
    }
    if(this.specHorizontal){
      if(!this.checkSpecHorizontal())return false;
    }
    if(this.noTouch){
      if(this.checkTouch())return false;
    }
    return true;
  }

  var l1 = new Level(["Two blocks must touch the top black bar"], [Base1, Base2, E, F, L], false, 0, false, 0, null, null, null); //HORIZONTAL THEN VERTICAL
  var l2 = new Level(["Two blocks must touch the top black bar"], [Base1, Base2, G, I, K], false, 0, false, 0, null, null, null);
  var l3 = new Level(["Two blocks must touch the top black bar"], [Base1, Base2, D, F, G, L], false, 0, false, 0, null, null, null);
  var l4 = new Level(["Two blocks must touch the top black bar"], [Base1, Base2, C, D, G, J], false, 0, false, 0, null, null, null);
  var l5 = new Level(["Two blocks must touch the top black bar"], [Base1, Base2, A, F, I, K], false, 0, false, 0, null, null, null);
  var l6 = new Level(["Two blocks must touch the top black bar", "D must be vertical"], [Base1, Base2, A, D, F, L], false, 0, false, 0, null, [D], null);
  var l7 = new Level(["Two blocks must touch the top black bar", "Exactly three blocks must be vertical"], [Base1, Base2, D, E, F, K], false, 0, true, 3, null, null, null);
  var l8 = new Level(["Two blocks must touch the top black bar"], [Base1, Base2, A, E, F], false, 0, false, 0, null, null, null);
  var l9 = new Level(["Two blocks must touch the top black bar", "Exactly three blocks must be horizontal"], [Base1, Base2, C, D, F], true, 3, false, 0, null, null, null);
  var l10 = new Level(["Two blocks must touch the top black bar", "Exactly two blocks must be vertical"], [Base1, Base2, A, B, C, L], false, 0, true, 2, null, null, null);
  var l11 = new Level(["Two blocks must touch the top black bar", "F must be horizontal"], [Base1, Base2, B, E, F], false, 0, false, 0, [F], null, null);
  var l12 = new Level(["Two blocks must touch the top black bar", "Exactly two blocks must be horizontal"], [Base1, Base2, E, G, K, L], true, 2, false, 0, null, null, null);
  var l13 = new Level(["Two blocks must touch the top black bar", "I must be vertical"], [Base1, Base2, A, B, G, I], false, 0, false, 0, null, [I], null);
  var l14 = new Level(["Two blocks must touch the top black bar", "Exactly three blocks must be horizontal"], [Base1, Base2, A, B, D, G, H, J], true, 3, false, 0, null, null, null);
  var l15 = new Level(["Two blocks must touch the top black bar"], [Base1, Base2, B, C, K, L], false, 0, false, 0, null, null, null);
  var l16 = new Level(["Two blocks must touch the top black bar", "Exactly one block must be horizontal"], [Base1, Base2, B, C, G, L], true, 1, false, 0, null, null, null);
  var l17 = new Level(["Two blocks must touch the top black bar", "Exactly six blocks must be horizontal"], [Base1, Base2, A, E, F, G, I, K], true, 6, false, 0, null, null, null);
  var l18 = new Level(["Two blocks must touch the top black bar", "Exactly seven blocks must be vertical"], [Base1, Base2, D, E, F, G, H, I, J], false, 0, true, 7, null, null, null);
  var l19 = new Level(["Two blocks must touch the top black bar", "A and F cannot touch"], [Base1, Base2, A, F, G, L], false, 0, false, 0, null, null, [A, F]);
  var l20 = new Level(["Two blocks must touch the top black bar", "G and I cannot touch"], [Base1, Base2, D, G, H, I, J], false, 0, false, 0, null, null, [G, I]);
  var l21 = new Level(["Two blocks must touch the top black bar", "Exactly two blocks must be vertical"], [Base1, Base2, A, E, F, K], false, 0, true, 2, null, null, null);
  var l22 = new Level(["Two blocks must touch the top black bar", "L must be horizontal"], [Base1, Base2, A, B, G, H, K, L], false, 0, false, 0, [L], null, null);
  var l23 = new Level(["Two blocks must touch the top black bar", "K and L must be vertical"], [Base1, Base2, B, D, F, I, J, K, L], false, 0, false, 0, null, [K,L], null);
  var l24 = new Level(["Two blocks must touch the top black bar", "G must be horizontal"], [Base1, Base2, C, D, E, G, I, J], false, 0, false, 0, [G], null, null);
  var l25 = new Level(["Two blocks must touch the top black bar", "K must be vertical"], [Base1, Base2, C, D, F, K], false, 0, false, 0, null, [K], null);
  var l26 = new Level(["Two blocks must touch the top black bar", "Exactly three blocks must be horizontal"], [Base1, Base2, C, E, G, I, J, K], true, 3, false, 0, null, null, null);
  var l27 = new Level(["Two blocks must touch the top black bar", "D and E must be vertical"], [Base1, Base2, B, D, E, I, J, K, L], false, 0, false, 0, null, [D, E], null);
  var l28 = new Level(["Two blocks must touch the top black bar", "E must be horizontal"], [Base1, Base2, A, E, H, J, K], false, 0, false, 0, [E], null, null);
  var l29 = new Level(["Two blocks must touch the top black bar", "Exactly three blocks must be horizontal"], [Base1, Base2, A, D, F, K, L], true, 3, false, 0, null, null, null);
  var l30 = new Level(["Two blocks must touch the top black bar"], [Base1, Base2, C, E, G, H, K], false, 0, false, 0, null, null, null);
  var l31 = new Level(["Two blocks must touch the top black bar", "Exactly three blocks must be horizontal"], [Base1, Base2, A, C, D, E, K, L], true, 3, false, 0, null, null, null);
  var l32 = new Level(["Two blocks must touch the top black bar", "B and J cannot touch"], [Base1, Base2, B, F, I, J], false, 0, false, 0, null, null, [B,J]);
  var l33 = new Level(["Two blocks must touch the top black bar", "Exactly one block must be vertical"], [Base1, Base2, A, C, F, H, I, L], false, 0, true, 1, null, null, null);
  var l34 = new Level(["Two blocks must touch the top black bar", "Exactly three blocks must be vertical"], [Base1, Base2, D, E, F, G, H, I, J], false, 0, true, 3, null, null, null);
  var l35 = new Level(["Two blocks must touch the top black bar", "Exactly one block must be vertical"], [Base1, Base2, B, C, F, G, H, K], false, 0, true, 1, null, null, null);
  var l36 = new Level(["Two blocks must touch the top black bar", "Exactly five blocks must be horizontal", "K and L must be vertical"], [Base1, Base2, A, B, C, D, E, F, G, H, I, J, K, L], true, 5, false, 0, null, [K,L], null);
  var l37 = new Level(["Two blocks must touch the top black bar", "Exactly two blocks must be horizontal"], [Base1, Base2, A, B, C, G, H, J, K, L], true, 2, false, 0, null, null, null);
  var l38 = new Level(["Two blocks must touch the top black bar", "K must be vertical", "D must be horizontal"], [Base1, Base2, A, B, D, G, H, I, J, K], false, 0, false, 0, [D], [K], null);
  var l39 = new Level(["Two blocks must touch the top black bar", "Exactly two blocks must be horizontal"], [Base1, Base2, A, B, C, D, E, G, H, J, K, L], true, 2, false, 0, null, null, null);
  var l40 = new Level(["Two blocks must touch the top black bar", "Exactly three blocks must be vertical"], [Base1, Base2, A, B, C, D, E, F, G, H, I, J, K, L], false, 0, true, 3, null, null, null);
  var levels = [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15, l16, l17, l18, l19, l20, l21, l22, l23, l24, l25, l26, l27, l28, l29, l30, l31, l32, l33, l34, l35, l36, l37, l38, l39, l40];

  function loadLevel(level){
    currLevel = levels[level-1];
    currLevel.displayConstraints();
    for(var i=0;i<currLevel.blocks.length;i++){
      currLevel.blocks[i].reset();
    }
    loop = requestAnimationFrame(animate);
  }

  animate = function(){
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,width,height);
    ctx.fillStyle = "#aaa";
    ctx.fillRect(0,height/1.5,width,height);
    for(var i=0;i<currLevel.blocks.length;i++){
      currLevel.blocks[i].draw();
    }
    requestAnimationFrame(animate);
  }

  canvas.addEventListener("mousedown", function(event){
    if(event.which==3){
      return;
    }
    if(!held){
      clickLocation = getMousePos(canvas, event);
      prevLocation = clickLocation;
      MOUSEDOWN = true;
      for(var i=0;i<currLevel.blocks.length;i++){
        if(clickLocation.x>currLevel.blocks[i].xLeft&&clickLocation.x<currLevel.blocks[i].xRight&&clickLocation.y>currLevel.blocks[i].yTop&&clickLocation.y<currLevel.blocks[i].yBottom){
          held = currLevel.blocks[i];
        }
      }
    }
    else{
      var move = 1e10;
      for(var i=0;i<currLevel.blocks.length;i++){
        if(currLevel.blocks[i]===held){
          continue;
        }
        else{
          distance = held.getDistance(currLevel.blocks[i]);
          if(distance < EPSILON && distance > -EPSILON && Math.abs(distance)<Math.abs(move)){
            move = distance;
          }
        }
      }
      if(move==1e10)move=0;
      held.move(0, move);
      held = null;
    }
  });

  canvas.addEventListener("mousemove", function(event){
    if(held){
      currLocation = getMousePos(canvas, event);
      var deltaX = currLocation.x-prevLocation.x;
      var deltaY = currLocation.y-prevLocation.y;
      held.move(deltaX, deltaY);
      prevLocation = currLocation;
    }
  });

  canvas.addEventListener("contextmenu", function(event){
    if(held){
      held.rotate();
    }
  });

  submit.addEventListener("mousedown", function(event){
    loadLevel(document.getElementById("level").value);
  });

  check.addEventListener("mousedown", function(event){
    if(currLevel.checkLevel()){
      constraints.innerHTML += "Success!";
    }
  });

}
