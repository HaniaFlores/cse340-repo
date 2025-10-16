const { body, validationResult } = require("express-validator")
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

// Validation rules
const reviewRules = () => [
  body("inv_id").isInt().withMessage("Invalid vehicle."),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1–5."),
  body("comment")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Please write at least 10 characters.")
]

// POST /reviews
async function createReview(req, res, next) {
  const errors = validationResult(req)
  const { inv_id, rating, comment } = req.body
  const nav = await utilities.getNav()
  const item = await invModel.getDetailsByInventoryId(parseInt(inv_id, 10))

  if (!item) return next({ status: 404, message: "Vehicle not found." })

  if (!errors.isEmpty()) {

    req.flash("notice")

    const [reviews, avg] = await Promise.all([
      reviewModel.getReviewsForVehicle(item.inv_id),
      reviewModel.getAverageRating(item.inv_id),
    ])
    const grid = await utilities.buildCarDetailsGrid(item)

    req.flash("notice", "Please correct the review errors below.")
    return res.status(400).render("./inventory/detail", {
      title: `${item.inv_year} ${item.inv_make} ${item.inv_model}`,
      nav,
      grid,
      errors,
      reviews,
      ratingAvg: avg?.avg_rating,
      ratingCount: avg?.count,
      reviewDraft: { rating, comment },
      item,
    })
  }

  try {
    const account_id = res.locals?.accountData?.account_id
    if (!account_id) {
      req.flash("notice")
      req.flash("notice", "Please log in to leave a review.")
      return res.redirect(`/account/login`)
    }

    await reviewModel.createReview(
      item.inv_id,
      account_id,
      parseInt(rating, 10),
      comment
    )

    req.flash("notice")
    req.flash("notice", "Thanks for your review!")
    return res.redirect(`/inv/detail/${item.inv_id}`)

  } catch (e) {
    req.flash("notice")

    if (e && (e.code === "23505" || /already reviewed/i.test(e.message))) {
      req.flash("notice", "You’ve already reviewed this vehicle.")
      req.flash("notice", "Please correct the review errors below.")
      return res.redirect(`/inv/detail/${item.inv_id}`)
    }

    req.flash("notice", "Sorry, something went wrong. Please try again.")
    return res.redirect(`/inv/detail/${item.inv_id}`)
  }
}

module.exports = { reviewRules, createReview }