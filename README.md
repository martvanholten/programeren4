# Avans Programmeren 4 example server

This is a smal project for programmeren 4 from the Avans study, the point is to learn to work with JavaScript and API's. This is a server that has the function to aply CRUD on users and meals, as wel as being abale to sign up or sign of for a meal.

## Used dependacies

The used dependacies are:

```
"dependencies": {
    "body-parser": "^1.19.0",
    "dotenv": "^16.0.1",
    "express": "^4.17.1",
    "joi": "^17.6.0",
    "jsonwebtoken": "^8.5.1",
    "mysql2": "^2.3.3",
    "tracer": "^1.0.3"
  },
  "devDependencies": {
    "chai": "^4.3.6",
    "chai-http": "^4.3.0",
    "mocha": "^7.2.0",
    "nodemon": "^2.0.3",
    "nyc": "^15.0.1",
    "sonarqube-scanner": "^2.6.0"
  }
```

## Installing and starting

To instal you run:

```
copy the code from: https://github.com/martvanholten/programeren4
npm install
npm run dev
```

## Testing

To test you run:

``
npm test
```

## Roadmap
- [ ] API Validation layer (Celebrate+Joi)
- [ ] Unit tests examples
- [ ] The logging _'layer'_
- [ ] Add agenda dashboard
- [ ] Continuous integration with CircleCI 
- [ ] Deploys script and docs for AWS Elastic Beanstalk and Heroku

## Codecoverage en Sonar analysis

Run:

```
npm run coverage
npm run sonar
```
