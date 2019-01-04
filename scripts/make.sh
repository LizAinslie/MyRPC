if [ -z "$TRAVIS_TAG" ] 
then

	if [ "$TRAVIS_OS_NAME" == "osx" ] 
	then

		echo "osx"
		npm run makeosx
	
	else 

		echo "linux"
		npm run make
	
	fi 

fi 