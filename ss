link : https://splitwise-api.herokuapp.com

endpoints : 
    /   
        to get all users


    /:userid 
        to get user details


    /:userid/getfriends   
        to get allfriends


    /:userid/addfriend 
        re1.body : {
            name :
            email:
        }


    /:userid/deletefriend/:id
        to delete a friend with id


    /:userid/addexpense

        req.body:
            {
                "expenseId": 3,
                "userid": "13",
                "userpaid": 200,
                "userowedshare": 100,
                "friends": [
                    {
                        "id": "14",
                        "paidShare": 50,
                        "owedShare": 100
                    },
                    {
                        "id": "18",
                        "paidShare": 50,
                        "owedShare": 100
                    }
                ],
                "description": "cooldrinks",
                "amount": 300
            }


    /:userid/settleup

         to settlup with friend
         req.body : 
             {
                "expenseId": 6,
                "userId": "1",
                "userpaid": 0,
                "userowedshare": 50,
                "friendId": "2",
                "friendpaid": 50,
                "friendowedShare": 0,
                "amount": 50
            }
         


    /:userid/deleteexpense
     

        req.body :
            {
                "expenseId": 3,
                "payments": [
                        {
                            "balance": 100,
                           "owedShare": 100,
                            "id": "13",
                            "paidShare": 200
                        },
                        {
                            "balance": -50,
                            "owedShare": 100,
                            "id": "14",
                            "paidShare": 50
                        },
                        {
                            "balance": -50,
                            "owedShare": 100,
                            "id": "18",
                            "paidShare": 50
                            }
                        ],
                    "description": "cooldrinks",
                    "amount": 300
            }
        