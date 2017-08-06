var expect = require("chai").expect,
  generator = require("../generator");

describe("Text generator", function() {
  it("generates a string", function() {
    var generated_string = generator.generate(null);
    expect(typeof(generated_string)==='string' && generated_string.length > 0);
  });
});
