const express = require("express")
const router = new express.Router()
const { reviewRules, createReview } = require("../controllers/reviewController")
const utilities = require("../utilities/")

router.post("/", utilities.checkLogin, reviewRules(), utilities.handleErrors(createReview))

module.exports = router