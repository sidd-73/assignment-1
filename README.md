# Dependencies
- npm init -y - to initialize the packagae.json file.
- npm install express prisma @prisma/client jsonwebtoken bcryptjs body-parser
- npx prisma init
- npx prisma migrate dev --name init - to create tables in the db.


# For Using Local database
- create a .env file in the root
- add database url

- DATABASE_URL="mysql://username:password@localhost:3306/yourschema"

# User Registration
- /register  registers username and password.


{
  "username": "exampleUser",
  "password": "examplePassword"
}
the json data to send request.

- /login - user authorization

{
  "username": "exampleUser",
  "password": "examplePassword"
}

returns a JWT.


# Adding Items to cart
- /cart - POST

{

  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}


for adding item to cart.
# pass the web token returned while logged in and in the authorization tab for bearer pass the token-- for sending request in postman


- /cart -  GET  To view the cart
#pass the web token returned while logged in and in the authorization tab for bearer pass the token-- for sending request in postman

- /cart - DELETE to clear the cart.
#pass the web token returned while logged in and in the authorization tab for bearer pass the token-- for sending request in postman


# Ordering
- /orders - POST  To make an order
 #pass the web token returned while logged in and in the authorization tab for bearer pass the token-- for sending request in postman

- /orders/:id - PUT  To update status of the order (id refers to the order id) 
 {
  "status":"shipped"
 }



