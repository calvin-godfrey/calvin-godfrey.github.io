window.onload = function(){
  var canvas = document.getElementById("canvas");
  canvas.width = screen.width;
  canvas.height = screen.height;
  var height = canvas.height;
  var width = canvas.width;
  var ctx = canvas.getContext("2d");
  var space = 75;
  
  function main(){
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#FFF";
    var i = 0;
    while(i < width){
      ctx.fillRect(i, 0, i+10, height);
      i += space;
    }
    i = height;
    while(i > 0){
      ctx.filleRect(0, i, width, i+10);
    }
    requestAnimationFrame(main);
  }
  requestAnimationFrame(main);
}
