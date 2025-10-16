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
router.get("/", utilities.checkAdm, utilities.handleErrors(invController.buildManagement));

//Route to build the add classification view
router.get("/add-classification", utilities.checkAdm, utilities.handleErrors(invController.buildAddClassification));

// Process the new classification data
router.post(
    "/add-classification",
    utilities.checkAdm,
    mngValidate.classificationRules(),
    mngValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

//Route to build the add inventory view
router.get("/add-inventory", utilities.checkAdm, utilities.handleErrors(invController.buildAddInventoryView))

// Process the new inventory data
router.post("/add-inventory", utilities.checkAdm, mngValidate.inventoryRules(), mngValidate.checkInventoryData, utilities.handleErrors(invController.addInventory))

//Route to get inventory JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build the "Edit Inventory" view
router.get("/edit/:inventoryId", utilities.checkAdm, utilities.handleErrors(invController.buildEditInventoryView))

// Process the "Edit Inventory" data
router.post("/update/", utilities.checkAdm, mngValidate.inventoryRules(), mngValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

// Route to build the "Delete Inventory" Confirmation view
router.get("/delete/:inventoryId", utilities.checkAdm, utilities.handleErrors(invController.buildDeleteInventoryView))

// Process the "Delete Inventory" request
router.post("/delete/", utilities.checkAdm, utilities.handleErrors(invController.deleteInventory))

module.exports = router;