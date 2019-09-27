[![CircleCI](https://circleci.com/gh/mrkingz/cmrc.svg?style=svg)](https://circleci.com/gh/mrkingz/cmrc)
[![Maintainability](https://api.codeclimate.com/v1/badges/0b3250ee633a008cdacc/maintainability)](https://codeclimate.com/github/mrkingz/cmrc/maintainability)

# Communication and Media Research Center (CMRC)
CMRC is a web application that provides an online platform for clients to contact professionals or experts for a research in the field of Communication, Media, Advertising, marketing, Public Relations and Humanities.

## Backend Technology Stack
* NodeJS
* TypeScript
* Express
* PostgreSQL
* TypeORM

## Getting Started
* Install **NodeJs** and **PostgreSQL** (PGAdmin 4 preferably) locally on your machine or signup to an online hosted database e.g ElephantSql
* Clone the repository from bash or windows command
```sh
> $ `git clone https://github.com/mrkingz/cmrc.git
```

* Change into the directory
```sh
> $ `cd /cmrc`
```

* Install all required dependencies with
```sh
> $ `npm install or yarn add`
```

```
* After successful installation, create a `.env` file which will be used to load environment variables 
 > see .env.example file as a sample
```

* To build the application, run the following build command
```sh
> $ `npm run build` in production mode or `npm run build-dev` in development mode
```

* To start the application, run the following command
```sh
> $ `npm run start` or `npm run start-dev` in watch mode
```


## Testing
* Run Test `$ npm run test`
