'https://github.com/' fetch length

[ fetch length ] "site-size" def

'https://api.github.com/users/github' fetch parse-json bio: @

[ fetch parse-json ] "fetch-json" def

[ 'http://google.com/' 'https://github.com/' ] [ [ fetch ] >> ] map all

[ dup [ [ site-size ] >> ] map all zip object ] site-war: def

[ 'http://google.com/' 'https://github.com/' ] site-war
