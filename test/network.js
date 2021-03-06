/* Import */
var chai = require('chai');
var assert = chai.assert;

/* Shorten var names */
var Connection = neataptic.Connection;
var Architect  = neataptic.Architect;
var Neat       = neataptic.Neat;
var Node       = neataptic.Node;
var Network    = neataptic.Network;
var Methods    = neataptic.Methods;
var Config     = neataptic.Config;

/* Turn off warnings */
Config.warnings = false;

/* Functions used in the testing process */
function checkMutation(method){
  var network = new Architect.Perceptron(2, 4, 4, 4, 2);
  network.mutate(Methods.Mutation.ADD_GATE);
  network.mutate(Methods.Mutation.ADD_BACK_CONN);
  network.mutate(Methods.Mutation.ADD_SELF_CONN);

  var originalOutput = [];
  for(var i = 0; i <= 10; i++){
    for(var j = 0; j <= 10; j++){
      originalOutput.push(network.activate([i/10, j/10]));
    }
  }

  network.mutate(method);

  var mutatedOutput = [];

  for(var i = 0; i <= 10; i++){
    for(var j = 0; j <= 10; j++){
      mutatedOutput.push(network.activate([i/10, j/10]));
    }
  }

  assert.notDeepEqual(originalOutput, mutatedOutput, "Output of original network should be different from the mutated network!");
}

function learnSet(set, iterations, error){
  var network = new Architect.Perceptron(set[0].input.length, 5, set[0].output.length);

  var options = {
    iterations: iterations,
    error: error,
    shuffle: true,
    rate: 0.3,
    momentum: 0.9
  };

  var results = network.train(set, options);

  assert.isBelow(results.error, error);
}

function testEquality(original, copied){
  for(var j = 0; j < 50; j++){
    var input = [];
    for(var a = 0; a < original.inputs; a++){
      input.push(Math.random());
    }

    var ORout = original.activate([input]);
    var COout = copied.activate([input]);

    for(var a = 0; a < original.output; a++){
      ORout[a] = ORout[a].toFixed(9);
      COout[a] = COout[a].toFixed(9);
    }
    assert.deepEqual(ORout, COout, 'Original and JSON copied networks are not the same!');
  }
}

/*******************************************************************************************
                          Test the performance of networks
*******************************************************************************************/

