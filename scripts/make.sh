if [[ $TRAVIS_OS_NAME = "osx" && test -z $TRAVIS_TAG ]]; then
    npm run make:osx;
fi
if [[ $TRAVIS_OS_NAME = "linux" && test -z $TRAVIS_TAG ]]; then
    npm run make;
fi