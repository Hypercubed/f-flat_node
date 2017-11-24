# Site War

```forth
'https://github.com/' fetch length

site-size: [ fetch length ] ;

'https://api.github.com/users/github' fetch parse-json bio: @

fetch-json: [ fetch parse-json ] ;

[ 'http://google.com/' 'https://github.com/' ] [ [ fetch ] >> ] map all

site-war: [ dup [ [ site-size ] >> ] map all zip object ] ;

[ 'http://google.com/' 'https://github.com/' ] site-war
```