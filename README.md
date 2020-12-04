# Lib sync for Enonic XP

## Compatibility

| Version       | XP version |
| ------------- | ---------- |
| 1.0.0         | 6.11.0     |

## Changelog

### 1.0.0

* Add an exampleService that uses appConfig.
* Add a bunch of libraries to sync from sql to repo nodes.

## TODO

* document how to use it
* delete (mark deleted?)
* update (decorate wipe vs merge)
* nodeType
* value type
* indexing

# How to sync from SQL database to Enonic XP repo

1. Make sure a working database driver is included in build.gradle.
   (We have already included com.oracle:ojdbc6:12.1.0.1-atlassian-hosted)

## Copyright and license

This software is licensed under [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
Babel Code released under [the MIT license](https://github.com/babel/babel/blob/master/LICENSE).
React is released under the [BSD license](https://github.com/facebook/react/blob/master/LICENSE).
