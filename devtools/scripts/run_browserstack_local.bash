#File: run_browserstack_local.bash
#!/bin/bash -e

wget http://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip
unzip BrowserStackLocal-linux-x64.zip
./BrowserStackLocal ${bs_key} > /dev/null &
sleep 10
