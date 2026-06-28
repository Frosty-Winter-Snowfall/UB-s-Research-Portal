const {EntitySchema}=require("typeorm")

const Paper=new EntitySchema({
    name:"Paper",
    tableName:"papers",
    columns:{
        id:{primary:true,type:"int",generated:true},
        title:{type:"varchar"},
        abstract:{type:"text"},
        category:{type:"varchar",nullable:true},
        status:{type:"varchar",default:"submitted"},
        version:{type:"int",default:1},
        fileUrl:{type:"varchar",nullable:true},
        publishedAt:{type:"timestamp",nullable:true},
        createdAt:{type:"timestamp",createDate:true},
    },
    relations:{
        student:{
            type:"many-to-one",
            target:"User",
            joinColumn:true,
            inverseSide:"papers",
            eager:true,
        },
        department:{
            type:"many-to-one",
            target:"Department",
            joinColumn:true,
            inverseSide:"papers",
            nullable:true,
            eager:true,
        }
    }
})

module.exports={Paper}