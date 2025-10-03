const logs = require('../modules/logger');

logs.info("Logger module test",6969,8086);
logs.info(7,3)
logs.info(7,3,4,5,67,5,43,2)
logs.info({ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" },{ uname: "testduplicate", password: "0000" })
logs.info({ uname: "testduplicate", password: "0000" })
logs.info("1 pram")
logs.info("1 pram","2 prams")
logs.info("1 pram","2 prams","3 prams")
logs.info("1 pram","2 prams","3 prams","4 prams")
logs.info("1 pram","2 prams","3 prams","4 prams","5 prams")
logs.info("1 pram","2 prams","3 prams","4 prams","5 prams","6 prams")
logs.info("1 pram","2 prams","3 prams","4 prams","5 prams","6 prams","7 prams");
