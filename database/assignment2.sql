-- Query 1:Insert the following new record to the account table
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Query 2: Modify the Tony Stark record to change the account_type to "Admin".
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Query 3: Delete Tony Stark
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- Query 4: Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query.
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Query 5: Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items that belong to the "Sport" category. 
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
JOIN public.classification AS c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Query 6: Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns using a single query.
UPDATE public.inventory
SET inv_image = CASE
                  WHEN inv_image LIKE '/images/vehicles/%'
                    THEN inv_image
                  ELSE REPLACE(inv_image, '/images/', '/images/vehicles/')
                END,
    inv_thumbnail = CASE
                      WHEN inv_thumbnail LIKE '/images/vehicles/%'
                        THEN inv_thumbnail
                      ELSE REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
                    END;