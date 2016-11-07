[geolocate](https://github.com/npny/geolocate/) is a fast, self-contained, country-level GeoIP resolver that you can include as a drop-in in your project and use immediately, without the need for a separate server and database files.

# Features

**Simple.** This is a single file exporting a single `geolocate` function that does a single job, match an IP to a country.

**Lookups are fast.** Averages to 4.6μs per lookup, or about 220k lookups per second, even on my feeble laptop.

**Self-contained.** No need to spawn up an entire server and an SQLite database just to make a couple of queries. No outside request to a geolocation API. No dependencies.

# Usage
```javascript
const geolocate = require("./geolocate");

geolocate("8.8.8.8");        // {code: 'US', name: 'United States'}
geolocate("160.106.123.29"); // {code: 'CA', name: 'Canada'}
geolocate("103.28.251.187"); // {code: 'NZ', name: 'New Zealand'}
geolocate("54.222.60.218");  // {code: 'CN', name: 'China'}
geolocate("127.0.0.1");      // undefined
```

# About the data
This is designed to work with the [GeoLite2 Country](http://dev.maxmind.com/geoip/geoip2/geolite2/) IPv4 database.
However, [MaxMind Inc](https://www.maxmind.com/en/home) also provides city-level and IPv6 databases, and you can probably make it work on those instead with a couple of tweaks.

# Getting started
What's actually included is the build script that will generate an up-to-date `geolocate.js`, rather than the script itself.  
And because I know you're lazy, here's a three-liner that does everything for you ; fetch the GeoLite db, run build.js, and clean up, leaving a freshly generated `geolocate.js`:
```shell
curl "http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country-CSV.zip" | tar -x --strip-components=1 --include "*/GeoLite2-Country-Blocks-IPv4.csv" "*/GeoLite2-Country-Locations-en.csv"
curl "https://raw.githubusercontent.com/npny/geolocate/master/build.js" | node;
rm GeoLite2-Country-Blocks-IPv4.csv GeoLite2-Country-Locations-en.csv
```


# License

The [GeoLite2](http://dev.maxmind.com/geoip/geoip2/geolite2/) databases are distributed under the [Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) license.  
[geolocate](https://github.com/npny/geolocate/) is released under the [MIT license](http://opensource.org/licenses/mit-license.php). Pierre Boyer, 2016.
