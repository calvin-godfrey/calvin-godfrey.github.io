window.onload = function(){
    var canvas = document.getElementById("canvas");
    canvas.width = screen.width;
    canvas.height = screen.height * 0.8;
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext("2d");
    var resetX = width/2;
    var ballCount = 10;
    var ballArray = [];
    var blockArray = [];
    var RADIUS = 8;
    var SCALE = 16;
    var hasAdded = false;
    var canAdd;

    function getMousePos(canvas, evt){
      var rect = canvas.getBoundingClientRect();
      return {x: (evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
              y: (evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height};
      }

    var Vector = function(x, y){
        this.x = x;
        this.y = y;
        this.magnitude = Math.pow(Math.pow(this.x, 2)+Math.pow(this.y, 2), 0.5);
    }

    var Block = function(x, y, life, isSpecial, id){
        this.x = x;
        this.y = y;
        this.life = life;
        this.isSpecial = isSpecial;
        this.id = id;
        this.width = width/10;
        this.height = height/10
        this.isDone = false;
    }

    Block.prototype.draw = function(){
        ctx.font = "16px Arial";
        ctx.fillStyle = "#F00";
        ctx.save();
        ctx.translate(this.x, this.y);
        if(!this.isSpecial){
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            ctx.fillStyle = "#000";
            ctx.fillText(this.life, -10, 0);
        } else {
            ctx.strokeStyle = "#00F";
            ctx.fillStyle = "#00F";
            ctx.beginPath();
            ctx.arc(0, 0, RADIUS, 0, Math.PI*2);
            ctx.stroke();
            ctx.fill();
        }
        ctx.restore();
        this.checkLife();
    }

    Block.prototype.checkLife = function(){
        if(this.life<=0)this.isDone = true;
    }

    Block.prototype.shift = function(){
        this.y += this.height;
    }

    var Ball = function(x, y, velocity, timeToStart, id){
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.time = timeToStart;
        this.id = id;
        this.radius = RADIUS;
        this.isDone = false;
    }

    Ball.prototype.draw = function(){
        ctx.fillStyle = "#0F0";
        ctx.strokeStyle = "#0F0";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.stroke();
        ctx.fill();
    }

    Ball.prototype.step = function(){
        if((new Date().getTime())<this.time&&!this.isDone)return;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.checkOuter();
    }

    Ball.prototype.checkOuter = function(){
        if(this.x<this.radius){
            this.velocity.x *= -1;
            this.x = this.radius;
        }
        if(this.x>(width-this.radius)){
            this.velocity.x *= -1;
            this.x = width-this.radius;
        }
        if(this.y<this.radius){
            this.velocity.y *= -1;
            this.y = this.radius;
        }
        if(this.y>(height-this.radius))this.stop();
        this.checkBlocks();
    }

    Ball.prototype.checkBlocks = function(){
        for(var i=0;i<blockArray.length;i++){
            block = blockArray[i];
            if(block.isSpecial){
                if(Math.pow(Math.pow(this.x-block.x, 2)+Math.pow(this.y-block.y, 2), 0.5)<2*RADIUS){
                    block.life = 0;
                    block.isDone = true;
                    ballCount++;
                    console.log(ballCount);
                    continue;
                }
            }
            if(this.y-this.radius/2>block.y+block.height/2||this.y+this.radius/2<block.y-block.height/2||this.x-this.radius/2>block.x+block.width/2||this.x+this.radius/2<block.x-block.width/2)continue;
            if(this.y+this.radius/2>block.y-block.height/2&&this.y-this.radius/2<block.y+block.height/2&&!block.isSpecial){
                var compX1 = block.x-block.width/2;
                var compX2 = block.x+block.width/2;
                if(Math.abs(compX1-this.x)<RADIUS){
                    block.life--;
                    this.velocity.x *= -1;
                    this.x = compX1 - this.radius/2;
                }
                if(Math.abs(compX2-this.x)<RADIUS){
                    block.life--;
                    this.velocity.x *= -1;
                    this.x = compX2 + this.radius/2;
                }
            }
            if(this.x+this.radius/2>block.x-block.width/2&&this.x-this.radius/2<block.x+block.width/2&&!block.isSpecial){
                var compY1 = block.y+block.height/2;
                var compY2 = block.y-block.height/2;
                if(Math.abs(compY1-this.y)<RADIUS){
                    block.life--;
                    this.velocity.y *= -1;
                    this.y = compY1 + this.radius/2;
                }
                if(Math.abs(compY2-this.y)<RADIUS){
                    block.life--;
                    this.velocity.y *= -1;
                    this.y = compY2 - this.radius/2;
                }
            }
        }
    }

    Ball.prototype.stop = function(){
        for(var i=0;i<ballArray.length;i++){
            if(ballArray[i].isDone){
                this.x = resetX;
                this.y = height-RADIUS;
                this.isDone = true;
                return;
            }
        }
        resetX = this.x;
        this.y = height-RADIUS;
        this.velocity = new Vector(0,0);
        this.isDone = true;
    }

    function main(){
        if(!hasAdded){
            addRow();
            hasAdded = true;
        }
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0,0,width,height);
        var willAdd = true;
        for(var i=0;i<ballArray.length;i++){
            ballArray[i].draw();
            ballArray[i].step();
            if(!ballArray[i].isDone)willAdd = false;
        }
        if(canAdd&&willAdd&&ballArray.length>0){
            hasAdded = false;
            canAdd = false;
        }
        for(var i=0;i<blockArray.length;i++){
            if(blockArray[i].isDone){
                blockArray.splice(i, 1);
                i--;
                continue;
            }
            if(blockArray[i]!=undefined)blockArray[i].draw();
        }
        requestAnimationFrame(main);
    }

    function addRow(){
        for(var i=0;i<blockArray.length;i++){
            blockArray[i].shift();
        }
        var startLen = blockArray.length;
        for(var i=0;i<10;i++){
            if(Math.random()<0.35){
                var special = Math.random()<0.3;
                console.log(special);
                blockArray.push(new Block((width/10)*i+(width/20), height/20, ballCount, special, blockArray.length))
            }
        }
        if(blockArray.length==startLen){
            blockArray.push(new Block((width/10)*(Math.floor(Math.random()*11))+(width/20), height/20, ballCount, false, blockArray.length));
        }
    }

    requestAnimationFrame(main);

    document.getElementById("canvas").addEventListener("mouseup", function(event){
        for(var i=0;i<ballArray.length;i++){
            if(!ballArray[i].isDone)return;
        }
        canAdd = true;
        ballArray = [];
        var mousePos = getMousePos(canvas, event)
        var angle = Math.atan2(mousePos.x-resetX, (height-RADIUS)-mousePos.y)-Math.PI/2;
        var startTime = new Date().getTime();
        for(var i=0;i<ballCount;i++){
            ballArray.push(new Ball(resetX, height-RADIUS, new Vector(SCALE*Math.cos(angle), SCALE*Math.sin(angle)), startTime + 50*i, i));
        }
    });
}
