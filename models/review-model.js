const pool = require("../database/")

async function createReview(inv_id, account_id, rating, comment) {
  const sql = `
    INSERT INTO public.review (inv_id, account_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING *`
  const { rows } = await pool.query(sql, [inv_id, account_id, rating, comment])
  return rows[0]
}

async function getReviewsForVehicle(inv_id) {
  const sql = `
    SELECT r.review_id, r.rating, r.comment, r.created_at,
           a.account_firstname
    FROM public.review r
    JOIN public.account a ON a.account_id = r.account_id
    WHERE r.inv_id = $1
    ORDER BY r.created_at DESC`
  const { rows } = await pool.query(sql, [inv_id])
  return rows
}

async function getAverageRating(inv_id) {
  const sql = `SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*) AS count
               FROM public.review WHERE inv_id = $1`
  const { rows } = await pool.query(sql, [inv_id])
  return rows[0] || { avg_rating: null, count: 0 }
}

module.exports = { createReview, getReviewsForVehicle, getAverageRating }