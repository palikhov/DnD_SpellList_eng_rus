'use strict';

const fs = require('fs');
const argv = require('yargs').argv;
const cheerio = require('cheerio');
const path = require('path');
const request = require('request');

const INPUT = "source_en_x.txt";
const OUTPUT = "result_en_x.js";

let allSpells=[];
let oSpell={};

const aSchools = [
	"conjuration",
	"abjuration",
	"necromancy",
	"evocation",
	"enchantment",
	"transmutation",
	"illusion",
	"divination"
];

function processFile(inputFile) {
    var fs = require('fs'),
        readline = require('readline'),
        instream = fs.createReadStream(inputFile),
        outstream = new (require('stream'))(),
        rl = readline.createInterface(instream, outstream);
     
    rl.on('line', function (line) {
			var oInfo = true;
        //console.log(line);
				if(line == "@@@") { // prev spell end
					if(oSpell.name){
						oSpell.text = oSpell.text.replace("<br>", "");
						allSpells.source = "XGTE";
						allSpells.push({"en": oSpell});
						oSpell={};
					}
				} else {
					// name ?
					if(!oSpell.name) {
						oSpell.name = line;
						oInfo = false;
					}
					
					// school / level
					var oSchool = line.match(new RegExp(aSchools.join("|"), "i"));
					if(oSchool) {
						oSpell.school = oSchool[0];
					
						//console.log("---\n"+line+"\n---");
					
						if (/cantrip/i.test(line)) {
							oSpell.level = 0;
						} else {
							var oLevel = line.match(/\d/);
							if (oLevel) {
								oSpell.level = oLevel[0];
							}
						}
						
						if(/ritual/i.test(line)) {
							oSpell.ritual = "ritual";
						}
						oInfo = false;
					}
					
					//casting time
					var oCastingTime = line.match(/Casting Time:([\d\w\s\,]+)/i);
					if(oCastingTime) {
						oSpell.castingTime = oCastingTime[1].trim();
						oInfo = false;
					}
					
					//range
					var oRange = line.match(/Range:([\d\w\s\,\(\)]+)/i);
					if(oRange) {
						oSpell.range = oRange[1].trim();
						oInfo = false;
					}
					
					//components
					var oComp = line.match(/Components:([\w\s\,]+)(\([^\)]+\))?/i);
					if(oComp) {
						oSpell.components = oComp[1].trim();
						if(oComp[2]) {
							oSpell.materials = oComp[2].trim();
						}
						oInfo = false;
					}
					
					//Duration
					var oDuration = line.match(/Duration:([\d\w\s\,\(\)]+)/i);
					if(oDuration) {
						oSpell.duration = oDuration[1].trim();
						oInfo = false;
					}
					
					// info
					if(oInfo)  {
						var sLine = line.replace(/-[\r\n]+/, "").replace(/\s*[\r\n]+\s*/, " ").replace(/(^[\w\s]+er Levels\.)/, "<b>At Higher Levels.</b>").replace(/^([A-Z])/, "<br>$1");
						if(!oSpell.text) {
							oSpell.text = "";
						}
						oSpell.text += sLine;
					}
				}
    });
    
    rl.on('close', function (line) {
        //console.log(line);
        //console.log('done reading file.');
				//console.dir(allSpells);
				
				fs.writeFile(OUTPUT, JSON.stringify(allSpells, null, ' '), function(err) {
					if(err) {
							return console.log(err);
					}

					console.log("The file was saved!");
			}); 
    });
}
processFile(INPUT);