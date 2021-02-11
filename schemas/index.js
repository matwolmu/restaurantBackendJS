const {buildSchema} = require('graphql');

module.exports = buildSchema(`

type AuthData {
    id: String
    token: String
    exp: Int
    msg: String
}

type Dish {
    id: String
    name: String
    description: String
    price: Float 
    availible: Boolean 
    allergies: String
    category: String
}

type CustomerInfo {
    favDish: String
    favDelivery: Boolean
    favPayment: String
    totalSum: Float 

}

input DishInput {
    name: String
    description: String
    price: Float 
    availible: Boolean 
    allergies: String
    category: String
}

input ChangeDishInput {
    id: String
    name: String
    description: String
    price: Float 
    availible: Boolean 
    allergies: String
    category: String
}

input AddressInput {
    street: String
    zip: String
}

input OrderInput {
    dishes: [String]
    delivery: Boolean
    payment: String
    sum: Float
    name: String
    email: String
    phone: String 
    address: String

}





type Query {
    getDishes: [Dish]
    

    
  
    
}
type Mutation {
    login(userName: String, pw: String): AuthData
    addDish(dish: DishInput): String
    deleteDish(id: String): String
    changeDish(dish: ChangeDishInput): String
    order(orderData: OrderInput): String
    getStats(dateString: String): [String]
    getCustomerInfo(id: String): CustomerInfo
    
    
}

schema {
    query: Query
    mutation: Mutation

    
    
}`


);




