window.onload = function(){
  var canvas = document.getElementById("canvas");
  var points_element = document.getElementById("getPoints");
  var points = [];
  var lines = [];
  var temp_line = [];
  var priority_queue = [];
  var final_path = [];
  var has_started = false;
  var has_mouse_moved = false;
  var has_start = false;
  var has_end = false;
  var mouse_down = false;
  var time;
  var start, end;
  canvas.width = screen.width;
  canvas.height = screen.height;
  var ctx = canvas.getContext('2d');
  ctx.font = "16px Arial";
  var start_click = null;

  Point = function(x, y, id){
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.color = "#aaa";
    this.lines = [];
    this.line_length = [];
    this.path_from = "N/A";
    this.letter = (id+1).toString();
    this.value = 0;
    this.is_done = false;
    this.is_active = false;
  };

  Point.prototype.draw = function(){
    if(this.is_active){
      this.color = "#fff";
    } else {
      this.color = "#999";
    }
    if(this.is_start)this.color="#0F0";
    if(this.is_end)this.color="#F00";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillText(this.letter, this.x-this.radius/1.6, this.y+this.radius/2);
  };

  Point.prototype.setType = function(which){ //0 normal, 1 start, 2 end
    if(which==0){
      this.is_start = false;
      this.is_end = false;
      this.color = "#aaa";
    }
    if(which==1){
      this.is_start = true;
      this.is_end = false;
      this.color = "#0F0";
    }
    if(which==2){
      this.is_start = false;
      this.is_end = true;
      this.color = "#F00";
    }
  }

  Point.prototype.line = function(other, color, thick){
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = thick;
    ctx.lineTo(other.x, other.y);
    ctx.stroke();
  }

  Point.prototype.getDistance = function(other){
    return Math.sqrt(Math.pow(this.x-other.x,2)+Math.pow(this.y-other.y,2));
  };

  function drawBackground(){
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(var i=0;i<points.length;i++){
      points[i].draw();
    };
    for(var i=0;i<lines.length;i++){
      if (lines[i].length == 3) { // it has been given a weight
        var xAvg = Math.round((lines[i][0].x + lines[i][1].x)/2);
        var yAvg = Math.round((lines[i][0].y + lines[i][1].y)/2);
        ctx.fillStyle = "#77e";
        ctx.fillText(lines[i][2], xAvg, yAvg);
      }
      if(lines[i][0].is_active||lines[i][1].is_active){
        lines[i][0].line(lines[i][1], "#fff", 6);
      } else {
        lines[i][0].line(lines[i][1], "#ddd", 2);
      }
    }
    if(final_path.length){
      for(var j=0;j<final_path.length-1;j++){
        final_path[j].line(final_path[j+1], "#00F", 4);
      }
    }
  };

  function getMousePos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {x: (evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
            y: (evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height};
    }

  function update_queue(){
    var table = document.getElementById("queue");
    table.innerHTML = "<tr><th>Node</th><th>Heuristic Value</th><th>Path From</th></tr>";
    for(var i=0;i<priority_queue.length;i++){
      table.innerHTML += "<tr><td>"+priority_queue[i].letter+"</td><td>"+Math.round(priority_queue[i].value)+"</td><td>"+priority_queue[i].path_from+"</tr>";
    }
  }

  function main(){
    drawBackground();
    if(temp_line.length>1){
      temp_line[0].line(temp_line[1], "#ddd", 2);
    }
    requestAnimationFrame(main);
  }

  function insert(point){
    var new_queue = [];
    var is_in = false;
    for(var i=0;i<priority_queue.length;i++){
      if(point.letter==priority_queue[i].letter)continue;
      if(point.value<priority_queue[i].value&&!is_in){
        new_queue.push(point);
        is_in = true;
      }
      new_queue.push(priority_queue[i]);
    }
    if(!is_in){
      new_queue.push(point);
    }
    return new_queue;
  }

  function step(){
    for(var i=0;i<points.length;i++){
      points[i].is_active = false;
    }
    var start_point = priority_queue[0];
    start_point.is_active = true;
    for(var i=0;i<start_point.lines.length;i++){
      var other_point = start_point.lines[i][0].letter == start_point.letter ? start_point.lines[i][1] : start_point.lines[i][0];
      var is_in = false;
      if(other_point.is_done||other_point.letter==start_point.path_from)continue;
      var distance = start_point.line_length[i];
      var new_value = start_point.value - start_point.distance_to_end + distance + other_point.distance_to_end;
      for(var j=0;j<priority_queue.length;j++){
        if(priority_queue[j].letter==other_point.letter){
          if(new_value>priority_queue[j].value){
            is_in = true;
            break;
          };
        }
      }
      if(!is_in){
        other_point.value = new_value;
        other_point.path_from = start_point.letter;
        priority_queue = insert(other_point);
      }
    }
    for(var i=0;i<priority_queue.length;i++){
      if(priority_queue[i].letter==start_point.letter){
        priority_queue.splice(i,1);
        start_point.is_done = true;
        break;
      }
    }
    update_queue();
  }

  function check_end(){
    for(var i=0;i<priority_queue.length;i++){
      if(priority_queue[i].letter == end.letter){
        var disp = document.getElementById("path");
        var curr_point = end;
        final_path.push(curr_point);
        while(curr_point.path_from != "N/A"){
          disp.innerHTML = "->" + curr_point.letter + disp.innerHTML;
          for(var j=0;j<points.length;j++){
            if(points[j].letter==curr_point.path_from){
              curr_point = points[j];
              final_path.push(curr_point);
              break;
            }
          }
        }
        final_path.push(start);
        disp.innerHTML = curr_point.letter + disp.innerHTML;
      }
    }
  }

  requestAnimationFrame(main);

  canvas.addEventListener("mousedown", function(event){
    var pos = getMousePos(canvas, event);
    has_mouse_moved = false;
    start_click = getMousePos(canvas, event);
    mouse_down = true;
    temp_line = [];
    for(var i=0;i<points.length;i++){
      if(points[i].getDistance(pos)<points[i].radius){
        temp_line = [points[i]];
        break;
      }
    }
    time = new Date().getTime();
  })

  canvas.addEventListener("mouseup", function(event){
    if(has_started)return;
    if(has_mouse_moved){
      has_mouse_moved = false;
      mouse_down = false;
      var pos = getMousePos(canvas, event);
      for(var i=0;i<points.length;i++){
        if(points[i].getDistance(pos)<points[i].radius+5){
          if(temp_line[0].letter==points[i].letter){ //Start and end is same
            temp_line = [];
            return;
          }
          lines.push([temp_line[0], points[i], Math.round(points[i].getDistance(temp_line[0]))]);
          temp_line = [];
          return;
        }
      }
    } else {
      temp_line = [];
      var pos = getMousePos(canvas, event);
      for(var i=0;i<points.length;i++){
        if(points[i].getDistance(pos)<points[i].radius){
          if(!has_start){
            has_start = true;
            points[i].setType(1);
            return;
          }
          if(!has_end){
            has_end = true;
            points[i].setType(2);
            return;
          }
          return;
        }
      }
      for (var i=0;i<lines.length;i++) {
        var x1 = lines[i][0].x;
        var y1 = lines[i][0].y;
        var x2 = lines[i][1].x;
        var y2 = lines[i][1].y;

        var xRange = Math.abs(x2-x1);
        var yRange = Math.abs(y2-y1);
        var xBuffer = 0;
        var yBuffer = 0;
        if (xRange < 10)xBuffer = 10;
        if (yRange < 10)yBuffer = 10;

        if (pos.x < Math.min(x1, x2)-xBuffer || pos.x > Math.max(x1, x2)+xBuffer || pos.y < Math.min(y1, y2)-yBuffer || pos.y > Math.max(y1, y2)+yBuffer)continue;

        // Thanks to wikipedia for the below (formula assumes infinite line though)
        var distance = Math.abs((y2-y1)*pos.x-(x2-x1)*pos.y+x2*y1-y2*x1)/Math.pow(Math.pow(y2-y1, 2)+Math.pow(x2-x1, 2), 1/2);
        console.log(lines[i][0].letter + " to " + lines[i][1].letter + ": " + distance);
        if (distance < 10) {
          var value = prompt("Edge weight?");
          value = value ? value : 0;
          if (lines[i].length == 3) {
            lines[i][2] = value;
          } else {
            lines[i].push(value);
          }
          return;
        }
      }
      points.push(new Point(pos.x, pos.y, points.length));
    }
  });

  canvas.addEventListener("mousemove", function(event){
    if(new Date().getTime() - time < 20)return;
    if(!mouse_down){
      temp_line = [];
      return;
    }
    if(temp_line.length)temp_line[1]=getMousePos(canvas, event);
    has_mouse_moved = true;
  });

  document.getElementById("getPoints").addEventListener("mousedown", function(event){
    if (!has_end || !has_start) {
      alert("Must select a start and end node!");
      return;
    }
    for (var i=0;i<lines.length;i++) {
      if (lines[i].length != 3) { // Some of them have not been given weights
        alert("You must give weights to all edges!");
        return;
      }
    }
    has_started = true;
    for(var i=0;i<points.length;i++){
      if(points[i].is_start)start = points[i];
      if(points[i].is_end)end = points[i];
    }

    for (var i=0;i<lines.length;i++) {
      var p1 = lines[i][0];
      var p2 = lines[i][1];
      p1.lines.push(lines[i]);
      p2.lines.push(lines[i]);
    }

    for(var i=0;i<points.length;i++){
      points[i].distance_to_end = points[i].getDistance(end); // This is what makes it A* not Dijkstra
      points[i].value = points[i].distance_to_end;
      for(var j=0;j<points[i].lines.length;j++){
        points[i].line_length.push(points[i].lines[j][2]);
      }
    }
    console.log(points);
    priority_queue.push(start);
    update_queue();
  });

  document.getElementById("step").addEventListener("mousedown", function(event){
    step();
    check_end();
  });
}
