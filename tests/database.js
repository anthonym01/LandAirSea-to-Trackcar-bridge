const database = require('../database');

database.initalize();//initalize database
database.get_user.data(1720721750676);//test get user data
database.create_user({ uname: "testduplicate", password: "0000" });//test create user duplication
database.get_user.data("testduplicate");//test get user data by username

database.get_user.data(1717344541826);