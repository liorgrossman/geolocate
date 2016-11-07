const fs = require("fs");


// Read country data
const countryData = [];
const dataIndexFromGeoID = {};
fs.readFileSync("GeoLite2-Country-Locations-en.csv").toString().split("\n").slice(1, -1).forEach(line => {
	const fields = line.split(',');
	const geoID = fields[0];
	const code = fields[4] || fields[2];
	const name = (fields[5] || fields[3]).replace(/"/g, '');
	dataIndexFromGeoID[geoID] = countryData.push({code, name})-1;
});


// Read block entries and fill up buffers as we go
const u32FromIPString = ip => ip.split(".").map(b => parseInt(b)).reduce((r, b) => (r << 8) + b) >>> 0;
const blockPrefix = [];
const blockSize = [];
const blockDataIndex = [];
fs.readFileSync("GeoLite2-Country-Blocks-IPv4.csv").toString().split("\n").slice(1).forEach(line => {
	const fields = line.split(/[,\/]/g);
	const prefix = fields[0];
	const size = fields[1];
	const geoID = fields[2];
	if(!(prefix && size && geoID)) return;

	blockPrefix.push(u32FromIPString(prefix));
	blockSize.push(32 - parseInt(size));
	blockDataIndex.push(dataIndexFromGeoID[geoID]);
});


// CIDR block matching function, to be included in the build
function geolocate(ipString) {
	const ip = u32FromIPString(ipString);

	// Starting off with a few passes of binary search to reduce the lookup range
	// Last time I checked, there were ~233k entries in the IPv4 countries table,
	// so it takes 15 passes to reduce the lookup to a small (~7) number of entries
	let floor = 0;
	let range = blockPrefix.length-1;
	for(let i = 0; i < 15; i++) { // This will likely be unrolled by V8, btw
		range >>= 1;
		if(ip > blockPrefix[floor+range])
			floor += range;
	}

	// Match blocks bitwise until one matches, then return the associated country data
	for(let i = floor; i < floor+range; i++)
		if(!((ip ^ blockPrefix[i]) >>> blockSize[i]))
			return countryData[blockDataIndex[i]];

	// Nothing found
	return undefined;
}


// And finally, generate the self-contained file
fs.writeFileSync("geolocate.js",`

const u32FromIPString = ${ u32FromIPString.toString() };
module.exports = ${ geolocate.toString() }

const countryData    = ${ JSON.stringify(countryData) };
const blockPrefix    = Uint32Array.from([${ blockPrefix.map(x => "0x"+x.toString(16)).join(",") }]);
const blockSize      = Uint8Array.from(${ JSON.stringify(blockSize) });
const blockDataIndex = Uint8Array.from(${ JSON.stringify(blockDataIndex) });

`.trim());