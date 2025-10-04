// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const mngValidate = require("../utilities/management-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build details view by inventory Id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build error 500 view  
router.get(
    "/error/500",
    utilities.handleErrors(invController.buildError)
);

// Route to build management view
router.get("/", utilities.handleErrors(invController.buildManagement));

//Route to build the add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Process the new classification data
router.post(
    "/add-classification",
    mngValidate.classificationRules(),
    mngValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

//Route to build the add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventoryView))

// Process the new inventory data
router.post("/add-inventory", mngValidate.inventoryRules(), mngValidate.checkInventoryData, utilities.handleErrors(invController.addInventory))

module.exports = router;