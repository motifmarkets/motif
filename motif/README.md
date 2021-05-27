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

1. Clone the Motif repository.
1. Change directory to the `motif` sub-folder in the cloned repository.
1. Run `npm install` to install the required dependencies.
1. Run `build:dev` script to build a development distribution.

## Running Motif in the development environment

1. Ensure the development environment is set up as [above](#installation-and-build).
1. Ensure you are in the repository's `motif` sub-folder
1. Run one of the following scripts to start a development server which hosts Motif:
    * `start:em2_cte-dev` to connect to an EM2 server.  Use this if you have an EM2 account.
    * `start:paritech_staging-dev` to connect to a Paritech server.
1. Start a browser (preferably Chrome) and go to URL: `http://localhost:4200`.
1. Use your brokerage account credentials to log into Passport.
1. The main Motif page (desktop) will then appear.  Confirm you are logged into a Demo environment.  A yellow line with the word **demo** will be visible at the top of the window.

## **DO NOT CONNECT TO PRODUCTION FROM DEVELOPMENT ENVIRONMENT**

A development environment cannot connect to production.  Contact your broker if you wish to use a customised version of Motif for production purposes.
