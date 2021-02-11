const User = require('../db_models/user.js'); 
const Dish = require('../db_models/dish.js'); 
const Order = require('../db_models/order.js'); 
const Customer = require('../db_models/customer.js'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const customer = require('../db_models/customer.js');
require('dotenv').config()




module.exports = {

    login: async ({userName, pw}) => {
        const user = await User.findOne({ name: userName });
        if(user){
            const isEqual = await bcrypt.compare(pw, user.pw);
                if(!isEqual){
                    return {
                        id: 0,
                        token: "",
                        exp: 0,
                        msg: "Password not correct"
                    };
                }
                const token = await jwt.sign({userName: userName}, process.env.JSONWEBTOKEN_SECRET, {expiresIn: "1h"});
                return {
                    id: user._id,
                    token: token,
                    exp: 1,
                    msg: "OK"
                };
        } else {
            return {
                id: 0,
                token: "",
                exp: 0,
                msg: "User doesn't exist"
            };
        }
    },



    getDishes: async () => {
        const dishes = await Dish.find();
        if(dishes){
            return dishes.map(dish => {
                return {
                    ...dish._doc,
                    id: dish._id,
                }
            })
        } else {
            return []
        }   
    },

    addDish: async ({dish}) => {
        const newDish = new Dish(dish);
        newDish.save(function (err, result) {
            if (err){
                return "not OK"
                throw err;
                
            } else {
                if(result){
                    return "OK"
                }else{
                    throw err;
                } 
            }
          });
    },

    deleteDish: async ({id}) => {
        await Dish.findByIdAndDelete(id, function (err) {
        if(err){
            console.log(err);
            return "nbot OK"
        } else{
           console.log("Successful deletion"); 
           return "OK"
        }
        
        });
    },


    changeDish: async ({dish}) => {
        const filter = { _id: dish.id };
        const update = { 
            name: dish.name,
            description: dish.description,
            price: dish.price,
            availible: dish.availible,
            allergies: dish.allergies,
            category: dish.category,
        };
        const doc = await Dish.findOneAndUpdate(filter, update, {
            new: true
          });
        if(doc){
            console.log(doc)
        }else{
            console.log("no doc")
            console.log(dish)
        }
    },



    getCustomerInfo: async ({id}) => {
        const customer = await Customer.findById(id)      
        if(customer){
            console.log("---------------------------------")
//            console.log(customer)
            const orders = []
            for (let i = 0; i < customer.orders.length; i++) {
                console.log(customer.orders[i])
                await Order.findById(customer.orders[i])
                .then(async thisOrder => {
                    const order = {
                        dishNames: [],
                        payment: thisOrder.payment,
                        delivery: thisOrder.delivery,
                        sum: thisOrder.sum,
                    }
                    for (let j = 0; j < thisOrder.dishes.length; j++){
                        await Dish.findById(thisOrder.dishes[j])
                        .then(dish => {
                            order.dishNames.push(dish.name)
                        })
                        .catch(err => {
                            throw err
                        })
                    }
                    orders.push(order)
                })
                .catch(err => {
                    throw err
                })
            }
            console.log(orders)
            console.log(countMostFrequentValue(orders, "payment"))
            console.log(countMostFrequentValue(orders, "delivery"))
            console.log(countMostFrequentDish(orders))
            console.log(getTotalSum(orders))

            const result = {
                favDish: countMostFrequentDish(orders),
                favDelivery: JSON.parse(countMostFrequentValue(orders, "delivery")),
                favPayment: countMostFrequentValue(orders, "payment"),
                totalSum: getTotalSum(orders),
            }
            
            return result
        }
        
    },  


    

    order: async ({orderData}) => {
        const now = getDate(new Date())
        const order = new Order({
            delivery: orderData.delivery,
            payment: orderData.payment,
            sum: orderData.sum,
            dishes: orderData.dishes,
            date: {
                min: now.minute,
                hour: now.hour,
                day: now.day,
                month: now.month,
                year: now.year,
                },
            orderedBy: ""
            }
        )
        const savedNewOrder = await order.save()
        if(savedNewOrder){

            console.log("saved new order: ")
            console.log(savedNewOrder)
            console.log("-------------------")

            const existingCustomer = await Customer.findOne({ phone: orderData.phone });
            if(existingCustomer){
                console.log(existingCustomer)
                existingCustomer.orders.push(savedNewOrder._id)
                savedNewOrder.orderedBy = existingCustomer._id
                await existingCustomer.save()
                await savedNewOrder.save()
            } else {
                const newCustomer = new Customer({
                    phone: orderData.phone,
                    name: orderData.name,
                    email: orderData.email,
                    address: orderData.address,
                    orders: [], 
                    }
                )
                await newCustomer.save(async function(err, nc) {
                    if(err){throw err}
                    if(nc){
                        savedNewOrder.orderedBy = nc._id
                        await savedNewOrder.save( async function(err, sno){
                            newCustomer.orders.push(sno._id)
                            await newCustomer.save( async function(err, nc2){
                                if(err){throw err}
                                console.log(nc2)
                            })
                        })
                    }
                 });
            }
        }
    },




    getStats: async ({dateString}) => {
        const LastEntryList = await Order.find().sort({ _id: -1 }).limit(1)
        const LastEntry = LastEntryList[0]
        if(LastEntry){
            const today = getDate(new Date(dateString))
            let filter;

            console.log(LastEntry.date)
            console.log(today)

            let lastOrderDate;
            if(LastEntry.date.day === today.day 
                && LastEntry.date.day === today.day 
                && LastEntry.date.month === today.month 
                && LastEntry.date.year === today.dayeary ){
                lastOrderDate = "Today"
                filter = { 
                    'date.day': today.day,
                    'date.month': today.month,
                    'date.year': today.year,
                }
            } else {
                lastOrderDate = "" + LastEntry.date.day + "." + LastEntry.date.month + "." + LastEntry.date.year
                filter = { 
                    'date.day': LastEntry.date.day,
                    'date.month': LastEntry.date.month,
                    'date.year': LastEntry.date.year,
                }
            }

            const resultList = [lastOrderDate]        
            const ordersOfToday = await Order.find(filter)
            if(ordersOfToday){
                for (let i = 0; i < ordersOfToday.length; i++) {
                    const customer = await Customer.findById(ordersOfToday[i].orderedBy)                 
                    const dishesOfThisOrder = []
                    for (let j = 0; j < ordersOfToday[i].dishes.length; j++){
                        const currentDish = await Dish.findById(ordersOfToday[i].dishes[j])
                        if(currentDish){
                            dishesOfThisOrder.push(currentDish)
                        }
                    }
                    const resultItem = {
                        order: ordersOfToday[i],
                        customer: {
                            id: customer._id,
                            ordered: customer.orders.length,
                        },
                        dishes: dishesOfThisOrder
                    }
                    resultList.push(JSON.stringify(resultItem, null, 2))
                    /*
                    if(customers.some(c => c.id === resultItem.id)){                // why doesnt work????????
                        customers.push({})
                    } else {
                        customers.push(resultItem)
                    }
                    */
                }
            }
 //         console.log(resultList)
            return resultList 
        }
    },
}


const getDate = (dateString) => {
    const date = new Date(dateString)
    const min = date.getMinutes() 
    const h = date.getHours()
    const d = date.getDate()
    const m = date.getMonth() + 1 // !!!
    const y = date.getFullYear()
    return {
        minute: min,
        hour: h,
        day: d,
        month: m,
        year: y,
    }
}




const countMostFrequentValue = (arrayOfObjects, key) => {        
    const uniqueValues = [...new Set(arrayOfObjects.map(item => {
        return item[key]
    }))]
    const countingHelper = {}
    for (let i = 0; i < uniqueValues.length; i++){
        countingHelper[uniqueValues[i]] = 0
    }
    for (let j = 0; j < arrayOfObjects.length; j++){
        countingHelper[arrayOfObjects[j][key]] += 1
    }
    const result = Object.keys(countingHelper).reduce((a, b) => countingHelper[a] > countingHelper[b] ? a : b);
    return result
}


const countMostFrequentDish = (arrayOfObjects) => {  
    const allDishes = []      
    for (let i = 0; i < arrayOfObjects.length; i++){
        for (let j = 0; j < arrayOfObjects[i].dishNames.length; j++){
            allDishes.push(arrayOfObjects[i].dishNames[j])
        }
    }
    const uniqueDishes = [...new Set(allDishes)]
    const countingHelper = {}
    for (let i = 0; i < uniqueDishes.length; i++){
        countingHelper[uniqueDishes[i]] = 0
    }
    for (let i = 0; i < allDishes.length; i++){
        countingHelper[allDishes[i]] += 1
    }
    const result = Object.keys(countingHelper).reduce((a, b) => countingHelper[a] > countingHelper[b] ? a : b);
    return result
}

const getTotalSum = (arrayOfObjects) => {  
    let result = 0
    for (let i = 0; i < arrayOfObjects.length; i++){
        result += arrayOfObjects[i].sum
    }
    return result
}
    