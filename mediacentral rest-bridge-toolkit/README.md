# REST bridge toolkit

Generates platform bridge service that acts as a facade for external REST service

## Motivation:
1. Expose external REST service into the platform
2. Controll the access to the API via secure gateway
3. ACL vi IAM

## Usage

### Step 1 - Create or obtain the RAML file for your RESTful service

Create [RAML](https://raml.org) definition for your API.

See examples in *./RamlSamples* folder.

### Step 2 - Get your toolkit ready

Install dependencies

    cd module
    npm install

### Step 3 - generate your service

Change to bin folder where generator is located

    cd bin

To see the generatr usage help run it without parameters

    ./rest-bridge-toolkit.js

or 

    ./rest-bridge-toolkit.js --help

To generate the service provide the path to the RAML file and output folder

    ./rest-bridge-toolkit.js -r ../RamlSamples/NetflixConductor.raml -o ./netflix-confuctor


To generate the service exposed via upstream specify the option

    ./rest-bridge-toolkit.js -r ../RamlSamples/NetflixConductor.raml -o ./netflix-confuctor -u true

### Step 4 - build the docker image for your service

Change to the service out directory

    cd netflix-conductor

Build the image

    docker build -t netflix-conductor:1.0 .

### Step 5 - run your service

    docker run --name netflix -d -t -e ACS_GATEWAY_HOST=<PLATFORM_HOST> -e BASE_URI=<SERVICE_HOST> netflix-conductor:1.0

## Extensibility

Service is generated based on the *serviceDefinition* object created as part of RAML interpretation.

The code is generated using [ejs](https://www.npmjs.com/package/ejs) templates. You can modify or create new teamplates according to your needs.

After service is generated you can use it as a foundation and add/change/modify the service logic.

