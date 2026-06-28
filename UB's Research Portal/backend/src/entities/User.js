const { EntitySchema }=require("typeorm")

const User=new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: { primary: true, type: "int", generated: true },
        name: { type: "varchar" },
        email: { type: "varchar", unique: true },
        password: { type: "varchar" },
        role: { type: "varchar", default: "student" },
        createdAt: { type: "timestamp", createDate: true },
        blacklisted: {type: "boolean",default: false,
        },
    },
    relations: {
        resources: {
            type: "one-to-many",
            target: "Resource",
            inverseSide: "uploader",
        },
        papers: {
            type: "one-to-many",
            target: "Paper",
            inverseSide: "student",
        },
        department: {
            type: "many-to-one",
            target: "Department",
            joinColumn: true,
            inverseSide: "teachers",
            nullable: true,
        }
        
    }
})

module.exports = { User }