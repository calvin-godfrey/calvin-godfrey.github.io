window.onload = function(){
    var canvas = document.getElementById("canvas");
    var gravity = document.getElementById("gravity");
    var useGravity;
    var GRAVITY = 3;
    var checkGravity = setInterval(function(){
      useGravity = gravity.checked;
    }, 5);
    canvas.width = screen.width;
    canvas.height = screen.height;
    var width = canvas.width;
    var height = canvas.height;
    var RADIUS = height/3;
    var ctx = canvas.getContext("2d");
    var startClickLocation, endClickLocation, tempEndLocation, tempPrevEndLocation, isMouseDown;
    var ballArray = [];

    var FACTOR = 0.10;

    var Vector = function(x, y){
        this.x = x;
        this.y = y;
        this.magnitude = Math.pow(Math.pow(x,2)+Math.pow(y,2),0.5);
    }

    var Ball = function(x, y, id){
      this.x = x;
      this.id = id;
      this.y = y;
      this.prevX = x;
      this.prevY = y;
      this.isDone = false;
      this.color = "#FFF";
      this.radius = 8;
      this.delay = 0;
      this.mass = this.radius;
    }

    Ball.prototype.draw = function(){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.fillStyle = this.color;
      ctx.fill();
      this.life-=1;
    }

    Ball.prototype.setup = function(endX, endY){
      this.velocity = new Vector((this.x-endX)*FACTOR, (this.y-endY)*FACTOR);
      this.isDone = true;
      this.life=100000;
    }

    Ball.prototype.step = function(){
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        if(useGravity){this.velocity.y += GRAVITY;if(this.velocity.y>20)this.velocity.y=20;}
        if(this.delay>0)this.delay--;
    }

    Ball.prototype.checkLocation = function(){
        var epsilon = this.radius;
        var distance = Math.pow(Math.pow(this.x-width/2, 2)+Math.pow(this.y-height/2, 2), 0.5);
        if(distance>RADIUS-epsilon&&distance<RADIUS+epsilon&&this.delay==0){
            this.delay = 0;
            var slope = -(this.x-width/2)/(this.y-height/2); //Implicit differentiation!
            var normalSlope = -1/slope;
            var normal = new Vector(1, -1/slope);
            var velocitySlope = this.velocity.y/(this.velocity.x+1e-10); //So that we don't divide by 0
            var perpAngle = Math.acos(dotProduct(this.velocity, normal)/(this.velocity.magnitude*normal.magnitude));
            var u = new Vector((dotProduct(this.velocity, normal)/dotProduct(normal, normal))*normal.x, (dotProduct(this.velocity, normal)/dotProduct(normal, normal))*normal.y);
            var w = new Vector(this.velocity.x-u.x, this.velocity.y-u.y);
            this.velocity = new Vector(w.x-u.x, w.y-u.y);
            //this.velocity = mult_scalar(this.velocity, 0.3);
        }
    }

    Ball.prototype.ballCollision = function(){
        for(var i=0;i<ballArray.length;i++){
            other = ballArray[i];
            if(other.id==this.id||!other.isDone)continue;
            if(this.x+this.radius+other.radius>other.x
            && this.x<other.x+this.radius+other.radius
            && this.y+this.radius+other.radius>this.y
            && this.y < other.y+this.radius+other.radius){
                var distance = Math.pow(Math.pow(this.x-other.x, 2)+Math.pow(this.y-other.y,2),0.5);
                if (distance < this.radius*2){ //We have collision
                    var n = new Vector((other.x-this.x)/distance, (other.y-this.y)/distance)
                    var p = (2*(dotProduct(this.velocity, n)-dotProduct(other.velocity, n)))/(this.mass+other.mass);
                    var vx1 = this.velocity.x - p*this.mass*n.x;
                    var vy1 = this.velocity.y - p*this.mass*n.y;
                    var vx2 = other.velocity.x + p*other.mass*n.x;
                    var vy2 = other.velocity.y + p*other.mass*n.y;
                    this.velocity = new Vector(vx1, vy1);
                    this.step();
                    other.velocity = new Vector(vx2, vy2);
                    other.step();
                }
            }
        }
    }


    function drawTrajectory(start, end, color){
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = color;
      if(color=="#FFF"){
        ctx.lineWidth = 4;
      }
      else{
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }

    function dotProduct(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }

    function mult_scalar(vector, scalar){
        return new Vector(vector.x*scalar, vector.y*scalar);
    }

    function getMousePos(canvas, evt){
      var rect = canvas.getBoundingClientRect();
      return {x: (evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
        y: (evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height};
    }

    function main(){
        ctx.fillStyle = "#fff";
        ctx.fillRect(0,0,width,height);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(width/2, height/2, RADIUS, 0, Math.PI*2);
        ctx.stroke();
        for(var i=0;i<ballArray.length;i++){
            ballArray[i].draw();
            if(ballArray[i].isDone)ballArray[i].step();
        }
        for(var i=0;i<ballArray.length;i++){
            if(ballArray[i].isDone){
                ballArray[i].ballCollision();
                ballArray[i].checkLocation();
            }
        }
        requestAnimationFrame(main);
    }

    requestAnimationFrame(main);

    canvas.addEventListener("mousedown", function(event){
      startClickLocation = getMousePos(canvas, event);
      tempEndLocation = new Object();
      tempPrevEndLocation = new Object();
      tempEndLocation.x = startClickLocation.x;
      tempEndLocation.y = startClickLocation.y;
      tempPrevEndLocation.x = startClickLocation.x;
      tempPrevEndLocation.y = startClickLocation.y;
      isMouseDown = true;
      ballArray.push(new Ball(startClickLocation.x, startClickLocation.y, ballArray.length));
      ballArray[ballArray.length-1].draw();
    });

    canvas.addEventListener("mouseup", function(event){
      endClickLocation = getMousePos(canvas, event);
      drawTrajectory(startClickLocation, endClickLocation, "#FFF");
      isMouseDown = false;
      ballArray[ballArray.length-1].setup(endClickLocation.x, endClickLocation.y);
      ballArray[ballArray.length-1].index = ballArray.length-1;
    });

    canvas.addEventListener("mousemove", function(event){
      if(isMouseDown){
        tempEndLocation = getMousePos(canvas, event);
        drawTrajectory(startClickLocation, tempPrevEndLocation, "#FFF");
        tempPrevEndLocation.x = tempEndLocation.x;
        tempPrevEndLocation.y = tempEndLocation.y;
        drawTrajectory(startClickLocation, tempEndLocation, "#000");
        ballArray[ballArray.length-1].draw();
      }
    });
}
