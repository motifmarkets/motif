# Motif

Motif is a browser based extensible trading terminal that is part of [Motif Markets](https://motifmarkets.com)' [Motionite](https://motionite.trade) brokerage solution.

The source code for Motif and some extensions that ship with Motif, has been made available to enable:

* easy development of extensions,
* for use, education and research as per the license which covers this source code.

More information:

* Website: [https://motionite.trade/motif](https://motionite.trade/motif)
* Licensing: [https://motionite.trade/license/motif](https://motionite.trade/license/motif)
* Repository: [https://github.com/motifmarkets/motif](https://github.com/motifmarkets/motif)

# Source code usage

## Installation and build

* Clone Motif repository
* Change directory to the `motif` sub-folder in the cloned repository.
* Run `npm install` to install the required dependencies.
* Run `build:dev` script to build a development distribution.

## Running the development environment

* Install and ensure you can create a development distribution.
* Run one of the following 2 scripts to start Motif and connect to a server:
    1. `start:em2_cte-dev` to connect to an EM2 server.  Use this if you have an EM2 account.
    1. `start:paritech_staging-dev` to connect to a Paritech server.
* Ensure you are connected to a Demo environment.  A yellow line with the word **demo** will be visible at the top of the window.

## **DO NOT CONNECT TO PRODUCTION FROM DEVELOPMENT ENVIRONMENT**

A development environment cannot connect to production.  Contact your broker if you wish to use a customised version of Motif for production purposes.
