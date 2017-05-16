window.onload = function(){
  var inputData = [[0, 0], [0, 1], [1, 0], [1, 1]];
  var outputData = [0, 1, 1, 0];

  function activation(n){
    return 1/(1+Math.exp(-n)); //Standard sigmoid
  }

  var Neuron = function(isInput, isOutput){
    this.isInput = isInput;
    this.isOutput = isOutput;
    if(this.isInput&&this.isOutput)throw "Neuron cannot be input and output";
  }

  Neuron.prototype.initialize = function(n){ //where n is the number of neurons in the previous layer, this is only done for the initial generation
    this.weights = [];
    for(var i=0;i<n;i++){
      this.weights.push((-10*Math.random() + 5));
    }
    if(this.isInput)return; //input neuron does not need bias
    this.bias = (-10*Math.random() + 5); //Random bias value
  }

  Neuron.prototype.setValues = function(weights, bias){ //This is done for all generations after the first
    if(this.isInput)this.weights = weights[0];
    if(!this.isInput)this.weights = weights;
    if(this.isInput)return;
    this.bias = bias;
  }

  Neuron.prototype.feedForward = function(input){ //This is an array where the nth element is the output of the nth neuron in previous layer
    if(!this.weights)throw "Weights must be initialized first";
    var output = 0;
    for(var i=0;i<input.length;i++){
      output += input[i]*this.weights[i];
    }
    if(!this.isInput)output += this.bias;
    return activation(output);
  }

  var Network = function(size, isInitial){ //Size is an array where the nth element is the number of neurons in the nth layer
    this.layers = [];
    this.isInitial = isInitial;
    this.ready = false;
    for(var i=0;i<size.length;i++){
      this.layers.push([]);
      for(var j=0;j<size[i];j++){
        if(i == 0){
          this.layers[i].push(new Neuron(true, false));
        }
        if(i == size.length-1){
          this.layers[i].push(new Neuron(false, true));
        }
        if(i != 0 && i != size.length-1){
          this.layers[i].push(new Neuron(false, false));
        }
      }
    }
    if(isInitial){
      this.ready = true;
      for(var j=0;j<this.layers[0].length;j++){
        this.layers[0][j].initialize(1); //only one weight from the input
      }
      for(var i=1;i<this.layers.length;i++){ //Skip the input layer
        for(var j=0;j<this.layers[i].length;j++){ //jagged array
          this.layers[i][j].initialize(this.layers[i-1].length); //random weight array and values
        }
      }
    }
  }

  Network.prototype.setValues = function(values){ //Values is 3-dimensional array, first is layers, second is neurons, then two values: weights and bias
    if(this.ready||this.isInitial)return;
    this.ready = true;
    for(var j=0;j<this.layers[0].length;j++){
      this.layers[0][j].setValues(values[0][j]); //first layer has no bias
    }
    for(var i=1;i<this.layers.length;i++){
      for(var j=0;j<this.layers[i].length;j++){
        this.layers[i][j].setValues(values[i][j][0], values[i][j][1]);
      }
    }
  }

  Network.prototype.process = function(input){
    if(!this.ready)return;
    for(var i=0;i<input.length;i++){
      input[i] *= this.layers[0][i].weights[0]; //Multiplies input by the weight of each input neuron
    }
    for(var i=1;i<this.layers.length;i++){
      var out = [];
      for(var j=0;j<this.layers[i].length;j++){
        out.push(this.layers[i][j].feedForward(input));
      }
      input = out;
    }
    return input;
  }

  function eliminate(networks){ //networks should be sorted by fitness
<<<<<<< HEAD
    for(var i=0;i<networks.length;i++){
      var chance = Math.random()*(i*0.5+10);
      if(chance > 9.5){
        networks[i] = 0;
      }
    }
    return networks.filter(function(a){return a!=0}); //Remove all the 0's
=======
    return networks.splice(0, 2);
    /*for(var i=0;i<networks.length;i++){
      var chance = Math.random()*(i*0.5+10);
      if(chance > 15){
        networks[i] = 0;
      }
    }
    *///return networks.filter(function(a){return a!=0}); //Remove all the 0's
>>>>>>> a8c0f5a3cb202113d39b95f77db5deabc827b6b3
  }

  function populate(networks, size){
    var len = networks.length; //So that we only take values from initial population, not newly generated networks
    while(networks.length < size){
      var index1 = Math.floor(Math.random()*len);
      var index2 = index1;
      while(index2 == index1){
        index2 = Math.floor(Math.random()*len); //Make sure the same network isn't chosen twice
      }
      networks.push(cross(networks[index1], networks[index2]));
    }
    return networks;
  }

  function cross(network1, network2){
    var size = [];
    for(var i=0;i<network1.layers.length;i++){
      size.push(network1.layers[i].length);
    }
    var child = new Network(size, false); //should be the same size
    var newValues = [];
    for(var i=0;i<network1.layers.length;i++){ //lengths should be equal
      newValues.push([]);
      var layer1 = network1.layers[i];
      var layer2 = network2.layers[i];
      for(var j=0;j<layer1.length;j++){
        newValues[i].push([[]]); //array consisting of another array (weights), later a number (bias)
        var neuron1 = layer1[j];
        var neuron2 = layer2[j];
        for(var k=0;k<neuron1.weights.length;k++){
          var weight1 = neuron1.weights[k];
          var weight2 = neuron2.weights[k];
          newValues[i][j][0].push((weight1+weight2)/2);// + (-1*Math.random()+0.5)); //Keep random ammount
        }
        if(i!=0){
          var bias1 = neuron1.bias;
          var bias2 = neuron2.bias;
          newValues[i][j].push((bias1+bias2)/2 + (-1*Math.random()+0.5));
        }
      }
    }
    //console.log(newValues);
    child.setValues(newValues);
    return child;
  }

  function generation(networks){
    for(var i=0;i<networks.length;i++){
      var network = networks[i];
      var error = 0;
      for(var j=0;j<inputData.length;j++){
        var x = network.process(inputData[j]);
        error += Math.abs(outputData[j]-x[0]);
      }
      network.fitness = 4-error; //Smaller error means higher fitness
    }
    return networks;
  }

  function main(){
    //var network = new Network([2, 1, 1], false); //Two input neurons, one hidden neuron, one output neuron
    var networks = [];

    for(var i=0;i<50;i++){
      networks.push(new Network([2, 1, 1], true));
    }
    for(var z=0;z<100;z++){
      console.log("--------------------");
      networks = generation(networks);

      networks.sort(function(a, b){
        return b.fitness-a.fitness; //Arranged in descending order
      });

      for(var i=0;i<networks.length;i++){
        console.log(networks[i].fitness);
      }

      networks = eliminate(networks);

      networks = populate(networks, 50);
    }


    //network.setValues([[[2], [2]], [[[2, 1], 1]], [[[2], 1]]]);
    //console.log(network.process([1, 1]));
  }

  document.getElementById("start").addEventListener("mousedown", function(event){
    main();
  });
}
