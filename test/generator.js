var expect = require("chai").expect,
  generator = require("../generator");

describe("Text generator", function() {

  it("generates a string", function() {
    var generated_string = generator.generate(null);
    expect(typeof(generated_string)==='string' && generated_string.length > 0);
  });

  it("generates same string for same seed", function() {
    expect(generator.generate(-3) == generator.generate(-3));
  });

  it("generates different strings for different seeds", function() {
    expect(generator.generate(-3) != generator.generate(2));
  });


});
