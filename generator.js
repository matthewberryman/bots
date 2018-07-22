const MersenneTwister = require('mersenne-twister');
const plot_elements = require('./plot-elements.json');

module.exports.generate = (seed) => {

  let mt = new MersenneTwister(seed);

  var rands = [Math.floor( mt.random() * plot_elements.murdered_person.length),
               Math.floor( mt.random() * plot_elements.cause_of_death.length),
               Math.floor( mt.random() * plot_elements.village.length),
               Math.floor( mt.random() * plot_elements.village_group.length),
               Math.floor( mt.random() * plot_elements.angry_at.length),
               Math.floor( mt.random() * plot_elements.threatened.length)];

  return plot_elements.murdered_person[rands[0]] +
         " is found " + plot_elements.cause_of_death[rands[1]] +
         ". Suspicion falls on " + plot_elements.village[rands[2]] +
         "’s "+ plot_elements.village_group[rands[3]] +
         ", angry that " + plot_elements.angry_at[rands[4]] +
         " might threaten " + plot_elements.threatened[rands[5]]+".";
};
