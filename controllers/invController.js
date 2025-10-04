const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build details view by inventory id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getDetailsByInventoryId(inventory_id)
  const grid = await utilities.buildCarDetailsGrid(data)
  let nav = await utilities.getNav()
  const className = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
  res.render("./inventory/detail", {
    title: className,
    nav,
    grid,
  })
}

/* ***************************
 *  Build error view
 * ************************** */
invCont.buildError = (req, res, next) => {
  try {
    let err = new Error(" Error 500");
    err.status = 500;
    throw err;
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Vehicle Inventory Management",
    errors:null,
    nav,
  });
};


/* ***************************
 *  Build Add Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    errors:null,
    nav,
  });
}

/* ***************************
 *  Add Classification Process
 * ************************** */
invCont.addClassification = async function (req, res) {
  
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  let nav = await utilities.getNav()


  if (result) {
    req.flash(
      "notice",
      `Congratulations, ${classification_name} has been added to the classification list.`
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Inventory Management",
      nav,
      errors: null,
    });
  } else {
    req.flash(
      "notice",
      "Sorry, there was an error processing the new classification. Please try again."
    );
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};


/* ***************************
 *  Build Add Inventory View
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.classificationList();
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    errors: null,
    classificationList,
  });
};


/* ****************************************
 *  Process Add Inventory Data
 * *************************************** */
invCont.addInventory = async function(req, res){
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
    classification_id} = req.body
    const addInventoryResult = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id)

    let nav = await utilities.getNav()
    let classificationList = await utilities.classificationList()

      if (addInventoryResult){
        req.flash(
          "notice",
          `Success! ${inv_year} ${inv_make} ${inv_model} has been added to inventory.`
        )
        res.status(201).render("inventory/management", {
          title: "Vehicle Inventory Management",
          nav,
          errors: null,
        })
      }else{
        req.flash("notice", "Sorry, adding inventory failed. Please try again.")
        req.status(501).render("inventory/add-inventory",
        {
          title: "Add Inventory",
          nav,
          classificationList,
      })
}}


module.exports = invCont