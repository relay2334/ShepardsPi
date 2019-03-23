#!/bin/bash


wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/package-lock.json
mkdir views
cd views
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/views/index.pug
cd ..
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/README.md
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/package.json
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/server.js
mkdir lib
cd lib
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/lib/models.js
mkdir parsers
cd parsers
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/lib/parsers/tshark.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/lib/parsers/ettercap.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/lib/parsers/ngrep.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/lib/parsers/index.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/lib/parsers/driftnet.js
cd ..
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/lib/web.js
cd ..
mkdir static
mkdir static/css
cd static/css
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/css/bootstrap.css
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/css/gridstack.css
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/css/style.css
mkdir ../scss
cd ../scss
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/scss/style.scss
mkdir ../js
cd ../js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/js/jquery-ui.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/js/gridstack.all.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/js/lodash.min.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/js/shepard.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/js/index.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/js/jquery.min.js
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/static/js/bootstrap.min.js
cd ../../
mkdir config
cd config
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/config/default.json
cd ..
mkdir gridConf
cd gridConf
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/gridConf/grid.json
cd ..
wget https://raw.githubusercontent.com/relay2334/ShepardsPi/master/LICENCE

echo '-------------------------------------------'
echo ''
echo "REPO RECREATED"
echo ''
echo '-------------------------------------------'
