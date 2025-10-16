const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const inventoryModel = require("../models/inventory-model")


/* ***************************
 *  Classification Rules
 * ************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Please provide a classification name with at least 3 characters")
      .custom(async (classification_name) => {
        const classificationExists = await inventoryModel.checkExistingClassification(classification_name)
        if (classificationExists){
            throw new Error("Classification already exists. Please use a different name")
        }
    }),
  ]
}


/* ***************************
 *  Check New Classification Data
 * ************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name
        })
        return
    }
    next()
}


/* ***************************
 *  Inventory Rules
 * ************************** */
validate.inventoryRules = () => {
  return [
      body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage('Enter valid Make')
      .custom(value => !/\s/.test(value))
      .withMessage('No spaces are allowed in the Make'),

      body("inv_model")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter valid Model"),

      body("inv_year")
      .trim()
      .isLength({ min: 4})
      .withMessage("Enter valid year")
      .isLength({ max: 4})
      .withMessage("Enter 4 numbers only for year"),

      body("inv_description")
      .trim()
      .isLength({ min: 1})
      .withMessage("Enter description"),

      body("inv_image")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter image path"),

      body("inv_thumbnail")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter image thumbnail path"),

      body("inv_price")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter valid price without symbol, comma and period"),

      body("inv_miles")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter miles without symbol, comman and period"),

      body("inv_color")
      .trim()
      .isLength({min: 1})
      .withMessage("Enter color"),
  ]
}


/* ***************************
 *  Check New Inventory Data
 * ************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles,  inv_color, classification_id} = req.body
  let classificationList = await utilities.classificationList(classification_id)
  let errors = []
  errors = validationResult(req)
  if(!errors.isEmpty()){
      let nav = await utilities.getNav()
      res.render("./inventory/add-inventory", {
          errors,
          title: "Add Inventory",
          nav,
          classificationList,
          inv_make, 
          inv_model, 
          inv_year, 
          inv_description, 
          inv_image, 
          inv_thumbnail, 
          inv_price, 
          inv_miles, 
          inv_color,
      })
      return
  }
  next()
}


/* ***************************
 *  Check Update Inventory Data (redirects back to EDIT view)
 * ************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_id
  } = req.body

  const errors = validationResult(req)

  const classificationList = await utilities.classificationList(classification_id)
  const nav = await utilities.getNav()

  if (!errors.isEmpty()) {
    return res.status(400).render("./inventory/edit-inventory", {
      errors,
      nav,
      classificationList,
      title: `Edit ${inv_year} ${inv_make} ${inv_model}`,

      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }

  next()
}

module.exports = validate