describe('Networks', function () {
  describe("Mutation", function(){
    it("ADD_NODE", function(){
      checkMutation(Methods.Mutation.ADD_NODE);
    });
    it("ADD_CONNECTION", function(){
      checkMutation(Methods.Mutation.ADD_CONN);
    });
    it("MOD_BIAS", function(){
      checkMutation(Methods.Mutation.MOD_BIAS);
    });
    it("MOD_WEIGHT", function(){
      checkMutation(Methods.Mutation.MOD_WEIGHT);
    });
    it("SUB_CONN", function(){
      checkMutation(Methods.Mutation.SUB_CONN);
    });
    it("SUB_NODE", function(){
      checkMutation(Methods.Mutation.SUB_NODE);
    });
    it("MOD_ACTIVATION", function(){
      checkMutation(Methods.Mutation.MOD_ACTIVATION);
    });
    it("ADD_GATE", function(){
      checkMutation(Methods.Mutation.ADD_GATE);
    });
    it("SUB_GATE", function(){
      checkMutation(Methods.Mutation.SUB_GATE);
    });
    it("ADD_SELF_CONN", function(){
      checkMutation(Methods.Mutation.ADD_SELF_CONN);
    });
    it("SUB_SELF_CONN", function(){
      checkMutation(Methods.Mutation.SUB_SELF_CONN);
    });
    it("ADD_BACK_CONN", function(){
      checkMutation(Methods.Mutation.ADD_BACK_CONN);
    });
    it("SUB_BACK_CONN", function(){
      checkMutation(Methods.Mutation.SUB_BACK_CONN);
    });
    it("SWAP_NODES", function(){
      checkMutation(Methods.Mutation.SWAP_NODES);
    });
  });
  describe("Structure", function(){
    it("Feed-forward", function(){
      this.timeout(30000);
      var network1 = new Network(2,2);
      var network2 = new Network(2,2);

      // mutate it a couple of times
      for(var i = 0; i < 100; i++){
        network1.mutate(Methods.Mutation.ADD_NODE);
        network2.mutate(Methods.Mutation.ADD_NODE);
      }
      for(var i = 0; i < 400; i++){
        network1.mutate(Methods.Mutation.ADD_CONN);
        network2.mutate(Methods.Mutation.ADD_NODE);
      }

      // Crossover
      var network = Network.crossOver(network1, network2);

      // Check if the network is feed-forward correctly
      for(conn in network.connections){
        var from = network.nodes.indexOf(network.connections[conn].from);
        var to = network.nodes.indexOf(network.connections[conn].to);

        // Exception will be made for memory connections soon
        assert.isBelow(from, to, "network is not feeding forward correctly");
      }
    });
    it("from/toJSON equivalency", function(){
      this.timeout(10000);
      var original = new Architect.Perceptron(Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1));
      var copy = Network.fromJSON(original.toJSON());
      testEquality(original, copy);


      var original = new Architect.Perceptron(Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1));
      var copy = Network.fromJSON(original.toJSON());
      testEquality(original, copy);

      var original = new Network(Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1));
      var copy = Network.fromJSON(original.toJSON());
      testEquality(original, copy);

      var original = new Architect.LSTM(Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1));
      var copy = Network.fromJSON(original.toJSON());
      testEquality(original, copy);

      var original = new Architect.LSTM(Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 5 + 1));
      var copy = Network.fromJSON(original.toJSON());
      testEquality(original, copy);

      var original = new Architect.Random(Math.floor(Math.random() * 5 + 1), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 5 + 1), 2);
      var copy = Network.fromJSON(original.toJSON());
      testEquality(original, copy);
    });
  });
  describe('Learning capability', function () {
    it("AND gate", function(){
      learnSet([{
        input: [0, 0],
        output: [0]
      }, {
        input: [0, 1],
        output: [0]
      }, {
        input: [1, 0],
        output: [0]
      }, {
        input: [1, 1],
        output: [1]
      }], 1000, 0.002);
    });
    it("XOR gate", function(){
      learnSet([{
        input: [0, 0],
        output: [0]
      }, {
        input: [0, 1],
        output: [1]
      }, {
        input: [1, 0],
        output: [1]
      }, {
        input: [1, 1],
        output: [0]
      }], 2000, 0.002);
    });
    it("NOT gate", function(){
      learnSet([{
        input: [0],
        output: [1]
      }, {
        input: [1],
        output: [0]
      }], 1000, 0.002);
    });
    it("XNOR gate", function(){
      learnSet([{
        input: [0, 0],
        output: [1]
      }, {
        input: [0, 1],
        output: [0]
      }, {
        input: [1, 0],
        output: [0]
      }, {
        input: [1, 1],
        output: [1]
      }], 2000, 0.002);
    });
    it("OR gate", function(){
      learnSet([{
        input: [0, 0],
        output: [0]
      }, {
        input: [0, 1],
        output: [1]
      }, {
        input: [1, 0],
        output: [1]
      }, {
        input: [1, 1],
        output: [1]
      }], 1000, 0.002);
    });
    it("SIN function", function(){
      this.timeout(30000);
      var set = [];

      while (set.length < 100) {
        var inputValue = Math.random() * Math.PI * 2;
        set.push({
          input: [inputValue / (Math.PI * 2)],
          output: [(Math.sin(inputValue) + 1) / 2]
        });
      }

      learnSet(set, 1000, 0.05);
    });
    it("Bigger than", function(){
      this.timeout(30000);
      var set = [];

      for(var i = 0; i < 100; i++){
        var x = Math.random();
        var y = Math.random();
        var z = x > y ? 1 : 0;

        set.push({ input: [x,y], output: [z] });
      }

      learnSet(set, 500, 0.05);
    });
    it("LSTM XOR", function(){
      this.timeout(30000);
      var lstm = new Architect.LSTM(1,1,1);

      lstm.train([
        { input: [0], output: [0]},
        { input: [1], output: [1]},
        { input: [1], output: [0]},
        { input: [0], output: [1]},
        { input: [0], output: [0]},
      ], {
        error: 0.001,
        iterations: 5000,
        rate: 0.3
      });

      lstm.activate([0]);
      assert.isBelow(0.9, lstm.activate([1]), "LSTM error");
      assert.isBelow(lstm.activate([1]), 0.1, "LSTM error");
      assert.isBelow(0.9, lstm.activate([0]), "LSTM error");
      assert.isBelow(lstm.activate([0]), 0.1, "LSTM error");
    });
    it("GRU XOR", function(){
      this.timeout(30000);
      var gru = new Architect.GRU(1,2,1);

      gru.train([
        { input: [0], output: [0]},
        { input: [1], output: [1]},
        { input: [1], output: [0]},
        { input: [0], output: [1]},
        { input: [0], output: [0]},
      ], {
        error: 0.001,
        iterations: 5000,
        rate: 0.1,
        clear: true
      });

      gru.activate([0]);
      assert.isBelow(0.9, gru.activate([1]), "GRU error");
      assert.isBelow(gru.activate([1]), 0.1, "GRU error");
      assert.isBelow(0.9, gru.activate([0]), "GRU error");
      assert.isBelow(gru.activate([0]), 0.1, "GRU error");
    });
    it("NARX Sequence", function(){
      var narx = new Architect.NARX(1, 5, 1, 3, 3);

      // Train the XOR gate (in sequence!)
      var trainingData = [
        { input: [0], output: [0] },
        { input: [0], output: [0] },
        { input: [0], output: [1] },
        { input: [1], output: [0] },
        { input: [0], output: [0] },
        { input: [0], output: [0] },
        { input: [0], output: [1] },
      ];

      narx.train(trainingData, {
        iterations: 1000,
        error: 0.005,
        rate: 0.05
      });

      assert.isBelow(narx.test(trainingData).error, 0.005);
    });
    it("SIN + COS", function(){
      this.timeout(30000);
      var set = [];

      while (set.length < 100) {
        var inputValue = Math.random() * Math.PI * 2;
        set.push({
          input: [inputValue / (Math.PI * 2)],
          output: [
            (Math.sin(inputValue) + 1) / 2,
            (Math.cos(inputValue) + 1) / 2
          ]
        });
      }

      learnSet(set, 1000, 0.05);
    });
    it("SHIFT", function(){
      var set = [];

      for(var i = 0; i < 1000; i++){
        var x = Math.random();
        var y = Math.random();
        var z = Math.random();

        set.push({ input: [x,y,z], output: [z,x,y] });
      }

      learnSet(set, 500, 0.03);
    });
  });
});
