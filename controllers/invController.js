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
    errors:null,
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
    errors:null,
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
 *  Inventory Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.classificationList()
  res.render("./inventory/management", {
    title: "Vehicle Inventory Management",
    errors:null,
    nav,
    classificationSelect,
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
    let classificationList = await utilities.classificationList(classification_id)

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
        res.status(501).render("inventory/add-inventory",
        {
          title: "Add Inventory",
          nav,
          classificationList,
      })
}}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
// invCont.getInventoryJSON = async (req, res, next) => {
//   const classification_id = parseInt(req.params.classification_id)
//   const invData = await invModel.getInventoryByClassificationId(classification_id)
//   if (invData[0].inv_id) {
//     return res.json(invData)
//   } else {
//     next(new Error("No data returned"))
//   }
// }
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id, 10)
    const invData = await invModel.getInventoryByClassificationId(classification_id)

    if (!invData || invData.length === 0) {
      return res.status(200).json([])
    }
    return res.status(200).json(invData)
  } catch (err) {
    err.status = 500
    return next(err)
  }
}

/* ***************************
 *  Build Edit Inventory View
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventoryId, 10)
  if (Number.isNaN(inv_id)) {
    return next({ status: 400, message: "Invalid vehicle id." })
  }

  const data = await invModel.getDetailsByInventoryId(inv_id)
  if (!data) {
    return next({ status: 404, message: "Vehicle not found." })
  }

  const nav = await utilities.getNav()
  const selectHtml = await utilities.classificationList(data.classification_id)
  const itemName = `${data.inv_make} ${data.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: `Edit ${data.inv_year} ${itemName}`,
    nav,
    errors: null,

    classificationList: selectHtml,
    classificationSelect: selectHtml,

    inv_id: data.inv_id,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_description: data.inv_description,
    inv_image: data.inv_image,
    inv_thumbnail: data.inv_thumbnail,
    inv_price: data.inv_price,
    inv_miles: data.inv_miles,
    inv_color: data.inv_color,
    classification_id: data.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav()

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = (updateResult.inv_make || inv_make) + " " + (updateResult.inv_model || inv_model)
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  } else {
    const classificationList = await utilities.classificationList(classification_id)
    const itemName = `${inv_year} ${inv_make} ${inv_model}`

    req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("./inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      errors: null,
      classificationList,

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
}

module.exports = invCont