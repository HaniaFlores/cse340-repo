const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")
const Util = {}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<section class="classification-view"><ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul></section>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}



/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildCarDetailsGrid = async function(data){
  let grid = `
  <img class='car-img' src='${data.inv_image}' alt='Image of ${data.inv_make} ${data.inv_model} on CSE Motors'>
  <div class='details-box'>
  <h2 class="car-name">${data.inv_make} ${data.inv_model} Details</h2>
  <p class="price"><span>Price:</span> ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(data.inv_price)}</p>
  <p class="miles"><span>Miles:</span> ${new Intl.NumberFormat("en-US").format(data.inv_miles)}</p>
  <p class="description">${data.inv_description}</p>
  <p class="color"><span>Color:</span> ${data.inv_color}</p>
  </div>`

  return grid
}

/* ************************
 * Constructs the select HTML for the classification list
 ************************** */
Util.classificationList = async function (selectedOption) {
  const data = await invModel.getClassifications();
  let options = '<option value="">Choose a classification</option>';
    
  data.rows.forEach(row => {
  options += `<option value="${row.classification_id}" ${row.classification_id === Number(selectedOption) ? "selected" : ""}>
  ${row.classification_name}
  </option>`;
  });
    return options;
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Require Employee or Admin account for protected inventory routes
 * ************************************ */
Util.checkAdm = (req, res, next) => {
  if (res.locals.loggedin && (res.locals.accountData.account_type == "Employee" || res.locals.accountData.account_type == "Admin")) {
    return next();
  } else {
    req.flash("notice", "Not authorized. Please log in with a authorized account.");
    return res.redirect("/account/login");
  }
};

module.exports = Util