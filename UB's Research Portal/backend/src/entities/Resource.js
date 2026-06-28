const {EntitySchema}=require("typeorm")

const Resource=new EntitySchema({
    name:"Resource",
    tableName:"resources",
    columns:{
        id:{primary:true,type:"int",generated:true},
        name:{type:"varchar"},
        field:{type:"varchar"},
        description:{type:"text"},
        fileUrl:{type:"varchar",nullable:true},
    },
    relations:{
        uploader:{
            type:"many-to-one",
            target:"User",
            joinColumn:true,
            inverseSide:"resources",
            eager:true,
        },
        department:{
            type:"many-to-one",
            target:"Department",
            joinColumn:true,
            inverseSide:"resources",
            nullable:true,
            eager:true,
        }
    },
})

module.exports={Resource}