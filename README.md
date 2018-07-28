# backend for wasteno

## run
fill in the .env file, based on sample.env

install docker-compose and run

```
docker-compose up
```

## test
find the partial hash of the wasteno_backend container through `docker ps`, and then

```
docker exec <hash> /scripts/test-init.sh [<suite>]
```

or the automated hash-finding version

```
docker exec $(docker ps | grep wasteno_backend | cut -c 1-12) /scripts/test-init.sh
```

where suite is optional and defaults to all suites. Valid suites are any path names to files or directories with an `index.js` within `/test`. To test only the utils, you can run `docker exec <hash> /scripts/test-init.sh utils`

### notes
#### EIDs
each provider has a 3-letter code like `PRV`, each sale has an eid that starts with that code, and has 8 lowercase letters, like `PRVabcdefgh`, and each instance has that code, with an additional 6 digits, like `PRVabcdefgh012345`
