
module.exports.generate = () => {
  var local_job = [
    "bee keeper",
    "archaeologist",
    "historian",
    "cider maker",
    "unpopular businessman",
    "sculptor",
    "eccentric Shakespearian actor",
    "owl breeder",
    "hermit with a dark secret",
    "miller",
    "critic of contemporary architecture",
    "poacher",
    "uncompromising environmentalist",
    "inexplicably celebrated poet",
    "mayor",
    "rose hybrid creator",
    "antiquarian book dealer",
    "badger whisperer" ];

  var cause_of_death = [
    "entombed in a statue",
    "crushed to death by apples",
    "strapped to an enormous cheese wheel",
    "stung to death by deliberately enraged bees",
    "drowned in cider",
    "pecked to death by owls",
    "impaled on a centuries-old maypole",
    "drowned in a manner eerily reminiscent of an event in local folklore",
    "electrocuted by a sabotaged Theremin",
    "slumped over a historically significant sundial",
    "strangled with the cord of his own metal detector",
    "exsanguinated on an heirloom variety rose bush",
    "in a church vault being opened by local archaeologists",
    "crushed under a fallen piece of stage equipment on the opening night of Macbeth",
    "garroted with a very distinctive set of lute strings",
    "under a tractor that is not his usual tractor",
    "baked into an oversized sponge cake",
    "poisoned with a local variety of toadstool" ];

  var village_group = [
    "medieval reenactment society",
    "choir",
    "patron saint",
    "army base",
    "chess club",
    "Floral Society",
    "obsessive history buffs",
    "vicar's son newly returned from university and full of reformist ideas",
    "company of morris dancers",
    "immigrant",
    "cult leader",
    "prodigal son",
    "chamber of commerce",
    "twins",
    "brass band",
    "madrigal enthusiasts",
    "ghost hunters society",
    "ghost" ];

  var angry_at = [
    "parking restrictions",
    "researchers who don't understand how much this all means to the village",
    "a proposed zoo",
    "modernity itself",
    "a big movie shoot taking place in the town",
    "redevelopment on the land of a down-on-his-luck aristocrat",
    "new beekeeping methods",
    "multiculturalism",
    "a charismatic out-of-towner",
    "someone who doesn't yet know they're actually the killer's daughter",
    "musical innovation",
    "the new deer sanctuary",
    "meddling ornithologists",
    "equestrian tourism",
    "badger culling",
    "a museum dedicated to an obscure local poet",
    "owls",
    "redevelopment and/or radical Islam" ];

    var threatened = [
      "the annual cheese festival",
      "rambling rights",
      "to expose the church's historical manuscript as a forgery",
      "to overshadow the sheepdog trials",
      "the town's largely potpourri-based economy",
      "centuries of ultimately pointless tradition",
      "what little sexual tension the town has left",
      "a legendary Anglo-Saxon treasure hoard",
      "the village's unbroken winning streak at the county honey fair",
      "to dredge up events from twenty-five years ago",
      "lace doily production levels",
      "the local deer sanctuary",
      "to ruin the pub",
      "badgers",
      "the future of Morris Dancing",
      "the very survival of England",
      "near-lethal levels of tweeness",
      "the Barnabys' marriage" ];


  var rands = [Math.floor ( Math.random() * local_job.length ), Math.floor ( Math.random() * cause_of_death.length ), Math.floor ( Math.random() * village_group.length ), Math.floor ( Math.random() * angry_at.length ), Math.floor ( Math.random() * threatened.length )];

  return "A local " + local_job[rands[0]] + " is found " + cause_of_death[rands[1]] +". Suspicion falls on the village "+ village_group[rands[2]] + ", angry that " + angry_at[rands[3]] + " might threaten " + threatened[rands[4]]+".";
};
