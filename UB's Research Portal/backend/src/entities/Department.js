const {EntitySchema}=require("typeorm")

const Department=new EntitySchema({
    name:"Department",
    tableName:"departments",
    columns:{
        id:{primary:true,type:"int",generated:true},
        name:{type:"varchar",unique:true},
        description:{type:"text",nullable:true},
        createdAt:{type:"timestamp",createDate:true},
    },
    relations:{
        teachers:{
            type:"one-to-many",
            target:"User",
            inverseSide:"department",
        },
        papers:{
            type:"one-to-many",
            target:"Paper",
            inverseSide:"department",
        },
        resources:{
            type:"one-to-many",
            target:"Resource",
            inverseSide:"department",
        }
    }
})

module.exports={Department}