# Site War

```forth
site-size: [ read ln ] ;

site-war: [ dup [ [ site-size ] >> ] map all zip object ] ;

[ 'http://google.com/' 'https://github.com/' ] site-war
```