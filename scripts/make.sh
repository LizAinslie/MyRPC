if [[ -z $TRAVIS_TAG ]] 
then
    if [[ $TRAVIS_OS_NAME = "osx" ]] 
    then
        npm run makeosx
        # echo "osx"
    else
        npm run make
        # echo "linux"
    fi
fi